"""FastAPI Route Handlers for MaanakSetu Regulatory Service."""

from __future__ import annotations

import datetime
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from pydantic import BaseModel, Field

from maanaksetu.adapters.api.cache import AuditCache
from maanaksetu.adapters.dossier import compile_dossier
from maanaksetu.domain.models import AuditResult
from maanaksetu.engine.orchestrator import AuditPipeline
from maanaksetu.knowledge.graph import export_subgraph_for_flow

router = APIRouter(prefix="/api", tags=["Audit Gateway"])


class AuditRequest(BaseModel):
    """Tender audit submission request payload."""
    text: str = Field(..., description="Unstructured tender or specification text", min_length=1)
    document_id: Optional[str] = Field(None, description="Optional custom document or tender ID")
    document_title: Optional[str] = Field(None, description="Optional tender title")


class VerificationResponse(BaseModel):
    """Cryptographic verification response payload."""
    valid: bool
    sha256_digest: str
    document_id: Optional[str] = None
    document_title: Optional[str] = None
    gate_status: Optional[str] = None
    generated_at: Optional[str] = None
    findings_count: int = 0
    verification_authority: str = "Bureau of Indian Standards / MaanakSetu Sovereign Engine"


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

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="Audit_Dossier_{document_id}.pdf"',
            "X-SHA256-Digest": result.sha256_digest,
            "X-Gate-Status": result.gate_status.value,
        },
    )


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

    # Collect all cited and replacement standards
    root_standards: List[str] = []
    for f in result.findings:
        if f.detected_entity.startswith("IS"):
            root_standards.append(f.detected_entity)
        if f.replacement_standard and f.replacement_standard.startswith("IS"):
            root_standards.append(f.replacement_standard)

    if not root_standards:
        root_standards = ["IS 456:2000", "IS 1786:2008"]

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
