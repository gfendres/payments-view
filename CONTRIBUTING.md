# Contributing to Gnosis Card Portfolio Dashboard

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Architecture Guidelines](#architecture-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

> **👋 Welcome!** This is a solo-maintained project, but contributions are very welcome! Don't hesitate to open issues, suggest improvements, or submit PRs. Response times may vary, but all contributions will be reviewed and appreciated.

### Prerequisites

- **Bun** v1.3.5 or later ([Install Bun](https://bun.sh/docs/installation))
- **Node.js** v20.0.0 or later
- **Git** for version control
- A **WalletConnect Project ID** (get one at [WalletConnect Cloud](https://cloud.walletconnect.com/))

### Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:

```bash
git clone https://github.com/YOUR_USERNAME/payments-view.git
cd payments-view
```

3. **Add upstream remote**:

```bash
git remote add upstream https://github.com/gfendres/payments-view.git
```

4. **Install dependencies**:

```bash
bun install
```

5. **Set up environment variables**:

```bash
cp .env.example apps/web/.env.local
# Edit apps/web/.env.local with your WalletConnect Project ID
```

6. **Start development server**:

```bash
bun dev
```

## Development Workflow

### Before Starting Work

1. **Create an issue** or comment on an existing one to discuss your plans (optional but recommended for large changes)
2. **Search the codebase** for existing implementations:

```bash
# Search for components
grep -r "ComponentName" apps/web/components/

# Search for hooks
grep -r "useHookName" apps/web/features/

# Search for utilities
grep -r "functionName" packages/
```

3. **Create a feature branch**:

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### During Development

1. **Follow the architecture** - See [Architecture Guidelines](#architecture-guidelines)
2. **Write tests** - See [Testing](#testing)
3. **Run quality checks frequently**:

```bash
# Type checking
bun run typecheck

# Linting
bun run lint

# Tests
bun test
```

4. **Commit regularly** with meaningful messages (see [Commit Guidelines](#commit-guidelines))

### Before Submitting

1. **Ensure all checks pass**:

```bash
bun run typecheck  # No TypeScript errors
bun run lint       # No linting errors
bun test           # All tests pass
```

2. **Update documentation** if needed
3. **Rebase on latest main**:

```bash
git fetch upstream
git rebase upstream/main
```

## Coding Standards

### General Rules

- ✅ **Max 500 lines per file** - Split into smaller modules if exceeded
- ✅ **Max 30 lines per function** - Extract helper functions
- ✅ **No `any` types** - Use `unknown` and narrow types
- ✅ **No magic numbers** - Use constants from `@payments-view/constants`
- ✅ **Use enums** - No string literals for known values
- ✅ **Decouple logic from UI** - Extract business logic to hooks

### File Naming

- `kebab-case` for all files: `transaction-list.tsx`, `use-auth.ts`
- Suffix by type: `.service.ts`, `.use-case.ts`, `.repository.ts`, `.mapper.ts`
- Test files: `money.test.ts` (same directory or `__tests__` folder)

### Code Naming

- `PascalCase`: Components, Classes, Types, Interfaces, Enums
- `camelCase`: Functions, variables, hooks
- `SCREAMING_SNAKE_CASE`: Constants only in config files
- Prefix interfaces with `I` only for dependency injection: `ILogger`, `ITransactionRepository`

### Import Organization

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. External packages
import { z } from 'zod';

// 3. Internal packages (@payments-view/*)
import { TransactionKind } from '@payments-view/constants';
import { Money } from '@payments-view/domain/transaction';

// 4. Local imports (@/*)
import { useAuth } from '@/features/auth';
import { cn } from '@/lib/utils/cn';

// 5. Relative imports
import { TransactionRow } from './transaction-row';

// 6. Types (always last with 'type' keyword)
import type { Transaction } from '@payments-view/domain/transaction';
```

### TypeScript Standards

```typescript
// ❌ BAD
function process(data: any) {
  if (data.status === 'approved') { ... }
}

// ✅ GOOD
import { TransactionStatus } from '@payments-view/constants';
import type { Transaction } from '@payments-view/domain/transaction';

function process(data: Transaction): Result<ProcessedData, ValidationError> {
  if (data.status === TransactionStatus.APPROVED) { ... }
}
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
type(scope): description

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code refactoring (no functional changes) |
| `docs` | Documentation changes |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks (deps, config) |
| `style` | Code style changes (formatting, no logic change) |
| `perf` | Performance improvements |

### Scopes

Use the feature or package name: `auth`, `transactions`, `rewards`, `ui`, `api`, `domain`, etc.

### Examples

```bash
# Feature
git commit -m "feat(transactions): add transaction filtering by date range"

# Bug fix
git commit -m "fix(auth): resolve wallet connection timeout on mobile"

# Refactoring
git commit -m "refactor(domain): extract Money value object"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Multiple changes (use body)
git commit -m "feat(rewards): implement cashback tier calculation

- Add CashbackTier value object
- Add tier calculation service
- Add tier display component
- Update rewards dashboard"
```

## Pull Request Process

### Creating a Pull Request

1. **Push your branch**:

```bash
git push origin feat/your-feature-name
```

2. **Open a PR** on GitHub with:
   - Clear title following commit convention: `feat(scope): description`
   - Description explaining:
     - What changes were made
     - Why they were needed
     - How to test them
   - Link to related issue(s)
   - Screenshots/videos for UI changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Closes #123

## How to Test
1. Step 1
2. Step 2
3. Expected result

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No linting errors
- [ ] No TypeScript errors
```

### Review Process

1. **Automated checks** must pass (linting, type checking, tests)
2. **Code review** by the maintainer
3. **Address feedback** - make requested changes
4. **Approval** - PR will be merged by maintainer once approved

> **Note**: This is a solo-maintained project. Reviews may take a few days depending on availability.

### After Merge

1. **Delete your branch**:

```bash
git branch -d feat/your-feature-name
git push origin --delete feat/your-feature-name
```

2. **Update your fork**:

```bash
git checkout main
git pull upstream main
git push origin main
```

## Architecture Guidelines

This project follows **Domain Driven Design (DDD)** with strict layer separation.

### Layer Rules

```
UI Layer (apps/web)
    ↓ calls
API Layer (packages/api - tRPC)
    ↓ calls
Application Layer (packages/application - Use Cases)
    ↓ orchestrates
Domain Layer (packages/domain - Business Logic)
    ↑ implements
Infrastructure Layer (packages/infrastructure - External APIs)
```

### Where to Put Code

| What | Where |
|------|-------|
| Enums/Constants | `packages/constants/src/enums` |
| Config | `packages/constants/src/config` |
| Domain entities | `packages/domain/src/<domain>/entities` |
| Value objects | `packages/domain/src/<domain>/value-objects` |
| Use cases | `packages/application/src/use-cases` |
| API clients | `packages/infrastructure/src/<service>` |
| API schemas (Zod) | `packages/infrastructure/src/<service>/schemas` |
| tRPC routers | `packages/api/src/routers` |
| UI primitives | `packages/ui/src/primitives` |
| Shared components | `packages/ui/src/components` |
| Feature hooks | `apps/web/src/features/<feature>/hooks` |
| Feature components | `apps/web/src/features/<feature>/components` |

### Key Principles

1. **Domain layer is pure** - No external dependencies, no I/O
2. **Use Result type** - No throwing errors, return `Result<T, E>`
3. **Validate at boundaries** - Use Zod schemas for external data
4. **Decouple UI from logic** - Business logic in hooks, not components
5. **Dependency injection** - Pass dependencies via constructors

## Testing

### Running Tests

```bash
# Run all tests
bun test

# Watch mode
bun test --watch

# With coverage
bun test --coverage

# Specific file
bun test path/to/file.test.ts
```

### Writing Tests

```typescript
import { describe, test, expect, beforeEach } from 'bun:test';

describe('Money', () => {
  test('should format EUR correctly', () => {
    const money = Money.create('2550', CurrencyCode.EUR, 2);
    expect(money.format()).toBe('€25.50');
  });

  test('should handle zero amount', () => {
    const money = Money.create('0', CurrencyCode.EUR, 2);
    expect(money.toNumber()).toBe(0);
  });
});
```

### Test Coverage

- **Domain layer**: 80%+ coverage required
- **Application layer**: 70%+ coverage required
- **UI components**: Test critical user flows
- **Hooks**: Test state management and side effects

## Documentation

### When to Update Docs

| Document | Update When |
|----------|-------------|
| `README.md` | Features, setup, or usage changes |
| `docs/architecture.md` | Architecture decisions or patterns change |
| `docs/design.md` | UI patterns or design system changes |
| `docs/deployment.md` | Deployment process changes |
| Code comments | Complex logic that isn't self-explanatory |

### Documentation Style

- Use clear, concise language
- Include code examples
- Add diagrams for complex flows (use Mermaid)
- Keep examples up to date with code

## Getting Help

- **Questions**: Open a [Discussion](https://github.com/gfendres/payments-view/discussions)
- **Bugs**: Open an [Issue](https://github.com/gfendres/payments-view/issues)
- **Security**: See [SECURITY.md](SECURITY.md)

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- README acknowledgments for major features

## About This Project

This project is maintained by [@gfendres](https://github.com/gfendres) as a solo effort, but **contributions from the community are highly valued and encouraged**! Whether you're fixing a typo, reporting a bug, or implementing a major feature, your help makes this project better.

### Response Times

As a solo-maintained project, please be patient:
- **Issues**: Response within 2-3 days
- **PRs**: Review within 3-5 days
- **Security issues**: Response within 4 days (as per SECURITY.md)

Your understanding is appreciated! 🙏

---

Thank you for contributing to Gnosis Card Portfolio Dashboard! 🎉

