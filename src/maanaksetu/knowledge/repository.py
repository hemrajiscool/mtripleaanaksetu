"""Authoritative Knowledge Base Repository for MaanakSetu (SQLite + FTS5)."""

from __future__ import annotations

import json
from pathlib import Path
import sqlite3
from typing import Any, Dict, List, Optional, Union

from maanaksetu.domain.models import (
    AmendmentRecord,
    ScopeBoundary,
    StandardEdition,
    TechnicalConstraint,
)
from maanaksetu.domain.states import StandardStatus

BASE_DIR = Path(__file__).resolve().parent
SEEDS_DIR = BASE_DIR / "seeds"
SCHEMA_PATH = BASE_DIR / "schema.sql"
DEFAULT_DB_PATH = BASE_DIR.parent.parent.parent / "data" / "maanaksetu.db"


def get_connection(db_path: Optional[Union[str, Path]] = None) -> sqlite3.Connection:
    """Create a configured SQLite connection with foreign keys and WAL mode."""
    if db_path is None:
        db_path = DEFAULT_DB_PATH

    if isinstance(db_path, str) and db_path != ":memory:":
        db_path = Path(db_path)

    if isinstance(db_path, Path) and not db_path.parent.exists():
        db_path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(str(db_path), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA busy_timeout = 5000;")
    return conn


def init_db(
    db_path: Optional[Union[str, Path, sqlite3.Connection]] = None,
    force_reseed: bool = False,
) -> sqlite3.Connection:
    """Initialize database tables and load authoritative seed data."""
    if isinstance(db_path, sqlite3.Connection):
        conn = db_path
    else:
        conn = get_connection(db_path)

    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    conn.executescript(schema_sql)

    cursor = conn.execute("SELECT COUNT(*) as cnt FROM standards_catalog;")
    count = cursor.fetchone()["cnt"]

    if count == 0 or force_reseed:
        _load_seeds(conn)

    return conn


def _load_seeds(conn: sqlite3.Connection) -> None:
    """Load JSON seed files into the SQLite database."""
    # 1. Standards Catalog
    standards_file = SEEDS_DIR / "standards_seed.json"
    if standards_file.exists():
        with open(standards_file, "r", encoding="utf-8") as f:
            standards_data = json.load(f)

        for std in standards_data:
            key_params_str = (
                json.dumps(std["key_parameters"])
                if isinstance(std.get("key_parameters"), dict)
                else std.get("key_parameters")
            )
            conn.execute(
                """
                INSERT OR REPLACE INTO standards_catalog (
                    is_number, title, year, status, gazette_date,
                    withdrawal_date, superseded_by, key_parameters,
                    is_qco_mandatory, scope_text
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    std["is_number"],
                    std["title"],
                    std["year"],
                    std["status"],
                    std.get("gazette_date"),
                    std.get("withdrawal_date"),
                    std.get("superseded_by"),
                    key_params_str,
                    std.get("is_qco_mandatory", 0),
                    std.get("scope_text"),
                ),
            )
            conn.execute(
                """
                INSERT OR REPLACE INTO standards_fts (
                    is_number, title, scope_text
                ) VALUES (?, ?, ?);
                """,
                (
                    std["is_number"],
                    std["title"],
                    std.get("scope_text", ""),
                ),
            )

    # 2. Supersedes Edges
    supersedes_file = SEEDS_DIR / "supersedes_seed.json"
    if supersedes_file.exists():
        with open(supersedes_file, "r", encoding="utf-8") as f:
            supersedes_data = json.load(f)

        for edge in supersedes_data:
            conn.execute(
                """
                INSERT OR REPLACE INTO supersedes_edges (
                    superseding_is, superseded_is, year
                ) VALUES (?, ?, ?);
                """,
                (edge["superseding_is"], edge["superseded_is"], edge.get("year")),
            )

    # 3. Normative References
    normative_file = SEEDS_DIR / "normative_seed.json"
    if normative_file.exists():
        with open(normative_file, "r", encoding="utf-8") as f:
            normative_data = json.load(f)

        for ref in normative_data:
            conn.execute(
                """
                INSERT OR REPLACE INTO normative_references (
                    citing_is, cited_is, clause_ref
                ) VALUES (?, ?, ?);
                """,
                (ref["citing_is"], ref["cited_is"], ref.get("clause_ref")),
            )

    # 4. Brand Dictionary (GFR 144(i))
    brands_file = SEEDS_DIR / "brands_seed.json"
    if brands_file.exists():
        with open(brands_file, "r", encoding="utf-8") as f:
            brands_data = json.load(f)

        for brand in brands_data:
            conn.execute(
                """
                INSERT OR REPLACE INTO brand_dictionary (
                    brand_name, oem_name, generic_category, associated_is
                ) VALUES (?, ?, ?, ?);
                """,
                (
                    brand["brand_name"],
                    brand.get("oem_name"),
                    brand.get("generic_category"),
                    brand.get("associated_is"),
                ),
            )

    # 5. Quality Control Orders
    qco_file = SEEDS_DIR / "qco_seed.json"
    if qco_file.exists():
        with open(qco_file, "r", encoding="utf-8") as f:
            qco_data = json.load(f)

        for qco in qco_data:
            conn.execute(
                """
                INSERT OR REPLACE INTO qco_catalog (
                    qco_id, order_title, effective_date, covered_standards
                ) VALUES (?, ?, ?, ?);
                """,
                (
                    qco["qco_id"],
                    qco["order_title"],
                    qco.get("effective_date"),
                    qco.get("covered_standards"),
                ),
            )

    # 6. Standard Amendments
    amendments_file = SEEDS_DIR / "amendments_seed.json"
    if amendments_file.exists():
        with open(amendments_file, "r", encoding="utf-8") as f:
            amendments_data = json.load(f)

        for amd in amendments_data:
            deltas_str = (
                json.dumps(amd["parameter_deltas"])
                if isinstance(amd.get("parameter_deltas"), dict)
                else amd.get("parameter_deltas")
            )
            conn.execute(
                """
                INSERT OR REPLACE INTO standard_amendments (
                    is_number, amendment_number, publication_year, description, parameter_deltas
                ) VALUES (?, ?, ?, ?, ?);
                """,
                (
                    amd["is_number"],
                    amd["amendment_number"],
                    amd["publication_year"],
                    amd.get("description"),
                    deltas_str,
                ),
            )

    # 7. Standard Scopes (Clause 1.1 Boundaries)
    scopes_file = SEEDS_DIR / "scopes_seed.json"
    if scopes_file.exists():
        with open(scopes_file, "r", encoding="utf-8") as f:
            scopes_data = json.load(f)

        for sc in scopes_data:
            inc_str = json.dumps(sc.get("included_applications", []))
            exc_str = json.dumps(sc.get("excluded_applications", []))
            gov_str = json.dumps(sc.get("governing_alternatives", {}))
            conn.execute(
                """
                INSERT OR REPLACE INTO standard_scopes (
                    is_number, included_applications, excluded_applications, governing_alternatives, scope_notes
                ) VALUES (?, ?, ?, ?, ?);
                """,
                (
                    sc["is_number"],
                    inc_str,
                    exc_str,
                    gov_str,
                    sc.get("scope_notes"),
                ),
            )

    # 8. Technical Constraints
    constraints_file = SEEDS_DIR / "constraints_seed.json"
    if constraints_file.exists():
        with open(constraints_file, "r", encoding="utf-8") as f:
            constraints_data = json.load(f)

        for c in constraints_data:
            conn.execute(
                """
                INSERT OR REPLACE INTO technical_constraints (
                    constraint_id, is_number, grade, parameter_name, min_value, max_value, exact_value, unit, condition_type, test_method_is
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    c["constraint_id"],
                    c["is_number"],
                    c.get("grade"),
                    c["parameter_name"],
                    c.get("min_value"),
                    c.get("max_value"),
                    c.get("exact_value"),
                    c.get("unit"),
                    c["condition_type"],
                    c.get("test_method_is"),
                ),
            )

    conn.commit()


# ═════════════════════════════════════════════════════════════════════════════
# Query Methods
# ═════════════════════════════════════════════════════════════════════════════

def get_standard_edition(conn: sqlite3.Connection, is_number: str) -> Optional[StandardEdition]:
    """Retrieve authoritative StandardEdition record by full IS number."""
    cursor = conn.execute(
        "SELECT * FROM standards_catalog WHERE is_number = ?;", (is_number,)
    )
    row = cursor.fetchone()
    if not row:
        return None

    key_params = {}
    if row["key_parameters"]:
        try:
            key_params = json.loads(row["key_parameters"]) if isinstance(row["key_parameters"], str) else row["key_parameters"]
        except Exception:
            pass

    family_code = is_number.split(":")[0] if ":" in is_number else is_number

    # Fetch scope boundary
    scope_data = get_standard_scope(conn, is_number)
    scope_boundary = ScopeBoundary(**scope_data) if scope_data else None

    # Fetch amendments
    amendments_data = get_standard_amendments(conn, is_number)
    amendments = [AmendmentRecord(**a) for a in amendments_data]

    # Fetch constraints
    constraints_data = get_technical_constraints(conn, is_number)
    constraints = [TechnicalConstraint(**c) for c in constraints_data]

    return StandardEdition(
        is_number=row["is_number"],
        family_code=family_code,
        title=row["title"],
        year=row["year"],
        status=StandardStatus(row["status"]),
        gazette_date=row["gazette_date"],
        withdrawal_date=row["withdrawal_date"],
        superseded_by=row["superseded_by"],
        key_parameters=key_params,
        is_qco_mandatory=bool(row["is_qco_mandatory"]),
        scope_text=row["scope_text"],
        scope_boundary=scope_boundary,
        amendments=amendments,
        constraints=constraints,
    )


def get_standard_family_editions(conn: sqlite3.Connection, family_code: str) -> List[StandardEdition]:
    """Retrieve all editions for a standard family, ordered newest first."""
    cursor = conn.execute(
        "SELECT is_number FROM standards_catalog WHERE is_number LIKE ? ORDER BY year DESC;",
        (f"{family_code}%",),
    )
    editions = []
    for row in cursor.fetchall():
        ed = get_standard_edition(conn, row["is_number"])
        if ed:
            editions.append(ed)
    return editions


def get_standard_amendments(conn: sqlite3.Connection, is_number: str) -> List[Dict[str, Any]]:
    """Retrieve all gazetted amendments for an IS edition."""
    base_code = is_number.split(":")[0] if ":" in is_number else is_number
    cursor = conn.execute(
        """
        SELECT is_number as edition_is, amendment_number, publication_year, description, parameter_deltas
        FROM standard_amendments
        WHERE is_number = ? OR is_number = ?
        ORDER BY amendment_number ASC;
        """,
        (is_number, base_code),
    )
    results = []
    for r in cursor.fetchall():
        d = dict(r)
        if d.get("parameter_deltas"):
            try:
                d["parameter_deltas"] = json.loads(d["parameter_deltas"]) if isinstance(d["parameter_deltas"], str) else d["parameter_deltas"]
            except Exception:
                pass
        results.append(d)
    return results


def get_standard_scope(conn: sqlite3.Connection, is_number: str) -> Optional[Dict[str, Any]]:
    """Retrieve scope boundary definitions for an IS edition."""
    base_code = is_number.split(":")[0] if ":" in is_number else is_number
    cursor = conn.execute(
        """
        SELECT is_number as edition_is, included_applications, excluded_applications, governing_alternatives, scope_notes
        FROM standard_scopes
        WHERE is_number = ? OR is_number = ?;
        """,
        (is_number, base_code),
    )
    row = cursor.fetchone()
    if not row:
        return None
    d = dict(row)
    for field in ("included_applications", "excluded_applications", "governing_alternatives"):
        if d.get(field):
            try:
                d[field] = json.loads(d[field]) if isinstance(d[field], str) else d[field]
            except Exception:
                pass
    return d


def get_technical_constraints(
    conn: sqlite3.Connection, is_number: str, grade: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Retrieve technical parameter constraints for an IS edition."""
    base_code = is_number.split(":")[0] if ":" in is_number else is_number
    if grade:
        clean_grade = grade.replace(" ", "").upper()
        cursor = conn.execute(
            """
            SELECT constraint_id, is_number as edition_is, grade, parameter_name, min_value, max_value, exact_value, unit, condition_type, test_method_is
            FROM technical_constraints
            WHERE (is_number = ? OR is_number = ?)
              AND (grade = ? COLLATE NOCASE OR REPLACE(grade, ' ', '') = ? COLLATE NOCASE OR grade IS NULL);
            """,
            (is_number, base_code, grade, clean_grade),
        )
    else:
        cursor = conn.execute(
            """
            SELECT constraint_id, is_number as edition_is, grade, parameter_name, min_value, max_value, exact_value, unit, condition_type, test_method_is
            FROM technical_constraints
            WHERE is_number = ? OR is_number = ?;
            """,
            (is_number, base_code),
        )
    return [dict(r) for r in cursor.fetchall()]


def get_qco_catalog(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    """Retrieve all mandatory Quality Control Orders."""
    cursor = conn.execute("SELECT qco_id, order_title, effective_date, covered_standards FROM qco_catalog;")
    return [dict(r) for r in cursor.fetchall()]


def get_brands(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    """Retrieve all brand dictionary entries for GFR 144(i) detection."""
    cursor = conn.execute("SELECT brand_name, oem_name, generic_category, associated_is FROM brand_dictionary;")
    return [dict(r) for r in cursor.fetchall()]


def search_standards_fts(conn: sqlite3.Connection, query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Search standards catalog using FTS5 BM25 index."""
    clean_words = [w for w in "".join(c if c.isalnum() else " " for c in query).split() if len(w) > 2]
    if not clean_words:
        return []
    # Quote each term individually so FTS operators like AND, OR, NOT cannot inject syntax errors
    fts_query = " OR ".join(f'"{w}"' for w in clean_words)
    try:
        cursor = conn.execute(
            """
            SELECT s.*, fts.rank
            FROM standards_fts fts
            JOIN standards_catalog s ON fts.is_number = s.is_number
            WHERE standards_fts MATCH ?
            ORDER BY fts.rank ASC
            LIMIT ?;
            """,
            (fts_query, limit),
        )
        return [dict(r) for r in cursor.fetchall()]
    except Exception:
        return []
