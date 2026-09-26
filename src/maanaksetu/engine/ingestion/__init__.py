"""Ingestion and Requirement Extraction package (Stage 1)."""

from maanaksetu.engine.ingestion.chunker import (
    chunk_blocks,
    chunk_text,
    ingest_tender,
)
from maanaksetu.engine.ingestion.requirements import (
    detect_product_category,
    extract_parameters,
    extract_requirement,
    extract_requirement_bundle,
)

__all__ = [
    "chunk_blocks",
    "chunk_text",
    "detect_product_category",
    "extract_parameters",
    "extract_requirement",
    "extract_requirement_bundle",
    "ingest_tender",
]
