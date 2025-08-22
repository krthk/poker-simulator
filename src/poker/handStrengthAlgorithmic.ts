/**
 * Algorithmic Hand Strength Ranking System
 * 
 * This replaces the manual array approach with a systematic algorithm
 * that ranks poker hands based on fundamental poker principles.
 */

// Hand strength calculation based on poker theory
export interface HandStrengthCalculation {
  hand: string;
  score: number;
  category: 'pairs' | 'suited' | 'offsuit';
  highCard: number;
  lowCard: number;
  suited: boolean;
  gap: number;
  connected: boolean;
}

// Card rank values (higher = stronger)
const RANK_VALUES: Record<string, number> = {
  'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10,
  '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
};

const REVERSE_RANK_VALUES: Record<number, string> = {
  14: 'A', 13: 'K', 12: 'Q', 11: 'J', 10: 'T',
  9: '9', 8: '8', 7: '7', 6: '6', 5: '5', 4: '4', 3: '3', 2: '2'
};

/**
 * Parse a hand string into its components
 */
function parseHand(hand: string): { highCard: number; lowCard: number; suited: boolean; isPair: boolean } {
  if (hand.length < 2 || hand.length > 3) {
    throw new Error(`Invalid hand format: ${hand}`);
  }

  const rank1 = hand[0];
  const rank2 = hand[1];
  const suitedness = hand[2]; // 's', 'o', or undefined for pairs

  const value1 = RANK_VALUES[rank1];
  const value2 = RANK_VALUES[rank2];

  if (value1 === undefined || value2 === undefined) {
    throw new Error(`Invalid ranks in hand: ${hand}`);
  }

  const isPair = rank1 === rank2;
  const suited = suitedness === 's';
  const offsuit = suitedness === 'o';

  if (!isPair && !suited && !offsuit) {
    throw new Error(`Non-pair hands must specify suitedness (s/o): ${hand}`);
  }

  if (isPair && suitedness) {
    throw new Error(`Pairs cannot have suitedness: ${hand}`);
  }

  // Ensure high card is first
  const highCard = Math.max(value1, value2);
  const lowCard = Math.min(value1, value2);

  return { highCard, lowCard, suited, isPair };
}

/**
 * Calculate comprehensive hand strength score
 */
export function calculateHandStrength(hand: string): HandStrengthCalculation {
  const { highCard, lowCard, suited, isPair } = parseHand(hand);

  let score = 0;
  let category: 'pairs' | 'suited' | 'offsuit';

  if (isPair) {
    // Pocket pairs: base score is very high, adjusted by pair rank
    score = 20000 + (highCard * 100); // Increased base to ensure pairs rank highest
    category = 'pairs';
  } else {
    // Non-pairs: complex scoring system
    
    // Base score from high card (most important factor)
    score = highCard * 1000;
    
    // Kicker contribution (second most important)
    score += lowCard * 50;
    
    // Suitedness bonus
    if (suited) {
      score += 200; // Suited bonus
      category = 'suited';
    } else {
      category = 'offsuit';
    }
    
    // Connectivity bonus (helps connectors)
    const gap = highCard - lowCard - 1;
    if (gap === 0) {
      // Connected (e.g., 87, QJ)
      score += 100;
    } else if (gap === 1) {
      // One gap (e.g., 86, QT)
      score += 50;
    } else if (gap === 2) {
      // Two gap (e.g., 85, Q9)
      score += 25;
    }
    // More than 2 gaps get no connectivity bonus
    
    // Special high card bonuses
    if (highCard === 14) { // Ace
      score += 500; // Ace is especially valuable
    }
    if (highCard >= 11) { // Broadway cards (J, Q, K, A)
      score += 100;
    }
  }

  const gap = isPair ? 0 : highCard - lowCard - 1;
  const connected = gap === 0;

  return {
    hand,
    score,
    category,
    highCard,
    lowCard,
    suited,
    gap,
    connected
  };
}

/**
 * Generate all 169 possible poker starting hands
 */
export function generateAllHands(): string[] {
  const hands: string[] = [];
  const ranks = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]; // A, K, Q, J, T, 9, 8, 7, 6, 5, 4, 3, 2

  // Add all pocket pairs
  ranks.forEach(rank => {
    const rankChar = REVERSE_RANK_VALUES[rank];
    hands.push(`${rankChar}${rankChar}`);
  });

  // Add all suited and offsuit combinations
  for (let i = 0; i < ranks.length; i++) {
    for (let j = i + 1; j < ranks.length; j++) {
      const highCard = REVERSE_RANK_VALUES[ranks[i]];
      const lowCard = REVERSE_RANK_VALUES[ranks[j]];
      
      hands.push(`${highCard}${lowCard}s`); // Suited
      hands.push(`${highCard}${lowCard}o`); // Offsuit
    }
  }

  return hands;
}

/**
 * Create algorithmic hand strength ranking
 */
export function createAlgorithmicRanking(): readonly string[] {
  const allHands = generateAllHands();
  
  // Calculate strength for each hand
  const handStrengths = allHands.map(hand => calculateHandStrength(hand));
  
  // Sort by strength (highest score first)
  handStrengths.sort((a, b) => b.score - a.score);
  
  // Extract just the hand names in order
  const ranking = handStrengths.map(h => h.hand);
  
  // Verify we have exactly 169 hands
  if (ranking.length !== 169) {
    throw new Error(`Expected 169 hands, got ${ranking.length}`);
  }
  
  // Verify no duplicates
  const uniqueHands = new Set(ranking);
  if (uniqueHands.size !== 169) {
    throw new Error(`Duplicate hands found in ranking`);
  }
  
  return ranking as readonly string[];
}

/**
 * Get detailed strength breakdown for debugging
 */
export function getHandStrengthDetails(hand: string): HandStrengthCalculation {
  return calculateHandStrength(hand);
}

/**
 * Compare two hands directly
 */
export function compareHands(hand1: string, hand2: string): number {
  const strength1 = calculateHandStrength(hand1);
  const strength2 = calculateHandStrength(hand2);
  
  // Return positive if hand1 is stronger, negative if hand2 is stronger, 0 if equal
  return strength1.score - strength2.score;
}

/**
 * Debug function to show ranking rationale
 */
export function explainRanking(hand1: string, hand2: string): string {
  const calc1 = calculateHandStrength(hand1);
  const calc2 = calculateHandStrength(hand2);
  
  const stronger = calc1.score > calc2.score ? hand1 : hand2;
  const strongerCalc = calc1.score > calc2.score ? calc1 : calc2;
  const weaker = calc1.score > calc2.score ? hand2 : hand1;
  const weakerCalc = calc1.score > calc2.score ? calc2 : calc1;
  
  return `${stronger} (${strongerCalc.score}) ranks higher than ${weaker} (${weakerCalc.score})\n` +
    `  ${stronger}: category=${strongerCalc.category}, high=${strongerCalc.highCard}, low=${strongerCalc.lowCard}, suited=${strongerCalc.suited}\n` +
    `  ${weaker}: category=${weakerCalc.category}, high=${weakerCalc.highCard}, low=${weakerCalc.lowCard}, suited=${weakerCalc.suited}`;
}
