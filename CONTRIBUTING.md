# Contributing to MaanakSetu (मानकसेतु)

Thank you for your interest in contributing to **MaanakSetu (Project Sovereign)** — an open-source Neuro-Symbolic Regulatory Verification Engine for Indian Public Procurement (SIH 2026 Problem Statement SIH26108).

We welcome contributions from developers, procurement specialists, and standards engineers!

---

## 1. Code of Conduct

All contributors are expected to uphold a respectful, inclusive, and collaborative environment. Be transparent, objective, and constructive in all discussions.

---

## 2. Development Workflow

### Prerequisites
- Python 3.11+
- Node.js 20+ & npm
- Git

### Getting Started
1. **Fork & Clone**:
   ```bash
   git clone https://github.com/hemrajiscool/mtripleaanaksetu.git
   cd mtripleaanaksetu
   ```

2. **Backend Setup**:
   ```bash
   python -m venv .venv
   .\.venv\Scripts\activate      # Windows
   pip install -r requirements.txt
   pip install pytest pytest-asyncio
   ```

3. **Frontend Setup**:
   ```bash
   cd ui
   npm install
   npm run dev
   ```

---

## 3. Submitting Pull Requests

1. **Create a topic branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Commit Conventions**:
   We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
   - `feat(core)`: New features or major capabilities
   - `fix(verification)`: Bug fixes or AST rule corrections
   - `docs(readme)`: Documentation improvements
   - `test(rules)`: Test suite additions or enhancements
   - `refactor(graph)`: Code changes that neither fix a bug nor add a feature

3. **Test Verification**:
   Before submitting your PR, verify that all deterministic verification tests pass:
   ```bash
   pytest tests/ -v -m "not integration"
   ```

4. **Open a PR**:
   Provide a clear summary of your changes, reference any related GitHub issues, and confirm that your tests pass.

---

## 4. Reporting Issues & Vulnerabilities

- Use GitHub Issues to submit bug reports, feature requests, or RFC proposals.
- For security vulnerabilities, please open a private security advisory or contact `architect@maanaksetu.gov.in`.
