"""Core domain states, enums, and decision lifecycle values for MaanakSetu."""

from __future__ import annotations

from enum import Enum


class StandardStatus(str, Enum):
    """Statutory status of a standard edition."""
    ACTIVE = "ACTIVE"
    SUPERSEDED = "SUPERSEDED"
    WITHDRAWN = "WITHDRAWN"


class ApplicabilityStatus(str, Enum):
    """Applicability decision state for a candidate standard against an application context."""
    APPLICABLE = "APPLICABLE"
    NOT_APPLICABLE = "NOT_APPLICABLE"
    UNCERTAIN = "UNCERTAIN"


class DecisionState(str, Enum):
    """Verification finding outcome state."""
    CONFORMANT = "CONFORMANT"
    VIOLATION = "VIOLATION"
    UNCERTAIN = "UNCERTAIN"


class ReviewState(str, Enum):
    """Human authority adjudication workflow state."""
    NOT_APPLICABLE = "NOT_APPLICABLE"
    PENDING_REVIEW = "PENDING_REVIEW"
    CONFIRMED_DEFECT = "CONFIRMED_DEFECT"
    DISMISSED_CONFORMANT = "DISMISSED_CONFORMANT"
    EXCEPTION_RECORDED = "EXCEPTION_RECORDED"


class UncertaintyReason(str, Enum):
    """Typed justification for an UNCERTAIN finding state."""
    AMBIGUOUS_SPECIFICATION = "AMBIGUOUS_SPECIFICATION"
    KNOWLEDGE_BASE_GAP = "KNOWLEDGE_BASE_GAP"
    SCOPE_BOUNDARY_DISPUTE = "SCOPE_BOUNDARY_DISPUTE"
    TRANSITIONAL_PERIOD = "TRANSITIONAL_PERIOD"


class GateStatus(str, Enum):
    """Overall statutory and technical gate status for an audited specification."""
    STATUTORY_NON_COMPLIANT = "STATUTORY_NON_COMPLIANT"
    TECHNICAL_DEFECT = "TECHNICAL_DEFECT"
    ACTION_REQUIRED_REVIEW = "ACTION_REQUIRED_REVIEW"
    VERIFIED_CONFORMANT = "VERIFIED_CONFORMANT"


class ViolationType(str, Enum):
    """Statutory or technical specification violation classification."""
    ERR_OBSOLETE_STANDARD = "ERR_OBSOLETE_STANDARD"
    ERR_SCOPE_CONFLICT = "ERR_SCOPE_CONFLICT"
    ERR_CONTRADICTORY_TEST = "ERR_CONTRADICTORY_TEST"
    ERR_AMENDMENT_MISMATCH = "ERR_AMENDMENT_MISMATCH"
    ERR_QCO_OMISSION = "ERR_QCO_OMISSION"
    ERR_BRAND_EXCLUSION = "ERR_BRAND_EXCLUSION"
    ERR_UNRESOLVED_STANDARD = "ERR_UNRESOLVED_STANDARD"


class Severity(str, Enum):
    """Severity classification for audit findings."""
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ParameterCondition(str, Enum):
    """Mathematical comparator condition for quantitative parameters."""
    MIN = "MIN"
    MAX = "MAX"
    EXACT = "EXACT"
    RANGE = "RANGE"


class SegmentCategory(str, Enum):
    """Functional categorization of a document segment."""
    TECHNICAL_SPECIFICATION = "TECHNICAL_SPECIFICATION"
    COMMERCIAL_TERMS = "COMMERCIAL_TERMS"
    ELIGIBILITY_CRITERIA = "ELIGIBILITY_CRITERIA"
    ADMINISTRATIVE = "ADMINISTRATIVE"
    UNCLASSIFIED = "UNCLASSIFIED"
