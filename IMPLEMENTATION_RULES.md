# MaanakSetu — Frontend Implementation Rules & Quality Gates

**Document Version:** 1.0  
**Author:** Lead Design Architect & Systems Auditor  
**System:** MaanakSetu (मानक सेतु) — National Standards Verification Workstation  
**Statutory Foundation:** BIS Act 2016 & General Financial Rules 2017  
**Status:** Approved Implementation Rules  

---

## 1. Purpose & Authority

This document defines the **binding engineering, design, and verification rules** for the MaanakSetu frontend implementation sprint. Every rule is grounded in the frozen backend architecture (`ARCHITECTURE.md`) and the approved Design Thesis.

**Non-Negotiable Constraint:** The frontend has zero permission to weaken the frozen backend architecture, invent compliance claims, fabricate data, or leak internal developer telemetry.

---

## 2. Category I: Architectural Purity Rules

### Rule 1: Single Source of Truth (`AuditResult`)
- All audit views must derive state strictly from the `AuditResult` object returned by the FastAPI backend (`POST /api/audit` or `GET /api/audit/{id}`).
- The frontend is **strictly prohibited** from performing client-side compliance synthesis, rule evaluation, or modifying finding severities.

### Rule 2: Strict Gate Status Binding
- The primary conformance indicator must strictly render one of the four domain `GateStatus` enum values:
  1. `STATUTORY_NON_COMPLIANT` (Red)
  2. `TECHNICAL_DEFECT` (Amber)
  3. `ACTION_REQUIRED_REVIEW` (Blue)
  4. `VERIFIED_CONFORMANT` (Emerald)
- No intermediate or custom statuses (e.g. "Partially Compliant", "Needs Work") are permitted.

### Rule 3: Discrete Accounting Invariant (No Fake Scores)
- Primary conformance metrics must display the exact integer counts from `AuditSummary`:
  - Requirements Evaluated (`total_requirements_evaluated`)
  - Conformant Requirements (`conformant_requirements`)
  - Critical Violations (`critical_violations`)
  - High Violations (`high_violations`)
  - Medium Violations (`medium_violations`)
  - Pending Reviews (`pending_reviews`)
- **Prohibited:** Computing or displaying an overall percentage compliance score (e.g. "82% Compliant"). If the auxiliary triage score (`compliance_score`) is shown, it must be explicitly labeled as *"Triage Priority Weight (Heuristic)"* and subordinated to the Gate Status.

### Rule 4: First-Class Uncertainty Representation
- Findings with `DecisionState.UNCERTAIN` must be rendered prominently with their typed `UncertaintyReason` (`AMBIGUOUS_SPECIFICATION`, `KNOWLEDGE_BASE_GAP`, `SCOPE_BOUNDARY_DISPUTE`, `TRANSITIONAL_PERIOD`).
- Every uncertain finding must provide a direct trigger to open the Sovereign Adjudication modal.

### Rule 5: 5-Node Provenance Tuple Invariant
- Every finding in View 06 (`CORRIGENDA & PROOF`) and in detail drawers must expose the full 5-node provenance tuple:
  $$\mathcal{E} = \langle \text{FindingId}, \text{RuleId}, \text{KnowledgeFactRef}, \text{RequirementRef}, \text{SourceSegmentRef} \rangle$$
- If any node is missing from a definitive finding, flag it as an architectural integrity defect.

### Rule 6: Real-Time Sovereign Adjudication Loop
- Submitting an adjudication (`POST /api/audit/{document_id}/adjudicate`) must update the local state with the returned updated `AuditResult`, instantly refreshing:
  - The finding's `review_state` and `decision_state`
  - The recalculated `GateStatus`
  - The updated `AuditSummary` counters
  - The newly recomputed `sha256_digest`

---

## 3. Category II: Anti-Slop Visual & Aesthetic Rules

### Rule 7: Strictly Light Institutional Palette
- The interface must use an authoritative, calm light palette:
  - Canvas: `#F9FAFB` (Warm Off-White)
  - Cards & Inset Surfaces: `#FFFFFF`
  - Dividing Rules: `1px solid #E5E7EB` (Hairline Borders)
  - Primary Text: `#111827` (Deep Charcoal Slate)
  - Secondary Text: `#4B5563` (Muted Gray)
  - Semantic Red: `#DC2626` (Statutory Non-Compliance)
  - Semantic Green: `#059669` (Statutory Conformance)
  - Semantic Amber: `#D97706` (Cascading Risk / Warning)
  - Semantic Blue: `#2563EB` (Human Review Required)
- **Strictly Banned:** Dark-mode cyber themes, pitch-black canvases, neon glow, glowing gradient borders, and floating glassmorphic blurs.

### Rule 8: The "Banned Copy" List
The following strings and concepts are **permanently banned** from the codebase:
- ❌ `SOVEREIGNTY SEAL ACTIVE`
- ❌ `NEURAL MATRIX` or `AI BRAIN`
- ❌ `AI MAGIC` or `SUPERCHARGED BY AI`
- ❌ `STATUTORY VERDICT`
- ❌ `CERTIFIED BY BUREAU OF INDIAN STANDARDS` (as a fake seal)
- ❌ `PORT: 8000 / 5173`
- ❌ `ENGINE: SpecGuard Rulebook` (as branding)
- ❌ `BOB 1554` or internal daemon codes

### Rule 9: The Typographic Triad
- **General UI & Paragraphs:** `Inter`, system sans-serif (`font-sans`).
- **Standard Codes, Scores, Hashes & Rules:** `JetBrains Mono` (`font-mono`) with `tabular-nums`. Mandatory for:
  - Standard numbers (`IS 269:2015`, `IS 456:2000`)
  - Clause identifiers (`Clause 4.1`, `REQ-Clause-4.1`)
  - Rule IDs (`RULE-LIFECYCLE-CURRENCY`, `INV-01`)
  - Hashes (`SHA-256: 9f08d018...`)
  - Defect counters and numerical constraints (`43 MPa`, `500 MPa`)
- **Dossier & Official Document Headers:** `Merriweather` or `Georgia` (`font-serif`) reserved exclusively for printable A4 headers and official document titles.

### Rule 10: Zero-Slop Motion
- View transitions must be instant (0ms to 50ms cut transitions).
- Accordion expansions must use a calm, linear reveal (max 150ms).
- **Strictly Banned:** Spring-based bounce physics, floating orbs, auto-rotating carousels, and loading skeleton flickering.

---

## 4. Category III: Ergonomics & Layout Rules

### Rule 11: 40/60 Asymmetric Split Geometry
- For deep analytical views (Views 02, 03, 05, 06):
  - Left Column (40% width): Master item selector with independent vertical scrolling.
  - Right Column (60% width): Sticky inspector canvas pinned in the viewport to display full legal text and redlines without horizontal wrapping.

### Rule 12: Dual Navigation Modes
- Users must be able to navigate using both:
  1. Clickable View Ribbon Tabs (`[01 OVERVIEW]` through `[07 DOSSIER]`).
  2. Direct Keyboard Shortcuts (`1` through `7` for direct jump, `ArrowLeft` and `ArrowRight` for traversal).

### Rule 13: One-Click Action Primacy
- Publication-ready corrigenda text in View 06 must have an instant `COPY` button.
- The SHA-256 state digest must have an instant `COPY DIGEST` button.
- The official PDF export must be accessible with one click from View 07 or the top header.

---

## 5. Category IV: Codebase & Component Hygiene Rules

### Rule 14: Strict TypeScript Typing
- All component props and API responses must strictly import types from `src/types/index.ts`.
- **Zero `any` types permitted.**
- Build command `npm run build` must compile cleanly with 0 TypeScript errors and 0 ESLint warnings.

### Rule 15: Component Decomposition
- Maintain modular component architecture:
  - `Header.tsx`: Fixed top context bar (Document ID, Gate Status, Discrete Counters, PDF trigger).
  - `ViewRibbon.tsx`: Subheader 7-view navigation bar.
  - `CorpusSwitcher.tsx`: Preloaded benchmark and custom specification selector.
  - `OverviewView.tsx`: View 01 Executive Decision Surface.
  - `ClauseTriageView.tsx`: View 02 40/60 Master-Detail Clause Extractor.
  - `StandardsCatalogView.tsx`: View 03 40/60 Standards Knowledge Base.
  - `NormativeDagView.tsx`: View 04 Dependency Graph Explorer.
  - `InvariantsView.tsx`: View 05 Invariant Ledger & Sovereign Adjudication Workspace.
  - `CorrigendaView.tsx`: View 06 Redline Diff & 5-Node Provenance Inspector.
  - `DossierView.tsx`: View 07 Printable Audit Dossier & Cryptographic Verification.
  - `AdjudicationModal.tsx`: Sovereign Exception Recording Modal.
  - `Footer.tsx`: Fixed persistent operational footer with keyboard shortcuts.

### Rule 16: Zero Breaking Changes to Server Stack
- Frontend connects to FastAPI backend at `http://127.0.0.1:8000`.
- All endpoints must remain backward-compatible with frozen contracts:
  - `POST /api/audit`
  - `GET /api/audit/{id}`
  - `POST /api/audit/{id}/adjudicate`
  - `GET /api/dossier/{id}/pdf`
  - `GET /api/verify/{digest}`
  - `GET /api/standards`
  - `GET /api/standards/{is_number}`
  - `GET /api/graph/{id}`

---

## 6. Pre-Flight Verification Checklist (The 12 Implementation Gates)

Before the frontend implementation is approved, every gate must be validated:

| Gate | Requirement | Verification Method |
| :---: | :--- | :--- |
| **G-01** | Initial Workspace Cleanliness | Clean render with benchmark corpus buttons; no broken states. |
| **G-02** | Sub-Second Benchmark Ingestion | Clicking `NHAI-CEMENT` loads audit and updates all 7 views in <500ms. |
| **G-03** | Gate Status Authenticity | Gate Status displays true domain enum (`STATUTORY_NON_COMPLIANT`). |
| **G-04** | Discrete Defect Accounting | Exactly six discrete counter boxes; no arbitrary percentage scores. |
| **G-05** | Cascading Obsolescence Callout | Renders alert explaining parent standard `IS 456` incorporating `IS 269`. |
| **G-06** | 40/60 Asymmetric Split Geometry | Clause Triage, Standards, Invariants, and Corrigenda render in 40/60 split. |
| **G-07** | Side-by-Side Corrigenda Redline | Defective clause prose (red) vs Compliant replacement (green) with 1-click copy. |
| **G-08** | Complete 5-Node Provenance Tuple | Provenance tab renders FindingId, RuleId, KnowledgeFactRef, RequirementRef, SegmentRef. |
| **G-09** | Live Sovereign Adjudication | Recording an exception updates finding state, recomputes GateStatus, and recalculates SHA-256 digest. |
| **G-10** | Publication PDF Streaming | Clicking Download Dossier streams valid PDF with embedded SHA-256 digest. |
| **G-11** | Keyboard Direct Navigation | Pressing `1` through `7` navigates views immediately. |
| **G-12** | Zero TypeScript / Build Warnings | `npm run build` succeeds in <3s with 0 errors. |
