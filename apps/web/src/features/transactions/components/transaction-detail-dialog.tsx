'use client';

import type { CSSProperties, ReactNode } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  ExternalLink,
  Hash,
  MapPin,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Tag,
  WalletCards,
  X,
} from 'lucide-react';
import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  cn,
} from '@payments-view/ui';
import {
  getTransactionKindLabel,
  getTransactionStatusMessage,
  getTransactionTypeLabel,
} from '@payments-view/constants';

import { CategoryIcon } from '@/components/atoms/category-icon';

import type { SerializedTransaction } from './transaction-row';
import {
  calculateCashback,
  formatCashback,
  formatDateTime,
  formatSignedBillingAmount,
  getCategory,
  getStatusText,
  getStatusVariant,
  isPositiveTransaction,
  shortenHash,
} from './transaction-display';

interface TransactionDetailDialogProps {
  transaction: SerializedTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cashbackRate?: number;
}

interface DetailItemProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  description?: ReactNode;
  mono?: boolean;
}

function DetailItem({ icon, label, value, description, mono }: DetailItemProps) {
  return (
    <div className="flex gap-3 py-3">
      <div className="bg-muted text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs">{label}</p>
        <div
          className={cn(
            'text-foreground mt-0.5 break-words text-sm font-medium',
            mono && 'font-mono text-xs'
          )}
        >
          {value}
        </div>
        {description ? (
          <div className="text-muted-foreground mt-1 text-xs leading-relaxed">
            {description}
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface TimelineItemProps {
  label: string;
  value: ReactNode;
  state: 'complete' | 'current' | 'muted';
  isLast?: boolean;
}

function TimelineItem({ label, value, state, isLast }: TimelineItemProps) {
  return (
    <div className="grid grid-cols-[1.25rem_1fr] gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'mt-0.5 h-3 w-3 rounded-full border',
            state === 'complete' && 'border-emerald-400 bg-emerald-400',
            state === 'current' && 'border-blue-400 bg-blue-400',
            state === 'muted' && 'border-border bg-muted'
          )}
        />
        {isLast ? null : <div className="bg-border mt-1 h-full w-px" />}
      </div>
      <div className="pb-4">
        <p className="text-foreground text-sm font-medium">{label}</p>
        <div className="text-muted-foreground mt-0.5 text-xs">{value}</div>
      </div>
    </div>
  );
}

function formatLocation(transaction: SerializedTransaction): string {
  const location = [transaction.merchant.city, transaction.merchant.country].filter(Boolean);
  return location.length > 0 ? location.join(', ') : 'Location not provided';
}

function hasCurrencyConversion(transaction: SerializedTransaction): boolean {
  return transaction.billingAmount.currency !== transaction.transactionAmount.currency;
}

function getCashbackDetail(
  transaction: SerializedTransaction,
  cashbackRate: number | undefined,
  isPositive: boolean
) {
  if (isPositive) {
    return {
      value: 'Not earned',
      description: 'Refunds and reversals do not create new cashback.',
    };
  }

  if (!transaction.isEligibleForCashback) {
    return {
      value: 'Not eligible',
      description: 'This merchant transaction does not impact cashback.',
    };
  }

  if (cashbackRate === undefined) {
    return {
      value: 'Eligible',
      description: 'Cashback rate is still loading.',
    };
  }

  return {
    value: formatCashback(calculateCashback(transaction.billingAmount.amount, cashbackRate)),
    description: `${cashbackRate.toFixed(2)}% cashback rate applied to the billed amount.`,
  };
}

function ExplorerHash({ hash }: { hash: string }) {
  return (
    <a
      href={`https://gnosisscan.io/tx/${hash}`}
      target="_blank"
      rel="noreferrer"
      className="text-primary inline-flex items-center gap-1 break-all hover:underline"
    >
      {shortenHash(hash)}
      <ExternalLink className="h-3 w-3 shrink-0" />
    </a>
  );
}

/**
 * Receipt-style detail view for a selected transaction.
 */
export function TransactionDetailDialog({
  transaction,
  open,
  onOpenChange,
  cashbackRate,
}: TransactionDetailDialogProps) {
  if (!transaction) {
    return <Dialog open={open} onOpenChange={onOpenChange} />;
  }

  const category = getCategory(transaction.merchant.categoryId, transaction.merchant.category);
  const isPositive = isPositiveTransaction(transaction);
  const cashback = getCashbackDetail(transaction, cashbackRate, isPositive);
  const statusText = getStatusText(transaction.status, transaction.isPending);
  const statusMessage = transaction.isPending
    ? 'Authorization is pending. Final amount and clearance can still change.'
    : getTransactionStatusMessage(transaction.status);
  const clearedAtValue = transaction.clearedAt
    ? formatDateTime(transaction.clearedAt)
    : transaction.isPending
      ? 'Waiting for merchant settlement'
      : 'Clearance timestamp not provided';
  const clearedAtState = transaction.clearedAt
    ? 'complete'
    : transaction.isPending
      ? 'current'
      : 'muted';
  const categoryStyle = {
    '--transaction-category-color': category.color,
  } as CSSProperties;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100vh-2rem)] max-w-2xl flex-col overflow-hidden p-0 sm:rounded-3xl">
        <div
          className="relative overflow-hidden border-b border-border bg-card px-5 py-5 sm:px-6"
          style={categoryStyle}
        >
          <div className="pointer-events-none absolute inset-0 opacity-20 [background:radial-gradient(circle_at_top_left,var(--transaction-category-color),transparent_34%)]" />
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-background/70"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close transaction details</span>
            </Button>
          </DialogClose>

          <div className="relative">
            <DialogHeader className="pr-10 text-left">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                  <CategoryIcon icon={category.icon} size={24} />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-xl leading-tight tracking-normal">
                    {transaction.merchant.name}
                  </DialogTitle>
                  <DialogDescription className="mt-1 flex flex-wrap items-center gap-2">
                    <span>{category.name}</span>
                    <span className="text-border">/</span>
                    <span>{formatLocation(transaction)}</span>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Billed amount</p>
                <p
                  className={cn(
                    'mt-1 text-4xl font-semibold tabular-nums',
                    isPositive ? 'text-emerald-400' : 'text-foreground'
                  )}
                >
                  {formatSignedBillingAmount(transaction)}
                </p>
                {hasCurrencyConversion(transaction) ? (
                  <p className="text-muted-foreground mt-1 text-sm">
                    Original charge: {transaction.transactionAmount.formatted}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Badge variant={getStatusVariant(transaction.status, transaction.isPending)}>
                  {statusText}
                </Badge>
                <Badge variant="outline">Card **** {transaction.cardTokenLast4}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="mb-2 flex items-center gap-2">
                <ReceiptText className="text-primary h-4 w-4" />
                <h3 className="text-sm font-semibold">Receipt</h3>
              </div>
              <div className="divide-y divide-border">
                <DetailItem
                  icon={<CircleDollarSign className="h-4 w-4" />}
                  label="Cashback"
                  value={cashback.value}
                  description={cashback.description}
                />
                <DetailItem
                  icon={<Tag className="h-4 w-4" />}
                  label="Transaction type"
                  value={getTransactionTypeLabel(transaction.type)}
                  description={getTransactionKindLabel(transaction.kind)}
                />
                <DetailItem
                  icon={<MapPin className="h-4 w-4" />}
                  label="Merchant"
                  value={formatLocation(transaction)}
                  description={`MCC ${transaction.merchant.mcc}`}
                />
                <DetailItem
                  icon={<CreditCard className="h-4 w-4" />}
                  label="Card"
                  value={`**** ${transaction.cardTokenLast4}`}
                  description="Gnosis Pay card token used for this authorization."
                />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="text-primary h-4 w-4" />
                <h3 className="text-sm font-semibold">Status</h3>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <div className="flex items-start gap-3">
                  {transaction.isPending ? (
                    <Clock3 className="mt-0.5 h-4 w-4 text-blue-400" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{statusText}</p>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                      {statusMessage}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <TimelineItem
                  label="Authorized"
                  value={formatDateTime(transaction.createdAt)}
                  state="complete"
                />
                <TimelineItem
                  label="Cleared"
                  value={clearedAtValue}
                  state={clearedAtState}
                />
                <TimelineItem
                  label="On-chain record"
                  value={
                    transaction.onChainTxHash ? (
                      <ExplorerHash hash={transaction.onChainTxHash} />
                    ) : (
                      'Not provided for this transaction'
                    )
                  }
                  state={transaction.onChainTxHash ? 'complete' : 'muted'}
                  isLast
                />
              </div>
            </section>
          </div>

          <section className="mt-4 rounded-2xl border border-border bg-background/60 p-4">
            <div className="mb-2 flex items-center gap-2">
              <WalletCards className="text-primary h-4 w-4" />
              <h3 className="text-sm font-semibold">Transaction Details</h3>
            </div>
            <div className="grid gap-x-4 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="divide-y divide-border md:pr-4">
                <DetailItem
                  icon={<CalendarClock className="h-4 w-4" />}
                  label="Created"
                  value={formatDateTime(transaction.createdAt)}
                />
                <DetailItem
                  icon={<Sparkles className="h-4 w-4" />}
                  label="Cashback eligibility"
                  value={transaction.isEligibleForCashback ? 'Eligible' : 'Not eligible'}
                />
              </div>
              <div className="divide-y divide-border md:pl-4">
                <DetailItem
                  icon={<Hash className="h-4 w-4" />}
                  label="Transaction ID"
                  value={shortenHash(transaction.id, 8)}
                  description={transaction.id}
                  mono
                />
                <DetailItem
                  icon={<Hash className="h-4 w-4" />}
                  label="Thread ID"
                  value={shortenHash(transaction.threadId, 8)}
                  description={transaction.threadId}
                  mono
                />
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
