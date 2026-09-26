"""Lifecycle Currency and Supersession Chain Verifier (SpecGuard Core).

Rule ID: RULE-LIFECYCLE-OBSOLETE
Statutory Invariant: Obsolete, withdrawn, or superseded standards are invalid.
"""

from __future__ import annotations

import sqlite3
import uuid
from typing import List, Optional

import networkx as nx

from maanaksetu.domain.models import Finding, Requirement, StandardEdition
from maanaksetu.domain.states import DecisionState, Severity, StandardStatus, ViolationType
from maanaksetu.engine.verification.evidence_builder import EvidenceBuilder
from maanaksetu.knowledge.graph import resolve_supersession_chain


class LifecycleVerifier:
    """Verifies that cited and candidate standards are currently active."""

    RULE_ID = "RULE-LIFECYCLE-OBSOLETE"

    def __init__(self, db: sqlite3.Connection, graph: nx.DiGraph):
        self.db = db
        self.graph = graph

    def verify(
        self,
        requirement: Requirement,
        standards: List[StandardEdition],
    ) -> List[Finding]:
        """Verify lifecycle currency for each standard referenced in requirement."""
        findings: List[Finding] = []

        for std in standards:
            if std.status in (StandardStatus.WITHDRAWN, StandardStatus.SUPERSEDED):
                replacement_code = resolve_supersession_chain(self.graph, std.is_number)

                if not replacement_code:
                    cursor = self.db.cursor()
                    cursor.execute(
                        "SELECT superseding_is FROM supersedes_edges WHERE superseded_is = ?",
                        (std.is_number,),
                    )
                    row = cursor.fetchone()
                    if row:
                        replacement_code = row["superseding_is"]

                fid = f"FND-LIFE-{requirement.segment_id}-{std.is_number}"
                remediation = (
                    f"Update statutory citation from obsolete '{std.is_number}' to active '{replacement_code}'."
                    if replacement_code
                    else f"Remove reference to withdrawn standard '{std.is_number}'."
                )
                rationale = (
                    f"Clause {requirement.segment_id} cites obsolete standard '{std.is_number}' "
                    f"(status: {std.status.value}). "
                    + (f"Superseded by '{replacement_code}'." if replacement_code else "Standard is withdrawn.")
                )

                evidence = EvidenceBuilder.build(
                    finding_id=fid,
                    rule_id=self.RULE_ID,
                    knowledge_fact_ref=f"standards_catalog({std.is_number})",
                    requirement_ref=requirement.requirement_id,
                    source_segment_ref=requirement.segment_id,
                    statutory_or_technical_basis="BIS Act 2016 Section 13 & Gazette Notification S.O. 3177(E)",
                    fact_payload={
                        "status": std.status.value,
                        "withdrawal_date": std.withdrawal_date,
                        "superseded_by": replacement_code,
                    },
                    source_segment_text=requirement.raw_text,
                )

                findings.append(
                    Finding(
                        finding_id=fid,
                        requirement_id=requirement.requirement_id,
                        segment_id=requirement.segment_id,
                        rule_id=self.RULE_ID,
                        violation_type=ViolationType.ERR_OBSOLETE_STANDARD,
                        severity=Severity.CRITICAL,
                        decision_state=DecisionState.VIOLATION,
                        detected_entity=std.is_number,
                        statutory_basis="BIS Act 2016 Section 13 & Gazette Notification S.O. 3177(E)",
                        replacement_standard=replacement_code,
                        recommended_remediation=remediation,
                        engineering_rationale=rationale,
                        segment_text=requirement.raw_text,
                        evidence=evidence,
                    )
                )

        return findings
