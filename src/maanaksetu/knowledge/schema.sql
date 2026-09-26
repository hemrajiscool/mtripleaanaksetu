-- ═══════════════════════════════════════════════════════════════════
-- Project Sovereign: Authoritative SQLite Ground-Truth Schema (V1)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS standards_catalog (
    is_number           TEXT PRIMARY KEY,
    title               TEXT NOT NULL,
    year                INTEGER NOT NULL,
    status              TEXT NOT NULL CHECK(status IN ('ACTIVE', 'SUPERSEDED', 'WITHDRAWN')),
    gazette_date        TEXT,
    withdrawal_date     TEXT,
    superseded_by       TEXT,
    key_parameters      TEXT,
    is_qco_mandatory    INTEGER DEFAULT 0,
    scope_text          TEXT,
    technical_committee TEXT
);

CREATE TABLE IF NOT EXISTS supersedes_edges (
    superseding_is      TEXT NOT NULL,
    superseded_is       TEXT NOT NULL,
    year                INTEGER,
    PRIMARY KEY(superseding_is, superseded_is)
);

CREATE TABLE IF NOT EXISTS normative_references (
    citing_is           TEXT NOT NULL,
    cited_is            TEXT NOT NULL,
    clause_ref          TEXT,
    reference_type      TEXT DEFAULT 'NORMATIVE_REFERENCE',
    PRIMARY KEY(citing_is, cited_is)
);

CREATE TABLE IF NOT EXISTS brand_dictionary (
    brand_name          TEXT PRIMARY KEY,
    oem_name            TEXT,
    generic_category    TEXT,
    associated_is       TEXT
);

CREATE TABLE IF NOT EXISTS qco_catalog (
    qco_id              TEXT PRIMARY KEY,
    order_title         TEXT NOT NULL,
    effective_date      TEXT,
    covered_standards   TEXT
);

-- V1 Upgrade: Official Gazetted Amendments with Parameter Deltas
CREATE TABLE IF NOT EXISTS standard_amendments (
    is_number           TEXT NOT NULL,
    amendment_number    INTEGER NOT NULL,
    publication_year    INTEGER NOT NULL,
    description         TEXT,
    parameter_deltas    TEXT,  -- JSON dict of parameter deltas
    PRIMARY KEY(is_number, amendment_number),
    FOREIGN KEY(is_number) REFERENCES standards_catalog(is_number)
);

-- V1 Upgrade: Declared Scope Boundaries & Exclusions
CREATE TABLE IF NOT EXISTS standard_scopes (
    is_number               TEXT PRIMARY KEY,
    included_applications   TEXT,  -- JSON list of covered domains
    excluded_applications   TEXT,  -- JSON list of excluded domains
    governing_alternatives  TEXT,  -- JSON map: excluded application -> governing standard
    scope_notes             TEXT,
    FOREIGN KEY(is_number) REFERENCES standards_catalog(is_number)
);

-- V1 Upgrade: Granular Technical Parameter Constraints
CREATE TABLE IF NOT EXISTS technical_constraints (
    constraint_id       TEXT PRIMARY KEY,
    is_number           TEXT NOT NULL,
    grade               TEXT,
    parameter_name      TEXT NOT NULL,
    min_value           REAL,
    max_value           REAL,
    exact_value         TEXT,
    unit                TEXT,
    condition_type      TEXT CHECK(condition_type IN ('MIN', 'MAX', 'EXACT', 'RANGE')),
    test_method_is      TEXT,
    FOREIGN KEY(is_number) REFERENCES standards_catalog(is_number)
);

-- Full-Text Search (FTS5) for BM25 retrieval of unnumbered specifications
CREATE VIRTUAL TABLE IF NOT EXISTS standards_fts USING fts5(
    is_number,
    title,
    scope_text,
    tokenize = 'porter unicode61'
);

-- Indexes for high-speed deterministic joins and traversal
CREATE INDEX IF NOT EXISTS idx_standards_status ON standards_catalog(status);
CREATE INDEX IF NOT EXISTS idx_standards_qco ON standards_catalog(is_qco_mandatory);
CREATE INDEX IF NOT EXISTS idx_supersedes_sub ON supersedes_edges(superseded_is);
CREATE INDEX IF NOT EXISTS idx_normref_cited ON normative_references(cited_is);
CREATE INDEX IF NOT EXISTS idx_amendments_is ON standard_amendments(is_number);
CREATE INDEX IF NOT EXISTS idx_constraints_is ON technical_constraints(is_number);
CREATE INDEX IF NOT EXISTS idx_constraints_param ON technical_constraints(parameter_name);
