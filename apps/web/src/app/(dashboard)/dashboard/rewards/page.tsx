'use client';

import { Suspense, useMemo } from 'react';
import { Gift, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Skeleton } from '@payments-view/ui';

import { useAuth } from '@/features/auth';
import { useRewards, CashbackSummary, TierProgress, type CashbackStats } from '@/features/rewards';
import {
  useTransactions,
  TransactionList,
  type SerializedTransaction,
} from '@/features/transactions';

/**
 * Calculate cashback stats from transactions
 */
function calculateCashbackStats(
  transactions: SerializedTransaction[],
  cashbackRate: number
): CashbackStats {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  // Filter eligible transactions
  const eligible = transactions.filter((tx) => tx.isEligibleForCashback);

  // This month's eligible
  const eligibleThisMonth = eligible.filter((tx) => {
    const date = new Date(tx.createdAt);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  });

  // Last month's eligible
  const eligibleLastMonth = eligible.filter((tx) => {
    const date = new Date(tx.createdAt);
    return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
  });

  // Calculate spending amounts (absolute values)
  const spendingThisMonth = eligibleThisMonth.reduce(
    (sum, tx) => sum + Math.abs(tx.billingAmount.amount),
    0
  );
  const spendingLastMonth = eligibleLastMonth.reduce(
    (sum, tx) => sum + Math.abs(tx.billingAmount.amount),
    0
  );
  const totalSpending = eligible.reduce((sum, tx) => sum + Math.abs(tx.billingAmount.amount), 0);

  // Estimate cashback earned (spending * rate / 100)
  const rate = cashbackRate / 100;

  return {
    totalEarned: totalSpending * rate,
    earnedThisMonth: spendingThisMonth * rate,
    earnedLastMonth: spendingLastMonth * rate,
    eligibleThisMonth: eligibleThisMonth.length,
    eligibleLastMonth: eligibleLastMonth.length,
    totalEligible: eligible.length,
  };
}

/**
 * Loading skeleton for rewards page
 */
function RewardsLoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32 sm:col-span-2 lg:col-span-2" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>

      {/* Tier progress skeleton */}
      <Skeleton className="h-80" />

      {/* Transactions skeleton */}
      <Skeleton className="h-64" />
    </div>
  );
}

/**
 * Error state component
 */
function RewardsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="p-6">
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="bg-destructive/20 mb-4 rounded-full p-4">
            <Gift className="text-destructive h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium">Failed to load rewards</h3>
          <p className="text-muted-foreground mt-1 text-sm">{message}</p>
          <Button variant="outline" onClick={onRetry} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Rewards page content
 */
function RewardsContent() {
  const { isAuthenticated } = useAuth();
  const {
    rewards,
    isLoading: isLoadingRewards,
    error,
    refetch,
  } = useRewards({ enabled: isAuthenticated });
  const { transactions, isLoading: isLoadingTransactions } = useTransactions({
    limit: 50,
    enabled: isAuthenticated,
  });

  // Calculate cashback stats from transactions
  const cashbackStats = useMemo(() => {
    if (!rewards) return undefined;
    return calculateCashbackStats(transactions, rewards.currentRate);
  }, [transactions, rewards]);

  // Filter eligible transactions for the list
  const eligibleTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.isEligibleForCashback);
  }, [transactions]);

  if (error) {
    return <RewardsError message={error} onRetry={() => refetch()} />;
  }

  if (isLoadingRewards || !rewards) {
    return <RewardsLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rewards</h1>
          <p className="text-muted-foreground">Track your cashback earnings and tier progress</p>
        </div>
        <Button variant="subtle" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Cashback Summary */}
      <CashbackSummary rewards={rewards} stats={cashbackStats} />

      {/* Tier Progress */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TierProgress rewards={rewards} />

        {/* Tips Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="text-primary h-5 w-5" />
              Maximize Your Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-primary mt-1 h-2 w-2 rounded-full" />
                <div>
                  <p className="font-medium">Hold more GNO</p>
                  <p className="text-muted-foreground text-sm">
                    Increase your GNO balance to unlock higher cashback tiers
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary mt-1 h-2 w-2 rounded-full" />
                <div>
                  <p className="font-medium">Use your card regularly</p>
                  <p className="text-muted-foreground text-sm">
                    All card payments are eligible for cashback rewards
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary mt-1 h-2 w-2 rounded-full" />
                <div>
                  <p className="font-medium">OG NFT Holder Bonus</p>
                  <p className="text-muted-foreground text-sm">
                    OG NFT holders receive an additional +1% cashback on all purchases
                  </p>
                </div>
              </li>
              {!rewards.tier.isMaxTier && (
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  <div>
                    <p className="font-medium text-emerald-500">
                      {rewards.tier.gnoNeededForNextTier.toFixed(2)} GNO to next tier
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Upgrade to earn {rewards.tier.nextTierRate}% cashback
                    </p>
                  </div>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Eligible Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Eligible Transactions</CardTitle>
          <p className="text-muted-foreground text-sm">
            Recent transactions that earned cashback rewards
          </p>
        </CardHeader>
        <CardContent>
          {eligibleTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 text-4xl opacity-50">🧾</div>
              <p className="text-lg font-medium">No eligible transactions yet</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Use your Gnosis Pay card to earn cashback rewards
              </p>
            </div>
          ) : (
            <TransactionList
              transactions={eligibleTransactions}
              isLoading={isLoadingTransactions}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Rewards page
 */
export default function RewardsPage() {
  return (
    <Suspense fallback={<RewardsLoadingSkeleton />}>
      <RewardsContent />
    </Suspense>
  );
}

