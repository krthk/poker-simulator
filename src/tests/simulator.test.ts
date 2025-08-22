import { describe, test, expect } from 'vitest';
import { runSimulation, runLegacySimulation } from '../poker/simulator';
import { SimulationConfig, LegacySimulationConfig, Card } from '../types/poker';

// Test utilities
function createCard(rank: string, suit: string): Card {
  return { rank: rank as any, suit: suit as any };
}

function expectApproximateEquity(actual: number, expected: number, tolerance: number = 2) {
  const diff = Math.abs(actual - expected);
  expect(diff).toBeLessThanOrEqual(tolerance);
}

describe('Poker Simulator Accuracy Tests', () => {
  
  describe('Pre-flop Scenarios', () => {
    
    test('AA vs KK - Aces should win ~82%', () => {
      const config: LegacySimulationConfig = {
        heroRange: ['AA'],
        villainRange: ['KK'],
        iterations: 100000
      };
      
      const result = runLegacySimulation(config);
      console.log(`AA vs KK: Hero ${result.hero.equity.toFixed(1)}%, Villain ${result.villain.equity.toFixed(1)}%`);
      
      expectApproximateEquity(result.hero.equity, 82, 3);
      expectApproximateEquity(result.villain.equity, 18, 3);
    });

    test('AA vs AKs - Aces should win ~87%', () => {
      const config: LegacySimulationConfig = {
        heroRange: ['AA'],
        villainRange: ['AKs'],
        iterations: 100000
      };
      
      const result = runLegacySimulation(config);
      console.log(`AA vs AKs: Hero ${result.hero.equity.toFixed(1)}%, Villain ${result.villain.equity.toFixed(1)}%`);
      
      expectApproximateEquity(result.hero.equity, 87, 3);
      expectApproximateEquity(result.villain.equity, 13, 3);
    });

    test('AA vs AKo - Aces should win ~88%', () => {
      const config: LegacySimulationConfig = {
        heroRange: ['AA'],
        villainRange: ['AKo'],
        iterations: 100000
      };
      
      const result = runLegacySimulation(config);
      console.log(`AA vs AKo: Hero ${result.hero.equity.toFixed(1)}%, Villain ${result.villain.equity.toFixed(1)}%`);
      
      expectApproximateEquity(result.hero.equity, 88, 3);
      expectApproximateEquity(result.villain.equity, 12, 3);
    });

    test('AKs vs QQ - Queens should win ~54%', () => {
      const config: LegacySimulationConfig = {
        heroRange: ['AKs'],
        villainRange: ['QQ'],
        iterations: 100000
      };
      
      const result = runLegacySimulation(config);
      console.log(`AKs vs QQ: Hero ${result.hero.equity.toFixed(1)}%, Villain ${result.villain.equity.toFixed(1)}%`);
      
      expectApproximateEquity(result.hero.equity, 46, 3);
      expectApproximateEquity(result.villain.equity, 54, 3);
    });

    test('72o vs AA - Worst vs Best hand', () => {
      const config: LegacySimulationConfig = {
        heroRange: ['72o'],
        villainRange: ['AA'],
        iterations: 100000
      };
      
      const result = runLegacySimulation(config);
      console.log(`72o vs AA: Hero ${result.hero.equity.toFixed(1)}%, Villain ${result.villain.equity.toFixed(1)}%`);
      
      expectApproximateEquity(result.hero.equity, 12, 3);
      expectApproximateEquity(result.villain.equity, 88, 3);
    });
  });

  describe('Flop Scenarios', () => {
    
    test('AA vs KK on K72 rainbow - Kings should win ~95%', () => {
      const board: Card[] = [
        createCard('K', 'h'),
        createCard('7', 'd'), 
        createCard('2', 'c')
      ];
      
      const config: LegacySimulationConfig = {
        heroRange: ['AA'],
        villainRange: ['KK'],
        board,
        iterations: 50000
      };
      
      const result = runLegacySimulation(config);
      console.log(`AA vs KK on K72: Hero ${result.hero.equity.toFixed(1)}%, Villain ${result.villain.equity.toFixed(1)}%`);
      
      expectApproximateEquity(result.hero.equity, 5, 3);
      expectApproximateEquity(result.villain.equity, 95, 3);
    });

    test('AKs vs QQ on AQ7 rainbow - AKs should win ~80%', () => {
      const board: Card[] = [
        createCard('A', 'h'),
        createCard('Q', 'd'), 
        createCard('7', 'c')
      ];
      
      const config: LegacySimulationConfig = {
        heroRange: ['AKs'],
        villainRange: ['QQ'],
        board,
        iterations: 50000
      };
      
      const result = runLegacySimulation(config);
      console.log(`AKs vs QQ on AQ7: Hero ${result.hero.equity.toFixed(1)}%, Villain ${result.villain.equity.toFixed(1)}%`);
      
      expectApproximateEquity(result.hero.equity, 80, 5);
      expectApproximateEquity(result.villain.equity, 20, 5);
    });

    test('Flush draw vs Set - T9s vs 77 on 7T2 with two spades', () => {
      const board: Card[] = [
        createCard('7', 's'),
        createCard('T', 's'), 
        createCard('2', 'h')
      ];
      
      const config: LegacySimulationConfig = {
        heroRange: ['T9s'], // Two pair + flush draw
        villainRange: ['77'], // Set of sevens
        board,
        iterations: 50000
      };
      
      const result = runLegacySimulation(config);
      console.log(`T9s vs 77 on 7T2 (two spades): Hero ${result.hero.equity.toFixed(1)}%, Villain ${result.villain.equity.toFixed(1)}%`);
      
      // T9s has two pair, flush draw, and straight draw - should have decent equity
      expectApproximateEquity(result.hero.equity, 35, 8);
      expectApproximateEquity(result.villain.equity, 65, 8);
    });
  });

  describe('Turn Scenarios', () => {
    
    test('Flush draw vs Top pair on turn', () => {
      const board: Card[] = [
        createCard('A', 'h'),
        createCard('7', 'h'), 
        createCard('2', 'c'),
        createCard('K', 'h')
      ];
      
      const config: LegacySimulationConfig = {
        heroRange: ['QJs'], // Flush draw with overcards
        villainRange: ['AKo'], // Two pair
        board,
        iterations: 50000
      };
      
      const result = runLegacySimulation(config);
      console.log(`QhJh vs AKo on A72K (3 hearts): Hero ${result.hero.equity.toFixed(1)}%, Villain ${result.villain.equity.toFixed(1)}%`);
      
      // Flush draw has 9 outs (hearts) to win
      expectApproximateEquity(result.hero.equity, 20, 5);
      expectApproximateEquity(result.villain.equity, 80, 5);
    });
  });

  describe('River Scenarios (Complete Board)', () => {
    
    test('Made flush vs Two pair on river', () => {
      const board: Card[] = [
        createCard('A', 'h'),
        createCard('K', 'h'), 
        createCard('Q', 'h'),
        createCard('2', 'c'),
        createCard('5', 'h')
      ];
      
      const config: LegacySimulationConfig = {
        heroRange: ['78s'], // Flush
        villainRange: ['AK'], // Two pair
        board,
        iterations: 10000 // River is deterministic, fewer iterations needed
      };
      
      const result = runLegacySimulation(config);
      console.log(`7h8h vs AK on AhKhQh2c5h: Hero ${result.hero.equity.toFixed(1)}%, Villain ${result.villain.equity.toFixed(1)}%`);
      
      // Flush should win 100% vs two pair
      expectApproximateEquity(result.hero.equity, 100, 1);
      expectApproximateEquity(result.villain.equity, 0, 1);
    });

    test('Straight vs Set on river', () => {
      const board: Card[] = [
        createCard('9', 'h'),
        createCard('T', 'd'), 
        createCard('J', 'c'),
        createCard('Q', 's'),
        createCard('9', 'c')
      ];
      
      const config: LegacySimulationConfig = {
        heroRange: ['K8o'], // Straight (K high)
        villainRange: ['99'], // Set of nines (full house)
        board,
        iterations: 10000
      };
      
      const result = runLegacySimulation(config);
      console.log(`K8 vs 99 on 9TJQQ9: Hero ${result.hero.equity.toFixed(1)}%, Villain ${result.villain.equity.toFixed(1)}%`);
      
      // Set should win (full house vs straight)
      expectApproximateEquity(result.hero.equity, 0, 1);
      expectApproximateEquity(result.villain.equity, 100, 1);
    });
  });

  describe('Range vs Range Scenarios', () => {
    
    test('Pocket pairs vs Big cards', () => {
      const config: LegacySimulationConfig = {
        heroRange: ['22', '33', '44', '55', '66', '77', '88', '99', 'TT', 'JJ', 'QQ', 'KK', 'AA'],
        villainRange: ['AKs', 'AQs', 'AJs', 'AKo', 'AQo', 'AJo', 'KQs', 'KJs', 'KQo'],
        iterations: 50000
      };
      
      const result = runLegacySimulation(config);
      console.log(`All pairs vs Big cards: Hero ${result.hero.equity.toFixed(1)}%, Villain ${result.villain.equity.toFixed(1)}%`);
      
      // Pocket pairs should have slight edge pre-flop
      expectApproximateEquity(result.hero.equity, 55, 5);
      expectApproximateEquity(result.villain.equity, 45, 5);
    });

    test('Premium pairs vs Everything', () => {
      const config: LegacySimulationConfig = {
        heroRange: ['AA', 'KK', 'QQ'],
        villainRange: ['JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 
                      'AKs', 'AQs', 'AJs', 'AKo', 'AQo', 'AJo', 'KQs', 'KJs', 'KQo',
                      'T9s', '98s', '87s', '76s', '65s'],
        iterations: 50000
      };
      
      const result = runLegacySimulation(config);
      console.log(`AA/KK/QQ vs Wide range: Hero ${result.hero.equity.toFixed(1)}%, Villain ${result.villain.equity.toFixed(1)}%`);
      
      // Premium pairs should dominate
      expectApproximateEquity(result.hero.equity, 75, 5);
      expectApproximateEquity(result.villain.equity, 25, 5);
    });
  });

  describe('Edge Cases', () => {
    
    test('Identical hands should split 50/50', () => {
      const config: LegacySimulationConfig = {
        heroRange: ['AKs'],
        villainRange: ['AKs'],
        iterations: 50000
      };
      
      const result = runLegacySimulation(config);
      console.log(`AKs vs AKs: Hero ${result.hero.equity.toFixed(1)}%, Villain ${result.villain.equity.toFixed(1)}%`);
      
      // Should be very close to 50/50 (accounting for ties)
      expectApproximateEquity(result.hero.equity, 50, 3);
      expectApproximateEquity(result.villain.equity, 50, 3);
    });

    test('High iteration count for precision', () => {
      const config: LegacySimulationConfig = {
        heroRange: ['AA'],
        villainRange: ['KK'],
        iterations: 1000000 // High iteration count
      };
      
      const result = runLegacySimulation(config);
      console.log(`AA vs KK (1M iterations): Hero ${result.hero.equity.toFixed(2)}%, Villain ${result.villain.equity.toFixed(2)}%`);
      
      // Should be very precise with 1M iterations
      expectApproximateEquity(result.hero.equity, 82, 1);
      expectApproximateEquity(result.villain.equity, 18, 1);
    });
  });
});

// Helper function to run all tests
export function runSimulatorTests() {
  console.log('🧪 Running Poker Simulator Accuracy Tests...\n');
  
  const tests = [
    // Pre-flop tests
    { name: 'AA vs KK', expected: 'AA ~82%' },
    { name: 'AA vs AKs', expected: 'AA ~87%' },
    { name: 'AA vs AKo', expected: 'AA ~88%' },
    { name: 'AKs vs QQ', expected: 'QQ ~54%' },
    { name: '72o vs AA', expected: 'AA ~88%' },
    
    // Post-flop tests
    { name: 'AA vs KK on K72', expected: 'KK ~95%' },
    { name: 'AKs vs QQ on AQ7', expected: 'AKs ~80%' },
    { name: 'T9s vs 77 on 7T2', expected: '77 ~65%' },
    
    // River tests
    { name: 'Flush vs Two Pair', expected: 'Flush 100%' },
    { name: 'Straight vs Full House', expected: 'Full House 100%' },
  ];
  
  return tests;
}
