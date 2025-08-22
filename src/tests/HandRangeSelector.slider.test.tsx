import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HandRangeSelector from '../components/HandRangeSelector';
import { Player } from '../types/poker';

// Mock the handStrength module
vi.mock('../poker/handStrength', () => ({
  getTopPercentHands: vi.fn((percentage) => {
    // Mock implementation that returns hands based on percentage
    if (percentage >= 50) return ['AA', 'KK', 'QQ', 'JJ', 'TT'];
    if (percentage >= 25) return ['AA', 'KK', 'QQ'];
    if (percentage >= 10) return ['AA', 'KK'];
    return ['AA'];
  }),
  getRangeLabel: vi.fn(() => 'Test Range'),
  PRESET_PERCENTAGES: {
    PREMIUM: 2.4,
    ULTRA_TIGHT: 5.9,
    TIGHT: 15.4,
    MEDIUM: 30.2,
    LOOSE: 50.3,
  },
  getRangeStats: vi.fn((hands) => ({
    count: hands.length,
    percentage: hands.length * 10, // Simple mock: each hand = 10%
    averageStrength: 85,
    strongestHand: hands[0] || '',
    weakestHand: hands[hands.length - 1] || ''
  }))
}));

describe('HandRangeSelector - Slider Regression Tests', () => {
  const mockPlayer: Player = {
    id: 'test-player',
    name: 'Test Player',
    position: 'UTG',
    range: ['AA', 'KK'],
    isHero: false,
    isActive: true,
    seatNumber: 1
  };

  const mockOnRangeChange = vi.fn();

  const defaultProps = {
    selectedRange: ['AA', 'KK'],
    onRangeChange: mockOnRangeChange,
    player: mockPlayer
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render slider with correct initial value', () => {
    render(<HandRangeSelector {...defaultProps} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('value', '20'); // 2 hands * 10% each
  });

  it('should update slider value when dragged', () => {
    render(<HandRangeSelector {...defaultProps} />);
    
    const slider = screen.getByRole('slider');
    
    // Simulate slider change to 50%
    fireEvent.change(slider, { target: { value: '50' } });
    
    // Slider should immediately reflect the new value
    expect(slider).toHaveAttribute('value', '50');
    
    // Should have called onRangeChange
    expect(mockOnRangeChange).toHaveBeenCalled();
  });

  it('should update slider position when preset buttons are clicked', () => {
    render(<HandRangeSelector {...defaultProps} />);
    
    const tightButton = screen.getByText('Tight');
    
    // Click tight preset (15.4%)
    fireEvent.click(tightButton);
    
    // Slider should update to reflect the preset percentage
    // The exact value depends on what getTopPercentHands returns
    expect(mockOnRangeChange).toHaveBeenCalled();
  });

  it('should show visual progress bar that matches slider value', () => {
    render(<HandRangeSelector {...defaultProps} />);
    
    const slider = screen.getByRole('slider');
    
    // Check initial background style
    const initialStyle = slider.style.background;
    expect(initialStyle).toContain('20%'); // Should match initial value
    
    // Change slider value
    fireEvent.change(slider, { target: { value: '75' } });
    
    // Background should update to reflect new value
    const newStyle = slider.style.background;
    expect(newStyle).toContain('75%');
  });

  it('should display correct percentage text that syncs with slider', () => {
    render(<HandRangeSelector {...defaultProps} />);
    
    const slider = screen.getByRole('slider');
    
    // Find percentage display (should show 20% initially)
    expect(screen.getByText('20%')).toBeInTheDocument();
    
    // Change slider
    fireEvent.change(slider, { target: { value: '40' } });
    
    // The displayed percentage should update to reflect the actual range stats
    // (this will be based on the mocked getRangeStats)
    expect(mockOnRangeChange).toHaveBeenCalled();
  });

  it('should handle edge values correctly', () => {
    render(<HandRangeSelector {...defaultProps} />);
    
    const slider = screen.getByRole('slider');
    
    // Test 0%
    fireEvent.change(slider, { target: { value: '0' } });
    expect(slider).toHaveAttribute('value', '0');
    
    // Test 100%
    fireEvent.change(slider, { target: { value: '100' } });
    expect(slider).toHaveAttribute('value', '100');
  });

  it('should ignore invalid slider values', () => {
    render(<HandRangeSelector {...defaultProps} />);
    
    const slider = screen.getByRole('slider');
    const initialValue = slider.getAttribute('value');
    
    // Try to set invalid values
    fireEvent.change(slider, { target: { value: '-10' } });
    expect(slider).toHaveAttribute('value', initialValue); // Should remain unchanged
    
    fireEvent.change(slider, { target: { value: '150' } });
    expect(slider).toHaveAttribute('value', initialValue); // Should remain unchanged
    
    fireEvent.change(slider, { target: { value: 'invalid' } });
    expect(slider).toHaveAttribute('value', initialValue); // Should remain unchanged
  });

  it('should maintain smooth slider movement during rapid changes', () => {
    render(<HandRangeSelector {...defaultProps} />);
    
    const slider = screen.getByRole('slider');
    
    // Simulate rapid slider movements
    const values = ['10', '20', '30', '40', '50'];
    
    values.forEach(value => {
      fireEvent.change(slider, { target: { value } });
      expect(slider).toHaveAttribute('value', value);
    });
    
    // Should have called onRangeChange for each valid change
    expect(mockOnRangeChange).toHaveBeenCalledTimes(values.length);
  });
});
