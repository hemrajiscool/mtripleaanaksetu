"""Scope Boundary and Application Context Evaluator (SpecGuard Core).

Rule ID: RULE-SCOPE-EXCLUSION
Statutory Invariant: A standard must not be applied to an engineering domain
explicitly excluded by its declared Clause 1.1 Scope Boundaries.
"""

from __future__ import annotations

import sqlite3
import uuid
from typing import List

from maanaksetu.domain.models import Finding, Requirement, StandardEdition
from maanaksetu.domain.states import DecisionState, Severity, ViolationType
from maanaksetu.engine.verification.evidence_builder import EvidenceBuilder
from maanaksetu.knowledge.repository import get_standard_scope


class ScopeEvaluator:
    """Evaluates whether standard editions govern the requirement's engineering application."""

    RULE_ID = "RULE-SCOPE-EXCLUSION"

    def __init__(self, db: sqlite3.Connection):
        self.db = db

    def verify(
        self,
        requirement: Requirement,
        standards: List[StandardEdition],
    ) -> List[Finding]:
        """Verify scope boundary compliance for the requirement's application context."""
        findings: List[Finding] = []
        if not requirement.application:
            return findings

        app_normalized = requirement.application.lower().strip()

        for std in standards:
            scope = get_standard_scope(self.db, std.is_number)
            if not scope:
                continue

            excluded = [e.lower().strip() for e in scope.get("excluded_applications", [])]

            # Check if requirement application matches an explicit exclusion
            is_excluded = app_normalized in excluded or any(e in app_normalized for e in excluded)

            if is_excluded:
                governing = scope.get("governing_alternatives", {})
                replacement_std = governing.get(app_normalized)
                if not replacement_std:
                    for k, v in governing.items():
                        if k in app_normalized:
                            replacement_std = v
                            break

                fid = f"FND-SCOPE-{requirement.segment_id}-{std.is_number}"
                stat_basis = f"{std.is_number} Scope Exclusions (Clause 1.1) & {replacement_std or 'Governing Code'}"
                remediation = (
                    f"Replace misapplied citation '{std.is_number}' with governing standard '{replacement_std}' "
                    f"for {requirement.application}."
                    if replacement_std
                    else f"Clarify scope boundary: '{std.is_number}' does not govern '{requirement.application}'."
                )
                scope_note = scope.get("scope_notes") or f"Standard {std.is_number} explicitly excludes {requirement.application}."
                rationale = (
                    f"Clause {requirement.segment_id} misapplies '{std.is_number}' "
                    f"to engineering domain '{requirement.application}'. {scope_note}"
                )

                evidence = EvidenceBuilder.build(
                    finding_id=fid,
                    rule_id=self.RULE_ID,
                    knowledge_fact_ref=f"standard_scopes({std.is_number})",
                    requirement_ref=requirement.requirement_id,
                    source_segment_ref=requirement.segment_id,
                    statutory_or_technical_basis=stat_basis,
                    fact_payload={
                        "context_application": requirement.application,
                        "excluded_applications": excluded,
                        "governing_alternatives": governing,
                        "alternative_standard": replacement_std,
                    },
                    source_segment_text=requirement.raw_text,
                )

                findings.append(
                    Finding(
                        finding_id=fid,
                        requirement_id=requirement.requirement_id,
                        segment_id=requirement.segment_id,
                        rule_id=self.RULE_ID,
                        violation_type=ViolationType.ERR_SCOPE_CONFLICT,
                        severity=Severity.CRITICAL,
                        decision_state=DecisionState.VIOLATION,
                        detected_entity=std.is_number,
                        statutory_basis=stat_basis,
                        replacement_standard=replacement_std,
                        recommended_remediation=remediation,
                        engineering_rationale=rationale,
                        segment_text=requirement.raw_text,
                        evidence=evidence,
                    )
                )

        return findings
