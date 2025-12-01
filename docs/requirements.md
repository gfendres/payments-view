# Finance Dashboard - Product Requirements

## 📋 Executive Summary

A comprehensive financial dashboard for Gnosis Pay card users that provides:

- **Transaction Management**: View, search, and analyze card transactions across multiple wallets
- **Visual Analytics**: Interactive charts and spending breakdowns by category, merchant, and time
- **Cashback Tracking**: Monitor GNO-based rewards and optimize staking for maximum returns
- **AI Insights**: Natural language queries and automated spending analysis using LLM
- **Cross-Platform**: Web-first (Next.js) with potential React Native mobile expansion

---

## 🎯 Core Features

### Must-Have Features (MVP)

#### 1. Authentication & Wallet Connection

- **SIWE (Sign-In with Ethereum)** authentication flow
- Support for MetaMask, WalletConnect, and other Ethereum wallets
- Session management with automatic token refresh
- Multi-wallet support (connect multiple Gnosis Pay accounts)

#### 2. Transaction Management

- **Transaction List View**
  - Paginated list of all card transactions
  - Display: date, merchant, category, amount, status
  - Support for Payment, Refund, and Reversal transaction types
  - Show pending vs cleared transactions
  - Link to on-chain transaction hash

- **Transaction Search & Filtering**
  - Search by merchant name, category, or location
  - Filter by date range (with quick presets: Today, Week, Month, Year)
  - Filter by category (using MCC codes)
  - Filter by transaction type (Payment, Refund, Reversal)
  - Filter by status (Pending, Approved, Declined)
  - Filter by amount range

- **Transaction Details**
  - Full transaction information
  - Merchant details (name, city, country)
  - Category classification
  - Currency conversion (billing vs transaction currency)
  - On-chain transaction link
  - Cashback eligibility indicator

#### 3. Spending Analytics

- **Category Breakdown**
  - Pie/donut chart showing spending by category
  - Percentage and absolute amounts
  - Time period selector
  - Drill-down to see transactions in category

- **Time-Series Analysis**
  - Line or bar chart showing spending over time
  - Weekly or monthly aggregation
  - Comparison with previous period
  - Trend indicators (↑↓)

- **Top Merchants**
  - Bar chart of top spending locations
  - Total amount per merchant
  - Transaction count

#### 4. Cashback Rewards Dashboard

- **Current Tier Display**
  - Current cashback rate (0-5%)
  - GNO balance in Safe
  - OG NFT bonus indicator (+1%)
  - Progress bar to next tier

- **Tier Optimization**
  - Show how much GNO needed for next tier
  - Calculate potential additional cashback
  - Display tier benefits

- **Cashback Earnings**
  - Total earned this month
  - Total earned all-time
  - Eligible transactions list
  - Cashback per transaction breakdown

#### 5. Multi-Currency Support

- Display transactions in original currency
- Show billing currency (typically EURe)
- Currency conversion indicators
- Balance display for each currency held

---

## 🆕 Additional Features (Post-MVP)

### High Priority (P1)

- **GNO Staking Optimizer**: Help users maximize cashback tier
- **On-chain Transaction Links**: Direct links to blockchain explorers
- **Export Functionality**: CSV/PDF export for tax reporting
- **Dark/Light Theme Toggle**: User preference for theme

### Medium Priority (P2)

- **Spending Budgets**: Set budgets per category with alerts
- **Subscription Detection**: Auto-detect recurring payments
- **Receipt Attachments**: Upload and attach receipts to transactions
- **Monthly Reports**: Automated spending summaries

### Low Priority (P3)

- **Multi-Wallet Aggregation**: View combined data from all wallets
- **Spending Goals**: Set and track financial goals
- **Merchant Insights**: Spending patterns per merchant
- **Notification System**: Alerts for large transactions, budgets, etc.

---

## 🤖 AI Insights (Phase 3+)

### Natural Language Queries

- Allow users to ask questions in plain English
- Examples:
  - "Where did I spend the most in October?"
  - "How much have I spent on groceries this year?"
  - "Show me all transactions over €100"
- Interpret query, fetch data, generate natural language response

### Automated Insights

- **Monthly Reports**: Generate summaries with:
  - Total spending vs previous month
  - Category breakdown
  - Notable transactions
  - Spending trends
  - Personalized tips

- **Anomaly Detection**
  - Flag unusually large transactions
  - Detect spending pattern changes
  - Alert on budget overruns

### Privacy-First Approach

- Process data locally when possible
- Only send aggregated statistics to LLM (no raw transactions)
- Anonymize merchant names in prompts
- User consent required for AI features
- Option to disable AI features entirely

---

## 📊 Data Requirements

### Transaction Data

- Transaction ID (threadId)
- Timestamp (createdAt, clearedAt)
- Status (pending, approved, declined, etc.)
- Kind (Payment, Refund, Reversal)
- Amounts (billing and transaction currency)
- Merchant information (name, city, country)
- MCC (Merchant Category Code)
- Card token (masked)
- On-chain transaction hash
- Cashback eligibility

### Rewards Data

- GNO balance in Safe
- Current cashback rate (0-4%)
- OG NFT holder status (+1% bonus)
- Total cashback earned
- Eligible transactions

### Account Data

- Wallet address
- Connected wallets list
- Balance per currency
- Card limits (if available)

---

## ✅ API Validation

### Gnosis Pay API Support

| Feature | API Support | Notes |
|---------|-------------|-------|
| SIWE Authentication | ✅ Yes | JWT expires in **1 hour** |
| Transaction List | ✅ Yes | `GET /api/v1/cards/transactions` with pagination |
| MCC Categories | ✅ Yes | Merchant Category Codes provided |
| Multi-Currency | ✅ Yes | Billing + Transaction currency with symbols |
| Pending Status | ✅ Yes | `isPending` field for authorization vs settled |
| Refunds/Reversals | ✅ Yes | Three transaction kinds: Payment, Refund, Reversal |
| Rewards API | ✅ Yes | `GET /api/v1/rewards` - GNO balance, cashback rate, OG status |
| Webhooks | ⚠️ Partner Only | Requires Gnosis Pay partner manager setup |

### API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/auth/nonce` | GET | Get SIWE nonce |
| `/api/v1/auth/challenge` | POST | Verify signature, get JWT |
| `/api/v1/cards/transactions` | GET | List transactions (paginated) |
| `/api/v1/rewards` | GET | Get cashback info |

### Query Parameters

```typescript
interface TransactionQueryParams {
  limit?: number;           // Default: 100, Min: 10
  offset?: number;          // Default: 0
  before?: string;          // ISO 8601 date
  after?: string;           // ISO 8601 date
  billingCurrency?: string; // e.g., "EUR"
  mcc?: string;             // Category code
  transactionType?: string; // "00" = purchase, "01" = ATM
  cardTokens?: string;      // Comma-separated
}
```

---

## 🎯 Feature Priorities

| Feature | Priority | Rationale |
|---------|----------|-----------|
| Cashback Rewards Dashboard | P0 | Unique to Gnosis Pay, high user value |
| GNO Staking Optimizer | P1 | Help users maximize their cashback tier |
| On-chain Transaction Link | P1 | Show blockchain tx hash for transparency |
| Spending Budgets | P2 | Common fintech feature, high engagement |
| Export (CSV/PDF) | P2 | Essential for tax reporting |
| Subscription Detection | P2 | Auto-detect recurring payments |
| Receipt Attachments | P3 | Nice-to-have for expense tracking |

---

## 🔒 Security Requirements

### Authentication

- JWT tokens stored securely (in-memory preferred)
- Auto-logout on token expiry
- Wallet signature required for sensitive actions
- Rate limiting on auth endpoints

### Data Protection

- All API calls over HTTPS
- No sensitive data in URL parameters
- Minimal data sent to LLM (aggregated only)
- Clear data retention policy
- User consent for AI features

### Privacy

- No tracking without consent
- Option to disable analytics
- Local-first data processing
- Anonymization before AI processing

---

## 📱 Platform Requirements

### Web (Primary)

- **Browser Support**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Responsive Design**: Mobile, tablet, desktop
- **Performance**: Initial load < 2s, transaction list render < 500ms
- **Accessibility**: WCAG 2.1 AA compliance

### Mobile (Future)

- React Native app (same codebase)
- Native wallet connection
- Push notifications
- Biometric authentication

---

## 🎨 User Experience Requirements

### Design Principles

- **Dark Mode First**: Default to dark theme
- **Rounded Borders**: Friendly, modern aesthetic
- **Consistent Spacing**: 8px grid system
- **Clear Typography**: Readable fonts, proper hierarchy
- **Intuitive Navigation**: Clear information architecture

### Loading States

- Skeleton loaders for all async content
- Progress indicators for long operations
- Optimistic UI updates where appropriate

### Error Handling

- User-friendly error messages
- Clear recovery actions
- Graceful degradation
- Offline support (cached data)

---

## 📈 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial Load Time | < 2s | Lighthouse |
| Transaction List Render | < 500ms | Performance API |
| API Error Rate | < 1% | Monitoring |
| User Engagement | 3+ sessions/week | Analytics |
| AI Insight Usefulness | > 70% positive | User feedback |

---

## 🔗 Resources

- [Gnosis Pay API Docs](https://docs.gnosispay.com/api-reference/intro)
- [Gnosis Pay Transactions Guide](https://docs.gnosispay.com/transactions)
- [SIWE Specification](https://docs.login.xyz/)
- [MCC Code Reference](https://www.citibank.com/tts/solutions/commercial-cards/assets/docs/govt/Merchant-Category-Codes.pdf)

---

*Last Updated: November 2024*
