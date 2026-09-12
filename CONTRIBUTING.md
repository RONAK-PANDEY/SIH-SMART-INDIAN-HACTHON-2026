# Contributing to SmartCare

Thank you for your interest in contributing to **SmartCare** — the AI-powered Smart OPD Queue, Triage & Government Vigilance Platform for SIH 2026!

---

##  Getting Started

### Prerequisites

- **Python 3.11+** for backend development
- **Node.js 18+** and **npm 9+** for frontend development
- **Android Studio** (latest) for scanner app development
- **Git** for version control

### Setup

```bash
# Clone the repository
git clone https://github.com/RONAK-PANDEY/SIH-SMART-INDIAN-HACTHON-2026.git
cd SIH-SMART-INDIAN-HACTHON-2026

# Backend setup
cd backend
pip install -r requirements.txt
cp .env.example .env

# Frontend setup (repeat for admin-portal and govt-portal)
cd ../patient-portal
npm install
```

---

##  Code Style

### Python (Backend)
- Follow **PEP 8** style guidelines
- Use **type hints** for all function signatures
- Use **Pydantic** models for request/response schemas
- Keep functions focused and under 50 lines
- Write docstrings for all public functions

### TypeScript/React (Frontend)
- Use **TypeScript** strict mode — no `any` types
- Use **functional components** with hooks
- Follow **React naming conventions**: `PascalCase` for components, `camelCase` for functions
- Use **Tailwind CSS** utility classes — avoid inline styles
- Keep components under 200 lines; extract sub-components when needed

### Kotlin (Android Scanner)
- Follow **Kotlin coding conventions**
- Use **Jetpack Compose** for all new UI
- MVVM architecture pattern

---

##  Branch Naming Convention

| Type | Format | Example |
|------|--------|-------|
| Feature | `feature/<description>` | `feature/multilingual-triage` |
| Bug fix | `fix/<description>` | `fix/qr-scan-duplicate` |
| Documentation | `docs/<description>` | `docs/api-reference` |
| Hotfix | `hotfix/<description>` | `hotfix/jwt-expiry` |
| Refactor | `refactor/<description>` | `refactor/queue-engine` |

---

##  Commit Messages

Follow the **Conventional Commits** specification:

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Types
| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, no logic change) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Build, CI, or tooling changes |

### Examples
```
feat(triage): add Tamil language support for symptom input
fix(scanner): prevent duplicate QR scan submissions
docs(readme): update API endpoint reference table
test(queue): add priority calculation edge case tests
```

---

##  Pull Request Process

1. **Create a branch** from `main` using the naming convention above
2. **Make your changes** with clear, focused commits
3. **Run tests** before submitting:
   ```bash
   cd backend && python -m pytest tests/ -v
   ```
4. **Update documentation** if your changes affect APIs, features, or setup
5. **Open a Pull Request** with:
   - Clear title following commit convention
   - Description of what changed and why
   - Screenshots for UI changes
   - Link to related issues
6. **Request review** from at least one team member
7. **Address feedback** promptly

### PR Checklist
- [ ] Code follows the project's style guidelines
- [ ] Self-review completed
- [ ] Tests pass locally
- [ ] Documentation updated (if applicable)
- [ ] No sensitive data (keys, passwords) committed
- [ ] No `console.log` or debug prints in production code

---

##  Testing

```bash
# Unit tests
cd backend && python -m pytest tests/module/ -v

# Integration tests
python -m pytest tests/e2e/ -v

# E2E browser tests
npx playwright test

# Frontend type checking
cd patient-portal && npx tsc --noEmit
cd admin-portal && npx tsc --noEmit
cd govt-portal && npx tsc --noEmit
```

---

##  Project Structure

| Directory | Language | Owner | Description |
|-----------|----------|-------|-------------|
| `backend/` | Python | Arpan, Kartik | FastAPI backend, ML models, services |
| `patient-portal/` | TypeScript/React | Rishikesh | Citizen OPD portal |
| `admin-portal/` | TypeScript/React | Alok | Doctor console |
| `govt-portal/` | TypeScript/React | Ajay Kumar | Government vigilance portal |
| `smartcare-scanner/` | Kotlin | Shristi | Android QR scanner app |
| `tests/` | Python/TS | All | Test suites |
| `docs/` | Markdown | All | Documentation |

---

**Thank you for helping make India's public healthcare smarter! 🇮🇳**
