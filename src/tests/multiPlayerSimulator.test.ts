import { describe, test, expect } from 'vitest';
import { runSimulation } from '../poker/simulator';
import { SimulationConfig, Player, TablePosition } from '../types/poker';

// Test utilities
function createPlayer(
  id: string, 
  name: string, 
  position: TablePosition, 
  range: string[], 
  isHero: boolean = false
): Player {
  return {
    id,
    name,
    position,
    range,
    isHero,
    isActive: true,
    seatNumber: getPositionNumber(position)
  };
}

function getPositionNumber(position: TablePosition): number {
  const positionMap: Record<TablePosition, number> = {
    'UTG': 1, 'UTG+1': 2, 'MP1': 3, 'MP2': 4, 'MP3': 5,
    'HJ': 6, 'CO': 7, 'BTN': 8, 'SB': 9, 'BB': 10
  };
  return positionMap[position];
}

describe('Multi-Player Simulator Tests', () => {
  
  describe('Two Player Tests (Compatibility)', () => {
    test('Hero vs Villain - Basic functionality', () => {
      const players: Player[] = [
        createPlayer('hero', 'Hero', 'BTN', ['AA'], true),
        createPlayer('villain', 'Villain', 'BB', ['KK'])
      ];

      const config: SimulationConfig = {
        players,
        iterations: 10000
      };

      const result = runSimulation(config);
      
      expect(result.players).toHaveLength(2);
      expect(result.players[0].name).toBe('Hero');
      expect(result.players[1].name).toBe('Villain');
      expect(result.players[0].equity).toBeGreaterThan(75); // AA should win ~82%
      expect(result.players[1].equity).toBeLessThan(25);
    });

    test('Hero vs Villain with board', () => {
      const players: Player[] = [
        createPlayer('hero', 'Hero', 'BTN', ['AA'], true),
        createPlayer('villain', 'Villain', 'BB', ['KK'])
      ];

      const config: SimulationConfig = {
        players,
        board: [
          { rank: 'K', suit: 'h' },
          { rank: '7', suit: 'd' },
          { rank: '2', suit: 'c' }
        ],
        iterations: 10000
      };

      const result = runSimulation(config);
      
      expect(result.players).toHaveLength(2);
      // KK should win on K72 board
      expect(result.players[1].equity).toBeGreaterThan(90);
      expect(result.players[0].equity).toBeLessThan(10);
    });
  });

  describe('Three Player Tests', () => {
    test('Hero vs two Villains - Premium vs Medium hands', () => {
      const players: Player[] = [
        createPlayer('hero', 'Hero', 'BTN', ['AA'], true),
        createPlayer('villain1', 'Villain 1', 'BB', ['KK']),
        createPlayer('villain2', 'Villain 2', 'SB', ['QQ'])
      ];

      const config: SimulationConfig = {
        players,
        iterations: 10000
      };

      const result = runSimulation(config);
      
      expect(result.players).toHaveLength(3);
      expect(result.players[0].name).toBe('Hero');
      
      // AA should still have the highest equity
      const heroEquity = result.players.find(p => p.name === 'Hero')?.equity || 0;
      const villain1Equity = result.players.find(p => p.name === 'Villain 1')?.equity || 0;
      const villain2Equity = result.players.find(p => p.name === 'Villain 2')?.equity || 0;
      
      expect(heroEquity).toBeGreaterThan(villain1Equity);
      expect(heroEquity).toBeGreaterThan(villain2Equity);
      expect(villain1Equity).toBeGreaterThan(villain2Equity); // KK > QQ
    });

    test('Three player equity distribution', () => {
      const players: Player[] = [
        createPlayer('p1', 'Player 1', 'BTN', ['AKs'], true),
        createPlayer('p2', 'Player 2', 'BB', ['QQ']),
        createPlayer('p3', 'Player 3', 'SB', ['JJ'])
      ];

      const config: SimulationConfig = {
        players,
        iterations: 10000
      };

      const result = runSimulation(config);
      
      // Check that equity percentages add up to ~100% (accounting for ties)
      const totalEquity = result.players.reduce((sum, p) => sum + p.equity, 0);
      expect(totalEquity).toBeGreaterThan(95);
      expect(totalEquity).toBeLessThan(105);
    });
  });

  describe('Four Player Tests', () => {
    test('Four players with mixed ranges', () => {
      const players: Player[] = [
        createPlayer('hero', 'Hero', 'BTN', ['AA', 'KK'], true),
        createPlayer('v1', 'Villain 1', 'BB', ['QQ', 'JJ']),
        createPlayer('v2', 'Villain 2', 'SB', ['AKs', 'AQs']),
        createPlayer('v3', 'Villain 3', 'CO', ['TT', '99'])
      ];

      const config: SimulationConfig = {
        players,
        iterations: 5000
      };

      const result = runSimulation(config);
      
      expect(result.players).toHaveLength(4);
      
      // Hero with premium pairs should have highest equity
      const heroResult = result.players.find(p => p.name === 'Hero');
      expect(heroResult).toBeDefined();
      expect(heroResult!.equity).toBeGreaterThan(30); // Should win more than 25% (random)
    });
  });

  describe('Range vs Range Multi-Player', () => {
    test('Tight ranges vs Loose ranges', () => {
      const players: Player[] = [
        createPlayer('tight', 'Tight Player', 'BTN', 
          ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AQs'], true),
        createPlayer('loose', 'Loose Player', 'BB', 
          ['22', '33', '44', '55', '66', '77', '88', '99', 'TT',
           'A2s', 'A3s', 'A4s', 'A5s', 'K2s', 'K3s', 'Q2s', 'J2s'])
      ];

      const config: SimulationConfig = {
        players,
        iterations: 10000
      };

      const result = runSimulation(config);
      
      // Tight range should have higher equity
      const tightEquity = result.players.find(p => p.name === 'Tight Player')?.equity || 0;
      const looseEquity = result.players.find(p => p.name === 'Loose Player')?.equity || 0;
      
      expect(tightEquity).toBeGreaterThan(looseEquity);
      expect(tightEquity).toBeGreaterThan(60);
    });
  });

  describe('Edge Cases and Validation', () => {
    test('Single player should throw error (requires at least 2 players)', () => {
      const players: Player[] = [
        createPlayer('solo', 'Solo Player', 'BTN', ['AA'], true)
      ];

      const config: SimulationConfig = {
        players,
        iterations: 1000
      };

      expect(() => runSimulation(config)).toThrow('At least 2 players with ranges are required for simulation');
    });

    test('Empty ranges should throw error (no valid players)', () => {
      const players: Player[] = [
        createPlayer('p1', 'Player 1', 'BTN', [], true),
        createPlayer('p2', 'Player 2', 'BB', ['AA'])
      ];

      const config: SimulationConfig = {
        players,
        iterations: 100
      };

      // Should throw error because only 1 player has a valid range
      expect(() => runSimulation(config)).toThrow('At least 2 players with ranges are required for simulation');
    });

    test('Inactive players should be filtered out and throw error if not enough remain', () => {
      const players: Player[] = [
        createPlayer('active', 'Active Player', 'BTN', ['AA'], true),
        { ...createPlayer('inactive', 'Inactive Player', 'BB', ['KK']), isActive: false }
      ];

      const config: SimulationConfig = {
        players,
        iterations: 1000
      };

      // Should throw error because only 1 active player remains
      expect(() => runSimulation(config)).toThrow('At least 2 players with ranges are required for simulation');
    });

    test('Large number of players (6+ players)', () => {
      const players: Player[] = Array.from({ length: 6 }, (_, i) => 
        createPlayer(`player${i}`, `Player ${i}`, 'BTN', ['AA'], i === 0)
      );

      const config: SimulationConfig = {
        players,
        iterations: 2000
      };

      const result = runSimulation(config);
      
      expect(result.players).toHaveLength(6);
      
      // All players have AA, so equity should be roughly equal (1/6 ≈ 16.7%)
      result.players.forEach(player => {
        expect(player.equity).toBeGreaterThan(10);
        expect(player.equity).toBeLessThan(25);
      });
    });
  });

  describe('Performance and Accuracy', () => {
    test('High iteration count for accuracy', () => {
      const players: Player[] = [
        createPlayer('hero', 'Hero', 'BTN', ['AA'], true),
        createPlayer('villain', 'Villain', 'BB', ['KK'])
      ];

      const config: SimulationConfig = {
        players,
        iterations: 50000
      };

      const result = runSimulation(config);
      
      // With high iteration count, should be very close to theoretical
      const heroEquity = result.players.find(p => p.name === 'Hero')?.equity || 0;
      expect(heroEquity).toBeGreaterThan(80);
      expect(heroEquity).toBeLessThan(85);
    });

    test('Low iteration count should still work', () => {
      const players: Player[] = [
        createPlayer('hero', 'Hero', 'BTN', ['AA'], true),
        createPlayer('villain', 'Villain', 'BB', ['72o'])
      ];

      const config: SimulationConfig = {
        players,
        iterations: 100
      };

      const result = runSimulation(config);
      
      expect(result.players).toHaveLength(2);
      // Even with low iterations, AA should beat 72o
      const heroEquity = result.players.find(p => p.name === 'Hero')?.equity || 0;
      expect(heroEquity).toBeGreaterThan(50);
    });
  });
});
