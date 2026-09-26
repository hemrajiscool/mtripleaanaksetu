"""Strict 5-node Evidence Provenance Tuple Builder for MaanakSetu.

Enforces the Architectural Invariant:
E = <FindingId, RuleId, KnowledgeFactRef, RequirementRef, SourceSegmentRef>
"""

from __future__ import annotations

from typing import Any, Dict, Optional

from maanaksetu.domain.models import Evidence


class EvidenceBuilder:
    """Builder enforcing the 5-node evidence provenance tuple and completeness invariant."""

    @staticmethod
    def build(
        finding_id: str,
        rule_id: str,
        knowledge_fact_ref: str,
        requirement_ref: str,
        source_segment_ref: str,
        statutory_or_technical_basis: str,
        fact_payload: Optional[Dict[str, Any]] = None,
        source_segment_text: str = "",
    ) -> Evidence:
        """
        Build an immutable Evidence record.
        Raises ValueError if any of the mandatory 5 nodes are missing (Completeness Invariant).
        """
        if not finding_id:
            raise ValueError("Evidence invariant failure: finding_id cannot be empty.")
        if not rule_id:
            raise ValueError("Evidence invariant failure: rule_id cannot be empty.")
        if not knowledge_fact_ref:
            raise ValueError("Evidence invariant failure: knowledge_fact_ref cannot be empty.")
        if not requirement_ref:
            raise ValueError("Evidence invariant failure: requirement_ref cannot be empty.")
        if not source_segment_ref:
            raise ValueError("Evidence invariant failure: source_segment_ref cannot be empty.")

        return Evidence(
            finding_id=finding_id,
            rule_id=rule_id,
            knowledge_fact_ref=knowledge_fact_ref,
            requirement_ref=requirement_ref,
            source_segment_ref=source_segment_ref,
            statutory_or_technical_basis=statutory_or_technical_basis,
            fact_payload=fact_payload or {},
            source_segment_text=source_segment_text,
        )
