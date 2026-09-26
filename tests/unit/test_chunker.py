"""Unit tests for document segmenter and clause chunker."""

import pytest

from maanaksetu.domain.models import DocumentSegment
from maanaksetu.domain.states import SegmentCategory
from maanaksetu.engine.ingestion.chunker import (
    categorize_segment,
    chunk_blocks,
    chunk_text,
    ingest_tender,
)


def test_chunk_standard_numbered_clauses():
    text = (
        "Clause 1.0: Scope and Objectives\n"
        "This specification covers the civil works.\n\n"
        "Clause 2.1: Materials\n"
        "All cement shall conform to IS 269:2015.\n\n"
        "Clause 3.4.1 - Steel Reinforcement\n"
        "TMT steel rebar shall conform to IS 1786:2008."
    )
    segments = chunk_text(text)
    assert len(segments) == 3
    assert segments[0].segment_number == "1.0"
    assert segments[1].segment_number == "2.1"
    assert segments[2].segment_number == "3.4.1"


def test_chunk_carriage_returns_and_tabs():
    text = "Clause 1.0:\tGeneral Requirements\r\n\r\nClause 2.0:\t\tPayment terms shall be net 30 days."
    segments = chunk_text(text)
    assert len(segments) == 2
    assert "\r" not in segments[0].raw_text
    assert segments[1].category == SegmentCategory.COMMERCIAL_TERMS


def test_chunk_blocks_with_bounding_boxes():
    blocks = [
        {
            "text": "Clause 4.1: Technical parameters for distribution transformers.",
            "page": 2,
            "bbox": {"x0": 50.0, "y0": 100.0, "x1": 500.0, "y1": 140.0},
            "clause_number": "4.1",
        },
        {
            "text": "Clause 4.2: Total losses at 50% load shall not exceed 80 W.",
            "page": 2,
            "bbox": {"x0": 50.0, "y0": 150.0, "x1": 500.0, "y1": 180.0},
            "clause_number": "4.2",
        },
    ]
    segments = chunk_blocks(blocks)
    assert len(segments) == 2
    assert segments[0].page_number == 2
    assert segments[0].bounding_box == {"x0": 50.0, "y0": 100.0, "x1": 500.0, "y1": 140.0}
    assert segments[1].segment_number == "4.2"


def test_category_detection():
    assert categorize_segment("The contractor must submit Earnest Money Deposit (EMD) of Rs 5 Lakhs") == SegmentCategory.COMMERCIAL_TERMS
    assert categorize_segment("Bidder must have average annual financial turnover of at least 10 Crores") == SegmentCategory.ELIGIBILITY_CRITERIA
    assert categorize_segment("The compressive strength of concrete shall be 43 MPa conforming to IS 456") == SegmentCategory.TECHNICAL_SPECIFICATION
    assert categorize_segment("The last date of submission of bids is 15th October 2026") == SegmentCategory.ADMINISTRATIVE


def test_universal_ingest_tender():
    # String input
    s1 = ingest_tender("1.0 First clause.\n\n2.0 Second clause.")
    assert len(s1) == 2

    # Pre-segmented DocumentSegment list input
    s2 = ingest_tender(s1)
    assert len(s2) == 2
    assert s2[0] is s1[0]

    # Block dict list input
    s3 = ingest_tender([{"text": "Block clause 1.0", "page": 1}])
    assert len(s3) == 1

    # Empty input
    assert ingest_tender("") == []
    assert ingest_tender([]) == []
