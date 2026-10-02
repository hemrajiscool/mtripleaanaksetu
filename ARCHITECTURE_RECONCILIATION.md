# Architecture Reconciliation: Harmonizing Visual Research with the Frozen Specification

**Document Version:** 1.0  
**Author:** Lead Design Architect & Systems Auditor  
**System:** MaanakSetu (मानक सेतु) — Project Sovereign  
**Governing Standard:** `ARCHITECTURE.md` (Frozen Architecture Specification)  
**Status:** Approved Architectural Reconciliation  

---

## 1. Executive Statement of Architectural Authority

Visual reference studies—including operational prototypes, sovereign command systems (ISRO/INCOIS Blue Orbit), and technical manifestos (TypeSafe AI)—provide vital ergonomic and spatial insights. However, **the frozen backend architecture (`ARCHITECTURE.md`) is unconditionally authoritative over all visual and interaction design.**

Where visual research proposed concepts that contradict the mathematical, regulatory, or epistemic boundaries of MaanakSetu, those concepts are hereby **formally audited, rejected, or reframed as legitimate UI abstractions**. Under no circumstance will the frontend implement decorative claims that exceed the backend's proven computational capabilities or legal authority.

---

## 2. Forensic Re-Evaluation of the Seven Specific Discrepancies

### 1. Re-Evaluation: "58/100 Advisory Index"
- **Preliminary Research Claim:** The UI should feature a prominent `ADVISORY RISK INDEX: 58 / 100 [Deductive Assessment]` as the primary executive score.
- **Architectural Conflict (`ARCHITECTURE.md` § 4.1):**
  > *"The engine never computes an arbitrary numerical percentage (such as 78%) to represent compliance. A single mandatory regulatory violation cannot be 'offset' by compliant clauses. The engine produces an unequivocal Statutory Gate Status."*
  In Indian public procurement under GFR 2017 Rule 173(v) and the BIS Act 2016 Section 16, a tender specification is either legally viable or legally void. If a highway tender mandates withdrawn cement standard `IS 269:1989`, a score of "58/100" creates the catastrophic, false impression that the tender is "more than half compliant." A court or CVO cannot accept a 58% compliant tender.
- **Reconciliation & Legitimate Reframing:**
  - **Repudiated:** "58/100" is strictly banned as an official compliance metric or primary headline.
  - **Authoritative Primary UI Element:** **Document Gate Status** (`STATUTORY_NON_COMPLIANT`, `TECHNICAL_DEFECT`, `ACTION_REQUIRED_REVIEW`, `VERIFIED_CONFORMANT`).
  - **Legitimate Secondary Abstraction:** The backend model (`AuditResult.compliance_score` in `models.py`) maintains an auxiliary integer for UI dashboard sorting. This may be rendered exclusively in small, secondary metadata contexts as a **"Triage Priority Weight (Heuristic)"** to help procurement departments sort a queue of 50 tenders. It must always be visually subordinated to the Gate Status and accompanied by the discrete defect count.

---

### 2. Re-Evaluation: "Mathematical Deduction Ledger"
- **Preliminary Research Claim:** A video-game style deduction breakdown subtracting points (`Base 100 - 15 - 15 - 2 = 58 pts`).
- **Architectural Conflict (`ARCHITECTURE.md` § 4.1, 5):**
  Regulatory verification is not a credit-deduction game. The SpecGuard engine evaluates formal invariants over discrete rules: `RULE-LIFECYCLE-CURRENCY`, `RULE-SCOPE-EXCLUSION`, `RULE-QCO-MANDATORY`, `RULE-BRAND-EXCLUSION`, `RULE-PARAM-CONSTRAINT`. Findings possess qualitative severities (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and statutory bases, not arbitrary point penalties.
- **Reconciliation & Legitimate Reframing:**
  - **Repudiated:** Arbitrary point penalty badges (`-15 pts`, `-2 pts`).
  - **Legitimate UI Reframing:** **Invariant Violation Ledger**. The right-hand inspector panel presents an itemized accounting of evaluated rules grouped by statutory severity:
    - `CRITICAL STATUTORY VIOLATION`: Prohibited obsolete standard cited (`IS 269:1989`) under BIS Act § 16.
    - `HIGH STATUTORY VIOLATION`: Commercial brand restriction (`UltraTech / ACC`) under GFR Rule 144(i).
    - `HIGH CASCADING ALERT`: Active parent code (`IS 456:2000`) normatively incorporates withdrawn standard (`IS 269:1989`).
    - `SATISFIED INVARIANT`: Mandatory QCO certification order verified.
  This preserves the structured accounting layout from Video 3 without fabricating fictional point deductions.

---

### 3. Re-Evaluation: "Statutory Verdict" Terminology
- **Preliminary Research Claim:** Banner text declaring `A STATUTORY CONFORMANCE VERDICT: REVISION REQUIRED`.
- **Architectural Conflict (`ARCHITECTURE.md` § 1.1, 1.3, 4):**
  Software cannot issue "verdicts." A verdict is a sovereign legal determination reserved exclusively for judicial magistrates, the Bureau of Indian Standards, or the Procuring Authority's Competent Financial Authority (CFA). Claiming the engine emits a "verdict" misrepresents the legal character of an automated verification tool.
- **Reconciliation & Legitimate Reframing:**
  - **Repudiated:** The word "Verdict" is expunged from all engine findings.
  - **Legitimate UI Reframing:**
    - Banner Title: **`DOCUMENT GATE STATUS: STATUTORY NON-COMPLIANT`** (or `TECHNICAL DEFECT`, `ACTION REQUIRED REVIEW`, `VERIFIED CONFORMANT`).
    - Finding Label: **`REGULATORY VERIFICATION FINDING`** or **`NON-CONFORMANCE DETERMINATION`**.
    - Subtitle: *"Mandatory statutory violation identified by SpecGuard Rule Invariants over BIS Knowledge Base facts."*

---

### 4. Re-Evaluation: "Deterministic Statutory Determination"
- **Preliminary Research Claim:** Conflating deterministic software verification with statutory authority.
- **Architectural Conflict (`ARCHITECTURE.md` § 1.2, 7):**
  The engine is a *neuro-symbolic verification engine*, not a parliament. AI extracts requirements from free text (probabilistic NLP); SpecGuard verifies parameters against authoritative gazetted facts (deterministic symbolic logic). The determination of compliance is an *engineering verification*, not an act of state sovereignty.
- **Reconciliation & Legitimate Reframing:**
  - **Repudiated:** "Deterministic Statutory Determination".
  - **Legitimate UI Reframing:** **`DETERMINISTIC INVARIANT VERIFICATION`** or **`AUTOMATED SPECIFICATION VERIFICATION`**. The UI explicitly explains that findings represent deterministic evaluation against gazetted standards records in the knowledge base, subject to official human adjudication.

---

### 5. Re-Evaluation: "Certified PDF" & Official BIS Rubber Stamps
- **Preliminary Research Claim:** Red rubber stamp graphics declaring `BUREAU OF INDIAN STANDARDS - ATTESTATION: REVISION MANDATORY` and action button `DOWNLOAD CERTIFIED PDF`.
- **Architectural Conflict (`ARCHITECTURE.md` § 6, `compiler.py`):**
  The system compiles an un-signed Typst PDF document containing the audit findings, requirement traces, and SHA-256 digest. Simulating a stamped, sealed government gazette certificate when no authorized BIS officer has digitally signed the document with a Class-3 PKI DSC token is fraudulent UI theater.
- **Reconciliation & Legitimate Reframing:**
  - **Repudiated:** Decorative red rubber stamps, fake national crests, and the label "Certified PDF".
  - **Legitimate UI Reframing:**
    - Action Button: **`DOWNLOAD AUDIT DOSSIER (PDF)`** or **`EXPORT VERIFICATION DOSSIER (PDF)`**.
    - Attestation Surface: Replaced by the **Human Adjudication Workflow Panel** (`POST /api/audit/{id}/adjudicate`). When a real officer reviews an `UNCERTAIN` finding, records an exception, or confirms a defect, their Officer ID, timestamp, and rationale are rendered in an authentic **Adjudication Audit Block**.

---

### 6. Re-Evaluation: "Immutable SHA-256"
- **Preliminary Research Claim:** Marketing claims of "Immutable Cryptographic State Digest" implying blockchain immutability.
- **Architectural Conflict (`ARCHITECTURE.md` § 5, `orchestrator.py` L40-89):**
  The SHA-256 digest is an in-memory hash computed by `compute_state_digest` over the document ID, segment texts, sorted findings, dependency alerts, and gate status. It is a **tamper-evident state fingerprint and reproducibility digest**, not an immutable distributed ledger.
- **Reconciliation & Legitimate Reframing:**
  - **Repudiated:** "Immutable Blockchain Digest".
  - **Legitimate UI Reframing:** **`CRYPTOGRAPHIC STATE DIGEST (SHA-256)`** or **`AUDIT REPRODUCIBILITY FINGERPRINT`**.
  - UI Copy: *"Deterministic SHA-256 digest computed over extracted segments, evaluated invariant findings, and gate status. Verifiable via `/api/verify/{digest}`."*

---

### 7. Re-Evaluation: "Seven-Stage Terminology" vs Backend Pipeline
- **Preliminary Research Claim:** Labeling the UI views `01 DECISION` through `07 DOSSIER` as "Stages", implying the backend runs a 7-stage sequential pipeline.
- **Architectural Conflict (`ARCHITECTURE.md` § 6):**
  The frozen architecture defines a **Four-Stage Engine Pipeline**:
  - `Stage 1: Ingestion & Requirement Extraction`
  - `Stage 2: Standards Discovery`
  - `Stage 3: Deterministic Invariant Verification`
  - `Stage 4: Output & Presentation Adapters`
  Inside Stage 3, the verifier executes a 6-phase rule suite (Lifecycle, Scope, Constraints, QCOs, Brands, Dependencies).
  The 7 tabs in the UI do not correspond to engine execution steps; they are **analytical views of a single, complete `AuditResult`**.
- **Reconciliation & Legitimate Reframing:**
  - **Repudiated:** Calling UI tabs "Engine Stages" (`Stage 01`, `Stage 02`, etc.).
  - **Legitimate UI Reframing:** **Workstation Audit Surfaces (Views)**:
    - View 1: `[01 OVERVIEW & GATE]`
    - View 2: `[02 CLAUSE TRIAGE]`
    - View 3: `[03 STANDARDS CATALOG]`
    - View 4: `[04 NORMATIVE DAG]`
    - View 5: `[05 RULES & INVARIANTS]`
    - View 6: `[06 CORRIGENDA & PROOF]`
    - View 7: `[07 AUDIT DOSSIER]`
  This retains the numbered navigation cues (`01-07`) and keyboard access (`[1-7] JUMP`) while clearly communicating to the user that they are navigating perspectives of the verified audit dossier.

---

## 3. Reconciliation Against the Ten Governing Boundaries

```
┌────────────────────────────────────────────────────────────────────────┐
│                   THE TEN ARCHITECTURAL BOUNDARIES                     │
├────────────────────────────────┬───────────────────────────────────────┤
│ 1. Core Decision Model         │ 4 Gate Statuses, 3 Decision States    │
│ 2. Uncertainty Model           │ UNCERTAIN finding & Review Workflow   │
│ 3. Pipeline Boundary           │ 4-Stage Engine vs 7 Workstation Views │
│ 4. Evidence/Provenance Model   │ Strict 5-node tuple E = <F,R,K,Req,S> │
│ 5. Scoring Policy              │ Discrete accounting; no fake % scores │
│ 6. AI Execution Boundary       │ Extraction/Summary only; zero rules   │
│ 7. Knowledge/Rules/Evidence    │ Graph/SQL facts separate from rules   │
│ 8. Truthfulness Requirements   │ No fake stamps or exaggerated claims  │
│ 9. UX Doctrine                 │ Answer first, evidence next, hide dev │
│ 10. Anti-Slop Constitution     │ Light institutional, zero cyber fluff │
└────────────────────────────────┴───────────────────────────────────────┘
```

### Boundary 1: Core Decision Model
- **Architectural Source:** `ARCHITECTURE.md` § 4, `states.py`.
- **Binding Rule:** Every finding emitted by the engine must be in exactly one of three `DecisionState` values: `CONFORMANT`, `VIOLATION`, or `UNCERTAIN`.
- **UI Implementation:** Findings are styled according to their true `DecisionState`. Violations use red framing (`#DC2626`), conformant clauses use green framing (`#059669`), and uncertain items use amber framing (`#D97706`).

### Boundary 2: Uncertainty Model & Human Review
- **Architectural Source:** `ARCHITECTURE.md` § 4, 5.1, `states.py`.
- **Binding Rule:** Whenever specification text lacks explicit values or a standard is in a transitional window, the engine halts with `DecisionState.UNCERTAIN` and an explicit `UncertaintyReason` (`AMBIGUOUS_SPECIFICATION`, `KNOWLEDGE_BASE_GAP`, `SCOPE_BOUNDARY_DISPUTE`, `TRANSITIONAL_PERIOD`). This yields a Document Gate Status of `ACTION_REQUIRED_REVIEW`.
- **UI Implementation:** The UI must prominently feature uncertain findings with a dedicated action: **`Adjudicate Finding`**. Clicking this opens the Adjudication Modal, allowing the user to select `CONFIRMED_DEFECT`, `DISMISSED_CONFORMANT`, or `EXCEPTION_RECORDED`, submit officer notes, and execute `POST /api/audit/{id}/adjudicate`.

### Boundary 3: Pipeline Boundary (Engine vs Presentation)
- **Architectural Source:** `ARCHITECTURE.md` § 6.
- **Binding Rule:** The engine pipeline runs to completion on `/api/audit` in sub-second time. The frontend never runs pipeline stages incrementally.
- **UI Implementation:** The UI receives the complete `AuditResult` and presents it across 7 focused Workstation Views. The pipeline telemetry (`total_execution_ms`, `ingestion_ms`, `discovery_ms`, `verification_ms`) is displayed quietly in the footer or overview drawer.

### Boundary 4: Evidence & Provenance Model (5-Node Tuple)
- **Architectural Source:** `ARCHITECTURE.md` § 5.
- **Binding Rule:** Every finding must be bound to:
  $$\mathcal{E} = \langle \text{FindingId}, \text{RuleId}, \text{KnowledgeFactRef}, \text{RequirementRef}, \text{SourceSegmentRef} \rangle$$
- **UI Implementation:** The `[06 CORRIGENDA & PROOF]` view and the finding detail drawer must render all 5 nodes of the provenance tuple in a structured monospace card, including the raw fact payload and exact source clause quote.

### Boundary 5: Scoring Policy
- **Architectural Source:** `ARCHITECTURE.md` § 4.1.
- **Binding Rule:** Compliance is never represented as an arbitrary percentage. A single critical violation invalidates the tender.
- **UI Implementation:** The UI displays the discrete `AuditSummary` metrics: Total Requirements, Conformant, Critical Violations, High Violations, Medium Violations, Pending Reviews. No "Overall 82% Compliant" score is ever calculated or shown.

### Boundary 6: AI Execution Boundary
- **Architectural Source:** `ARCHITECTURE.md` § 1.3, 7.
- **Binding Rule:** AI is strictly confined to requirement extraction and narrative summarization. All compliance determinations are executed by deterministic Python invariant rules in `SpecGuardVerifier`.
- **UI Implementation:** The UI never attributes compliance findings to "AI". The UI displays: *"Evaluated by SpecGuard Deterministic Rules over Authoritative BIS Knowledge Base."* AI is credited solely for *"Requirement Extraction & Overview Narrative Synthesis."*

### Boundary 7: Knowledge / Rules / Evidence Separation
- **Architectural Source:** `ARCHITECTURE.md` § 1.2, 2.
- **Binding Rule:** Knowledge (facts in SQLite/Graph), Rules (invariant verifiers in code), and Evidence (runtime tuples) are strictly distinct.
- **UI Implementation:** 
  - View 03 (`STANDARDS CATALOG`) explores Knowledge Facts.
  - View 05 (`RULES & INVARIANTS`) explores Rule Definitions and Invariant Checks.
  - View 06 (`CORRIGENDA & PROOF`) explores Evidence Tuples.

### Boundary 8: Truthfulness & Non-Fabrication
- **Architectural Source:** Project Sovereign Core Tenets.
- **Binding Rule:** The UI must never claim capabilities or certifications that do not exist.
- **UI Implementation:** Ban fake digital signature certificates, fake BIS seals, and simulated court stamps. The system truthfully presents itself as an automated technical audit workstation.

### Boundary 9: UX Doctrine ("Answer First, Evidence Next, Hide Machinery")
- **Architectural Source:** MaanakSetu UX Doctrine.
- **Binding Rule:** The user is here to do real work. Show the decision immediately. Show the supporting facts on demand. Hide developer noise.
- **UI Implementation:** The Gate Status is visible within 100ms. Findings are immediately accessible. Developer telemetry is hidden from normal view.

### Boundary 10: Product Anti-Slop Constitution
- **Architectural Source:** Product Anti-Slop Constitution.
- **Binding Rule:** Zero decorative visual slop. No dark-mode hacker cosplay, no neon gradients, no floating chat bubbles, no infinite marketing scroll.
- **UI Implementation:** Clean, crisp, high-density light institutional workstation layout.

---

## 4. Conclusion & Architectural Clearance

With these seven re-evaluations and ten boundary reconciliations established:
1. All conflicting ideas from the preliminary video research have been resolved without deleting valid ergonomic insights.
2. The 7-stage visual workflow is preserved as **7 Workstation Audit Views** without misrepresenting the backend engine's 4-stage pipeline.
3. The fake "58/100 score" and "statutory verdict" are replaced by the true **Document Gate Status** and **Discrete Defect Ledger**.
4. The system is 100% compliant with `ARCHITECTURE.md` and ready for formal UI Information Architecture specification.
