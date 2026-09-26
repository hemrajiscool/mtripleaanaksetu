"""Unit tests for the dual-tier audit cache."""

import time
import pytest

from maanaksetu.adapters.api.cache import AuditCache
from maanaksetu.domain.models import AuditResult, AuditSummary
from maanaksetu.domain.states import GateStatus


@pytest.fixture
def mock_audit_result() -> AuditResult:
    return AuditResult(
        document_id="CACHE-DOC-1",
        document_title="Cached Tender",
        gate_status=GateStatus.VERIFIED_CONFORMANT,
        total_segments_analyzed=1,
        findings=[],
        cascading_dependency_alerts=[],
        sha256_digest="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    )


def test_cache_set_and_get(mock_audit_result: AuditResult):
    cache = AuditCache(max_memory_entries=10)
    cache.set(mock_audit_result)

    # Lookup by document_id
    res = cache.get_by_id("CACHE-DOC-1")
    assert res is not None
    assert res.document_id == "CACHE-DOC-1"
    assert res.gate_status == GateStatus.VERIFIED_CONFORMANT

    # Lookup by sha256_digest
    by_hash = cache.get_by_digest("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
    assert by_hash is not None
    assert by_hash.document_id == "CACHE-DOC-1"


def test_cache_replay_latency_sub_50ms(mock_audit_result: AuditResult):
    cache = AuditCache()
    cache.set(mock_audit_result)

    start = time.perf_counter()
    res = cache.get_by_id("CACHE-DOC-1")
    duration_ms = (time.perf_counter() - start) * 1000.0

    assert res is not None
    assert duration_ms < 50.0, f"Cache replay exceeded 50ms (took {duration_ms:.2f}ms)"


def test_cache_lru_eviction():
    cache = AuditCache(max_memory_entries=3)

    for i in range(1, 5):
        res = AuditResult(
            document_id=f"DOC-{i}",
            gate_status=GateStatus.VERIFIED_CONFORMANT,
            total_segments_analyzed=1,
            sha256_digest=f"hash_{i}",
        )
        cache.set(res)

    # DOC-1 should have been evicted from memory
    assert "DOC-1" not in cache._memory_cache

    # But DOC-1 MUST still be retrievable from the persistent SQLite backing
    persisted = cache.get_by_id("DOC-1")
    assert persisted is not None
    assert persisted.document_id == "DOC-1"
