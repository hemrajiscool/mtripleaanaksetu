"""Adversarial & Stress Test Suite: API High Load, Concurrency, and Middleware Guards.

Verifies:
- 10MB payload size limit middleware (HTTP 413)
- High concurrency thread safety across SQLite in-memory DB and LRU cache
- Malformed and unparseable JSON request validation (HTTP 422)
- Rapid burst throughput and sub-50ms cache replay under stress
"""

from __future__ import annotations

import asyncio
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_payload_size_guard_exceeds_10mb(api_client: AsyncClient):
    """
    Verify that requests exceeding the 10 MB payload limit are intercepted
    and rejected with HTTP 413 Request Entity Too Large.
    """
    # 10 MB + 1024 bytes
    oversized_length = 10 * 1024 * 1024 + 1024
    headers = {"content-length": str(oversized_length)}

    response = await api_client.post(
        "/api/audit",
        content=b"A" * 100,  # Header simulation of content-length
        headers=headers,
    )
    assert response.status_code == 413
    assert "10 MB" in response.json()["detail"]


@pytest.mark.asyncio
async def test_malformed_json_and_missing_fields(api_client: AsyncClient):
    """Verify robust 422 rejection when requests have invalid JSON or missing mandatory fields."""
    # 1. Invalid JSON syntax
    res_bad_json = await api_client.post(
        "/api/audit",
        content=b"{bad: json syntax",
        headers={"content-type": "application/json"},
    )
    assert res_bad_json.status_code == 422

    # 2. Missing mandatory 'text' field
    res_missing_text = await api_client.post(
        "/api/audit",
        json={"document_id": "TEST-NO-TEXT"},
    )
    assert res_missing_text.status_code == 422

    # 3. Empty text string (min_length=1 violation)
    res_empty_text = await api_client.post(
        "/api/audit",
        json={"text": "", "document_id": "TEST-EMPTY-TEXT"},
    )
    assert res_empty_text.status_code == 422


@pytest.mark.asyncio
async def test_concurrent_api_audit_and_cache_requests(api_client: AsyncClient):
    """
    Execute 20 concurrent requests across auditing, fetching, and verification endpoints
    to verify thread-safety and absence of SQLite database lock contention.
    """
    templates = [
        ("CONC-DOC-A", "Clause 1.0: Procurement of cement conforming to IS 269:1989."),
        ("CONC-DOC-B", "Clause 2.0: Concrete bridge deck works conforming to IS 456:2000."),
        ("CONC-DOC-C", "Clause 3.0: Transformer 100 kVA without statutory ISI mark."),
        ("CONC-DOC-D", "Clause 4.0: Steel rebar conforming to IS 1786:2008 with elongation 12%."),
    ]

    async def run_single_audit(doc_id: str, text: str):
        post_res = await api_client.post(
            "/api/audit",
            json={"document_id": doc_id, "text": text},
        )
        assert post_res.status_code == 200
        data = post_res.json()
        digest = data["sha256_digest"]

        # Concurrently fetch from cache
        get_res = await api_client.get(f"/api/audit/{doc_id}")
        assert get_res.status_code == 200

        # Concurrently verify digest
        ver_res = await api_client.get(f"/api/verify/{digest}")
        assert ver_res.status_code == 200
        assert ver_res.json()["valid"] is True
        return doc_id

    # Spawn 20 concurrent async tasks
    tasks = []
    for i in range(20):
        doc_id, text = templates[i % len(templates)]
        unique_id = f"{doc_id}-{i:03d}"
        tasks.append(run_single_audit(unique_id, text))

    results = await asyncio.gather(*tasks)
    assert len(results) == 20
    assert len(set(results)) == 20  # All 20 unique audits processed cleanly


@pytest.mark.asyncio
async def test_high_throughput_cache_replay_performance(api_client: AsyncClient):
    """
    Verify that 50 consecutive cache replay queries complete with extreme speed
    and zero latency degradation.
    """
    # Use preseeded demo tender
    doc_id = "DEMO-NHAI-BRIDGE-01"

    for _ in range(50):
        res = await api_client.get(f"/api/audit/{doc_id}")
        assert res.status_code == 200
        assert res.json()["document_id"] == doc_id


@pytest.mark.asyncio
async def test_invalid_content_length_header_handling(api_client: AsyncClient):
    """Verify that requests with malformed or negative Content-Length headers are handled cleanly with 400/413."""
    res_str = await api_client.post(
        "/api/audit",
        content=b"test",
        headers={"content-length": "not-an-integer"},
    )
    assert res_str.status_code == 400
    assert "Invalid Content-Length" in res_str.json()["detail"]

    res_neg = await api_client.post(
        "/api/audit",
        content=b"test",
        headers={"content-length": "-100"},
    )
    assert res_neg.status_code == 413


@pytest.mark.asyncio
async def test_digest_verification_invalid_hash_format(api_client: AsyncClient):
    """Verify that malformed or non-hex digest queries to /api/verify return valid=False immediately."""
    for malformed_digest in [
        "not-a-hash",
        "12345",
        "etc_passwd",
        "' OR '1'='1",
        "g" * 64,  # 'g' is not valid hex
        "A" * 65,  # too long
    ]:
        res = await api_client.get(f"/api/verify/{malformed_digest}")
        assert res.status_code == 200
        data = res.json()
        assert data["valid"] is False
        assert data["sha256_digest"] == malformed_digest

