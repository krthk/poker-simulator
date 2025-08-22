import React from 'react';
import { SimulationResult, LegacySimulationResult, PlayerResult } from '../types/poker';

interface ResultsDisplayProps {
  results: SimulationResult | LegacySimulationResult;
  players?: any[];
  board?: any[];
  iterations?: number;
  onRunAgain?: () => void;
  onNewAnalysis?: () => void;
  isSimulating?: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, players: contextPlayers, board, iterations: contextIterations, onRunAgain, onNewAnalysis, isSimulating }) => {
  // Check if this is the new multi-player format or legacy format
  const isMultiPlayer = 'players' in results;
  
  if (!isMultiPlayer) {
    // Legacy two-player display
    const legacyResults = results as LegacySimulationResult;
    return <LegacyResultsDisplay results={legacyResults} />;
  }

  const multiResults = results as SimulationResult;
  const players = multiResults.players.sort((a, b) => b.equity - a.equity); // Sort by equity descending
  const heroPlayer = players.find(p => p.playerName === 'Hero');
  const totalHands = multiResults.totalHandsSimulated;

  const formatPercentage = (value: number): string => {
    return value.toFixed(1);
  };

  const formatNumber = (value: number): string => {
    return value.toLocaleString();
  };

  const getPlayerColor = (player: PlayerResult, index: number): string => {
    if (player.playerName === 'Hero') return 'purple';
    const colors = ['blue', 'green', 'yellow', 'pink', 'indigo', 'red', 'cyan', 'orange'];
    return colors[index % colors.length];
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, any> = {
      purple: { bg: 'from-purple-500/20 to-purple-400/10', border: 'border-purple-400/30', text: 'text-purple-400', progress: 'bg-purple-500' },
      blue: { bg: 'from-blue-500/20 to-blue-400/10', border: 'border-blue-400/30', text: 'text-blue-400', progress: 'bg-blue-500' },
      green: { bg: 'from-green-500/20 to-green-400/10', border: 'border-green-400/30', text: 'text-green-400', progress: 'bg-green-500' },
      yellow: { bg: 'from-yellow-500/20 to-yellow-400/10', border: 'border-yellow-400/30', text: 'text-yellow-400', progress: 'bg-yellow-500' },
      pink: { bg: 'from-pink-500/20 to-pink-400/10', border: 'border-pink-400/30', text: 'text-pink-400', progress: 'bg-pink-500' },
      indigo: { bg: 'from-indigo-500/20 to-indigo-400/10', border: 'border-indigo-400/30', text: 'text-indigo-400', progress: 'bg-indigo-500' },
      red: { bg: 'from-red-500/20 to-red-400/10', border: 'border-red-400/30', text: 'text-red-400', progress: 'bg-red-500' },
      cyan: { bg: 'from-cyan-500/20 to-cyan-400/10', border: 'border-cyan-400/30', text: 'text-cyan-400', progress: 'bg-cyan-500' },
      orange: { bg: 'from-orange-500/20 to-orange-400/10', border: 'border-orange-400/30', text: 'text-orange-400', progress: 'bg-orange-500' }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Compact simulation summary */}
      <div className="bg-slate-700/20 rounded-lg p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-slate-300">
              {players.length} players • {formatNumber(multiResults.iterations)} iterations
            </span>
            {board && (
              <span className="text-slate-400">
                {board.length === 0 ? 'Pre-flop' : 
                 board.length === 3 ? 'Flop' : 
                 board.length === 4 ? 'Turn' : 'River'}
              </span>
            )}
          </div>
          {/* Action buttons integrated in header */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onRunAgain}
              disabled={isSimulating}
              className="px-3 py-1 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 text-white text-xs font-medium rounded transition-all duration-200"
            >
              {isSimulating ? 'Running...' : 'Run Again'}
            </button>
            <button
              onClick={onNewAnalysis}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs font-medium rounded transition-all duration-200"
            >
              New Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3">
        {/* Results Section - Takes main space */}
        <div className="flex-1">
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-600/30">
            <div className="space-y-3">
              {/* Compact winner banner */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <div className="text-yellow-400 font-bold">{players[0]?.playerName || 'N/A'}</div>
                    <div className="text-yellow-300 text-sm">{formatPercentage(players[0]?.equity || 0)}% Equity</div>
                  </div>
                </div>
              </div>

                {/* Player Results */}
                <div className="space-y-2">
                  {players.map((player, index) => {
                    const color = getPlayerColor(player, index);
                    const colorClasses = getColorClasses(color);
                    const isHero = player.playerName === 'Hero';
                    const rank = index + 1;
                    const isWinner = index === 0;
                    
                    return (
                      <div key={player.playerId} className={`relative overflow-hidden`}>
                        {/* Glow effect for winner and hero */}
                        {(isWinner || isHero) && (
                          <div className={`absolute inset-0 bg-gradient-to-r ${isWinner ? 'from-yellow-500/20 to-orange-500/20' : 'from-purple-500/20 to-purple-600/20'} rounded-2xl blur-sm`}></div>
                        )}
                        
                        <div className={`relative bg-gradient-to-r ${colorClasses.bg} rounded-xl p-3 border-2 ${isWinner ? 'border-yellow-500/50' : isHero ? 'border-purple-500/50' : colorClasses.border} backdrop-blur-sm`}>
                          {/* Rank badge */}
                          <div className={`absolute -top-1 -left-1 w-6 h-6 ${isWinner ? 'bg-yellow-500' : isHero ? 'bg-purple-600' : 'bg-slate-700'} border border-white/20 rounded-full flex items-center justify-center shadow-lg`}>
                            <span className="text-white font-bold text-xs">#{rank}</span>
                          </div>
                          
                          {/* Hero crown */}
                          {isHero && (
                            <div className="absolute -top-1 right-4">
                              <span className="text-2xl drop-shadow-lg">👑</span>
                            </div>
                          )}

                          {/* Winner trophy */}
                          {isWinner && !isHero && (
                            <div className="absolute -top-1 right-4">
                              <span className="text-2xl drop-shadow-lg">🏆</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-10 h-10 rounded-full ${colorClasses.progress} flex items-center justify-center text-white font-bold text-sm border-2 border-white/30 shadow-lg`}>
                                {player.playerName.charAt(0)}
                              </div>
                              <div>
                                <h3 className={`${colorClasses.text} font-bold flex items-center gap-1`}>
                                  {player.playerName}
                                  {isHero && <span className="text-xs">👑</span>}
                                  {isWinner && !isHero && <span className="text-xs">🏆</span>}
                                </h3>
                                <p className="text-slate-300 text-xs">{player.position}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`${colorClasses.text} font-bold text-xl drop-shadow-sm`}>
                                {formatPercentage(player.equity)}%
                              </div>
                              <div className="text-slate-400 text-xs">equity</div>
                            </div>
                          </div>
                          
                          {/* Compact Progress bar */}
                          <div className="w-full bg-white/10 rounded-full h-2 mt-2 mb-2 shadow-inner">
                            <div
                              className={`${colorClasses.progress} h-2 rounded-full transition-all duration-1000 ease-out relative shadow-lg`}
                              style={{ width: `${player.equity}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30 rounded-full"></div>
                            </div>
                          </div>

                          {/* Inline compact stats */}
                          <div className="flex justify-between text-xs text-white/70">
                            <span>W: {formatNumber(player.wins)}</span>
                            <span>T: {formatNumber(player.ties)}</span>
                            <span>Tot: {formatNumber(player.total)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
            </div>
          </div>
        </div>

        {/* Compact Side Panel */}
        <div className="lg:w-64 space-y-3">
          {/* Key Stats */}
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-600/30">
            <h4 className="text-xs font-bold text-slate-200 mb-2">Key Stats</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Winner</span>
                <span className="text-yellow-400 font-semibold">{players[0]?.playerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Margin</span>
                <span className="text-white font-semibold">
                  {players.length > 1 ? `${formatPercentage(Math.abs(players[0].equity - players[1].equity))}%` : 'N/A'}
                </span>
              </div>
              {heroPlayer && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Hero Rank</span>
                  <span className="text-purple-400 font-semibold">
                    #{players.findIndex(p => p.playerId === heroPlayer.playerId) + 1}/{players.length}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Valid Hands</span>
                <span className="text-white font-semibold">{formatNumber(totalHands)}</span>
              </div>
            </div>
          </div>

          {/* Compact Equity Chart */}
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-600/30">
            <h4 className="text-xs font-bold text-slate-200 mb-2">Equity Distribution</h4>
            <div className="space-y-1">
              {players.map((player, index) => {
                const color = getPlayerColor(player, index);
                const colorClasses = getColorClasses(color);
                return (
                  <div key={player.playerId} className="flex items-center gap-2">
                    <div className={`w-2 h-2 ${colorClasses.progress} rounded-full`}></div>
                    <span className="text-xs text-slate-300 flex-1 truncate">{player.playerName}</span>
                    <span className="text-xs text-white font-semibold">{formatPercentage(player.equity)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Legacy two-player results display
const LegacyResultsDisplay: React.FC<{ results: LegacySimulationResult }> = ({ results }) => {
  const { hero, villain } = results;

  const formatPercentage = (value: number): string => {
    return value.toFixed(1);
  };

  const formatNumber = (value: number): string => {
    return value.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-purple-400">
        Simulation Results
      </h2>

      {/* Summary stats */}
      <div className="bg-white/5 rounded-lg p-4">
        <div className="text-white text-sm mb-2">
          Simulated <span className="font-semibold">{formatNumber(results.iterations)}</span> iterations
          with <span className="font-semibold">{formatNumber(hero.total)}</span> valid matchups
        </div>
      </div>

      {/* Equity comparison */}
      <div className="space-y-4">
        {/* Hero equity */}
        <div className="bg-gradient-to-r from-purple-500/20 to-purple-400/10 rounded-lg p-4 border border-purple-400/30">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-purple-400 font-semibold text-lg">Hero Equity</h3>
            <div className="text-purple-400 font-bold text-2xl">
              {formatPercentage(hero.equity)}%
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-3 mb-3">
            <div
              className="bg-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${hero.equity}%` }}
            ></div>
          </div>

          {/* Detailed stats */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-white/70">Wins</div>
              <div className="text-white font-semibold">{formatNumber(hero.wins)}</div>
              <div className="text-white/50 text-xs">
                {formatPercentage((hero.wins / hero.total) * 100)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/70">Ties</div>
              <div className="text-white font-semibold">{formatNumber(hero.ties)}</div>
              <div className="text-white/50 text-xs">
                {formatPercentage((hero.ties / hero.total) * 100)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/70">Losses</div>
              <div className="text-white font-semibold">{formatNumber(villain.wins)}</div>
              <div className="text-white/50 text-xs">
                {formatPercentage((villain.wins / hero.total) * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Villain equity */}
        <div className="bg-gradient-to-r from-red-500/20 to-red-400/10 rounded-lg p-4 border border-red-400/30">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-red-400 font-semibold text-lg">Villain Equity</h3>
            <div className="text-red-400 font-bold text-2xl">
              {formatPercentage(villain.equity)}%
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-3 mb-3">
            <div
              className="bg-red-500 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${villain.equity}%` }}
            ></div>
          </div>

          {/* Detailed stats */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-white/70">Wins</div>
              <div className="text-white font-semibold">{formatNumber(villain.wins)}</div>
              <div className="text-white/50 text-xs">
                {formatPercentage((villain.wins / villain.total) * 100)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/70">Ties</div>
              <div className="text-white font-semibold">{formatNumber(villain.ties)}</div>
              <div className="text-white/50 text-xs">
                {formatPercentage((villain.ties / villain.total) * 100)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/70">Losses</div>
              <div className="text-white font-semibold">{formatNumber(hero.wins)}</div>
              <div className="text-white/50 text-xs">
                {formatPercentage((hero.wins / villain.total) * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equity ratio */}
      <div className="bg-white/5 rounded-lg p-4">
        <div className="text-center">
          <div className="text-white/70 text-sm mb-1">Equity Ratio</div>
          <div className="text-white font-bold text-lg">
            {formatPercentage(hero.equity)} : {formatPercentage(villain.equity)}
          </div>
          <div className="text-white/50 text-xs mt-1">
            {hero.equity > villain.equity ? 'Hero favored' : 
             villain.equity > hero.equity ? 'Villain favored' : 'Even match'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
