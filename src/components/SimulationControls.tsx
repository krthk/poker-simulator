import React, { useState } from 'react';

interface SimulationControlsProps {
  iterations: number;
  onIterationsChange: (iterations: number) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  iterations,
  onIterationsChange,
  onRunSimulation,
  isSimulating,
}) => {
  const [isEditingIterations, setIsEditingIterations] = useState(false);
  const [tempIterations, setTempIterations] = useState(iterations.toString());

  const handleEditClick = () => {
    setTempIterations(iterations.toString());
    setIsEditingIterations(true);
  };

  const handleIterationsSave = () => {
    const value = parseInt(tempIterations);
    if (!isNaN(value) && value > 0) {
      onIterationsChange(value);
    }
    setIsEditingIterations(false);
  };

  const handleIterationsCancel = () => {
    setTempIterations(iterations.toString());
    setIsEditingIterations(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleIterationsSave();
    } else if (event.key === 'Escape') {
      handleIterationsCancel();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-purple-400">
        Simulation Controls
      </h2>

      {/* Iterations display/edit */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-white text-sm font-medium">
            Monte Carlo Iterations:
          </label>
          {!isEditingIterations && (
            <button
              onClick={handleEditClick}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>✏️</span>
              Edit
            </button>
          )}
        </div>
        
        {isEditingIterations ? (
          <div className="flex gap-2">
            <input
              type="number"
              value={tempIterations}
              onChange={(e) => setTempIterations(e.target.value)}
              onKeyDown={handleKeyPress}
              min="1"
              max="10000000"
              className="flex-1 p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter iterations"
              autoFocus
            />
            <button
              onClick={handleIterationsSave}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded transition-colors"
            >
              ✓
            </button>
            <button
              onClick={handleIterationsCancel}
              className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <div className="text-white font-semibold text-lg">
              {iterations.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">
              Higher = more accurate, slower computation
            </div>
          </div>
        )}
      </div>

      {/* Accuracy indicator */}
      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
        <div className="text-white text-sm">
          <div className="flex justify-between items-center">
            <span>Accuracy Level:</span>
            <span className="font-semibold text-purple-400">
              {iterations >= 1000000 ? 'Very High' :
               iterations >= 100000 ? 'High' :
               iterations >= 10000 ? 'Good' : 'Basic'}
            </span>
          </div>
        </div>
      </div>

      {/* Run simulation button */}
      <button
        onClick={onRunSimulation}
        disabled={isSimulating}
        className={`
          w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform
          ${isSimulating
            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
            : 'poker-button primary hover:scale-105 shadow-xl hover:shadow-2xl'
          }
        `}
      >
        {isSimulating ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <span>Running Simulation...</span>
          </div>
        ) : (
          '🎲 Run Simulation'
        )}
      </button>

      {/* Information */}
      <div className="text-white/70 text-xs text-center">
        {isSimulating ? (
          <p>Calculating equity across {iterations.toLocaleString()} random scenarios...</p>
        ) : (
          <p>Click to start Monte Carlo simulation with {iterations.toLocaleString()} iterations</p>
        )}
      </div>
    </div>
  );
};

export default SimulationControls;
