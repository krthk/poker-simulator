import { describe, test, expect } from 'vitest';
import {
  HAND_STRENGTH_RANKING,
  getHandRank,
  getHandStrengthPercentage,
  getTopPercentHands,
  getRangeLabel,
  PRESET_PERCENTAGES,
  getHandsInRange,
  isValidHand,
  getRangeStats
} from '../poker/handStrength';

describe('Hand Strength Ranking System', () => {
  
  describe('HAND_STRENGTH_RANKING', () => {
    test('contains exactly 169 unique hands', () => {
      expect(HAND_STRENGTH_RANKING).toHaveLength(169);
      
      // Check for uniqueness
      const uniqueHands = new Set(HAND_STRENGTH_RANKING);
      expect(uniqueHands.size).toBe(169);
    });

    test('starts with premium hands', () => {
      expect(HAND_STRENGTH_RANKING[0]).toBe('AA');
      expect(HAND_STRENGTH_RANKING[1]).toBe('KK');
      expect(HAND_STRENGTH_RANKING[2]).toBe('QQ');
      expect(HAND_STRENGTH_RANKING[3]).toBe('JJ');
      expect(HAND_STRENGTH_RANKING[4]).toBe('TT');
    });

    test('ends with weakest hands', () => {
      const length = HAND_STRENGTH_RANKING.length;
      // The algorithmic system may rank the weakest hands slightly differently
      // but 32o should still be the absolute weakest
      expect(HAND_STRENGTH_RANKING[length - 1]).toBe('32o');
      // Just verify the last few are all weak hands (any of the bottom-tier hands)
      const weakHands = ['32o', '32s', '42o', '42s', '43o', '43s', '52o', '52s', '53o', '53s', 
                         '62o', '62s', '63o', '63s', '72o', '72s', '73o', '73s', '82o', '82s', '83o', '83s'];
      expect(weakHands).toContain(HAND_STRENGTH_RANKING[length - 2]);
      expect(weakHands).toContain(HAND_STRENGTH_RANKING[length - 3]);
    });

    test('includes all expected hand types', () => {
      const ranking = HAND_STRENGTH_RANKING;
      
      // Should include all pocket pairs
      expect(ranking).toContain('AA');
      expect(ranking).toContain('22');
      
      // Should include suited and offsuit combinations
      expect(ranking).toContain('AKs');
      expect(ranking).toContain('AKo');
      expect(ranking).toContain('72s');
      expect(ranking).toContain('72o');
    });
  });

  describe('getHandRank', () => {
    test('returns correct ranks for known hands', () => {
      expect(getHandRank('AA')).toBe(1);
      expect(getHandRank('KK')).toBe(2);
      expect(getHandRank('QQ')).toBe(3);
      expect(getHandRank('32o')).toBe(169);
    });

    test('returns 170 for invalid hands', () => {
      expect(getHandRank('invalid')).toBe(170);
      expect(getHandRank('ZZ')).toBe(170);
      expect(getHandRank('')).toBe(170);
    });

    test('maintains order consistency', () => {
      expect(getHandRank('AA')).toBeLessThan(getHandRank('KK'));
      expect(getHandRank('KK')).toBeLessThan(getHandRank('QQ'));
      expect(getHandRank('AKs')).toBeLessThan(getHandRank('AKo'));
    });
  });

  describe('getHandStrengthPercentage', () => {
    test('returns 100% for strongest hand', () => {
      expect(getHandStrengthPercentage('AA')).toBe(100);
    });

    test('returns ~0.6% for weakest hand', () => {
      expect(getHandStrengthPercentage('32o')).toBe(0.6); // 1/169 ≈ 0.6%
    });

    test('returns decreasing percentages for weaker hands', () => {
      const aaPercent = getHandStrengthPercentage('AA');
      const kkPercent = getHandStrengthPercentage('KK');
      const qqPercent = getHandStrengthPercentage('QQ');
      
      expect(aaPercent).toBe(100); // Should be exactly 100% for strongest
      expect(kkPercent).toBeGreaterThan(qqPercent);
      expect(aaPercent).toBeGreaterThan(kkPercent);
    });
  });

  describe('getTopPercentHands', () => {
    test('throws error for invalid percentages', () => {
      expect(() => getTopPercentHands(-1)).toThrow('Percentage must be between 0 and 100');
      expect(() => getTopPercentHands(101)).toThrow('Percentage must be between 0 and 100');
    });

    test('returns empty array for 0%', () => {
      expect(getTopPercentHands(0)).toEqual([]);
    });

    test('returns all hands for 100%', () => {
      const result = getTopPercentHands(100);
      expect(result).toHaveLength(169);
      expect(result).toEqual([...HAND_STRENGTH_RANKING]);
    });

    test('returns approximately correct number of hands', () => {
      const result5 = getTopPercentHands(5);
      const result10 = getTopPercentHands(10);
      const result50 = getTopPercentHands(50);
      
      // 5% of 169 ≈ 8 hands
      expect(result5.length).toBeCloseTo(8, 1);
      
      // 10% of 169 ≈ 17 hands  
      expect(result10.length).toBeCloseTo(17, 2);
      
      // 50% of 169 ≈ 85 hands
      expect(result50.length).toBeCloseTo(85, 5);
    });

    test('always returns strongest hands first', () => {
      const result = getTopPercentHands(10);
      expect(result[0]).toBe('AA');
      expect(result[1]).toBe('KK');
      expect(result[2]).toBe('QQ');
    });

    test('increasing percentages include all previous hands', () => {
      const result5 = getTopPercentHands(5);
      const result10 = getTopPercentHands(10);
      const result20 = getTopPercentHands(20);
      
      // All hands in 5% should be in 10% and 20%
      result5.forEach(hand => {
        expect(result10).toContain(hand);
        expect(result20).toContain(hand);
      });
      
      // All hands in 10% should be in 20%
      result10.forEach(hand => {
        expect(result20).toContain(hand);
      });
    });
  });

  describe('getRangeLabel', () => {
    test('returns correct labels for different percentages', () => {
      expect(getRangeLabel(1)).toBe('Premium only (<3%)');
      expect(getRangeLabel(5)).toBe('Ultra-tight (3-8%)');
      expect(getRangeLabel(12)).toBe('Very tight (8-15%)');
      expect(getRangeLabel(20)).toBe('Tight (15-25%)');
      expect(getRangeLabel(35)).toBe('Medium (25-40%)');
      expect(getRangeLabel(50)).toBe('Medium-loose (40-60%)');
      expect(getRangeLabel(70)).toBe('Loose (60-80%)');
      expect(getRangeLabel(90)).toBe('Very loose (80-95%)');
      expect(getRangeLabel(98)).toBe('Ultra-wide (95%+)');
    });
  });

  describe('PRESET_PERCENTAGES', () => {
    test('contains expected preset values', () => {
      expect(PRESET_PERCENTAGES.PREMIUM).toBeLessThan(3);
      expect(PRESET_PERCENTAGES.ULTRA_TIGHT).toBeLessThan(PRESET_PERCENTAGES.VERY_TIGHT);
      expect(PRESET_PERCENTAGES.VERY_TIGHT).toBeLessThan(PRESET_PERCENTAGES.TIGHT);
      expect(PRESET_PERCENTAGES.TIGHT).toBeLessThan(PRESET_PERCENTAGES.MEDIUM);
      expect(PRESET_PERCENTAGES.ULTRA_LOOSE).toBeGreaterThan(80);
    });

    test('presets generate reasonable hand counts', () => {
      const premiumHands = getTopPercentHands(PRESET_PERCENTAGES.PREMIUM);
      const tightHands = getTopPercentHands(PRESET_PERCENTAGES.TIGHT);
      const looseHands = getTopPercentHands(PRESET_PERCENTAGES.LOOSE);
      
      expect(premiumHands.length).toBeLessThan(10);
      expect(tightHands.length).toBeGreaterThan(20);
      expect(tightHands.length).toBeLessThan(35);
      expect(looseHands.length).toBeGreaterThan(80);
      expect(looseHands.length).toBeLessThan(90);
    });
  });

  describe('getHandsInRange', () => {
    test('throws error when minPercent > maxPercent', () => {
      expect(() => getHandsInRange(20, 10)).toThrow('minPercent cannot be greater than maxPercent');
    });

    test('returns hands in specified range', () => {
      const result = getHandsInRange(5, 10);
      const top5 = getTopPercentHands(5);
      const top10 = getTopPercentHands(10);
      
      // Should contain hands that are in top 10% but not in top 5%
      result.forEach(hand => {
        expect(top10).toContain(hand);
        expect(top5).not.toContain(hand);
      });
    });

    test('returns empty array for same percentages', () => {
      const result = getHandsInRange(10, 10);
      expect(result).toEqual([]);
    });
  });

  describe('isValidHand', () => {
    test('returns true for valid hands', () => {
      expect(isValidHand('AA')).toBe(true);
      expect(isValidHand('AKs')).toBe(true);
      expect(isValidHand('72o')).toBe(true);
    });

    test('returns false for invalid hands', () => {
      expect(isValidHand('invalid')).toBe(false);
      expect(isValidHand('ZZ')).toBe(false);
      expect(isValidHand('')).toBe(false);
      expect(isValidHand('A1s')).toBe(false);
    });
  });

  describe('getRangeStats', () => {
    test('returns correct stats for empty range', () => {
      const stats = getRangeStats([]);
      expect(stats.count).toBe(0);
      expect(stats.percentage).toBe(0);
      expect(stats.averageStrength).toBe(0);
      expect(stats.strongestHand).toBe('');
      expect(stats.weakestHand).toBe('');
    });

    test('returns correct stats for single hand', () => {
      const stats = getRangeStats(['AA']);
      expect(stats.count).toBe(1);
      expect(stats.percentage).toBeCloseTo(0.5, 1); // 6 combinations/1326 ≈ 0.5%
      expect(stats.combinations).toBe(6); // AA has 6 combinations
      expect(stats.strongestHand).toBe('AA');
      expect(stats.weakestHand).toBe('AA');
    });

    test('returns correct stats for multiple hands', () => {
      const hands = ['AA', 'KK', 'QQ', '72o'];
      const stats = getRangeStats(hands);
      
      expect(stats.count).toBe(4);
      expect(stats.percentage).toBeCloseTo(2.3, 1); // (6+6+6+12)/1326 ≈ 2.3%
      expect(stats.combinations).toBe(30); // 6+6+6+12 = 30 combinations
      expect(stats.strongestHand).toBe('AA');
      expect(stats.weakestHand).toBe('72o');
    });

    test('filters out invalid hands', () => {
      const hands = ['AA', 'invalid', 'KK', 'bad'];
      const stats = getRangeStats(hands);
      
      expect(stats.count).toBe(2); // Only AA and KK are valid
      expect(stats.strongestHand).toBe('AA');
      expect(stats.weakestHand).toBe('KK');
    });
  });

  describe('Ranking Consistency Tests', () => {
    test('King hands always rank higher than Queen hands with same kicker', () => {
      const kickers = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J'];
      
      kickers.forEach(kicker => {
        const kingSuited = `K${kicker}s`;
        const queenSuited = `Q${kicker}s`;
        const kingOffsuit = `K${kicker}o`;
        const queenOffsuit = `Q${kicker}o`;
        
        // Check suited versions
        if (isValidHand(kingSuited) && isValidHand(queenSuited)) {
          const kingRank = getHandRank(kingSuited);
          const queenRank = getHandRank(queenSuited);
          expect(kingRank, 
            `${kingSuited} (rank ${kingRank}) should rank higher than ${queenSuited} (rank ${queenRank})`).toBeLessThan(queenRank);
        }
        
        // Check offsuit versions
        if (isValidHand(kingOffsuit) && isValidHand(queenOffsuit)) {
          const kingRank = getHandRank(kingOffsuit);
          const queenRank = getHandRank(queenOffsuit);
          expect(kingRank,
            `${kingOffsuit} (rank ${kingRank}) should rank higher than ${queenOffsuit} (rank ${queenRank})`).toBeLessThan(queenRank);
        }
      });
    });

    test('Queen hands always rank higher than Jack hands with same kicker', () => {
      const kickers = ['2', '3', '4', '5', '6', '7', '8', '9', 'T'];
      
      kickers.forEach(kicker => {
        const queenSuited = `Q${kicker}s`;
        const jackSuited = `J${kicker}s`;
        const queenOffsuit = `Q${kicker}o`;
        const jackOffsuit = `J${kicker}o`;
        
        // Check suited versions
        if (isValidHand(queenSuited) && isValidHand(jackSuited)) {
          const queenRank = getHandRank(queenSuited);
          const jackRank = getHandRank(jackSuited);
          expect(queenRank,
            `${queenSuited} (rank ${queenRank}) should rank higher than ${jackSuited} (rank ${jackRank})`).toBeLessThan(jackRank);
        }
        
        // Check offsuit versions
        if (isValidHand(queenOffsuit) && isValidHand(jackOffsuit)) {
          const queenRank = getHandRank(queenOffsuit);
          const jackRank = getHandRank(jackOffsuit);
          expect(queenRank,
            `${queenOffsuit} (rank ${queenRank}) should rank higher than ${jackOffsuit} (rank ${jackRank})`).toBeLessThan(jackRank);
        }
      });
    });

    test('Jack hands always rank higher than Ten hands with same kicker', () => {
      const kickers = ['2', '3', '4', '5', '6', '7', '8', '9'];
      
      kickers.forEach(kicker => {
        const jackSuited = `J${kicker}s`;
        const tenSuited = `T${kicker}s`;
        const jackOffsuit = `J${kicker}o`;
        const tenOffsuit = `T${kicker}o`;
        
        // Check suited versions
        if (isValidHand(jackSuited) && isValidHand(tenSuited)) {
          const jackRank = getHandRank(jackSuited);
          const tenRank = getHandRank(tenSuited);
          expect(jackRank,
            `${jackSuited} (rank ${jackRank}) should rank higher than ${tenSuited} (rank ${tenRank})`).toBeLessThan(tenRank);
        }
        
        // Check offsuit versions
        if (isValidHand(jackOffsuit) && isValidHand(tenOffsuit)) {
          const jackRank = getHandRank(jackOffsuit);
          const tenRank = getHandRank(tenOffsuit);
          expect(jackRank,
            `${jackOffsuit} (rank ${jackRank}) should rank higher than ${tenOffsuit} (rank ${tenRank})`).toBeLessThan(tenRank);
        }
      });
    });

    test('suited hands rank higher than offsuit hands with same cards', () => {
      const combinations = [
        ['A', 'K'], ['A', 'Q'], ['A', 'J'], ['K', 'Q'], ['K', 'J'], ['Q', 'J'],
        ['A', '2'], ['K', '2'], ['Q', '2'], ['J', '2'], ['T', '2'], ['9', '2']
      ];
      
      combinations.forEach(([rank1, rank2]) => {
        const suited = `${rank1}${rank2}s`;
        const offsuit = `${rank1}${rank2}o`;
        
        if (isValidHand(suited) && isValidHand(offsuit)) {
          const suitedRank = getHandRank(suited);
          const offsuitRank = getHandRank(offsuit);
          expect(suitedRank,
            `${suited} (rank ${suitedRank}) should rank higher than ${offsuit} (rank ${offsuitRank})`).toBeLessThan(offsuitRank);
        }
      });
    });

    test('specific bug fixes: K vs Q with low kickers', () => {
      // These are the specific bugs that were found
      expect(getHandRank('K2s'), 'K2s should rank higher than Q2s').toBeLessThan(getHandRank('Q2s'));
      expect(getHandRank('K3s'), 'K3s should rank higher than Q3s').toBeLessThan(getHandRank('Q3s'));
      expect(getHandRank('K2o'), 'K2o should rank higher than Q2o').toBeLessThan(getHandRank('Q2o'));
    });
  });

  describe('Integration Tests', () => {
    test('top percentages create logical progressions', () => {
      const ranges = [1, 5, 10, 20, 50].map(p => getTopPercentHands(p));
      
      // Each range should be a subset of the next
      for (let i = 0; i < ranges.length - 1; i++) {
        const smaller = ranges[i];
        const larger = ranges[i + 1];
        
        smaller.forEach(hand => {
          expect(larger).toContain(hand);
        });
      }
    });

    test('hand strength percentages are consistent with rankings', () => {
      const sampleHands = ['AA', 'KK', 'AKs', 'QQ', '99', 'AQo', '22', '72o'];
      
      for (let i = 0; i < sampleHands.length - 1; i++) {
        const hand1 = sampleHands[i];
        const hand2 = sampleHands[i + 1];
        
        const rank1 = getHandRank(hand1);
        const rank2 = getHandRank(hand2);
        const strength1 = getHandStrengthPercentage(hand1);
        const strength2 = getHandStrengthPercentage(hand2);
        
        if (rank1 < rank2) { // hand1 is stronger
          expect(strength1).toBeGreaterThanOrEqual(strength2);
        }
      }
    });

    test('preset percentages work with getTopPercentHands', () => {
      Object.entries(PRESET_PERCENTAGES).forEach(([, percentage]) => {
        expect(() => getTopPercentHands(percentage)).not.toThrow();
        
        const hands = getTopPercentHands(percentage);
        expect(hands.length).toBeGreaterThan(0);
        expect(hands.length).toBeLessThanOrEqual(169);
        expect(hands[0]).toBe('AA'); // Should always start with strongest
      });
    });

    test('no ranking inconsistencies in top 50% bug scenario', () => {
      // This specifically tests the user's bug report scenario
      const top50 = getTopPercentHands(50);
      
      const k2sIncluded = top50.includes('K2s');
      const q2sIncluded = top50.includes('Q2s');
      
      // If Q2s is included, K2s must also be included (K2s is stronger)
      if (q2sIncluded) {
        expect(k2sIncluded, 'If Q2s is in top 50%, K2s must also be included as it is stronger').toBe(true);
      }
    });
  });
});
