"""FastAPI Route Handlers for MaanakSetu Regulatory Service."""

from __future__ import annotations

import datetime
import re
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from pydantic import BaseModel, Field

from maanaksetu.adapters.api.cache import AuditCache
from maanaksetu.adapters.dossier import compile_dossier
from maanaksetu.domain.models import AuditResult, Finding
from maanaksetu.domain.states import DecisionState, ReviewState
from maanaksetu.engine.orchestrator import AuditPipeline, compute_state_digest
from maanaksetu.knowledge.graph import export_subgraph_for_flow

router = APIRouter(prefix="/api", tags=["Audit Gateway"])


class AuditRequest(BaseModel):
    """Tender audit submission request payload."""
    text: str = Field(..., description="Unstructured tender or specification text", min_length=1, max_length=5_000_000)
    document_id: Optional[str] = Field(None, description="Optional custom document or tender ID", max_length=120)
    document_title: Optional[str] = Field(None, description="Optional tender title", max_length=255)


class VerificationResponse(BaseModel):
    """Cryptographic verification response payload."""
    valid: bool
    sha256_digest: str
    document_id: Optional[str] = None
    document_title: Optional[str] = None
    gate_status: Optional[str] = None
    generated_at: Optional[str] = None
    findings_count: int = 0
    verification_authority: str = "Bureau of Indian Standards / Sovereign Standards Authority — MaanakSetu"


class AdjudicationRequest(BaseModel):
    """Human adjudication request to resolve an UNCERTAIN finding or record exception."""
    finding_id: str = Field(..., description="Unique ID of the finding to adjudicate", min_length=1, max_length=120)
    review_state: ReviewState = Field(..., description="Target adjudication state")
    adjudicator_id: str = Field("Chief Regulatory Officer", description="Authority identity", min_length=1, max_length=120)
    adjudication_notes: str = Field("", description="Justification or statutory rationale", max_length=2000)


# Dependency accessors attached via app.state
def get_pipeline(request: Request) -> AuditPipeline:
    return request.app.state.pipeline


def get_cache(request: Request) -> AuditCache:
    return request.app.state.cache


@router.post(
    "/audit",
    response_model=AuditResult,
    status_code=status.HTTP_200_OK,
    summary="Audit Tender Specification",
    description="Executes the 4-stage neuro-symbolic regulatory verification pipeline.",
)
async def audit_tender(
    payload: AuditRequest,
    pipeline: AuditPipeline = Depends(get_pipeline),
    cache: AuditCache = Depends(get_cache),
) -> AuditResult:
    # Check cache if document_id was provided
    if payload.document_id:
        cached = cache.get_by_id(payload.document_id)
        if cached:
            return cached

    # Execute deterministic pipeline
    result = await pipeline.execute(
        source=payload.text,
        document_id=payload.document_id,
        document_title=payload.document_title,
    )

    # Store in dual-tier cache
    cache.set(result)
    return result


@router.get(
    "/audit/{document_id}",
    response_model=AuditResult,
    summary="Retrieve Cached Audit Result",
)
async def get_audit(
    document_id: str,
    cache: AuditCache = Depends(get_cache),
) -> AuditResult:
    result = cache.get_by_id(document_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audit result for document '{document_id}' not found.",
        )
    return result


@router.get(
    "/dossier/{document_id}/pdf",
    response_class=Response,
    summary="Download Publication-Grade Audit Dossier (PDF)",
    description="Compiles and streams a 3-page Typst PDF audit dossier with embedded SHA-256 seal and QR code.",
)
async def download_dossier_pdf(
    document_id: str,
    cache: AuditCache = Depends(get_cache),
    pipeline: AuditPipeline = Depends(get_pipeline),
) -> Response:
    result = cache.get_by_id(document_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' not found. Run /api/audit first.",
        )

    try:
        pdf_bytes = compile_dossier(result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dossier compilation failed: {str(e)}",
        )

    safe_doc_id = re.sub(r"[^A-Za-z0-9_-]", "_", document_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="Audit_Dossier_{safe_doc_id}.pdf"',
            "X-SHA256-Digest": result.sha256_digest,
            "X-Gate-Status": result.gate_status.value,
        },
    )


@router.post(
    "/audit/{document_id}/adjudicate",
    response_model=AuditResult,
    summary="Adjudicate Specification Finding",
    description="Allows authorized standards authorities to resolve UNCERTAIN findings or record formal exceptions.",
)
async def adjudicate_finding(
    document_id: str,
    payload: AdjudicationRequest,
    cache: AuditCache = Depends(get_cache),
    pipeline: AuditPipeline = Depends(get_pipeline),
) -> AuditResult:
    result = cache.get_by_id(document_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' not found.",
        )

    # Locate target finding
    target_finding: Optional[Finding] = None
    for f in result.findings:
        if f.finding_id == payload.finding_id:
            target_finding = f
            break

    if not target_finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Finding '{payload.finding_id}' not found in document '{document_id}'.",
        )

    # Apply adjudication state transition
    target_finding.review_state = payload.review_state
    if payload.review_state == ReviewState.CONFIRMED_DEFECT:
        target_finding.decision_state = DecisionState.VIOLATION
    elif payload.review_state in (ReviewState.DISMISSED_CONFORMANT, ReviewState.EXCEPTION_RECORDED):
        target_finding.decision_state = DecisionState.CONFORMANT

    clean_adjudicator = re.sub(r"[<>]", "", payload.adjudicator_id).strip() or "Regulatory Officer"
    clean_notes = re.sub(r"[<>]", "", payload.adjudication_notes).strip()
    if clean_notes:
        target_finding.engineering_rationale += f" [Adjudication by {clean_adjudicator}: {clean_notes}]"

    # Recompute gate status and discrete defect summary
    new_gate, new_summary = pipeline.verifier._compute_gate_status_and_summary(
        total_requirements=result.summary.total_requirements_evaluated,
        findings=result.findings,
    )
    result.gate_status = new_gate
    result.summary = new_summary

    # Recompute cryptographic state digest with updated adjudication record
    result.sha256_digest = compute_state_digest(
        document_id=result.document_id,
        segments=result.total_segments_analyzed,
        findings=result.findings,
        dependency_alerts=result.cascading_dependency_alerts,
        gate_status=result.gate_status,
    )

    # Update cache with new adjudicated result
    cache.set(result)
    return result


@router.get(
    "/verify/{sha256_digest}",
    response_model=VerificationResponse,
    summary="Verify Audit Integrity by SHA-256 Digest",
    description="Public endpoint to verify the authenticity and tamper-evidence of an issued audit dossier.",
)
async def verify_audit_digest(
    sha256_digest: str,
    cache: AuditCache = Depends(get_cache),
) -> VerificationResponse:
    if not re.match(r"^[a-fA-F0-9]{64}$", sha256_digest):
        return VerificationResponse(
            valid=False,
            sha256_digest=sha256_digest,
        )

    result = cache.get_by_digest(sha256_digest)
    if not result:
        return VerificationResponse(
            valid=False,
            sha256_digest=sha256_digest,
        )

    return VerificationResponse(
        valid=True,
        sha256_digest=sha256_digest,
        document_id=result.document_id,
        document_title=result.document_title,
        gate_status=result.gate_status.value,
        generated_at=result.generated_at,
        findings_count=len(result.findings),
    )


@router.get(
    "/graph/{document_id}",
    summary="Get Subgraph for React Flow Visualization",
)
async def get_document_graph(
    document_id: str,
    cache: AuditCache = Depends(get_cache),
    pipeline: AuditPipeline = Depends(get_pipeline),
    depth: int = Query(2, ge=1, le=4),
) -> Dict[str, Any]:
    result = cache.get_by_id(document_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' not found.",
        )

    # Collect all cited and replacement standards that exist in the knowledge graph
    root_standards: List[str] = []
    for f in result.findings:
        if f.detected_entity in pipeline.graph.nodes:
            root_standards.append(f.detected_entity)
        if f.replacement_standard and f.replacement_standard in pipeline.graph.nodes:
            root_standards.append(f.replacement_standard)

    if not root_standards:
        defaults = ["IS 456:2000", "IS 1786:2008"]
        root_standards = [s for s in defaults if s in pipeline.graph.nodes] or list(pipeline.graph.nodes)[:2]

    flow_data = export_subgraph_for_flow(pipeline.graph, root_standards=root_standards, max_depth=depth)
    return flow_data


@router.get(
    "/health",
    summary="Service Health Check",
)
async def health_check() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "service": "MaanakSetu Sovereign Engine",
        "version": "1.0.0",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }
