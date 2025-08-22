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
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  
  // Calculate current range statistics
  const rangeStats = getRangeStats(selectedRange);
  const [sliderValue, setSliderValue] = useState<number>(rangeStats.percentage);

  // Sync slider value when range changes externally (e.g., from preset buttons)
  useEffect(() => {
    setSliderValue(rangeStats.percentage);
  }, [rangeStats.percentage]);

  // Detect touch capability on mount
  useEffect(() => {
    const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (hasTouchSupport) {
      // Don't immediately set as touch device - wait for actual touch event
      // This allows hybrid devices (like Surface) to use mouse when preferred
    }
  }, []);

  // Handle global mouse up and touch end to end dragging
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (!isTouchDevice) {
        setIsDragging(false);
      }
    };

    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
    };

    const handleGlobalMouseMove = () => {
      // If mouse is used after touch, allow switching back to mouse mode
      if (isTouchDevice && !isDragging) {
        setIsTouchDevice(false);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('touchend', handleGlobalTouchEnd);
    document.addEventListener('touchcancel', handleGlobalTouchEnd);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, [isTouchDevice, isDragging]);

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

  const handleMouseDown = (hand: string, e: React.MouseEvent) => {
    // Prevent mouse events on touch devices to avoid double handling
    if (isTouchDevice) {
      e.preventDefault();
      return;
    }
    
    const isSelected = isHandSelected(hand);
    setIsDragging(true);
    setDragSelecting(!isSelected); // If currently selected, we'll deselect; if not selected, we'll select
    
    // Toggle the current hand
    toggleHand(hand);
  };

  // Shared logic for drag selection (used by both mouse and touch)
  const handleDragSelection = (hand: string) => {
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

  const handleMouseEnter = (hand: string) => {
    // Prevent mouse events on touch devices to avoid double handling
    if (isTouchDevice) return;
    handleDragSelection(hand);
  };

  const handleMouseUp = () => {
    // Prevent mouse events on touch devices to avoid double handling
    if (isTouchDevice) return;
    setIsDragging(false);
  };

  // Touch event handlers for mobile drag selection
  const handleTouchStart = (hand: string, e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
    setIsTouchDevice(true); // Mark this as a touch device
    
    const isSelected = isHandSelected(hand);
    setIsDragging(true);
    setDragSelecting(!isSelected);
    
    // Toggle the current hand
    toggleHand(hand);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    e.preventDefault(); // Prevent scrolling
    
    // Get the element under the touch point
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
    
    if (element && element.dataset && element.dataset.hand) {
      handleDragSelection(element.dataset.hand);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const clearRange = () => {
    onRangeChange([]);
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


  return (
    <div className="h-full flex flex-col">
      {/* Mobile Layout: Player Info at top */}
      <div className="lg:hidden mb-4">
        {/* Player Info Card - Mobile Top */}
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
      </div>

      {/* Main Content Area - Swapped layout: Grid left, Controls right */}
      <div className="flex-1 flex flex-col lg:flex-row gap-2">
        {/* Left Panel - Hand Matrix Grid */}
        <div className="flex-1 flex justify-center items-start">
          <div className="relative w-full max-w-2xl mt-1">
            {/* Outer glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl blur-xl"></div>
            
            {/* Matrix container */}
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-3xl p-2 sm:p-4 border border-slate-600/50 shadow-2xl">
              <div className="w-full aspect-square">
                <div 
                  className="gap-0.5 sm:gap-1 w-full h-full"
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
                      data-hand={hand}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleMouseDown(hand, e);
                      }}
                      onMouseEnter={() => handleMouseEnter(hand)}
                      onMouseUp={handleMouseUp}
                      onTouchStart={(e) => handleTouchStart(hand, e)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      className={`
                        w-full h-full text-xs sm:text-sm font-bold rounded-md sm:rounded-lg border-2 transition-all duration-200
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

        {/* Right Panel - Controls (Desktop) */}
        <div className="hidden lg:block lg:w-72 space-y-2">
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
                className="btn-preset-premium btn-xs"
              >
                Premium
                <div className="text-xs opacity-80">{PRESET_PERCENTAGES.PREMIUM}%</div>
              </button>
              <button 
                onClick={() => setPercentageRange(PRESET_PERCENTAGES.ULTRA_TIGHT)} 
                className="btn-preset-ultra-tight btn-xs"
              >
                Ultra-tight
                <div className="text-xs opacity-80">{PRESET_PERCENTAGES.ULTRA_TIGHT}%</div>
              </button>
              <button 
                onClick={() => setPercentageRange(PRESET_PERCENTAGES.TIGHT)} 
                className="btn-preset-tight btn-xs"
              >
                Tight
                <div className="text-xs opacity-80">{PRESET_PERCENTAGES.TIGHT}%</div>
              </button>
              <button 
                onClick={() => setPercentageRange(PRESET_PERCENTAGES.MEDIUM)} 
                className="btn-preset-medium btn-xs"
              >
                Medium
                <div className="text-xs opacity-80">{PRESET_PERCENTAGES.MEDIUM}%</div>
              </button>
              <button 
                onClick={() => setPercentageRange(PRESET_PERCENTAGES.LOOSE)} 
                className="btn-preset-loose btn-xs"
              >
                Loose
                <div className="text-xs opacity-80">{PRESET_PERCENTAGES.LOOSE}%</div>
              </button>
              <button 
                onClick={() => setPercentageRange(100)}
                className="btn-preset-any-two btn-xs"
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
                className="w-full btn-danger btn-sm"
              >
                Clear All Hands
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout: Controls at bottom */}
      <div className="lg:hidden space-y-2 mt-4">
        {/* Range Size Control - Mobile */}
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

        {/* Quick Presets - Mobile */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-slate-600/50 shadow-lg">
          <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            Quick Presets
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setPercentageRange(PRESET_PERCENTAGES.PREMIUM)} 
              className="btn-preset-premium btn-xs"
            >
              Premium
              <div className="text-xs opacity-80">{PRESET_PERCENTAGES.PREMIUM}%</div>
            </button>
            <button 
              onClick={() => setPercentageRange(PRESET_PERCENTAGES.ULTRA_TIGHT)} 
              className="btn-preset-ultra-tight btn-xs"
            >
              Ultra-tight
              <div className="text-xs opacity-80">{PRESET_PERCENTAGES.ULTRA_TIGHT}%</div>
            </button>
            <button 
              onClick={() => setPercentageRange(PRESET_PERCENTAGES.TIGHT)} 
              className="btn-preset-tight btn-xs"
            >
              Tight
              <div className="text-xs opacity-80">{PRESET_PERCENTAGES.TIGHT}%</div>
            </button>
            <button 
              onClick={() => setPercentageRange(PRESET_PERCENTAGES.MEDIUM)} 
              className="btn-preset-medium btn-xs"
            >
              Medium
              <div className="text-xs opacity-80">{PRESET_PERCENTAGES.MEDIUM}%</div>
            </button>
            <button 
              onClick={() => setPercentageRange(PRESET_PERCENTAGES.LOOSE)} 
              className="btn-preset-loose btn-xs"
            >
              Loose
              <div className="text-xs opacity-80">{PRESET_PERCENTAGES.LOOSE}%</div>
            </button>
            <button 
              onClick={() => setPercentageRange(100)}
              className="btn-preset-any-two btn-xs"
            >
              Any Two
              <div className="text-xs opacity-80">100%</div>
            </button>
          </div>
        </div>

        {/* Clear button - Mobile */}
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-xl p-3 border border-slate-600/30">
          <button 
            onClick={clearRange}
            className="w-full btn-danger btn-sm"
          >
            Clear All Hands
          </button>
        </div>
      </div>
    </div>
  );
};

export default HandRangeSelector;