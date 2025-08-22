import React, { useState, useEffect } from 'react';
import { HandRange, Player } from '../types/poker';
import { 
  getTopPercentHands, 
  getRangeLabel, 
  PRESET_PERCENTAGES,
  getRangeStats
} from '../poker/handStrength';

interface HandRangeSelectorProps {
  selectedRange: HandRange;
  onRangeChange: (range: HandRange) => void;
  player?: Player;
}

// Display ranks in order for the matrix
const DISPLAY_RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;

const HandRangeSelector: React.FC<HandRangeSelectorProps> = ({
  selectedRange,
  onRangeChange,
  player,
}) => {

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragSelecting, setDragSelecting] = useState<boolean>(true); // true = selecting, false = deselecting
  
  // Calculate current range statistics
  const rangeStats = getRangeStats(selectedRange);
  const [sliderValue, setSliderValue] = useState<number>(rangeStats.percentage);

  // Sync slider value when range changes externally (e.g., from preset buttons)
  useEffect(() => {
    setSliderValue(rangeStats.percentage);
  }, [rangeStats.percentage]);

  // Handle global mouse up to end dragging
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Generate hand matrix
  const generateHandMatrix = () => {
    const matrix: string[][] = [];
    
    for (let i = 0; i < DISPLAY_RANKS.length; i++) {
      const row: string[] = [];
      for (let j = 0; j < DISPLAY_RANKS.length; j++) {
        const rank1 = DISPLAY_RANKS[i];
        const rank2 = DISPLAY_RANKS[j];
        
        if (i === j) {
          // Pocket pairs on diagonal
          row.push(`${rank1}${rank2}`);
        } else if (i < j) {
          // Suited hands above diagonal
          row.push(`${rank1}${rank2}s`);
        } else {
          // Offsuit hands below diagonal (higher rank first)
          row.push(`${rank2}${rank1}o`);
        }
      }
      matrix.push(row);
    }
    
    return matrix;
  };

  const handMatrix = generateHandMatrix();

  const isHandSelected = (hand: string): boolean => {
    return selectedRange.includes(hand);
  };

  const toggleHand = (hand: string) => {
    let newRange: HandRange;
    if (isHandSelected(hand)) {
      newRange = selectedRange.filter(h => h !== hand);
    } else {
      newRange = [...selectedRange, hand];
    }
    onRangeChange(newRange);
  };

  const handleMouseDown = (hand: string) => {
    const isSelected = isHandSelected(hand);
    setIsDragging(true);
    setDragSelecting(!isSelected); // If currently selected, we'll deselect; if not selected, we'll select
    
    // Toggle the current hand
    toggleHand(hand);
  };

  const handleMouseEnter = (hand: string) => {
    if (!isDragging) return;
    
    const isSelected = isHandSelected(hand);
    
    // Only modify if the current state doesn't match what we want
    if (dragSelecting && !isSelected) {
      // We're selecting and this hand isn't selected
      const newRange = [...selectedRange, hand];
      onRangeChange(newRange);
    } else if (!dragSelecting && isSelected) {
      // We're deselecting and this hand is selected
      const newRange = selectedRange.filter(h => h !== hand);
      onRangeChange(newRange);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const clearRange = () => {
    onRangeChange([]);
  };

  // Generate all possible hands for "Any Two" range
  const generateAllHands = (): HandRange => {
    const allHands: HandRange = [];
    
    // Add all pocket pairs
    for (const rank of DISPLAY_RANKS) {
      allHands.push(`${rank}${rank}`);
    }
    
    // Add all suited and offsuit combinations
    for (let i = 0; i < DISPLAY_RANKS.length; i++) {
      for (let j = i + 1; j < DISPLAY_RANKS.length; j++) {
        const rank1 = DISPLAY_RANKS[i];
        const rank2 = DISPLAY_RANKS[j];
        allHands.push(`${rank1}${rank2}s`); // Suited
        allHands.push(`${rank1}${rank2}o`); // Offsuit
      }
    }
    
    return allHands;
  };

  const setPresetRange = (preset: 'tight' | 'loose' | 'any-two') => {
    let presetRange: HandRange = [];
    
    switch (preset) {
      case 'tight':
        presetRange = getTopPercentHands(PRESET_PERCENTAGES.TIGHT);
        break;
        
      case 'loose':
        presetRange = getTopPercentHands(PRESET_PERCENTAGES.LOOSE);
        break;
        
      case 'any-two':
        presetRange = getTopPercentHands(100);
        break;
    }
    
    onRangeChange(presetRange);
  };

  const setPercentageRange = (percentage: number) => {
    if (percentage >= 0 && percentage <= 100) {
      const topHands = getTopPercentHands(percentage);
      onRangeChange(topHands);
    }
  };

  const handlePercentageInputChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setSliderValue(numValue); // Update slider immediately for smooth movement
      setPercentageRange(numValue);
    }
    // Invalid values are ignored - slider keeps its current value
  };

  const getDisplayTitle = () => {
    if (player) {
      return `Select Hand Range - ${player.name}`;
    }
    return 'Select Hand Range';
  };

  const getDisplaySubtitle = () => {
    if (player) {
      return `${player.position} • ${rangeStats.combinations} combinations (${rangeStats.percentage}%)`;
    }
    return `${rangeStats.combinations} combinations (${rangeStats.percentage}%)`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Main Content Area - Swapped layout: Grid left, Controls right */}
      <div className="flex-1 flex flex-col lg:flex-row gap-2">
        {/* Left Panel - Hand Matrix Grid */}
        <div className="flex-1 flex justify-center items-start">
          <div className="relative w-full max-w-2xl mt-1">
            {/* Outer glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl blur-xl"></div>
            
            {/* Matrix container */}
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-3xl p-4 border border-slate-600/50 shadow-2xl">
              <div className="w-full aspect-square">
                <div 
                  className="gap-1 w-full h-full"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(13, minmax(0, 1fr))',
                    gridTemplateRows: 'repeat(13, minmax(0, 1fr))',
                  }}
                >
                {handMatrix.map((row, i) =>
                  row.map((hand, j) => (
                    <button
                      key={`${i}-${j}`}
                      onClick={() => toggleHand(hand)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleMouseDown(hand);
                      }}
                      onMouseEnter={() => handleMouseEnter(hand)}
                      onMouseUp={handleMouseUp}
                      className={`
                        w-full h-full text-xs sm:text-sm font-bold rounded-lg border-2 transition-all duration-200
                        flex items-center justify-center cursor-pointer select-none shadow-sm
                        ${isHandSelected(hand)
                          ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white border-purple-300 shadow-lg shadow-purple-500/30'
                          : i === j 
                            ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white border-slate-500 hover:from-slate-600 hover:to-slate-700 hover:border-slate-400 hover:shadow-lg'
                            : i < j
                              ? 'bg-gradient-to-br from-slate-600 to-slate-700 text-blue-300 border-slate-500 hover:from-slate-500 hover:to-slate-600 hover:border-slate-400 hover:shadow-lg'
                              : 'bg-gradient-to-br from-slate-600 to-slate-700 text-green-300 border-slate-500 hover:from-slate-500 hover:to-slate-600 hover:border-slate-400 hover:shadow-lg'
                        }
                        ${isHandSelected(hand) ? '' : 'hover:scale-105'}
                      `}
                      title={`${hand} - ${i === j ? 'Pocket Pair' : i < j ? 'Suited' : 'Offsuit'}`}
                    >
                      <span className="leading-none drop-shadow-sm">{hand}</span>
                    </button>
                  ))
                )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Controls */}
        <div className="lg:w-72 space-y-2">
          {/* Player Info Card */}
          {player && (
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-slate-600/50 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-100 flex items-center">
                  {player.isHero && <span className="mr-2">👑</span>}
                  {player.name} • <span className="text-sm text-slate-300 font-normal">{player.position}</span>
                </h3>
              </div>
              
              {/* Range Stats */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className="text-lg font-semibold text-blue-400">{rangeStats.combinations}</div>
                  <div className="text-xs text-slate-400">Combinations</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className="text-lg font-semibold text-green-400">{rangeStats.count}</div>
                  <div className="text-xs text-slate-400">Hand Types</div>
                </div>
              </div>
              
              {rangeStats.count > 0 && (
                <div className="mt-3 p-2 bg-slate-700/30 rounded-lg">
                  <div className="text-xs text-slate-300 text-center">
                    <span className="font-semibold text-purple-400">{getRangeLabel(rangeStats.percentage)}</span>
                    <div className="text-slate-400 mt-1">
                      {rangeStats.strongestHand} ↔ {rangeStats.weakestHand}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Percentage Control */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-slate-600/50 shadow-lg">
            <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
              Range Size Control
            </h4>
            
            <div className="space-y-3">
              {/* Enhanced slider */}
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={sliderValue}
                  onChange={(e) => handlePercentageInputChange(e.target.value)}
                  className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${sliderValue}%, #374151 ${sliderValue}%, #374151 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>Tight (0%)</span>
                  <span>Balanced (50%)</span>
                  <span>Loose (100%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-slate-600/50 shadow-lg">
            <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Quick Presets
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setPercentageRange(PRESET_PERCENTAGES.PREMIUM)} 
                className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg text-xs font-medium transition-all duration-200 shadow-lg"
              >
                Premium
                <div className="text-xs opacity-80">{PRESET_PERCENTAGES.PREMIUM}%</div>
              </button>
              <button 
                onClick={() => setPercentageRange(PRESET_PERCENTAGES.ULTRA_TIGHT)} 
                className="px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white rounded-lg text-xs font-medium transition-all duration-200 shadow-lg"
              >
                Ultra-tight
                <div className="text-xs opacity-80">{PRESET_PERCENTAGES.ULTRA_TIGHT}%</div>
              </button>
              <button 
                onClick={() => setPercentageRange(PRESET_PERCENTAGES.TIGHT)} 
                className="px-3 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-lg text-xs font-medium transition-all duration-200 shadow-lg"
              >
                Tight
                <div className="text-xs opacity-80">{PRESET_PERCENTAGES.TIGHT}%</div>
              </button>
              <button 
                onClick={() => setPercentageRange(PRESET_PERCENTAGES.MEDIUM)} 
                className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg text-xs font-medium transition-all duration-200 shadow-lg"
              >
                Medium
                <div className="text-xs opacity-80">{PRESET_PERCENTAGES.MEDIUM}%</div>
              </button>
              <button 
                onClick={() => setPercentageRange(PRESET_PERCENTAGES.LOOSE)} 
                className="px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-lg text-xs font-medium transition-all duration-200 shadow-lg"
              >
                Loose
                <div className="text-xs opacity-80">{PRESET_PERCENTAGES.LOOSE}%</div>
              </button>
              <button 
                onClick={() => setPercentageRange(100)}
                className="px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-lg text-xs font-medium transition-all duration-200 shadow-lg"
              >
                Any Two
                <div className="text-xs opacity-80">100%</div>
              </button>
            </div>
          </div>

          {/* Legend & Actions */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-xl p-3 border border-slate-600/30">
            <div className="space-y-3">
              {/* Clear button */}
              <button 
                onClick={clearRange}
                className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg"
              >
                Clear All Hands
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandRangeSelector;