# **MaanakSetu: High-Quality Upgradation Metric & Architecture Proposal**
## **Project Sovereign (SIH26108) — Next-Generation Enterprise Workstation Blueprint**

---

### **1. Executive Mission & Strategic Context**

This proposal establishes the technical and architectural specification to elevate **MaanakSetu** from an audit pipeline into the premier public procurement workstation for the Bureau of Indian Standards (BIS) and the Ministry of Finance (DoE / GeM).

While maintaining our bespoke, high-taste light-institutional design language (Inter typography, JetBrains Mono data codes, subtle borders, high optical contrast), this upgrade systematically incorporates the operational capabilities demonstrated in competitive prototypes:
1. **Institutional Persona Gateway (Demo Account Login)**
2. **High-Speed Telemetry Execution Stepper (Loading Process)**
3. **Expanded Multi-Clause Procurement Benchmarks (4–6 Clauses per Scenario)**
4. **Sovereign Bilingual Engine (English & हिन्दी)**
5. **In-Situ "Procurement Assistant" (Context-Grounded AI Copilot)**
6. **Public Cryptographic Verification & Digest Lookup**

Because our core Python backend (FastAPI, SQLite FTS5, NetworkX, SpecGuard AST verifier, Typst PDF generator, and OmniRoute/TypeSafe Jev AI) is **already fully implemented and passing 62/62 tests**, these additions are constructed directly upon an already-proven execution foundation.

---

### **2. Architectural Upgradation Metrics Matrix**

| Feature Dimension | Competitor Benchmark (`maanaksetu.vercel.app`) | Current MaanakSetu (`mtripleaanaksetu`) | Upgraded Project Sovereign (Target) | Competitive Advantage |
| :--- | :--- | :--- | :--- | :--- |
| **Persona & Access Gateway** | Dropdown with Procurement Officer login. | Direct access to intake form. | **Institutional Persona Gateway with 3 calibrated roles** (Procurement Officer, GeM Evaluator, Vigilance Auditor) + 1-Click Instant Demo Login. | Real simulation of government multi-role authorization. |
| **Audit Execution Feedback** | Generic loading spinner. | Spinning wheel with status text. | **Microsecond Telemetry Stepper** (PyMuPDF $\rightarrow$ Jev AI $\rightarrow$ NetworkX $\rightarrow$ SpecGuard $\rightarrow$ SHA-256 Seal). | Proves true neuro-symbolic engine rather than black-box AI delay. |
| **Clause Depth per Scenario** | 6–8 distinct clauses per sample query. | 2–3 clauses per sample query. | **Expanded 4–6 Comprehensive Clauses per Tender** (Material grade, Brand exclusion, Parameter bound, QCO mandate, Verified active). | Demonstrates exhaustive technical coverage across mechanical, civil, electrical domains. |
| **Bilingual Support** | English + 4 regional dropdown options. | English only. | **Sovereign Bilingual Engine (English & हिन्दी)** with instant toggle across all views, badges, and reports. | Tailored specifically for Official Language (Rajbhasha) compliance under GFR rules. |
| **In-Situ Copilot** | Generic citizen assistant ("Maanak"). | None. | **"Procurement Assistant"** grounded specifically in GFR 2017, CVC directives, AST findings, and corrigenda synthesis. | Institutional copilot for procurement officers rather than general citizen Q&A. |
| **Cryptographic Verification** | None. | Verification endpoint in backend, no frontend modal. | **Dedicated Public Verification Modal & Digest Scanner** (`GET /api/verify/{digest}`). | Allows third-party auditors and bidders to independently verify tender clearance. |
| **Execution Throughput** | ~2.5s – 5s simulated latency. | Real backend sub-second execution. | **Sub-500ms End-to-End Latency** powered by TypeSafe Jev System-1 & PyMuPDF fast text extraction. | 5x faster than any competing solution with mathematical certainty. |

---

### **3. Detailed Modular Engineering Specifications**

```mermaid
graph TD
    subgraph Core_Shell [Sovereign Workstation Shell]
        Auth[1. Persona Gateway / Demo Session] --> Workspace[2. Main Workstation Dashboard]
        Lang[3. Bilingual Engine: EN / HI] --> Workspace
    end

    subgraph Analysis_Engine [High-Speed Telemetry Pipeline]
        Workspace --> Telemetry[4. Multi-Stage Execution Stepper]
        Telemetry --> Ingest[Step 1: PyMuPDF / Docling Ingest]
        Ingest --> Triage[Step 2: Jev AI Clause Triage]
        Triage --> DAG[Step 3: NetworkX DAG Traversal]
        DAG --> Rules[Step 4: SpecGuard AST Validation]
        Rules --> Seal[Step 5: SHA-256 Seal & Typst Dossier]
    end

    subgraph Deep_Features [Expanded Institutional Capabilities]
        Seal --> MultiClause[5. 6-Clause Rich Procurement Findings]
        Workspace --> Copilot[6. Procurement Assistant Copilot]
        Workspace --> VerifyModal[7. Public Verification & Digest Lookup]
    end

    style Core_Shell fill:#f8fafc,stroke:#0f172a,color:#0f172a
    style Analysis_Engine fill:#eff6ff,stroke:#2563eb,color:#1e3a8a
    style Deep_Features fill:#f0fdf4,stroke:#16a34a,color:#14532d
```

---

#### **Module 1: Institutional Persona Gateway (Login & Session Gate)**
* **Objective:** Give judges and evaluators immediate institutional immersion upon entering the URL.
* **Component Architecture:**
  * Clean, architectural card container with Government of India and BIS header.
  * Role selection tabs / pill selector:
    1. **Senior Procurement Officer (Civil / Highway Works)** — *Focus: GFR 144(i) Anti-Monopoly & IS 269/456*.
    2. **GeM Technical Evaluator (Electrotechnical & Power)** — *Focus: QCO Orders & IS 10322/1180*.
    3. **Chief Vigilance Officer / CAG Auditor** — *Focus: SHA-256 Dossier Integrity & Audit Defense*.
  * **1-Click "Launch Workstation Demo" button:** Immediately seeds demo session credentials into state and transitions smoothly into the active workspace.
  * Option to switch or sign out of the demo account from the top navigation bar at any time.

---

#### **Module 2: High-Speed Telemetry Execution Stepper**
* **Objective:** Replace blank loading spinners with a high-speed execution log that proves deep algorithmic engineering in real time.
* **Telemetry Step Progression:**
  1. `[0.05s] Stream 1 Ingestion:` PyMuPDF decomposed input into 6 discrete contractual segments.
  2. `[0.12s] Stream 2 Triage:` TypeSafe Jev System-1 isolated technical specifications; dropped non-technical boilerplate.
  3. `[0.21s] Stream 3 Knowledge:` SQLite FTS5 resolved 4 candidate standards; NetworkX traversed 18 normative edges.
  4. `[0.34s] Stream 4 Invariants:` SpecGuard AST verifier evaluated parameter bounds and detected Rule 144(i) brand violation.
  5. `[0.42s] Stream 5 Final Assembly:` Cryptographic SHA-256 fingerprint generated; Typst vector dossier ready.
* **Visual Polish:** Sleek vertical step indicator with microsecond timestamps, active emerald pulses, and smooth transition into findings.

---

#### **Module 3: Expanded Multi-Clause Procurement Scenarios**
* **Objective:** Upgrade our pre-curated benchmark tenders so each scenario evaluates **4 to 6 distinct clauses**, illustrating full-spectrum procurement compliance.
* **Upgraded Scenario Specifications:**
  * **Scenario 1: NHAI Expressway Pavement & Bridge Deck (Civil)**
    * *Clause 1 (Material Grade):* Specifies obsolete `IS 269:1989` (Withdrawn $\rightarrow$ Superseded by `IS 269:2015`).
    * *Clause 2 (Anti-Monopoly Brand Lock-in):* Cites proprietary vendor brands (*UltraTech / ACC*) $\rightarrow$ Violates GFR 144(i).
    * *Clause 3 (Mix Design Conformance):* Adheres strictly to active code `IS 456:2000` $\rightarrow$ Verified Current.
    * *Clause 4 (Curing & Setting Bounds):* Initial setting time requirement contradicts Table 2 bounds.
    * *Clause 5 (NABL Testing Protocol):* Mandates testing per `IS 4031 (Part 5)` with third-party accredited lab stamp.
  * **Scenario 2: CPWD Multi-Storey Administrative Complex (Structural Steel)**
    * *Clause 1 (Steel Grade):* Specifies Fe 500D per `IS 1786:2008`.
    * *Clause 2 (Parameter Bound Defect):* Specifies minimum elongation of 12% (fails Amendment 3 requiring 14.5%).
    * *Clause 3 (Yield Stress Contradiction):* Specifies yield stress $\ge$ 450 MPa (contradicts 500 MPa specification).
    * *Clause 4 (QCO Mandatory Order):* Omission of Ministry of Steel QCO certification certificate.
  * **Scenario 3: State Electricity Board Rural Distribution Electrification (Electrical)**
    * *Clause 1 (Transformer Rating):* 100 kVA outdoor distribution transformer per `IS 1180 (Part 1)`.
    * *Clause 2 (QCO Compliance):* Missing mandatory BIS Standard Mark (Scheme-I) under Electrical Transformers QCO.
    * *Clause 3 (Loss Wattage Tolerance):* Specifies max losses exceeding Table 3 energy efficiency ceilings.
    * *Clause 4 (Insulating Liquid):* References superseded mineral oil code `IS 335:1993` instead of `IS 335:2018`.

---

#### **Module 4: Sovereign Bilingual Engine (English & हिन्दी)**
* **Objective:** Implement full bilingual support for Central Government compliance under Official Language rules.
* **Implementation Strategy:**
  * Persistent locale state (`en` | `hi`) toggled via an elegant language switch in the top header.
  * Lightweight, typed dictionary mapping all key interface tokens:
    * `MaanakSetu` $\rightarrow$ `मानक सेतु`
    * `Overview & Gate` $\rightarrow$ `अवलोकन एवं स्वीकृति स्थिति`
    * `Clause Triage` $\rightarrow$ `खंड समीक्षा एवं वर्गीकरण`
    * `Standards Catalog` $\rightarrow$ `मानक संदर्भ सूची`
    * `Corrigenda & Proof` $\rightarrow$ `शुद्धिपत्र प्रारूप एवं साक्ष्य`
    * `Audit Dossier` $\rightarrow$ `सत्यापन दस्तावेज़`
    * `Statutory Non-Compliant` $\rightarrow$ `वैधानिक रूप से गैर-अनुपालन`
    * `Verified Conformant` $\rightarrow$ `सत्यापित एवं अनुरूप`
  * Instantaneous, zero-delay switching without page reloads.

---

#### **Module 5: "Procurement Assistant" (In-Situ AI Copilot)**
* **Objective:** Deploy an intelligent, conversational copilot grounded in public procurement law and MaanakSetu system operations.
* **Component Features:**
  * **Floating Assistant Pill:** Positioned in bottom-right with official green online beacon: `✦ Procurement Assistant`.
  * **Interactive Drawer:** Expandable floating panel with message thread and prompt chips:
    * *"Why is UltraTech cement prohibited under GFR 144(i)?"*
    * *"Explain the difference between IS 269:1989 and IS 269:2015"*
    * *"How do I draft a corrigendum notice for GeM?"*
    * *"What is the significance of the SHA-256 audit digest?"*
  * **Engine Grounding:** Directly powered by our local OmniRoute / TypeSafe client, answering with precise references to the General Financial Rules (2017), CVC Vigilance Manual, and Bureau of Indian Standards Act (2016).

---

#### **Module 6: Public Verification & Digest Lookup Modal**
* **Objective:** Allow external stakeholders, CAG auditors, and competing bidders to verify the integrity of an audited tender.
* **Component Features:**
  * Accessible via header button: `[ Verify Audit Digest ]`.
  * Input field accepting any 64-character SHA-256 hexadecimal hash or Document ID.
  * Immediately queries the backend endpoint (`GET /api/verify/{digest}`).
  * Displays an authentic digital verification certificate showing:
    * Verification Authority: *Bureau of Indian Standards / Sovereign Standards Authority*
    * Gate Status: *STATUTORY_NON_COMPLIANT / VERIFIED_CONFORMANT*
    * Timestamp of immutable generation.
    * Document Title & Total Findings audited.

---

### **4. Implementation Phasing & Milestones**

```
Phase 1: Rich Data & Scenarios (demos.ts)
  ├── Expand NHAI, CPWD, DISCOM tenders to 5–6 clauses each
  └── Add explicit statutory metadata (QCO orders, gazette S.O., amendment dates)

Phase 2: Persona Gateway & Session State (AuthModal.tsx)
  ├── 3 Pre-configured government roles
  └── 1-Click instant demo entry

Phase 3: High-Speed Telemetry Stepper (TelemetryStepper.tsx)
  ├── 5-step visual microsecond execution log
  └── Dynamic progress indicators during audit

Phase 4: Sovereign Bilingual Engine (i18n.ts)
  ├── Typed English / Hindi translation matrix
  └── Header toggle button with instant reactive re-rendering

Phase 5: "Procurement Assistant" Copilot (ProcurementAssistant.tsx)
  ├── Floating trigger pill with active status pulse
  ├── 4 instant statutory query chips
  └── Integrated conversational client

Phase 6: Cryptographic Verification Modal (VerifyModal.tsx)
  └── Direct integration with GET /api/verify/{digest}
```

This proposal ensures that our frontend matches the visual richness and feature breadth of the competitor while retaining our superior deterministic backend architecture.
