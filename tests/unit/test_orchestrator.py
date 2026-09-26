"""Unit tests for the master 4-stage pipeline orchestrator."""

import sqlite3
import pytest

from maanaksetu.domain.models import AuditResult
from maanaksetu.domain.states import GateStatus, ViolationType
from maanaksetu.engine.orchestrator import AuditPipeline, compute_state_digest, run_pipeline
from maanaksetu.knowledge.graph import load_normative_graph


@pytest.mark.asyncio
async def test_full_pipeline_execution(memory_db: sqlite3.Connection):
    """Verify that AuditPipeline executes all 4 stages and returns a complete AuditResult."""
    tender_text = (
        "Clause 1.0: Scope of Works\n"
        "Design and construction of 4-lane prestressed concrete road bridge girders and deck slabs "
        "across river crossing conforming strictly to IS 456:2000.\n\n"
        "Clause 2.0: Material Sourcing\n"
        "The contractor shall procure structural cement exclusively from UltraTech or ACC cement plants."
    )

    pipeline = AuditPipeline(db=memory_db)
    result = await pipeline.execute(
        source=tender_text,
        document_id="TEST-TND-001",
        document_title="National Highway Bridge Package 4",
    )

    # Invariant assertions
    assert result.document_id == "TEST-TND-001"
    assert result.document_title == "National Highway Bridge Package 4"
    assert result.total_segments_analyzed == 2
    assert result.gate_status == GateStatus.STATUTORY_NON_COMPLIANT
    assert len(result.findings) >= 2

    # Check for expected violations
    v_types = {f.violation_type for f in result.findings}
    assert ViolationType.ERR_SCOPE_CONFLICT in v_types  # IS 456 road bridge
    assert ViolationType.ERR_BRAND_EXCLUSION in v_types  # UltraTech / ACC

    # Check that every finding has complete 5-node evidence
    for f in result.findings:
        assert f.evidence is not None
        assert f.evidence.finding_id == f.finding_id
        assert f.evidence.rule_id == f.rule_id
        assert f.evidence.knowledge_fact_ref != ""
        assert f.evidence.requirement_ref != ""
        assert f.evidence.source_segment_ref != ""

    # Telemetry assertions
    tel = result.execution_telemetry
    assert "total_execution_ms" in tel
    assert "ingestion_ms" in tel
    assert "discovery_ms" in tel
    assert "verification_ms" in tel
    assert "output_ms" in tel
    assert tel["total_execution_ms"] > 0

    # SHA-256 Digest is 64 hex characters
    assert len(result.sha256_digest) == 64


@pytest.mark.asyncio
async def test_digest_deterministic_reproducibility(memory_db: sqlite3.Connection):
    """Verify that identical tender specifications produce identical cryptographic SHA-256 digests."""
    text = "Clause 4.1: Fe 500D steel rebar conforming to IS 1786:2008 with yield stress 450 MPa."

    pipeline = AuditPipeline(db=memory_db)
    res1 = await pipeline.execute(source=text, document_id="DOC-REPRO")
    res2 = await pipeline.execute(source=text, document_id="DOC-REPRO")

    assert res1.sha256_digest == res2.sha256_digest
    assert res1.gate_status == res2.gate_status
    assert len(res1.findings) == len(res2.findings)
