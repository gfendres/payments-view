import { describe, test, expect, beforeEach } from 'bun:test';
import { CashbackCalculatorService } from '../cashback-calculator.service';
import { CashbackTierInfo } from '../../value-objects/cashback-tier';
import type { CashbackEligibleTransaction } from '../cashback-calculator.service';

describe('CashbackCalculatorService', () => {
  let service: CashbackCalculatorService;
  let tierInfo: CashbackTierInfo;

  beforeEach(() => {
    service = new CashbackCalculatorService();
    tierInfo = CashbackTierInfo.fromBalance(100, false);
  });

  describe('calculateTransactionCashback', () => {
    test('should calculate cashback for eligible transaction', () => {
      const transaction: CashbackEligibleTransaction = {
        id: 'tx1',
        billingAmount: 100,
        isEligibleForCashback: true,
        createdAt: new Date(),
      };

      const result = service.calculateTransactionCashback(transaction, tierInfo);

      expect(result.transactionId).toBe('tx1');
      expect(result.billingAmount).toBe(100);
      expect(result.cashbackRate).toBe(tierInfo.totalRate);
      expect(result.cashbackAmount).toBeGreaterThan(0);
    });

    test('should return zero cashback for ineligible transaction', () => {
      const transaction: CashbackEligibleTransaction = {
        id: 'tx1',
        billingAmount: 100,
        isEligibleForCashback: false,
        createdAt: new Date(),
      };

      const result = service.calculateTransactionCashback(transaction, tierInfo);

      expect(result.cashbackRate).toBe(0);
      expect(result.cashbackAmount).toBe(0);
    });

    test('should handle negative amounts correctly', () => {
      const transaction: CashbackEligibleTransaction = {
        id: 'tx1',
        billingAmount: -100,
        isEligibleForCashback: true,
        createdAt: new Date(),
      };

      const result = service.calculateTransactionCashback(transaction, tierInfo);

      expect(result.billingAmount).toBe(100); // Should be absolute value
      expect(result.cashbackAmount).toBeGreaterThan(0);
    });
  });

  describe('calculateBatchCashback', () => {
    test('should calculate cashback for multiple transactions', () => {
      const transactions: CashbackEligibleTransaction[] = [
        {
          id: 'tx1',
          billingAmount: 100,
          isEligibleForCashback: true,
          createdAt: new Date(),
        },
        {
          id: 'tx2',
          billingAmount: 50,
          isEligibleForCashback: true,
          createdAt: new Date(),
        },
      ];

      const results = service.calculateBatchCashback(transactions, tierInfo);

      expect(results).toHaveLength(2);
      expect(results[0].transactionId).toBe('tx1');
      expect(results[1].transactionId).toBe('tx2');
    });

    test('should handle empty array', () => {
      const results = service.calculateBatchCashback([], tierInfo);

      expect(results).toHaveLength(0);
    });
  });

  describe('calculateSummary', () => {
    test('should calculate summary for transactions', () => {
      const transactions: CashbackEligibleTransaction[] = [
        {
          id: 'tx1',
          billingAmount: 100,
          isEligibleForCashback: true,
          createdAt: new Date(),
        },
        {
          id: 'tx2',
          billingAmount: 50,
          isEligibleForCashback: true,
          createdAt: new Date(),
        },
        {
          id: 'tx3',
          billingAmount: 25,
          isEligibleForCashback: false,
          createdAt: new Date(),
        },
      ];

      const summary = service.calculateSummary(transactions, tierInfo);

      expect(summary.totalSpending).toBe(175);
      expect(summary.eligibleSpending).toBe(150);
      expect(summary.transactionCount).toBe(3);
      expect(summary.eligibleTransactionCount).toBe(2);
      expect(summary.totalCashback).toBeGreaterThan(0);
      expect(summary.averageCashbackRate).toBeGreaterThan(0);
    });

    test('should handle empty transactions', () => {
      const summary = service.calculateSummary([], tierInfo);

      expect(summary.totalSpending).toBe(0);
      expect(summary.eligibleSpending).toBe(0);
      expect(summary.transactionCount).toBe(0);
      expect(summary.eligibleTransactionCount).toBe(0);
      expect(summary.totalCashback).toBe(0);
      expect(summary.averageCashbackRate).toBe(0);
    });

    test('should calculate average cashback rate correctly', () => {
      const transactions: CashbackEligibleTransaction[] = [
        {
          id: 'tx1',
          billingAmount: 100,
          isEligibleForCashback: true,
          createdAt: new Date(),
        },
      ];

      const summary = service.calculateSummary(transactions, tierInfo);

      expect(summary.averageCashbackRate).toBeCloseTo(tierInfo.totalRate, 2);
    });
  });

  describe('calculateTierProgress', () => {
    test('should calculate tier progress', () => {
      const progress = service.calculateTierProgress(tierInfo, 1000);

      expect(progress.currentTier).toBe(tierInfo.tier);
      expect(progress.currentTierLabel).toBe(tierInfo.label);
      expect(progress.currentRate).toBe(tierInfo.totalRate);
      expect(progress.gnoBalance).toBe(tierInfo.gnoBalance);
    });

    test('should calculate next tier info when not at max', () => {
      const progress = service.calculateTierProgress(tierInfo, 1000);

      if (!tierInfo.isMaxTier) {
        expect(progress.nextTier).not.toBeNull();
        expect(progress.nextTierLabel).not.toBeNull();
        expect(progress.nextRate).not.toBeNull();
        expect(progress.gnoNeeded).toBeGreaterThanOrEqual(0);
        expect(progress.progressPercentage).toBeGreaterThanOrEqual(0);
        expect(progress.progressPercentage).toBeLessThanOrEqual(100);
      }
    });

    test('should handle max tier', () => {
      const maxTier = CashbackTierInfo.fromBalance(1000000, false);
      const progress = service.calculateTierProgress(maxTier, 1000);

      if (maxTier.isMaxTier) {
        expect(progress.nextTier).toBeNull();
        expect(progress.nextTierLabel).toBeNull();
        expect(progress.nextRate).toBeNull();
      }
    });

    test('should calculate potential extra cashback', () => {
      const progress = service.calculateTierProgress(tierInfo, 1000);

      if (progress.nextRate !== null) {
        expect(progress.potentialExtraCashback).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('calculateMonthlyBreakdown', () => {
    test('should group transactions by month', () => {
      const transactions: CashbackEligibleTransaction[] = [
        {
          id: 'tx1',
          billingAmount: 100,
          isEligibleForCashback: true,
          createdAt: new Date('2024-01-15'),
        },
        {
          id: 'tx2',
          billingAmount: 50,
          isEligibleForCashback: true,
          createdAt: new Date('2024-01-20'),
        },
        {
          id: 'tx3',
          billingAmount: 75,
          isEligibleForCashback: true,
          createdAt: new Date('2024-02-10'),
        },
      ];

      const breakdown = service.calculateMonthlyBreakdown(transactions, tierInfo);

      expect(breakdown.size).toBe(2);
      expect(breakdown.has('2024-01')).toBe(true);
      expect(breakdown.has('2024-02')).toBe(true);
    });

    test('should calculate summary for each month', () => {
      const transactions: CashbackEligibleTransaction[] = [
        {
          id: 'tx1',
          billingAmount: 100,
          isEligibleForCashback: true,
          createdAt: new Date('2024-01-15'),
        },
      ];

      const breakdown = service.calculateMonthlyBreakdown(transactions, tierInfo);
      const janSummary = breakdown.get('2024-01');

      expect(janSummary).toBeDefined();
      if (janSummary) {
        expect(janSummary.totalSpending).toBe(100);
        expect(janSummary.transactionCount).toBe(1);
      }
    });

    test('should handle empty transactions', () => {
      const breakdown = service.calculateMonthlyBreakdown([], tierInfo);

      expect(breakdown.size).toBe(0);
    });
  });
});

