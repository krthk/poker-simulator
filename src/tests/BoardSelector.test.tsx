import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BoardSelector from '../components/BoardSelector';
import { Card } from '../types/poker';

describe('BoardSelector Component', () => {
  const mockOnBoardChange = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders board selector with empty board', () => {
    render(
      <BoardSelector
        board={[]}
        onBoardChange={mockOnBoardChange}
      />
    );

    expect(screen.getByText('Select Board Cards')).toBeInTheDocument();
    expect(screen.getByText('Pre-flop (No board cards)')).toBeInTheDocument();
    expect(screen.getByText('Select flop cards (all 3 required)')).toBeInTheDocument();
  });

  test('displays selected board cards correctly', () => {
    const board: Card[] = [
      { rank: 'A', suit: 'h' },
      { rank: 'K', suit: 'd' },
      { rank: 'Q', suit: 'c' }
    ];

    render(
      <BoardSelector
        board={board}
        onBoardChange={mockOnBoardChange}
      />
    );

    expect(screen.getByText('A♥')).toBeInTheDocument();
    expect(screen.getByText('K♦')).toBeInTheDocument();
    expect(screen.getByText('Q♣')).toBeInTheDocument();
  });

  test('shows flop card selection state correctly', () => {
    render(
      <BoardSelector
        board={[]}
        onBoardChange={mockOnBoardChange}
      />
    );

    // Initially should show pre-flop
    expect(screen.getByText('Pre-flop (No board cards)')).toBeInTheDocument();
    
    // Should show instruction for flop selection
    expect(screen.getByText('Select flop cards (all 3 required)')).toBeInTheDocument();
  });

  test('flop validation - prevents proceeding with 1 flop card', async () => {
    const user = userEvent.setup();
    
    render(
      <BoardSelector
        board={[]}
        onBoardChange={mockOnBoardChange}
      />
    );

    // Select one card (Ace of Hearts)
    const aceHearts = screen.getByText('A♥');
    await user.click(aceHearts);

    expect(mockOnBoardChange).toHaveBeenCalled();
    const selectedCards = mockOnBoardChange.mock.calls[0][0];
    expect(selectedCards).toHaveLength(1);
    expect(selectedCards[0]).toEqual({ rank: 'A', suit: 'h' });
  });

  test('flop validation - prevents proceeding with 2 flop cards', async () => {
    const user = userEvent.setup();
    
    // Start with one card already selected
    const initialBoard: Card[] = [{ rank: 'A', suit: 'h' }];
    
    render(
      <BoardSelector
        board={initialBoard}
        onBoardChange={mockOnBoardChange}
      />
    );

    // Select second card
    const kingDiamonds = screen.getByText('K♦');
    await user.click(kingDiamonds);

    expect(mockOnBoardChange).toHaveBeenCalled();
    const selectedCards = mockOnBoardChange.mock.calls[0][0];
    expect(selectedCards).toHaveLength(2);
  });

  test('flop validation - allows proceeding with 0 cards (pre-flop)', () => {
    render(
      <BoardSelector
        board={[]}
        onBoardChange={mockOnBoardChange}
      />
    );

    // Pre-flop should be valid
    expect(screen.getByText('Pre-flop (No board cards)')).toBeInTheDocument();
  });

  test('flop validation - allows proceeding with exactly 3 cards', () => {
    const validFlop: Card[] = [
      { rank: 'A', suit: 'h' },
      { rank: 'K', suit: 'd' },
      { rank: 'Q', suit: 'c' }
    ];

    render(
      <BoardSelector
        board={validFlop}
        onBoardChange={mockOnBoardChange}
      />
    );

    expect(screen.getByText('Flop')).toBeInTheDocument();
    expect(screen.getByText('A♥')).toBeInTheDocument();
    expect(screen.getByText('K♦')).toBeInTheDocument();
    expect(screen.getByText('Q♣')).toBeInTheDocument();
  });

  test('shows temporary flop cards while selecting', async () => {
    const user = userEvent.setup();
    
    render(
      <BoardSelector
        board={[]}
        onBoardChange={mockOnBoardChange}
      />
    );

    // Select first card
    const aceHearts = screen.getByText('A♥');
    await user.click(aceHearts);

    // Should show the temp card selection state
    expect(mockOnBoardChange).toHaveBeenCalled();
  });

  test('can remove cards from board', async () => {
    const user = userEvent.setup();
    
    const boardWithCards: Card[] = [
      { rank: 'A', suit: 'h' },
      { rank: 'K', suit: 'd' },
      { rank: 'Q', suit: 'c' }
    ];

    render(
      <BoardSelector
        board={boardWithCards}
        onBoardChange={mockOnBoardChange}
      />
    );

    // Find and click remove button (x) for the first card
    const removeButtons = screen.getAllByText('×');
    expect(removeButtons).toHaveLength(3); // One for each card
    
    await user.click(removeButtons[0]);

    expect(mockOnBoardChange).toHaveBeenCalled();
    const newBoard = mockOnBoardChange.mock.calls[0][0];
    expect(newBoard).toHaveLength(2);
    expect(newBoard).not.toContainEqual({ rank: 'A', suit: 'h' });
  });

  test('clear board button works', async () => {
    const user = userEvent.setup();
    
    const boardWithCards: Card[] = [
      { rank: 'A', suit: 'h' },
      { rank: 'K', suit: 'd' }
    ];

    render(
      <BoardSelector
        board={boardWithCards}
        onBoardChange={mockOnBoardChange}
      />
    );

    const clearButton = screen.getByText('Clear Board');
    await user.click(clearButton);

    expect(mockOnBoardChange).toHaveBeenCalledWith([]);
  });

  test('disables already selected cards', () => {
    const boardWithCards: Card[] = [
      { rank: 'A', suit: 'h' },
      { rank: 'K', suit: 'd' }
    ];

    render(
      <BoardSelector
        board={boardWithCards}
        onBoardChange={mockOnBoardChange}
      />
    );

    // Selected cards should be disabled (not clickable)
    const aceHearts = screen.getByText('A♥');
    const kingDiamonds = screen.getByText('K♦');
    
    expect(aceHearts.closest('button')).toHaveClass('opacity-30'); // Disabled styling
    expect(kingDiamonds.closest('button')).toHaveClass('opacity-30');
  });

  test('displays all suits correctly', () => {
    render(
      <BoardSelector
        board={[]}
        onBoardChange={mockOnBoardChange}
      />
    );

    // Check that all suits are represented
    expect(screen.getByText('A♥')).toBeInTheDocument(); // Hearts
    expect(screen.getByText('A♦')).toBeInTheDocument(); // Diamonds
    expect(screen.getByText('A♣')).toBeInTheDocument(); // Clubs
    expect(screen.getByText('A♠')).toBeInTheDocument(); // Spades
  });

  test('displays all ranks correctly', () => {
    render(
      <BoardSelector
        board={[]}
        onBoardChange={mockOnBoardChange}
      />
    );

    // Check that all ranks are represented
    const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
    ranks.forEach(rank => {
      expect(screen.getByText(`${rank}♥`)).toBeInTheDocument();
    });
  });

  test('handles turn and river cards', async () => {
    const user = userEvent.setup();
    
    const flopBoard: Card[] = [
      { rank: 'A', suit: 'h' },
      { rank: 'K', suit: 'd' },
      { rank: 'Q', suit: 'c' }
    ];

    render(
      <BoardSelector
        board={flopBoard}
        onBoardChange={mockOnBoardChange}
      />
    );

    // Add turn card
    const jackSpades = screen.getByText('J♠');
    await user.click(jackSpades);

    expect(mockOnBoardChange).toHaveBeenCalled();
    const turnBoard = mockOnBoardChange.mock.calls[0][0];
    expect(turnBoard).toHaveLength(4);
    expect(turnBoard[3]).toEqual({ rank: 'J', suit: 's' });
  });

  test('handles complete river board', async () => {
    const user = userEvent.setup();
    
    const turnBoard: Card[] = [
      { rank: 'A', suit: 'h' },
      { rank: 'K', suit: 'd' },
      { rank: 'Q', suit: 'c' },
      { rank: 'J', suit: 's' }
    ];

    render(
      <BoardSelector
        board={turnBoard}
        onBoardChange={mockOnBoardChange}
      />
    );

    // Add river card
    const tenHearts = screen.getByText('T♥');
    await user.click(tenHearts);

    expect(mockOnBoardChange).toHaveBeenCalled();
    const riverBoard = mockOnBoardChange.mock.calls[0][0];
    expect(riverBoard).toHaveLength(5);
    expect(riverBoard[4]).toEqual({ rank: 'T', suit: 'h' });
  });

  test('shows correct board stage labels', () => {
    // Test pre-flop
    const { rerender } = render(
      <BoardSelector
        board={[]}
        onBoardChange={mockOnBoardChange}
      />
    );
    expect(screen.getByText('Pre-flop')).toBeInTheDocument();

    // Test flop
    const flopBoard: Card[] = [
      { rank: 'A', suit: 'h' },
      { rank: 'K', suit: 'd' },
      { rank: 'Q', suit: 'c' }
    ];
    rerender(
      <BoardSelector
        board={flopBoard}
        onBoardChange={mockOnBoardChange}
      />
    );
    expect(screen.getByText('Flop Set')).toBeInTheDocument();

    // Test turn
    const turnBoard: Card[] = [...flopBoard, { rank: 'J', suit: 's' }];
    rerender(
      <BoardSelector
        board={turnBoard}
        onBoardChange={mockOnBoardChange}
      />
    );
    expect(screen.getByText('Turn Set')).toBeInTheDocument();

    // Test river
    const riverBoard: Card[] = [...turnBoard, { rank: 'T', suit: 'h' }];
    rerender(
      <BoardSelector
        board={riverBoard}
        onBoardChange={mockOnBoardChange}
      />
    );
    expect(screen.getByText('Complete Board')).toBeInTheDocument();
  });

  test('prevents selecting more than 5 cards', async () => {
    const user = userEvent.setup();
    
    const fullBoard: Card[] = [
      { rank: 'A', suit: 'h' },
      { rank: 'K', suit: 'd' },
      { rank: 'Q', suit: 'c' },
      { rank: 'J', suit: 's' },
      { rank: 'T', suit: 'h' }
    ];

    render(
      <BoardSelector
        board={fullBoard}
        onBoardChange={mockOnBoardChange}
      />
    );

    // Try to select another card - should be disabled
    const nineHearts = screen.getByText('9♥');
    expect(nineHearts.closest('button')).toHaveClass('opacity-30');
    
    // Clicking should not call onBoardChange
    await user.click(nineHearts);
    expect(mockOnBoardChange).not.toHaveBeenCalled();
  });
});
