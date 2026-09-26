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

    def __init__(self, db: sqlite3.Connection):
        self.db = db

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
