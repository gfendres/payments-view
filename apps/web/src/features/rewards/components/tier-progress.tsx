'use client';

import { useMemo } from 'react';
import { TrendingUp, Crown, Star, Sparkles } from 'lucide-react';
import { Card, CardContent, Tooltip, TooltipContent, TooltipTrigger } from '@payments-view/ui';
import { CASHBACK_TIER_CONFIG, CashbackTier } from '@payments-view/constants';

import type { SerializedRewards } from '../hooks';

interface TierProgressProps {
  rewards: SerializedRewards;
  className?: string;
}

/**
 * Get icon for tier
 */
function getTierIcon(tier: number) {
  switch (tier) {
    case CashbackTier.TIER_4:
      return <Crown className="h-5 w-5" />;
    case CashbackTier.TIER_3:
      return <Star className="h-5 w-5" />;
    case CashbackTier.TIER_2:
      return <Sparkles className="h-5 w-5" />;
    default:
      return <TrendingUp className="h-5 w-5" />;
  }
}

/**
 * Get tier color
 */
function getTierColor(tier: number): string {
  switch (tier) {
    case CashbackTier.TIER_4:
      return 'from-violet-500 to-purple-600';
    case CashbackTier.TIER_3:
      return 'from-amber-400 to-yellow-500';
    case CashbackTier.TIER_2:
      return 'from-slate-300 to-slate-400';
    case CashbackTier.TIER_1:
      return 'from-orange-400 to-amber-500';
    default:
      return 'from-gray-400 to-gray-500';
  }
}

/**
 * Get tier background color for badge
 */
function getTierBgColor(tier: number): string {
  switch (tier) {
    case CashbackTier.TIER_4:
      return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
    case CashbackTier.TIER_3:
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case CashbackTier.TIER_2:
      return 'bg-slate-400/20 text-slate-300 border-slate-400/30';
    case CashbackTier.TIER_1:
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

/**
 * Tier Progress component
 * Displays current tier and progress to next tier
 */
export function TierProgress({ rewards, className }: TierProgressProps) {
  const { tier } = rewards;

  const tierDetails = useMemo(() => {
    const allTiers = Object.values(CASHBACK_TIER_CONFIG);
    return allTiers.map((t) => ({
      tier: t.tier,
      label: t.label,
      minGno: t.minGno,
      rate: t.baseRate + (rewards.isOgHolder ? 1 : 0),
    }));
  }, [rewards.isOgHolder]);

  const progressPercentage = Math.min(100, Math.max(0, tier.progressToNextTier));

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        {/* Current Tier Badge */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getTierColor(tier.current)}`}
            >
              {getTierIcon(tier.current)}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Tier</p>
              <h3 className="text-xl font-bold">{tier.label}</h3>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${getTierBgColor(tier.current)}`}
          >
            <span className="text-lg font-bold">{rewards.currentRate}%</span>
            <span className="text-xs opacity-75">cashback</span>
          </div>
        </div>

        {/* GNO Balance */}
        <div className="mb-6 rounded-xl bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Your GNO Balance</p>
              <p className="text-2xl font-bold">
                {rewards.gnoBalance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                <span className="text-sm font-normal text-muted-foreground">GNO</span>
              </p>
            </div>
            {rewards.isOgHolder && (
              <Tooltip>
                <TooltipTrigger>
                  <div className="rounded-lg bg-primary/20 px-3 py-1.5 text-sm font-medium text-primary">
                    OG +{tier.ogBonusRate}%
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>OG NFT holder bonus adds {tier.ogBonusRate}% to your cashback rate</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Progress to Next Tier */}
        {!tier.isMaxTier && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress to Next Tier</span>
              <span className="font-medium">
                {tier.gnoNeededForNextTier.toFixed(2)} GNO needed
              </span>
            </div>

            <div className="relative h-3 overflow-hidden rounded-full bg-muted">
              <div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${getTierColor(tier.current + 1)} transition-all duration-500`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{tier.minGno} GNO</span>
              <span>{tier.maxGno} GNO</span>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Next tier:{' '}
              <span className="font-medium text-foreground">
                {CASHBACK_TIER_CONFIG[(tier.current + 1) as CashbackTier]?.label ?? 'Max'}
              </span>{' '}
              ({tier.nextTierRate}% cashback)
            </p>
          </div>
        )}

        {tier.isMaxTier && (
          <div className="rounded-xl bg-primary/10 p-4 text-center">
            <Crown className="mx-auto mb-2 h-8 w-8 text-primary" />
            <p className="font-medium text-primary">Maximum Tier Reached!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              You&apos;re earning the highest cashback rate
            </p>
          </div>
        )}

        {/* Tier Milestones */}
        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-muted-foreground">All Tiers</p>
          <div className="flex items-center justify-between">
            {tierDetails.map((t) => (
              <Tooltip key={t.tier}>
                <TooltipTrigger>
                  <div
                    className={`flex flex-col items-center ${
                      t.tier <= tier.current ? 'opacity-100' : 'opacity-40'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        t.tier === tier.current
                          ? `bg-gradient-to-br ${getTierColor(t.tier)}`
                          : t.tier < tier.current
                            ? 'bg-primary/20'
                            : 'bg-muted'
                      }`}
                    >
                      {getTierIcon(t.tier)}
                    </div>
                    <span className="mt-1 text-xs">{t.rate}%</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.tier === 0 ? '0' : `${t.minGno}+`} GNO
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

