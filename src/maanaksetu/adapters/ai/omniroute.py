"""OmniRoute AI Multi-Model Routing Client Adapter.

Connects to the local or remote OmniRoute server to execute:
- Text embeddings (/v1/embeddings)
- Semantic re-ranking (/v1/rerank)
- Chat completions (/v1/chat/completions)
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
import httpx

from maanaksetu.adapters.ai.config import (
    OMNIROUTE_API_KEY,
    OMNIROUTE_BASE_URL,
    OMNIROUTE_DEFAULT_CHAT_MODEL,
    OMNIROUTE_DEFAULT_EMBEDDING_MODEL,
    OMNIROUTE_DEFAULT_REASONING_MODEL,
    OMNIROUTE_DEFAULT_RERANKER_MODEL,
    OMNIROUTE_WORKLOAD_AGENT,
    OMNIROUTE_WORKLOAD_FAST,
    OMNIROUTE_WORKLOAD_RAG_SYNTHESIS,
    OMNIROUTE_WORKLOAD_REASONING,
)

logger = logging.getLogger(__name__)


class OmniRouteClient:
    """Client for OmniRoute multi-model API router."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
    ):
        self.base_url = (base_url or OMNIROUTE_BASE_URL).rstrip("/")
        self.api_key = api_key or OMNIROUTE_API_KEY

    @property
    def is_configured(self) -> bool:
        """Check whether base URL and API key are configured."""
        return bool(self.base_url and self.api_key)

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    async def get_embeddings(
        self,
        texts: List[str],
        model: str = OMNIROUTE_DEFAULT_EMBEDDING_MODEL,
        timeout: float = 10.0,
    ) -> List[List[float]]:
        """
        Generate dense vector embeddings for an array of input texts.
        Returns a list of embedding vectors.
        """
        if not self.is_configured or not texts:
            return []

        endpoint = f"{self.base_url}/embeddings"
        payload = {
            "model": model,
            "input": texts,
        }

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.post(endpoint, headers=self._headers(), json=payload)
                if res.status_code == 200:
                    data = res.json().get("data", [])
                    return [item["embedding"] for item in data if "embedding" in item]
                logger.warning(f"OmniRoute embeddings error: {res.status_code} {res.text[:150]}")
                return []
        except Exception as e:
            logger.warning(f"OmniRoute embeddings request failed: {e}")
            return []

    @staticmethod
    def _normalize_rerank_results(results: List[Dict[str, Any]], documents: List[str]) -> List[Dict[str, Any]]:
        """Normalize rerank results across Voyage AI, Cohere, and Jina formats to ensure consistent string document output."""
        normalized: List[Dict[str, Any]] = []
        for item in results:
            idx = item.get("index")
            doc = item.get("document")
            doc_str = ""
            if isinstance(doc, str):
                doc_str = doc
            elif isinstance(doc, dict):
                doc_str = doc.get("text", "")
            elif idx is not None and 0 <= idx < len(documents):
                doc_str = documents[idx]

            normalized.append({
                "index": idx,
                "relevance_score": float(item.get("relevance_score", 0.0)),
                "document": doc_str,
            })
        return normalized

    async def rerank(
        self,
        query: str,
        documents: List[str],
        model: str = OMNIROUTE_DEFAULT_RERANKER_MODEL,
        top_n: Optional[int] = None,
        timeout: float = 10.0,
    ) -> List[Dict[str, Any]]:
        """
        Semantically rerank a list of candidate documents against a query.
        Returns a list of dicts with 'index', 'document', and 'relevance_score' ordered by score descending.
        """
        if not self.is_configured or not query.strip() or not documents:
            return []

        endpoint = f"{self.base_url}/rerank"
        payload: Dict[str, Any] = {
            "model": model,
            "query": query,
            "documents": documents,
        }
        if top_n:
            payload["top_n"] = top_n

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.post(endpoint, headers=self._headers(), json=payload)
                if res.status_code == 200:
                    results = res.json().get("results", [])
                    return self._normalize_rerank_results(results, documents)
                logger.warning(f"OmniRoute rerank error: {res.status_code} {res.text[:150]}")
                return []
        except Exception as e:
            logger.warning(f"OmniRoute rerank request failed: {e}")
            return []

    def rerank_sync(
        self,
        query: str,
        documents: List[str],
        model: str = OMNIROUTE_DEFAULT_RERANKER_MODEL,
        top_n: Optional[int] = None,
        timeout: float = 10.0,
    ) -> List[Dict[str, Any]]:
        """Synchronous wrapper for rerank."""
        if not self.is_configured or not query.strip() or not documents:
            return []

        endpoint = f"{self.base_url}/rerank"
        payload: Dict[str, Any] = {
            "model": model,
            "query": query,
            "documents": documents,
        }
        if top_n:
            payload["top_n"] = top_n

        try:
            with httpx.Client(timeout=timeout) as client:
                res = client.post(endpoint, headers=self._headers(), json=payload)
                if res.status_code == 200:
                    results = res.json().get("results", [])
                    return self._normalize_rerank_results(results, documents)
                logger.warning(f"OmniRoute rerank error: {res.status_code} {res.text[:150]}")
                return []
        except Exception as e:
            logger.warning(f"OmniRoute sync rerank failed: {e}")
            return []

    async def generate_narrative_summary(
        self,
        document_id: str,
        gate_status: str,
        findings_summary: str,
        model: str = OMNIROUTE_DEFAULT_CHAT_MODEL,
        timeout: float = 30.0,
    ) -> Optional[str]:
        """
        Generate an executive narrative summary for the final audit dossier.
        """
        if not self.is_configured:
            return None

        endpoint = f"{self.base_url}/chat/completions"
        system_prompt = (
            "You are a Senior Regulatory Standards Officer for MaanakSetu. "
            "Write a concise, professional 2-sentence executive summary of the tender audit findings. "
            "State the final Gate Status and key technical/statutory risks clearly. "
            "Do not invent facts or numbers not provided."
        )
        user_prompt = (
            f"Document ID: {document_id}\n"
            f"Gate Status: {gate_status}\n"
            f"Audit Details: {findings_summary}\n"
            "Provide the 2-sentence executive summary."
        )
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": 1000,
            "temperature": 0.2,
        }

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.post(endpoint, headers=self._headers(), json=payload)
                if res.status_code == 200:
                    choices = res.json().get("choices", [])
                    if choices:
                        return choices[0].get("message", {}).get("content", "").strip()
                logger.warning(f"OmniRoute completion error: {res.status_code} {res.text[:150]}")
                return None
        except Exception as e:
            logger.warning(f"OmniRoute narrative generation failed: {e}")
            return None

    async def reasoning_audit_analysis(
        self,
        context: str,
        question: str,
        model: str = OMNIROUTE_DEFAULT_REASONING_MODEL,
        timeout: float = 60.0,
    ) -> Optional[str]:
        """
        Deep architectural/logical scrutiny using Tier 1 Frontier reasoning workload (Claude Opus 4.6 Thinking).
        Used for complex conflict analysis, regulatory edge cases, or deep ambiguity scrutiny.
        """
        if not self.is_configured:
            return None

        endpoint = f"{self.base_url}/chat/completions"
        payload = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a Master Standards Regulatory Officer. "
                        "Conduct rigorous, objective logical scrutiny of the standard and regulatory requirements."
                    ),
                },
                {"role": "user", "content": f"Context:\n{context}\n\nRegulatory Inquiry:\n{question}"},
            ],
            "max_tokens": 1000,
            "temperature": 0.1,
        }

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.post(endpoint, headers=self._headers(), json=payload)
                if res.status_code == 200:
                    choices = res.json().get("choices", [])
                    if choices:
                        return choices[0].get("message", {}).get("content", "").strip()
                logger.warning(f"OmniRoute reasoning error: {res.status_code} {res.text[:150]}")
                return None
        except Exception as e:
            logger.warning(f"OmniRoute reasoning request failed: {e}")
            return None

