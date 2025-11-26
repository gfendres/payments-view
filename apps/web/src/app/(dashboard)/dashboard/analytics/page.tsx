'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@payments-view/ui';
import { useAuth } from '@/features/auth';
import { SpendingChart } from '@/features/transactions';
import { useTransactions } from '@/features/transactions';

export default function AnalyticsPage() {
  const { isAuthenticated } = useAuth();
  const { transactions, isLoading } = useTransactions({ limit: 100, enabled: isAuthenticated });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Insights into your spending patterns</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">Loading chart...</p>
              </div>
            ) : (
              <SpendingChart transactions={transactions} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground">More analytics features coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

