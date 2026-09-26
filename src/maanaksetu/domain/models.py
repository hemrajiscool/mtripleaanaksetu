"""Canonical domain models for Project Sovereign (MaanakSetu).

Adheres strictly to the frozen architecture specification:
- Pure contracts (Domain-Agnostic)
- Strict 5-node Evidence Provenance Tuple
- First-class Uncertainty and GateStatus representation
"""

from __future__ import annotations

import datetime
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, model_validator

from maanaksetu.domain.states import (
    ApplicabilityStatus,
    DecisionState,
    GateStatus,
    ParameterCondition,
    ReviewState,
    SegmentCategory,
    Severity,
    StandardStatus,
    UncertaintyReason,
    ViolationType,
)


# ═════════════════════════════════════════════════════════════════════════════
# 1. INPUT DOMAIN (Specification Document & Requirements)
# ═════════════════════════════════════════════════════════════════════════════

class DocumentSegment(BaseModel):
    """Segmented unit of text from a specification document (e.g. Clause / Section)."""
    segment_id: str
    segment_number: Optional[str] = None
    raw_text: str
    page_number: int = 1
    bounding_box: Optional[Dict[str, float]] = None
    category: SegmentCategory = SegmentCategory.TECHNICAL_SPECIFICATION

    @model_validator(mode="before")
    @classmethod
    def _coerce_segment_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "segment_id" not in data and "clause_id" in data:
                data["segment_id"] = data["clause_id"]
            if "segment_number" not in data and "clause_number" in data:
                data["segment_number"] = data["clause_number"]
            if "raw_text" not in data and "text" in data:
                data["raw_text"] = data["text"]
            if "bounding_box" not in data and "bbox" in data:
                b = data["bbox"]
                if isinstance(b, (list, tuple)) and len(b) == 4:
                    data["bounding_box"] = {"x0": float(b[0]), "y0": float(b[1]), "x1": float(b[2]), "y1": float(b[3])}
                elif isinstance(b, dict):
                    data["bounding_box"] = b
        return data

    @property
    def clause_id(self) -> str:
        return self.segment_id

    @property
    def clause_number(self) -> Optional[str]:
        return self.segment_number

    @property
    def text(self) -> str:
        return self.raw_text


class ParameterConstraint(BaseModel):
    """Quantitative engineering parameter with mathematical condition."""
    name: str
    value: Union[float, int, str]
    unit: Optional[str] = None
    condition: ParameterCondition = ParameterCondition.EXACT
    raw_text: str = ""


class Requirement(BaseModel):
    """Structured technical requirement extracted from a document segment.

    This is the core decision object of MaanakSetu.
    """
    requirement_id: str
    segment_id: str
    product_name: str
    application: Optional[str] = None
    parameters: List[ParameterConstraint] = Field(default_factory=list)
    cited_standards: List[str] = Field(default_factory=list)
    cited_brands: List[str] = Field(default_factory=list)
    raw_text: str = ""

    @property
    def clause_id(self) -> str:
        return self.segment_id


# Alias for backward-compatibility with requirements.py
RequirementBundle = Requirement


class CandidateStandardReference(BaseModel):
    """Candidate standard identified via discovery for a requirement."""
    raw_citation: str
    parsed_family: str
    parsed_edition: Optional[str] = None
    match_source: str = "EXACT"  # EXACT | TAXONOMY | LEXICAL | SEMANTIC
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)


# ═════════════════════════════════════════════════════════════════════════════
# 2. KNOWLEDGE DOMAIN (Authoritative Facts)
# ═════════════════════════════════════════════════════════════════════════════

class ScopeBoundary(BaseModel):
    """Declared scope boundary and applicability constraints for a standard edition."""
    edition_is: str
    included_applications: List[str] = Field(default_factory=list)
    excluded_applications: List[str] = Field(default_factory=list)
    governing_alternatives: Dict[str, str] = Field(default_factory=dict)
    scope_notes: Optional[str] = None


class AmendmentRecord(BaseModel):
    """Gazetted revision delta for a specific standard edition."""
    edition_is: str
    amendment_number: int
    publication_year: int
    description: str = ""
    parameter_deltas: Dict[str, Any] = Field(default_factory=dict)


class TechnicalConstraint(BaseModel):
    """Mandatory physical or test parameter threshold from an authoritative standard."""
    constraint_id: str
    edition_is: str
    grade: Optional[str] = None
    parameter_name: str
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    exact_value: Optional[str] = None
    unit: Optional[str] = None
    condition_type: str = "MIN"  # MIN | MAX | EXACT | RANGE
    test_method_is: Optional[str] = None


class RegulatoryMandate(BaseModel):
    """Statutory directive (e.g. Quality Control Order) mandating certification."""
    mandate_id: str
    order_title: str
    effective_date: Optional[str] = None
    covered_standards: List[str] = Field(default_factory=list)


class StandardEdition(BaseModel):
    """Authoritative standard edition record."""
    is_number: str
    family_code: str
    title: str
    year: int
    status: StandardStatus = StandardStatus.ACTIVE
    gazette_date: Optional[str] = None
    withdrawal_date: Optional[str] = None
    superseded_by: Optional[str] = None
    key_parameters: Dict[str, Any] = Field(default_factory=dict)
    is_qco_mandatory: bool = False
    scope_text: Optional[str] = None
    scope_boundary: Optional[ScopeBoundary] = None
    amendments: List[AmendmentRecord] = Field(default_factory=list)
    constraints: List[TechnicalConstraint] = Field(default_factory=list)

    @property
    def is_code(self) -> str:
        return self.is_number


# Alias for backward-compatibility
StandardRecord = StandardEdition


class DependencyAlert(BaseModel):
    """Cascading obsolescence alert along the normative reference tree."""
    parent_is: str
    obsolete_sub_ref: str
    sub_ref_status: StandardStatus = StandardStatus.WITHDRAWN
    relationship_type: str = "NORMATIVE_REF"
    depth: int = Field(default=1, ge=1)
    engineering_risk: str = ""


# ═════════════════════════════════════════════════════════════════════════════
# 3. EVIDENCE & PROVENANCE (Strict 5-Node Tuple)
# ═════════════════════════════════════════════════════════════════════════════

class Evidence(BaseModel):
    """Immutable 5-node provenance tuple backing every audit finding:

    E = <FindingId, RuleId, KnowledgeFactRef, RequirementRef, SourceSegmentRef>
    """
    finding_id: str
    rule_id: str
    knowledge_fact_ref: str
    requirement_ref: str
    source_segment_ref: str
    fact_payload: Dict[str, Any] = Field(default_factory=dict)
    statutory_or_technical_basis: str
    source_segment_text: str = ""


# ═════════════════════════════════════════════════════════════════════════════
# 4. FINDINGS & AUDIT RESULT (Output Domain)
# ═════════════════════════════════════════════════════════════════════════════

class Finding(BaseModel):
    """Deterministic statutory or technical finding with full provenance."""
    finding_id: str
    requirement_id: str
    segment_id: str
    rule_id: str
    violation_type: ViolationType
    severity: Severity = Severity.HIGH
    decision_state: DecisionState = DecisionState.VIOLATION
    review_state: ReviewState = ReviewState.NOT_APPLICABLE
    uncertainty_reason: Optional[UncertaintyReason] = None
    detected_entity: str
    statutory_basis: str
    replacement_standard: Optional[str] = None
    recommended_remediation: str = ""
    engineering_rationale: str = ""
    segment_text: Optional[str] = None
    evidence: Optional[Evidence] = None

    @property
    def clause_id(self) -> str:
        return self.segment_id

    @property
    def clause_text(self) -> Optional[str]:
        return self.segment_text


# Backward compatibility alias
Violation = Finding


class AuditSummary(BaseModel):
    """Discrete, verifiable defect and conformance counts (No arbitrary scores)."""
    total_requirements_evaluated: int = 0
    conformant_requirements: int = 0
    critical_violations: int = 0
    high_violations: int = 0
    medium_violations: int = 0
    pending_reviews: int = 0


class AuditResult(BaseModel):
    """Complete audit dossier for a specification document."""
    document_id: str
    document_title: str = "Tender Compliance Audit"
    gate_status: GateStatus = GateStatus.VERIFIED_CONFORMANT
    total_segments_analyzed: int = 0
    findings: List[Finding] = Field(default_factory=list)
    cascading_dependency_alerts: List[DependencyAlert] = Field(default_factory=list)
    summary: AuditSummary = Field(default_factory=AuditSummary)
    sha256_digest: str = ""
    generated_at: str = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat())
    execution_telemetry: Dict[str, float] = Field(default_factory=dict)
    narrative_summary: Optional[str] = None

    @property
    def tender_id(self) -> str:
        return self.document_id

    @property
    def violations(self) -> List[Finding]:
        return self.findings

    @property
    def dependency_alerts(self) -> List[DependencyAlert]:
        return self.cascading_dependency_alerts

    @property
    def compliance_score(self) -> int:
        """Auxiliary presentation index: derived strictly for UI dashboard sorting."""
        if self.gate_status == GateStatus.STATUTORY_NON_COMPLIANT:
            return 0
        deduction = (
            self.summary.critical_violations * 25
            + self.summary.high_violations * 15
            + self.summary.medium_violations * 5
            + self.summary.pending_reviews * 5
        )
        return max(0, 100 - deduction)
