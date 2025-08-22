import React, { useState, useEffect } from 'react';
import { Player, SimulationResult, Board, TablePosition } from './types/poker';
import { runSimulation } from './poker/simulator';
import { getTopPercentHands, PRESET_PERCENTAGES } from './poker/handStrength';
import TableSelector from './components/TableSelector';
import HandRangeSelector from './components/HandRangeSelector';
import ResultsDisplay from './components/ResultsDisplay';
import BoardSelector from './components/BoardSelector';
import HelpPage from './components/HelpPage';

type Step = 'players' | 'ranges' | 'board' | 'results';

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('players');
  
  // Helper function to assign default ranges based on position
  const getDefaultRange = (position: TablePosition): string[] => {
    switch (position) {
      case 'UTG':
      case 'UTG+1':
        return getTopPercentHands(PRESET_PERCENTAGES.TIGHT); // Tight for early position
      case 'MP1':
      case 'MP2':
      case 'MP3':
        return getTopPercentHands(PRESET_PERCENTAGES.MEDIUM); // Medium for middle position
      case 'HJ':
      case 'CO':
        return getTopPercentHands(PRESET_PERCENTAGES.MEDIUM_LOOSE); // Looser for late position
      case 'BTN':
        return getTopPercentHands(PRESET_PERCENTAGES.LOOSE); // Loose for button
      case 'SB':
        return getTopPercentHands(PRESET_PERCENTAGES.MEDIUM_TIGHT); // Tighter for small blind
      case 'BB':
        return getTopPercentHands(PRESET_PERCENTAGES.MEDIUM_LOOSE); // Defending range for big blind
      default:
        return getTopPercentHands(PRESET_PERCENTAGES.MEDIUM);
    }
  };
  
  // Helper function to ensure all players have default ranges
  const ensureDefaultRanges = (playerList: Player[]): Player[] => {
    return playerList.map(player => ({
      ...player,
      range: player.range.length > 0 ? player.range : getDefaultRange(player.position)
    }));
  };
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [board, setBoard] = useState<Board>([]);
  const [iterations, setIterations] = useState<number>(10000);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [results, setResults] = useState<SimulationResult | null>(null);
  // Load Outfit font and apply it to the document
  useEffect(() => {
    try {
      // Add Outfit font from Google Fonts if not already present
      const existingLink = document.querySelector('link[href*="fonts.googleapis.com"]');
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        document.head.appendChild(link);
      }

      const outfitFont = '"Outfit", system-ui, sans-serif';
      
      // Apply Outfit font to multiple elements to ensure it takes effect
      const rootElement = document.documentElement;
      const bodyElement = document.body;
      
      rootElement.style.setProperty('font-family', outfitFont, 'important');
      bodyElement.style.setProperty('font-family', outfitFont, 'important');
      
      // Also set a CSS custom property for the current font
      rootElement.style.setProperty('--selected-font', outfitFont);
      
    } catch (error) {
      console.error('Error loading Outfit font:', error);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      try {
        // Don't trigger if user is typing in an input field or modal is open
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || showHelp) {
          return;
        }

        switch (event.key) {
          case 'Enter':
            // Move to next step if possible
            switch (currentStep) {
              case 'players':
                if (players.length >= 2) {
                  setCurrentStep('ranges');
                  const updatedPlayers = ensureDefaultRanges(players);
                  setPlayers(updatedPlayers);
                  const heroPlayer = updatedPlayers.find(p => p.isHero);
                  const defaultPlayer = heroPlayer || updatedPlayers[0];
                  setSelectedPlayer(defaultPlayer || null);
                }
                break;
              case 'ranges':
                const playersWithRanges = players.filter(p => p.isActive && p.range.length > 0);
                if (playersWithRanges.length >= 2) {
                  setCurrentStep('board');
                }
                break;
              case 'board':
                const activePlayers = players.filter(p => p.isActive && p.range.length > 0);
                if (activePlayers.length >= 2) {
                  handleRunSimulation();
                }
                break;
            }
            break;
          
          case 'Backspace':
            event.preventDefault(); // Prevent browser back navigation
            // Move to previous step
            switch (currentStep) {
              case 'ranges':
                resetToPlayers();
                break;
              case 'board':
                resetToRanges();
                break;
              case 'results':
                resetToBoard();
                break;
            }
            break;
        }
      } catch (error) {
        console.error('Keyboard navigation error:', error);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, players, showHelp]);

  const handleRunSimulation = async () => {
    const activePlayers = players.filter(p => p.isActive && p.range.length > 0);
    
    if (activePlayers.length < 2) {
      alert('Please select at least 2 players with hand ranges');
      return;
    }

    setIsSimulating(true);
    setResults(null);
    setCurrentStep('results');

    try {
      // Run simulation in a setTimeout to allow UI to update
      setTimeout(() => {
        const simulationResults = runSimulation({
          players: activePlayers,
          board: board.length > 0 ? board : undefined,
          iterations,
        });
        setResults(simulationResults);
        setIsSimulating(false);
      }, 100);
    } catch (error) {
      console.error('Simulation error:', error);
      alert('Error running simulation: ' + (error as Error).message);
      setIsSimulating(false);
      setCurrentStep('board');
    }
  };

  const updatePlayerRange = (playerId: string, range: any[]) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, range } : p
    ));
  };

  const canProceedToRanges = () => {
    return players.length >= 2;
  };

  const canProceedToBoard = () => {
    const playersWithRanges = players.filter(p => p.isActive && p.range.length > 0);
    return playersWithRanges.length >= 2;
  };

  const resetToPlayers = () => {
    setCurrentStep('players');
    setResults(null);
    setSelectedPlayer(null);
  };

  const resetToRanges = () => {
    setCurrentStep('ranges');
    setResults(null);
    // Ensure all players have default ranges
    const updatedPlayers = ensureDefaultRanges(players);
    setPlayers(updatedPlayers);
    // Auto-select hero or first player when returning to ranges step
    const heroPlayer = updatedPlayers.find(p => p.isHero);
    const defaultPlayer = heroPlayer || updatedPlayers[0];
    setSelectedPlayer(defaultPlayer || null);
  };

  const resetToBoard = () => {
    setCurrentStep('board');
    setResults(null);
  };

  const navigateToStep = (step: Step) => {
    switch (step) {
      case 'players':
        setCurrentStep('players');
        setResults(null);
        setSelectedPlayer(null);
        break;
      case 'ranges':
        if (canProceedToRanges()) {
          setCurrentStep('ranges');
          setResults(null);
          // Ensure all players have default ranges
          const updatedPlayers = ensureDefaultRanges(players);
          setPlayers(updatedPlayers);
          // Auto-select hero or first player when entering ranges step
          const heroPlayer = updatedPlayers.find(p => p.isHero);
          const defaultPlayer = heroPlayer || updatedPlayers[0];
          setSelectedPlayer(defaultPlayer || null);
        }
        break;
      case 'board':
        if (canProceedToBoard()) {
          setCurrentStep('board');
          setResults(null);
        }
        break;
      case 'results':
        if (results) {
          setCurrentStep('results');
        }
        break;
    }
  };

  const canNavigateToStep = (step: Step): boolean => {
    switch (step) {
      case 'players':
        return true;
      case 'ranges':
        return canProceedToRanges();
      case 'board':
        return canProceedToBoard();
      case 'results':
        return results !== null;
      default:
        return false;
    }
  };

  const getCurrentFontFamily = () => {
    return '"Outfit", system-ui, sans-serif';
  };

  return (
    <div 
      className="h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-1 sm:p-2"
      style={{ fontFamily: getCurrentFontFamily() }}
    >
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-2 flex-shrink-0">
          <div className="flex items-center justify-center mb-1">
            {/* Custom Cards Icon */}
            <div className="mr-3 relative">
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 40 40" 
                className="drop-shadow-lg"
              >
                {/* Background glow */}
                <defs>
                  <linearGradient id="cardGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                  <linearGradient id="cardGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <filter id="cardGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Left card (slightly rotated) */}
                <g transform="rotate(-15 20 20)" filter="url(#cardGlow)">
                  <rect x="8" y="12" width="14" height="18" rx="2" ry="2" 
                        fill="url(#cardGradient1)" stroke="#e2e8f0" strokeWidth="0.5"/>
                  <circle cx="15" cy="18" r="1.5" fill="white" opacity="0.9"/>
                  <polygon points="13.5,20 16.5,20 15,23" fill="white" opacity="0.9"/>
                </g>
                
                {/* Right card (slightly rotated other way) */}
                <g transform="rotate(15 20 20)" filter="url(#cardGlow)">
                  <rect x="18" y="10" width="14" height="18" rx="2" ry="2" 
                        fill="url(#cardGradient2)" stroke="#e2e8f0" strokeWidth="0.5"/>
                  <path d="M25 15 L27 17 L25 19 L23 17 Z" fill="white" opacity="0.9"/>
                  <rect x="24" y="20" width="2" height="4" fill="white" opacity="0.9"/>
                </g>
                
                {/* Sparkle effects */}
                <circle cx="12" cy="8" r="0.8" fill="#fbbf24" opacity="0.8">
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="32" cy="32" r="0.6" fill="#fbbf24" opacity="0.6">
                  <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite"/>
                </circle>
                <circle cx="6" cy="30" r="0.5" fill="#fbbf24" opacity="0.7">
                  <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.8s" repeatCount="indefinite"/>
                </circle>
              </svg>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Poker Equity Calculator
            </h1>
            <button
              onClick={() => setShowHelp(true)}
              className="ml-3 w-8 h-8 bg-slate-700 hover:bg-slate-600 border border-slate-500 hover:border-slate-400 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
              title="Help & FAQ"
            >
              <span className="text-slate-300 hover:text-white text-sm font-bold">?</span>
            </button>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Monte Carlo simulation for poker hand ranges
          </p>
        </div>

        {/* Step Indicator - Enhanced */}
        <div className="flex items-center justify-center mb-3 py-2 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigateToStep('players')}
              className={`flex items-center transition-all duration-200 ${
                canNavigateToStep('players') 
                  ? 'hover:scale-110 cursor-pointer' 
                  : 'cursor-not-allowed'
              } ${currentStep === 'players' ? 'text-purple-400' : 
                  ['ranges', 'board', 'results'].includes(currentStep) ? 'text-green-400' : 'text-slate-400'}`}
            >
              <div className={`w-8 h-8 rounded-full border-3 flex items-center justify-center text-sm font-extrabold transition-all duration-200 shadow-lg ${
                currentStep === 'players' ? 'border-purple-400 bg-purple-400 text-white shadow-purple-400/50' : 
                ['ranges', 'board', 'results'].includes(currentStep) ? 'border-green-400 bg-green-400 text-white shadow-green-400/50' : 'border-slate-400 shadow-slate-400/30'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-bold hidden md:block">Players</span>
            </button>
            
            <div className={`w-8 h-1 rounded-full ${['ranges', 'board', 'results'].includes(currentStep) ? 'bg-green-400' : 'bg-slate-600'}`}></div>
            
            <button
              onClick={() => navigateToStep('ranges')}
              disabled={!canNavigateToStep('ranges')}
              className={`flex items-center transition-all duration-200 ${
                canNavigateToStep('ranges') 
                  ? 'hover:scale-110 cursor-pointer' 
                  : 'cursor-not-allowed opacity-60'
              } ${currentStep === 'ranges' ? 'text-purple-400' : 
                  ['board', 'results'].includes(currentStep) ? 'text-green-400' : 'text-slate-400'}`}
            >
              <div className={`w-8 h-8 rounded-full border-3 flex items-center justify-center text-sm font-extrabold transition-all duration-200 shadow-lg ${
                currentStep === 'ranges' ? 'border-purple-400 bg-purple-400 text-white shadow-purple-400/50' : 
                ['board', 'results'].includes(currentStep) ? 'border-green-400 bg-green-400 text-white shadow-green-400/50' : 'border-slate-400 shadow-slate-400/30'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-bold hidden md:block">Ranges</span>
            </button>
            
            <div className={`w-8 h-1 rounded-full ${['board', 'results'].includes(currentStep) ? 'bg-green-400' : 'bg-slate-600'}`}></div>
            
            <button
              onClick={() => navigateToStep('board')}
              disabled={!canNavigateToStep('board')}
              className={`flex items-center transition-all duration-200 ${
                canNavigateToStep('board') 
                  ? 'hover:scale-110 cursor-pointer' 
                  : 'cursor-not-allowed opacity-60'
              } ${currentStep === 'board' ? 'text-purple-400' : currentStep === 'results' ? 'text-green-400' : 'text-slate-400'}`}
            >
              <div className={`w-8 h-8 rounded-full border-3 flex items-center justify-center text-sm font-extrabold transition-all duration-200 shadow-lg ${
                currentStep === 'board' ? 'border-purple-400 bg-purple-400 text-white shadow-purple-400/50' : 
                currentStep === 'results' ? 'border-green-400 bg-green-400 text-white shadow-green-400/50' : 'border-slate-400 shadow-slate-400/30'}`}>
                3
              </div>
              <span className="ml-2 text-sm font-bold hidden md:block">Board</span>
            </button>
            
            <div className={`w-8 h-1 rounded-full ${currentStep === 'results' ? 'bg-green-400' : 'bg-slate-600'}`}></div>
            
            <button
              onClick={() => navigateToStep('results')}
              disabled={!canNavigateToStep('results')}
              className={`flex items-center transition-all duration-200 ${
                canNavigateToStep('results') 
                  ? 'hover:scale-110 cursor-pointer' 
                  : 'cursor-not-allowed opacity-60'
              } ${currentStep === 'results' ? 'text-purple-400' : 'text-slate-400'}`}
            >
              <div className={`w-8 h-8 rounded-full border-3 flex items-center justify-center text-sm font-extrabold transition-all duration-200 shadow-lg ${
                currentStep === 'results' ? 'border-purple-400 bg-purple-400 text-white shadow-purple-400/50' : 'border-slate-400 shadow-slate-400/30'}`}>
                4
              </div>
              <span className="ml-2 text-sm font-bold hidden md:block">Results</span>
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-xl border border-slate-700 flex-1 overflow-auto">
          {currentStep === 'players' && (
            <TableSelector
              players={players}
              onPlayersChange={setPlayers}
              onPlayerSelect={setSelectedPlayer}
              selectedPlayer={selectedPlayer}
              onContinue={() => {
                setCurrentStep('ranges');
                // Ensure all players have default ranges
                const updatedPlayers = ensureDefaultRanges(players);
                setPlayers(updatedPlayers);
                // Auto-select hero or first player when entering ranges step
                const heroPlayer = updatedPlayers.find(p => p.isHero);
                const defaultPlayer = heroPlayer || updatedPlayers[0];
                setSelectedPlayer(defaultPlayer || null);
              }}
              canContinue={canProceedToRanges()}
            />
          )}

          {currentStep === 'ranges' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-purple-400">
                  Configure Player Ranges
                </h2>
                <button
                  onClick={resetToPlayers}
                  className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                >
                  <span>←</span>
                  <span>Edit Players</span>
                </button>
              </div>

              {/* Player Summary */}
              <div className="bg-slate-700/30 rounded-lg p-2">
                <div className="flex flex-wrap gap-1 justify-center">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className={`px-2 py-1 rounded border-2 cursor-pointer transition-all duration-200 flex items-center space-x-1 ${
                        selectedPlayer?.id === player.id
                          ? 'border-purple-400 bg-purple-400/20'
                          : player.range.length > 0
                            ? 'border-green-400 bg-green-400/20 hover:bg-green-400/30'
                            : 'border-slate-600 bg-slate-600/20 hover:bg-slate-600/30'
                      }`}
                      onClick={() => setSelectedPlayer(player)}
                    >
                      <div className={`text-xs font-semibold ${player.isHero ? 'text-purple-400' : 'text-white'}`}>
                        {player.name} {player.isHero && '👑'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {player.position}
                      </div>
                      <div className={`text-xs font-bold ${player.range.length > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                        {player.range.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPlayer ? (
                <HandRangeSelector
                  selectedRange={players.find(p => p.id === selectedPlayer.id)?.range || []}
                  onRangeChange={(range) => updatePlayerRange(selectedPlayer.id, range)}
                  player={players.find(p => p.id === selectedPlayer.id) || selectedPlayer}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-slate-400 mb-4">
                    No players available. Please return to step 1 to add players.
                  </div>
                  <button
                    onClick={resetToPlayers}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-all duration-200"
                  >
                    ← Back to Player Selection
                  </button>
                </div>
              )}

              {/* Continue Button */}
              {canProceedToBoard() && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setCurrentStep('board')}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Continue to Board Setup
                  </button>
                </div>
              )}
            </div>
          )}

          {currentStep === 'board' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-purple-400">
                  Set Community Cards
                </h2>
                <button
                  onClick={resetToRanges}
                  className="text-sm text-slate-400 hover:text-white flex items-center space-x-1"
                >
                  <span>←</span>
                  <span>Edit Ranges</span>
                </button>
              </div>
              
              <BoardSelector
                board={board}
                onBoardChange={setBoard}
              />

              {/* Multi-Player Range Summary */}
              <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Player Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {players
                    .filter(p => p.isActive && p.range.length > 0)
                    .map((player) => (
                      <div key={player.id} className="text-center p-3 bg-slate-600/30 rounded-lg">
                        <div className={`font-semibold ${player.isHero ? 'text-purple-400' : 'text-white'} mb-1`}>
                          {player.name} {player.isHero && '👑'}
                        </div>
                        <div className="text-xs text-slate-400 mb-2">{player.position}</div>
                        <div className="text-green-400 font-bold">{player.range.length}</div>
                        <div className="text-xs text-slate-500">hands</div>
                        {player.range.length > 0 && (
                          <div className="text-xs text-slate-400 mt-1 truncate">
                            {player.range.slice(0, 6).join(', ')}{player.range.length > 6 ? '...' : ''}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <div className="text-center space-y-4">
                  <div className="text-sm text-slate-400">
                    {iterations.toLocaleString()} iterations • {players.filter(p => p.isActive && p.range.length > 0).length} players • {board.length === 0 ? 'Pre-flop' : board.length === 3 ? 'Flop' : board.length === 4 ? 'Turn' : 'River'} analysis
                  </div>
                  <button
                    onClick={handleRunSimulation}
                    disabled={isSimulating || !canProceedToBoard()}
                    className="px-12 py-4 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 text-white font-bold text-xl rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isSimulating ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span>Running...</span>
                      </div>
                    ) : (
                      '🃏 Run Multi-Player Simulation'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'results' && (
            <div className="space-y-4">
              {/* Compact header with integrated navigation */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Results
                </h2>
                <div className="flex items-center space-x-3">
                  <button onClick={resetToBoard} className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 transition-colors">
                    <span>←</span><span>Board</span>
                  </button>
                  <button onClick={resetToRanges} className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 transition-colors">
                    <span>←</span><span>Ranges</span>
                  </button>
                  <button onClick={resetToPlayers} className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 transition-colors">
                    <span>←</span><span>Players</span>
                  </button>
                </div>
              </div>
              
              {results ? (
                <div className="w-full">
                  <ResultsDisplay 
                    results={results} 
                    players={players.filter(p => p.isActive && p.range.length > 0)}
                    board={board}
                    iterations={iterations}
                    onRunAgain={handleRunSimulation}
                    onNewAnalysis={() => {
                      setResults(null);
                      setCurrentStep('players');
                      setSelectedPlayer(null);
                    }}
                    isSimulating={isSimulating}
                  />
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  No results available
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-1 text-center text-white/50 text-xs flex-shrink-0">
          <p>Vibe coded by Karthik Puthraya © 2025</p>
        </div>
      </div>

      {/* Help Page Modal */}
      {showHelp && (
        <HelpPage onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
}

export default App;
