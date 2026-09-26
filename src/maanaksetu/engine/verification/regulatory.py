"""Mandatory Regulatory Orders and Certification Verifier (SpecGuard Core).

Rule ID: RULE-REGULATORY-MANDATE-OMISSION
Statutory Invariant: Specifications for products covered by mandatory Quality Control Orders
must explicitly require statutory certification marks (e.g. BIS ISI Mark).
"""

from __future__ import annotations

import sqlite3
import uuid
from typing import List, Optional, Set

from maanaksetu.domain.models import Finding, Requirement, StandardEdition
from maanaksetu.domain.states import DecisionState, Severity, ViolationType
from maanaksetu.engine.verification.evidence_builder import EvidenceBuilder
from maanaksetu.knowledge.repository import get_qco_catalog


class RegulatoryVerifier:
    """Verifies mandatory Quality Control Order (QCO) and statutory certification compliance."""

    RULE_ID = "RULE-REGULATORY-MANDATE-OMISSION"

    # Canonical mapping of product domains to QCO standard substrings
    PRODUCT_QCO_MATCHES = {
        "distribution_transformer": "1180",
        "insulating_oil": "335",
        "steel_reinforcement": "1786",
        "led_luminaire": "10322",
    }

    def __init__(self, db: sqlite3.Connection):
        self.db = db

    def verify(
        self,
        requirement: Requirement,
        standards: List[StandardEdition],
        already_flagged_obsolete: Optional[Set[str]] = None,
    ) -> List[Finding]:
        """Verify that products governed by mandatory QCOs explicitly mandate certification."""
        findings: List[Finding] = []
        qco_rows = get_qco_catalog(self.db)
        already_flagged = already_flagged_obsolete or set()

        text_lower = requirement.raw_text.lower()
        product = requirement.product_name

        if product in self.PRODUCT_QCO_MATCHES:
            target_kw = self.PRODUCT_QCO_MATCHES[product]

            # Find matching QCO
            matched_qco = None
            for q in qco_rows:
                if target_kw in q["covered_standards"].lower():
                    matched_qco = q
                    break

            if matched_qco:
                covered_stds = [s.strip() for s in matched_qco["covered_standards"].split(",") if ":" in s]
                rep_std = covered_stds[0] if covered_stds else "Mandatory Indian Standard"

                # Check 1: Tender completely omits mention of ISI, BIS, QCO, or standard certification
                has_certification_mention = any(k in text_lower for k in ("isi", "bis", "is ", "qco", "standard", "certified", "standard mark"))

                if not has_certification_mention and requirement.segment_id not in already_flagged:
                    fid = f"FND-QCO-{requirement.segment_id}-{matched_qco['qco_id']}"
                    stat_basis = f"{matched_qco['order_title']} ({matched_qco['qco_id']})"
                    remediation = (
                        f"Incorporate mandatory stipulation: goods must bear statutory Standard Mark (ISI mark) "
                        f"conforming to {rep_std} under {matched_qco['order_title']}."
                    )
                    rationale = (
                        f"Clause {requirement.segment_id} procures {product.replace('_', ' ')} "
                        f"subject to mandatory statutory directive ({matched_qco['order_title']}), but omits "
                        f"the required stipulation for statutory certification / ISI mark."
                    )

                    evidence = EvidenceBuilder.build(
                        finding_id=fid,
                        rule_id=self.RULE_ID,
                        knowledge_fact_ref=f"qco_catalog({matched_qco['qco_id']})",
                        requirement_ref=requirement.requirement_id,
                        source_segment_ref=requirement.segment_id,
                        statutory_or_technical_basis=stat_basis,
                        fact_payload={
                            "qco_id": matched_qco["qco_id"],
                            "order_title": matched_qco["order_title"],
                            "covered_standards": matched_qco["covered_standards"],
                            "governing_standard": rep_std,
                        },
                        source_segment_text=requirement.raw_text,
                    )

                    findings.append(
                        Finding(
                            finding_id=fid,
                            requirement_id=requirement.requirement_id,
                            segment_id=requirement.segment_id,
                            rule_id=self.RULE_ID,
                            violation_type=ViolationType.ERR_QCO_OMISSION,
                            severity=Severity.HIGH,
                            decision_state=DecisionState.VIOLATION,
                            detected_entity=product,
                            statutory_basis=stat_basis,
                            replacement_standard=rep_std,
                            recommended_remediation=remediation,
                            engineering_rationale=rationale,
                            segment_text=requirement.raw_text,
                            evidence=evidence,
                        )
                    )

        return findings
