"""Universal Document Segmenter and Clause Chunker (Stage 1 Ingestion).

Transforms raw specification text or structured document blocks into normalized
DocumentSegment objects with numbering, spatial metadata, and clean text.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional, Union

from maanaksetu.domain.models import DocumentSegment
from maanaksetu.domain.states import SegmentCategory

# Matches clause headers like:
# "Clause 4.2:", "Clause 4.2.1 -", "Section 12:", "4.2", "1.0", "Para 3.1"
CLAUSE_SPLIT_REGEX = re.compile(
    r"(?=(?:^|\n+)(?:(?:Clause|Section|Para|Item)\s+)?(?:\d+(?:\.\d+)*\b[:\-\.\s])|(?<=[.!?])\s+(?:Clause|Section|Para|Item)\s+(?:\d+(?:\.\d+)*\b[:\-\.\s]))",
    re.IGNORECASE | re.MULTILINE,
)

CLAUSE_NUM_REGEX = re.compile(
    r"(?:(?:Clause|Section|Para|Item)\s+)?(\d+(?:\.\d+)*)",
    re.IGNORECASE,
)


def chunk_text(raw_text: str) -> List[DocumentSegment]:
    """
    Split raw unstructured specification text into structured DocumentSegment objects.
    Resilient to diverse formatting: numbered clauses, bullet points, and plain paragraphs.
    """
    if not raw_text or not raw_text.strip():
        return []

    # Clean text: normalize carriage returns and tabs
    cleaned = raw_text.replace("\r\n", "\n").replace("\r", "\n")
    cleaned = re.sub(r"[ \t]+", " ", cleaned).strip()

    # Split on clause boundary markers
    chunks = CLAUSE_SPLIT_REGEX.split(cleaned)
    raw_segments = [c.strip() for c in chunks if c and c.strip()]

    # Fallback to double newline split if regex did not segment
    if len(raw_segments) <= 1 and "\n\n" in cleaned:
        raw_segments = [p.strip() for p in cleaned.split("\n\n") if p.strip()]

    # If still single block, use the entire text as a single segment
    if not raw_segments:
        raw_segments = [cleaned]

    segments: List[DocumentSegment] = []
    for idx, seg_text in enumerate(raw_segments, start=1):
        # Extract clause number if present at beginning of segment
        first_line = seg_text.split("\n")[0][:50]
        match = CLAUSE_NUM_REGEX.search(first_line)
        clause_num = match.group(1) if match else f"{idx}.0"

        # Categorize functional domain heuristically
        category = categorize_segment(seg_text)

        segments.append(
            DocumentSegment(
                segment_id=f"SEG-{idx:03d}",
                segment_number=clause_num,
                raw_text=seg_text,
                page_number=1,
                bounding_box=None,
                category=category,
            )
        )

    return segments


def chunk_blocks(blocks: List[Dict[str, Any]]) -> List[DocumentSegment]:
    """
    Transform pre-parsed document blocks (e.g. from Docling, PyMuPDF, or OCR)
    into normalized DocumentSegment objects with page numbers and geometry bounds.
    """
    segments: List[DocumentSegment] = []

    for idx, b in enumerate(blocks, start=1):
        text = b.get("text", "").strip()
        if not text:
            continue

        page = int(b.get("page", 1))
        bbox = b.get("bbox") or b.get("bounding_box")
        c_num = b.get("clause_number") or b.get("number")

        if not c_num:
            first_line = text.split("\n")[0][:40]
            m = CLAUSE_NUM_REGEX.search(first_line)
            c_num = m.group(1) if m else f"{idx}.0"

        category = categorize_segment(text)

        segments.append(
            DocumentSegment(
                segment_id=b.get("segment_id", f"SEG-{idx:03d}"),
                segment_number=c_num,
                raw_text=text,
                page_number=page,
                bounding_box=bbox,
                category=category,
            )
        )

    return segments


def categorize_segment(text: str) -> SegmentCategory:
    """Heuristically infer segment category from keyword presence."""
    t = text.lower()

    if any(k in t for k in ("submission of bid", "date of submission", "last date", "date of opening", "tender fee", "validity of offer", "corrigendum", "pre-bid meeting", "closing date")):
        return SegmentCategory.ADMINISTRATIVE

    if any(k in t for k in ("earnest money", "emd", "security deposit", "payment terms", "penalty", "liquidated damages", "billing", "gst", "invoice")):
        return SegmentCategory.COMMERCIAL_TERMS

    if any(k in t for k in ("turnover", "experience", "similar works", "joint venture", "eligibility", "qualification", "blacklist", "debarred")):
        return SegmentCategory.ELIGIBILITY_CRITERIA

    if any(k in t for k in ("shall conform to", "grade", "compressive strength", "yield stress", "specification", "technical parameter", "tolerance")) or re.search(r"\bis\s*\d+", t):
        return SegmentCategory.TECHNICAL_SPECIFICATION

    return SegmentCategory.TECHNICAL_SPECIFICATION


def ingest_tender(
    source: Union[str, List[Dict[str, Any]], List[DocumentSegment]],
) -> List[DocumentSegment]:
    """Universal ingestion entry point accepting string, block list, or pre-segmented objects."""
    if isinstance(source, list):
        if not source:
            return []
        if isinstance(source[0], DocumentSegment):
            return source
        if isinstance(source[0], dict):
            return chunk_blocks(source)
    if isinstance(source, str):
        return chunk_text(source)
    return []
