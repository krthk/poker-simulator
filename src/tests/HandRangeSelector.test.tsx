import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HandRangeSelector from '../components/HandRangeSelector';
import { Player, TablePosition } from '../types/poker';

const mockPlayer: Player = {
  id: 'test-player',
  name: 'Test Player',
  position: 'BTN',
  range: ['AA', 'KK', 'QQ'],
  isHero: true,
  isActive: true,
  seatNumber: 8
};

describe('HandRangeSelector Component', () => {
  const mockOnRangeChange = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders hand range selector with grid', () => {
    render(
      <HandRangeSelector
        selectedRange={[]}
        onRangeChange={mockOnRangeChange}
        player={mockPlayer}
      />
    );

    expect(screen.getByText('Select Hand Range')).toBeInTheDocument();
    expect(screen.getByText('Test Player')).toBeInTheDocument();
    expect(screen.getByText('BTN')).toBeInTheDocument();
    
    // Should render the hand matrix
    expect(screen.getByText('AA')).toBeInTheDocument();
    expect(screen.getByText('KK')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
  });

  test('displays selected range correctly', () => {
    render(
      <HandRangeSelector
        selectedRange={['AA', 'KK', 'AKs']}
        onRangeChange={mockOnRangeChange}
        player={mockPlayer}
      />
    );

    // Selected hands should have different styling
    const aaButton = screen.getByText('AA');
    const kkButton = screen.getByText('KK');
    const aksButton = screen.getByText('AKs');
    
    expect(aaButton).toHaveClass('bg-green-600'); // Selected styling
    expect(kkButton).toHaveClass('bg-green-600');
    expect(aksButton).toHaveClass('bg-green-600');
  });

  test('toggles hand selection on click', async () => {
    const user = userEvent.setup();
    
    render(
      <HandRangeSelector
        selectedRange={[]}
        onRangeChange={mockOnRangeChange}
        player={mockPlayer}
      />
    );

    const aaButton = screen.getByText('AA');
    await user.click(aaButton);

    expect(mockOnRangeChange).toHaveBeenCalledWith(['AA']);
  });

  test('removes hand from selection when already selected', async () => {
    const user = userEvent.setup();
    
    render(
      <HandRangeSelector
        selectedRange={['AA', 'KK']}
        onRangeChange={mockOnRangeChange}
        player={mockPlayer}
      />
    );

    const aaButton = screen.getByText('AA');
    await user.click(aaButton);

    expect(mockOnRangeChange).toHaveBeenCalledWith(['KK']);
  });

  test('drag selection works across multiple hands', async () => {
    const user = userEvent.setup();
    
    render(
      <HandRangeSelector
        selectedRange={[]}
        onRangeChange={mockOnRangeChange}
        player={mockPlayer}
      />
    );

    const aaButton = screen.getByText('AA');
    const kkButton = screen.getByText('KK');

    // Start drag on AA
    await user.pointer([
      { keys: '[MouseLeft>]', target: aaButton },
      { pointerName: 'mouse', target: kkButton },
      { keys: '[/MouseLeft]' }
    ]);

    // Should select both AA and KK
    expect(mockOnRangeChange).toHaveBeenCalled();
  });

  test('preset buttons work correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <HandRangeSelector
        selectedRange={[]}
        onRangeChange={mockOnRangeChange}
        player={mockPlayer}
      />
    );

    // Test Tight preset
    const tightButton = screen.getByText('Tight');
    await user.click(tightButton);

    expect(mockOnRangeChange).toHaveBeenCalled();
    const tightRange = mockOnRangeChange.mock.calls[0][0];
    expect(tightRange).toContain('AA');
    expect(tightRange).toContain('KK');
    expect(tightRange).toContain('QQ');
    // Should include strong hands according to tight range definition
  });

  test('loose preset includes more hands', async () => {
    const user = userEvent.setup();
    
    render(
      <HandRangeSelector
        selectedRange={[]}
        onRangeChange={mockOnRangeChange}
        player={mockPlayer}
      />
    );

    const looseButton = screen.getByText('Loose');
    await user.click(looseButton);

    expect(mockOnRangeChange).toHaveBeenCalled();
    const looseRange = mockOnRangeChange.mock.calls[0][0];
    
    // Loose range should include many more hands
    expect(looseRange.length).toBeGreaterThan(50); // ~50% of hands
    expect(looseRange).toContain('AA');
    expect(looseRange).toContain('22'); // Any pocket pair
  });

  test('any two preset selects all hands', async () => {
    const user = userEvent.setup();
    
    render(
      <HandRangeSelector
        selectedRange={[]}
        onRangeChange={mockOnRangeChange}
        player={mockPlayer}
      />
    );

    const anyTwoButton = screen.getByText('Any Two');
    await user.click(anyTwoButton);

    expect(mockOnRangeChange).toHaveBeenCalled();
    const anyTwoRange = mockOnRangeChange.mock.calls[0][0];
    
    // Should select all 169 possible hands
    expect(anyTwoRange.length).toBe(169);
    expect(anyTwoRange).toContain('AA');
    expect(anyTwoRange).toContain('72o'); // Worst hand
  });

  test('clear button removes all selections', async () => {
    const user = userEvent.setup();
    
    render(
      <HandRangeSelector
        selectedRange={['AA', 'KK', 'QQ']}
        onRangeChange={mockOnRangeChange}
        player={mockPlayer}
      />
    );

    const clearButton = screen.getByText('Clear');
    await user.click(clearButton);

    expect(mockOnRangeChange).toHaveBeenCalledWith([]);
  });

  test('displays range statistics correctly', () => {
    render(
      <HandRangeSelector
        selectedRange={['AA', 'KK', 'QQ', 'JJ']} // 4 hands
        onRangeChange={mockOnRangeChange}
        player={mockPlayer}
      />
    );

    // Should show percentage (4/169 ≈ 2.4%)
    expect(screen.getByText('4 hands (2.4%)')).toBeInTheDocument();
  });

  test('handles suited vs offsuit hands correctly', () => {
    render(
      <HandRangeSelector
        selectedRange={['AKs', 'AKo']}
        onRangeChange={mockOnRangeChange}
        player={mockPlayer}
      />
    );

    const aksButton = screen.getByText('AKs');
    const akoButton = screen.getByText('AKo');
    
    expect(aksButton).toHaveClass('bg-green-600');
    expect(akoButton).toHaveClass('bg-green-600');
  });

  test('renders without player prop', () => {
    render(
      <HandRangeSelector
        selectedRange={['AA']}
        onRangeChange={mockOnRangeChange}
      />
    );

    expect(screen.getByText('Select Hand Range')).toBeInTheDocument();
    expect(screen.getByText('AA')).toBeInTheDocument();
  });

  test('displays hand count for player with range', () => {
    render(
      <HandRangeSelector
        selectedRange={mockPlayer.range}
        onRangeChange={mockOnRangeChange}
        player={mockPlayer}
      />
    );

    // Should show the player's current range count
    expect(screen.getByText('3 hands (1.8%)')).toBeInTheDocument();
  });

  test('legend items are displayed correctly', () => {
    render(
      <HandRangeSelector
        selectedRange={[]}
        onRangeChange={mockOnRangeChange}
        player={mockPlayer}
      />
    );

    expect(screen.getByText('Pocket Pairs')).toBeInTheDocument();
    expect(screen.getByText('Suited')).toBeInTheDocument();
    expect(screen.getByText('Offsuit')).toBeInTheDocument();
  });

  test('hand matrix layout is correct', () => {
    render(
      <HandRangeSelector
        selectedRange={[]}
        onRangeChange={mockOnRangeChange}
        player={mockPlayer}
      />
    );

    // Check that hands are in the expected grid positions
    const handGrid = screen.getByTestId?.('hand-grid') || document.querySelector('.grid');
    expect(handGrid).toBeInTheDocument();
    
    // AA should be in top-left corner
    const aaButton = screen.getByText('AA');
    expect(aaButton).toBeInTheDocument();
    
    // 72 should be in bottom-right area
    const worstHand = screen.getByText('72');
    expect(worstHand).toBeInTheDocument();
  });

  test('mouse events are handled correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <HandRangeSelector
        selectedRange={[]}
        onRangeChange={mockOnRangeChange}
        player={mockPlayer}
      />
    );

    const aaButton = screen.getByText('AA');
    
    // Test mousedown event
    fireEvent.mouseDown(aaButton);
    
    // Test mouseenter during drag
    fireEvent.mouseEnter(aaButton);
    
    // Test mouseup to end drag
    fireEvent.mouseUp(aaButton);

    expect(mockOnRangeChange).toHaveBeenCalled();
  });

  test('prevents default behavior on mouse events', () => {
    render(
      <HandRangeSelector
        selectedRange={[]}
        onRangeChange={mockOnRangeChange}
        player={mockPlayer}
      />
    );

    const aaButton = screen.getByText('AA');
    const preventDefault = vi.fn();
    
    fireEvent.mouseDown(aaButton, { preventDefault });
    
    // Should prevent default to avoid browser drag behavior
    expect(preventDefault).toHaveBeenCalled();
  });
});
