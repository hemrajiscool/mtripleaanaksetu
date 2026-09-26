"""Evaluation Suite for MaanakSetu MVP Benchmark Matrix.

Tests the 12 Gold Standard Benchmark Cases across:
 1. Standard Citation Recall (exact citations and proactive unnumbered discovery)
 2. Scope Applicability & Boundary Accuracy (Clause 1.1 Exclusions)
 3. Technical Constraint Conflict Detection
 4. Gazetted Amendment Precision
 5. Zero-Hallucination & Complete Evidence Invariant Enforcement
"""

from __future__ import annotations

import sqlite3
import pytest

from maanaksetu.domain.models import DocumentSegment, Requirement
from maanaksetu.domain.states import ViolationType
from maanaksetu.engine.discovery.resolver import StandardsResolver
from maanaksetu.engine.ingestion.requirements import extract_requirement
from maanaksetu.engine.verification.verifier import SpecGuardVerifier
from maanaksetu.knowledge.graph import load_normative_graph
from tests.evaluation.benchmark_cases import BENCHMARK_CASES


@pytest.fixture
def eval_suite(memory_db: sqlite3.Connection):
    """Fixture providing initialized resolver and SpecGuard verifier."""
    graph = load_normative_graph(memory_db)
    resolver = StandardsResolver(memory_db)
    verifier = SpecGuardVerifier(memory_db, graph)
    return resolver, verifier, graph, memory_db


@pytest.mark.parametrize("case", BENCHMARK_CASES, ids=[c["id"] for c in BENCHMARK_CASES])
def test_individual_benchmark_case(case: dict, eval_suite):
    """Verify each benchmark case against expected ground truth invariants."""
    resolver, verifier, graph, db = eval_suite

    # Step 1: Ingest into Requirement (Core Decision Object)
    segment = DocumentSegment(
        segment_id=f"seg-{case['id'].lower()}",
        segment_number="1.0",
        raw_text=case["text"],
    )
    requirement = extract_requirement(
        segment,
        requirement_id=f"req-{case['id'].lower()}",
    )

    # Step 2: Standards Discovery (Resolve Candidates)
    candidates = resolver.resolve_candidates(requirement)

    # Step 3: SpecGuard Invariant Verification
    findings = verifier.verify_requirement(requirement, candidates)

    # Step 4: Strict Invariant Enforcement (5-Node Provenance Tuple)
    for f in findings:
        assert f.evidence is not None, f"Finding {f.finding_id} missing evidence!"
        assert f.evidence.finding_id == f.finding_id
        assert f.evidence.rule_id == f.rule_id
        assert len(f.evidence.knowledge_fact_ref) > 0
        assert f.evidence.requirement_ref == requirement.requirement_id
        assert f.evidence.source_segment_ref == segment.segment_id
        assert len(f.evidence.statutory_or_technical_basis) > 0

    # Step 5: Assert Expected Failure vs Passing Outcomes
    if case["should_pass"]:
        assert len(findings) == 0, (
            f"Case {case['id']} should pass cleanly, but flagged: "
            f"{[f.violation_type.value for f in findings]} - {findings[0].engineering_rationale if findings else ''}"
        )
    else:
        assert len(findings) > 0, f"Case {case['id']} failed to detect expected violation!"
        detected_types = {f.violation_type for f in findings}
        for exp_type in case["expected_violation_types"]:
            assert exp_type in detected_types, (
                f"Case {case['id']} expected {exp_type.value}, but detected {detected_types}"
            )

        # Check replacement standard accuracy if specified
        if case["expected_replacement_standards"]:
            detected_replacements = {f.replacement_standard for f in findings if f.replacement_standard}
            for exp_rep in case["expected_replacement_standards"]:
                assert exp_rep in detected_replacements or any(exp_rep in dr for dr in detected_replacements), (
                    f"Case {case['id']} expected replacement {exp_rep}, but got {detected_replacements}"
                )


def test_full_benchmark_accuracy_metric(eval_suite):
    """Aggregate benchmark run asserting 100% precision and recall on the 12 ground truth cases."""
    resolver, verifier, graph, db = eval_suite
    passed_cases = 0

    for case in BENCHMARK_CASES:
        segment = DocumentSegment(
            segment_id=f"seg-{case['id'].lower()}",
            segment_number="1.0",
            raw_text=case["text"],
        )
        req = extract_requirement(segment, requirement_id=f"req-{case['id'].lower()}")
        candidates = resolver.resolve_candidates(req)
        findings = verifier.verify_requirement(req, candidates)

        if case["should_pass"] and len(findings) == 0:
            passed_cases += 1
        elif not case["should_pass"] and len(findings) > 0:
            detected_types = {f.violation_type for f in findings}
            if all(exp in detected_types for exp in case["expected_violation_types"]):
                passed_cases += 1

    assert passed_cases == len(BENCHMARK_CASES) == 12
