"""Integration Test Suite: OmniRoute and TypeSafe (Jev AI) Remote Workloads.

Verifies:
1. TypeSafe Jev AI connectivity, Choice questions, and Noul probability evaluations.
2. OmniRoute Embeddings generation (/v1/embeddings).
3. OmniRoute Neural Reranking (/v1/rerank).
4. OmniRoute Chat & Executive Narrative generation (/v1/chat/completions).
5. StandardsResolver semantic candidate discovery integration.
6. Graceful degradation and fallback when services are unconfigured or offline.
"""

from __future__ import annotations

import sqlite3
import pytest

from maanaksetu.adapters.ai import (
    OmniRouteClient,
    TypeSafeClient,
    default_omniroute_client,
    default_typesafe_client,
)
from maanaksetu.domain.models import DocumentSegment
from maanaksetu.domain.states import SegmentCategory
from maanaksetu.engine.discovery.resolver import StandardsResolver
from maanaksetu.engine.ingestion.requirements import extract_requirement
from maanaksetu.knowledge.repository import init_db


@pytest.mark.asyncio
async def test_typesafe_connectivity_and_choice_evaluation():
    """Verify live connectivity to TypeSafe Jev System One API and Choice primitive."""
    client = default_typesafe_client
    if not client.is_configured:
        pytest.skip("TypeSafe API key not configured")

    state_text = (
        "Clause 4.2: Design and construction of 4-lane prestressed concrete road bridge girders "
        "and deck slabs across river crossing conforming strictly to IS 456:2000."
    )
    questions = {
        "domain_choice": {
            "type": "choice",
            "instructions": "Identify the primary engineering construction domain of this clause.",
            "criteria": {
                "BRIDGE_INFRASTRUCTURE": "Highways, river bridges, flyovers, culverts, prestressed girders",
                "ELECTRICAL_SUBSTATION": "Transformers, switchgear, transmission lines",
                "RESIDENTIAL_BUILDING": "Low-rise houses, apartments, interior masonry",
            },
        }
    }

    res = await client.evaluate(state=state_text, questions=questions)
    assert "answers" in res
    assert "domain_choice" in res["answers"]

    ans = res["answers"]["domain_choice"]
    assert ans["type"] == "choice"
    assert ans["choice"] == "BRIDGE_INFRASTRUCTURE"
    assert ans["confidence"] > 0.8
    assert "usage" in res


@pytest.mark.asyncio
async def test_typesafe_noul_condition_evaluation():
    """Verify TypeSafe Jev AI Noul question (calibrated yes/no probability)."""
    client = default_typesafe_client
    if not client.is_configured:
        pytest.skip("TypeSafe API key not configured")

    clause_text = "Foundation concrete work in high sulfate aggressive soil environment (>1.0% SO3 concentration)."
    prob = await client.check_condition(
        text=clause_text,
        condition_question="Does this clause describe severe chemical or sulfate aggressive exposure requiring special cement?",
    )
    assert prob is not None
    assert isinstance(prob, float)
    assert prob > 0.80  # Jev must evaluate high probability for severe sulfate exposure


@pytest.mark.asyncio
async def test_typesafe_segment_classification():
    """Verify TypeSafe classification of technical vs commercial clauses."""
    client = default_typesafe_client
    if not client.is_configured:
        pytest.skip("TypeSafe API key not configured")

    tech_text = "Supply of Fe 500D high strength deformed steel bars with minimum elongation of 16% and yield stress 500 MPa."
    cat, conf = await client.classify_segment(tech_text)
    assert cat == SegmentCategory.TECHNICAL_SPECIFICATION
    assert conf >= 0.7


@pytest.mark.asyncio
async def test_omniroute_embeddings():
    """Verify OmniRoute dense vector embedding generation."""
    client = default_omniroute_client
    if not client.is_configured:
        pytest.skip("OmniRoute not configured")

    texts = [
        "Ordinary Portland Cement conforming to IS 269",
        "High strength deformed steel bars for concrete reinforcement",
    ]
    embeddings = await client.get_embeddings(texts)
    assert len(embeddings) == 2
    assert len(embeddings[0]) > 0
    assert isinstance(embeddings[0][0], float)


@pytest.mark.asyncio
async def test_omniroute_neural_reranking():
    """Verify OmniRoute cross-encoder / neural reranking workload."""
    client = default_omniroute_client
    if not client.is_configured:
        pytest.skip("OmniRoute not configured")

    query = "electrical outdoor distribution transformer with 50% load losses"
    candidate_documents = [
        "IS 456: Code of practice for plain and reinforced concrete",
        "IS 1180: Outdoor type oil immersed distribution transformers up to 2500 kVA",
        "IS 1786: High strength deformed steel bars and wires for concrete reinforcement",
    ]

    results = await client.rerank(query=query, documents=candidate_documents, top_n=3)
    assert len(results) >= 2

    # Top ranked document must be IS 1180 for distribution transformer
    top_hit = results[0]
    assert "IS 1180" in top_hit["document"]
    assert top_hit["relevance_score"] is not None


@pytest.mark.asyncio
async def test_omniroute_narrative_summary():
    """Verify OmniRoute chat completion for executive briefing generation."""
    client = default_omniroute_client
    if not client.is_configured:
        pytest.skip("OmniRoute not configured")

    summary_text = await client.generate_narrative_summary(
        document_id="TND-DEMO-TEST",
        gate_status="STATUTORY_NON_COMPLIANT",
        findings_summary="Clause 1.0 cites obsolete IS 269:1989. Clause 2.0 locks in UltraTech cement proprietary brand.",
    )
    assert summary_text is not None
    assert len(summary_text) > 20
    assert "STATUTORY_NON_COMPLIANT" in summary_text or "statutory" in summary_text.lower() or "non-compliant" in summary_text.lower()


def test_semantic_standards_discovery_integration(memory_db: sqlite3.Connection):
    """Verify StandardsResolver uses OmniRoute reranker to resolve unnumbered specifications."""
    resolver = StandardsResolver(memory_db, omniroute_client=default_omniroute_client)

    seg = DocumentSegment(
        segment_id="SEG-LED-01",
        raw_text="Supply and installation of 500 units of 120W LED street lighting luminaires, IP66, for municipal road illumination.",
    )
    req = extract_requirement(seg, requirement_id="REQ-LED-01")

    # Semantic candidate resolution
    candidates = resolver.resolve_candidates_semantic(req, top_k=3)
    assert len(candidates) > 0
    candidate_codes = [c.is_number for c in candidates]

    # Verify IS 10322 or LED luminaire standard is ranked in candidates
    assert any("10322" in code for code in candidate_codes)


@pytest.mark.asyncio
async def test_ai_workloads_graceful_fallback():
    """Verify that unconfigured or offline AI clients degrade gracefully to deterministic fallbacks."""
    offline_omni = OmniRouteClient(base_url="http://localhost:9999/v1", api_key="invalid-key")
    offline_typesafe = TypeSafeClient(base_url="https://api.typesafe.invalid/v1", api_key="invalid-key")

    # 1. Embeddings returns empty without raising
    embs = await offline_omni.get_embeddings(["test"])
    assert embs == []

    # 2. Rerank returns empty without raising
    rerank_res = await offline_omni.rerank("query", ["doc1", "doc2"])
    assert rerank_res == []

    # 3. TypeSafe evaluate returns empty dict without raising
    eval_res = await offline_typesafe.evaluate("test text", {"q": {"type": "noul", "instructions": "test"}})
    assert eval_res == {}

    # 4. StandardsResolver falls back to local FTS5 BM25
    db = init_db(":memory:")
    res = StandardsResolver(db, omniroute_client=offline_omni)
    seg = DocumentSegment(segment_id="SEG-FALLBACK", raw_text="Supply of LED luminaire 120W")
    req = extract_requirement(seg, requirement_id="REQ-FALLBACK")
    candidates = res.resolve_candidates_semantic(req)
    assert isinstance(candidates, list)
