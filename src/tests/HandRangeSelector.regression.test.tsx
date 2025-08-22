import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HandRangeSelector from '../components/HandRangeSelector';
import { Player } from '../types/poker';

// Mock the handStrength module to avoid dependency issues
vi.mock('../poker/handStrength', () => ({
  getTopPercentHands: vi.fn(() => ['AA', 'KK', 'QQ']),
  getRangeLabel: vi.fn(() => 'Test Range'),
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

describe('HandRangeSelector - Regression Tests', () => {
  const mockPlayer: Player = {
    id: 'test-player',
    name: 'Test Player',
    position: 'UTG',
    range: ['AA', 'KK'],
    isHero: false,
    isActive: true,
    seatNumber: 1
  };

  const defaultProps = {
    selectedRange: ['AA', 'KK'],
    onRangeChange: vi.fn(),
    player: mockPlayer
  };

  it('renders without crashing', () => {
    expect(() => {
      render(<HandRangeSelector {...defaultProps} />);
    }).not.toThrow();
  });

  it('displays player information correctly', () => {
    render(<HandRangeSelector {...defaultProps} />);
    
    expect(screen.getByText('Test Player')).toBeInTheDocument();
    expect(screen.getByText(/UTG/)).toBeInTheDocument();
    expect(screen.getByText(/3 hands/)).toBeInTheDocument();
  });

  it('displays the percentage slider', () => {
    render(<HandRangeSelector {...defaultProps} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '100');
  });

  it('displays quick preset buttons', () => {
    render(<HandRangeSelector {...defaultProps} />);
    
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Ultra-tight')).toBeInTheDocument();
    expect(screen.getByText('Tight')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Loose')).toBeInTheDocument();
    expect(screen.getByText('Any Two')).toBeInTheDocument();
  });

  it('displays the hand matrix grid', () => {
    render(<HandRangeSelector {...defaultProps} />);
    
    // Should have 169 hand buttons (13x13 grid)
    const handButtons = screen.getAllByRole('button').filter(button => 
      button.getAttribute('title')?.includes('Pocket Pair') ||
      button.getAttribute('title')?.includes('Suited') ||
      button.getAttribute('title')?.includes('Offsuit')
    );
    
    expect(handButtons.length).toBe(169);
  });

  it('displays selection summary', () => {
    render(<HandRangeSelector {...defaultProps} />);
    
    expect(screen.getByText(/3 hands/)).toBeInTheDocument();
    expect(screen.getByText(/5%/)).toBeInTheDocument();
  });

  it('handles missing player prop gracefully', () => {
    const propsWithoutPlayer = {
      selectedRange: ['AA'],
      onRangeChange: vi.fn()
    };

    expect(() => {
      render(<HandRangeSelector {...propsWithoutPlayer} />);
    }).not.toThrow();
  });

  it('handles empty range gracefully', () => {
    const propsWithEmptyRange = {
      ...defaultProps,
      selectedRange: []
    };

    expect(() => {
      render(<HandRangeSelector {...propsWithEmptyRange} />);
    }).not.toThrow();
  });

  it('displays clear button', () => {
    render(<HandRangeSelector {...defaultProps} />);
    
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('displays legend section', () => {
    render(<HandRangeSelector {...defaultProps} />);
    
    expect(screen.getByText('Legend')).toBeInTheDocument();
    expect(screen.getByText('Pairs')).toBeInTheDocument();
    expect(screen.getByText('Suited')).toBeInTheDocument();
    expect(screen.getByText('Offsuit')).toBeInTheDocument();
  });

  it('has proper layout structure', () => {
    const { container } = render(<HandRangeSelector {...defaultProps} />);
    
    // Should have the two-column layout
    const layoutContainer = container.firstChild as HTMLElement;
    expect(layoutContainer).toHaveClass('h-full', 'flex');
    
    // Should have left sidebar and right grid
    const children = layoutContainer.children;
    expect(children.length).toBe(2);
  });
});
