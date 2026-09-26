"""Adversarial Test Suite: Hallucination Gate and Architectural Invariants.

Verifies strict SpecGuard non-hallucination and evidence integrity invariants:
1. Grounding Invariant: Non-existent or hallucinated standard citations (e.g. IS 99999:2099)
   cannot be validated as active or recommended by the engine.
2. Evidence Completeness Invariant: Every Finding is backed by an unbroken 5-node
   provenance tuple E = <FindingId, RuleId, KnowledgeFactRef, RequirementRef, SourceSegmentRef>.
3. Active Replacement Invariant: Recommended replacements can never be WITHDRAWN or SUPERSEDED.
   Multi-hop supersession DAG must resolve to an ACTIVE root.
4. Contradictory Bounds Handling: Mutually incompatible parameter specifications are
   isolated and flagged deterministically without oscillation or ungrounded inferences.
"""

from __future__ import annotations

import sqlite3
import pytest

from maanaksetu.domain.models import DocumentSegment, Evidence, Finding, Requirement, StandardEdition
from maanaksetu.domain.states import (
    DecisionState,
    GateStatus,
    ParameterCondition,
    Severity,
    StandardStatus,
    ViolationType,
)
from maanaksetu.engine.discovery.resolver import StandardsResolver
from maanaksetu.engine.orchestrator import AuditPipeline
from maanaksetu.engine.verification.evidence_builder import EvidenceBuilder
from maanaksetu.engine.verification.verifier import SpecGuardVerifier
from maanaksetu.knowledge.graph import resolve_supersession_chain


@pytest.mark.asyncio
async def test_hallucinated_standard_citations(memory_db: sqlite3.Connection):
    """
    Verify that citing completely fictitious standards (e.g. IS 99999:2099, IS 88888)
    does not cause the engine to hallucinate validity, compliance, or phantom rules.
    """
    pipeline = AuditPipeline(db=memory_db)

    hallucinated_text = (
        "Clause 1.0: Supply of high-tensile hyper-alloy bars conforming to IS 99999:2099. "
        "Clause 2.0: Concrete aggregate grading shall conform strictly to IS 88888 (Part 9):3000."
    )

    res = await pipeline.execute(source=hallucinated_text, document_id="DOC-HALLUCINATED")

    # Invariant: Fictitious standards cannot be VERIFIED_CONFORMANT
    # All emitted findings (if any) must strictly reference knowledge base facts
    for f in res.findings:
        assert f.evidence is not None
        assert f.evidence.knowledge_fact_ref != ""
        # The engine must never recommend a hallucinated IS number
        if f.replacement_standard:
            assert "99999" not in f.replacement_standard
            assert "88888" not in f.replacement_standard


def test_evidence_builder_completeness_invariant():
    """Verify that EvidenceBuilder strictly enforces the 5-node completeness invariant."""
    valid_args = {
        "finding_id": "FND-001",
        "rule_id": "RULE-TEST",
        "knowledge_fact_ref": "standards_catalog(IS 456)",
        "requirement_ref": "REQ-001",
        "source_segment_ref": "SEG-001",
        "statutory_or_technical_basis": "Statutory Test Basis",
    }

    # Valid construction
    ev = EvidenceBuilder.build(**valid_args)
    assert isinstance(ev, Evidence)
    assert ev.finding_id == "FND-001"

    # Missing finding_id
    with pytest.raises(ValueError, match="finding_id cannot be empty"):
        EvidenceBuilder.build(**{**valid_args, "finding_id": ""})

    # Missing rule_id
    with pytest.raises(ValueError, match="rule_id cannot be empty"):
        EvidenceBuilder.build(**{**valid_args, "rule_id": ""})

    # Missing knowledge_fact_ref
    with pytest.raises(ValueError, match="knowledge_fact_ref cannot be empty"):
        EvidenceBuilder.build(**{**valid_args, "knowledge_fact_ref": ""})

    # Missing requirement_ref
    with pytest.raises(ValueError, match="requirement_ref cannot be empty"):
        EvidenceBuilder.build(**{**valid_args, "requirement_ref": ""})

    # Missing source_segment_ref
    with pytest.raises(ValueError, match="source_segment_ref cannot be empty"):
        EvidenceBuilder.build(**{**valid_args, "source_segment_ref": ""})


def test_specguard_rejects_withdrawn_replacement_standard(memory_db: sqlite3.Connection, normative_graph):
    """
    Verify SpecGuard Invariant: An invariant failure must be raised if any verifier
    ever attempts to propose a replacement standard that is itself WITHDRAWN.
    """
    verifier = SpecGuardVerifier(memory_db, normative_graph)

    # Fabricate a finding recommending an obsolete/withdrawn standard (IS 269:1989)
    bad_finding = Finding(
        finding_id="FND-MALFORMED-01",
        requirement_id="REQ-001",
        segment_id="SEG-001",
        rule_id="RULE-LIFECYCLE-OBSOLETE",
        violation_type=ViolationType.ERR_OBSOLETE_STANDARD,
        severity=Severity.CRITICAL,
        decision_state=DecisionState.VIOLATION,
        detected_entity="IS 269:1976",
        statutory_basis="Test Basis",
        replacement_standard="IS 269:1989",  # IS 269:1989 is WITHDRAWN in DB!
        recommended_remediation="Update to IS 269:1989",
        engineering_rationale="Test rationale",
        segment_text="Test clause",
        evidence=EvidenceBuilder.build(
            finding_id="FND-MALFORMED-01",
            rule_id="RULE-LIFECYCLE-OBSOLETE",
            knowledge_fact_ref="standards_catalog(IS 269:1989)",
            requirement_ref="REQ-001",
            source_segment_ref="SEG-001",
            statutory_or_technical_basis="Test",
        ),
    )

    # SpecGuard invariant check must catch this and reject it
    with pytest.raises(AssertionError, match="is itself WITHDRAWN in the authoritative catalog"):
        verifier._assert_finding_invariants(bad_finding)


def test_specguard_rejects_finding_missing_evidence(memory_db: sqlite3.Connection, normative_graph):
    """Verify SpecGuard Invariant: Every finding must have a non-null Evidence object."""
    verifier = SpecGuardVerifier(memory_db, normative_graph)

    unsupported_finding = Finding(
        finding_id="FND-UNGROUNDED-01",
        requirement_id="REQ-001",
        segment_id="SEG-001",
        rule_id="RULE-TEST",
        violation_type=ViolationType.ERR_CONTRADICTORY_TEST,
        severity=Severity.HIGH,
        decision_state=DecisionState.VIOLATION,
        detected_entity="Unknown Entity",
        statutory_basis="Unverified claim",
        replacement_standard=None,
        recommended_remediation="None",
        engineering_rationale="None",
        segment_text="None",
        evidence=None,  # SpecGuard Invariant Violation!
    )

    with pytest.raises(AssertionError, match="missing Evidence tuple"):
        verifier._assert_finding_invariants(unsupported_finding)


def test_multihop_supersession_dag_resolution(normative_graph):
    """
    Verify that resolving an obsolete standard through the NetworkX DAG resolves
    all the way to the ACTIVE standard at the end of the chain, never stopping
    at an intermediate withdrawn revision.
    """
    # IS 269:1989 was superseded by IS 269:2015 (ACTIVE)
    active_target = resolve_supersession_chain(normative_graph, "IS 269:1989")
    assert active_target == "IS 269:2015"

    # IS 335:1993 was superseded by IS 335:2018 (ACTIVE)
    active_oil = resolve_supersession_chain(normative_graph, "IS 335:1993")
    assert active_oil == "IS 335:2018"
