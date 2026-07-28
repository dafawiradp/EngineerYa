# Contributing to EngineerYa

Thank you for taking the time to contribute to EngineerYa! This is an open-source project and all kinds of contributions are welcome — from bug fixes and new features to documentation improvements and design feedback.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Development Setup](#development-setup)
- [Branching & Commit Conventions](#branching--commit-conventions)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Architecture Rules](#architecture-rules)

---

## Code of Conduct

By participating in this project you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behaviour to [security@engineerya.com].

---

## I Have a Question

Before opening an issue, please search the existing [Issues](https://github.com/dafawiradp/EngineerYa/issues) and [Discussions](https://github.com/dafawiradp/EngineerYa/discussions) — your question may already be answered.

---

## Reporting Bugs

Open a [GitHub Issue](https://github.com/dafawiradp/EngineerYa/issues/new) with:
1. **Environment:** Node version, OS, Docker version
2. **Steps to reproduce** the issue
3. **Expected behaviour** vs **actual behaviour**
4. Relevant **log output** or **stack traces** (redact any secrets)

> ⚠️ **Security vulnerabilities** must be reported privately. See [SECURITY.md](SECURITY.md).

---

## Suggesting Features

Open an Issue tagged `enhancement` and describe:
1. The problem you are trying to solve
2. Your proposed solution
3. Alternatives you considered

---

## Development Setup

### Prerequisites

- **Node.js** ≥ 20
- **Docker** & **Docker Compose**

### Steps

```bash
# 1. Fork and clone
git clone https://github.com/<your-fork>/EngineerYa.git
cd EngineerYa/engineerya

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Leave all defaults for local development

# 4. Start infrastructure
docker compose up -d postgres redis meilisearch

# 5. Generate Prisma client
npm run db:generate

# 6. Run the stack
npm run dev:api     # Terminal 1 — http://localhost:4000/api/v1/health
npm run dev:web     # Terminal 2 — http://localhost:3000
```

---

## Branching & Commit Conventions

| Type | Branch format | Commit prefix |
|---|---|---|
| Feature | `feat/short-description` | `feat: …` |
| Bug fix | `fix/short-description` | `fix: …` |
| Docs | `docs/short-description` | `docs: …` |
| Refactor | `refactor/short-description` | `refactor: …` |
| Tests | `test/short-description` | `test: …` |
| Chore | `chore/short-description` | `chore: …` |

We follow [Conventional Commits](https://www.conventionalcommits.org/) loosely.

**Always branch from `develop`**, not `main`.

---

## Code Style

The entire codebase is TypeScript. Please observe these rules:

- **Strict mode is on.** Never use `any` unless there is genuinely no alternative — add a comment explaining why.
- **ESLint + Prettier** are configured. Run `npm run lint:fix` and `npm run format` before committing.
- **Imports** use absolute paths with the workspace package names (e.g. `@engineerya/shared-types`), not relative `../../../` paths where avoidable.
- **No `console.log`** in production code. Use NestJS's `Logger` in the API. The one exception (`main.ts` startup log) is explicitly suppressed from ESLint.

---

## Testing

```bash
# Run all tests
npm run test

# Run tests for a specific workspace
npm run test --workspace=apps/api
```

When adding a new use-case or service, add a corresponding unit test in the same module under a `__tests__/` directory. Tests are written with Jest + `@nestjs/testing`.

---

## Pull Request Process

1. **Create a branch** from `develop` following the naming convention above.
2. **Make your changes.** Keep commits atomic and focused.
3. **Verify all checks pass locally:**
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   npm run build
   ```
4. **Open a PR** targeting `develop`. Fill in the PR template (what, why, how to test).
5. **Wait for CI** — the GitHub Actions workflow must go green.
6. **Request review** from a maintainer. Address review comments.
7. Once approved, a maintainer will squash-merge into `develop`.

`develop` is periodically merged into `main` as a tagged release.

---

## Architecture Rules

The backend follows **Clean Architecture**. Before adding code, understand the layer rules:

| Layer | Rule |
|---|---|
| `domain/` | **Zero** NestJS or Prisma imports. Pure TypeScript entities and interface ports only. |
| `application/` | Depends only on `domain/`. No HTTP concepts (Request, Response). |
| `infrastructure/` | Implements domain ports using concrete adapters (Prisma, bcrypt, JWT, S3). |
| `presentation/` | NestJS controllers, DTOs, mappers. Only calls application use-cases. |

**`fileKey` rule:** The `Book.fileKey` field must never appear in any DTO, controller response, or query `select`. The `PUBLIC_BOOK_SELECT` constant in the book repository is the enforcer — do not add `fileKey` to it.

**Domain events, not direct calls:** Cross-module communication (e.g. Catalog → Search) must use NestJS `EventEmitter2` events. Modules must not import from sibling modules' internals.
