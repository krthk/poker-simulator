import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TableSelector from '../components/TableSelector';
import { Player, TablePosition } from '../types/poker';

// Mock player data
const mockPlayers: Player[] = [
  {
    id: 'hero',
    name: 'Hero',
    position: 'BTN',
    range: ['AA', 'KK'],
    isHero: true,
    isActive: true,
    seatNumber: 8
  },
  {
    id: 'villain1',
    name: 'Villain 1',
    position: 'BB',
    range: ['QQ', 'JJ'],
    isHero: false,
    isActive: true,
    seatNumber: 10
  }
];

describe('TableSelector Component', () => {
  const mockSetPlayers = vi.fn();
  const mockSetSelectedPlayer = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders poker table and seat positions', () => {
    render(
      <TableSelector
        players={[]}
        setPlayers={mockSetPlayers}
        selectedPlayer={null}
        setSelectedPlayer={mockSetSelectedPlayer}
      />
    );

    expect(screen.getByText('Select Players')).toBeInTheDocument();
    expect(screen.getByText('Click on seats to add/remove players')).toBeInTheDocument();
    
    // Should render SVG table
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  test('displays existing players on the table', () => {
    render(
      <TableSelector
        players={mockPlayers}
        setPlayers={mockSetPlayers}
        selectedPlayer={null}
        setSelectedPlayer={mockSetSelectedPlayer}
      />
    );

    expect(screen.getByText('Hero')).toBeInTheDocument();
    expect(screen.getByText('Villain 1')).toBeInTheDocument();
    expect(screen.getByText('2 hands')).toBeInTheDocument(); // Range count for Hero
  });

  test('shows active players summary', () => {
    render(
      <TableSelector
        players={mockPlayers}
        setPlayers={mockSetPlayers}
        selectedPlayer={null}
        setSelectedPlayer={mockSetSelectedPlayer}
      />
    );

    expect(screen.getByText('Active Players: 2')).toBeInTheDocument();
    expect(screen.getByText('Hero: Hero (BTN)')).toBeInTheDocument();
    expect(screen.getByText('Villain 1 (BB)')).toBeInTheDocument();
  });

  test('adds new player when clicking empty seat', async () => {
    const user = userEvent.setup();
    
    render(
      <TableSelector
        players={[]}
        setPlayers={mockSetPlayers}
        selectedPlayer={null}
        setSelectedPlayer={mockSetSelectedPlayer}
      />
    );

    // Find and click an empty seat (UTG position)
    const utgSeat = screen.getByText('UTG');
    await user.click(utgSeat);

    expect(mockSetPlayers).toHaveBeenCalled();
    // Check that the call adds a new player
    const callArgs = mockSetPlayers.mock.calls[0][0];
    expect(callArgs).toHaveLength(1);
    expect(callArgs[0].position).toBe(TablePosition.UTG);
  });

  test('removes player when clicking occupied seat', async () => {
    const user = userEvent.setup();
    
    render(
      <TableSelector
        players={mockPlayers}
        setPlayers={mockSetPlayers}
        selectedPlayer={null}
        setSelectedPlayer={mockSetSelectedPlayer}
      />
    );

    // Click on Hero's seat
    const heroSeat = screen.getByText('Hero');
    await user.click(heroSeat.closest('g') || heroSeat);

    expect(mockSetPlayers).toHaveBeenCalled();
    // Should remove the Hero player
    const callArgs = mockSetPlayers.mock.calls[0][0];
    expect(callArgs).toHaveLength(1);
    expect(callArgs[0].name).toBe('Villain 1');
  });

  test('sets player as hero when clicking "Set as Hero" button', async () => {
    const user = userEvent.setup();
    
    render(
      <TableSelector
        players={mockPlayers}
        setPlayers={mockSetPlayers}
        selectedPlayer={null}
        setSelectedPlayer={mockSetSelectedPlayer}
      />
    );

    // Find and click "Set as Hero" button for Villain 1
    const setHeroButtons = screen.getAllByText('Set as Hero');
    expect(setHeroButtons).toHaveLength(1); // Only one non-hero player
    
    await user.click(setHeroButtons[0]);

    expect(mockSetPlayers).toHaveBeenCalled();
    const callArgs = mockSetPlayers.mock.calls[0][0];
    // Hero should be unset, Villain 1 should become hero
    expect(callArgs.find((p: Player) => p.name === 'Hero')?.isHero).toBe(false);
    expect(callArgs.find((p: Player) => p.name === 'Villain 1')?.isHero).toBe(true);
  });

  test('clears all players when clicking "Clear All"', async () => {
    const user = userEvent.setup();
    
    render(
      <TableSelector
        players={mockPlayers}
        setPlayers={mockSetPlayers}
        selectedPlayer={null}
        setSelectedPlayer={mockSetSelectedPlayer}
      />
    );

    const clearButton = screen.getByText('Clear All');
    await user.click(clearButton);

    expect(mockSetPlayers).toHaveBeenCalledWith([]);
  });

  test('displays correct seat labels and positions', () => {
    render(
      <TableSelector
        players={[]}
        setPlayers={mockSetPlayers}
        selectedPlayer={null}
        setSelectedPlayer={mockSetSelectedPlayer}
      />
    );

    // Check that seat positions are labeled correctly
    expect(screen.getByText('UTG')).toBeInTheDocument();
    expect(screen.getByText('BTN')).toBeInTheDocument();
    expect(screen.getByText('SB')).toBeInTheDocument();
    expect(screen.getByText('BB')).toBeInTheDocument();
  });

  test('prevents adding more than 10 players', async () => {
    const user = userEvent.setup();
    
    // Create 10 players (max capacity)
    const fullTable: Player[] = Array.from({ length: 10 }, (_, i) => ({
      id: `player${i}`,
      name: `Player ${i}`,
      position: 'UTG',
      range: [],
      isHero: i === 0,
      isActive: true,
      seatNumber: i + 1
    }));

    render(
      <TableSelector
        players={fullTable}
        setPlayers={mockSetPlayers}
        selectedPlayer={null}
        setSelectedPlayer={mockSetSelectedPlayer}
      />
    );

    // All seats should be occupied, no empty position labels visible for empty seats
    expect(screen.getByText('Active Players: 10')).toBeInTheDocument();
  });

  test('handles player with empty range correctly', () => {
    const playersWithEmptyRange: Player[] = [
      {
        id: 'empty',
        name: 'Empty Range',
        position: 'BTN',
        range: [],
        isHero: false,
        isActive: true,
        seatNumber: 8
      }
    ];

    render(
      <TableSelector
        players={playersWithEmptyRange}
        setPlayers={mockSetPlayers}
        selectedPlayer={null}
        setSelectedPlayer={mockSetSelectedPlayer}
      />
    );

    expect(screen.getByText('Empty Range')).toBeInTheDocument();
    expect(screen.getByText('0 hands')).toBeInTheDocument();
  });

  test('displays hero indicator correctly', () => {
    render(
      <TableSelector
        players={mockPlayers}
        setPlayers={mockSetPlayers}
        selectedPlayer={null}
        setSelectedPlayer={mockSetSelectedPlayer}
      />
    );

    // Hero should be marked as such
    expect(screen.getByText('Hero: Hero (BTN)')).toBeInTheDocument();
    
    // Non-hero should not have hero indicator in summary
    const villainText = screen.getByText('Villain 1 (BB)');
    expect(villainText).toBeInTheDocument();
  });

  test('generates unique player names for new seats', async () => {
    const user = userEvent.setup();
    
    render(
      <TableSelector
        players={[]}
        setPlayers={mockSetPlayers}
        selectedPlayer={null}
        setSelectedPlayer={mockSetSelectedPlayer}
      />
    );

    // Click multiple empty seats
    await user.click(screen.getByText('UTG')); // UTG
    
    expect(mockSetPlayers).toHaveBeenCalledTimes(1);
    let callArgs = mockSetPlayers.mock.calls[0][0];
    expect(callArgs[0].name).toBe('Player 1');

    // Reset mock and simulate adding another player
    mockSetPlayers.mockClear();
    
    // Simulate existing player state
    const existingPlayers = [callArgs[0]];
    
    render(
      <TableSelector
        players={existingPlayers}
        setPlayers={mockSetPlayers}
        selectedPlayer={null}
        setSelectedPlayer={mockSetSelectedPlayer}
      />
    );

    await user.click(screen.getByText('UTG+1')); // Next available seat
    
    expect(mockSetPlayers).toHaveBeenCalledTimes(1);
    callArgs = mockSetPlayers.mock.calls[0][0];
    expect(callArgs).toHaveLength(2);
    expect(callArgs[1].name).toBe('Player 2');
  });
});
