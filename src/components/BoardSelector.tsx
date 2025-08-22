import React, { useState } from 'react';
import { Card, Board, Rank, Suit } from '../types/poker';
import { RANKS, SUITS } from '../poker/deck';

interface BoardSelectorProps {
  board: Board;
  onBoardChange: (board: Board) => void;
}

const BoardSelector: React.FC<BoardSelectorProps> = ({ board, onBoardChange }) => {
  const [isSelectingCard, setIsSelectingCard] = useState<number | null>(null);
  const [selectedSuit, setSelectedSuit] = useState<Suit | null>(null);
  const [selectedRank, setSelectedRank] = useState<Rank | null>(null);
  const [tempFlopCards, setTempFlopCards] = useState<Card[]>([]);

  const addCard = (rank: Rank, suit: Suit) => {
    if (board.length >= 5) return;
    
    const newCard: Card = { rank, suit };
    
    // Check if card already exists on board
    const cardExists = board.some(c => c.rank === rank && c.suit === suit);
    if (cardExists) return;
    
    const newBoard = [...board, newCard];
    onBoardChange(newBoard);
    setIsSelectingCard(null);
  };

  const selectCard = (rank: Rank, suit: Suit) => {
    const newCard: Card = { rank, suit };
    
    // Check if card already exists on board or temp flop
    const cardExists = [...board, ...tempFlopCards].some(c => c.rank === rank && c.suit === suit);
    if (cardExists) return;
    
    if (board.length === 0) {
      // Working on flop - add to temp flop cards
      const newTempFlop = [...tempFlopCards, newCard];
      setTempFlopCards(newTempFlop);
      
      if (newTempFlop.length === 3) {
        // Complete flop - save to board and clear temp
        onBoardChange(newTempFlop);
        setTempFlopCards([]);
        setIsSelectingCard(null);
      }
    } else {
      // Adding turn or river
      const newBoard = [...board, newCard];
      onBoardChange(newBoard);
      setIsSelectingCard(null);
    }
    
    // Reset selectors after each card
    setSelectedSuit(null);
    setSelectedRank(null);
  };

  const handleSuitSelect = (suit: Suit) => {
    setSelectedSuit(suit);
    
    // If rank is also selected, add the card
    if (selectedRank) {
      selectCard(selectedRank, suit);
    }
  };

  const handleRankSelect = (rank: Rank) => {
    setSelectedRank(rank);
    
    // If suit is also selected, add the card
    if (selectedSuit) {
      selectCard(rank, selectedSuit);
    }
  };

  const isCardDisabled = (rank: Rank, suit: Suit): boolean => {
    return board.some(c => c.rank === rank && c.suit === suit);
  };

  const resetSelectors = () => {
    setSelectedSuit(null);
    setSelectedRank(null);
    setIsSelectingCard(null);
    setTempFlopCards([]);
  };

  const removeCard = (index: number) => {
    // Reset selectors when removing cards
    setSelectedSuit(null);
    setSelectedRank(null);
    setIsSelectingCard(null);
    setTempFlopCards([]);
    
    // If removing from flop (first 3 cards), reset to pre-flop
    if (index < 3 && board.length >= 3) {
      onBoardChange([]);
    } else {
      const newBoard = board.filter((_, i) => i !== index);
      onBoardChange(newBoard);
    }
  };

  const clearBoard = () => {
    onBoardChange([]);
    setTempFlopCards([]);
  };

  const removeTempFlopCard = (index: number) => {
    const newTempFlop = tempFlopCards.filter((_, i) => i !== index);
    setTempFlopCards(newTempFlop);
    setSelectedSuit(null);
    setSelectedRank(null);
  };

  const cardToString = (card: Card): string => {
    return `${card.rank}${card.suit}`;
  };

  const getSuitColor = (suit: Suit): string => {
    return suit === 'h' || suit === 'd' ? 'text-red-500' : 'text-slate-800';
  };

  const getSuitSymbol = (suit: Suit): string => {
    switch (suit) {
      case 'h': return '♥';
      case 'd': return '♦';
      case 'c': return '♣';
      case 's': return '♠';
    }
  };

  const getBoardStage = (): string => {
    switch (board.length) {
      case 0: return 'Pre-flop';
      case 3: return 'Flop';
      case 4: return 'Turn';
      case 5: return 'River';
      default: return `${board.length} cards`;
    }
  };

  const getNextStage = (): string => {
    switch (board.length) {
      case 0: return 'flop (3 cards)';
      case 3: return 'turn card';
      case 4: return 'river card';
      default: return '';
    }
  };

  const canAddCard = (): boolean => {
    return board.length === 3 || board.length === 4;
  };

  const shouldShowFlopSelector = (): boolean => {
    return board.length >= 0 && board.length < 3;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-purple-400">
          Community Cards ({getBoardStage()})
        </h3>
        {board.length > 0 && (
          <button
            onClick={clearBoard}
            className="poker-button danger text-sm"
          >
            Clear Board
          </button>
        )}
      </div>

      {/* Board display */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <div className="flex gap-2 mb-4">
          {/* Existing committed cards */}
          {board.map((card, index) => (
            <div
              key={`committed-${index}`}
              className="relative bg-white rounded-lg w-12 h-16 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors shadow-md"
              onClick={() => removeCard(index)}
              title={index < 3 ? "Click to reset flop" : "Click to remove"}
            >
              <span className="text-lg font-bold text-slate-800">{card.rank}</span>
              <span className={`text-xl font-bold ${getSuitColor(card.suit)}`}>
                {getSuitSymbol(card.suit)}
              </span>
            </div>
          ))}
          
          {/* Temporary flop cards (when building flop) */}
          {board.length === 0 && tempFlopCards.map((card, index) => (
            <div
              key={`temp-${index}`}
              className="relative bg-yellow-200 border-2 border-yellow-400 rounded-lg w-12 h-16 flex flex-col items-center justify-center cursor-pointer hover:bg-yellow-100 transition-colors shadow-md"
              onClick={() => removeTempFlopCard(index)}
              title="Temporary flop card - click to remove"
            >
              <span className="text-lg font-bold text-slate-800">{card.rank}</span>
              <span className={`text-xl font-bold ${getSuitColor(card.suit)}`}>
                {getSuitSymbol(card.suit)}
              </span>
            </div>
          ))}

          {/* Empty slots - show different UI based on stage */}
          {board.length === 0 && (
            <>
              {/* Remaining flop placeholders */}
              <div className="flex gap-1">
                {Array.from({ length: 3 - tempFlopCards.length }, (_, i) => (
                  <div
                    key={`flop-${tempFlopCards.length + i}`}
                    className="bg-slate-700 border-2 border-dashed border-slate-500 rounded-lg w-12 h-16 flex items-center justify-center"
                  >
                    <span className="text-slate-400 text-xs">F{tempFlopCards.length + i + 1}</span>
                  </div>
                ))}
              </div>
              {/* Turn/River placeholders */}
              <div
                className="bg-slate-700 border-2 border-dashed border-slate-500 rounded-lg w-12 h-16 flex items-center justify-center"
              >
                <span className="text-slate-400 text-xs">T</span>
              </div>
              <div
                className="bg-slate-700 border-2 border-dashed border-slate-500 rounded-lg w-12 h-16 flex items-center justify-center"
              >
                <span className="text-slate-400 text-xs">R</span>
              </div>
            </>
          )}

          {/* Single card slots for turn/river */}
          {board.length >= 3 && Array.from({ length: 5 - board.length }, (_, i) => (
            <div
              key={`empty-${i}`}
              className="bg-slate-700 border-2 border-dashed border-slate-500 rounded-lg w-12 h-16 flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors"
              onClick={() => {
                setSelectedSuit(null);
                setSelectedRank(null);
                setIsSelectingCard(board.length + i);
              }}
            >
              <span className="text-slate-400 text-xl">+</span>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-400">
          {board.length === 0 && tempFlopCards.length === 0 && "Click below to set flop (all 3 cards), then optionally add turn and river"}
          {board.length === 0 && tempFlopCards.length === 1 && "Select 2 more cards to complete the flop"}
          {board.length === 0 && tempFlopCards.length === 2 && "Select 1 more card to complete the flop"}
          {board.length === 3 && "Flop set • Click + to add turn card or any flop card to reset"}
          {board.length === 4 && "Turn set • Click + to add river card, turn to remove, or any flop card to reset"}
          {board.length === 5 && "Complete board • Click turn/river to remove or any flop card to reset"}
        </div>
      </div>

      {/* Card selector for flop */}
      {shouldShowFlopSelector() && (
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-purple-400">Set Flop (3 cards)</h4>
            <button
              onClick={resetSelectors}
              className="text-slate-400 hover:text-white text-xs"
            >
              Reset
            </button>
          </div>
          <div className="text-xs text-slate-400 mb-4">
            {board.length === 0 && tempFlopCards.length === 0 && "Select suit + rank to add cards • 0/3 selected"}
            {board.length === 0 && tempFlopCards.length === 1 && "Select 2 more cards for the flop • 1/3 selected"}
            {board.length === 0 && tempFlopCards.length === 2 && "Select 1 more card to complete the flop • 2/3 selected"}
          </div>

          {/* Suit selector */}
          <div className="mb-4">
            <div className="text-xs text-slate-300 mb-2">Select Suit:</div>
            <div className="flex gap-2">
              {SUITS.map((suit) => {
                const isSelected = selectedSuit === suit;
                const hasDisabledRank = selectedRank && isCardDisabled(selectedRank, suit);
                return (
                  <button
                    key={suit}
                    onClick={() => handleSuitSelect(suit)}
                    disabled={hasDisabledRank}
                    className={`
                      w-12 h-12 rounded-lg border-2 transition-all duration-200
                      flex items-center justify-center text-2xl font-bold
                      ${isSelected
                        ? 'bg-purple-500 border-purple-400 text-white scale-110'
                        : hasDisabledRank
                          ? 'bg-slate-600 border-slate-500 text-slate-400 cursor-not-allowed opacity-50'
                          : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-500'
                      }
                    `}
                    title={`${suit === 'h' ? 'Hearts' : suit === 'd' ? 'Diamonds' : suit === 'c' ? 'Clubs' : 'Spades'}`}
                  >
                    <span className={suit === 'h' || suit === 'd' ? 'text-red-400' : 'text-white'}>
                      {getSuitSymbol(suit)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rank selector */}
          <div>
            <div className="text-xs text-slate-300 mb-2">Select Rank:</div>
            <div className="grid grid-cols-7 gap-2">
              {RANKS.map((rank) => {
                const isSelected = selectedRank === rank;
                const hasDisabledSuit = selectedSuit && isCardDisabled(rank, selectedSuit);
                return (
                  <button
                    key={rank}
                    onClick={() => handleRankSelect(rank)}
                    disabled={hasDisabledSuit}
                    className={`
                      w-10 h-10 rounded-lg border-2 transition-all duration-200
                      flex items-center justify-center text-sm font-bold
                      ${isSelected
                        ? 'bg-purple-500 border-purple-400 text-white scale-110'
                        : hasDisabledSuit
                          ? 'bg-slate-600 border-slate-500 text-slate-400 cursor-not-allowed opacity-50'
                          : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-500'
                      }
                    `}
                    title={rank}
                  >
                    {rank}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selection preview */}
          {(selectedSuit || selectedRank) && (
            <div className="mt-4 text-xs text-slate-300">
              Current selection: 
              {selectedRank && <span className="font-bold ml-1">{selectedRank}</span>}
              {selectedSuit && <span className={`ml-1 ${selectedSuit === 'h' || selectedSuit === 'd' ? 'text-red-400' : 'text-slate-300'}`}>{getSuitSymbol(selectedSuit)}</span>}
              {selectedSuit && selectedRank && !isCardDisabled(selectedRank, selectedSuit) && 
                <span className="text-green-400 ml-2">✓ Click to add</span>
              }
              {selectedSuit && selectedRank && isCardDisabled(selectedRank, selectedSuit) && 
                <span className="text-red-400 ml-2">✗ Card already selected</span>
              }
            </div>
          )}
        </div>
      )}

      {/* Single card selector for turn/river */}
      {isSelectingCard !== null && canAddCard() && (
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-purple-400">
              Select {getNextStage()}
            </h4>
            <button
              onClick={resetSelectors}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Suit selector */}
          <div className="mb-4">
            <div className="text-xs text-slate-300 mb-2">Select Suit:</div>
            <div className="flex gap-2">
              {SUITS.map((suit) => {
                const isSelected = selectedSuit === suit;
                const hasDisabledRank = selectedRank && isCardDisabled(selectedRank, suit);
                return (
                  <button
                    key={suit}
                    onClick={() => handleSuitSelect(suit)}
                    disabled={hasDisabledRank}
                    className={`
                      w-12 h-12 rounded-lg border-2 transition-all duration-200
                      flex items-center justify-center text-2xl font-bold
                      ${isSelected
                        ? 'bg-purple-500 border-purple-400 text-white scale-110'
                        : hasDisabledRank
                          ? 'bg-slate-600 border-slate-500 text-slate-400 cursor-not-allowed opacity-50'
                          : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-500'
                      }
                    `}
                    title={`${suit === 'h' ? 'Hearts' : suit === 'd' ? 'Diamonds' : suit === 'c' ? 'Clubs' : 'Spades'}`}
                  >
                    <span className={suit === 'h' || suit === 'd' ? 'text-red-400' : 'text-white'}>
                      {getSuitSymbol(suit)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rank selector */}
          <div>
            <div className="text-xs text-slate-300 mb-2">Select Rank:</div>
            <div className="grid grid-cols-7 gap-2">
              {RANKS.map((rank) => {
                const isSelected = selectedRank === rank;
                const hasDisabledSuit = selectedSuit && isCardDisabled(rank, selectedSuit);
                return (
                  <button
                    key={rank}
                    onClick={() => handleRankSelect(rank)}
                    disabled={hasDisabledSuit}
                    className={`
                      w-10 h-10 rounded-lg border-2 transition-all duration-200
                      flex items-center justify-center text-sm font-bold
                      ${isSelected
                        ? 'bg-purple-500 border-purple-400 text-white scale-110'
                        : hasDisabledSuit
                          ? 'bg-slate-600 border-slate-500 text-slate-400 cursor-not-allowed opacity-50'
                          : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-500'
                      }
                    `}
                    title={rank}
                  >
                    {rank}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selection preview */}
          {(selectedSuit || selectedRank) && (
            <div className="mt-4 text-xs text-slate-300">
              Current selection: 
              {selectedRank && <span className="font-bold ml-1">{selectedRank}</span>}
              {selectedSuit && <span className={`ml-1 ${selectedSuit === 'h' || selectedSuit === 'd' ? 'text-red-400' : 'text-slate-300'}`}>{getSuitSymbol(selectedSuit)}</span>}
              {selectedSuit && selectedRank && !isCardDisabled(selectedRank, selectedSuit) && 
                <span className="text-green-400 ml-2">✓ Click to add</span>
              }
              {selectedSuit && selectedRank && isCardDisabled(selectedRank, selectedSuit) && 
                <span className="text-red-400 ml-2">✗ Card already selected</span>
              }
            </div>
          )}
        </div>
      )}

      {/* Quick presets */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            onBoardChange([]);
            setTempFlopCards([]);
          }}
          className={`poker-button text-sm ${board.length === 0 && tempFlopCards.length === 0 ? 'primary' : ''}`}
        >
          Pre-flop
        </button>
        <button
          onClick={() => {
            onBoardChange([
              { rank: 'A', suit: 'h' },
              { rank: 'K', suit: 'd' },
              { rank: 'Q', suit: 'c' }
            ]);
            setTempFlopCards([]);
          }}
          className="poker-button text-sm"
        >
          Dry Board (AKQ)
        </button>
        <button
          onClick={() => {
            onBoardChange([
              { rank: '9', suit: 'h' },
              { rank: '8', suit: 'h' },
              { rank: '7', suit: 's' }
            ]);
            setTempFlopCards([]);
          }}
          className="poker-button text-sm"
        >
          Draw Heavy (987)
        </button>
        <button
          onClick={() => {
            onBoardChange([
              { rank: 'A', suit: 'h' },
              { rank: 'A', suit: 'd' },
              { rank: 'K', suit: 'c' },
              { rank: 'J', suit: 's' }
            ]);
            setTempFlopCards([]);
          }}
          className="poker-button text-sm"
        >
          Paired Turn
        </button>
      </div>
    </div>
  );
};

export default BoardSelector;
