"""FastAPI Application Entry Point for MaanakSetu Service."""

from __future__ import annotations

from contextlib import asynccontextmanager
import os
from pathlib import Path
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from maanaksetu.adapters.api.cache import AuditCache
from maanaksetu.adapters.api.routes import router
from maanaksetu.engine.orchestrator import AuditPipeline
from maanaksetu.knowledge.graph import load_normative_graph
from maanaksetu.knowledge.repository import init_db

# Pre-curated demo tenders for instant zero-latency evaluation
CURATED_DEMO_TENDERS = [
    # Legacy demo IDs for backward compatibility and test suite guarantees
    {
        "document_id": "DEMO-NHAI-BRIDGE-01",
        "document_title": "NHAI 4-Lane River Crossing Bridge Deck Works",
        "text": (
            "Clause 4.2: Design and construction of 4-lane prestressed concrete road bridge girders "
            "and deck slabs across river crossing conforming strictly to IS 456:2000. "
            "The contractor shall procure structural cement exclusively from UltraTech or ACC cement plants."
        ),
    },
    {
        "document_id": "DEMO-SEISMIC-REBAR-02",
        "document_title": "CPWD Multi-Storey Administrative Complex Reinforcement",
        "text": (
            "Clause 6.1: Supply of Fe 500D high strength deformed steel bars conforming to IS 1786:2008 "
            "with minimum elongation of 12% and yield stress not less than 450 MPa for seismic ductile detailing."
        ),
    },
    {
        "document_id": "DEMO-TRANSFORMER-QCO-03",
        "document_title": "State Electricity Board Rural Distribution Electrification",
        "text": (
            "Clause 2.4: Supply and commissioning of 100 kVA 11/0.433 kV three phase outdoor type "
            "distribution transformers with total losses at 50% load not exceeding 95 W."
        ),
    },
    # Rich 5-6 clause benchmark scenarios matching updated frontend UI demos
    {
        "document_id": "DEMO-NHAI-CEMENT-01",
        "document_title": "NHAI Expressway Pavement & Reinforced Concrete Construction",
        "text": (
            "Clause 4.1 (Material Quality): Ordinary Portland Cement 43 Grade for high-stress rigid pavement slabs shall strictly conform to IS 269:1989.\n"
            "Clause 4.2 (Vendor Sourcing): Cement shall be procured exclusively from UltraTech or ACC brand to ensure structural durability and uniform setting time.\n"
            "Clause 4.3 (Structural Design Mix): All concrete design mixes and execution shall adhere strictly to active standard IS 456:2000 Code of Practice for Plain and Reinforced Concrete.\n"
            "Clause 4.4 (Setting Time Bounds): Compressive strength at 28 days shall not be less than 43 MPa, and initial setting time shall not be less than 30 minutes in accordance with Table 2 of IS 269.\n"
            "Clause 4.5 (Laboratory Testing Protocol): Representative samples shall be tested for fineness and soundness per IS 4031 at a NABL-accredited or BIS-approved testing laboratory.\n"
            "Clause 4.6 (Mandatory Certification): All cement bags must bear the Bureau of Indian Standards (BIS) ISI Certification Mark with a valid CML number under DPIIT Cement Quality Control Order."
        ),
    },
    {
        "document_id": "DEMO-CPWD-REBAR-02",
        "document_title": "CPWD Multi-Storey Administrative Complex Reinforcement",
        "text": (
            "Clause 6.1 (Reinforcing Steel Grade): Supply of Fe 500D high strength deformed steel bars and wires for concrete reinforcement conforming to IS 1786:2008.\n"
            "Clause 6.2 (Ductility Parameter Bounds): Minimum percentage elongation shall not be less than 12% and yield stress shall not be less than 450 MPa for seismic ductile detailing in Zone IV foundations.\n"
            "Clause 6.3 (Chemical Composition Ceilings): Total sulphur and phosphorus content combined shall not exceed 0.075 percent max in accordance with IS 1786 Table 1.\n"
            "Clause 6.4 (Quality Control Order Conformance): Steel shall be procured strictly from primary producers holding a valid BIS license under the Ministry of Steel Quality Control Order.\n"
            "Clause 6.5 (Bending & Re-bending Test): Cold bend and re-bend testing shall be conducted on nominal sizes per IS 1786 Clause 9.4 without surface fractures."
        ),
    },
    {
        "document_id": "DEMO-DISCOM-TRANSFORMER-03",
        "document_title": "State Electricity Board Rural Distribution Electrification",
        "text": (
            "Clause 2.1 (Equipment Scope): Supply, testing, and commissioning of 100 kVA 11/0.433 kV three-phase 50 Hz outdoor type distribution transformers conforming to IS 1180 (Part 1):2014.\n"
            "Clause 2.2 (Energy Efficiency Loss Ceilings): Total maximum losses at 50% load shall not exceed 95 Watts and at 100% load shall not exceed 260 Watts for Energy Efficiency Level 2.\n"
            "Clause 2.3 (Insulating Medium): Transformer core and windings shall be immersed in uninhibited mineral insulating oil conforming to IS 335:1993 with breakdown voltage not less than 60 kV.\n"
            "Clause 2.4 (Regulatory QCO Certification): Equipment shall carry mandatory BIS Standard Mark (Scheme-I) certification in compliance with Central Electricity Authority and Ministry of Power Quality Control Orders.\n"
            "Clause 2.5 (Enclosure Ingress Protection): Tank fabrication and terminal bushings shall comply with Ingress Protection IP55 according to IS 12063."
        ),
    },
    {
        "document_id": "DEMO-AIIMS-MEDGAS-04",
        "document_title": "AIIMS Super-Specialty Medical Gas Pipeline Infrastructure",
        "text": (
            "Clause 3.1 (Medical Gas Distribution Pipeline): Supply and installation of non-ferrous medical gas distribution pipelines strictly conforming to active standards and statutory safety norms.\n"
            "Clause 3.2 (Structural Support & Slab Works): Plant room foundations and supporting concrete pedestals shall strictly conform to active concrete standard IS 456:2000.\n"
            "Clause 3.3 (Cement Quality): Cement for structural work shall be Ordinary Portland Cement conforming to active standard IS 269:2015 with valid ISI mark.\n"
            "Clause 3.4 (Emergency Pressure Relief Valves): Dual safety relief valves shall be tested and certified strictly conforming to BIS statutory safety guidelines."
        ),
    },
]


def init_app_state(app: FastAPI, db_path: Optional[str | Path] = None) -> None:
    """Initialize database, graph, pipeline, AI clients, and cache on application state."""
    from maanaksetu.adapters.ai import default_omniroute_client, default_typesafe_client

    db = init_db(db_path)
    graph = load_normative_graph(db)
    pipeline = AuditPipeline(
        db=db,
        graph=graph,
        omniroute_client=default_omniroute_client,
        typesafe_client=default_typesafe_client,
    )
    cache = AuditCache()

    app.state.db = db
    app.state.graph = graph
    app.state.pipeline = pipeline
    app.state.cache = cache
    app.state.omniroute = default_omniroute_client
    app.state.typesafe = default_typesafe_client


async def preseed_demo_tenders(app: FastAPI) -> None:
    """Pre-seed curated demo audits into cache for instant sub-50ms judge demonstration."""
    pipeline: AuditPipeline = app.state.pipeline
    cache: AuditCache = app.state.cache

    for tender in CURATED_DEMO_TENDERS:
        if not cache.get_by_id(tender["document_id"]):
            result = await pipeline.execute(
                source=tender["text"],
                document_id=tender["document_id"],
                document_title=tender["document_title"],
            )
            cache.set(result)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context manager for startup and shutdown events."""
    if not hasattr(app.state, "pipeline"):
        init_app_state(app)

    await preseed_demo_tenders(app)
    yield


def create_app(db_path: Optional[str | Path] = None) -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="MaanakSetu (Project Sovereign)",
        description="Autonomous Neuro-Symbolic Indian Standards Verification & Audit Engine (SIH26108)",
        version="1.0.0",
        lifespan=lifespan,
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Payload Size Guard Middleware (protect against payload flood attacks)
    @app.middleware("http")
    async def limit_upload_size(request: Request, call_next):
        max_bytes = 10 * 1024 * 1024  # 10 MB limit
        content_length = request.headers.get("content-length")
        if content_length is not None:
            try:
                cl_val = int(content_length)
                if cl_val > max_bytes or cl_val < 0:
                    return JSONResponse(
                        status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                        content={"detail": "Payload exceeds maximum allowed size (10 MB)."},
                    )
            except ValueError:
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"detail": "Invalid Content-Length header value."},
                )
        return await call_next(request)

    # Include Routes under both /api and root / for resilience across deployment topologies
    app.include_router(router, prefix="/api")
    app.include_router(router)

    # Initialize app state eagerly for ASGI test clients
    init_app_state(app, db_path)

    return app


app = create_app()
