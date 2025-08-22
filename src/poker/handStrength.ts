/**
 * Hand strength ranking and top percentage selection for poker starting hands
 * 
 * This module provides a comprehensive ranking of all 169 possible poker starting hands
 * ordered by their expected strength/equity in heads-up play.
 */

// Import the algorithmic ranking system
import { createAlgorithmicRanking } from './handStrengthAlgorithmic';

// Complete ranking of all 169 poker starting hands from strongest to weakest
// Generated algorithmically to ensure correctness and consistency
// Based on heads-up equity calculations and poker theory
export const HAND_STRENGTH_RANKING: readonly string[] = createAlgorithmicRanking();

/**
 * Gets the rank/position of a hand in the strength ranking (1-169)
 * Lower numbers indicate stronger hands
 */
export function getHandRank(hand: string): number {
  const rank = HAND_STRENGTH_RANKING.indexOf(hand);
  return rank === -1 ? 170 : rank + 1; // 1-indexed, unknown hands get worse than worst rank
}

/**
 * Gets the percentage strength of a hand (0-100)
 * Higher percentages indicate stronger hands
 */
export function getHandStrengthPercentage(hand: string): number {
  const rank = getHandRank(hand);
  if (rank > 169) return 0; // Invalid hands get 0%
  return Math.round(((169 - rank + 1) / 169) * 100 * 10) / 10; // One decimal place precision
}

/**
 * Selects the top N% of poker hands by strength
 * 
 * @param percentage - Percentage of hands to include (0-100)
 * @returns Array of hand strings representing the top N% of hands
 * 
 * @example
 * getTopPercentHands(5)   // Returns ~8 hands: ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', '99', 'AQs']
 * getTopPercentHands(10)  // Returns ~17 hands: top 10% including 88, AJs, AKo, etc.
 * getTopPercentHands(50)  // Returns ~85 hands: top half of all starting hands
 */
export function getTopPercentHands(percentage: number): string[] {
  if (percentage < 0 || percentage > 100) {
    throw new Error('Percentage must be between 0 and 100');
  }
  
  if (percentage === 0) {
    return [];
  }
  
  if (percentage === 100) {
    return [...HAND_STRENGTH_RANKING];
  }
  
  // Calculate how many hands to include
  const totalHands = HAND_STRENGTH_RANKING.length; // 169
  const handsToInclude = Math.round((percentage / 100) * totalHands);
  
  // Take the first N hands (strongest)
  return HAND_STRENGTH_RANKING.slice(0, handsToInclude);
}

/**
 * Gets a descriptive label for a percentage range
 */
export function getRangeLabel(percentage: number): string {
  if (percentage >= 95) return 'Ultra-wide (95%+)';
  if (percentage >= 80) return 'Very loose (80-95%)';
  if (percentage >= 60) return 'Loose (60-80%)';
  if (percentage >= 40) return 'Medium-loose (40-60%)';
  if (percentage >= 25) return 'Medium (25-40%)';
  if (percentage >= 15) return 'Tight (15-25%)';
  if (percentage >= 8) return 'Very tight (8-15%)';
  if (percentage >= 3) return 'Ultra-tight (3-8%)';
  return 'Premium only (<3%)';
}

/**
 * Common preset percentages for quick selection
 */
export const PRESET_PERCENTAGES = {
  PREMIUM: 2.4,      // ~4 hands: AA, KK, QQ, JJ
  ULTRA_TIGHT: 5.9,  // ~10 hands: includes TT, AKs
  VERY_TIGHT: 9.5,   // ~16 hands: includes 99, AQs, 88
  TIGHT: 15.4,       // ~26 hands: includes AJs, AKo, 77
  MEDIUM_TIGHT: 22.5, // ~38 hands: includes ATs, AQo, KQs
  MEDIUM: 30.2,      // ~51 hands: includes 66, AJo, KJs
  MEDIUM_LOOSE: 40.2, // ~68 hands: includes A9s, ATo, KQo
  LOOSE: 50.3,       // ~85 hands: top half of all hands
  VERY_LOOSE: 65.1,  // ~110 hands: includes many suited connectors
  ULTRA_LOOSE: 80.5, // ~136 hands: most playable hands
} as const;

/**
 * Gets hands that fall within a specific percentage range
 * 
 * @param minPercent - Minimum percentage (inclusive)
 * @param maxPercent - Maximum percentage (inclusive)  
 * @returns Array of hands in that strength range
 */
export function getHandsInRange(minPercent: number, maxPercent: number): string[] {
  if (minPercent > maxPercent) {
    throw new Error('minPercent cannot be greater than maxPercent');
  }
  
  const allHands = getTopPercentHands(maxPercent);
  const topHands = getTopPercentHands(minPercent);
  
  // Return hands that are in maxPercent but not in minPercent  
  return allHands.filter(hand => !topHands.includes(hand));
}

/**
 * Validates if a hand string is valid poker notation
 */
export function isValidHand(hand: string): boolean {
  return HAND_STRENGTH_RANKING.includes(hand);
}

/**
 * Calculate hand combinations directly
 */
function calculateCombinations(hand: string, boardCards: Array<{rank: string, suit: string}> = []): number {
  const SUITS = ['h', 'd', 'c', 's'];
  
  if (hand.length === 2) {
    // Pocket pair (e.g., 'AA')
    const rank = hand[0];
    let count = 0;
    for (let i = 0; i < SUITS.length; i++) {
      for (let j = i + 1; j < SUITS.length; j++) {
        const combo = [{rank, suit: SUITS[i]}, {rank, suit: SUITS[j]}];
        const conflicts = boardCards.some(boardCard => 
          (combo[0].rank === boardCard.rank && combo[0].suit === boardCard.suit) ||
          (combo[1].rank === boardCard.rank && combo[1].suit === boardCard.suit)
        );
        if (!conflicts) count++;
      }
    }
    return count;
  } else if (hand.length === 3) {
    // Suited or offsuit (e.g., 'AKs', 'AKo')
    const rank1 = hand[0];
    const rank2 = hand[1];
    const suitedness = hand[2];
    let count = 0;
    
    if (suitedness === 's') {
      // Suited - same suit combinations
      for (const suit of SUITS) {
        const combo = [{rank: rank1, suit}, {rank: rank2, suit}];
        const conflicts = boardCards.some(boardCard => 
          (combo[0].rank === boardCard.rank && combo[0].suit === boardCard.suit) ||
          (combo[1].rank === boardCard.rank && combo[1].suit === boardCard.suit)
        );
        if (!conflicts) count++;
      }
    } else if (suitedness === 'o') {
      // Offsuit - different suit combinations
      for (let i = 0; i < SUITS.length; i++) {
        for (let j = 0; j < SUITS.length; j++) {
          if (i !== j) {
            const combo = [{rank: rank1, suit: SUITS[i]}, {rank: rank2, suit: SUITS[j]}];
            const conflicts = boardCards.some(boardCard => 
              (combo[0].rank === boardCard.rank && combo[0].suit === boardCard.suit) ||
              (combo[1].rank === boardCard.rank && combo[1].suit === boardCard.suit)
            );
            if (!conflicts) count++;
          }
        }
      }
    }
    return count;
  }
  
  return 0; // Invalid hand
}

/**
 * Gets statistics about a hand range accounting for proper combinatorics
 */
export function getRangeStats(hands: string[], boardCards: Array<{rank: string, suit: string}> = []): {
  count: number;
  percentage: number;
  averageStrength: number;
  strongestHand: string;
  weakestHand: string;
  combinations: number;
} {
  if (hands.length === 0) {
    return {
      count: 0,
      percentage: 0,
      averageStrength: 0,
      strongestHand: '',
      weakestHand: '',
      combinations: 0
    };
  }
  
  const validHands = hands.filter(isValidHand);
  
  // Calculate actual combinations for each hand type
  const combinationCount = validHands.reduce((total, hand) => {
    return total + calculateCombinations(hand, boardCards);
  }, 0);
  
  const totalPossibleCombinations = boardCards.length === 0 ? 1326 : (52 - boardCards.length) * (51 - boardCards.length) / 2;
  
  if (validHands.length === 0) {
    return {
      count: 0,
      percentage: 0,
      averageStrength: 0,
      strongestHand: '',
      weakestHand: '',
      combinations: combinationCount
    };
  }
  
  const ranks = validHands.map(getHandRank);
  
  return {
    count: validHands.length, // Number of hand types
    percentage: Math.round((combinationCount / totalPossibleCombinations) * 100 * 10) / 10, // Based on actual combinations
    averageStrength: Math.round(ranks.reduce((sum, rank) => sum + (170 - rank), 0) / ranks.length),
    strongestHand: validHands.reduce((strongest, hand) => 
      getHandRank(hand) < getHandRank(strongest) ? hand : strongest, validHands[0]),
    weakestHand: validHands.reduce((weakest, hand) => 
      getHandRank(hand) > getHandRank(weakest) ? hand : weakest, validHands[0]),
    combinations: combinationCount // Actual number of combinations
  };
}
