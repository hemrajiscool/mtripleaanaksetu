"""Anti-Competitive Brand Name and Restrictive Trade Practice Verifier (SpecGuard Core).

Rule ID: RULE-COMMERCIAL-BRAND-EXCLUSION
Statutory Invariant: Specifying proprietary brand names or makes without objective functional
criteria violates public procurement neutrality (Rule 144(i) GFR 2017).
"""

from __future__ import annotations

import re
import sqlite3
import uuid
from typing import List

from maanaksetu.domain.models import Finding, Requirement
from maanaksetu.domain.states import DecisionState, Severity, ViolationType
from maanaksetu.engine.verification.evidence_builder import EvidenceBuilder
from maanaksetu.knowledge.repository import get_brands


class BrandsVerifier:
    """Detects proprietary brand names and commercial lockout clauses in technical specifications."""

    RULE_ID = "RULE-COMMERCIAL-BRAND-EXCLUSION"
    STATUTORY_BASIS = "Rule 144(i) GFR 2017 & CVC Guidelines No. 002/ENG/2"

    def __init__(self, db: sqlite3.Connection):
        self.db = db

    def verify(self, requirement: Requirement) -> List[Finding]:
        """Check requirement text for proprietary brand names from the authoritative brand dictionary."""
        findings: List[Finding] = []
        brands_data = get_brands(self.db)

        text = requirement.raw_text
        detected_brands: List[str] = []

        for b in brands_data:
            brand_name = b["brand_name"]
            pattern = rf"\b{re.escape(brand_name)}\b"
            if re.search(pattern, text, re.IGNORECASE):
                detected_brands.append(brand_name)

        if detected_brands:
            brands_str = ", ".join(detected_brands)
            fid = f"FND-BRAND-{requirement.segment_id}-{brands_str}"
            remediation = (
                f"Remove proprietary brand names ({brands_str}) and replace with objective "
                f"functional performance requirements conforming to applicable standards."
            )
            rationale = (
                f"Clause {requirement.segment_id} specifies proprietary brand(s) ({brands_str}). "
                f"Specifying brand names or makes without technical justification is restrictive "
                f"and violates procurement competition rules."
            )

            evidence = EvidenceBuilder.build(
                finding_id=fid,
                rule_id=self.RULE_ID,
                knowledge_fact_ref=f"brand_dictionary({brands_str})",
                requirement_ref=requirement.requirement_id,
                source_segment_ref=requirement.segment_id,
                statutory_or_technical_basis=self.STATUTORY_BASIS,
                fact_payload={
                    "detected_brands": detected_brands,
                    "legal_rule": "GFR 2017 Rule 144(i)",
                },
                source_segment_text=requirement.raw_text,
            )

            findings.append(
                Finding(
                    finding_id=fid,
                    requirement_id=requirement.requirement_id,
                    segment_id=requirement.segment_id,
                    rule_id=self.RULE_ID,
                    violation_type=ViolationType.ERR_BRAND_EXCLUSION,
                    severity=Severity.HIGH,
                    decision_state=DecisionState.VIOLATION,
                    detected_entity=brands_str,
                    statutory_basis=self.STATUTORY_BASIS,
                    replacement_standard=None,
                    recommended_remediation=remediation,
                    engineering_rationale=rationale,
                    segment_text=requirement.raw_text,
                    evidence=evidence,
                )
            )

        return findings
