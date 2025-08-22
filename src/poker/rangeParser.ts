import { Hand, HandRange, Card, Rank } from '../types/poker';
import { RANKS, SUITS } from './deck';

export function parseHandRange(rangeArray: HandRange): Hand[] {
  const hands: Hand[] = [];
  
  for (const rangeToken of rangeArray) {
    hands.push(...parseRangeToken(rangeToken.trim()));
  }
  
  return hands;
}

function parseRangeToken(token: string): Hand[] {
  // Handle specific hands like AA, AKs, AKo, A5o
  if (token.length === 2) {
    // Pocket pairs (AA, KK, etc.)
    return parsePocketPair(token);
  } else if (token.length === 3) {
    // Suited (AKs) or offsuit (AKo) hands
    return parseSuitedOrOffsuit(token);
  } else if (token.includes('-')) {
    // Range like AA-QQ or A2s-A9s
    return parseRange(token);
  } else if (token.includes('+')) {
    // Plus range like 22+ or A7s+
    return parsePlusRange(token);
  }
  
  throw new Error(`Invalid range token: ${token}`);
}

function parsePocketPair(token: string): Hand[] {
  const rank = token[0] as Rank;
  if (token[0] !== token[1] || !RANKS.includes(rank)) {
    throw new Error(`Invalid pocket pair: ${token}`);
  }
  
  const hands: Hand[] = [];
  // Generate all combinations of this pocket pair
  for (let i = 0; i < SUITS.length; i++) {
    for (let j = i + 1; j < SUITS.length; j++) {
      hands.push([
        { rank, suit: SUITS[i] },
        { rank, suit: SUITS[j] }
      ]);
    }
  }
  return hands;
}

function parseSuitedOrOffsuit(token: string): Hand[] {
  const rank1 = token[0] as Rank;
  const rank2 = token[1] as Rank;
  const suitedness = token[2];
  
  if (!RANKS.includes(rank1) || !RANKS.includes(rank2)) {
    throw new Error(`Invalid hand: ${token}`);
  }
  
  const hands: Hand[] = [];
  
  if (suitedness === 's') {
    // Suited - same suit
    for (const suit of SUITS) {
      hands.push([
        { rank: rank1, suit },
        { rank: rank2, suit }
      ]);
    }
  } else if (suitedness === 'o') {
    // Offsuit - different suits
    for (let i = 0; i < SUITS.length; i++) {
      for (let j = 0; j < SUITS.length; j++) {
        if (i !== j) {
          hands.push([
            { rank: rank1, suit: SUITS[i] },
            { rank: rank2, suit: SUITS[j] }
          ]);
        }
      }
    }
  }
  
  return hands;
}

function parseRange(token: string): Hand[] {
  // TODO: Implement range parsing (AA-QQ, A2s-A9s)
  throw new Error(`Range parsing not yet implemented: ${token}`);
}

function parsePlusRange(token: string): Hand[] {
  // TODO: Implement plus range parsing (22+, A7s+)
  throw new Error(`Plus range parsing not yet implemented: ${token}`);
}

export function handRangeToString(hands: Hand[]): string {
  // Convert back to range notation for display
  // This is a simplified version - full implementation would be more complex
  return hands.map(hand => 
    `${hand[0].rank}${hand[0].suit}${hand[1].rank}${hand[1].suit}`
  ).join(', ');
}
