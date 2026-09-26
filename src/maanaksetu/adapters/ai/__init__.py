"""AI Adapter package for OmniRoute and TypeSafe System One."""

from __future__ import annotations

from maanaksetu.adapters.ai.config import (
    OMNIROUTE_API_KEY,
    OMNIROUTE_BASE_URL,
    TYPESAFE_API_KEY,
    TYPESAFE_BASE_URL,
)
from maanaksetu.adapters.ai.omniroute import OmniRouteClient
from maanaksetu.adapters.ai.typesafe import TypeSafeClient

# Default shared client instances
default_omniroute_client = OmniRouteClient()
default_typesafe_client = TypeSafeClient()

__all__ = [
    "OMNIROUTE_API_KEY",
    "OMNIROUTE_BASE_URL",
    "TYPESAFE_API_KEY",
    "TYPESAFE_BASE_URL",
    "OmniRouteClient",
    "TypeSafeClient",
    "default_omniroute_client",
    "default_typesafe_client",
]
