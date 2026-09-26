"""Pytest fixtures for MaanakSetu test suite."""

from __future__ import annotations

import sqlite3
from typing import AsyncGenerator
import pytest
from httpx import ASGITransport, AsyncClient

from maanaksetu.adapters.api.main import create_app, preseed_demo_tenders
from maanaksetu.knowledge.graph import load_normative_graph
from maanaksetu.knowledge.repository import init_db


@pytest.fixture
def memory_db() -> sqlite3.Connection:
    """Provide an in-memory SQLite database pre-populated with authoritative seeds."""
    conn = init_db(":memory:")
    yield conn
    conn.close()


@pytest.fixture
def normative_graph(memory_db: sqlite3.Connection):
    """Provide a loaded NetworkX normative reference graph."""
    return load_normative_graph(memory_db)


@pytest.fixture
async def test_app():
    """FastAPI app instance with in-memory DB and pre-seeded demo audits."""
    app = create_app(":memory:")
    await preseed_demo_tenders(app)
    return app


@pytest.fixture
async def api_client(test_app) -> AsyncGenerator[AsyncClient, None]:
    """Async HTTPX client for testing FastAPI API routes."""
    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
