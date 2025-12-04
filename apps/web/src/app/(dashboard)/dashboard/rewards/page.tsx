'use client';

import { Suspense, useMemo } from 'react';
import { Gift, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Skeleton } from '@payments-view/ui';

import { useAuth } from '@/features/auth';
import {
  useRewards,
  CashbackSummary,
  TierProgress,
  CashbackGno,
  EarningsChart,
  calculateCashbackStats,
} from '@/features/rewards';
import { useTransactions, useAllTransactions, TransactionList } from '@/features/transactions';
import { useTokenPrice } from '@/features/pricing';
import { CurrencyCode } from '@payments-view/constants';

function RewardsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>
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
      <Skeleton className="h-80" />
      <Skeleton className="h-64" />
    </div>
  );
}

function RewardsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="space-y-6">
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

function RewardsContent() {
  const { isAuthenticated } = useAuth();
  const {
    rewards,
    isLoading: isLoadingRewards,
    error,
    refetch,
  } = useRewards({ enabled: isAuthenticated });

  const {
    transactions: allTransactions,
    isFetching: isFetchingAllTransactions,
  } = useAllTransactions({ enabled: isAuthenticated });

  const { transactions: recentTransactions, isLoading: isLoadingTransactions } = useTransactions({
    limit: 50,
    enabled: isAuthenticated,
  });

  const { price: gnoPrice, isLoading: isLoadingPrice, currency: priceCurrency } = useTokenPrice({
    currency: CurrencyCode.EUR,
    enabled: isAuthenticated,
  });

  const cashbackStats = useMemo(() => {
    if (!rewards) return undefined;
    return calculateCashbackStats(allTransactions, rewards.currentRate);
  }, [allTransactions, rewards]);

  const effectiveGnoPrice = gnoPrice ?? 1;
  const averageMonthlyEarned = cashbackStats?.averageMonthlyEarned ?? 0;
  const monthlyGnoEarned =
    averageMonthlyEarned > 0 && effectiveGnoPrice > 0
      ? averageMonthlyEarned / effectiveGnoPrice
      : 0;
  const yearlyGnoEarned = monthlyGnoEarned * 12;
  const monthsToNextTier =
    rewards?.tier.gnoNeededForNextTier && monthlyGnoEarned > 0
      ? rewards.tier.gnoNeededForNextTier / monthlyGnoEarned
      : null;

  const eligibleTransactions = useMemo(() => {
    return recentTransactions.filter((tx) => tx.isEligibleForCashback);
  }, [recentTransactions]);

  if (error) {
    return <RewardsError message={error} onRetry={() => refetch()} />;
  }

  if (isLoadingRewards || !rewards) {
    return <RewardsLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Rewards</h1>
          <p className="text-muted-foreground">
            Track your cashback earnings and tier progress
            {isFetchingAllTransactions && (
              <span className="ml-2 text-xs text-muted-foreground/70">
                (loading transactions...)
              </span>
            )}
          </p>
        </div>
        <Button variant="subtle" size="sm" onClick={() => refetch()} className="gap-2 self-start">
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      <CashbackSummary rewards={rewards} stats={cashbackStats} />

      <EarningsChart transactions={allTransactions} cashbackRate={rewards.currentRate} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TierProgress rewards={rewards} />

        <CashbackGno
          monthlyGnoEarned={monthlyGnoEarned}
          yearlyGnoEarned={yearlyGnoEarned}
          effectiveGnoPrice={effectiveGnoPrice}
          priceCurrency={priceCurrency}
          isLoadingPrice={isLoadingPrice}
          gnoNeededForNextTier={rewards.tier.gnoNeededForNextTier}
          monthsToNextTier={monthsToNextTier}
          isMaxTier={rewards.tier.isMaxTier}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eligible Transactions</CardTitle>
          <p className="text-muted-foreground text-sm">
            Recent transactions that earned cashback rewards
          </p>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
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
              cashbackRate={rewards.currentRate}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RewardsPage() {
  return (
    <Suspense fallback={<RewardsLoadingSkeleton />}>
      <RewardsContent />
    </Suspense>
  );
}
