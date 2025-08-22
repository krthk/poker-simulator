import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the simulator for integration tests
vi.mock('../poker/simulator', () => ({
  runSimulation: vi.fn(() => ({
    players: [
      { name: 'Hero', equity: 82.1, wins: 821, ties: 5, totalHands: 1000 },
      { name: 'Villain', equity: 17.9, wins: 174, ties: 5, totalHands: 1000 }
    ]
  }))
}));

describe('Integration Tests - Complete User Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Complete workflow: Two-player pre-flop simulation', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Step 1: Add two players
    expect(screen.getByText('1. Select Players')).toHaveClass('text-blue-600');
    
    await user.click(screen.getByText('UTG')); // Player 1 (Hero)
    await user.click(screen.getByText('UTG+1')); // Player 2 (Villain)
    
    expect(screen.getByText('Active Players: 2')).toBeInTheDocument();
    
    // Step 2: Navigate to ranges and select hands
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    
    expect(screen.getByText('Ranges')).toHaveClass('text-blue-600');
    expect(screen.getByText('Player 1')).toBeInTheDocument(); // Auto-selected hero
    
    // Select AA for hero
    await user.click(screen.getByText('AA'));
    expect(screen.getByText('1 hands (0.6%)')).toBeInTheDocument();
    
    // Switch to villain and select KK
    await user.click(screen.getByText('Player 2 (UTG+1)'));
    await user.click(screen.getByText('KK'));
    
    // Step 3: Board selection (skip for pre-flop)
    const step3Button = screen.getByText('Board');
    await user.click(step3Button);
    
    expect(screen.getByText('Board')).toHaveClass('text-blue-600');
    expect(screen.getByText('Pre-flop (No board cards)')).toBeInTheDocument();
    
    // Step 4: Run simulation
    const step4Button = screen.getByText('Results');
    await user.click(step4Button);
    
    expect(screen.getByText('Results')).toHaveClass('text-blue-600');
    expect(screen.getByText('Simulation Results')).toBeInTheDocument();
    expect(screen.getByText('Hero')).toBeInTheDocument();
    expect(screen.getByText('82.1%')).toBeInTheDocument();
  });

  test('Complete workflow: Three-player flop simulation', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Step 1: Add three players
    await user.click(screen.getByText('UTG')); // Player 1
    await user.click(screen.getByText('UTG+1')); // Player 2
    await user.click(screen.getByText('MP1')); // Player 3
    
    expect(screen.getByText('Active Players: 3')).toBeInTheDocument();
    
    // Step 2: Set up ranges for all players
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    
    // Hero gets AA
    await user.click(screen.getByText('AA'));
    
    // Player 2 gets KK
    await user.click(screen.getByText('Player 2 (UTG+1)'));
    await user.click(screen.getByText('KK'));
    
    // Player 3 gets QQ
    await user.click(screen.getByText('Player 3 (UTG+2)'));
    await user.click(screen.getByText('QQ'));
    
    // Step 3: Set flop
    const step3Button = screen.getByText('Board');
    await user.click(step3Button);
    
    // Select flop: A-K-Q rainbow
    await user.click(screen.getByText('A♥'));
    await user.click(screen.getByText('K♦'));
    await user.click(screen.getByText('Q♣'));
    
    expect(screen.getByText('Flop')).toBeInTheDocument();
    
    // Step 4: View results
    const step4Button = screen.getByText('Results');
    await user.click(step4Button);
    
    expect(screen.getByText('Simulation Results')).toBeInTheDocument();
  });

  test('Workflow with preset ranges', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Add players
    await user.click(screen.getByText('UTG'));
    await user.click(screen.getByText('UTG+1'));
    
    // Navigate to ranges
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    
    // Use Tight preset for hero
    await user.click(screen.getByText('Tight'));
    
    // Verify tight range is selected (should have multiple hands)
    const rangeDisplay = screen.getByText(/hands \(/);
    expect(rangeDisplay.textContent).toMatch(/\d+ hands/);
    
    // Switch to villain and use Loose preset
    await user.click(screen.getByText('Player 2 (UTG+1)'));
    await user.click(screen.getByText('Loose'));
    
    // Continue to results
    const step3Button = screen.getByText('Board');
    await user.click(step3Button);
    
    const step4Button = screen.getByText('Results');
    await user.click(step4Button);
    
    expect(screen.getByText('Simulation Results')).toBeInTheDocument();
  });

  test('Board validation workflow - invalid flop handling', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Set up players and ranges
    await user.click(screen.getByText('UTG'));
    await user.click(screen.getByText('UTG+1'));
    
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    await user.click(screen.getByText('AA'));
    
    // Go to board step
    const step3Button = screen.getByText('Board');
    await user.click(step3Button);
    
    // Select only 1 card (invalid flop)
    await user.click(screen.getByText('A♥'));
    
    // Try to proceed to results - should be blocked
    const step4Button = screen.getByText('Results');
    await user.click(step4Button);
    
    // Should remain on board step
    expect(screen.getByText('Board')).toHaveClass('text-blue-600');
    
    // Complete the flop
    await user.click(screen.getByText('K♦'));
    await user.click(screen.getByText('Q♣'));
    
    // Now should be able to proceed
    await user.click(step4Button);
    expect(screen.getByText('Results')).toHaveClass('text-blue-600');
  });

  test('Workflow with turn and river cards', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Set up basic scenario
    await user.click(screen.getByText('UTG'));
    await user.click(screen.getByText('UTG+1'));
    
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    await user.click(screen.getByText('AA'));
    
    // Set complete board (flop, turn, river)
    const step3Button = screen.getByText('Board');
    await user.click(step3Button);
    
    // Flop
    await user.click(screen.getByText('A♥'));
    await user.click(screen.getByText('K♦'));
    await user.click(screen.getByText('Q♣'));
    
    // Turn
    await user.click(screen.getByText('J♠'));
    expect(screen.getByText('Turn')).toBeInTheDocument();
    
    // River
    await user.click(screen.getByText('T♥'));
    expect(screen.getByText('River')).toBeInTheDocument();
    
    // Proceed to results
    const step4Button = screen.getByText('Results');
    await user.click(step4Button);
    
    expect(screen.getByText('Simulation Results')).toBeInTheDocument();
  });

  test('Navigation between steps maintains state', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Set up initial state
    await user.click(screen.getByText('UTG'));
    await user.click(screen.getByText('UTG+1'));
    
    // Go to ranges and select some hands
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    await user.click(screen.getByText('AA'));
    await user.click(screen.getByText('KK'));
    
    // Go to board and select cards
    const step3Button = screen.getByText('Board');
    await user.click(step3Button);
    await user.click(screen.getByText('A♥'));
    await user.click(screen.getByText('K♦'));
    await user.click(screen.getByText('Q♣'));
    
    // Navigate back to ranges
    await user.click(step2Button);
    
    // State should be maintained
    expect(screen.getByText('2 hands (1.2%)')).toBeInTheDocument();
    
    // Navigate back to board
    await user.click(step3Button);
    
    // Board state should be maintained
    expect(screen.getByText('A♥')).toBeInTheDocument();
    expect(screen.getByText('K♦')).toBeInTheDocument();
    expect(screen.getByText('Q♣')).toBeInTheDocument();
    expect(screen.getByText('Flop')).toBeInTheDocument();
  });

  test('Hero designation workflow', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Add multiple players
    await user.click(screen.getByText('UTG')); // Player 1 (auto-hero)
    await user.click(screen.getByText('UTG+1')); // Player 2
    await user.click(screen.getByText('MP1')); // Player 3
    
    // Verify initial hero
    expect(screen.getByText('Hero: Player 1 (UTG)')).toBeInTheDocument();
    
    // Change hero to Player 2
    const setHeroButtons = screen.getAllByText('Set as Hero');
    await user.click(setHeroButtons[0]); // First non-hero player
    
    expect(screen.getByText('Hero: Player 2 (UTG+1)')).toBeInTheDocument();
    
    // Navigate to ranges - should auto-select new hero
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    
    expect(screen.getByText('Player 2')).toBeInTheDocument(); // New hero selected
    expect(screen.getByText('UTG+1')).toBeInTheDocument();
  });

  test('Clear and reset functionality', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Set up complex state
    await user.click(screen.getByText('UTG'));
    await user.click(screen.getByText('UTG+1'));
    await user.click(screen.getByText('MP1'));
    
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    await user.click(screen.getByText('Any Two')); // Select all hands
    
    const step3Button = screen.getByText('Board');
    await user.click(step3Button);
    await user.click(screen.getByText('A♥'));
    await user.click(screen.getByText('K♦'));
    await user.click(screen.getByText('Q♣'));
    
    // Clear board
    await user.click(screen.getByText('Clear Board'));
    expect(screen.getByText('Pre-flop (No board cards)')).toBeInTheDocument();
    
    // Go back and clear ranges
    await user.click(step2Button);
    await user.click(screen.getByText('Clear'));
    expect(screen.getByText('0 hands (0.0%)')).toBeInTheDocument();
    
    // Go back and clear players
    const step1Button = screen.getByText('1. Select Players');
    await user.click(step1Button);
    await user.click(screen.getByText('Clear All'));
    expect(screen.getByText('Active Players: 0')).toBeInTheDocument();
  });

  test('Large-scale simulation workflow (6 players)', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Add 6 players
    const positions = ['UTG', 'UTG+1', 'MP1', 'MP2', 'MP3', 'HJ'];
    for (const position of positions) {
      await user.click(screen.getByText(position));
    }
    
    expect(screen.getByText('Active Players: 6')).toBeInTheDocument();
    
    // Navigate to ranges and give each player a range
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    
    // Player 1 (Hero): Premium hands
    await user.click(screen.getByText('Tight'));
    
    // Player 2: Medium hands
    await user.click(screen.getByText('Player 2 (UTG+1)'));
    await user.click(screen.getByText('QQ'));
    await user.click(screen.getByText('JJ'));
    
    // Player 3: Loose range
    await user.click(screen.getByText('Player 3 (UTG+2)'));
    await user.click(screen.getByText('Loose'));
    
    // Players 4-6: Various hands
    await user.click(screen.getByText('Player 4 (MP)'));
    await user.click(screen.getByText('AKs'));
    
    await user.click(screen.getByText('Player 5 (CO)'));
    await user.click(screen.getByText('TT'));
    
    await user.click(screen.getByText('Player 6 (BTN)'));
    await user.click(screen.getByText('99'));
    
    // Skip board for pre-flop
    const step3Button = screen.getByText('Board');
    await user.click(step3Button);
    
    // Run simulation
    const step4Button = screen.getByText('Results');
    await user.click(step4Button);
    
    expect(screen.getByText('Simulation Results')).toBeInTheDocument();
  });

  test('Error handling: Empty ranges', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Add players but don't give them ranges
    await user.click(screen.getByText('UTG'));
    await user.click(screen.getByText('UTG+1'));
    
    // Skip ranges step
    const step3Button = screen.getByText('Board');
    await user.click(step3Button);
    
    const step4Button = screen.getByText('Results');
    await user.click(step4Button);
    
    // Should handle gracefully (simulation should still run or show appropriate message)
    // The exact behavior depends on implementation, but shouldn't crash
    expect(screen.getByText('Results')).toHaveClass('text-blue-600');
  });

  test('Drag and drop range selection workflow', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Set up players
    await user.click(screen.getByText('UTG'));
    await user.click(screen.getByText('UTG+1'));
    
    // Navigate to ranges
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    
    // Test drag selection (simulate mouse events)
    const aaButton = screen.getByText('AA');
    const kkButton = screen.getByText('KK');
    
    // Simulate drag from AA to KK
    await user.pointer([
      { keys: '[MouseLeft>]', target: aaButton },
      { pointerName: 'mouse', target: kkButton },
      { keys: '[/MouseLeft]' }
    ]);
    
    // Should select multiple hands
    const rangeText = screen.getByText(/hands \(/);
    expect(rangeText.textContent).toMatch(/\d+ hands/);
    expect(parseInt(rangeText.textContent || '0')).toBeGreaterThan(1);
  });
});
