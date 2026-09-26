"""Technical Parameter Constraints and Gazetted Amendment Verifier (SpecGuard Core).

Rule IDs:
- RULE-AMENDMENT-PARAMETER-DELTA: Validates parameters against gazetted amendment deltas.
- RULE-TECHNICAL-PARAMETER-BOUND: Validates physical parameters against MIN/MAX limits.
"""

from __future__ import annotations

import sqlite3
import uuid
from typing import List, Optional, Set

from maanaksetu.domain.models import Finding, Requirement, StandardEdition
from maanaksetu.domain.states import DecisionState, Severity, ViolationType
from maanaksetu.engine.verification.evidence_builder import EvidenceBuilder
from maanaksetu.knowledge.repository import get_standard_amendments, get_technical_constraints


class ConstraintsVerifier:
    """Verifies compliance with physical test constraints and gazetted amendment deltas."""

    RULE_ID_AMENDMENT = "RULE-AMENDMENT-PARAMETER-DELTA"
    RULE_ID_CONSTRAINT = "RULE-TECHNICAL-PARAMETER-BOUND"

    def __init__(self, db: sqlite3.Connection):
        self.db = db

    def verify(
        self,
        requirement: Requirement,
        standards: List[StandardEdition],
    ) -> List[Finding]:
        """Execute amendment delta verification and physical parameter constraint verification."""
        findings: List[Finding] = []

        # Extract grade filter if present in requirement parameters
        grade_val: Optional[str] = None
        for p in requirement.parameters:
            if p.name == "grade" and isinstance(p.value, str):
                grade_val = p.value.replace(" ", "").upper()

        flagged_params: Set[str] = set()

        # 1. Gazetted Amendment Deltas Check
        for std in standards:
            amendments = get_standard_amendments(self.db, std.is_number)

            for amd in amendments:
                deltas = amd.get("parameter_deltas", {})
                if not deltas:
                    continue

                # Check elongation delta
                if "elongation_pct" in deltas and grade_val:
                    elong_map = {k.replace(" ", "").upper(): v for k, v in deltas["elongation_pct"].items()}
                    req_elong = elong_map.get(grade_val)
                    if req_elong is not None:
                        for p in requirement.parameters:
                            if p.name == "elongation" and isinstance(p.value, (int, float)):
                                if p.value < req_elong:
                                    flagged_params.add("elongation")
                                    fid = f"FND-AMD-{requirement.segment_id}-{std.is_number}-{amd['amendment_number']}-elongation"
                                    stat_basis = f"{std.is_number} Amendment No. {amd['amendment_number']} ({amd['publication_year']})"
                                    remediation = (
                                        f"Update specification to conform to Amendment No. {amd['amendment_number']}: "
                                        f"specify minimum elongation of {req_elong}% for {grade_val}."
                                    )
                                    rationale = (
                                        f"Clause {requirement.segment_id} specifies elongation of {p.value}% "
                                        f"for {p.raw_text or grade_val}, which violates Amendment No. {amd['amendment_number']} "
                                        f"({amd['publication_year']}) mandating minimum {req_elong}% for ductile seismic detailing."
                                    )

                                    evidence = EvidenceBuilder.build(
                                        finding_id=fid,
                                        rule_id=self.RULE_ID_AMENDMENT,
                                        knowledge_fact_ref=f"standard_amendments({std.is_number}, Amd {amd['amendment_number']})",
                                        requirement_ref=requirement.requirement_id,
                                        source_segment_ref=requirement.segment_id,
                                        statutory_or_technical_basis=stat_basis,
                                        fact_payload={
                                            "parameter": "elongation",
                                            "tender_value": p.value,
                                            "mandated_value": req_elong,
                                            "amendment_number": amd["amendment_number"],
                                            "grade": grade_val,
                                        },
                                        source_segment_text=requirement.raw_text,
                                    )

                                    findings.append(
                                        Finding(
                                            finding_id=fid,
                                            requirement_id=requirement.requirement_id,
                                            segment_id=requirement.segment_id,
                                            rule_id=self.RULE_ID_AMENDMENT,
                                            violation_type=ViolationType.ERR_AMENDMENT_MISMATCH,
                                            severity=Severity.HIGH,
                                            decision_state=DecisionState.VIOLATION,
                                            detected_entity=f"Elongation: {p.value}%",
                                            statutory_basis=stat_basis,
                                            replacement_standard=std.is_number,
                                            recommended_remediation=remediation,
                                            engineering_rationale=rationale,
                                            segment_text=requirement.raw_text,
                                            evidence=evidence,
                                        )
                                    )

                # Check compressive strength delta
                if "compressive_strength_28_day_mpa" in deltas and grade_val:
                    grade_key = grade_val.lower()
                    req_strength = deltas["compressive_strength_28_day_mpa"].get(grade_key)
                    if req_strength is not None:
                        for p in requirement.parameters:
                            if p.name == "compressive_strength_28_day" and isinstance(p.value, (int, float)):
                                if p.value < req_strength:
                                    flagged_params.add("compressive_strength_28_day")
                                    fid = f"FND-AMD-{requirement.segment_id}-{std.is_number}-{amd['amendment_number']}-compressive_strength"
                                    stat_basis = f"{std.is_number} Amendment No. {amd['amendment_number']} ({amd['publication_year']})"
                                    remediation = (
                                        f"Harmonize specification with Amendment No. {amd['amendment_number']}: "
                                        f"set 28-day compressive strength to minimum {req_strength} MPa."
                                    )
                                    rationale = (
                                        f"Clause {requirement.segment_id} specifies 28-day compressive "
                                        f"strength of {p.value} MPa, which fails Amendment No. {amd['amendment_number']} "
                                        f"mandating minimum {req_strength} MPa for {grade_key}."
                                    )

                                    evidence = EvidenceBuilder.build(
                                        finding_id=fid,
                                        rule_id=self.RULE_ID_AMENDMENT,
                                        knowledge_fact_ref=f"standard_amendments({std.is_number}, Amd {amd['amendment_number']})",
                                        requirement_ref=requirement.requirement_id,
                                        source_segment_ref=requirement.segment_id,
                                        statutory_or_technical_basis=stat_basis,
                                        fact_payload={
                                            "parameter": "compressive_strength_28_day",
                                            "tender_value": p.value,
                                            "mandated_value": req_strength,
                                            "amendment_number": amd["amendment_number"],
                                            "grade": grade_val,
                                        },
                                        source_segment_text=requirement.raw_text,
                                    )

                                    findings.append(
                                        Finding(
                                            finding_id=fid,
                                            requirement_id=requirement.requirement_id,
                                            segment_id=requirement.segment_id,
                                            rule_id=self.RULE_ID_AMENDMENT,
                                            violation_type=ViolationType.ERR_AMENDMENT_MISMATCH,
                                            severity=Severity.HIGH,
                                            decision_state=DecisionState.VIOLATION,
                                            detected_entity=f"Strength: {p.value} MPa",
                                            statutory_basis=stat_basis,
                                            replacement_standard=std.is_number,
                                            recommended_remediation=remediation,
                                            engineering_rationale=rationale,
                                            segment_text=requirement.raw_text,
                                            evidence=evidence,
                                        )
                                    )

        # 2. Physical Parameter Threshold Constraints Check
        for std in standards:
            constraints = get_technical_constraints(self.db, std.is_number, grade_val)

            # When grade is unspecified, group by parameter_name and select lowest baseline MIN
            if grade_val is None and len(constraints) > 1:
                grouped: dict[str, list[dict]] = {}
                for c in constraints:
                    grouped.setdefault(c["parameter_name"], []).append(c)

                filtered_constraints = []
                for pname, clist in grouped.items():
                    if len(clist) == 1:
                        filtered_constraints.append(clist[0])
                    else:
                        min_candidates = [c for c in clist if c["condition_type"] == "MIN" and c["min_value"] is not None]
                        if min_candidates:
                            filtered_constraints.append(min(min_candidates, key=lambda x: x["min_value"]))
                        else:
                            filtered_constraints.extend(clist)
                constraints = filtered_constraints

            for c in constraints:
                param_name = c["parameter_name"]
                if param_name in flagged_params:
                    continue  # Already flagged with more specific amendment basis

                cond_type = c["condition_type"]
                min_v = c["min_value"]
                max_v = c["max_value"]
                unit_v = c["unit"] or ""

                for p in requirement.parameters:
                    if p.name == param_name and isinstance(p.value, (int, float)):
                        # MIN violation
                        if cond_type == "MIN" and min_v is not None and p.value < min_v:
                            fid = f"FND-CONST-MIN-{requirement.segment_id}-{c['constraint_id']}-{p.name}"
                            stat_basis = f"{std.is_number} Mandatory Parameter Requirement ({c.get('test_method_is') or 'Standard'})"
                            remediation = f"Increase {p.name} to at least {min_v} {unit_v} in accordance with {std.is_number}."
                            rationale = (
                                f"Clause {requirement.segment_id} specifies {p.name} of "
                                f"{p.value} {unit_v}, which is contradictory to mandatory minimum "
                                f"({min_v} {unit_v}) required by {std.is_number}."
                            )

                            evidence = EvidenceBuilder.build(
                                finding_id=fid,
                                rule_id=self.RULE_ID_CONSTRAINT,
                                knowledge_fact_ref=f"technical_constraints({c['constraint_id']})",
                                requirement_ref=requirement.requirement_id,
                                source_segment_ref=requirement.segment_id,
                                statutory_or_technical_basis=stat_basis,
                                fact_payload={
                                    "parameter": p.name,
                                    "tender_value": p.value,
                                    "condition": "MIN",
                                    "required_bound": min_v,
                                    "unit": unit_v,
                                },
                                source_segment_text=requirement.raw_text,
                            )

                            findings.append(
                                Finding(
                                    finding_id=fid,
                                    requirement_id=requirement.requirement_id,
                                    segment_id=requirement.segment_id,
                                    rule_id=self.RULE_ID_CONSTRAINT,
                                    violation_type=ViolationType.ERR_CONTRADICTORY_TEST,
                                    severity=Severity.CRITICAL,
                                    decision_state=DecisionState.VIOLATION,
                                    detected_entity=f"{p.name}: {p.value} {unit_v}",
                                    statutory_basis=stat_basis,
                                    replacement_standard=std.is_number,
                                    recommended_remediation=remediation,
                                    engineering_rationale=rationale,
                                    segment_text=requirement.raw_text,
                                    evidence=evidence,
                                )
                            )

                        # MAX violation
                        elif cond_type == "MAX" and max_v is not None and p.value > max_v:
                            fid = f"FND-CONST-MAX-{requirement.segment_id}-{c['constraint_id']}-{p.name}"
                            stat_basis = f"{std.is_number} Permissible Limit ({c.get('test_method_is') or 'Standard'})"
                            remediation = f"Reduce {p.name} to not exceed {max_v} {unit_v} under {std.is_number}."
                            rationale = (
                                f"Clause {requirement.segment_id} specifies {p.name} of "
                                f"{p.value} {unit_v}, which exceeds maximum permissible limit "
                                f"({max_v} {unit_v}) under {std.is_number}."
                            )

                            evidence = EvidenceBuilder.build(
                                finding_id=fid,
                                rule_id=self.RULE_ID_CONSTRAINT,
                                knowledge_fact_ref=f"technical_constraints({c['constraint_id']})",
                                requirement_ref=requirement.requirement_id,
                                source_segment_ref=requirement.segment_id,
                                statutory_or_technical_basis=stat_basis,
                                fact_payload={
                                    "parameter": p.name,
                                    "tender_value": p.value,
                                    "condition": "MAX",
                                    "required_bound": max_v,
                                    "unit": unit_v,
                                },
                                source_segment_text=requirement.raw_text,
                            )

                            findings.append(
                                Finding(
                                    finding_id=fid,
                                    requirement_id=requirement.requirement_id,
                                    segment_id=requirement.segment_id,
                                    rule_id=self.RULE_ID_CONSTRAINT,
                                    violation_type=ViolationType.ERR_CONTRADICTORY_TEST,
                                    severity=Severity.CRITICAL,
                                    decision_state=DecisionState.VIOLATION,
                                    detected_entity=f"{p.name}: {p.value} {unit_v}",
                                    statutory_basis=stat_basis,
                                    replacement_standard=std.is_number,
                                    recommended_remediation=remediation,
                                    engineering_rationale=rationale,
                                    segment_text=requirement.raw_text,
                                    evidence=evidence,
                                )
                            )

        return findings
