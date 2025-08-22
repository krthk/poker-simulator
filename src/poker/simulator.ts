import { 
  SimulationConfig, 
  SimulationResult, 
  LegacySimulationConfig, 
  LegacySimulationResult,
  Hand, 
  Card, 
  Board, 
  PlayerResult 
} from '../types/poker';
import { createDeck, shuffleDeck, removeCardsFromDeck } from './deck';
import { parseHandRange } from './rangeParser';
import { evaluateHand, compareHands } from './handEvaluator';

// Multi-player simulation (new)
export function runSimulation(config: SimulationConfig): SimulationResult {
  const activePlayers = config.players.filter(p => p.isActive && p.range.length > 0);
  
  if (activePlayers.length < 2) {
    throw new Error('At least 2 players with ranges are required for simulation');
  }

  // Parse hand ranges for each player
  const playerHands = activePlayers.map(player => ({
    player,
    hands: parseHandRange(player.range)
  }));

  // Initialize player statistics
  const playerStats = activePlayers.map(player => ({
    playerId: player.id,
    wins: 0,
    ties: 0,
    total: 0
  }));

  let totalHandsSimulated = 0;

  for (let i = 0; i < config.iterations; i++) {
    // Randomly select hands for each player
    const selectedHands = playerHands.map(({ player, hands }) => ({
      playerId: player.id,
      hand: hands[Math.floor(Math.random() * hands.length)]
    }));

    // Check for conflicts
    if (multiPlayerHandsConflict(selectedHands.map(sh => sh.hand), config.board)) {
      continue;
    }

    // Simulate the hand
    const results = simulateMultiPlayerHand(selectedHands, config.board);
    
    // Update statistics
    results.forEach(result => {
      const playerStat = playerStats.find(ps => ps.playerId === result.playerId);
      if (playerStat) {
        playerStat.wins += result.wins;
        playerStat.ties += result.ties;
        playerStat.total++;
      }
    });

    totalHandsSimulated++;
  }

  // Calculate final results
  const playerResults: PlayerResult[] = playerStats.map(stat => {
    const player = activePlayers.find(p => p.id === stat.playerId)!;
    const equity = stat.total > 0 ? ((stat.wins + stat.ties / 2) / stat.total) * 100 : 0;
    
    return {
      playerId: player.id,
      playerName: player.name,
      name: player.name, // Alias for backward compatibility
      position: player.position,
      equity,
      wins: stat.wins,
      ties: stat.ties,
      total: stat.total
    };
  });

  return {
    players: playerResults,
    iterations: config.iterations,
    totalHandsSimulated
  };
}

// Legacy simulation (backward compatibility)
export function runLegacySimulation(config: LegacySimulationConfig): LegacySimulationResult {
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
  if (cards.length < 5) {
    throw new Error('Need at least 5 cards to evaluate hand');
  }
  
  if (cards.length === 5) {
    return evaluateHand(cards);
  }
  
  if (cards.length === 7) {
    // Find the best 5-card hand from 7 cards
    return getBest5From7(cards);
  }
  
  // For 6 cards or other cases, evaluate all combinations
  return getBestHandFromAllCombinations(cards);
}

function getBest5From7(cards: Card[]) {
  let bestHand: any = null;
  
  // Generate all combinations of 5 cards from 7
  for (let i = 0; i < cards.length - 4; i++) {
    for (let j = i + 1; j < cards.length - 3; j++) {
      for (let k = j + 1; k < cards.length - 2; k++) {
        for (let l = k + 1; l < cards.length - 1; l++) {
          for (let m = l + 1; m < cards.length; m++) {
            const fiveCards = [cards[i], cards[j], cards[k], cards[l], cards[m]];
            const handEvaluation = evaluateHand(fiveCards);
            
            if (!bestHand || compareHands(handEvaluation, bestHand) > 0) {
              bestHand = handEvaluation;
            }
          }
        }
      }
    }
  }
  
  return bestHand;
}

function getBestHandFromAllCombinations(cards: Card[]) {
  let bestHand: any = null;
  
  // Generate all combinations of 5 cards
  const combinations = getCombinations(cards, 5);
  
  for (const combination of combinations) {
    const handEvaluation = evaluateHand(combination);
    
    if (!bestHand || compareHands(handEvaluation, bestHand) > 0) {
      bestHand = handEvaluation;
    }
  }
  
  return bestHand;
}

function getCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length === 0) return [];
  
  const [first, ...rest] = arr;
  const withFirst = getCombinations(rest, k - 1).map(comb => [first, ...comb]);
  const withoutFirst = getCombinations(rest, k);
  
  return [...withFirst, ...withoutFirst];
}

// Multi-player hand simulation
function simulateMultiPlayerHand(
  selectedHands: Array<{ playerId: string; hand: Hand }>, 
  fixedBoard?: Board
): Array<{ playerId: string; wins: number; ties: number }> {
  // Create deck and remove known cards
  let deck = createDeck();
  const usedCards: Card[] = [];
  selectedHands.forEach(sh => usedCards.push(...sh.hand));
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
  
  // Evaluate hands for each player
  const playerEvaluations = selectedHands.map(({ playerId, hand }) => ({
    playerId,
    hand: getBestHand([...hand, ...board])
  }));

  // Find the best hand(s)
  let bestHands: Array<{ playerId: string }> = [];
  let bestHandEvaluation: any = null;

  playerEvaluations.forEach(({ playerId, hand }) => {
    if (bestHandEvaluation === null) {
      // First hand becomes the initial best
      bestHands = [{ playerId }];
      bestHandEvaluation = hand;
    } else {
      const comparison = compareHands(hand, bestHandEvaluation);
      
      if (comparison > 0) {
        // New best hand found
        bestHands = [{ playerId }];
        bestHandEvaluation = hand;
      } else if (comparison === 0) {
        // Tie with current best hand
        bestHands.push({ playerId });
      }
      // If comparison < 0, this hand is worse than current best, do nothing
    }
  });

  // Assign wins and ties
  return selectedHands.map(({ playerId }) => {
    const isWinner = bestHands.some(bh => bh.playerId === playerId);
    const isTie = bestHands.length > 1 && isWinner;
    
    return {
      playerId,
      wins: isWinner && !isTie ? 1 : 0,
      ties: isTie ? 1 : 0
    };
  });
}

function multiPlayerHandsConflict(hands: Hand[], board?: Board): boolean {
  const allCards: Card[] = [];
  hands.forEach(hand => allCards.push(...hand));
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
