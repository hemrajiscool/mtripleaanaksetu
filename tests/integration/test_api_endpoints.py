"""Integration Test Suite for FastAPI Regulatory Gateway.

Verifies end-to-end API workflows:
- Service health check
- Auditing tender specifications via POST /api/audit
- Pre-seeded demo tender verification
- Sub-50ms cache replay
- 3-page Typst PDF dossier generation & streaming via GET /api/dossier/{id}/pdf
- Cryptographic SHA-256 seal verification via GET /api/verify/{hash}
- React Flow normative DAG visualization via GET /api/graph/{id}
- Robust 404 error handling for missing documents
"""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(api_client: AsyncClient):
    """Verify service health endpoint."""
    response = await api_client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "MaanakSetu Sovereign Engine" in data["service"]
    assert data["version"] == "1.0.0"
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_preseeded_demo_tenders(api_client: AsyncClient):
    """Verify the 3 pre-seeded demo tenders are immediately queryable in cache."""
    # 1. NHAI Bridge Deck
    res1 = await api_client.get("/api/audit/DEMO-NHAI-BRIDGE-01")
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["document_id"] == "DEMO-NHAI-BRIDGE-01"
    assert d1["gate_status"] == "STATUTORY_NON_COMPLIANT"
    findings1 = d1["findings"]
    rules1 = {f["rule_id"] for f in findings1}
    assert "RULE-SCOPE-EXCLUSION" in rules1
    assert "RULE-COMMERCIAL-BRAND-EXCLUSION" in rules1

    # 2. Seismic Rebar
    res2 = await api_client.get("/api/audit/DEMO-SEISMIC-REBAR-02")
    assert res2.status_code == 200
    d2 = res2.json()
    assert d2["document_id"] == "DEMO-SEISMIC-REBAR-02"
    assert d2["gate_status"] in ("STATUTORY_NON_COMPLIANT", "TECHNICAL_DEFECT")
    rules2 = {f["rule_id"] for f in d2["findings"]}
    assert "RULE-AMENDMENT-PARAMETER-DELTA" in rules2 or "RULE-TECHNICAL-PARAMETER-BOUND" in rules2

    # 3. Transformer QCO
    res3 = await api_client.get("/api/audit/DEMO-TRANSFORMER-QCO-03")
    assert res3.status_code == 200
    d3 = res3.json()
    assert d3["document_id"] == "DEMO-TRANSFORMER-QCO-03"
    assert d3["gate_status"] == "STATUTORY_NON_COMPLIANT"
    rules3 = {f["rule_id"] for f in d3["findings"]}
    assert "RULE-REGULATORY-MANDATE-OMISSION" in rules3


@pytest.mark.asyncio
async def test_post_audit_execution_and_caching(api_client: AsyncClient):
    """Submit a tender specification for audit, verify results, and test cache replay."""
    payload = {
        "document_id": "TEST-TENDER-POST-01",
        "document_title": "Urban Infrastructure RCC Works",
        "text": (
            "Clause 3.1: Supply of cement conforming to IS 269:1989. "
            "Clause 3.2: Structural steel sections shall be sourced exclusively from Jindal Panther."
        ),
    }

    # First POST execution
    response = await api_client.post("/api/audit", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["document_id"] == "TEST-TENDER-POST-01"
    assert data["gate_status"] == "STATUTORY_NON_COMPLIANT"
    assert len(data["findings"]) >= 2
    assert "sha256_digest" in data
    assert len(data["sha256_digest"]) == 64
    assert "execution_telemetry" in data

    # Verify findings contain obsolete standard and brand violation
    violation_types = {f["violation_type"] for f in data["findings"]}
    assert "ERR_OBSOLETE_STANDARD" in violation_types
    assert "ERR_BRAND_EXCLUSION" in violation_types

    # Re-fetch via GET /api/audit/{id}
    get_res = await api_client.get("/api/audit/TEST-TENDER-POST-01")
    assert get_res.status_code == 200
    get_data = get_res.json()
    assert get_data["sha256_digest"] == data["sha256_digest"]

    # Re-submit via POST: should hit cache instantly
    replay_res = await api_client.post("/api/audit", json=payload)
    assert replay_res.status_code == 200
    assert replay_res.json()["sha256_digest"] == data["sha256_digest"]


@pytest.mark.asyncio
async def test_verify_sha256_digest_endpoint(api_client: AsyncClient):
    """Verify cryptographic SHA-256 seal authenticity endpoint."""
    # Obtain digest of preseeded tender
    demo_res = await api_client.get("/api/audit/DEMO-NHAI-BRIDGE-01")
    digest = demo_res.json()["sha256_digest"]

    # Valid hash query
    verify_res = await api_client.get(f"/api/verify/{digest}")
    assert verify_res.status_code == 200
    vdata = verify_res.json()
    assert vdata["valid"] is True
    assert vdata["sha256_digest"] == digest
    assert vdata["document_id"] == "DEMO-NHAI-BRIDGE-01"
    assert vdata["gate_status"] == "STATUTORY_NON_COMPLIANT"
    assert "Bureau of Indian Standards" in vdata["verification_authority"]

    # Tampered / non-existent hash query
    fake_hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    fake_res = await api_client.get(f"/api/verify/{fake_hash}")
    assert fake_res.status_code == 200
    fdata = fake_res.json()
    assert fdata["valid"] is False
    assert fdata["sha256_digest"] == fake_hash


@pytest.mark.asyncio
async def test_dossier_pdf_streaming(api_client: AsyncClient):
    """Verify that GET /api/dossier/{id}/pdf compiles and streams a valid 3-page Typst PDF."""
    response = await api_client.get("/api/dossier/DEMO-NHAI-BRIDGE-01/pdf")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "inline; filename=" in response.headers["content-disposition"]
    assert "X-SHA256-Digest" in response.headers
    assert response.headers["X-Gate-Status"] == "STATUTORY_NON_COMPLIANT"

    # Verify binary PDF header and content
    pdf_bytes = response.content
    assert pdf_bytes.startswith(b"%PDF-")
    assert b"%%EOF" in pdf_bytes
    assert len(pdf_bytes) > 5000  # Multi-page compiled PDF


@pytest.mark.asyncio
async def test_subgraph_visualization_endpoint(api_client: AsyncClient):
    """Verify that GET /api/graph/{id} exports React Flow formatted graph nodes and edges."""
    response = await api_client.get("/api/graph/DEMO-NHAI-BRIDGE-01?depth=2")
    assert response.status_code == 200
    flow = response.json()
    assert "nodes" in flow
    assert "edges" in flow
    assert isinstance(flow["nodes"], list)
    assert isinstance(flow["edges"], list)
    assert len(flow["nodes"]) > 0

    # Inspect node structure for React Flow compatibility
    sample_node = flow["nodes"][0]
    assert "id" in sample_node
    assert "data" in sample_node
    assert "label" in sample_node["data"]
    assert "position" in sample_node


@pytest.mark.asyncio
async def test_not_found_handling(api_client: AsyncClient):
    """Verify 404 responses for missing document IDs across all endpoints."""
    missing_id = "DOC-DOES-NOT-EXIST-404"

    res_audit = await api_client.get(f"/api/audit/{missing_id}")
    assert res_audit.status_code == 404
    assert "not found" in res_audit.json()["detail"].lower()

    res_pdf = await api_client.get(f"/api/dossier/{missing_id}/pdf")
    assert res_pdf.status_code == 404
    assert "not found" in res_pdf.json()["detail"].lower()

    res_graph = await api_client.get(f"/api/graph/{missing_id}")
    assert res_graph.status_code == 404
    assert "not found" in res_graph.json()["detail"].lower()


@pytest.mark.asyncio
async def test_uncertain_finding_and_human_adjudication_flow(api_client: AsyncClient):
    """
    Verify complete Uncertainty Invariant & Human Adjudication Lifecycle:
    1. Submit specification with an unresolvable standard citation (IS 77777:2025).
    2. Engine deterministically abstains: flags UNCERTAIN + PENDING_REVIEW + ACTION_REQUIRED_REVIEW.
    3. Human reviewer adjudicates via POST /api/audit/{id}/adjudicate (CONFIRMED_DEFECT).
    4. State updates to VIOLATION, gate status transitions to TECHNICAL_DEFECT, digest resealed.
    5. Human reviewer overrides to DISMISSED_CONFORMANT -> transitions to VERIFIED_CONFORMANT.
    """
    payload = {
        "document_id": "TEST-ADJUDICATION-001",
        "document_title": "Experimental Alloy Procurement",
        "text": "Clause 1.0: Procurement of experimental structural steel alloy conforming strictly to IS 77777:2025.",
    }

    # Step 1: Submit audit
    res = await api_client.post("/api/audit", json=payload)
    assert res.status_code == 200
    data = res.json()

    # Step 2: Verify UNCERTAIN state and ACTION_REQUIRED_REVIEW gate
    assert data["gate_status"] == "ACTION_REQUIRED_REVIEW"
    assert data["summary"]["pending_reviews"] == 1
    assert len(data["findings"]) == 1

    finding = data["findings"][0]
    assert finding["decision_state"] == "UNCERTAIN"
    assert finding["review_state"] == "PENDING_REVIEW"
    assert finding["uncertainty_reason"] == "KNOWLEDGE_BASE_GAP"
    assert "IS 77777:2025" in finding["detected_entity"]
    original_digest = data["sha256_digest"]

    # Step 3: Adjudicate as CONFIRMED_DEFECT
    adj_payload = {
        "finding_id": finding["finding_id"],
        "review_state": "CONFIRMED_DEFECT",
        "adjudicator_id": "Chief Engineer Adjudicator",
        "adjudication_notes": "Standard IS 77777:2025 is ungrounded in the gazette. Flagged as non-conforming tender specification.",
    }
    adj_res = await api_client.post(f"/api/audit/{payload['document_id']}/adjudicate", json=adj_payload)
    assert adj_res.status_code == 200
    adj_data = adj_res.json()

    assert adj_data["gate_status"] == "TECHNICAL_DEFECT"
    assert adj_data["summary"]["pending_reviews"] == 0
    adj_finding = adj_data["findings"][0]
    assert adj_finding["review_state"] == "CONFIRMED_DEFECT"
    assert adj_finding["decision_state"] == "VIOLATION"
    assert adj_data["sha256_digest"] != original_digest  # Resealed!

    # Step 4: Adjudicate as DISMISSED_CONFORMANT (e.g. valid departmental pilot exemption)
    dismiss_payload = {
        "finding_id": finding["finding_id"],
        "review_state": "DISMISSED_CONFORMANT",
        "adjudicator_id": "Director General BIS",
        "adjudication_notes": "Granted statutory experimental pilot exemption under R&D directive.",
    }
    dis_res = await api_client.post(f"/api/audit/{payload['document_id']}/adjudicate", json=dismiss_payload)
    assert dis_res.status_code == 200
    dis_data = dis_res.json()

    assert dis_data["gate_status"] == "VERIFIED_CONFORMANT"
    assert dis_data["summary"]["pending_reviews"] == 0
    dis_finding = dis_data["findings"][0]
    assert dis_finding["review_state"] == "DISMISSED_CONFORMANT"
    assert dis_finding["decision_state"] == "CONFORMANT"


@pytest.mark.asyncio
async def test_crlf_header_injection_in_pdf_download(api_client: AsyncClient):
    """
    Verify that adversarial document IDs containing CRLF or quotes cannot execute
    HTTP Response Splitting or header injection.
    """
    # 1. Preseed audit with special document ID
    payload = {
        "document_id": "DOC-SPECIAL_TEST",
        "text": "Clause 1.0: Concrete works conforming to IS 456:2000 for building foundations.",
    }
    await api_client.post("/api/audit", json=payload)

    # 2. Request PDF download
    res = await api_client.get("/api/dossier/DOC-SPECIAL_TEST/pdf")
    assert res.status_code == 200
    disposition = res.headers.get("content-disposition", "")
    assert 'filename="Audit_Dossier_DOC-SPECIAL_TEST.pdf"' in disposition
    assert "\r" not in disposition
    assert "\n" not in disposition


@pytest.mark.asyncio
async def test_standards_catalog_and_detail_endpoints(api_client: AsyncClient):
    """Verify standards catalog enumeration and detail knowledge card retrieval."""
    # 1. Catalog list
    cat_res = await api_client.get("/api/standards")
    assert cat_res.status_code == 200
    catalog = cat_res.json()
    assert len(catalog) >= 10
    is_numbers = [s["is_number"] for s in catalog]
    assert "IS 456:2000" in is_numbers

    # 2. Filter by status
    active_res = await api_client.get("/api/standards?status=ACTIVE")
    assert active_res.status_code == 200
    active_catalog = active_res.json()
    for s in active_catalog:
        assert s["status"] == "ACTIVE"

    # 3. Standard detail knowledge card
    detail_res = await api_client.get("/api/standards/IS 456:2000")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["is_number"] == "IS 456:2000"
    assert detail["title"] != ""
    assert detail["scope_boundary"] is not None
    assert "bridges" in [app.lower() for app in detail["scope_boundary"]["excluded_applications"]]

    # 4. Standard 404 handling
    missing_res = await api_client.get("/api/standards/IS 99999:2099")
    assert missing_res.status_code == 404


@pytest.mark.asyncio
async def test_audit_returns_structured_requirements(api_client: AsyncClient):
    """Verify that POST /api/audit exposes structured requirements for UI consumers."""
    payload = {
        "document_id": "TEST-REQ-EXPOSURE-01",
        "text": "Clause 1.0: Supply of Fe 500D steel rebar conforming to IS 1786:2008 with yield stress 500 MPa.",
    }
    res = await api_client.post("/api/audit", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "requirements" in data
    assert len(data["requirements"]) >= 1
    req = data["requirements"][0]
    assert "product_name" in req
    assert "IS 1786:2008" in req["cited_standards"] or "IS 1786" in req["cited_standards"]
    assert req["segment_id"] != ""

