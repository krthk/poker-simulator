import React from 'react';
import { SimulationResult } from '../types/poker';

interface ResultsDisplayProps {
  results: SimulationResult;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const { hero, villain } = results;

  const formatPercentage = (value: number): string => {
    return value.toFixed(1);
  };

  const formatNumber = (value: number): string => {
    return value.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-poker-gold">
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
        <div className="bg-gradient-to-r from-poker-gold/20 to-poker-gold/10 rounded-lg p-4 border border-poker-gold/30">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-poker-gold font-semibold text-lg">Hero Equity</h3>
            <div className="text-poker-gold font-bold text-2xl">
              {formatPercentage(hero.equity)}%
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-3 mb-3">
            <div
              className="bg-poker-gold h-3 rounded-full transition-all duration-1000 ease-out"
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
        <div className="bg-gradient-to-r from-poker-red/20 to-poker-red/10 rounded-lg p-4 border border-poker-red/30">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-poker-red font-semibold text-lg">Villain Equity</h3>
            <div className="text-poker-red font-bold text-2xl">
              {formatPercentage(villain.equity)}%
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-3 mb-3">
            <div
              className="bg-poker-red h-3 rounded-full transition-all duration-1000 ease-out"
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
