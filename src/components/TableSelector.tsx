import React, { useState } from 'react';
import { Player, TablePosition } from '../types/poker';
import { getTopPercentHands, PRESET_PERCENTAGES } from '../poker/handStrength';

interface TableSelectorProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  onPlayerSelect: (player: Player) => void;
  selectedPlayer: Player | null;
  onContinue?: () => void;
  canContinue?: boolean;
}

const TABLE_POSITIONS: Array<{ position: TablePosition; seat: number; name: string }> = [
  { position: 'UTG', seat: 1, name: 'UTG' },
  { position: 'UTG+1', seat: 2, name: 'UTG+1' },
  { position: 'MP1', seat: 3, name: 'MP1' },
  { position: 'MP2', seat: 4, name: 'MP2' },
  { position: 'MP3', seat: 5, name: 'MP3' },
  { position: 'HJ', seat: 6, name: 'HJ' },
  { position: 'CO', seat: 7, name: 'CO' },
  { position: 'BTN', seat: 8, name: 'BTN' },
  { position: 'SB', seat: 9, name: 'SB' },
  { position: 'BB', seat: 10, name: 'BB' }
];

type GameFormat = '6-max' | '9-max' | 'full-ring';

const TableSelector: React.FC<TableSelectorProps> = ({
  players,
  onPlayersChange,
  onPlayerSelect,
  selectedPlayer,
  onContinue,
  canContinue = false
}) => {
  const [heroSet, setHeroSet] = useState(false);
  const [gameFormat, setGameFormat] = useState<GameFormat>('6-max');
  
  // Helper function to get default range based on position
  const getDefaultRange = (pos: TablePosition): string[] => {
    switch (pos) {
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
  
  // Get available seats based on game format
  const getAvailableSeats = (format: GameFormat): number[] => {
    switch (format) {
      case '6-max':
        return [1, 6, 7, 8, 9, 10]; // UTG, HJ, CO, BTN, SB, BB (clockwise from top)
      case '9-max':
        return [1, 2, 4, 5, 6, 7, 8, 9, 10]; // UTG, UTG+1, MP2, MP3, HJ, CO, BTN, SB, BB (clockwise)
      case 'full-ring':
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // All positions (clockwise)
      default:
        return [1, 6, 7, 8, 9, 10];
    }
  };
  
  // Function to change game format and clear players
  const changeGameFormat = (format: GameFormat) => {
    setGameFormat(format);
    onPlayersChange([]); // Clear all players when format changes
    setHeroSet(false);
  };

  // Check if a seat is available in the current game format
  const isSeatAvailable = (seat: number): boolean => {
    return getAvailableSeats(gameFormat).includes(seat);
  };

  const getPlayerAtSeat = (seat: number): Player | null => {
    return players.find(p => p.seatNumber === seat) || null;
  };

  const toggleSeat = (seat: number, position: TablePosition) => {
    const existingPlayer = getPlayerAtSeat(seat);
    
    if (existingPlayer) {
      // Remove player
      const newPlayers = players.filter(p => p.seatNumber !== seat);
      onPlayersChange(newPlayers);
      
      // If removing hero, reset heroSet
      if (existingPlayer.isHero) {
        setHeroSet(false);
      }
    } else {
      // Add player
      const isFirstPlayer = players.length === 0;
      
      const newPlayer: Player = {
        id: `player-${seat}`,
        name: isFirstPlayer && !heroSet ? 'Hero' : `Player ${seat}`,
        position,
        range: getDefaultRange(position),
        isHero: isFirstPlayer && !heroSet,
        isActive: true,
        seatNumber: seat
      };
      
      if (newPlayer.isHero) {
        setHeroSet(true);
      }
      
      onPlayersChange([...players, newPlayer]);
    }
  };


  const getSeatPosition = (seat: number) => {
    // Get available seats for current format and find the index of this seat
    const availableSeats = getAvailableSeats(gameFormat);
    const seatIndex = availableSeats.indexOf(seat);
    
    // If seat is not available in current format, return default position
    if (seatIndex === -1) {
      return { x: 300, y: 220 };
    }
    
    // Find the index of the button seat (seat 8) in available seats
    const buttonIndex = availableSeats.indexOf(8);
    
    // Calculate position evenly distributed around elliptical table
    const totalSeats = availableSeats.length;
    
    // Adjust angle so button (seat 8) is always at 6 o'clock (π/2 radians)
    // Start from button position and distribute other seats around
    let angle;
    if (buttonIndex !== -1) {
      // Calculate relative position from button
      const relativeIndex = (seatIndex - buttonIndex + totalSeats) % totalSeats;
      angle = (relativeIndex / totalSeats) * 2 * Math.PI + Math.PI / 2; // Button at 6 o'clock
    } else {
      // Fallback if no button (shouldn't happen in normal poker)
      angle = (seatIndex / totalSeats) * 2 * Math.PI - Math.PI / 2;
    }
    
    const radiusX = 260; // Horizontal radius
    const radiusY = 180; // Vertical radius
    const centerX = 300; // Center X
    const centerY = 220; // Center Y
    
    return {
      x: centerX + radiusX * Math.cos(angle),
      y: centerY + radiusY * Math.sin(angle)
    };
  };

  const getActivePlayerCount = () => players.length;
  const getHeroPlayer = () => players.find(p => p.isHero);

  // Get button chip position (in front of button seat)
  const getButtonChipPosition = () => {
    const availableSeats = getAvailableSeats(gameFormat);
    const buttonSeat = 8; // BTN is always seat 8
    
    if (!availableSeats.includes(buttonSeat)) {
      return null; // No button in this format
    }
    
    const buttonPos = getSeatPosition(buttonSeat);
    
    // Calculate position between button seat and center of table
    const centerX = 300;
    const centerY = 220;
    const offsetFactor = 0.6; // 60% of the way from center to button
    
    return {
      x: centerX + (buttonPos.x - centerX) * offsetFactor,
      y: centerY + (buttonPos.y - centerY) * offsetFactor
    };
  };

  return (
    <div className="h-full flex flex-col space-y-2 sm:space-y-4 overflow-hidden">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-1 sm:mb-2">
          Select Players
        </h2>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-2 sm:gap-4 min-h-0">
        {/* Left Section - Table and Button */}
        <div className="flex-1 flex flex-col items-center space-y-2 sm:space-y-4">
          {/* Table Section */}
          <div className="flex justify-center items-center h-[280px] sm:h-[400px] lg:h-[500px] w-full">
            <div className="relative w-full max-w-[350px] sm:max-w-[500px] lg:max-w-[650px] h-full flex-shrink-0">
              {/* Outer glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl"></div>
              
              {/* Table container with enhanced styling */}
              <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-3xl p-2 sm:p-4 lg:p-6 border border-slate-600/50 shadow-2xl w-full h-full flex items-center justify-center">
                <svg 
                  width="100%" 
                  height="100%" 
                  viewBox="0 0 600 440" 
                  className="overflow-visible drop-shadow-lg max-w-full max-h-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                {/* Table shadow */}
                <ellipse 
                  cx="300" 
                  cy="225" 
                  rx="235" 
                  ry="155" 
                  fill="rgba(0,0,0,0.3)" 
                  className="blur-sm"
                />
                
                {/* Table outline with gradient */}
                <defs>
                  <radialGradient id="tableGradient" cx="0.5" cy="0.3">
                    <stop offset="0%" stopColor="rgb(34 197 94)" />
                    <stop offset="70%" stopColor="rgb(21 128 61)" />
                    <stop offset="100%" stopColor="rgb(15 78 46)" />
                  </radialGradient>
                  <radialGradient id="feltGradient" cx="0.5" cy="0.3">
                    <stop offset="0%" stopColor="rgb(34 197 94)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="rgb(15 78 46)" stopOpacity="0.6" />
                  </radialGradient>
                  <radialGradient id="buttonGradient" cx="0.3" cy="0.3">
                    <stop offset="0%" stopColor="rgb(239 68 68)" />
                    <stop offset="70%" stopColor="rgb(185 28 28)" />
                    <stop offset="100%" stopColor="rgb(127 29 29)" />
                  </radialGradient>
                </defs>
                
                {/* Outer table ring */}
                <ellipse 
                  cx="300" 
                  cy="220" 
                  rx="230" 
                  ry="150" 
                  fill="url(#tableGradient)" 
                  stroke="rgb(180 180 180)" 
                  strokeWidth="3"
                  className="drop-shadow-lg"
                />
                
                {/* Inner felt area */}
                <ellipse 
                  cx="300" 
                  cy="220" 
                  rx="200" 
                  ry="120" 
                  fill="url(#feltGradient)" 
                />

                {/* Center text without circle */}
                <text
                  x="300"
                  y="215"
                  textAnchor="middle"
                  className="fill-white/20 text-xs font-bold pointer-events-none"
                  style={{ fontSize: '10px' }}
                >
                  NO LIMIT
                </text>
                <text
                  x="300"
                  y="230"
                  textAnchor="middle"
                  className="fill-white/20 text-xs font-bold pointer-events-none"
                  style={{ fontSize: '10px' }}
                >
                  TEXAS HOLD'EM
                </text>

                {/* Button chip */}
                {(() => {
                  const buttonChipPos = getButtonChipPosition();
                  if (!buttonChipPos) return null;
                  
                  return (
                    <g>
                      {/* Button chip shadow */}
                      <circle
                        cx={buttonChipPos.x + 1}
                        cy={buttonChipPos.y + 1}
                        r="12"
                        fill="rgba(0,0,0,0.3)"
                      />
                      {/* Button chip */}
                      <circle
                        cx={buttonChipPos.x}
                        cy={buttonChipPos.y}
                        r="12"
                        fill="url(#buttonGradient)"
                        stroke="rgb(255 255 255)"
                        strokeWidth="2"
                        className="drop-shadow-lg"
                      />
                      {/* Button text */}
                      <text
                        x={buttonChipPos.x}
                        y={buttonChipPos.y + 1}
                        textAnchor="middle"
                        className="fill-white text-xs font-bold pointer-events-none"
                        style={{ fontSize: '8px' }}
                      >
                        D
                      </text>
                    </g>
                  );
                })()}

                {/* Seat positions with enhanced styling */}
                {TABLE_POSITIONS.map(({ position, seat, name }) => {
                  const pos = getSeatPosition(seat);
                  const player = getPlayerAtSeat(seat);
                  const isSelected = selectedPlayer?.seatNumber === seat;
                  const isAvailable = isSeatAvailable(seat);
                  
                  // Don't render seats that aren't available in current format
                  if (!isAvailable) return null;
                  
                  return (
                    <g key={seat}>
                      {/* Seat glow effect for active players */}
                      {player && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="40"
                          fill={player.isHero ? 'rgb(147 51 234)' : 'rgb(59 130 246)'}
                          opacity="0.2"
                          className="animate-pulse"
                        />
                      )}
                      
                      {/* Seat background circle */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="30"
                        fill={player ? 
                          (player.isHero ? 'rgb(147 51 234)' : 'rgb(59 130 246)') : 
                          'rgba(71, 85, 105, 0.8)'
                        }
                        stroke={isSelected ? 'rgb(251 191 36)' : player ? 'rgb(255 255 255)' : 'rgb(148 163 184)'}
                        strokeWidth={isSelected ? "4" : "2"}
                        className={`cursor-pointer transition-all duration-300 ${
                          player ? 'hover:brightness-110 drop-shadow-lg' : 'hover:fill-slate-600'
                        }`}
                        onClick={() => toggleSeat(seat, position)}
                      />
                      
                      {/* Player info */}
                      {player ? (
                        <>
                          {/* Hero crown icon */}
                          {player.isHero && (
                            <text
                              x={pos.x}
                              y={pos.y - 20}
                              textAnchor="middle"
                              className="fill-yellow-400 pointer-events-none"
                              style={{ fontSize: '16px' }}
                            >
                              👑
                            </text>
                          )}
                          
                          {/* Player name */}
                          <text
                            x={pos.x}
                            y={pos.y - 3}
                            textAnchor="middle"
                            className="fill-white text-sm font-bold pointer-events-none drop-shadow-sm"
                            style={{ fontSize: '10px' }}
                          >
                            {player.name}
                          </text>
                          
                          {/* Range count with background */}
                          <rect
                            x={pos.x - 12}
                            y={pos.y + 5}
                            width="24"
                            height="14"
                            rx="7"
                            fill="rgba(0,0,0,0.5)"
                          />
                          <text
                            x={pos.x}
                            y={pos.y + 14}
                            textAnchor="middle"
                            className="fill-white text-xs font-semibold pointer-events-none"
                            style={{ fontSize: '8px' }}
                          >
                            {player.range.length}
                          </text>
                        </>
                      ) : (
                        <text
                          x={pos.x}
                          y={pos.y + 5}
                          textAnchor="middle"
                          className="fill-slate-300 pointer-events-none"
                          style={{ fontSize: '18px' }}
                        >
                          +
                        </text>
                      )}
                      
                      {/* Position label with background */}
                      <rect
                        x={pos.x - 16}
                        y={pos.y + 35}
                        width="32"
                        height="14"
                        rx="7"
                        fill="rgba(0,0,0,0.7)"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="1"
                      />
                      <text
                        x={pos.x}
                        y={pos.y + 44}
                        textAnchor="middle"
                        className="fill-slate-200 text-xs font-bold pointer-events-none"
                        style={{ fontSize: '8px' }}
                      >
                        {name}
                      </text>
                    </g>
                  );
                })}
                </svg>
              </div>
            </div>
          </div>
          
          {/* Continue Button - Positioned directly below the table graphic */}
          {onContinue && (
            <div className="flex justify-center">
              {canContinue ? (
                <button
                  onClick={onContinue}
                  className="btn-primary btn-lg"
                >
                  Continue to Set Ranges ({players.length} players)
                </button>
              ) : (
                <p className="text-slate-400 text-sm text-center">
                  Add at least 2 players to continue
                </p>
              )}
            </div>
          )}
        </div>

        {/* Side Panel - Player info and controls */}
        <div className="w-full lg:w-80 space-y-2 sm:space-y-4 flex-shrink-0 flex flex-col">
          {/* Game Format Selector */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-2 sm:p-4 border border-slate-600/50 shadow-lg">
            <h4 className="text-xs sm:text-sm font-bold text-slate-200 mb-2 sm:mb-3 flex items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
              Game Format
            </h4>
            <div className="space-y-1 sm:space-y-2">
              <button
                onClick={() => changeGameFormat('6-max')}
                className={`w-full flex items-center justify-between ${
                  gameFormat === '6-max'
                    ? 'btn-primary btn-md'
                    : 'btn-secondary btn-md'
                }`}
              >
                <span>6-Max</span>
                <span className="text-xs opacity-70">6 seats</span>
              </button>
              <button
                onClick={() => changeGameFormat('9-max')}
                className={`w-full flex items-center justify-between ${
                  gameFormat === '9-max'
                    ? 'btn-primary btn-md'
                    : 'btn-secondary btn-md'
                }`}
              >
                <span>9-Max</span>
                <span className="text-xs opacity-70">9 seats</span>
              </button>
              <button
                onClick={() => changeGameFormat('full-ring')}
                className={`w-full flex items-center justify-between ${
                  gameFormat === 'full-ring'
                    ? 'btn-primary btn-md'
                    : 'btn-secondary btn-md'
                }`}
              >
                <span>Full Ring</span>
                <span className="text-xs opacity-70">10 seats</span>
              </button>
            </div>
          </div>

          {/* Player Summary Card */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-2 sm:p-4 border border-slate-600/50 shadow-lg">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100 h-6 sm:h-7 flex items-center">
                  {getActivePlayerCount()} Player{getActivePlayerCount() !== 1 ? 's' : ''}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 h-4 sm:h-5 flex items-center">
                  {getHeroPlayer() ? (
                    <>Hero: <span className="text-purple-400 font-semibold">{getHeroPlayer()!.position}</span></>
                  ) : (
                    <span className="text-slate-500">No hero selected</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  onPlayersChange([]);
                  setHeroSet(false);
                }}
                disabled={players.length === 0}
                className="btn-danger btn-md"
              >
                Clear All
              </button>
            </div>

            {/* Progress indicator */}
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(getActivePlayerCount() / getAvailableSeats(gameFormat).length) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-1 h-3 sm:h-4 flex items-center">
              {getActivePlayerCount()}/{getAvailableSeats(gameFormat).length} seats filled
            </p>
          </div>

          {/* Active Players List - Always visible to prevent layout shift */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-2 sm:p-4 border border-slate-600/50 shadow-lg flex-1 flex flex-col">
            <h4 className="text-xs sm:text-sm font-bold text-slate-200 mb-2 sm:mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Active Players
            </h4>
            <div className="space-y-1 sm:space-y-2 min-h-[80px] sm:min-h-[120px] flex-1 overflow-y-auto">
              {players.length > 0 ? (
                players
                  .sort((a, b) => a.seatNumber - b.seatNumber)
                  .map((player) => (
                    <button
                      key={player.id}
                      onClick={() => onPlayerSelect(player)}
                      className={`w-full p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                        selectedPlayer?.id === player.id
                          ? 'border-yellow-400 bg-yellow-400/20 text-yellow-200 shadow-lg shadow-yellow-400/20'
                          : player.isHero
                            ? 'border-purple-400 bg-purple-400/20 text-purple-200 hover:bg-purple-400/30 shadow-lg shadow-purple-400/10'
                            : 'border-blue-400 bg-blue-400/20 text-blue-200 hover:bg-blue-400/30 shadow-lg shadow-blue-400/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs sm:text-sm flex items-center">
                            {player.isHero && <span className="mr-1">👑</span>}
                            {player.name}
                          </div>
                          <div className="text-xs opacity-80">{player.position}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-semibold">
                            {player.range.length}
                          </div>
                          <div className="text-xs opacity-60">hands</div>
                        </div>
                      </div>
                    </button>
                  ))
              ) : (
                <div className="flex items-center justify-center h-[80px] sm:h-[120px] text-slate-400">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🪑</div>
                    <div className="text-xs sm:text-sm">Click seats on the table to add players</div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TableSelector;
