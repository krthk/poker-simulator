import { SimulationConfig, SimulationResult, Hand, Card, Board } from '../types/poker';
import { createDeck, shuffleDeck, removeCardsFromDeck } from './deck';
import { parseHandRange } from './rangeParser';
import { evaluateHand, compareHands } from './handEvaluator';

export function runSimulation(config: SimulationConfig): SimulationResult {
  const heroHands = parseHandRange(config.heroRange);
  const villainHands = parseHandRange(config.villainRange);
  
  let heroWins = 0;
  let villainWins = 0;
  let ties = 0;
  let totalHands = 0;
  
  for (let i = 0; i < config.iterations; i++) {
    // Randomly select hands from ranges
    const heroHand = heroHands[Math.floor(Math.random() * heroHands.length)];
    const villainHand = villainHands[Math.floor(Math.random() * villainHands.length)];
    
    // Skip if hands conflict (same cards)
    if (handsConflict(heroHand, villainHand, config.board)) {
      continue;
    }
    
    const result = simulateHand(heroHand, villainHand, config.board);
    
    if (result > 0) {
      heroWins++;
    } else if (result < 0) {
      villainWins++;
    } else {
      ties++;
    }
    
    totalHands++;
  }
  
  const heroEquity = totalHands > 0 ? ((heroWins + ties / 2) / totalHands) * 100 : 0;
  const villainEquity = totalHands > 0 ? ((villainWins + ties / 2) / totalHands) * 100 : 0;
  
  return {
    hero: {
      equity: heroEquity,
      wins: heroWins,
      ties,
      total: totalHands
    },
    villain: {
      equity: villainEquity,
      wins: villainWins,
      ties,
      total: totalHands
    },
    iterations: config.iterations
  };
}

function simulateHand(heroHand: Hand, villainHand: Hand, fixedBoard?: Board): number {
  // Create deck and remove known cards
  let deck = createDeck();
  const usedCards = [...heroHand, ...villainHand];
  if (fixedBoard) {
    usedCards.push(...fixedBoard);
  }
  deck = removeCardsFromDeck(deck, usedCards);
  deck = shuffleDeck(deck);
  
  // Deal board cards if not fixed
  const board: Card[] = fixedBoard ? [...fixedBoard] : [];
  const cardsNeeded = 5 - board.length;
  
  for (let i = 0; i < cardsNeeded; i++) {
    if (deck.length === 0) {
      throw new Error('Not enough cards in deck');
    }
    board.push(deck.pop()!);
  }
  
  // Evaluate best 5-card hands
  const heroCards = [...heroHand, ...board];
  const villainCards = [...villainHand, ...board];
  
  const heroBest = getBestHand(heroCards);
  const villainBest = getBestHand(villainCards);
  
  return compareHands(heroBest, villainBest);
}

function getBestHand(cards: Card[]) {
  // For now, just evaluate all 7 cards as if they were 5
  // In a full implementation, we'd check all combinations of 5 cards from 7
  if (cards.length === 7) {
    // Simplified: just take first 5 cards for now
    // TODO: Implement proper 7-card hand evaluation
    return evaluateHand(cards.slice(0, 5));
  }
  return evaluateHand(cards);
}

function handsConflict(hand1: Hand, hand2: Hand, board?: Board): boolean {
  const allCards = [...hand1, ...hand2];
  if (board) {
    allCards.push(...board);
  }
  
  // Check for duplicate cards
  for (let i = 0; i < allCards.length; i++) {
    for (let j = i + 1; j < allCards.length; j++) {
      if (allCards[i].rank === allCards[j].rank && allCards[i].suit === allCards[j].suit) {
        return true;
      }
    }
  }
  
  return false;
}
