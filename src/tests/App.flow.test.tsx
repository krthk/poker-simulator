// React import removed as it's not needed in React 17+
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock the handStrength module
vi.mock('../poker/handStrength', () => ({
  getTopPercentHands: vi.fn(() => ['AA', 'KK', 'QQ']),
  getRangeLabel: vi.fn(() => 'Premium Range'),
  PRESET_PERCENTAGES: {
    PREMIUM: 2.4,
    ULTRA_TIGHT: 5.9,
    TIGHT: 15.4,
    MEDIUM: 30.2,
    LOOSE: 50.3,
  },
  getRangeStats: vi.fn(() => ({
    count: 3,
    percentage: 5.0,
    averageStrength: 85,
    strongestHand: 'AA',
    weakestHand: 'QQ'
  }))
}));

describe('App Flow - Step 1 to Step 2 Regression Test', () => {
  it('successfully navigates from Step 1 (Players) to Step 2 (Ranges) without crashing', () => {
    // Render the app
    render(<App />);

    // Verify we start on Step 1 (Players)
    expect(screen.getByText('Select Players')).toBeInTheDocument();

    // Add a couple of players by clicking on seats
    // The app should show seat positions like UTG, UTG+1, etc.
    const seats = screen.getAllByText('+');
    
    // Click first two seats to add players
    fireEvent.click(seats[0]);
    fireEvent.click(seats[1]);

    // Should see the continue button appear
    const continueButton = screen.getByText(/Continue to Set Ranges/);
    expect(continueButton).toBeInTheDocument();

    // Click continue to go to Step 2
    fireEvent.click(continueButton);

    // Verify we're now on Step 2 (Ranges)
    expect(screen.getByText('Configure Player Ranges')).toBeInTheDocument();

    // Verify HandRangeSelector components are rendered without crashing
    expect(screen.getByText('Click a Player to Configure Range')).toBeInTheDocument();

    // Should see preset buttons
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Ultra-tight')).toBeInTheDocument();
    expect(screen.getByText('Tight')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Loose')).toBeInTheDocument();
    expect(screen.getByText('Any Two')).toBeInTheDocument();

    // Should see the percentage slider
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();

    // Should see hand matrix buttons (at least some of them)
    const handButtons = screen.getAllByRole('button').filter(button => 
      button.getAttribute('title')?.includes('Pocket Pair') ||
      button.getAttribute('title')?.includes('Suited') ||
      button.getAttribute('title')?.includes('Offsuit')
    );
    
    // Should have 169 hand buttons total
    expect(handButtons.length).toBe(169);

    // The test passing means no crashes occurred during the flow
    console.log('✅ Step 1 → Step 2 flow completed successfully without crashes');
  });

  it('shows proper player selection in ranges step', () => {
    render(<App />);

    // Add players
    const seats = screen.getAllByText('+');
    fireEvent.click(seats[0]); // UTG
    fireEvent.click(seats[7]); // BTN

    // Go to ranges step
    const continueButton = screen.getByText(/Continue to Set Ranges/);
    fireEvent.click(continueButton);

    // Should show player cards for selection
    expect(screen.getByText(/Player 1/)).toBeInTheDocument();
    expect(screen.getByText(/Player 8/)).toBeInTheDocument();
  });
});
