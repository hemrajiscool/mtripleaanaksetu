"""Master 4-Stage Regulatory Verification Pipeline Orchestrator.

Architecture:
  Stage 1: Ingestion & Requirement Extraction (Docling/PyMuPDF -> DocumentSegment -> Requirement)
  Stage 2: Standards Discovery (Exact Citation + Taxonomy + FTS5 BM25)
  Stage 3: Deterministic Verification (SpecGuard Invariant Verifiers)
  Stage 4: Output Assembly (AuditResult, SHA-256 Digest, Telemetry)
"""

from __future__ import annotations

import datetime
import hashlib
import json
import sqlite3
import time
from typing import Any, Dict, List, Optional, Union
import uuid

import networkx as nx

from maanaksetu.domain.models import (
    AuditResult,
    AuditSummary,
    DependencyAlert,
    DocumentSegment,
    Finding,
    Requirement,
    StandardEdition,
)
from maanaksetu.domain.states import GateStatus
from maanaksetu.engine.discovery.resolver import StandardsResolver
from maanaksetu.engine.ingestion.chunker import ingest_tender
from maanaksetu.engine.ingestion.requirements import extract_requirement
from maanaksetu.engine.verification.verifier import SpecGuardVerifier
from maanaksetu.knowledge.graph import load_normative_graph
from maanaksetu.knowledge.repository import init_db


def compute_state_digest(
    document_id: str,
    segments: Union[List[DocumentSegment], List[str], int],
    findings: List[Finding],
    dependency_alerts: List[DependencyAlert],
    gate_status: GateStatus,
) -> str:
    """Compute an immutable SHA-256 digest over the verified audit state."""
    hasher = hashlib.sha256()

    if isinstance(segments, int):
        seg_count = segments
        seg_texts = []
    elif segments and isinstance(segments[0], DocumentSegment):
        seg_count = len(segments)
        seg_texts = [s.raw_text for s in segments]
    else:
        seg_count = len(segments)
        seg_texts = [str(s) for s in segments]

    payload = {
        "document_id": document_id,
        "gate_status": gate_status.value,
        "segment_count": seg_count,
        "segments": seg_texts,
        "findings": [
            {
                "id": f.finding_id,
                "type": f.violation_type.value,
                "rule": f.rule_id,
                "severity": f.severity.value,
                "decision": f.decision_state.value,
                "review": f.review_state.value,
                "entity": f.detected_entity,
                "replacement": f.replacement_standard or "",
            }
            for f in sorted(findings, key=lambda x: (x.finding_id, x.rule_id, x.violation_type.value))
        ],
        "alerts": [
            {
                "parent": a.parent_is,
                "sub": a.obsolete_sub_ref,
                "status": a.sub_ref_status.value,
            }
            for a in sorted(dependency_alerts, key=lambda x: (x.parent_is, x.obsolete_sub_ref))
        ],
    }
    canonical_bytes = json.dumps(payload, sort_keys=True, ensure_ascii=True).encode("utf-8")
    hasher.update(canonical_bytes)
    return hasher.hexdigest()


class AuditPipeline:
    """Orchestrator for the 4-stage MaanakSetu specification audit pipeline."""

    def __init__(
        self,
        db: Optional[sqlite3.Connection] = None,
        graph: Optional[nx.DiGraph] = None,
        omniroute_client: Optional[Any] = None,
        typesafe_client: Optional[Any] = None,
    ):
        self.db = db if db is not None else init_db()
        self.graph = graph if graph is not None else load_normative_graph(self.db)
        self.omniroute = omniroute_client
        self.typesafe = typesafe_client
        self.resolver = StandardsResolver(self.db, omniroute_client=self.omniroute)
        self.verifier = SpecGuardVerifier(self.db, self.graph)

    async def execute(
        self,
        source: Union[str, List[Dict[str, Any]], List[DocumentSegment]],
        document_id: Optional[str] = None,
        document_title: Optional[str] = None,
    ) -> AuditResult:
        """
        Execute the complete 4-stage regulatory audit pipeline.

        Returns an immutable, fully verified AuditResult backed by 5-node evidence.
        """
        t_pipeline_start = time.perf_counter()
        doc_id = document_id or f"TND-{uuid.uuid4().hex[:8].upper()}"
        doc_title = document_title or f"Tender Specification Audit {doc_id}"

        # ═══════════════════════════════════════════════════════════════
        # STAGE 1: INGESTION & REQUIREMENT EXTRACTION
        # ═══════════════════════════════════════════════════════════════
        t_stage = time.perf_counter()
        segments = ingest_tender(source)

        requirements: List[Requirement] = []
        for s in segments:
            req = extract_requirement(
                s,
                requirement_id=f"REQ-{s.segment_id}",
            )
            requirements.append(req)
        ingestion_ms = (time.perf_counter() - t_stage) * 1000.0

        # ═══════════════════════════════════════════════════════════════
        # STAGE 2: STANDARDS DISCOVERY
        # ═══════════════════════════════════════════════════════════════
        t_stage = time.perf_counter()
        candidate_map: Dict[str, List[StandardEdition]] = {}
        for req in requirements:
            candidates = self.resolver.resolve_candidates(req)
            candidate_map[req.requirement_id] = candidates
        discovery_ms = (time.perf_counter() - t_stage) * 1000.0

        # ═══════════════════════════════════════════════════════════════
        # STAGE 3: DETERMINISTIC INVARIANT VERIFICATION (SpecGuard)
        # ═══════════════════════════════════════════════════════════════
        t_stage = time.perf_counter()
        findings, dependency_alerts, gate_status, summary = self.verifier.verify_specification(
            requirements=requirements,
            candidate_map=candidate_map,
        )
        verification_ms = (time.perf_counter() - t_stage) * 1000.0

        # ═══════════════════════════════════════════════════════════════
        # STAGE 4: OUTPUT & INTEGRITY DIGEST ASSEMBLY
        # ═══════════════════════════════════════════════════════════════
        t_stage = time.perf_counter()
        digest = compute_state_digest(
            document_id=doc_id,
            segments=segments,
            findings=findings,
            dependency_alerts=dependency_alerts,
            gate_status=gate_status,
        )
        output_ms = (time.perf_counter() - t_stage) * 1000.0
        total_ms = (time.perf_counter() - t_pipeline_start) * 1000.0

        telemetry = {
            "total_execution_ms": total_ms,
            "ingestion_ms": ingestion_ms,
            "discovery_ms": discovery_ms,
            "verification_ms": verification_ms,
            "output_ms": output_ms,
            "segments_count": float(len(segments)),
            "requirements_count": float(len(requirements)),
            "findings_count": float(len(findings)),
            "alerts_count": float(len(dependency_alerts)),
        }

        narrative = (
            f"Regulatory audit completed for '{doc_title}' ({doc_id}). "
            f"Evaluated {len(segments)} specification segments across {summary.total_requirements_evaluated} requirements. "
            f"Determined Gate Status: {gate_status.value} with {summary.critical_violations} critical statutory violations, "
            f"{summary.high_violations} technical parameter conflicts, and {len(dependency_alerts)} cascading normative alerts."
        )

        return AuditResult(
            document_id=doc_id,
            document_title=doc_title,
            gate_status=gate_status,
            total_segments_analyzed=len(segments),
            findings=findings,
            cascading_dependency_alerts=dependency_alerts,
            summary=summary,
            sha256_digest=digest,
            generated_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            execution_telemetry=telemetry,
            narrative_summary=narrative,
        )


async def run_pipeline(
    source: Union[str, List[Dict[str, Any]], List[DocumentSegment]],
    document_id: Optional[str] = None,
    document_title: Optional[str] = None,
    db: Optional[sqlite3.Connection] = None,
    graph: Optional[nx.DiGraph] = None,
    omniroute_client: Optional[Any] = None,
    typesafe_client: Optional[Any] = None,
) -> AuditResult:
    """Convenience helper to instantiate and execute the audit pipeline."""
    pipeline = AuditPipeline(
        db=db,
        graph=graph,
        omniroute_client=omniroute_client,
        typesafe_client=typesafe_client,
    )
    return await pipeline.execute(
        source=source,
        document_id=document_id,
        document_title=document_title,
    )
