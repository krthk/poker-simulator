import React, { useState, useEffect } from 'react';
import { HandRange } from '../types/poker';
import { RANKS } from '../poker/deck';

interface HandRangeSelectorProps {
  selectedRange: HandRange;
  onRangeChange: (range: HandRange) => void;
  label: string;
}

const HandRangeSelector: React.FC<HandRangeSelectorProps> = ({
  selectedRange,
  onRangeChange,
  label,
}) => {

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragSelecting, setDragSelecting] = useState<boolean>(true); // true = selecting, false = deselecting

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
    
    for (let i = 0; i < RANKS.length; i++) {
      const row: string[] = [];
      for (let j = 0; j < RANKS.length; j++) {
        const rank1 = RANKS[i];
        const rank2 = RANKS[j];
        
        if (i === j) {
          // Pocket pairs on diagonal
          row.push(`${rank1}${rank2}`);
        } else if (i < j) {
          // Suited hands above diagonal
          row.push(`${rank1}${rank2}s`);
        } else {
          // Offsuit hands below diagonal
          row.push(`${rank1}${rank2}o`);
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
    setTextInput(newRange.join(', '));
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



  const clearRange = () => {
    onRangeChange([]);
  };

  // Generate all possible hands for "Any Two" range
  const generateAllHands = (): HandRange => {
    const allHands: HandRange = [];
    
    // Add all pocket pairs
    for (const rank of RANKS) {
      allHands.push(`${rank}${rank}`);
    }
    
    // Add all suited and offsuit combinations
    for (let i = 0; i < RANKS.length; i++) {
      for (let j = i + 1; j < RANKS.length; j++) {
        const rank1 = RANKS[i];
        const rank2 = RANKS[j];
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
        // Tight Range (~9% of hands) - Premium hands only
        presetRange = [
          // Premium pairs
          'AA', 'KK', 'QQ', 'JJ', 'TT',
          // Premium suited hands
          'AKs', 'AQs', 'AJs', 'KQs',
          // Premium offsuit hands
          'AKo', 'AQo'
        ];
        break;
        
      case 'loose':
        // Loose Range (~25% of hands) - Reasonable opening range
        presetRange = [
          // All pairs 22+
          'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
          
          // Suited Aces
          'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
          
          // Suited Kings  
          'KQs', 'KJs', 'KTs', 'K9s',
          
          // Suited Queens
          'QJs', 'QTs', 'Q9s',
          
          // Suited Jacks
          'JTs', 'J9s',
          
          // Suited connectors
          'T9s', '98s', '87s', '76s', '65s', '54s',
          
          // Offsuit broadways
          'AKo', 'AQo', 'AJo', 'ATo', 'KQo', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo'
        ];
        break;
        
      case 'any-two':
        // Any Two Cards (100% of hands) - Every possible hand
        presetRange = generateAllHands();
        break;
    }
    
    onRangeChange(presetRange);
  };

  return (
    <div className="flex flex-col h-full space-y-2 sm:space-y-4">
      {/* Legend & Preset buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 flex-shrink-0">
        <div className="grid grid-cols-3 gap-1 text-xs text-slate-300">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-slate-700 border border-slate-600 rounded"></div>
            <span>Pairs</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-slate-600 border border-slate-500 rounded"></div>
            <span className="text-blue-300">Suited</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-slate-600 border border-slate-500 rounded"></div>
            <span className="text-green-300">Offsuit</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 sm:gap-2">
        <button
          onClick={() => setPresetRange('tight')}
          className="poker-button text-sm"
        >
          Tight (~9%)
        </button>
        <button
          onClick={() => setPresetRange('loose')}
          className="poker-button text-sm"
        >
          Loose (~25%)
        </button>
        <button
          onClick={() => setPresetRange('any-two')}
          className="poker-button text-sm"
        >
          Any Two (100%)
        </button>
          <button
            onClick={clearRange}
            className="poker-button danger text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Hand matrix grid */}
      <div className="bg-slate-800/50 rounded-lg p-2 sm:p-4 border border-slate-700 flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
          <div 
            className="gap-1 w-full aspect-square"
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
                onMouseDown={() => handleMouseDown(hand)}
                onMouseEnter={() => handleMouseEnter(hand)}
                className={`
                  w-full h-full text-xs sm:text-sm font-bold rounded-sm sm:rounded-md border border-slate-600 transition-all duration-200
                  flex items-center justify-center cursor-pointer select-none aspect-square
                  ${isHandSelected(hand)
                    ? 'bg-purple-500 text-white border-purple-400 shadow-lg z-10 relative scale-105'
                    : i === j 
                      ? 'bg-slate-700 text-white hover:bg-slate-600 hover:border-slate-500 hover:shadow-md'
                      : i < j
                        ? 'bg-slate-600 text-blue-300 hover:bg-slate-500 hover:border-slate-400 hover:shadow-md'
                        : 'bg-slate-600 text-green-300 hover:bg-slate-500 hover:border-slate-400 hover:shadow-md'
                  }
                `}
                title={`${hand} - ${i === j ? 'Pocket Pair' : i < j ? 'Suited' : 'Offsuit'}`}
              >
                <span className="leading-none">{hand}</span>
              </button>
            ))
          )}
          </div>
        </div>
      </div>



      {/* Selection summary */}
      <div className="text-white text-sm">
        <span className="font-medium">{selectedRange.length}</span> hands selected
      </div>
    </div>
  );
};

export default HandRangeSelector;
