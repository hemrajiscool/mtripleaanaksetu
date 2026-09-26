"""Citation resolution policies for standard citations."""

from __future__ import annotations

from enum import Enum
from typing import Optional
from pydantic import BaseModel


class CitationResolutionPolicy(str, Enum):
    """Governing policy for resolving unversioned standard citations (e.g. 'IS 456')."""
    LATEST_ACTIVE_DEFAULT = "LATEST_ACTIVE_DEFAULT"
    STRICT_EDITION_REQUIRED = "STRICT_EDITION_REQUIRED"
    TENDER_DATE_GOVERNED = "TENDER_DATE_GOVERNED"


class DomainPolicyConfig(BaseModel):
    """Domain-level resolution configuration."""
    citation_policy: CitationResolutionPolicy = CitationResolutionPolicy.LATEST_ACTIVE_DEFAULT
    tender_publication_date: Optional[str] = None
    allow_informational_recommendations: bool = True
