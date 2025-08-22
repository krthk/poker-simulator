import { Card, HandRank, HandEvaluation, Rank } from '../types/poker';
import { RANKS } from './deck';

export function evaluateHand(cards: Card[]): HandEvaluation {
  if (cards.length !== 5) {
    throw new Error('Hand evaluation requires exactly 5 cards');
  }

  // Sort cards by rank value for easier evaluation
  const sortedCards = [...cards].sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank));
  
  // Check for flush
  const isFlush = sortedCards.every(card => card.suit === sortedCards[0].suit);
  
  // Check for straight
  const isStraight = checkStraight(sortedCards);
  
  // Count ranks
  const rankCounts = new Map<Rank, number>();
  for (const card of sortedCards) {
    rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
  }
  
  const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);
  
  // Determine hand rank
  if (isFlush && isStraight) {
    const highCard = getStraightHighCard(sortedCards);
    if (highCard === 14 && getRankValue(sortedCards[1].rank) === 13) { // A-K high straight flush
      return { rank: HandRank.ROYAL_FLUSH, value: highCard };
    }
    return { rank: HandRank.STRAIGHT_FLUSH, value: highCard };
  }
  
  if (counts[0] === 4) {
    // Four of a kind
    const quadRank = Array.from(rankCounts.entries()).find(([_, count]) => count === 4)![0];
    return { rank: HandRank.FOUR_OF_A_KIND, value: getRankValue(quadRank) };
  }
  
  if (counts[0] === 3 && counts[1] === 2) {
    // Full house
    const tripRank = Array.from(rankCounts.entries()).find(([_, count]) => count === 3)![0];
    return { rank: HandRank.FULL_HOUSE, value: getRankValue(tripRank) };
  }
  
  if (isFlush) {
    return { rank: HandRank.FLUSH, value: getRankValue(sortedCards[0].rank) };
  }
  
  if (isStraight) {
    return { rank: HandRank.STRAIGHT, value: getStraightHighCard(sortedCards) };
  }
  
  if (counts[0] === 3) {
    // Three of a kind
    const tripRank = Array.from(rankCounts.entries()).find(([_, count]) => count === 3)![0];
    return { rank: HandRank.THREE_OF_A_KIND, value: getRankValue(tripRank) };
  }
  
  if (counts[0] === 2 && counts[1] === 2) {
    // Two pair
    const pairs = Array.from(rankCounts.entries())
      .filter(([_, count]) => count === 2)
      .map(([rank, _]) => getRankValue(rank))
      .sort((a, b) => b - a);
    return { rank: HandRank.TWO_PAIR, value: pairs[0] * 100 + pairs[1] };
  }
  
  if (counts[0] === 2) {
    // One pair
    const pairRank = Array.from(rankCounts.entries()).find(([_, count]) => count === 2)![0];
    return { rank: HandRank.PAIR, value: getRankValue(pairRank) };
  }
  
  // High card
  return { rank: HandRank.HIGH_CARD, value: getRankValue(sortedCards[0].rank) };
}

function getRankValue(rank: Rank): number {
  const rankIndex = RANKS.indexOf(rank);
  return rankIndex + 2; // 2 = 2, 3 = 3, ..., A = 14
}

function checkStraight(sortedCards: Card[]): boolean {
  // Check for regular straight
  let consecutive = true;
  for (let i = 1; i < sortedCards.length; i++) {
    if (getRankValue(sortedCards[i-1].rank) - getRankValue(sortedCards[i].rank) !== 1) {
      consecutive = false;
      break;
    }
  }
  
  if (consecutive) return true;
  
  // Check for A-2-3-4-5 straight (wheel)
  if (sortedCards[0].rank === 'A' && 
      sortedCards[1].rank === '5' && 
      sortedCards[2].rank === '4' && 
      sortedCards[3].rank === '3' && 
      sortedCards[4].rank === '2') {
    return true;
  }
  
  return false;
}

function getStraightHighCard(sortedCards: Card[]): number {
  // Check if this is a wheel straight (A-2-3-4-5)
  if (sortedCards[0].rank === 'A' && 
      sortedCards[1].rank === '5' && 
      sortedCards[2].rank === '4' && 
      sortedCards[3].rank === '3' && 
      sortedCards[4].rank === '2') {
    return 5; // Wheel straight is 5-high, not Ace-high
  }
  
  // Regular straight - return the highest card
  return getRankValue(sortedCards[0].rank);
}

export function compareHands(hand1: HandEvaluation, hand2: HandEvaluation): number {
  if (hand1.rank !== hand2.rank) {
    return hand1.rank > hand2.rank ? 1 : -1;
  }
  
  if (hand1.value > hand2.value) return 1;
  if (hand1.value < hand2.value) return -1;
  return 0; // Tie
}
