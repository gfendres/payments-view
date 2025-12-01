# Finance Dashboard - Design System

## 🎨 Design Principles

### Core Principles

- **Dark Mode First**: Default to dark theme for better UX
- **Rounded Borders**: Friendly, modern aesthetic (12px default radius)
- **Consistent Spacing**: 8px grid system throughout
- **Clear Typography**: Readable fonts with proper hierarchy
- **Intuitive Navigation**: Clear information architecture

---

## 🎨 UI Design System

### Theme Configuration (Dark Mode First)

```typescript
// packages/ui/src/theme/colors.ts

export const COLORS = {
  // Primary - Gnosis Green
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Accent - Gnosis Olive/Gold
  accent: {
    300: '#e8f5a1',
    400: '#d8eb81',
    500: '#919e3a',
    600: '#707a2d',
    700: '#5a6223',
  },

  // Semantic
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Dark theme (default)
  dark: {
    background: '#0a0a0a',
    foreground: '#fafafa',
    card: '#141414',
    cardForeground: '#fafafa',
    muted: '#27272a',
    mutedForeground: '#a1a1aa',
    border: '#27272a',
    ring: '#22c55e',
  },

  // Light theme
  light: {
    background: '#fafafa',
    foreground: '#0a0a0a',
    card: '#ffffff',
    cardForeground: '#0a0a0a',
    muted: '#f4f4f5',
    mutedForeground: '#71717a',
    border: '#e4e4e7',
    ring: '#16a34a',
  },
} as const;
```

### Border Radius

```typescript
// packages/ui/src/theme/radius.ts

export const RADIUS = {
  none: '0px',
  sm: '0.375rem',    // 6px
  md: '0.5rem',      // 8px
  lg: '0.75rem',     // 12px - default
  xl: '1rem',        // 16px
  '2xl': '1.5rem',   // 24px - cards, modals
  '3xl': '2rem',     // 32px - large containers
  full: '9999px',    // pills, avatars
} as const;

export const DEFAULT_RADIUS = RADIUS.lg; // Friendly rounded borders
```

### Spacing System

```typescript
// packages/ui/src/theme/spacing.ts

export const SPACING = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;
```

### CSS Variables

```css
/* apps/web/app/globals.css */

@layer base {
  :root {
    /* Light theme */
    --background: 0 0% 98%;
    --foreground: 0 0% 4%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 4%;
    --muted: 240 5% 96%;
    --muted-foreground: 240 4% 46%;
    --border: 240 6% 90%;
    --ring: 142 71% 45%;
    --radius: 0.75rem;
  }

  .dark {
    /* Dark theme (default) */
    --background: 0 0% 4%;
    --foreground: 0 0% 98%;
    --card: 0 0% 8%;
    --card-foreground: 0 0% 98%;
    --muted: 240 4% 16%;
    --muted-foreground: 240 5% 65%;
    --border: 240 4% 16%;
    --ring: 142 71% 45%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

/* Smooth transitions for theme switching */
@layer utilities {
  .theme-transition {
    @apply transition-colors duration-200 ease-in-out;
  }
}
```

---

## 🧩 Component Architecture (Atomic Design)

### Atoms

- `Button` - Primary, secondary, ghost variants
- `Badge` - Status indicators (pending, approved, declined)
- `Avatar` - User/merchant icons
- `Input` - Text, search, date inputs
- `Currency` - Formatted currency display with symbol
- `Skeleton` - Loading states

### Molecules

- `TransactionRow` - Single transaction display
- `StatCard` - KPI card with icon, value, trend
- `SearchBar` - Input + icon + clear button
- `FilterChip` - Category/date filter pill
- `CashbackTier` - Progress toward next tier

### Organisms

- `TransactionList` - Paginated list with virtualization
- `SpendingChart` - Time series or pie chart
- `FilterPanel` - Date range + category + status filters
- `InsightsCard` - AI-generated insight with source data
- `CashbackDashboard` - Current tier + earnings + optimizer

### Templates

- `DashboardLayout` - Sidebar + header + main content
- `AuthLayout` - Centered card for login
- `FullWidthLayout` - For analytics deep-dive

---

## 💀 Loading States & Skeletons

### Skeleton Components

```tsx
// apps/web/components/atoms/skeleton.tsx

import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-muted',
        className
      )}
    />
  );
}

export function SkeletonText({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-full', className)} />;
}

export function SkeletonCircle({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-10 w-10 rounded-full', className)} />;
}
```

### Transaction List Skeleton

```tsx
// apps/web/components/organisms/transaction-list-skeleton.tsx

export function TransactionListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <TransactionRowSkeleton key={index} />
      ))}
    </div>
  );
}

function TransactionRowSkeleton() {
  return (
    <Card className="flex items-center gap-4 p-4 rounded-xl">
      <SkeletonCircle className="h-10 w-10 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonText className="h-4 w-32" />
        <SkeletonText className="h-3 w-24" />
      </div>
      <div className="text-right space-y-2">
        <SkeletonText className="h-4 w-20 ml-auto" />
        <SkeletonText className="h-3 w-16 ml-auto" />
      </div>
    </Card>
  );
}
```

### Dashboard Skeleton

```tsx
// apps/web/components/templates/dashboard-skeleton.tsx

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Chart */}
      <Card className="rounded-2xl">
        <CardHeader>
          <SkeletonText className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full rounded-xl" />
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <SkeletonText className="h-5 w-40" />
          <SkeletonText className="h-4 w-20" />
        </CardHeader>
        <CardContent>
          <TransactionListSkeleton count={5} />
        </CardContent>
      </Card>
    </div>
  );
}
```

### Suspense Integration

```tsx
// apps/web/app/(dashboard)/page.tsx

import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/templates';
import { Dashboard } from '@/features/dashboard';

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}
```

---

## 📱 Key Screen Designs

### Dashboard Home

```
┌────────────────────────────────────────────────────────────┐
│ [Logo]  Dashboard  Transactions  Analytics  Insights  [🔔] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Balance     │ │ This Month  │ │ Cashback    │          │
│  │ €2,450.00   │ │ -€1,234.56  │ │ €24.50 🔥   │          │
│  │ EURe        │ │ ↑12% vs Sep │ │ 2% Tier     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │            SPENDING BY CATEGORY (OCT 2024)           │ │
│  │     [========PIE CHART WITH LEGEND=======]           │ │
│  │  🛒 Groceries 34%  🍽️ Dining 22%  🚇 Transport 18%   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Recent Transactions                           [View All →]│
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 🛒 Tesco        Oct 24  Groceries     -€45.67  ✓     │ │
│  │ 🍽️ Uber Eats    Oct 23  Dining        -€23.40  ✓     │ │
│  │ ⛽ Shell        Oct 22  Transport     -€62.00  ⏳    │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Cashback Dashboard

```
┌────────────────────────────────────────────────────────────┐
│                    CASHBACK REWARDS                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Current Rate: 2% (+1% OG Bonus = 3% Total) 🏆            │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  [===PROGRESS BAR=====>                    ] 1.5 GNO │ │
│  │   Tier 2 (1-10 GNO)                                  │ │
│  │   Add 8.5 GNO to reach Tier 3 (3% base rate)         │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌─────────────────┐ ┌─────────────────┐                  │
│  │ This Month      │ │ All Time        │                  │
│  │ €24.50          │ │ €342.80         │                  │
│  │ earned          │ │ earned          │                  │
│  └─────────────────┘ └─────────────────┘                  │
│                                                            │
│  Eligible Transactions This Month:                         │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 🛒 Tesco        -€45.67  → +€1.37 cashback           │ │
│  │ 🍽️ Uber Eats    -€23.40  → +€0.70 cashback           │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🎨 Category Colors & Icons

### MCC Category Mapping

```typescript
export enum CategoryId {
  GROCERIES = 'groceries',
  DINING = 'dining',
  TRANSPORT = 'transport',
  SHOPPING = 'shopping',
  TRAVEL = 'travel',
  ENTERTAINMENT = 'entertainment',
  HEALTH = 'health',
  UTILITIES = 'utilities',
  DIGITAL = 'digital',
  ATM = 'atm',
  OTHER = 'other',
}

export const CATEGORIES: Record<CategoryId, CategoryConfig> = {
  [CategoryId.GROCERIES]: {
    id: CategoryId.GROCERIES,
    name: 'Groceries',
    icon: '🛒',
    color: '#22c55e'
  },
  [CategoryId.DINING]: {
    id: CategoryId.DINING,
    name: 'Dining',
    icon: '🍽️',
    color: '#f97316'
  },
  [CategoryId.TRANSPORT]: {
    id: CategoryId.TRANSPORT,
    name: 'Transport',
    icon: '🚗',
    color: '#3b82f6'
  },
  [CategoryId.SHOPPING]: {
    id: CategoryId.SHOPPING,
    name: 'Shopping',
    icon: '🛍️',
    color: '#a855f7'
  },
  [CategoryId.TRAVEL]: {
    id: CategoryId.TRAVEL,
    name: 'Travel',
    icon: '✈️',
    color: '#06b6d4'
  },
  [CategoryId.ENTERTAINMENT]: {
    id: CategoryId.ENTERTAINMENT,
    name: 'Entertainment',
    icon: '🎬',
    color: '#ec4899'
  },
  [CategoryId.HEALTH]: {
    id: CategoryId.HEALTH,
    name: 'Health',
    icon: '💊',
    color: '#14b8a6'
  },
  [CategoryId.UTILITIES]: {
    id: CategoryId.UTILITIES,
    name: 'Utilities',
    icon: '💡',
    color: '#64748b'
  },
  [CategoryId.DIGITAL]: {
    id: CategoryId.DIGITAL,
    name: 'Digital',
    icon: '📲',
    color: '#8b5cf6'
  },
  [CategoryId.ATM]: {
    id: CategoryId.ATM,
    name: 'ATM',
    icon: '🏧',
    color: '#eab308'
  },
  [CategoryId.OTHER]: {
    id: CategoryId.OTHER,
    name: 'Other',
    icon: '📦',
    color: '#94a3b8'
  },
};
```

---

## 📐 Responsive Design

### Breakpoints

```typescript
export const BREAKPOINTS = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
} as const;
```

### Layout Patterns

- **Mobile**: Single column, stacked cards
- **Tablet**: 2-column grid for stats, single column for lists
- **Desktop**: 3-column grid for stats, sidebar navigation
- **Large Desktop**: Max-width container (1280px) with centered content

---

## 🎭 Component Examples

### Stat Card Component

```tsx
// apps/web/components/molecules/stat-card.tsx

export interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('rounded-2xl', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-success' : 'text-error'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 🔗 Resources

- [Shadcn/UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

---

*Last Updated: November 2024*
