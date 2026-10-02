"""FastAPI Route Handlers for MaanakSetu Regulatory Service."""

from __future__ import annotations

import datetime
import re
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from pydantic import BaseModel, Field

from maanaksetu.adapters.ai.config import OMNIROUTE_WORKLOAD_CHAT
from maanaksetu.adapters.ai.omniroute import OmniRouteClient
from maanaksetu.adapters.api.cache import AuditCache
from maanaksetu.adapters.dossier import compile_dossier
from maanaksetu.domain.models import AuditResult, Finding, StandardEdition
from maanaksetu.domain.states import DecisionState, ReviewState
from maanaksetu.engine.orchestrator import AuditPipeline, compute_state_digest
from maanaksetu.knowledge.graph import export_subgraph_for_flow
from maanaksetu.knowledge.rag_assistant import call_cloud_or_local_llm, rag_engine
from maanaksetu.knowledge.repository import get_standard_edition, list_standards

router = APIRouter(tags=["Audit Gateway"])



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


class AssistantMessage(BaseModel):
    """Conversational message in the procurement copilot thread."""
    role: str = Field(..., description="'user', 'assistant', or 'system'")
    content: str = Field(..., description="Message text content", max_length=10000)


class AssistantChatRequest(BaseModel):
    """Procurement copilot query payload."""
    messages: List[AssistantMessage] = Field(..., description="Conversation history")
    document_id: Optional[str] = Field(None, description="Optional active tender context")
    context: Optional[str] = Field(None, description="Optional supplementary context", max_length=10000)


class AssistantChatResponse(BaseModel):
    """Procurement copilot response payload."""
    reply: str
    model_used: str
    citations: List[str] = Field(default_factory=list)



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
    "/standards",
    response_model=List[StandardEdition],
    summary="List Standards Catalog",
    description="Enumerates authoritative standards stored in the knowledge base.",
)
async def get_standards_catalog(
    status: Optional[str] = Query(None, description="Optional status filter: ACTIVE, SUPERSEDED, WITHDRAWN"),
    pipeline: AuditPipeline = Depends(get_pipeline),
) -> List[StandardEdition]:
    return list_standards(pipeline.db, status=status)


@router.get(
    "/standards/{is_number:path}",
    response_model=StandardEdition,
    summary="Get Standard Detail Knowledge Card",
    description="Retrieves the complete authoritative standard specification, scope boundary, amendments, and constraints.",
)
async def get_standard_detail(
    is_number: str,
    pipeline: AuditPipeline = Depends(get_pipeline),
) -> StandardEdition:
    std = get_standard_edition(pipeline.db, is_number)
    if not std:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Standard '{is_number}' not found in authoritative catalog.",
        )
    return std


def _generate_deterministic_assistant_reply(
    query: str,
    doc_result: Optional[AuditResult] = None,
) -> tuple[str, list[str]]:
    q_lower = query.lower()
    citations = []

    if any(k in q_lower for k in ["brand", "ultratech", "acc", "144(i)", "vendor lock", "proprietary", "monopoly"]):
        citations = ["GFR 2017 Rule 144(i)", "CVC Circular No. 04/03/2018", "DoE Procurement Manual 2024"]
        reply = (
            "Under **General Financial Rules (GFR) 2017, Rule 144(i)** ('Fundamental Principles of Public Buying'), "
            "technical specifications in public tenders must be formulated in terms of performance and functional characteristics, "
            "and **must not cite proprietary brand or trade names** (such as UltraTech, ACC, Tata, Jindal, etc.).\n\n"
            "Key statutory mandates:\n"
            "1. **Anti-Monopoly Requirement:** Citing specific brand names without adding *'or equivalent'* and without prior recorded statutory justification violates fair competition principles and exposes the procurement officer to Central Vigilance Commission (CVC) inquiry.\n"
            "2. **Prescribed Formulation:** Specifications must specify standard Indian Standards (e.g., *'Ordinary Portland Cement conforming to IS 269:2015 with valid BIS ISI certification'*) rather than OEM trade names.\n"
            "3. **Remedial Action:** Issue an immediate Corrigendum under GFR Rule 173(v) on GeM/CPPP withdrawing the proprietary brand citations and substituting them with functional BIS parameters."
        )
        return reply, citations

    if any(k in q_lower for k in ["269:1989", "269:2015", "is 269", "cement grade", "superseded"]):
        citations = ["Gazette of India S.O. 1899(E)", "BIS IS 269:2015 (Sixth Revision)", "DPIIT Cement QCO 2020"]
        reply = (
            "**IS 269:1989** was superseded and formally withdrawn by the Bureau of Indian Standards in 2015 upon the gazetting of **IS 269:2015 (Sixth Revision)**.\n\n"
            "Key distinctions:\n"
            "1. **Consolidation of Grades:** Prior to 2015, 33 Grade (IS 269), 43 Grade (IS 8112), and 53 Grade (IS 12269) existed as separate standards. IS 269:2015 consolidated all ordinary Portland cement grades into a single unified standard.\n"
            "2. **Statutory Non-Compliance:** Any tender published after 2016 citing IS 269:1989 is legally invalid under Section 16 of the BIS Act 2016 and DPIIT Cement Quality Control Orders.\n"
            "3. **Corrigenda Requirement:** Replace all citations of `IS 269:1989` with `IS 269:2015` and specify the grade designation (e.g., OPC 43 or OPC 53) in conformance with Table 2 parameters."
        )
        return reply, citations

    if any(k in q_lower for k in ["corrigendum", "corrigenda", "gem", "cppp", "rule 173", "notice"]):
        citations = ["GFR 2017 Rule 173(v)", "GeM General Terms & Conditions v4.0", "CVC Tender Guidelines"]
        reply = (
            "To draft and publish an official statutory Corrigendum on the Government e-Marketplace (GeM) or Central Public Procurement Portal (CPPP):\n\n"
            "1. **Statutory Notice Period (GFR Rule 173(v)):** If amending technical specifications, the bid submission deadline must be extended by at least 7 to 15 days to ensure equitable bidder participation.\n"
            "2. **Drafting Structure:**\n"
            "   - **Reference:** Original Tender ID & Bid Document Reference.\n"
            "   - **Clause Modification Table:** Column 1: *'Original Clause (Withdrawn)'*, Column 2: *'Substituted Clause (Conforming to BIS/QCO)'*.\n"
            "   - **Authority Signature:** Attested by the Competent Procurement Authority with date and digital certificate.\n"
            "3. **MaanakSetu One-Click Export:** You can directly copy the auto-generated redline amendment from the *Corrigenda Studio* or export the complete publication-grade PDF Dossier."
        )
        return reply, citations

    if any(k in q_lower for k in ["sha-256", "digest", "hash", "audit integrity", "tamper", "verification"]):
        citations = ["IT Act 2000 Section 3", "BIS Act 2016 Enforcement Protocol", "CVC Digital Audit Guidelines"]
        reply = (
            "The **SHA-256 State Digest** in MaanakSetu provides cryptographic proof of audit authenticity and non-repudiation:\n\n"
            "1. **Deterministic Fingerprinting:** Every segment analyzed, rule evaluation AST result, cascading dependency path, and human officer adjudication note is concatenated into a canonical payload and hashed with SHA-256.\n"
            "2. **Tamper-Evidence:** If a bidder or corrupt official alters even a single clause, character, or gate decision post-audit, the resulting hash changes entirely.\n"
            "3. **Independent Public Verification:** Anyone (CAG auditors, vigilance officers, or bidders) can paste the 64-character hash into the *Verify Audit Digest* dialog (`GET /api/verify/{digest}`) to verify that the tender specification was formally evaluated and unaltered."
        )
        return reply, citations

    if doc_result:
        citations = ["MaanakSetu Audit Engine", f"Tender: {doc_result.document_id}"]
        findings_summary = ", ".join(f"{f.violation_type.value}: {f.detected_entity}" for f in doc_result.findings[:3])
        reply = (
            f"**Tender Audit Context for '{doc_result.document_id}':**\n\n"
            f"- **Gate Decision:** `{doc_result.gate_status.value}`\n"
            f"- **Requirements Evaluated:** {doc_result.summary.total_requirements_evaluated} clauses across {doc_result.total_segments_analyzed} segments.\n"
            f"- **Key Findings:** {findings_summary or 'All cited standards verified conformant.'}\n"
            f"- **Cryptographic Digest:** `{doc_result.sha256_digest[:16]}...`\n\n"
            "As the Procurement Officer, ensure all actionable defect clauses are substituted via the Corrigenda Studio prior to publishing this tender on GeM."
        )
        return reply, citations

    # Default general guidance
    citations = ["BIS Act 2016", "GFR 2017", "MaanakSetu Workstation Guide"]
    reply = (
        "I am your **MaanakSetu Procurement Assistant**, grounded in the Bureau of Indian Standards (BIS) Act 2016, "
        "General Financial Rules (GFR 2017), and Central Vigilance Commission (CVC) statutory procurement directives.\n\n"
        "I can assist you with:\n"
        "1. **Regulatory Conflict Triage:** Identifying withdrawn standards (e.g., IS 269:1989) or superseded editions.\n"
        "2. **GFR 144(i) Anti-Monopoly Compliance:** Detecting prohibited proprietary brand names and vendor lock-in.\n"
        "3. **Quality Control Orders (QCOs):** Verifying mandatory BIS Standard Mark requirements.\n"
        "4. **Corrigenda Drafting:** Generating legally defensible amendment notices for GeM and CPPP.\n"
        "5. **SHA-256 Audit Verification:** Validating tamper-evident dossiers for audit clearance.\n\n"
        "How may I assist with your procurement evaluation?"
    )
    return reply, citations


@router.post(
    "/assistant/chat",
    response_model=AssistantChatResponse,
    summary="Procurement Assistant Copilot",
    description="Conversational procurement copilot powered by RAG knowledge engine and LLM fallback.",
)
async def assistant_chat(
    payload: AssistantChatRequest,
    request: Request,
    cache: AuditCache = Depends(get_cache),
) -> AssistantChatResponse:
    doc_result: Optional[AuditResult] = None
    if payload.document_id:
        doc_result = cache.get_by_id(payload.document_id)

    # Extract latest user query
    user_query = ""
    for msg in reversed(payload.messages):
        if msg.role == "user":
            user_query = msg.content
            break

    # 1. RAG Knowledge Retrieval across indexed standards, GFR rules, and architecture
    retrieved_docs = rag_engine.retrieve(user_query, top_k=3)
    citations: List[str] = []
    for d in retrieved_docs:
        citations.extend(d.get("citations", []))

    # 2. Build Enriched System Prompt with retrieved RAG chunks + Active Tender context
    system_prompt = (
        "You are the MaanakSetu Procurement Assistant, an authoritative AI copilot for Indian public procurement officers, "
        "Bureau of Indian Standards (BIS) regulators, and vigilance auditors. "
        "You operate under the Bureau of Indian Standards Act 2016, General Financial Rules (GFR 2017, especially Rule 144(i) on anti-monopoly and Rule 173 on tender procedures), "
        "and Central Vigilance Commission (CVC) guidelines.\n"
        "Provide precise, legally sound, and concise statutory guidance. Always cite specific rules, IS codes, and gazette orders.\n\n"
    )

    if doc_result:
        system_prompt += (
            f"Active Tender Document: ID={doc_result.document_id}, Title='{doc_result.document_title or 'Specification'}', "
            f"GateStatus={doc_result.gate_status.value}. "
            f"Evaluated Requirements: {doc_result.summary.total_requirements_evaluated}.\n"
            f"Detected Defect Findings:\n"
        )
        for f in doc_result.findings:
            system_prompt += (
                f"- [{f.violation_type.value} | {f.severity.value}] Entity: {f.detected_entity}. "
                f"Statutory Basis: {f.statutory_basis}. Replacement: {f.replacement_standard or 'N/A'}. "
                f"Engineering Rationale: {f.engineering_rationale}\n"
            )
        citations.append(f"Tender {doc_result.document_id}")

    if retrieved_docs:
        system_prompt += "\nAuthoritative Background Standards & Regulatory Knowledge Chunks:\n"
        for doc in retrieved_docs:
            system_prompt += f"--- {doc['title']} ---\n{doc['content']}\n"

    if payload.context:
        system_prompt += f"\nAdditional UI Context:\n{payload.context}\n"

    # Convert messages for LLM
    llm_messages = [{"role": m.role, "content": m.content} for m in payload.messages]

    # 3. Multi-Provider LLM Attempt (OmniRoute workload/chat -> Gemini -> Groq -> OpenAI)
    omniroute_client: Optional[OmniRouteClient] = getattr(request.app.state, "omniroute", None)
    llm_result = await call_cloud_or_local_llm(
        messages=llm_messages,
        system_prompt=system_prompt,
        omniroute_client=omniroute_client,
    )

    if llm_result:
        reply_text, model_name = llm_result
        unique_citations = list(dict.fromkeys(citations)) or ["BIS Act 2016", "GFR 2017"]
        return AssistantChatResponse(
            reply=reply_text,
            model_used=model_name,
            citations=unique_citations[:5],
        )

    # 4. Sovereign RAG Knowledge Engine Synthesis (when external LLM is offline or unconfigured)
    rag_reply, rag_citations = rag_engine.synthesize_response(
        query=user_query,
        doc_result=doc_result,
        retrieved_docs=retrieved_docs,
    )
    return AssistantChatResponse(
        reply=rag_reply,
        model_used="maanaksetu/sovereign-rag-engine",
        citations=rag_citations,
    )


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

