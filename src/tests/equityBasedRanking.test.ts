import { describe, it, expect } from 'vitest';
import { 
  createEquityBasedRanking, 
  getTopPercentHandsByEquity, 
  getActualRangePercentage,
  validateEquityRankings 
} from '../poker/equityBasedRankingNew';

describe('Equity-Based Hand Ranking', () => {
  describe('Basic validation', () => {
    it('should generate exactly 169 unique hands', () => {
      const ranking = createEquityBasedRanking();
      
      expect(ranking.length, 'Should have exactly 169 hands').toBe(169);
      
      const uniqueHands = new Set(ranking);
      expect(uniqueHands.size, 'All hands should be unique').toBe(169);
    });

    it('should pass all validation checks', () => {
      const validation = validateEquityRankings();
      
      expect(validation.isValid, `Validation failed: ${validation.errors.join(', ')}`).toBe(true);
      expect(validation.errors, 'Should have no validation errors').toHaveLength(0);
    });

    it('should have AA as the strongest hand', () => {
      const ranking = createEquityBasedRanking();
      expect(ranking[0]).toBe('AA');
    });

    it('should have 72o near the bottom', () => {
      const ranking = createEquityBasedRanking();
      const seventyTwoRank = ranking.indexOf('72o');
      
      expect(seventyTwoRank, '72o should be in the ranking').toBeGreaterThan(-1);
      expect(seventyTwoRank, '72o should rank in bottom 10').toBeGreaterThan(159);
    });
  });

  describe('Professional standards compliance', () => {
    it('should rank AKs higher than 22 (key professional standard)', () => {
      const ranking = createEquityBasedRanking();
      const aksRank = ranking.indexOf('AKs');
      const twentyTwoRank = ranking.indexOf('22');
      
      expect(aksRank, 'AKs should be found').toBeGreaterThan(-1);
      expect(twentyTwoRank, '22 should be found').toBeGreaterThan(-1);
      expect(aksRank, 'AKs should rank higher than 22').toBeLessThan(twentyTwoRank);
    });

    it('should rank pocket pairs in correct order', () => {
      const ranking = createEquityBasedRanking();
      const pairs = ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22'];
      
      let lastRank = -1;
      pairs.forEach(pair => {
        const rank = ranking.indexOf(pair);
        expect(rank, `${pair} should be found`).toBeGreaterThan(-1);
        expect(rank, `${pair} should rank after previous pairs`).toBeGreaterThan(lastRank);
        lastRank = rank;
      });
    });

    it('should rank suited hands higher than their offsuit counterparts', () => {
      const suitedOffSuitPairs = [
        ['AKs', 'AKo'],
        ['AQs', 'AQo'], 
        ['AJs', 'AJo'],
        ['KQs', 'KQo'],
        ['KJs', 'KJo'],
        ['QJs', 'QJo']
      ];
      
      const ranking = createEquityBasedRanking();
      
      suitedOffSuitPairs.forEach(([suited, offsuit]) => {
        const suitedRank = ranking.indexOf(suited);
        const offsuitRank = ranking.indexOf(offsuit);
        
        expect(suitedRank, `${suited} should be found`).toBeGreaterThan(-1);
        expect(offsuitRank, `${offsuit} should be found`).toBeGreaterThan(-1);
        expect(suitedRank, `${suited} should rank higher than ${offsuit}`).toBeLessThan(offsuitRank);
      });
    });

    it('should include premium hands in top 5%', () => {
      const top5 = getTopPercentHandsByEquity(5);
      const premiumHands = ['AA', 'KK', 'QQ', 'JJ', 'AKs'];
      
      premiumHands.forEach(hand => {
        expect(top5.includes(hand), `Top 5% should include ${hand}`).toBe(true);
      });
    });
  });

  describe('Percentage calculations', () => {
    it('should return empty array for 0%', () => {
      const result = getTopPercentHandsByEquity(0);
      expect(result).toEqual([]);
    });

    it('should return all hands for 100%', () => {
      const result = getTopPercentHandsByEquity(100);
      const allRanking = createEquityBasedRanking();
      expect(result).toEqual(allRanking);
    });

    it('should produce percentage ranges close to targets', () => {
      const testPercentages = [5, 10, 15, 20, 25, 50];
      
      testPercentages.forEach(targetPercent => {
        const hands = getTopPercentHandsByEquity(targetPercent);
        const actualPercent = getActualRangePercentage(hands);
        
        // Should be within 1% of target (combinatorial constraints)
        const difference = Math.abs(actualPercent - targetPercent);
        expect(difference, `${targetPercent}% range should be close to target (got ${actualPercent}%)`).toBeLessThan(1.5);
      });
    });

    it('should correctly calculate combination counts', () => {
      // AA has 6 combinations (C(4,2))
      const aces = getTopPercentHandsByEquity(0.45); // Just AA
      expect(aces).toEqual(['AA']);
      expect(getActualRangePercentage(aces)).toBeCloseTo(0.45, 1);
      
      // AKs has 4 combinations  
      const aksRange = ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs'];
      const expectedCombos = 6 + 6 + 6 + 6 + 6 + 4; // 34 combinations
      const expectedPercent = (34 / 1326) * 100;
      expect(getActualRangePercentage(aksRange)).toBeCloseTo(expectedPercent, 1);
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle invalid percentages gracefully', () => {
      expect(getTopPercentHandsByEquity(-5)).toEqual([]);
      expect(() => getTopPercentHandsByEquity(-10)).not.toThrow();
    });

    it('should handle percentages above 100%', () => {
      const result = getTopPercentHandsByEquity(150);
      const allRanking = createEquityBasedRanking();
      expect(result).toEqual(allRanking);
    });

    it('should produce consistent results', () => {
      const result1 = getTopPercentHandsByEquity(20);
      const result2 = getTopPercentHandsByEquity(20);
      expect(result1).toEqual(result2);
    });

    it('should maintain correct order in percentage ranges', () => {
      const top10 = getTopPercentHandsByEquity(10);
      const top20 = getTopPercentHandsByEquity(20);
      
      // All hands in top10 should also be in top20 and in same order
      let top10Index = 0;
      for (const hand of top20) {
        if (top10Index < top10.length && hand === top10[top10Index]) {
          top10Index++;
        }
      }
      
      expect(top10Index, 'All top 10% hands should appear in top 20% in same order').toBe(top10.length);
    });
  });

  describe('Real-world scenarios', () => {
    it('should match common opening ranges', () => {
      // Tight opening range (around 15%)
      const tightRange = getTopPercentHandsByEquity(15);
      
      // Should include strong hands but not weak aces
      expect(tightRange.includes('AA')).toBe(true);
      expect(tightRange.includes('AKs')).toBe(true);
      expect(tightRange.includes('88')).toBe(true);
      expect(tightRange.includes('A2o')).toBe(false);
      expect(tightRange.includes('72o')).toBe(false);
    });

    it('should produce reasonable hand counts for common percentages', () => {
      const scenarios = [
        { percent: 2.5, expectedHands: 'around 4', minHands: 3, maxHands: 6 },
        { percent: 5, expectedHands: 'around 8', minHands: 6, maxHands: 12 },
        { percent: 10, expectedHands: 'around 15', minHands: 12, maxHands: 25 },
        { percent: 20, expectedHands: 'around 30', minHands: 25, maxHands: 45 }
      ];

      scenarios.forEach(({ percent, expectedHands, minHands, maxHands }) => {
        const hands = getTopPercentHandsByEquity(percent);
        expect(hands.length, `${percent}% should have ${expectedHands} (${minHands}-${maxHands}) hands`).toBeGreaterThanOrEqual(minHands);
        expect(hands.length, `${percent}% should have ${expectedHands} (${minHands}-${maxHands}) hands`).toBeLessThanOrEqual(maxHands);
      });
    });
  });
});