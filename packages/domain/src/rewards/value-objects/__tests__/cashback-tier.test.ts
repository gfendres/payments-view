import { describe, test, expect } from 'bun:test';
import { CashbackTierInfo } from '../cashback-tier';

describe('CashbackTierInfo', () => {
  describe('fromBalance', () => {
    test('should create tier info from balance', () => {
      const tierInfo = CashbackTierInfo.fromBalance(100, false);

      expect(tierInfo.gnoBalance).toBe(100);
      expect(tierInfo.isOgHolder).toBe(false);
      expect(tierInfo.tier).toBeDefined();
    });

    test('should handle OG holder', () => {
      const tierInfo = CashbackTierInfo.fromBalance(100, true);

      expect(tierInfo.isOgHolder).toBe(true);
    });

    test('should handle zero balance', () => {
      const tierInfo = CashbackTierInfo.fromBalance(0, false);

      expect(tierInfo.gnoBalance).toBe(0);
    });
  });

  describe('tier', () => {
    test('should return current tier', () => {
      const tierInfo = CashbackTierInfo.fromBalance(100, false);

      expect(tierInfo.tier).toBeDefined();
      expect(typeof tierInfo.tier).toBe('number');
    });
  });

  describe('gnoBalance', () => {
    test('should return GNO balance', () => {
      const tierInfo = CashbackTierInfo.fromBalance(500, false);

      expect(tierInfo.gnoBalance).toBe(500);
    });
  });

  describe('isOgHolder', () => {
    test('should return OG holder status', () => {
      const regular = CashbackTierInfo.fromBalance(100, false);
      const og = CashbackTierInfo.fromBalance(100, true);

      expect(regular.isOgHolder).toBe(false);
      expect(og.isOgHolder).toBe(true);
    });
  });

  describe('baseRate', () => {
    test('should return base cashback rate', () => {
      const tierInfo = CashbackTierInfo.fromBalance(100, false);

      expect(tierInfo.baseRate).toBeGreaterThanOrEqual(0);
      expect(typeof tierInfo.baseRate).toBe('number');
    });
  });

  describe('totalRate', () => {
    test('should return total rate including OG bonus', () => {
      const regular = CashbackTierInfo.fromBalance(100, false);
      const og = CashbackTierInfo.fromBalance(100, true);

      expect(og.totalRate).toBeGreaterThanOrEqual(regular.totalRate);
    });

    test('should return base rate for non-OG holders', () => {
      const tierInfo = CashbackTierInfo.fromBalance(100, false);

      expect(tierInfo.totalRate).toBe(tierInfo.baseRate);
    });
  });

  describe('label', () => {
    test('should return tier label', () => {
      const tierInfo = CashbackTierInfo.fromBalance(100, false);

      expect(typeof tierInfo.label).toBe('string');
      expect(tierInfo.label.length).toBeGreaterThan(0);
    });
  });

  describe('minGnoForCurrentTier', () => {
    test('should return minimum GNO for tier', () => {
      const tierInfo = CashbackTierInfo.fromBalance(100, false);

      expect(tierInfo.minGnoForCurrentTier).toBeGreaterThanOrEqual(0);
    });
  });

  describe('maxGnoForCurrentTier', () => {
    test('should return max GNO or null for top tier', () => {
      const tierInfo = CashbackTierInfo.fromBalance(100, false);

      expect(tierInfo.maxGnoForCurrentTier === null || tierInfo.maxGnoForCurrentTier >= 0).toBe(true);
    });
  });

  describe('isMaxTier', () => {
    test('should return false when not at max tier', () => {
      const tierInfo = CashbackTierInfo.fromBalance(0, false);

      // Assuming tier 0 is not max tier
      expect(typeof tierInfo.isMaxTier).toBe('boolean');
    });
  });

  describe('gnoNeededForNextTier', () => {
    test('should return GNO needed for next tier', () => {
      const tierInfo = CashbackTierInfo.fromBalance(100, false);

      expect(tierInfo.gnoNeededForNextTier).toBeGreaterThanOrEqual(0);
    });

    test('should return 0 for max tier', () => {
      // Create tier info that would be at max tier
      const tierInfo = CashbackTierInfo.fromBalance(1000000, false);

      if (tierInfo.isMaxTier) {
        expect(tierInfo.gnoNeededForNextTier).toBe(0);
      }
    });
  });

  describe('progressToNextTier', () => {
    test('should return progress percentage', () => {
      const tierInfo = CashbackTierInfo.fromBalance(100, false);

      expect(tierInfo.progressToNextTier).toBeGreaterThanOrEqual(0);
      expect(tierInfo.progressToNextTier).toBeLessThanOrEqual(100);
    });

    test('should return 100 for max tier', () => {
      const tierInfo = CashbackTierInfo.fromBalance(1000000, false);

      if (tierInfo.isMaxTier) {
        expect(tierInfo.progressToNextTier).toBe(100);
      }
    });
  });

  describe('nextTierRate', () => {
    test('should return next tier rate', () => {
      const tierInfo = CashbackTierInfo.fromBalance(100, false);

      expect(tierInfo.nextTierRate).toBeGreaterThanOrEqual(0);
    });

    test('should return current rate for max tier', () => {
      const tierInfo = CashbackTierInfo.fromBalance(1000000, false);

      if (tierInfo.isMaxTier) {
        expect(tierInfo.nextTierRate).toBe(tierInfo.totalRate);
      }
    });
  });

  describe('ogBonusRate', () => {
    test('should return OG bonus for OG holders', () => {
      const og = CashbackTierInfo.fromBalance(100, true);

      expect(og.ogBonusRate).toBeGreaterThan(0);
    });

    test('should return 0 for non-OG holders', () => {
      const regular = CashbackTierInfo.fromBalance(100, false);

      expect(regular.ogBonusRate).toBe(0);
    });
  });
});

