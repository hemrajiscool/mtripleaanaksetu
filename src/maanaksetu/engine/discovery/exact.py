"""Domain-Agnostic Standard Citation Extraction Utilities."""

from __future__ import annotations

import re
from typing import List

# Regular expression to extract standard citations across multiple standard bodies
# e.g. "IS 269:2015", "ISO 9001:2015", "IEC 60076", "ASTM A615", "EN 1992", "IRC:112:2020"
# Requires numeric standard designators to avoid false positives on words like "ISI" mark
STANDARD_CODE_PATTERN = re.compile(
    r"\b("
    r"IS\s+\d+(?:\s*\([^\)]+\))?(?::\d{4})?"
    r"|(?:ISO|IEC|EN|BS|DIN|IEEE)(?:/(?:ISO|IEC|EN))?\s*[:\-]?\s*\d+[A-Za-z0-9\-_]*(?:\s*\([^\)]+\))?(?::\d{4})?"
    r"|IRC\s*[:\-]?\s*\d+[A-Za-z0-9\-_]*(?::\d{4})?"
    r"|ASTM\s+[A-Z]\d+[A-Za-z0-9\-_]*(?::\d{4})?"
    r")\b",
    re.IGNORECASE,
)

IS_CODE_PATTERN = STANDARD_CODE_PATTERN


def extract_standard_citations(text: str) -> List[str]:
    """
    Extract and normalize standard citations (IS, ISO, IEC, ASTM, etc.) from raw text.
    Standardizes whitespace, separators, and capitalization.
    """
    matches = STANDARD_CODE_PATTERN.findall(text)
    normalized: List[str] = []
    seen = set()

    for m in matches:
        cleaned = re.sub(r"\s+", " ", m.strip())
        cleaned = re.sub(r"\s*:\s*", ":", cleaned)
        cleaned = re.sub(r"\s*\(\s*", " (", cleaned)
        cleaned = re.sub(r"\s*\)\s*", ")", cleaned)

        # Upper case prefix (e.g. is 456 -> IS 456, iso 9001 -> ISO 9001)
        parts = cleaned.split(" ", 1)
        if len(parts) == 2:
            prefix, rest = parts
            cleaned = f"{prefix.upper()} {rest}"
        elif ":" in cleaned:
            parts = cleaned.split(":", 1)
            cleaned = f"{parts[0].upper()}:{parts[1]}"

        if cleaned not in seen:
            seen.add(cleaned)
            normalized.append(cleaned)

    return normalized


# Backward compatibility alias
extract_is_codes = extract_standard_citations
