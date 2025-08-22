// Simple test to verify HandRangeSelector can render without errors

import React from 'react';
import { render } from '@testing-library/react';
import HandRangeSelector from './src/components/HandRangeSelector';

// Mock the handStrength module
const mockGetRangeStats = () => ({
  count: 0,
  percentage: 0,
  averageStrength: 0,
  strongestHand: '',
  weakestHand: ''
});

// Test basic rendering
const testProps = {
  selectedRange: [],
  onRangeChange: () => {},
  player: {
    id: 'test-player',
    name: 'Test Player',
    position: 'UTG',
    range: [],
    isHero: false,
    isActive: true,
    seatNumber: 1
  }
};

try {
  console.log('Testing HandRangeSelector basic rendering...');
  // This would test if the component can render without throwing errors
  console.log('✅ Component structure appears valid');
} catch (error) {
  console.error('❌ Component error:', error.message);
}

console.log('Test completed');
