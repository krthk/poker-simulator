import React, { useState, useEffect } from 'react';
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
  const [isSelectingFlop, setIsSelectingFlop] = useState<boolean>(false);
  const [tempFlopCards, setTempFlopCards] = useState<Card[]>([]);

  // Handle escape key to close modals
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        resetSelectors();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const selectCard = (rank: Rank, suit: Suit) => {
    const newCard: Card = { rank, suit };
    
    // Check if card already exists on board or temp flop
    const cardExists = [...board, ...tempFlopCards].some(c => c.rank === rank && c.suit === suit);
    if (cardExists) return;
    
    if (isSelectingFlop) {
      // Working on flop - add to temp flop cards
      const newTempFlop = [...tempFlopCards, newCard];
      setTempFlopCards(newTempFlop);
      
      if (newTempFlop.length === 3) {
        // Complete flop - save to board and clear temp
        onBoardChange(newTempFlop);
        setTempFlopCards([]);
        setIsSelectingFlop(false);
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
    return [...board, ...tempFlopCards].some(c => c.rank === rank && c.suit === suit);
  };

  const resetSelectors = () => {
    setSelectedSuit(null);
    setSelectedRank(null);
    setIsSelectingCard(null);
    setIsSelectingFlop(false);
    setTempFlopCards([]);
  };

  const removeCard = (index: number) => {
    // Reset selectors when removing cards
    setSelectedSuit(null);
    setSelectedRank(null);
    setIsSelectingCard(null);
    setTempFlopCards([]);
    setIsSelectingFlop(false);
    
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
    setIsSelectingFlop(false);
    setIsSelectingCard(null);
    setSelectedRank(null);
    setSelectedSuit(null);
  };

  const removeTempFlopCard = (index: number) => {
    const newTempFlop = tempFlopCards.filter((_, i) => i !== index);
    setTempFlopCards(newTempFlop);
    setSelectedSuit(null);
    setSelectedRank(null);
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

  const shouldShowFlopSelector = (): boolean => {
    return isSelectingFlop;
  };

  const shouldShowTurnRiverSelector = (): boolean => {
    return isSelectingCard !== null && (isSelectingCard === 3 || isSelectingCard === 4);
  };

  return (
    <div className="h-full flex flex-col space-y-4">

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4">
        {/* Board Display - Takes center stage */}
        <div className="flex-1 flex justify-center items-start">
          <div className="relative w-full max-w-5xl">
            {/* Outer glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl blur-xl"></div>
            
            {/* Board container with poker table styling */}
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-3xl p-8 border border-slate-600/50 shadow-2xl">
              {/* Table felt background */}
              <div className="absolute inset-4 bg-gradient-to-br from-green-800/30 to-green-900/30 rounded-2xl"></div>
              
              <div className="relative space-y-8">
                {/* Community Cards Display - New Layout */}
                <div className="flex justify-center items-center gap-8">
                  
                  {/* Flop Section */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="text-slate-300 text-sm font-semibold">FLOP</div>
                    <div 
                      className={`flex gap-2 p-4 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                        board.length >= 3 
                          ? 'border-green-500/50 bg-green-500/10' 
                          : 'border-slate-500/50 bg-slate-700/20 hover:border-purple-400/50 hover:bg-purple-500/10'
                      }`}
                      onClick={() => {
                        if (board.length < 3) {
                          setIsSelectingFlop(true);
                          setTempFlopCards([]);
                        }
                      }}
                    >
                      {/* Flop Cards (first 3) */}
                      {board.slice(0, 3).map((card, index) => (
                        <div
                          key={`flop-${index}`}
                          className="relative bg-white rounded-xl w-16 h-22 sm:w-20 sm:h-28 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-gray-200 hover:scale-105 group"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCard(index);
                          }}
                          title="Click to reset flop"
                        >
                          <span className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">{card.rank}</span>
                          <span className={`text-3xl sm:text-4xl font-bold ${getSuitColor(card.suit)}`}>
                            {getSuitSymbol(card.suit)}
                          </span>
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            ×
                          </div>
                        </div>
                      ))}
                      
                      {/* Temporary flop cards while selecting */}
                      {isSelectingFlop && tempFlopCards.map((card, index) => (
                        <div
                          key={`temp-flop-${index}`}
                          className="relative bg-gradient-to-br from-yellow-200 to-yellow-300 border-2 border-yellow-400 rounded-xl w-16 h-22 sm:w-20 sm:h-28 flex flex-col items-center justify-center cursor-pointer hover:from-yellow-100 hover:to-yellow-200 transition-all duration-300 shadow-lg group"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTempFlopCard(index);
                          }}
                          title="Temporary flop card - click to remove"
                        >
                          <span className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">{card.rank}</span>
                          <span className={`text-3xl sm:text-4xl font-bold ${getSuitColor(card.suit)}`}>
                            {getSuitSymbol(card.suit)}
                          </span>
                          <div className="absolute -top-2 -right-2 bg-yellow-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs group-hover:bg-yellow-700 transition-colors shadow-lg">
                            ×
                          </div>
                        </div>
                      ))}
                      
                      {/* Empty flop card placeholders */}
                      {Array.from({ length: 3 - Math.max(board.length, tempFlopCards.length) }, (_, i) => (
                        <div
                          key={`flop-empty-${i}`}
                          className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 border-2 border-dashed border-slate-500/50 rounded-xl w-16 h-22 sm:w-20 sm:h-28 flex items-center justify-center"
                        >
                          <div className="text-slate-500 text-2xl font-bold">?</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Turn Section */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="text-slate-300 text-sm font-semibold">TURN</div>
                    <div 
                      className={`p-4 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                        board.length >= 4 
                          ? 'border-green-500/50 bg-green-500/10' 
                          : board.length >= 3
                            ? 'border-slate-500/50 bg-slate-700/20 hover:border-purple-400/50 hover:bg-purple-500/10'
                            : 'border-slate-600/30 bg-slate-700/10 cursor-not-allowed opacity-50'
                      }`}
                      onClick={() => {
                        if (board.length === 3) {
                          setIsSelectingCard(3);
                        }
                      }}
                    >
                      {board[3] ? (
                        <div
                          className="relative bg-white rounded-xl w-16 h-22 sm:w-20 sm:h-28 flex flex-col items-center justify-center hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-gray-200 hover:scale-105 group"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCard(3);
                          }}
                          title="Click to remove turn"
                        >
                          <span className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">{board[3].rank}</span>
                          <span className={`text-3xl sm:text-4xl font-bold ${getSuitColor(board[3].suit)}`}>
                            {getSuitSymbol(board[3].suit)}
                          </span>
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            ×
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 border-2 border-dashed border-slate-500/50 rounded-xl w-16 h-22 sm:w-20 sm:h-28 flex items-center justify-center">
                          <div className="text-slate-500 text-2xl font-bold">?</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* River Section */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="text-slate-300 text-sm font-semibold">RIVER</div>
                    <div 
                      className={`p-4 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                        board.length >= 5 
                          ? 'border-green-500/50 bg-green-500/10' 
                          : board.length >= 4
                            ? 'border-slate-500/50 bg-slate-700/20 hover:border-purple-400/50 hover:bg-purple-500/10'
                            : 'border-slate-600/30 bg-slate-700/10 cursor-not-allowed opacity-50'
                      }`}
                      onClick={() => {
                        if (board.length === 4) {
                          setIsSelectingCard(4);
                        }
                      }}
                    >
                      {board[4] ? (
                        <div
                          className="relative bg-white rounded-xl w-16 h-22 sm:w-20 sm:h-28 flex flex-col items-center justify-center hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-gray-200 hover:scale-105 group"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCard(4);
                          }}
                          title="Click to remove river"
                        >
                          <span className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">{board[4].rank}</span>
                          <span className={`text-3xl sm:text-4xl font-bold ${getSuitColor(board[4].suit)}`}>
                            {getSuitSymbol(board[4].suit)}
                          </span>
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            ×
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 border-2 border-dashed border-slate-500/50 rounded-xl w-16 h-22 sm:w-20 sm:h-28 flex items-center justify-center">
                          <div className="text-slate-500 text-2xl font-bold">?</div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Side Panel - Controls */}
        <div className="lg:w-80 space-y-4">
          {/* Board Status Card */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-600/50 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  {board.length === 0 ? 'Pre-flop' : 
                   board.length === 3 ? 'Flop Set' : 
                   board.length === 4 ? 'Turn Set' : 
                   board.length === 5 ? 'Complete Board' : 
                   `${board.length} Cards`}
                </h3>
                <p className="text-sm text-slate-300">{board.length + tempFlopCards.length}/5 community cards</p>
              </div>
              {board.length > 0 && (
                <button
                  onClick={clearBoard}
                  className="btn-danger btn-sm"
                >
                  Clear Board
                </button>
              )}
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((board.length + tempFlopCards.length) / 5) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {board.length + tempFlopCards.length === 5 ? "Board complete!" : 
               board.length + tempFlopCards.length === 0 ? "No community cards set" : 
               `${5 - board.length - tempFlopCards.length} more cards available`}
            </p>
          </div>

          {/* Quick Presets */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-600/50 shadow-lg">
            <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Quick Presets
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onBoardChange([]);
                  setTempFlopCards([]);
                  setIsSelectingFlop(false);
                  setIsSelectingCard(null);
                }}
                className={`w-full btn-sm ${
                  board.length === 0 && tempFlopCards.length === 0 && !isSelectingFlop
                    ? 'btn-primary' 
                    : 'btn-secondary'
                }`}
              >
                🎲 Pre-flop (No community cards)
              </button>
              <button
                onClick={() => {
                  onBoardChange([
                    { rank: 'A', suit: 'h' },
                    { rank: 'K', suit: 'd' },
                    { rank: 'Q', suit: 'c' }
                  ]);
                  setTempFlopCards([]);
                  setIsSelectingFlop(false);
                }}
                className="w-full btn-secondary btn-sm"
              >
                🏔️ Dry Board (A♥ K♦ Q♣)
              </button>
              <button
                onClick={() => {
                  onBoardChange([
                    { rank: '9', suit: 'h' },
                    { rank: '8', suit: 'h' },
                    { rank: '7', suit: 's' }
                  ]);
                  setTempFlopCards([]);
                  setIsSelectingFlop(false);
                }}
                className="w-full btn-secondary btn-sm"
              >
                🌊 Draw Heavy (9♥ 8♥ 7♠)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card Selector Modals */}
      {/* Flop Selector Modal */}
      {shouldShowFlopSelector() && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-lg rounded-3xl p-6 border border-slate-600/50 shadow-2xl w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Set Flop
              </h4>
              <button
                onClick={resetSelectors}
                className="text-slate-400 hover:text-white text-xl p-2 rounded-full hover:bg-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Current selection preview - Fixed height */}
            <div className="mb-6 h-20 flex items-center justify-center">
              {tempFlopCards.length > 0 ? (
                <div className="flex gap-3">
                  {tempFlopCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-lg w-16 h-20 flex flex-col items-center justify-center shadow-lg">
                      <span className="text-base font-bold text-slate-800">{card.rank}</span>
                      <span className={`text-xl font-bold ${getSuitColor(card.suit)}`}>
                        {getSuitSymbol(card.suit)}
                      </span>
                    </div>
                  ))}
                  {/* Empty slots */}
                  {Array.from({ length: 3 - tempFlopCards.length }, (_, i) => (
                    <div key={`empty-${i}`} className="border-2 border-dashed border-slate-500 rounded-lg w-16 h-20 flex items-center justify-center">
                      <span className="text-slate-500 text-xl">?</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-3">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={`placeholder-${i}`} className="border-2 border-dashed border-slate-500 rounded-lg w-16 h-20 flex items-center justify-center">
                      <span className="text-slate-500 text-xl">?</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Suit selector */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-slate-200 mb-3 text-center">Suit:</div>
              <div className="flex gap-3 justify-center">
                {SUITS.map((suit) => {
                  const isSelected = selectedSuit === suit;
                  const hasDisabledRank = selectedRank && isCardDisabled(selectedRank, suit);
                  return (
                    <button
                      key={suit}
                      onClick={() => handleSuitSelect(suit)}
                      disabled={hasDisabledRank || false}
                      className={`
                        w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-3 transition-all duration-300
                        flex items-center justify-center text-5xl sm:text-6xl font-bold shadow-2xl
                        ${isSelected
                          ? 'bg-gradient-to-br from-purple-500 to-purple-600 border-purple-300 text-white scale-110 shadow-purple-400/50'
                          : hasDisabledRank
                            ? 'bg-slate-600 border-slate-500 text-slate-400 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-500 text-white hover:from-slate-600 hover:to-slate-700 hover:border-slate-400 hover:scale-105 hover:shadow-xl'
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
            <div className="mb-0">
              <div className="text-sm font-semibold text-slate-200 mb-3 text-center">Rank:</div>
              <div className="grid grid-cols-7 gap-2 max-w-md mx-auto">
                {RANKS.map((rank) => {
                  const isSelected = selectedRank === rank;
                  const hasDisabledSuit = selectedSuit && isCardDisabled(rank, selectedSuit);
                  return (
                    <button
                      key={rank}
                      onClick={() => handleRankSelect(rank)}
                      disabled={hasDisabledSuit || false}
                      className={`
                        w-10 h-10 rounded-lg border-2 transition-all duration-200
                        flex items-center justify-center text-lg font-bold shadow-lg
                        ${isSelected
                          ? 'bg-gradient-to-br from-purple-500 to-purple-600 border-purple-300 text-white scale-110 shadow-purple-400/50'
                          : hasDisabledSuit
                            ? 'bg-slate-600 border-slate-500 text-slate-400 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-500 text-white hover:from-slate-600 hover:to-slate-700 hover:border-slate-400'
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

          </div>
        </div>
      )}

      {/* Turn/River Selector Modal */}
      {shouldShowTurnRiverSelector() && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-lg rounded-3xl p-6 border border-slate-600/50 shadow-2xl w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {isSelectingCard === 3 ? 'Turn' : 'River'}
              </h4>
              <button
                onClick={resetSelectors}
                className="text-slate-400 hover:text-white text-xl p-2 rounded-full hover:bg-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Suit selector */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-slate-200 mb-3 text-center">Suit:</div>
              <div className="flex gap-3 justify-center">
                {SUITS.map((suit) => {
                  const isSelected = selectedSuit === suit;
                  const hasDisabledRank = selectedRank && isCardDisabled(selectedRank, suit);
                  return (
                    <button
                      key={suit}
                      onClick={() => handleSuitSelect(suit)}
                      disabled={hasDisabledRank || false}
                      className={`
                        w-16 h-16 rounded-xl border-2 transition-all duration-200
                        flex items-center justify-center text-3xl font-bold shadow-lg
                        ${isSelected
                          ? 'bg-gradient-to-br from-purple-500 to-purple-600 border-purple-300 text-white scale-110 shadow-purple-400/50'
                          : hasDisabledRank
                            ? 'bg-slate-600 border-slate-500 text-slate-400 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-500 text-white hover:from-slate-600 hover:to-slate-700 hover:border-slate-400'
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
            <div className="mb-0">
              <div className="text-sm font-semibold text-slate-200 mb-3 text-center">Rank:</div>
              <div className="grid grid-cols-7 gap-2 max-w-md mx-auto">
                {RANKS.map((rank) => {
                  const isSelected = selectedRank === rank;
                  const hasDisabledSuit = selectedSuit && isCardDisabled(rank, selectedSuit);
                  return (
                    <button
                      key={rank}
                      onClick={() => handleRankSelect(rank)}
                      disabled={hasDisabledSuit || false}
                      className={`
                        w-10 h-10 rounded-lg border-2 transition-all duration-200
                        flex items-center justify-center text-lg font-bold shadow-lg
                        ${isSelected
                          ? 'bg-gradient-to-br from-purple-500 to-purple-600 border-purple-300 text-white scale-110 shadow-purple-400/50'
                          : hasDisabledSuit
                            ? 'bg-slate-600 border-slate-500 text-slate-400 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-500 text-white hover:from-slate-600 hover:to-slate-700 hover:border-slate-400'
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

          </div>
        </div>
      )}
    </div>
  );
};

export default BoardSelector;