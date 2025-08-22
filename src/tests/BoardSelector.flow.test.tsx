import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
    
    // Should show pre-flop state text
    expect(screen.getByText('Pre-flop')).toBeInTheDocument();
    
    // Should show pre-flop preset button
    expect(screen.getByText('🎲 Pre-flop (No community cards)')).toBeInTheDocument();
    
    // Should NOT automatically show flop placeholders
    expect(screen.queryByText('F1')).not.toBeInTheDocument();
  });

  it('should enter flop selection mode when Set Flop button is clicked', () => {
    render(<BoardSelector {...defaultProps} />);
    
    // Click on flop section to start flop selection
    const flopSection = screen.getByText('FLOP').closest('div');
    fireEvent.click(flopSection!);
    
    // Should now show flop selection modal
    expect(screen.getByText('Set Flop')).toBeInTheDocument();
    expect(screen.getByText('Suit:')).toBeInTheDocument();
    expect(screen.getByText('Rank:')).toBeInTheDocument();
  });

  it('should allow canceling flop selection', () => {
    render(<BoardSelector {...defaultProps} />);
    
    // Start flop selection by clicking flop section
    const flopSection = screen.getByText('FLOP').closest('div');
    fireEvent.click(flopSection!);
    
    // Cancel flop selection by clicking close button
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    // Should return to initial state
    expect(screen.getByText('Pre-flop')).toBeInTheDocument();
    expect(screen.queryByText('Set Flop')).not.toBeInTheDocument();
  });

  it('should allow simulation with empty board (pre-flop)', () => {
    render(<BoardSelector {...defaultProps} />);
    
    // Should show pre-flop preset button
    expect(screen.getByText('🎲 Pre-flop (No community cards)')).toBeInTheDocument();
    
    // Should show pre-flop state
    expect(screen.getByText('Pre-flop')).toBeInTheDocument();
  });

  it('should show turn selection after flop is set', () => {
    const propsWithFlop = {
      board: [
        { rank: 'A' as const, suit: 'h' as const },
        { rank: 'K' as const, suit: 'd' as const },
        { rank: 'Q' as const, suit: 'c' as const }
      ],
      onBoardChange: mockOnBoardChange
    };

    render(<BoardSelector {...propsWithFlop} />);
    
    // Should show flop set state and turn section clickable
    expect(screen.getByText('Flop Set')).toBeInTheDocument();
    expect(screen.getByText('TURN')).toBeInTheDocument();
  });

  it('should show river selection after turn is set', () => {
    const propsWithTurn = {
      board: [
        { rank: 'A' as const, suit: 'h' as const },
        { rank: 'K' as const, suit: 'd' as const },
        { rank: 'Q' as const, suit: 'c' as const },
        { rank: 'J' as const, suit: 's' as const }
      ],
      onBoardChange: mockOnBoardChange
    };

    render(<BoardSelector {...propsWithTurn} />);
    
    // Should show turn set state and river section clickable
    expect(screen.getByText('Turn Set')).toBeInTheDocument();
    expect(screen.getByText('RIVER')).toBeInTheDocument();
  });

  it('should properly reset to empty board with pre-flop preset', () => {
    const propsWithCards = {
      board: [
        { rank: 'A' as const, suit: 'h' as const },
        { rank: 'K' as const, suit: 'd' as const },
        { rank: 'Q' as const, suit: 'c' as const }
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
    
    // Should show pre-flop state without flop cards selected
    expect(screen.getByText('Pre-flop')).toBeInTheDocument();
    expect(screen.getByText('FLOP')).toBeInTheDocument();
    
    // Should not show any specific cards
    expect(screen.queryByText('A♥')).not.toBeInTheDocument();
  });
});
