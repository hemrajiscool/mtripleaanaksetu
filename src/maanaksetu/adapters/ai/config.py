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

# Canonical OmniRoute Workload Abstractions (from OMNIROUTE_WORKLOAD_ENGINEERING_MANUAL.md)
# Section 3: Never use raw provider model names or dynamic auto/* routes.
# Always use the curated workload routes backed by Tier 1 Frontier models.
OMNIROUTE_WORKLOAD_RAG_SYNTHESIS = "workload/rag-synthesis"  # Primary: Tier 1 agy/gemini-3.8-flash-high (1M+ context grounded QA)
OMNIROUTE_WORKLOAD_REASONING = "workload/reasoning"          # Primary: Tier 1 agy/claude-opus-4-6-thinking (formal logic & deep scrutiny)
OMNIROUTE_WORKLOAD_AGENT = "workload/agent"                  # Primary: Tier 1 agy/claude-sonnet-4-6 (autonomous tool execution)
OMNIROUTE_WORKLOAD_CODING = "workload/coding"                # Primary: Tier 1 agy/claude-sonnet-4-6 (software engineering)
OMNIROUTE_WORKLOAD_FAST = "workload/fast"                    # Primary: Tier 2 github/gpt-4o-mini (sub-second extraction & intent routing)
OMNIROUTE_WORKLOAD_CHAT = "workload/chat"                    # Primary: Tier 1 agy/gemini-3.8-flash-high (low-TTFT conversational)

# Native Cross-Encoder Rerank Model (/v1/rerank) - Highest benchmark precision per Manual Section 4
OMNIROUTE_DEFAULT_RERANKER_MODEL = os.getenv("OMNIROUTE_RERANKER_MODEL", "voyage-ai/rerank-2.5")

# Dense Vector Embedding Model (/v1/embeddings)
OMNIROUTE_DEFAULT_EMBEDDING_MODEL = os.getenv("OMNIROUTE_EMBEDDING_MODEL", "voyage-ai/voyage-3.5-lite")

# Default Executive Narrative & Synthesis Workload (Tier 1 Gemini 3.8 Flash High)
OMNIROUTE_DEFAULT_CHAT_MODEL = os.getenv("OMNIROUTE_CHAT_MODEL", OMNIROUTE_WORKLOAD_RAG_SYNTHESIS)
OMNIROUTE_DEFAULT_REASONING_MODEL = os.getenv("OMNIROUTE_REASONING_MODEL", OMNIROUTE_WORKLOAD_REASONING)

TYPESAFE_DEFAULT_MODEL = os.getenv("TYPESAFE_MODEL", "jev-latest")

