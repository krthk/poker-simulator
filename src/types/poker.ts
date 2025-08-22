// Card and hand types
export type Suit = 'h' | 'd' | 'c' | 's'; // hearts, diamonds, clubs, spades
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type Hand = [Card, Card]; // Hole cards
export type Board = Card[]; // 0-5 community cards

// Hand range types
export type HandRange = string[]; // e.g., ['AA', 'KK', 'AKs', 'AQo']

// Table and player types
export type TablePosition = 'UTG' | 'UTG+1' | 'MP1' | 'MP2' | 'MP3' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

export interface Player {
  id: string;
  name: string;
  position: TablePosition;
  range: HandRange;
  isHero: boolean;
  isActive: boolean;
  seatNumber: number; // 1-10 for full ring
}

// Simulation types
export interface SimulationConfig {
  players: Player[];
  iterations: number;
  board?: Board;
}

export interface EquityResult {
  equity: number;  // Percentage (0-100)
  wins: number;    // Number of wins
  ties: number;    // Number of ties
  total: number;   // Total hands simulated
}

export interface PlayerResult extends EquityResult {
  playerId: string;
  playerName: string;
  name: string; // Alias for playerName for backward compatibility
  position: TablePosition;
}

export interface SimulationResult {
  players: PlayerResult[];
  iterations: number;
  totalHandsSimulated: number;
}

// Legacy types for backward compatibility
export interface LegacySimulationConfig {
  heroRange: HandRange;
  villainRange: HandRange;
  iterations: number;
  board?: Board;
}

export interface LegacySimulationResult {
  hero: EquityResult;
  villain: EquityResult;
  iterations: number;
}

// Hand evaluation types
export enum HandRank {
  HIGH_CARD = 1,
  PAIR = 2,
  TWO_PAIR = 3,
  THREE_OF_A_KIND = 4,
  STRAIGHT = 5,
  FLUSH = 6,
  FULL_HOUSE = 7,
  FOUR_OF_A_KIND = 8,
  STRAIGHT_FLUSH = 9,
  ROYAL_FLUSH = 10
}

export interface HandEvaluation {
  rank: HandRank;
  value: number; // For comparing hands of same rank
}
