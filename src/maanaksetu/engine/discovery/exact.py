"""Exact Indian Standard citation extraction utilities."""

from __future__ import annotations

import re
from typing import List

# Regular expression to extract IS standard citations (e.g. "IS 269:2015", "IS 456", "IS 1180 (Part 1):2014")
IS_CODE_PATTERN = re.compile(
    r"\b(IS\s+\d+(?:\s*\([^\)]+\))?(?::\d{4})?)\b",
    re.IGNORECASE,
)


def extract_is_codes(text: str) -> List[str]:
    """
    Extract and normalize all Indian Standard citations from raw text.
    Standardizes whitespace e.g. "IS  456 : 2000" -> "IS 456:2000".
    """
    matches = IS_CODE_PATTERN.findall(text)
    normalized: List[str] = []
    seen = set()

    for m in matches:
        cleaned = re.sub(r"\s+", " ", m.strip())
        cleaned = re.sub(r"\s*:\s*", ":", cleaned)
        cleaned = re.sub(r"\s*\(\s*", " (", cleaned)
        cleaned = re.sub(r"\s*\)\s*", ")", cleaned)
        
        # Upper case prefix
        if cleaned.upper().startswith("IS"):
            cleaned = "IS" + cleaned[2:]

        if cleaned not in seen:
            seen.add(cleaned)
            normalized.append(cleaned)

    return normalized
