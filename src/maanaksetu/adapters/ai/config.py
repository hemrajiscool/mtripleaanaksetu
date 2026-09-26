"""Configuration settings for OmniRoute and TypeSafe AI workloads."""

from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv

# Search for .env in project root
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
_ENV_FILE = _PROJECT_ROOT / ".env"
if _ENV_FILE.exists():
    load_dotenv(dotenv_path=_ENV_FILE)
else:
    load_dotenv()

OMNIROUTE_BASE_URL = os.getenv("OMNIROUTE_BASE_URL", "http://localhost:20128/v1").rstrip("/")
OMNIROUTE_API_KEY = os.getenv("OMNIROUTE_API_KEY", "")
TYPESAFE_BASE_URL = os.getenv("TYPESAFE_BASE_URL", "https://api.typesafe.ai/v1").rstrip("/")
TYPESAFE_API_KEY = os.getenv("TYPESAFE_API_KEY", "")

# Default model definitions
OMNIROUTE_DEFAULT_EMBEDDING_MODEL = os.getenv("OMNIROUTE_EMBEDDING_MODEL", "jina-ai/jina-embeddings-v5-text-small")
OMNIROUTE_DEFAULT_RERANKER_MODEL = os.getenv("OMNIROUTE_RERANKER_MODEL", "jina-ai/jina-reranker-v2-base-multilingual")
OMNIROUTE_DEFAULT_CHAT_MODEL = os.getenv("OMNIROUTE_CHAT_MODEL", "gemini/gemini-2.5-flash")
TYPESAFE_DEFAULT_MODEL = os.getenv("TYPESAFE_MODEL", "jev-latest")
