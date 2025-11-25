# Gnosis Card Portfolio Dashboard - Implementation Tasks

## 📋 Task Organization

Tasks are organized by implementation phases. Each task includes:

- **Description**: What needs to be built
- **Acceptance Criteria**: How to verify completion
- **Dependencies**: Prerequisites that must be completed first

---

## Phase 1: Foundation

### 1.1 Monorepo Setup

**Description**: Set up Bun monorepo with workspaces

**Tasks**:

- [x] Initialize project with `bun init`
- [x] Configure Bun workspaces in `package.json`
- [x] Create `bunfig.toml` for Bun configuration
- [x] Set up root `package.json` with workspace scripts
- [x] Set up shared TypeScript configs
- [x] Verify Bun workspace resolution works

**Acceptance Criteria**:

- `bun install` works from root
- `bun run build` builds all packages
- `bun run lint` lints all packages
- Workspace dependencies resolve correctly
- `bun test` runs all tests

---

### 1.2 Package Structure

**Description**: Create all package directories following DDD architecture

**Tasks**:

- [x] Create `packages/domain` package
- [x] Create `packages/application` package
- [x] Create `packages/infrastructure` package
- [x] Create `packages/api` package
- [x] Create `packages/ui` package
- [x] Create `packages/constants` package
- [x] Create `apps/web` Next.js app
- [x] Set up `package.json` for each package with workspace references

**Acceptance Criteria**:

- All packages have valid `package.json`
- Packages can import from each other using `workspace:*` protocol
- TypeScript paths configured correctly
- Each package has its own `tsconfig.json` extending root

---

### 1.3 TypeScript & Linting Configuration

**Description**: Configure strict TypeScript and ESLint rules

**Tasks**:

- [x] Set up root `tsconfig.json` with strict mode
- [x] Configure ESLint with all rules from architecture.md
- [x] Configure Prettier with Tailwind plugin
- [x] Set up VS Code settings and extensions
- [x] Configure Husky + lint-staged
- [x] Set up commitlint

**Acceptance Criteria**:

- TypeScript strict mode enabled
- ESLint catches file size violations
- Pre-commit hook runs lint-staged
- Pre-push hook runs typecheck

---

### 1.4 Constants & Enums Package

**Description**: Create all enums and configuration constants

**Tasks**:

- [x] Create `TransactionKind` enum
- [x] Create `TransactionStatus` enum
- [x] Create `TransactionType` enum
- [x] Create `CashbackTier` enum with tier configs
- [x] Create `CategoryId` enum
- [x] Create MCC to category mapping
- [x] Create API configuration constants
- [x] Create auth configuration constants
- [x] Create pagination configuration constants

**Acceptance Criteria**:

- All enums exported from index
- No magic numbers in codebase
- MCC mapping covers common categories
- Configuration values are typed

---

### 1.5 Domain Layer - Entities & Value Objects

**Description**: Create domain entities and value objects

**Tasks**:

- [x] Create `Wallet` entity
- [x] Create `Session` entity
- [x] Create `Transaction` entity
- [x] Create `Merchant` entity
- [x] Create `RewardsInfo` entity
- [x] Create `Money` value object
- [x] Create `Category` value object
- [x] Create `EthereumAddress` value object
- [x] Create `CashbackTier` value object

**Acceptance Criteria**:

- All entities are immutable
- Value objects validate on creation
- Domain logic is pure (no side effects)
- All files < 100 lines

---

### 1.6 UI Primitives Package

**Description**: Set up Shadcn/UI components and theme

**Tasks**:

- [ ] Install Shadcn/UI
- [ ] Configure Tailwind with theme colors
- [ ] Create Button component
- [ ] Create Card component
- [ ] Create Input component
- [ ] Create Badge component
- [ ] Create Skeleton component
- [ ] Create Dialog component
- [ ] Set up CSS variables for theming

**Acceptance Criteria**:

- All components follow Shadcn patterns
- Dark mode works by default
- Components are accessible (ARIA)
- Components support rounded borders

---

## Phase 2: Core Features

### 2.1 Authentication Flow

**Description**: Implement SIWE authentication

**Tasks**:

- [ ] Set up wagmi + RainbowKit
- [ ] Create SIWE message generation
- [ ] Create auth service in domain layer
- [ ] Create Gnosis Pay auth client in infrastructure
- [ ] Create authenticate use case
- [ ] Create auth tRPC router
- [ ] Create wallet connection UI
- [ ] Implement token refresh logic
- [ ] Create auth middleware

**Acceptance Criteria**:

- User can connect wallet
- SIWE signature flow works
- JWT token obtained and stored securely
- Token refresh happens automatically
- Auth middleware protects routes

---

### 2.2 Gnosis Pay API Client

**Description**: Create infrastructure layer for Gnosis Pay API

**Tasks**:

- [ ] Create HTTP client wrapper
- [ ] Create transaction mapper (API → Domain)
- [ ] Create rewards mapper
- [ ] Create transaction repository implementation
- [ ] Create rewards repository implementation
- [ ] Handle API errors gracefully
- [ ] Implement request retry logic
- [ ] Add request/response logging

**Acceptance Criteria**:

- API responses mapped to domain entities
- Errors are properly typed
- Retry logic handles transient failures
- All API calls logged

---

### 2.3 Transaction Use Cases

**Description**: Implement transaction business logic

**Tasks**:

- [ ] Create `ListTransactionsUseCase`
- [ ] Create `GetTransactionUseCase`
- [ ] Create `FilterTransactionsUseCase`
- [ ] Create category resolver service
- [ ] Implement transaction filtering logic
- [ ] Implement pagination logic

**Acceptance Criteria**:

- Use cases return Result<T, E> type
- Filtering works by date, category, status
- Pagination respects limits
- Category mapping uses MCC codes

---

### 2.4 Transaction List UI

**Description**: Build transaction list component

**Tasks**:

- [ ] Create `TransactionRow` molecule
- [ ] Create `TransactionList` organism
- [ ] Create transaction list page
- [ ] Implement virtual scrolling
- [ ] Add loading skeleton
- [ ] Add error state
- [ ] Add empty state
- [ ] Implement pagination UI

**Acceptance Criteria**:

- List renders transactions correctly
- Virtual scrolling handles 1000+ items
- Loading state shows skeleton
- Error state shows user-friendly message
- Pagination works smoothly

---

### 2.5 Transaction Filters

**Description**: Build filtering UI

**Tasks**:

- [ ] Create `FilterPanel` organism
- [ ] Create `FilterChip` molecule
- [ ] Create date range picker
- [ ] Create category selector
- [ ] Create status selector
- [ ] Create amount range input
- [ ] Implement search bar
- [ ] Connect filters to use case

**Acceptance Criteria**:

- All filters work independently
- Filters can be combined
- Filter state persists in URL
- Clear filters button works
- Search is debounced

---

### 2.6 Category Breakdown Chart

**Description**: Build spending by category visualization

**Tasks**:

- [ ] Install Recharts
- [ ] Create `SpendingChart` organism
- [ ] Create category aggregation logic
- [ ] Implement pie/donut chart
- [ ] Add chart legend
- [ ] Add tooltip with details
- [ ] Add time period selector
- [ ] Connect to transaction data

**Acceptance Criteria**:

- Chart shows correct percentages
- Colors match category mapping
- Tooltip shows amounts
- Time period changes update chart
- Chart is responsive

---

### 2.7 Dashboard Layout

**Description**: Create main dashboard layout

**Tasks**:

- [ ] Create `DashboardLayout` template
- [ ] Create navigation sidebar
- [ ] Create header with wallet button
- [ ] Create responsive layout
- [ ] Add theme toggle button
- [ ] Implement navigation routing
- [ ] Add loading states

**Acceptance Criteria**:

- Layout is responsive (mobile/tablet/desktop)
- Navigation highlights active route
- Wallet button shows connection status
- Theme toggle works
- Layout persists across pages

---

## Phase 3: Analytics & Rewards

### 3.1 Cashback Domain Logic

**Description**: Implement cashback calculation logic

**Tasks**:

- [ ] Create `CashbackCalculator` service
- [ ] Implement tier calculation
- [ ] Calculate cashback per transaction
- [ ] Calculate total earnings
- [ ] Implement tier progress calculation

**Acceptance Criteria**:

- Tier calculation matches Gnosis Pay rules
- Cashback calculation is accurate
- OG bonus (+1%) is included
- Progress to next tier is correct

---

### 3.2 Rewards Dashboard UI

**Description**: Build cashback rewards dashboard

**Tasks**:

- [ ] Create rewards page
- [ ] Create `CashbackSummary` organism
- [ ] Create tier progress bar
- [ ] Display current rate
- [ ] Display GNO balance
- [ ] Display total earnings
- [ ] Show eligible transactions

**Acceptance Criteria**:

- Current tier displayed correctly
- Progress bar shows accurate progress
- Earnings calculated correctly
- Eligible transactions listed

---

### 3.3 Tier Progress Visualization

**Description**: Visualize progress to next cashback tier

**Tasks**:

- [ ] Create `TierProgress` molecule
- [ ] Create progress bar component
- [ ] Show current GNO balance
- [ ] Show GNO needed for next tier
- [ ] Calculate potential additional cashback
- [ ] Add tooltip with tier benefits

**Acceptance Criteria**:

- Progress bar is accurate
- Next tier requirements clear
- Potential earnings calculated
- Tooltip shows tier details

---

### 3.4 Time-Series Spending Chart

**Description**: Build spending over time visualization

**Tasks**:

- [ ] Create time-series aggregation logic
- [ ] Create line/bar chart component
- [ ] Add weekly/monthly toggle
- [ ] Add comparison with previous period
- [ ] Add trend indicators
- [ ] Add hover tooltips

**Acceptance Criteria**:

- Chart shows spending trends
- Time period toggle works
- Comparison shows percentage change
- Trend arrows are accurate
- Chart is responsive

---

### 3.5 Export Functionality

**Description**: Export transactions to CSV/PDF

**Tasks**:

- [ ] Create CSV export use case
- [ ] Create PDF export use case
- [ ] Add export button to UI
- [ ] Implement date range selection for export
- [ ] Format data for export
- [ ] Handle large datasets

**Acceptance Criteria**:

- CSV export includes all transaction fields
- PDF export is formatted nicely
- Export respects filters
- Large exports don't crash browser
- File downloads correctly

---

## Phase 4: AI & Polish

### 4.1 OpenAI Integration

**Description**: Set up OpenAI API client

**Tasks**:

- [ ] Create OpenAI client in infrastructure
- [ ] Create insight adapter
- [ ] Set up API key management
- [ ] Implement prompt templates
- [ ] Handle API errors
- [ ] Add rate limiting

**Acceptance Criteria**:

- API key stored server-side only
- Prompts follow privacy guidelines
- Errors handled gracefully
- Rate limiting prevents abuse

---

### 4.2 Natural Language Query

**Description**: Allow users to query data in plain English

**Tasks**:

- [ ] Create query parser
- [ ] Create query execution use case
- [ ] Create query UI component
- [ ] Generate natural language response
- [ ] Handle invalid queries
- [ ] Show loading state

**Acceptance Criteria**:

- User can ask questions in English
- Query is interpreted correctly
- Response is accurate
- Invalid queries show helpful error
- Loading state is clear

---

### 4.3 Automated Insights

**Description**: Generate monthly spending reports

**Tasks**:

- [ ] Create report generation use case
- [ ] Aggregate spending data
- [ ] Generate insights with LLM
- [ ] Create insights panel UI
- [ ] Add "Generate Report" button
- [ ] Display insights nicely

**Acceptance Criteria**:

- Report includes spending summary
- Insights are relevant
- Report can be regenerated
- Insights are clearly displayed
- Privacy guidelines followed

---

### 4.4 Theme Toggle

**Description**: Add dark/light theme switching

**Tasks**:

- [ ] Create theme provider
- [ ] Add theme toggle button
- [ ] Persist theme preference
- [ ] Ensure smooth transitions
- [ ] Test all components in both themes

**Acceptance Criteria**:

- Theme toggle works
- Preference persists across sessions
- Transitions are smooth
- All components look good in both themes
- No flash of wrong theme

---

### 4.5 Onboarding Flow

**Description**: Guide new users through the app

**Tasks**:

- [ ] Create onboarding steps
- [ ] Create onboarding UI
- [ ] Add skip option
- [ ] Track completion
- [ ] Show helpful tips

**Acceptance Criteria**:

- New users see onboarding
- Steps are clear
- User can skip
- Completion is tracked
- Tips are helpful

---

### 4.6 Error Handling Polish

**Description**: Improve error handling UX

**Tasks**:

- [ ] Create error boundary component
- [ ] Add error toast notifications
- [ ] Create error pages (404, 500)
- [ ] Add retry mechanisms
- [ ] Improve error messages

**Acceptance Criteria**:

- Errors don't crash app
- Error messages are user-friendly
- Retry buttons work
- Error pages are helpful
- Toasts don't overwhelm

---

## Testing Tasks

### Unit Tests

- [ ] Domain entities and value objects
- [ ] Use cases
- [ ] Utility functions
- [ ] Category mapping

### Integration Tests

- [ ] tRPC procedures
- [ ] API mappers
- [ ] Authentication flow

### E2E Tests

- [ ] Login flow
- [ ] Transaction list
- [ ] Filtering
- [ ] Chart rendering

---

## Documentation Tasks

- [ ] API documentation
- [ ] Component Storybook
- [ ] README for each package
- [ ] Architecture decision records
- [ ] Deployment guide

---

*Last Updated: November 2024*
