import React, { useEffect } from 'react';

interface HelpPageProps {
  onClose: () => void;
}

const HelpPage: React.FC<HelpPageProps> = ({ onClose }) => {
  // Handle Escape key to close help page
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-lg rounded-3xl border border-slate-600/50 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-lg border-b border-slate-600/50 p-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Poker Simulator Help & FAQ
            </h1>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl p-2 rounded-full hover:bg-slate-700 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">1</span>
              Overview
            </h2>
            <div className="bg-slate-700/30 rounded-xl p-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">
                The Poker Simulator is a comprehensive tool for analyzing Texas Hold'em scenarios. It calculates 
                equity (win probability) for multiple players with different hand ranges across various board textures.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="text-green-400 font-semibold mb-2">✅ What it does:</h4>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• Calculates win probabilities for up to 10 players</li>
                    <li>• Supports complex hand range analysis</li>
                    <li>• Simulates pre-flop, flop, turn, and river scenarios</li>
                    <li>• Provides detailed equity breakdowns</li>
                  </ul>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="text-blue-400 font-semibold mb-2">🎯 Perfect for:</h4>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• Study sessions and hand analysis</li>
                    <li>• Tournament and cash game preparation</li>
                    <li>• Understanding range vs range equity</li>
                    <li>• Exploring different board textures</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Step-by-Step Guide */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">2</span>
              Step-by-Step Guide
            </h2>
            
            {/* Step 1: Players */}
            <div className="space-y-6">
              <div className="bg-slate-700/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-300 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">1</span>
                  Select Players
                </h3>
                <div className="space-y-3">
                  <p className="text-slate-300">Choose table format and add players by clicking seat positions around the poker table.</p>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-yellow-400 font-semibold mb-2">How to use:</h4>
                    <ul className="text-slate-300 text-sm space-y-1 ml-4">
                      <li>• <strong>Select table format:</strong> 6-max, 9-max, or full-ring (10 seats)</li>
                      <li>• <strong>Click seat positions</strong> to add/remove players</li>
                      <li>• <strong>First player is Hero</strong> (marked with crown 👑)</li>
                      <li>• <strong>Minimum 2 players</strong> required for simulation</li>
                      <li>• <strong>Position matters</strong> - UTG, Button, Blinds affect default ranges</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2: Ranges */}
              <div className="bg-slate-700/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-green-300 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">2</span>
                  Select Hand Ranges
                </h3>
                <div className="space-y-3">
                  <p className="text-slate-300">Assign hand ranges to each player using multiple methods.</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <h4 className="text-purple-400 font-semibold mb-2">Selection Methods:</h4>
                      <ul className="text-slate-300 text-sm space-y-1">
                        <li>• <strong>Click individual hands</strong> in the 13x13 matrix</li>
                        <li>• <strong>Drag to select/deselect</strong> multiple hands at once</li>
                        <li>• <strong>Preset buttons:</strong> Premium, Ultra-tight, Tight, Medium, Loose, Any Two</li>
                        <li>• <strong>Percentage slider</strong> for top X% of hands (0-100%)</li>
                        <li>• <strong>Clear button</strong> to remove all selected hands</li>
                      </ul>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <h4 className="text-orange-400 font-semibold mb-2">Hand Types:</h4>
                      <ul className="text-slate-300 text-sm space-y-1">
                        <li>• <strong>Pairs:</strong> AA, KK, QQ... 22</li>
                        <li>• <strong>Suited:</strong> AKs, QJs, 76s (same suit)</li>
                        <li>• <strong>Offsuit:</strong> AKo, QJo, 76o (different suits)</li>
                        <li>• <strong>Color coding:</strong> Selected = purple, Available = gray</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Board */}
              <div className="bg-slate-700/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-orange-300 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">3</span>
                  Set Community Cards
                </h3>
                <div className="space-y-3">
                  <p className="text-slate-300">Choose community cards or run pre-flop analysis.</p>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-cyan-400 font-semibold mb-2">Board Options:</h4>
                    <ul className="text-slate-300 text-sm space-y-1 ml-4">
                      <li>• <strong>Pre-flop:</strong> Leave cards empty for fastest simulation</li>
                      <li>• <strong>Flop:</strong> Click card selector to choose 3 community cards</li>
                      <li>• <strong>Turn:</strong> Add 4th card after setting flop</li>
                      <li>• <strong>River:</strong> Add 5th card for complete board analysis</li>
                      <li>• <strong>Clear board:</strong> Remove all cards to return to pre-flop</li>
                      <li>• <strong>Real-time updates:</strong> Equity changes as you add/remove cards</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 4: Results */}
              <div className="bg-slate-700/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-red-300 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">4</span>
                  View Results
                </h3>
                <div className="space-y-3">
                  <p className="text-slate-300">Analyze detailed equity calculations and statistics.</p>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-pink-400 font-semibold mb-2">Results Include:</h4>
                    <ul className="text-slate-300 text-sm space-y-1 ml-4">
                      <li>• <strong>Equity %:</strong> Win probability for each player (sorted by rank)</li>
                      <li>• <strong>Win/Tie/Loss counts:</strong> Detailed outcome breakdown</li>
                      <li>• <strong>Player ranking:</strong> #1 winner with crown, Hero highlighted</li>
                      <li>• <strong>Equity distribution:</strong> Visual progress bars and percentages</li>
                      <li>• <strong>Key statistics:</strong> Winner margin, Hero rank, valid hands simulated</li>
                      <li>• <strong>Action buttons:</strong> Run Again or start New Analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Hand Range Tips */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">3</span>
              Hand Range Tips
            </h2>
            <div className="bg-slate-700/30 rounded-xl p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-green-400 font-semibold mb-3">Common Ranges:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="bg-slate-800/50 rounded p-3">
                      <strong className="text-red-400">Premium (2.1%):</strong>
                      <div className="text-slate-300 mt-1">AA, KK, QQ, AKs, AKo</div>
                    </div>
                    <div className="bg-slate-800/50 rounded p-3">
                      <strong className="text-orange-400">Ultra-tight (4.5%):</strong>
                      <div className="text-slate-300 mt-1">Premium + JJ, AQs, AQo</div>
                    </div>
                    <div className="bg-slate-800/50 rounded p-3">
                      <strong className="text-yellow-400">Tight (13.1%):</strong>
                      <div className="text-slate-300 mt-1">Strong pairs, premium aces, suited broadways</div>
                    </div>
                    <div className="bg-slate-800/50 rounded p-3">
                      <strong className="text-blue-400">Medium (25.6%):</strong>
                      <div className="text-slate-300 mt-1">Pairs 77+, suited aces, most broadways</div>
                    </div>
                    <div className="bg-slate-800/50 rounded p-3">
                      <strong className="text-green-400">Loose (46.3%):</strong>
                      <div className="text-slate-300 mt-1">Any pair, ace, suited king, connectors</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-blue-400 font-semibold mb-3">Position Considerations:</h4>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div><strong>Early Position (UTG):</strong> Tighter ranges, premium hands</div>
                    <div><strong>Middle Position:</strong> Slightly wider, add suited connectors</div>
                    <div><strong>Late Position (Button):</strong> Widest ranges, steal attempts</div>
                    <div><strong>Blinds:</strong> Defend wider, but consider position post-flop</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">4</span>
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              
              <div className="bg-slate-700/30 rounded-xl p-4">
                <h4 className="text-yellow-400 font-semibold mb-2">Q: How accurate are the simulations?</h4>
                <p className="text-slate-300 text-sm">
                  Very accurate. The simulator runs thousands of random hand combinations and calculates exact probabilities. 
                  More iterations = higher accuracy, but even 10,000 hands gives reliable results for most scenarios.
                </p>
              </div>

              <div className="bg-slate-700/30 rounded-xl p-4">
                <h4 className="text-yellow-400 font-semibold mb-2">Q: What's the difference between suited and offsuit hands?</h4>
                <p className="text-slate-300 text-sm">
                  Suited hands (like AKs) have both cards of the same suit, giving flush potential. Offsuit hands (AKo) 
                  are different suits. Suited hands are stronger and have ~2-3% higher equity on average.
                </p>
              </div>

              <div className="bg-slate-700/30 rounded-xl p-4">
                <h4 className="text-yellow-400 font-semibold mb-2">Q: Why do some hands show different combination counts?</h4>
                <p className="text-slate-300 text-sm">
                  Pocket pairs have 6 combinations (AA = A♠A♥, A♠A♦, etc.), suited hands have 4 combinations, 
                  and offsuit hands have 12 combinations. The simulator accounts for this mathematically.
                </p>
              </div>

              <div className="bg-slate-700/30 rounded-xl p-4">
                <h4 className="text-yellow-400 font-semibold mb-2">Q: How do I interpret equity percentages?</h4>
                <p className="text-slate-300 text-sm">
                  Equity is your probability of winning at showdown. 60% equity means you win 6 out of 10 times. 
                  In a 2-player scenario, 50% = coin flip, 70%+ = strong advantage, 30%- = underdog.
                </p>
              </div>

              <div className="bg-slate-700/30 rounded-xl p-4">
                <h4 className="text-yellow-400 font-semibold mb-2">Q: Should I always include community cards?</h4>
                <p className="text-slate-300 text-sm">
                  Not necessarily. Pre-flop analysis is perfect for studying opening ranges and 3-bet scenarios. 
                  Use specific boards to analyze texture-dependent spots like continuation betting or turn decisions.
                </p>
              </div>

              <div className="bg-slate-700/30 rounded-xl p-4">
                <h4 className="text-yellow-400 font-semibold mb-2">Q: What happens if I clear a player's range?</h4>
                <p className="text-slate-300 text-sm">
                  The app prevents progression to Step 3 (Board Setup) if any active player has an empty range. 
                  All players must have at least one hand selected to run the simulation. This ensures valid equity calculations.
                </p>
              </div>

              <div className="bg-slate-700/30 rounded-xl p-4">
                <h4 className="text-yellow-400 font-semibold mb-2">Q: Can I save or export results?</h4>
                <p className="text-slate-300 text-sm">
                  Currently, results are displayed in the browser. You can take screenshots or manually record key statistics. 
                  The "Run Again" button lets you re-simulate with the same settings for consistency checks.
                </p>
              </div>

            </div>
          </section>

          {/* Best Practices */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">5</span>
              Best Practices
            </h2>
            <div className="bg-slate-700/30 rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-green-400 font-semibold mb-3">Study Tips:</h4>
                  <ul className="text-slate-300 text-sm space-y-2">
                    <li>• Start with simple 2-player scenarios</li>
                    <li>• Compare similar hands (AK vs AQ vs AJ)</li>
                    <li>• Test position-based range adjustments</li>
                    <li>• Analyze how board texture affects equity</li>
                    <li>• Use realistic ranges for your stakes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-blue-400 font-semibold mb-3">Common Mistakes:</h4>
                  <ul className="text-slate-300 text-sm space-y-2">
                    <li>• Using unrealistic tight/loose ranges</li>
                    <li>• Ignoring position in range construction</li>
                    <li>• Over-analyzing specific board textures</li>
                    <li>• Forgetting suited vs offsuit distinctions</li>
                    <li>• Not considering opponent tendencies</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Notes */}
          <section>
            <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">6</span>
              Technical Notes
            </h2>
            <div className="bg-slate-700/30 rounded-xl p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-cyan-400 font-semibold mb-3">Simulation Details:</h4>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• Monte Carlo simulation method</li>
                    <li>• Random sampling from defined ranges</li>
                    <li>• Card removal effects considered</li>
                    <li>• Standard 52-card deck</li>
                    <li>• No-limit Texas Hold'em rules</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-purple-400 font-semibold mb-3">Performance:</h4>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• Runs entirely in your browser</li>
                    <li>• No data sent to external servers</li>
                    <li>• Optimized for modern devices</li>
                    <li>• Real-time calculations</li>
                    <li>• Responsive design for mobile/desktop</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-lg border-t border-slate-600/50 p-4 rounded-b-3xl">
          <div className="text-center">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg"
            >
              Got it! Let's start analyzing
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HelpPage;
