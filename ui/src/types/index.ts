export type GateStatus =
  | 'STATUTORY_NON_COMPLIANT'
  | 'TECHNICAL_DEFECT'
  | 'ACTION_REQUIRED_REVIEW'
  | 'VERIFIED_CONFORMANT';

export type DecisionState = 'CONFORMANT' | 'VIOLATION' | 'UNCERTAIN';

export type ReviewState =
  | 'NOT_APPLICABLE'
  | 'PENDING_REVIEW'
  | 'CONFIRMED_DEFECT'
  | 'DISMISSED_CONFORMANT'
  | 'EXCEPTION_RECORDED';

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type StandardStatus = 'ACTIVE' | 'SUPERSEDED' | 'WITHDRAWN';

export type UncertaintyReason =
  | 'AMBIGUOUS_SPECIFICATION'
  | 'KNOWLEDGE_BASE_GAP'
  | 'SCOPE_BOUNDARY_DISPUTE'
  | 'TRANSITIONAL_PERIOD';

export interface Evidence {
  finding_id: string;
  rule_id: string;
  knowledge_fact_ref: string;
  requirement_ref: string;
  source_segment_ref: string;
  fact_payload: Record<string, any>;
  statutory_or_technical_basis: string;
  source_segment_text: string;
}

export interface Finding {
  finding_id: string;
  requirement_id: string;
  segment_id: string;
  rule_id: string;
  violation_type: string;
  severity: Severity;
  decision_state: DecisionState;
  review_state: ReviewState;
  uncertainty_reason?: UncertaintyReason;
  detected_entity: string;
  statutory_basis: string;
  replacement_standard?: string;
  recommended_remediation: string;
  engineering_rationale: string;
  segment_text?: string;
  evidence?: Evidence;
}

export interface ParameterConstraint {
  name: string;
  value: number | string;
  unit?: string;
  condition: string;
  raw_text: string;
}

export interface Requirement {
  requirement_id: string;
  segment_id: string;
  product_name: string;
  application?: string;
  parameters: ParameterConstraint[];
  cited_standards: string[];
  cited_brands: string[];
  raw_text: string;
}

export interface DependencyAlert {
  parent_is: string;
  obsolete_sub_ref: string;
  sub_ref_status: StandardStatus;
  relationship_type: string;
  depth: number;
  engineering_risk: string;
}

export interface AuditSummary {
  total_requirements_evaluated: number;
  conformant_requirements: number;
  critical_violations: number;
  high_violations: number;
  medium_violations: number;
  pending_reviews: number;
}

export interface AuditResult {
  document_id: string;
  document_title: string;
  gate_status: GateStatus;
  total_segments_analyzed: number;
  requirements: Requirement[];
  findings: Finding[];
  cascading_dependency_alerts: DependencyAlert[];
  summary: AuditSummary;
  sha256_digest: string;
  generated_at: string;
  execution_telemetry: Record<string, number>;
  narrative_summary?: string;
  compliance_score?: number;
}

export interface ScopeBoundary {
  edition_is: string;
  included_applications: string[];
  excluded_applications: string[];
  governing_alternatives: Record<string, string>;
  scope_notes?: string;
}

export interface AmendmentRecord {
  edition_is: string;
  amendment_number: number;
  publication_year: number;
  description: string;
  parameter_deltas: Record<string, any>;
}

export interface TechnicalConstraint {
  constraint_id: string;
  edition_is: string;
  grade?: string;
  parameter_name: string;
  min_value?: number;
  max_value?: number;
  exact_value?: string;
  unit?: string;
  condition_type: string;
  test_method_is?: string;
}

export interface StandardEdition {
  is_number: string;
  family_code: string;
  title: string;
  year: number;
  status: StandardStatus;
  gazette_date?: string;
  withdrawal_date?: string;
  superseded_by?: string;
  key_parameters: Record<string, any>;
  is_qco_mandatory: boolean;
  scope_text?: string;
  scope_boundary?: ScopeBoundary;
  amendments: AmendmentRecord[];
  constraints: TechnicalConstraint[];
}

export interface FlowGraphData {
  nodes: Array<{
    id: string;
    type?: string;
    data: { label: string; [key: string]: any };
    position: { x: number; y: number };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    animated?: boolean;
    style?: Record<string, any>;
  }>;
}
