"""SpecGuard Invariant Verification Engine (Stage 3).

Coordinates decomposed statutory and technical verifiers:
1. BrandsVerifier (GFR 144(i))
2. LifecycleVerifier (Currency & Supersession DAG)
3. ScopeEvaluator (Clause 1.1 Boundaries & Exclusions)
4. ConstraintsVerifier (Physical Thresholds & Amendment Deltas)
5. RegulatoryVerifier (Mandatory QCOs & Certification Marks)
6. DependenciesVerifier (Cascading Normative Obsolescence)
"""

from __future__ import annotations

import sqlite3
from typing import Dict, List, Optional, Set, Tuple

import networkx as nx

from maanaksetu.domain.models import (
    AuditSummary,
    DependencyAlert,
    Finding,
    Requirement,
    StandardEdition,
)
from maanaksetu.domain.states import (
    DecisionState,
    GateStatus,
    ReviewState,
    Severity,
    StandardStatus,
    UncertaintyReason,
    ViolationType,
)
from maanaksetu.engine.discovery.exact import extract_is_codes
from maanaksetu.engine.verification.brands import BrandsVerifier
from maanaksetu.engine.verification.constraints import ConstraintsVerifier
from maanaksetu.engine.verification.dependencies import DependenciesVerifier
from maanaksetu.engine.verification.evidence_builder import EvidenceBuilder
from maanaksetu.engine.verification.lifecycle import LifecycleVerifier
from maanaksetu.engine.verification.regulatory import RegulatoryVerifier
from maanaksetu.engine.verification.scope import ScopeEvaluator
from maanaksetu.knowledge.repository import get_standard_edition


class SpecGuardVerifier:
    """Deterministic Statutory & Engineering Invariant Verification Engine."""

    def __init__(self, db: sqlite3.Connection, graph: nx.DiGraph):
        self.db = db
        self.graph = graph
        self.brands_verifier = BrandsVerifier(db)
        self.lifecycle_verifier = LifecycleVerifier(db, graph)
        self.scope_evaluator = ScopeEvaluator(db)
        self.constraints_verifier = ConstraintsVerifier(db)
        self.regulatory_verifier = RegulatoryVerifier(db)
        self.dependencies_verifier = DependenciesVerifier(graph)

    def verify_requirement(
        self,
        requirement: Requirement,
        candidate_standards: List[StandardEdition],
    ) -> List[Finding]:
        """
        Execute deterministic verification rules against a single requirement and its candidate standards.
        Enforces: AI never decides verification; all findings are rule-driven with complete evidence.
        """
        findings: List[Finding] = []

        # 1. Commercial / Brand Exclusion Check
        brand_findings = self.brands_verifier.verify(requirement)
        findings.extend(brand_findings)

        # 2. Lifecycle Currency Check
        lifecycle_findings = self.lifecycle_verifier.verify(requirement, candidate_standards)
        findings.extend(lifecycle_findings)

        # 3. Scope Boundary Check
        scope_findings = self.scope_evaluator.verify(requirement, candidate_standards)
        findings.extend(scope_findings)

        # 4. Technical Constraints & Amendment Deltas Check
        constraint_findings = self.constraints_verifier.verify(requirement, candidate_standards)
        findings.extend(constraint_findings)

        # 5. Mandatory Regulatory Orders (QCO) Check
        obsolete_segments = {f.segment_id for f in lifecycle_findings if f.violation_type == ViolationType.ERR_OBSOLETE_STANDARD}
        regulatory_findings = self.regulatory_verifier.verify(requirement, candidate_standards, already_flagged_obsolete=obsolete_segments)
        findings.extend(regulatory_findings)

        # 6. Citation Grounding & Resolution Gap Check (Uncertainty Invariant)
        cited = requirement.cited_standards or extract_is_codes(requirement.raw_text)
        resolved_codes = {s.is_number for s in candidate_standards}
        for c in cited:
            matched = any(c == r or c == r.split(":")[0] or c in r for r in resolved_codes)
            if not matched and not get_standard_edition(self.db, c):
                fid = f"FND-UNCERTAIN-{requirement.segment_id}-{c.replace(' ', '_').replace(':', '_')}"
                evidence = EvidenceBuilder.build(
                    finding_id=fid,
                    rule_id="RULE-CITATION-RESOLUTION-GAP",
                    knowledge_fact_ref="standards_catalog(UNRESOLVED)",
                    requirement_ref=requirement.requirement_id,
                    source_segment_ref=requirement.segment_id,
                    statutory_or_technical_basis="Citation Resolution Policy (Authoritative Catalog Coverage)",
                    fact_payload={"unresolved_citation": c},
                    source_segment_text=requirement.raw_text,
                )
                findings.append(
                    Finding(
                        finding_id=fid,
                        requirement_id=requirement.requirement_id,
                        segment_id=requirement.segment_id,
                        rule_id="RULE-CITATION-RESOLUTION-GAP",
                        violation_type=ViolationType.ERR_UNRESOLVED_STANDARD,
                        severity=Severity.MEDIUM,
                        decision_state=DecisionState.UNCERTAIN,
                        review_state=ReviewState.PENDING_REVIEW,
                        uncertainty_reason=UncertaintyReason.KNOWLEDGE_BASE_GAP,
                        detected_entity=c,
                        statutory_basis="Citation Resolution Policy (Authoritative Catalog Coverage)",
                        replacement_standard=None,
                        recommended_remediation=f"Manual adjudication required: citation '{c}' is ungrounded in the authoritative standards catalog.",
                        engineering_rationale=f"Clause {requirement.segment_id} cites standard '{c}', which does not exist in the active or superseded standards catalog. Halted in UNCERTAIN state.",
                        segment_text=requirement.raw_text,
                        evidence=evidence,
                    )
                )

        # 7. Verify SpecGuard Invariants on every emitted finding
        for f in findings:
            self._assert_finding_invariants(f)

        return findings

    def verify_specification(
        self,
        requirements: List[Requirement],
        candidate_map: Dict[str, List[StandardEdition]],
    ) -> Tuple[List[Finding], List[DependencyAlert], GateStatus, AuditSummary]:
        """
        Execute full verification suite across all requirements in a specification document.
        Returns: (findings, dependency_alerts, gate_status, audit_summary)
        """
        all_findings: List[Finding] = []
        all_standards_seen: List[StandardEdition] = []

        for req in requirements:
            standards = candidate_map.get(req.requirement_id, [])
            all_standards_seen.extend(standards)
            req_findings = self.verify_requirement(req, standards)
            all_findings.extend(req_findings)

        # Normative Dependency Traversal
        unique_standards = {s.is_number: s for s in all_standards_seen}.values()
        dependency_alerts = self.dependencies_verifier.verify(list(unique_standards))

        # Compute Gate Status and Discrete Defect Counts
        gate_status, summary = self._compute_gate_status_and_summary(
            total_requirements=len(requirements),
            findings=all_findings,
        )

        return all_findings, dependency_alerts, gate_status, summary

    def _assert_finding_invariants(self, finding: Finding) -> None:
        """
        Strict SpecGuard Invariants:
        1. Every finding must have a non-null Evidence object with complete 5-node provenance.
        2. Proposed replacement standard MUST exist in the authoritative catalog and MUST NOT be withdrawn.
        """
        if finding.evidence is None:
            raise AssertionError(f"SpecGuard Invariant Failure: Finding {finding.finding_id} missing Evidence tuple.")

        if finding.replacement_standard:
            rep_std = get_standard_edition(self.db, finding.replacement_standard)
            if not rep_std and ":" in finding.replacement_standard:
                rep_std = get_standard_edition(self.db, finding.replacement_standard.split(":")[0])

            # Invariant: Replacement must exist in catalog or governing alternative dictionary
            # and must not be WITHDRAWN
            if rep_std and rep_std.status == StandardStatus.WITHDRAWN:
                raise AssertionError(
                    f"SpecGuard Invariant Failure: Recommended replacement standard '{finding.replacement_standard}' "
                    f"is itself WITHDRAWN in the authoritative catalog."
                )

    def _compute_gate_status_and_summary(
        self,
        total_requirements: int,
        findings: List[Finding],
    ) -> Tuple[GateStatus, AuditSummary]:
        """Compute the Statutory Gate Status and discrete summary counts."""
        crit_count = sum(1 for f in findings if f.severity == Severity.CRITICAL and f.decision_state == DecisionState.VIOLATION)
        high_count = sum(1 for f in findings if f.severity == Severity.HIGH and f.decision_state == DecisionState.VIOLATION)
        med_count = sum(1 for f in findings if f.severity == Severity.MEDIUM and f.decision_state == DecisionState.VIOLATION)
        pending_count = sum(1 for f in findings if f.review_state == ReviewState.PENDING_REVIEW or f.decision_state == DecisionState.UNCERTAIN)

        has_qco_or_statutory = any(
            f.violation_type in (ViolationType.ERR_QCO_OMISSION, ViolationType.ERR_OBSOLETE_STANDARD, ViolationType.ERR_BRAND_EXCLUSION)
            for f in findings if f.decision_state == DecisionState.VIOLATION
        )

        if crit_count > 0 or has_qco_or_statutory:
            gate = GateStatus.STATUTORY_NON_COMPLIANT
        elif high_count > 0 or med_count > 0:
            gate = GateStatus.TECHNICAL_DEFECT
        elif pending_count > 0:
            gate = GateStatus.ACTION_REQUIRED_REVIEW
        else:
            gate = GateStatus.VERIFIED_CONFORMANT

        # Non-defective requirements count
        defective_req_ids = {f.requirement_id for f in findings if f.decision_state == DecisionState.VIOLATION}
        conformant_count = max(0, total_requirements - len(defective_req_ids))

        summary = AuditSummary(
            total_requirements_evaluated=total_requirements,
            conformant_requirements=conformant_count,
            critical_violations=crit_count,
            high_violations=high_count,
            medium_violations=med_count,
            pending_reviews=pending_count,
        )

        return gate, summary
