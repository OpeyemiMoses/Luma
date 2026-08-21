# Contributing to Luma Finance

Thank you for your interest in contributing to **Luma Finance**! We welcome contributions from developers, researchers, designers, and DeFi enthusiasts.

---

## 📌 Development Workflow

### 1. Fork & Clone
```bash
git clone https://github.com/<YOUR_USERNAME>/luma-finance.git
cd luma-finance
npm install
```

### 2. Branching Strategy
Create a feature branch from `main`:
```bash
git checkout -b feat/your-feature-name
# or for bug fixes:
git checkout -b fix/your-bug-fix
```

### 3. Commit Guidelines
We adhere to [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` A new feature or capability
- `fix:` A bug fix
- `docs:` Documentation improvements
- `style:` Formatting, missing semicolons, etc.
- `refactor:` Refactoring production code without changing behavior
- `test:` Adding or updating tests
- `chore:` Maintenance tasks, dependency updates

---

## 🧪 Testing & Validation

Before submitting your pull request, please ensure all automated tests pass:

```bash
# Run unit & invariant tests
npm test

# Verify Web App build
npm run build:web
```

---

## 🚀 Submitting a Pull Request

1. Push your changes to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
2. Open a Pull Request against the `main` branch.
3. Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
4. Maintainers will review your PR and provide constructive feedback.

---

## 🛡️ Security Vulnerabilities
If you discover a security vulnerability, please **DO NOT** open a public issue. Review our [Security Policy](SECURITY.md) and report it responsibly.
