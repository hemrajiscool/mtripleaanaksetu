# MaanakSetu — Final Architecture Specification

> **System Codename:** Project Sovereign (MaanakSetu)  
> **Problem Statement:** SIH26108 — Bureau of Indian Standards  
> **Architecture Status:** FROZEN  
> **Design Pattern:** Neuro-Symbolic Regulatory Verification Engine (Domain-Agnostic)

---

## 1. Executive Summary & Governing Principles

### 1.1 The Core Mental Model

```
                 UNSTRUCTURED SPECIFICATION / TENDER
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │  1. UNDERSTAND      │
                       │  Extract Requirement│
                       └──────────┬──────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │  2. DISCOVER        │
                       │ Candidate Standards │
                       └──────────┬──────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │  3. VERIFY          │
                       │ Rules + Knowledge   │
                       │                     │
                       │ - Currency          │
                       │ - Scope Exclusions  │
                       │ - Parameters        │
                       │ - Amendment Deltas  │
                       │ - Mandatory Orders  │
                       │ - Dependencies      │
                       └──────────┬──────────┘
                                  │
                          ┌───────┴────────┐
                          ▼                ▼
                      VERIFIED          UNCERTAIN
                          │                │
                          ▼                ▼
                    FINDING /          HUMAN REVIEW
                    RECOMMENDATION       (Adjudication)
                          │
                          ▼
                       EVIDENCE
                          │
                          ▼
                      AUDIT OUTPUT
```

### 1.2 The Five Tenets
1. **AI understands**: NLP, heuristics, and models extract structured requirements from free text.
2. **Knowledge tells us what is true**: Authoritative, versioned, gazetted facts stored in a structured graph.
3. **Rules decide**: Deterministic invariant checks evaluate applicability, compliance, and conflicts.
4. **Evidence explains**: Every finding is backed by an unbroken 5-node provenance chain.
5. **Uncertainty stops the system from pretending it knows**: The engine deterministically abstains whenever facts or parameters are ambiguous.

### 1.3 Final Architectural Invariant
> **AI models are restricted exclusively to extracting structured, parameterized requirements from unstructured specification text; all subsequent determinations of standard applicability, revision currency, regulatory compliance, and remediation actions are executed deterministically by invariant rules over authoritative knowledge base facts, backed by an unbroken provenance chain that halts with an explicit abstention (`UNCERTAIN`) whenever facts or parameters are incomplete.**

### 1.4 Novelty Thesis
> **MaanakSetu is designed around a neuro-symbolic verification architecture rather than treating standards recommendation as a purely probabilistic document-similarity problem.**  
> While document-similarity approaches treat standards as unstructured text (failing on scope exclusions, edition currency, and numerical amendment deltas), MaanakSetu models standards as **typed regulatory contracts with explicit operational scopes, temporal revision graphs, gazetted parameter deltas, and mandatory regulatory directives.**  
> AI is strictly confined to requirement extraction from free text. All verification decisions are deterministically executed against authoritative knowledge base facts with an unbroken 5-node provenance chain, and the system deterministically abstains with an auditable `UNCERTAIN` state whenever specifications or regulatory facts lack conclusive evidence.

---

## 2. Domain-Agnostic Design & Knowledge Cartridge

The MaanakSetu core engine contains **zero hardcoded industry, regional, or standard-specific assumptions**. 
- The engine operates purely on universal regulatory primitives: documents, segments, requirements, parameters, standard families, editions, revision deltas, scope boundaries, constraints, and mandates.
- The **Bureau of Indian Standards (BIS)** corpus, the **Public Procurement (Preference to Make in India) Orders**, and **General Financial Rules (GFR)** constitute the primary **Knowledge Cartridge** loaded into the engine's database.
- The identical core engine evaluates ISO, ASTM, DIN, IEEE, or Eurocodes simply by mounting an alternate knowledge cartridge.

---

## 3. Canonical Domain Model

```
SpecificationDocument (id, title, source_metadata, raw_content)
  └── DocumentSegment (id, segment_number, text, page_number, geometry_bounds)
       └── Requirement (id, segment_id, subject_entity, application_context, parameters[], cited_standards[], cited_brands[])
            ├── Parameter (name, value, unit, condition: MIN | MAX | EXACT | RANGE)
            └── CandidateStandardReference (raw_citation, parsed_family, parsed_edition)

StandardFamily (family_id, code, title, governing_body, subject_domain)
  └── StandardEdition (edition_id, family_id, full_code, revision_number, year, status: ACTIVE | SUPERSEDED | WITHDRAWN)
       ├── ScopeBoundary (edition_id, included_contexts[], excluded_contexts[], governing_alternatives{})
       ├── RevisionDelta (edition_id, delta_number, effective_year, parameter_deltas{})
       └── TechnicalConstraint (edition_id, parameter_name, context_qualifier, min_val, max_val, exact_val, unit, condition)

RegulatoryMandate (mandate_id, title, administrative_order, effective_date, covered_standards[])

Finding (finding_id, requirement_id, rule_id, severity, decision_state, review_state, recommendation, evidence)
  └── Evidence (finding_id, rule_id, knowledge_fact_ref, requirement_ref, source_segment_ref)
```

### 3.1 Standard Identity vs. Edition
To prevent collapsing historical versions, current editions, and gazetted amendments:
1. **`StandardFamily`**: The abstract statutory subject (e.g., `IS 456`, `Code of practice for plain and reinforced concrete`).
2. **`StandardEdition`**: The statutory operational node with temporal validity (e.g., `IS 456:2000` [Active], `IS 456:1978` [Superseded]). Supersession edges strictly link editions.
3. **`RevisionDelta` (Amendment)**: Belongs strictly to a `StandardEdition` (e.g., Amendment 3 of `IS 1786:2008`).
4. **`CitationResolutionPolicy`**: Governs unversioned citations (e.g., `IS 456` without year). Configurable per domain/profile (`LATEST_ACTIVE_DEFAULT`, `STRICT_EDITION_REQUIRED`, or `TENDER_DATE_GOVERNED`).

---

## 4. Decision Lifecycle & State Machine

```
                                  EVALUATION PIPELINE
                                          │
                                          ▼
                      ┌───────────────────────────────────────┐
                      │        APPLICABILITY DECISION         │
                      │  - APPLICABLE                         │
                      │  - NOT_APPLICABLE (with alternative)  │
                      │  - UNCERTAIN                          │
                      └───────────────────┬───────────────────┘
                                          │
                                          ▼
                      ┌───────────────────────────────────────┐
                      │        FINDING DECISION STATE         │
                      │  - CONFORMANT                         │
                      │  - VIOLATION                          │
                      │  - UNCERTAIN                          │
                      └───────────────────┬───────────────────┘
                                          │
                     ┌────────────────────┴────────────────────┐
                     │                                         │
        (CONFORMANT / VIOLATION)                          (UNCERTAIN)
                     │                                         │
                     ▼                                         ▼
            [Deterministic Output]                    [Review Workflow State]
             Ready for audit report                    - PENDING_REVIEW (default)
                                                       - CONFIRMED_DEFECT
                                                       - DISMISSED_CONFORMANT
                                                       - EXCEPTION_RECORDED
```

### 4.1 Document Gate Status
The engine never computes an arbitrary numerical percentage (such as 78%) to represent compliance. A single mandatory regulatory violation cannot be "offset" by compliant clauses. The engine produces an unequivocal **Statutory Gate Status**:

| Gate Status | Criteria |
|---|---|
| **`STATUTORY_NON_COMPLIANT`** | $\ge 1$ Mandatory Regulatory Mandate violated (prohibited standard or missing mandatory certification). |
| **`TECHNICAL_DEFECT`** | $\ge 1$ Technical parameter threshold, scope boundary, or amendment constraint failed. |
| **`ACTION_REQUIRED_REVIEW`** | 0 confirmed violations, but $\ge 1$ requirement halted in `UNCERTAIN` / `PENDING_REVIEW`. |
| **`VERIFIED_CONFORMANT`** | All extracted requirements proved compliant against active editions with complete evidence. |

---

## 5. Evidence & Provenance Model

Every finding is bound to an immutable 5-element tuple:

$$\mathcal{E} = \langle \text{FindingId}, \text{RuleId}, \text{KnowledgeFactRef}, \text{RequirementRef}, \text{SourceSegmentRef} \rangle$$

```
┌─────────────────────────────────────────────────────────────────────────┐
│ FINDING: FND-001 (Scope Conflict)                                       │
│ Severity: CRITICAL | Decision: VIOLATION                                │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ verifies via
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ RULE: RULE-SCOPE-EXCLUSION                                              │
│ Invariant: Requirement application must not be in excluded_contexts     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ grounds against
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ KNOWLEDGE FACT: ScopeBoundary(IS 456:2000, Clause 1.1)                 │
│ Excluded: ["road bridges"] | Alternative: "IRC:112"                     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ compares against
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ REQUIREMENT: REQ-04 (Extracted from Clause 4.2)                         │
│ Subject: "concrete" | Application: "road bridge deck slab"              │
│ Cited Standard: "IS 456:2000"                                           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ extracted from
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ SOURCE SEGMENT: Clause 4.2 (Page 3, Line 14)                            │
│ Text: "Concrete for road bridge deck slab shall conform to IS 456..."   │
│ Geometry: BoundingBox(x0: 72, y0: 150, x1: 520, y1: 180)                │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Completeness Invariant
If any link in the 5-node trace cannot be materialized:
- The engine is **strictly prohibited** from emitting a `VIOLATION` or `CONFORMANT` state.
- The engine must emit an `UNCERTAIN` finding with a typed `UncertaintyReason` (`AMBIGUOUS_SPECIFICATION`, `KNOWLEDGE_BASE_GAP`, or `SCOPE_BOUNDARY_DISPUTE`).
- Unbacked, synthetic, or hallucinated findings are prevented by architecture.

---

## 6. Four-Stage Pipeline Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: INGESTION & REQUIREMENT EXTRACTION                            │
│ (NLP / Heuristic / Model-Assisted Extraction)                          │
│                                                                        │
│ Input: Unstructured tender text / PDF document                         │
│ - Segment document into numbered clauses with spatial bounding boxes   │
│ - Extract Requirement entities: subject, application context,          │
│   quantitative parameters, comparator conditions, and cited entities   │
│ - Categorize functional domain (Technical, Commercial, Administrative) │
│ Output: Requirement[]                                                  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 2: STANDARDS DISCOVERY (Hybrid Retrieval)                        │
│                                                                        │
│ Input: Requirement[]                                                   │
│ - Channel A (Symbolic): Exact regex citation parsing                   │
│ - Channel B (Taxonomy): Canonical subject-to-family dictionary lookup  │
│ - Channel C (Lexical): Inverted-index BM25 search over titles & scopes │
│ - Channel D (Semantic, Production): Dense vector embedding retrieval   │
│ Output: CandidateStandards[] per Requirement                           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 3: DETERMINISTIC VERIFICATION (Rules Engine)                     │
│                                                                        │
│ Input: Requirement[] + CandidateStandards[]                            │
│ 1. Lifecycle Currency: Traverse supersession DAG for active status     │
│ 2. Scope Boundaries: Check application context against exclusions      │
│ 3. Technical Constraints: Compare numerical values vs amendment deltas │
│ 4. Regulatory Mandates: Check coverage under mandatory orders (QCOs)   │
│ 5. Commercial Rules: Flag anti-competitive brand names (GFR 144(i))    │
│ 6. Sub-tier Dependencies: Traverse normative references for obsolescence│
│ Output: Finding[] with complete Evidence tuples                        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 4: OUTPUT & PRESENTATION ADAPTERS                                │
│                                                                        │
│ Input: Finding[]                                                       │
│ - Compute Document Gate Status & discrete finding counts               │
│ - Compute state digest (SHA-256 canonical integrity hash)              │
│ - Pluggable Adapters:                                                  │
│   • REST API Gateway (FastAPI)                                         │
│   • Typst Cryptographic PDF Audit Dossier Compiler                     │
│   • Interactive React UI                                               │
│   • Integration Connectors (GeM / CPPP Webhooks)                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Recommendation Mechanism: Deterministic vs. Probabilistic

The recommendation engine strictly separates statistical retrieval from deterministic remediation:

$$\text{Requirement} \xrightarrow[\text{Probabilistic}]{\text{Step 1}} \text{CandidateStandards} \xrightarrow[\text{Deterministic}]{\text{Step 2}} \text{ActiveStandards} \xrightarrow[\text{Deterministic}]{\text{Step 3}} \text{ApplicableStandard} \xrightarrow[\text{Deterministic}]{\text{Step 4}} \text{Recommendation}$$

| Step | Operation | Modality | Governing Logic |
|---|---|---|---|
| **1. Discovery** | Map extracted text to candidate standard families | Probabilistic / Lexical | Fuses exact match, taxonomy alias, and BM25 rank score. |
| **2. Currency** | Verify standard edition status | Deterministic | Checks active vs superseded; traverses `supersedes_edges`. |
| **3. Applicability** | Evaluate application context | Deterministic | Matches context against `ScopeBoundary.excluded_contexts`. |
| **4. Compliance** | Evaluate parameters & mandates | Deterministic | Compares tender parameters to `TechnicalConstraint` thresholds and `RevisionDelta` values. |
| **5. Recommendation** | Synthesize actionable remediation | Deterministic | Direct substitution from knowledge relations: `superseding_is`, `governing_alternatives`, or mandatory `min_val`. |

**Core Rule:** An LLM is never used to determine compliance or choose replacement standards. All remediation text is deterministically derived from structured knowledge base relations.

---

## 8. Explicit Three-Level Capability Boundary

| Dimension | Architectural Capability (Design) | Demonstrated 36-Hour MVP (Current Reality) | Production Extension (Target) |
|---|---|---|---|
| **Standards Corpus** | Universal regulatory graph representing standard families, editions, scopes, amendments, and regulatory mandates. | **20 curated standards** (civil, electrical, general engineering) with structured records in SQLite. | Ingestion pipeline for full standards catalogs (e.g., 22,000+ BIS standards, ISO, ASTM). |
| **Recommendation Engine** | Hybrid multi-channel retrieval (exact code + taxonomy + dense semantic embedding + lexical BM25). | **Exact regex citation parser + curated product taxonomy mapping + SQLite FTS5 BM25 search.** | Fine-tuned dense embedding model (`bge-m3`) with vector indexing (`pgvector`/`faiss`) and cross-encoder reranking. |
| **Scope Verification** | Declarative inclusion/exclusion boundary matching over structured application taxonomies. | **Keyword-based application matching** over 8 curated standard scopes (e.g., bridge exclusions, high-voltage exclusions). | Hierarchical ontological matching (mapping arbitrary application contexts to standard scope taxonomies). |
| **Amendment & Constraint Check** | Parameterized temporal verification against gazetted amendment deltas and physical test constraints. | **Deterministic validation of 12 benchmark constraint cases** (yield stress, elongation, compressive strength, losses). | Generalized unit-aware numerical constraint solver across arbitrary physical parameters and test methods. |
| **Regulatory Orders** | Generalized regulatory mandate checking (QCOs, technical directives, mandatory certification). | **Deterministic lookup across 4 mandatory QCOs** (transformers, steel bars, cement, electrical luminaires). | Automated gazette scraping, transition-period tracking, and multi-ministry directive mapping. |
| **Multilingual NLP** | Cross-lingual specification parsing across regional languages. | **English-only ingestion** (with basic transliteration resilience via standard tokenization). | Integrated `IndicTrans2` translation pipeline supporting scheduled Indian languages. |
| **Human Review** | Full-lifecycle review queue, role-based access, exception recording, and audit trail. | **First-class `UNCERTAIN` finding state** surfaced in JSON API and rendered in PDF/UI. | Authenticated multi-officer workflow, digital signature attestation, and dispute audit logging. |

---

## 9. PS Requirement Coverage Matrix

| BIS Problem Statement Requirement | Architecture Component | Implementation Mechanism |
|---|---|---|
| **1. Semantic Standards Recommendation** | Stage 1 (Extraction) + Stage 2 (Discovery) | Maps free-text functional specifications to candidate Indian Standards via hybrid exact + taxonomy + BM25 retrieval. |
| **2. Allied & Normative Standards** | Stage 3 (Sub-tier Dependencies) | In-memory NetworkX directed graph traversing normative references to detect cascading obsolescence. |
| **3. Latest Versions & Amendments** | Stage 3 (Lifecycle & Constraints) | Traverses supersession chains to active editions and validates parameters against gazetted amendment deltas. |
| **4. Applicable Certification Requirements** | Stage 3 (Regulatory Mandates) | Matches product categories against gazetted Quality Control Orders to enforce mandatory BIS certification marks. |
| **5. Natural Language / Multilingual Input** | Stage 1 (Ingestion & Extraction) | Universal segmenter and parameter extractor; designed to consume IndicTrans2 token streams in production. |

---

*Architecture frozen on 2026-09-25. Authoritative specification for Project Sovereign (MaanakSetu).*
