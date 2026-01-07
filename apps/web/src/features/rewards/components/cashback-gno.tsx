'use client';

import { Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@payments-view/ui';

interface CashbackGnoProps {
  monthlyGnoEarned: number;
  yearlyGnoEarned: number;
  effectiveGnoPrice: number;
  priceCurrency: string;
  isLoadingPrice: boolean;
  gnoNeededForNextTier?: number | null;
  monthsToNextTier?: number | null;
  isMaxTier: boolean;
  className?: string;
}

/**
 * Cashback in GNO component
 * Displays estimated GNO earnings based on cashback projections
 */
export function CashbackGno({
  monthlyGnoEarned,
  yearlyGnoEarned,
  effectiveGnoPrice,
  priceCurrency,
  isLoadingPrice,
  gnoNeededForNextTier,
  monthsToNextTier,
  isMaxTier,
  className,
}: CashbackGnoProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 p-4 text-amber-500">
            <Coins className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <span>Cashback in GNO</span>
            <div className="text-muted-foreground text-xs font-normal">
              {isLoadingPrice ? (
                'Loading price...'
              ) : (
                <>
                  using {effectiveGnoPrice.toFixed(2)} {priceCurrency}/GNO
                </>
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Est. GNO per month</p>
            <p className="text-lg font-semibold">{monthlyGnoEarned.toFixed(4)} GNO</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm text-right">Per year</p>
            <p className="text-right text-lg font-semibold">
              {yearlyGnoEarned.toFixed(4)} GNO
            </p>
          </div>
        </div>
        {!isMaxTier && gnoNeededForNextTier ? <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
            <p className="text-sm font-medium text-amber-400">
              {gnoNeededForNextTier.toFixed(2)} GNO to next tier
            </p>
            {monthsToNextTier && monthsToNextTier < 240 ? (
              <p className="text-muted-foreground text-xs">
                At current cashback pace, ~{monthsToNextTier.toFixed(1)} months to reach it.
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">
                Add purchases or top up GNO to reach the next tier faster.
              </p>
            )}
          </div> : null}
        <div className="text-muted-foreground text-xs">
          Assumes cashback is paid in GNO at the stated price. Increase spend or hold more GNO
          to accelerate tier upgrades.
        </div>
      </CardContent>
    </Card>
  );
}
