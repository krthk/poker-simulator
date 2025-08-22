import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BoardSelector from '../components/BoardSelector';

describe('BoardSelector - Flow Control Regression Tests', () => {
  const mockOnBoardChange = vi.fn();

  const defaultProps = {
    board: [],
    onBoardChange: mockOnBoardChange
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start with empty board and no automatic flop selection', () => {
    render(<BoardSelector {...defaultProps} />);
    
    // Should show "Set Flop" button when board is empty
    expect(screen.getByText('Set Flop (3 cards)')).toBeInTheDocument();
    
    // Should show instruction to click button or proceed with empty board
    expect(screen.getByText(/Click 'Set Flop' button to add community cards, or proceed with empty board/)).toBeInTheDocument();
    
    // Should NOT automatically show flop placeholders
    expect(screen.queryByText('F1')).not.toBeInTheDocument();
  });

  it('should enter flop selection mode when Set Flop button is clicked', () => {
    render(<BoardSelector {...defaultProps} />);
    
    // Click Set Flop button
    const setFlopButton = screen.getByText('Set Flop (3 cards)');
    fireEvent.click(setFlopButton);
    
    // Should now show flop selection UI
    expect(screen.getByText('Selecting Flop Cards (0/3)')).toBeInTheDocument();
    expect(screen.getByText('Cancel Flop Selection')).toBeInTheDocument();
    
    // Should show instruction for first card
    expect(screen.getByText('Select first card for the flop')).toBeInTheDocument();
  });

  it('should allow canceling flop selection', () => {
    render(<BoardSelector {...defaultProps} />);
    
    // Start flop selection
    fireEvent.click(screen.getByText('Set Flop (3 cards)'));
    
    // Cancel flop selection
    fireEvent.click(screen.getByText('Cancel Flop Selection'));
    
    // Should return to initial state
    expect(screen.getByText('Set Flop (3 cards)')).toBeInTheDocument();
    expect(screen.queryByText('Selecting Flop Cards')).not.toBeInTheDocument();
  });

  it('should allow simulation with empty board (pre-flop)', () => {
    render(<BoardSelector {...defaultProps} />);
    
    // Should show pre-flop preset as selected
    expect(screen.getByText('🎲 Pre-flop (No community cards)')).toBeInTheDocument();
    
    // Should show instruction that empty board is allowed
    expect(screen.getByText(/or proceed with empty board/)).toBeInTheDocument();
  });

  it('should show turn selection after flop is set', () => {
    const propsWithFlop = {
      board: [
        { rank: 'A', suit: 'h' },
        { rank: 'K', suit: 'd' },
        { rank: 'Q', suit: 'c' }
      ],
      onBoardChange: mockOnBoardChange
    };

    render(<BoardSelector {...propsWithFlop} />);
    
    // Should show add turn button
    expect(screen.getByText('ADD TURN')).toBeInTheDocument();
    expect(screen.getByText('✅ Flop set • Click + to add turn card or any flop card to reset')).toBeInTheDocument();
  });

  it('should show river selection after turn is set', () => {
    const propsWithTurn = {
      board: [
        { rank: 'A', suit: 'h' },
        { rank: 'K', suit: 'd' },
        { rank: 'Q', suit: 'c' },
        { rank: 'J', suit: 's' }
      ],
      onBoardChange: mockOnBoardChange
    };

    render(<BoardSelector {...propsWithTurn} />);
    
    // Should show add river button
    expect(screen.getByText('ADD RIVER')).toBeInTheDocument();
    expect(screen.getByText('🔄 Turn set • Click + to add river card, turn to remove, or any flop card to reset')).toBeInTheDocument();
  });

  it('should properly reset to empty board with pre-flop preset', () => {
    const propsWithCards = {
      board: [
        { rank: 'A', suit: 'h' },
        { rank: 'K', suit: 'd' },
        { rank: 'Q', suit: 'c' }
      ],
      onBoardChange: mockOnBoardChange
    };

    render(<BoardSelector {...propsWithCards} />);
    
    // Click pre-flop preset
    fireEvent.click(screen.getByText('🎲 Pre-flop (No community cards)'));
    
    // Should call onBoardChange with empty array
    expect(mockOnBoardChange).toHaveBeenCalledWith([]);
  });

  it('should not force flop selection when board is empty', () => {
    render(<BoardSelector {...defaultProps} />);
    
    // Should NOT show automatic flop placeholders
    expect(screen.queryByText('F1')).not.toBeInTheDocument();
    expect(screen.queryByText('F2')).not.toBeInTheDocument();
    expect(screen.queryByText('F3')).not.toBeInTheDocument();
    
    // Should show trigger button instead
    expect(screen.getByText('Set Flop (3 cards)')).toBeInTheDocument();
  });
});
