import React, { useState } from 'react';
import { HandRange, SimulationResult, Board } from './types/poker';
import { runSimulation } from './poker/simulator';
import HandRangeSelector from './components/HandRangeSelector';
import SimulationControls from './components/SimulationControls';
import ResultsDisplay from './components/ResultsDisplay';
import BoardSelector from './components/BoardSelector';

type Step = 'ranges' | 'board' | 'results';

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('ranges');
  const [heroRange, setHeroRange] = useState<HandRange>([]);
  const [villainRange, setVillainRange] = useState<HandRange>([]);
  const [board, setBoard] = useState<Board>([]);
  const [iterations, setIterations] = useState<number>(10000);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [results, setResults] = useState<SimulationResult | null>(null);

  const handleRunSimulation = async () => {
    if (heroRange.length === 0 || villainRange.length === 0) {
      alert('Please select ranges for both hero and villain');
      return;
    }

    setIsSimulating(true);
    setResults(null);
    setCurrentStep('results');

    try {
      // Run simulation in a setTimeout to allow UI to update
      setTimeout(() => {
        const simulationResults = runSimulation({
          heroRange,
          villainRange,
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

  const canProceedToBoard = () => {
    return heroRange.length > 0 && villainRange.length > 0;
  };

  const resetToRanges = () => {
    setCurrentStep('ranges');
    setResults(null);
  };

  const resetToBoard = () => {
    setCurrentStep('board');
    setResults(null);
  };

  const navigateToStep = (step: Step) => {
    switch (step) {
      case 'ranges':
        setCurrentStep('ranges');
        setResults(null);
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
      case 'ranges':
        return true;
      case 'board':
        return canProceedToBoard();
      case 'results':
        return results !== null;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="text-center mb-4 flex-shrink-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">
            Poker Equity Calculator
          </h1>
          <p className="text-white text-sm sm:text-lg">
            Monte Carlo simulation for poker hand ranges
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-4 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateToStep('ranges')}
              className={`flex items-center transition-all duration-200 ${
                canNavigateToStep('ranges') 
                  ? 'hover:scale-105 cursor-pointer' 
                  : 'cursor-not-allowed'
              } ${currentStep === 'ranges' ? 'text-purple-400' : currentStep === 'board' || currentStep === 'results' ? 'text-green-400' : 'text-slate-400'}`}
            >
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-200 ${currentStep === 'ranges' ? 'border-purple-400 bg-purple-400 text-white' : currentStep === 'board' || currentStep === 'results' ? 'border-green-400 bg-green-400 text-white' : 'border-slate-400'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Select Ranges</span>
            </button>
            
            <div className={`w-16 h-0.5 ${currentStep === 'board' || currentStep === 'results' ? 'bg-green-400' : 'bg-slate-600'}`}></div>
            
            <button
              onClick={() => navigateToStep('board')}
              disabled={!canNavigateToStep('board')}
              className={`flex items-center transition-all duration-200 ${
                canNavigateToStep('board') 
                  ? 'hover:scale-105 cursor-pointer' 
                  : 'cursor-not-allowed opacity-60'
              } ${currentStep === 'board' ? 'text-purple-400' : currentStep === 'results' ? 'text-green-400' : 'text-slate-400'}`}
            >
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-200 ${currentStep === 'board' ? 'border-purple-400 bg-purple-400 text-white' : currentStep === 'results' ? 'border-green-400 bg-green-400 text-white' : 'border-slate-400'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Set Board</span>
            </button>
            
            <div className={`w-16 h-0.5 ${currentStep === 'results' ? 'bg-green-400' : 'bg-slate-600'}`}></div>
            
            <button
              onClick={() => navigateToStep('results')}
              disabled={!canNavigateToStep('results')}
              className={`flex items-center transition-all duration-200 ${
                canNavigateToStep('results') 
                  ? 'hover:scale-105 cursor-pointer' 
                  : 'cursor-not-allowed opacity-60'
              } ${currentStep === 'results' ? 'text-purple-400' : 'text-slate-400'}`}
            >
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-200 ${currentStep === 'results' ? 'border-purple-400 bg-purple-400 text-white' : 'border-slate-400'}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Results</span>
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 shadow-xl border border-slate-700 flex-1 overflow-auto">
          {currentStep === 'ranges' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-purple-400 text-center mb-6">
                Select Hand Ranges
              </h2>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 h-full">
                {/* Hero Range */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Hero Range</h3>
                  <HandRangeSelector
                    selectedRange={heroRange}
                    onRangeChange={setHeroRange}
                    label="Your Hand Range"
                  />
                </div>

                {/* Villain Range */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Villain Range</h3>
                  <HandRangeSelector
                    selectedRange={villainRange}
                    onRangeChange={setVillainRange}
                    label="Opponent Hand Range"
                  />
                </div>
              </div>

              {/* Continue Button */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setCurrentStep('board')}
                  disabled={!canProceedToBoard()}
                  className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 ${
                    canProceedToBoard()
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg hover:shadow-xl'
                      : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Continue to Board Setup
                </button>
              </div>
            </div>
          )}

          {currentStep === 'board' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-purple-400">
                  Set Community Cards
                </h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={resetToRanges}
                    className="text-sm text-slate-400 hover:text-white flex items-center space-x-1"
                  >
                    <span>←</span>
                    <span>Edit Ranges</span>
                  </button>
                  {/* Show current ranges summary */}
                  <div className="text-xs text-slate-500">
                    Hero: {heroRange.length} hands • Villain: {villainRange.length} hands
                  </div>
                </div>
              </div>
              
              <BoardSelector
                board={board}
                onBoardChange={setBoard}
              />

              {/* Run Simulation Button */}
              {/* Range Summary */}
              <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-300 mb-1">Hero Range</div>
                    <div className="text-white font-semibold">{heroRange.length} hands selected</div>
                    {heroRange.length > 0 && (
                      <div className="text-xs text-slate-400 mt-1">
                        {heroRange.slice(0, 8).join(', ')}{heroRange.length > 8 ? ', ...' : ''}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-slate-300 mb-1">Villain Range</div>
                    <div className="text-white font-semibold">{villainRange.length} hands selected</div>
                    {villainRange.length > 0 && (
                      <div className="text-xs text-slate-400 mt-1">
                        {villainRange.slice(0, 8).join(', ')}{villainRange.length > 8 ? ', ...' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <div className="text-center space-y-4">
                  <div className="text-sm text-slate-400">
                    {iterations.toLocaleString()} iterations • {board.length === 0 ? 'Pre-flop' : board.length === 3 ? 'Flop' : board.length === 4 ? 'Turn' : 'River'} analysis
                  </div>
                  <button
                    onClick={handleRunSimulation}
                    disabled={isSimulating}
                    className="px-12 py-4 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 text-white font-bold text-xl rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isSimulating ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span>Running...</span>
                      </div>
                    ) : (
                      '🎲 Run Simulation'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'results' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-purple-400">
                  Simulation Results
                </h2>
                <div className="flex items-center space-x-6">
                  <button
                    onClick={resetToBoard}
                    className="text-sm text-slate-400 hover:text-white flex items-center space-x-1 transition-colors"
                  >
                    <span>←</span>
                    <span>Edit Board</span>
                  </button>
                  <button
                    onClick={resetToRanges}
                    className="text-sm text-slate-400 hover:text-white flex items-center space-x-1 transition-colors"
                  >
                    <span>←</span>
                    <span>Edit Ranges</span>
                  </button>
                </div>
              </div>
              
              {/* Simulation Summary */}
              <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Simulation Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-slate-400">Hero Range</div>
                    <div className="text-white font-medium">{heroRange.length} hands</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Villain Range</div>
                    <div className="text-white font-medium">{villainRange.length} hands</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Board</div>
                    <div className="text-white font-medium">
                      {board.length === 0 ? 'Pre-flop' : 
                       board.length === 3 ? 'Flop' : 
                       board.length === 4 ? 'Turn' : 'River'} 
                      ({board.length} cards)
                    </div>
                  </div>
                </div>
              </div>
              
              {results ? (
                <div className="max-w-2xl mx-auto">
                  <ResultsDisplay results={results} />
                  
                  {/* Action Buttons */}
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={handleRunSimulation}
                      disabled={isSimulating}
                      className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center space-x-2"
                    >
                      <span>🎲</span>
                      <span>{isSimulating ? 'Running...' : 'Run Again'}</span>
                    </button>
                  </div>
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
        <div className="mt-4 text-center text-white/50 text-xs flex-shrink-0">
          <p>Vibe coded by Karthik Puthraya © 2025</p>
        </div>
      </div>
    </div>
  );
}

export default App;
