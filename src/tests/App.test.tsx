import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the simulator to avoid running actual simulations in tests
vi.mock('../poker/simulator', () => ({
  runSimulation: vi.fn(() => ({
    players: [
      { name: 'Hero', equity: 80.5, wins: 805, ties: 0, totalHands: 1000 },
      { name: 'Villain', equity: 19.5, wins: 195, ties: 0, totalHands: 1000 }
    ]
  }))
}));

describe('App Component Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders initial step (Select Players)', () => {
    render(<App />);
    
    expect(screen.getByText('Poker Hand Equity Calculator')).toBeInTheDocument();
    expect(screen.getByText('Players')).toBeInTheDocument();
    expect(screen.getByText('Select Players')).toBeInTheDocument();
    expect(screen.getByText('Click on seats to add/remove players')).toBeInTheDocument();
  });

  test('step navigation buttons are clickable', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Initially on step 1
    expect(screen.getByText('Players')).toHaveClass('text-blue-600');
    
    // Add a player first to enable navigation
    // Use position names to click seats
    await user.click(screen.getByText('UTG')); // Add Player 1
    await user.click(screen.getByText('UTG+1')); // Add Player 2
    
    // Click on step 2 button
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    
    // Should navigate to step 2
    expect(screen.getByText('Ranges')).toHaveClass('text-blue-600');
    expect(screen.getByText('Select Hand Range')).toBeInTheDocument();
  });

  test('prevents navigation to ranges without players', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Try to click on step 2 without adding players
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    
    // Should remain on step 1
    expect(screen.getByText('Players')).toHaveClass('text-blue-600');
    expect(screen.getByText('Select Players')).toBeInTheDocument();
  });

  test('auto-selects hero when navigating to ranges step', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Add players
    // Use position names to click seats
    await user.click(screen.getByText('UTG')); // Add Player 1 (will be hero by default)
    await user.click(screen.getByText('UTG+1')); // Add Player 2
    
    // Navigate to step 2
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    
    // Should auto-select the hero player
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('UTG')).toBeInTheDocument();
    expect(screen.getByText('Select Hand Range')).toBeInTheDocument();
  });

  test('player summary shows in ranges step', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Add players
    // Use position names to click seats
    await user.click(screen.getByText('UTG')); // Add Player 1
    await user.click(screen.getByText('UTG+1')); // Add Player 2
    
    // Navigate to ranges
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    
    // Should show player summary at the top
    expect(screen.getByText('Active Players')).toBeInTheDocument();
    expect(screen.getByText('Hero: Player 1 (UTG)')).toBeInTheDocument();
    expect(screen.getByText('Player 2 (UTG+1)')).toBeInTheDocument();
  });

  test('can select different players in ranges step', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Add players
    // Use position names to click seats
    await user.click(screen.getByText('UTG')); // Player 1
    await user.click(screen.getByText('UTG+1')); // Player 2
    
    // Navigate to ranges
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    
    // Click on Player 2 to select them
    const player2Button = screen.getByText('Player 2 (UTG+1)');
    await user.click(player2Button);
    
    // Should now show Player 2's range selector
    expect(screen.getByText('Player 2')).toBeInTheDocument();
  });

  test('board validation prevents navigation with invalid flop', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Add players and navigate through steps
    // Use position names to click seats
    await user.click(screen.getByText('UTG'));
    await user.click(screen.getByText('UTG+1'));
    
    // Navigate to ranges and add some ranges
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    
    const aaButton = screen.getByText('AA');
    await user.click(aaButton);
    
    // Navigate to board
    const step3Button = screen.getByText('Board');
    await user.click(step3Button);
    
    // Select only 1 flop card (invalid)
    const aceHearts = screen.getByText('A♥');
    await user.click(aceHearts);
    
    // Try to navigate to results
    const step4Button = screen.getByText('Results');
    await user.click(step4Button);
    
    // Should remain on board step due to invalid flop
    expect(screen.getByText('Board')).toHaveClass('text-blue-600');
    expect(screen.getByText('Select Board Cards')).toBeInTheDocument();
  });

  test('allows navigation with valid flop (3 cards)', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Add players and ranges
    // Use position names to click seats
    await user.click(screen.getByText('UTG'));
    await user.click(screen.getByText('UTG+1'));
    
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    
    const aaButton = screen.getByText('AA');
    await user.click(aaButton);
    
    // Navigate to board
    const step3Button = screen.getByText('Board');
    await user.click(step3Button);
    
    // Select valid flop (3 cards)
    await user.click(screen.getByText('A♥'));
    await user.click(screen.getByText('K♦'));
    await user.click(screen.getByText('Q♣'));
    
    // Navigate to results
    const step4Button = screen.getByText('Results');
    await user.click(step4Button);
    
    // Should reach results step
    expect(screen.getByText('Results')).toHaveClass('text-blue-600');
  });

  test('allows navigation with pre-flop (0 cards)', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Add players and ranges
    // Use position names to click seats
    await user.click(screen.getByText('UTG'));
    await user.click(screen.getByText('UTG+1'));
    
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    
    const aaButton = screen.getByText('AA');
    await user.click(aaButton);
    
    // Navigate to board (keep empty for pre-flop)
    const step3Button = screen.getByText('Board');
    await user.click(step3Button);
    
    // Navigate to results without selecting any cards
    const step4Button = screen.getByText('Results');
    await user.click(step4Button);
    
    // Should reach results step
    expect(screen.getByText('Results')).toHaveClass('text-blue-600');
  });

  test('runs simulation and shows results', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Complete workflow
    // Use position names to click seats
    await user.click(screen.getByText('UTG'));
    await user.click(screen.getByText('UTG+1'));
    
    // Add ranges
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    
    const aaButton = screen.getByText('AA');
    await user.click(aaButton);
    
    // Skip board (pre-flop)
    const step3Button = screen.getByText('Board');
    await user.click(step3Button);
    
    // Go to results
    const step4Button = screen.getByText('Results');
    await user.click(step4Button);
    
    // Should show simulation results
    expect(screen.getByText('Simulation Results')).toBeInTheDocument();
    expect(screen.getByText('Hero')).toBeInTheDocument();
    expect(screen.getByText('80.5%')).toBeInTheDocument(); // Mocked equity
  });

  test('reset functionality works correctly', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Add players
    // Use position names to click seats
    await user.click(screen.getByText('UTG'));
    await user.click(screen.getByText('UTG+1'));
    
    // Navigate to ranges
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    
    // Click "Start Over" or equivalent reset button
    const step1Button = screen.getByText('Players');
    await user.click(step1Button);
    
    // Should return to step 1
    expect(screen.getByText('Players')).toHaveClass('text-blue-600');
    expect(screen.getByText('Select Players')).toBeInTheDocument();
  });

  test('footer displays correct copyright', () => {
    render(<App />);
    
    expect(screen.getByText('© 2025')).toBeInTheDocument();
  });

  test('prevents navigation without required data', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Try to navigate to board without players/ranges
    const step3Button = screen.getByText('Board');
    await user.click(step3Button);
    
    // Should remain on step 1
    expect(screen.getByText('Players')).toHaveClass('text-blue-600');
  });

  test('maintains player ranges when navigating between steps', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Add players
    // Use position names to click seats
    await user.click(screen.getByText('UTG'));
    await user.click(screen.getByText('UTG+1'));
    
    // Navigate to ranges and select hands
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    
    const aaButton = screen.getByText('AA');
    const kkButton = screen.getByText('KK');
    await user.click(aaButton);
    await user.click(kkButton);
    
    // Navigate to board and back
    const step3Button = screen.getByText('Board');
    await user.click(step3Button);
    
    await user.click(step2Button);
    
    // Range should be maintained
    expect(screen.getByText('2 hands (1.2%)')).toBeInTheDocument();
  });

  test('displays step indicators with correct styling', () => {
    render(<App />);
    
    // Current step should be highlighted
    expect(screen.getByText('Players')).toHaveClass('text-blue-600');
    
    // Other steps should be muted
    expect(screen.getByText('Ranges')).toHaveClass('text-gray-400');
    expect(screen.getByText('Board')).toHaveClass('text-gray-400');
    expect(screen.getByText('Results')).toHaveClass('text-gray-400');
  });

  test('handles large number of players correctly', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Add maximum players (6 for this test)
    const positions = ['UTG', 'UTG+1', 'MP1', 'MP2', 'MP3', 'HJ'];
    for (const position of positions) {
      await user.click(screen.getByText(position));
    }
    
    // Should show all players
    expect(screen.getByText('Active Players: 6')).toBeInTheDocument();
    
    // Navigate to ranges
    const step2Button = screen.getByText('Ranges');
    await user.click(step2Button);
    
    // Should be able to select different players
    expect(screen.getByText('Player 1 (UTG)')).toBeInTheDocument();
    expect(screen.getByText('Player 6 (BTN)')).toBeInTheDocument();
  });
});
