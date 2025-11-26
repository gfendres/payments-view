# Gnosis Card Portfolio Dashboard - Technical Architecture

## 🛠️ Engineering Principles

### Core Guidelines

| Principle | Rule | Enforcement |
|-----------|------|-------------|
| **Small Files** | Max 500 lines per file | ESLint rule + PR review |
| **Small Functions** | Max 20-30 lines, single responsibility | ESLint cognitive complexity |
| **DRY** | No duplicate logic, extract to shared utils | SonarQube duplicate detection |
| **SOLID** | Single responsibility, open/closed, etc. | Architecture review |
| **No Magic Numbers** | All constants in dedicated files | ESLint `no-magic-numbers` |
| **Type Safety** | Strict TypeScript, no `any` | `tsconfig strict: true` |
| **Enums over Strings** | Centralized type definitions | Custom ESLint rule |

### SOLID Principles Applied

| Principle | Application |
|-----------|-------------|
| **S**ingle Responsibility | Each module handles ONE domain concept |
| **O**pen/Closed | Use interfaces, extend via composition |
| **L**iskov Substitution | All implementations conform to interfaces |
| **I**nterface Segregation | Small, focused interfaces per use case |
| **D**ependency Inversion | Depend on abstractions, inject dependencies |

---

## 🏛️ Domain Driven Design Architecture

### Domain Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         DOMAINS                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Identity   │  │ Transactions │  │      Rewards         │   │
│  │   Domain     │  │   Domain     │  │      Domain          │   │
│  │              │  │              │  │                      │   │
│  │ • Auth       │  │ • Payments   │  │ • Cashback           │   │
│  │ • Wallets    │  │ • Refunds    │  │ • Tiers              │   │
│  │ • Sessions   │  │ • Categories │  │ • GNO Balance        │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │  Analytics   │  │   Insights   │                             │
│  │   Domain     │  │   Domain     │                             │
│  │              │  │              │                             │
│  │ • Spending   │  │ • AI Queries │                             │
│  │ • Trends     │  │ • Reports    │                             │
│  │ • Budgets    │  │ • Anomalies  │                             │
│  └──────────────┘  └──────────────┘                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                     Runtime & Tooling (Bun)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Bun Runtime │  │  Bun Test    │  │  Bun Workspaces      │   │
│  │  (Fast!)     │  │  (Built-in)  │  │  (Monorepo)          │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                        Frontend (Next.js 15)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  App Router  │  │  Shadcn/UI   │  │  TanStack Query      │   │
│  │  RSC + SSR   │  │  + Tailwind  │  │  (Data Fetching)     │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      API Layer (tRPC v11)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Auth Router │  │ Transaction  │  │  Insights Router     │   │
│  │  (SIWE)      │  │    Router    │  │  (AI/Analytics)      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                     External Services                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Gnosis Pay   │  │  OpenAI API  │  │  Gnosis Chain RPC    │   │
│  │    API       │  │  (Insights)  │  │  (Balance Check)     │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Why Bun?

| Feature | Benefit |
|---------|---------|
| **Speed** | 10-100x faster installs than npm/pnpm |
| **TypeScript** | Native support, no transpilation step |
| **Workspaces** | Built-in monorepo support |
| **Test Runner** | Built-in, fast test execution |
| **Hot Reload** | Faster dev server restarts |
| **.env Files** | Auto-loaded, no `dotenv` needed |
| **Next.js** | Full compatibility with Next.js 15 |

### Recommended Package Versions

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "@trpc/server": "^11.0.0",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "@tanstack/react-query": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "viem": "^2.0.0",
    "wagmi": "^2.0.0",
    "@rainbow-me/rainbowkit": "^2.0.0",
    "recharts": "^2.12.0",
    "zustand": "^5.0.0",
    "date-fns": "^3.0.0",
    "zod": "^3.23.0"
  }
}
```

### Bun Workspace Configuration

```json
// package.json (root)
{
  "name": "payments-view",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "bun run --filter @payments-view/web dev",
    "build": "bun run --filter '*' build",
    "lint": "bun run --filter '*' lint",
    "test": "bun test",
    "typecheck": "bun run --filter '*' typecheck",
    "clean": "bun run --filter '*' clean && rm -rf node_modules"
  }
}
```

```toml
# bunfig.toml (root)
[install]
# Use exact versions for reproducibility
exact = true

[install.lockfile]
# Save lockfile
save = true

[test]
# Test configuration
coverage = true
coverageDir = "coverage"
```

### Project Structure (DDD + Monorepo)

See [Project Structure](#project-structure) section below for complete directory layout.

---

## 🌐 External API Integration

### The Problem: Type Mismatches

When integrating with external APIs, TypeScript types are just assumptions about what the API returns. If the API returns different field names or structures than expected, you get runtime errors like:

```
Cannot read properties of undefined (reading 'toLowerCase')
```

**Real examples we encountered:**

| What We Assumed | What Gnosis Pay API Actually Returns |
|-----------------|--------------------------------------|
| `{ jwt: "..." }` | `{ token: "..." }` |
| JWT claim `sub` | Custom field `signerAddress` |
| `isEligibleForCashback` | `impactsCashback` |
| `merchant.country: string` | `merchant.country: { name, alpha2, alpha3, numeric }` |

### Solution: Zod Runtime Validation

All external API responses MUST be validated with Zod schemas before use:

```
packages/infrastructure/src/gnosis-pay/
├── schemas/                    # ← Source of truth for API types
│   ├── auth.schema.ts
│   ├── transaction.schema.ts
│   ├── rewards.schema.ts
│   └── index.ts
├── types/                      # TypeScript types (derived or legacy)
├── mappers/                    # API → Domain transformations
├── client.ts                   # HTTP client with dev logging
└── repositories/               # Repository implementations
```

### Schema Requirements

```typescript
// packages/infrastructure/src/gnosis-pay/schemas/auth.schema.ts
import { z } from 'zod';

/**
 * Gnosis Pay Challenge Response
 *
 * API Endpoint: POST /api/v1/auth/challenge
 * Docs: https://docs.gnosispay.com/api-reference/authentication/verify-siwe-signature
 * Last Verified: 2024-11-26
 *
 * IMPORTANT: Field is 'token', NOT 'jwt' as commonly assumed!
 */
export const ChallengeResponseSchema = z.object({
  token: z.string(),
}).passthrough(); // Allow unknown fields

/**
 * Gnosis Pay JWT Payload
 *
 * IMPORTANT: Uses 'signerAddress' instead of standard JWT 'sub' claim!
 * Last Verified: 2024-11-26
 */
export const JwtPayloadSchema = z.object({
  userId: z.string(),
  signerAddress: z.string(),  // NOT 'sub'!
  chainId: z.number(),
  exp: z.number(),
  iat: z.number(),
}).passthrough();

// Export inferred types
export type ChallengeResponse = z.infer<typeof ChallengeResponseSchema>;
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
```

### Validation Helper Functions

```typescript
/**
 * Parse and validate API response with detailed error logging
 */
export function parseApiResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): T | null {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error(`[API Schema] ${context} validation failed:`, {
      errors: result.error.issues,
      receivedData: JSON.stringify(data, null, 2).substring(0, 1000),
    });
    return null;
  }

  return result.data;
}
```

### Development Logging

The API client logs actual responses in development mode to help identify mismatches:

```typescript
// In client.ts handleResponse()
if (process.env.NODE_ENV === 'development') {
  console.log('[API Response] Sample:',
    JSON.stringify(data, null, 2).substring(0, 1000)
  );
}
```

### API Integration Checklist

Before integrating ANY external API endpoint:

```
□ 1. Read official API documentation
□ 2. Note exact field names (don't assume standard names!)
□ 3. Check for nullable/optional fields
□ 4. Document the endpoint URL in schema comments
□ 5. Add verification date to schema comments
□ 6. Create Zod schema with .passthrough()
□ 7. Add parseApiX() helper function
□ 8. Test with real API response
□ 9. Update mapper if API structure differs from domain
```

### Common Mistakes to Avoid

```typescript
// ❌ BAD - Assuming standard JWT claims
interface JwtPayload {
  sub: string;  // Standard claim - but API might use different field!
  exp: number;
}

// ❌ BAD - Guessing field names without checking docs
interface ApiResponse {
  jwt: string;  // Assumed - actually returns 'token'!
}

// ✅ GOOD - Verified against docs with comments
/**
 * Docs: https://docs.gnosispay.com/api-reference/...
 * Verified: 2024-11-26
 */
const ApiResponseSchema = z.object({
  token: z.string(),  // API returns 'token', verified in docs
}).passthrough();
```

---

## 📦 Centralized Constants & Enums

### Transaction Enums

```typescript
// packages/constants/src/enums/transaction-kind.enum.ts

export enum TransactionKind {
  PAYMENT = 'Payment',
  REFUND = 'Refund',
  REVERSAL = 'Reversal',
}

export const isTransactionKind = (value: string): value is TransactionKind => {
  return Object.values(TransactionKind).includes(value as TransactionKind);
};
```

```typescript
// packages/constants/src/enums/transaction-status.enum.ts

export enum TransactionStatus {
  APPROVED = 'Approved',
  INCORRECT_PIN = 'IncorrectPin',
  INSUFFICIENT_FUNDS = 'InsufficientFunds',
  EXCEEDS_LIMIT = 'ExceedsApprovalAmountLimit',
  INVALID_AMOUNT = 'InvalidAmount',
  PIN_TRIES_EXCEEDED = 'PinEntryTriesExceeded',
  INCORRECT_SECURITY_CODE = 'IncorrectSecurityCode',
  REVERSAL = 'Reversal',
  PARTIAL_REVERSAL = 'PartialReversal',
  OTHER = 'Other',
}

export const isSuccessStatus = (status: TransactionStatus): boolean => {
  return status === TransactionStatus.APPROVED;
};
```

### Configuration Constants

```typescript
// packages/constants/src/config/api.config.ts

export const API_CONFIG = {
  GNOSIS_PAY: {
    BASE_URL: 'https://api.gnosispay.com',
    VERSION: 'v1',
    ENDPOINTS: {
      AUTH_NONCE: '/api/v1/auth/nonce',
      AUTH_CHALLENGE: '/api/v1/auth/challenge',
      TRANSACTIONS: '/api/v1/cards/transactions',
      REWARDS: '/api/v1/rewards',
    },
  },
} as const;
```

```typescript
// packages/constants/src/config/auth.config.ts

export const AUTH_CONFIG = {
  JWT_EXPIRY_BUFFER_MS: 5 * 60 * 1000,  // 5 minutes before expiry
  JWT_TTL_MS: 60 * 60 * 1000,           // 1 hour
  SESSION_STORAGE_KEY: 'gnosis_session',
  SIWE_DOMAIN: 'payments-view.app',
  SIWE_URI: 'https://payments-view.app',
} as const;
```

---

## 📝 Logging System

### Log Levels

```typescript
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}
```

### Logger Interface

```typescript
export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  fatal(message: string, error?: Error, context?: LogContext): void;
  child(context: LogContext): ILogger;
}
```

### Logging Configuration

```typescript
export const LOG_CONFIG = {
  DEFAULT_LEVEL: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  INCLUDE_STACK_TRACE: process.env.NODE_ENV !== 'production',
  SENSITIVE_FIELDS: ['password', 'token', 'apiKey', 'secret', 'jwt'],
} as const;
```

---

## ⚠️ Error Handling

### Error Types Hierarchy

```typescript
export enum ErrorCode {
  // Authentication errors (1xxx)
  UNAUTHORIZED = 'AUTH_1001',
  TOKEN_EXPIRED = 'AUTH_1002',
  INVALID_SIGNATURE = 'AUTH_1003',

  // Transaction errors (2xxx)
  TRANSACTION_NOT_FOUND = 'TXN_2001',
  TRANSACTION_FETCH_FAILED = 'TXN_2003',

  // Validation errors (4xxx)
  VALIDATION_FAILED = 'VAL_4001',

  // External service errors (5xxx)
  GNOSIS_API_ERROR = 'EXT_5001',
  RATE_LIMITED = 'EXT_5004',
}
```

### Result Type Pattern

```typescript
export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
  readonly isSuccess = true;
  readonly value: T;
  // ... methods
}

export class Failure<E> {
  readonly isFailure = true;
  readonly error: E;
  // ... methods
}

export const Result = {
  ok: <T>(value: T): Success<T> => new Success(value),
  err: <E>(error: E): Failure<E> => new Failure(error),
};
```

---

## 🔗 Middlewares

### tRPC Middleware Stack

1. **Authentication Middleware**: JWT validation, session context
2. **Logging Middleware**: Request/response logging with duration
3. **Rate Limiting Middleware**: In-memory rate limiting
4. **Validation Middleware**: Zod error transformation

### Rate Limit Configuration

```typescript
export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 60 * 1000,           // 1 minute window
  MAX_REQUESTS_PER_WINDOW: 100,   // 100 requests per minute
} as const;
```

---

## 🧹 Linting & Code Quality

### ESLint Configuration

- Max 500 lines per file
- Max 50 lines per function
- Complexity limit of 10
- No magic numbers
- Strict TypeScript (`no-explicit-any: error`)
- Import organization with auto-sorting
- Unused imports auto-removal

### TypeScript Configuration

- Strict mode enabled
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noUncheckedIndexedAccess: true`

---

## 🛠️ Developer Experience

### Common Commands

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Build all packages
bun run build

# Run tests
bun test

# Run tests with watch
bun test --watch

# Type check
bun run typecheck

# Lint
bun run lint

# Format
bun run format

# Add a dependency to a package
bun add <package> --filter @payments-view/web

# Add a dev dependency
bun add -D <package>
```

### VS Code Settings

- Format on save
- ESLint integration
- TypeScript auto-imports
- Tailwind IntelliSense
- Bun extension for debugging

### Git Hooks (Husky + lint-staged)

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

bunx lint-staged
```

```bash
# .husky/pre-push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

bun run typecheck
bun test
```

### lint-staged Configuration

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

### Commit Convention

- Conventional Commits format
- Type-scope-subject structure
- Automated changelog generation

```bash
# Install commitlint
bun add -D @commitlint/cli @commitlint/config-conventional
```

### Environment Variables

Bun automatically loads `.env` files, no `dotenv` package needed!

```typescript
// packages/constants/src/config/env.config.ts

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_GNOSIS_PAY_API_URL: z.string().url(),
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: z.string(),
  OPENAI_API_KEY: z.string().optional(),
});

// Bun.env is type-safe!
export const env = envSchema.parse(process.env);
```

```bash
# .env.example
NODE_ENV=development
NEXT_PUBLIC_GNOSIS_PAY_API_URL=https://api.gnosispay.com
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
OPENAI_API_KEY=sk-your_api_key
```

---

## 🧪 Testing Strategy

### Bun Test Runner

Bun has a built-in test runner that's Jest-compatible and blazing fast!

```typescript
// Example test file: packages/domain/src/transaction/__tests__/money.test.ts

import { describe, test, expect } from 'bun:test';
import { Money } from '../value-objects/money';

describe('Money', () => {
  test('should format currency correctly', () => {
    const money = Money.create('2550', 'EUR', 2);
    expect(money.format()).toBe('€25.50');
  });

  test('should add two money values', () => {
    const a = Money.create('1000', 'EUR', 2);
    const b = Money.create('500', 'EUR', 2);
    const result = a.add(b);
    expect(result.toNumber()).toBe(15);
  });
});
```

### Test Commands

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage

# Run specific test file
bun test packages/domain/src/transaction

# Run tests matching pattern
bun test --test-name-pattern "Money"
```

### Test Pyramid

```
                    ╱╲
                   ╱  ╲
                  ╱ E2E ╲          5% - Critical flows (Playwright)
                 ╱──────╲
                ╱        ╲
               ╱Integration╲       15% - Use cases, API
              ╱────────────╲
             ╱              ╲
            ╱     Unit       ╲     80% - Domain, utils (Bun test)
           ╱──────────────────╲
```

### Coverage Targets

| Layer | Min Coverage | Focus |
|-------|--------------|-------|
| Domain | 90% | Value objects, services |
| Application | 85% | Use cases |
| Infrastructure | 70% | Mappers, repositories |
| UI Components | 60% | Critical interactions |

### E2E Tests (Playwright)

```bash
# Install Playwright
bun add -D @playwright/test

# Run E2E tests
bunx playwright test
```

---

## 📚 Resources

- [tRPC Documentation](https://trpc.io/docs)
- [Domain Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Next.js 15 Documentation](https://nextjs.org/docs)

---

*Last Updated: November 2024*
