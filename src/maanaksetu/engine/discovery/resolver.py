"""Standards Discovery and Resolution Engine (Stage 2).

Discovers candidate standard editions for requirements using:
1. Exact citation lookup (IS Code pattern)
2. Product domain taxonomy mapping (Curated Cartridge)
3. Full-Text Search (FTS5 BM25)
"""

from __future__ import annotations

import sqlite3
from typing import Dict, List, Optional, Set

from maanaksetu.domain.models import DocumentSegment, Requirement, StandardEdition
from maanaksetu.engine.discovery.exact import extract_is_codes
from maanaksetu.knowledge.repository import (
    get_standard_edition,
    get_standard_family_editions,
    search_standards_fts,
)


class StandardsResolver:
    """Resolves cited and contextual candidate standards from the knowledge base."""

    # Canonical product domain taxonomy to active standard editions
    TAXONOMY_MAP = {
        "distribution_transformer": ["IS 1180 (Part 1):2014"],
        "insulating_oil": ["IS 335:2018"],
        "steel_reinforcement": ["IS 1786:2008"],
        "led_luminaire": ["IS 10322 (Part 5/Sec 3):2012"],
        "cement": ["IS 269:2015"],
        "structural_concrete": ["IS 456:2000"],
    }

    def __init__(
        self,
        db: sqlite3.Connection,
        omniroute_client: Optional[Any] = None,
    ):
        self.db = db
        self.omniroute = omniroute_client

    def resolve_candidates(self, requirement: Requirement) -> List[StandardEdition]:
        """
        Discover candidate StandardEdition records for a given requirement.
        Prioritizes:
          1. Explicit standard citations in text
          2. Product domain taxonomy mapping
          3. FTS5 BM25 lexical discovery
        """
        candidates: List[StandardEdition] = []
        seen_codes: Set[str] = set()

        # Channel 1: Explicit citations in requirement or raw text
        cited = requirement.cited_standards or extract_is_codes(requirement.raw_text)
        for code in cited:
            # 1a. Try exact edition match
            ed = get_standard_edition(self.db, code)
            if ed and ed.is_number not in seen_codes:
                candidates.append(ed)
                seen_codes.add(ed.is_number)

            # 1b. Try family prefix match if unversioned (e.g. "IS 269" -> ["IS 269:2015", "IS 269:1989"])
            if not ed:
                family_eds = get_standard_family_editions(self.db, code)
                for f_ed in family_eds:
                    if f_ed.is_number not in seen_codes:
                        candidates.append(f_ed)
                        seen_codes.add(f_ed.is_number)

        # Channel 2: Product Taxonomy mapping (if no exact citations resolved or unnumbered spec)
        if requirement.product_name in self.TAXONOMY_MAP:
            for mapped_code in self.TAXONOMY_MAP[requirement.product_name]:
                ed = get_standard_edition(self.db, mapped_code)
                if ed and ed.is_number not in seen_codes:
                    candidates.append(ed)
                    seen_codes.add(ed.is_number)

        # Channel 3: FTS5 Lexical Search (if still no candidate resolved)
        if not candidates:
            fts_hits = search_standards_fts(self.db, requirement.raw_text, limit=2)
            for hit in fts_hits:
                code = hit["is_number"]
                ed = get_standard_edition(self.db, code)
                if ed and ed.is_number not in seen_codes:
                    candidates.append(ed)
                    seen_codes.add(ed.is_number)

        return candidates

    def resolve_candidates_semantic(
        self,
        requirement: Requirement,
        candidate_pool: Optional[List[StandardEdition]] = None,
        top_k: int = 3,
    ) -> List[StandardEdition]:
        """
        Stage 2 (Semantic Extension): Use OmniRoute neural reranker to score candidate standards.
        Falls back cleanly to lexical/taxonomy discovery if OmniRoute is unconfigured or returns empty.
        """
        if not self.omniroute or not getattr(self.omniroute, "is_configured", False):
            return self.resolve_candidates(requirement)

        if not candidate_pool:
            cursor = self.db.execute("SELECT is_number, title FROM standards_catalog WHERE status = 'ACTIVE';")
            catalog_rows = cursor.fetchall()
            doc_map = {f"{r['is_number']}: {r['title']}": r['is_number'] for r in catalog_rows}
        else:
            doc_map = {f"{s.is_number}: {s.title}": s.is_number for s in candidate_pool}

        documents = list(doc_map.keys())
        rerank_results = self.omniroute.rerank_sync(
            query=requirement.raw_text,
            documents=documents,
            top_n=top_k,
        )

        ranked_editions: List[StandardEdition] = []
        for res in rerank_results:
            doc_text = res.get("document", "")
            is_num = doc_map.get(doc_text)
            if is_num:
                ed = get_standard_edition(self.db, is_num)
                if ed:
                    ranked_editions.append(ed)

        return ranked_editions or self.resolve_candidates(requirement)

