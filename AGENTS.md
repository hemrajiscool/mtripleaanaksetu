# Master Cortex Autonomous Resolution Protocol

This workspace is powered by **Master Cortex for Antigravity** — an autonomous two-tier skill control plane and dormant knowledge indexing architecture covering **1,027+ specialized skills** (~1.93M tokens of capability) at zero upfront context overhead.

## Architecture

1. **Tier 1: Active Control Plane (<1,500 tokens metadata)**
   - `cortex-router`: Classifies user intent across 19 domains and formulates the deterministic Route Plan.
   - `cortex-loader`: Hydrates primary controllers and companions on-demand via `view_file` from `~/.gemini/config/<path>`.
   - `cortex-guardrails`: Resolves cross-skill conflicts via the 7-level precedence ladder and enforces safety/clean-room boundaries.
   - `cortex-sync`: Maintains index health, monitors catalogs, and discovers new skills.

2. **Tier 2: Dormant Library & Offline Vaults (Indexed)**
   - Curated Library: `~/.gemini/config/library/` (207 installed dormant skills).
   - Offline Vaults: `~/.gemini/config/vaults/` (820 catalog skills from Antigravity & Awesome skills).
   - Unified Index: `~/.gemini/config/cortex/index.json` (1,027 valid records, precomputed synergies and token footprints).

3. **Compound Execution Workflows (`~/.gemini/config/cortex/workflows/`)**
   - `replicator.yaml`: Clean-room application replication & reverse engineering.
   - `frontend.yaml`: Anti-slop bespoke frontend engineering & motion.
   - `refactor.yaml`: Zero-regression feature delivery & TDD.
   - `compression.yaml`: Token compression, terse caveman mode & YAGNI discipline.
   - `research.yaml`: Deep multi-source literature review & knowledge synthesis.

## Standing Reflex on Every Prompt

1. **Classify & Route**:
   - `cortex-router` analyzes user prompt against `ontology.json` and `index.json`.
   - Selects 1 Primary Controller + up to 3 Companions (scoring threshold >= 0.35).
   - Maps to one of the 5 declarative workflow DAGs or executes focused single-skill flow.

2. **Hydrate on Demand**:
   - `cortex-loader` reads the target skill's `SKILL.md` using `view_file`.
   - Session skill footprint is constrained to <= 6,000 tokens.

3. **Arbitrate Precedence**:
   - `cortex-guardrails` enforces:
     `System Safety > Explicit User Constraint > Workflow Controller > Domain Requirement > Validated Companion > Style > Default Behavior`.

4. **Transparent Execution**:
   - Confirm activation in one concise line:
     `Activated Master Cortex: [primary-skill] + [companions] (workflow: [name])`
   - Proceed with implementation.

## CLI & Maintenance Commands
- Incremental Sync: `python ~/.gemini/config/cortex/cortex-sync.py sync`
- Integrity Check: `python ~/.gemini/config/cortex/cortex-sync.py check`
- Repair & Quarantine: `python ~/.gemini/config/cortex/cortex-sync.py repair`
- Statistics: `python ~/.gemini/config/cortex/cortex-sync.py stats`
- Route Simulation: `python ~/.gemini/config/cortex/cortex-sync.py route "<prompt>"`
