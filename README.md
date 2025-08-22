# Poker Equity Calculator

A comprehensive Texas Hold'em poker equity calculator built with React and TypeScript. Calculate hand equity and win probabilities using Monte Carlo simulation for multi-player scenarios.

## Features

### Core Functionality
- **Multi-Player Support**: Analyze equity for 2-10 players simultaneously
- **Monte Carlo Simulation**: High-precision equity calculations using 10,000+ iterations
- **Real-Time Results**: Fast simulation with detailed win/tie/loss breakdowns
- **Multiple Table Formats**: Support for 6-max, 9-max, and full-ring games

### Hand Range Selection
- **Interactive Hand Matrix**: Visual 13x13 grid for selecting hand ranges
- **Preset Ranges**: Quick selection from Premium, Ultra-tight, Tight, Medium, Loose, and Any Two
- **Percentage-Based Ranges**: Slider control for precise range sizing (0-100%)
- **Drag Selection**: Intuitive click-and-drag interface for range building
- **Range Statistics**: Real-time feedback on combinations, hand count, and range strength

### Board Analysis
- **Community Cards**: Set flop, turn, and river cards for post-flop analysis
- **Pre-flop to River**: Analyze equity at any street
- **Visual Card Selection**: Interactive card picker with suit and rank selection

### User Experience
- **Step-by-Step Workflow**: Guided 4-step process (Players → Ranges → Board → Results)
- **Hero Player**: Designate and track your position with crown indicator
- **Responsive Design**: Optimized for desktop and mobile devices
- **Keyboard Navigation**: Arrow keys and Enter/Backspace for quick navigation
- **Real-time Validation**: Smart progression blocking with helpful error messages

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **Build Tool**: Vite
- **Testing**: Vitest with React Testing Library
- **Font**: Google Fonts (Outfit)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/krthk/poker-simulator.git
cd poker-simulator

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## Usage Guide

### Step 1: Select Players
1. Choose table format (6-max, 9-max, or full-ring)
2. Click seats around the table to add players
3. First player is automatically designated as Hero
4. Add at least 2 players to proceed

### Step 2: Configure Ranges
1. Select a player from the summary bar
2. Choose hands using the interactive matrix
3. Use preset buttons for common ranges
4. Adjust range size with the percentage slider
5. All players must have non-empty ranges to proceed

### Step 3: Set Board (Optional)
1. Select community cards or leave empty for pre-flop analysis
2. Cards update equity calculations in real-time
3. View player summary with range information

### Step 4: View Results
1. Detailed equity breakdown for each player
2. Win/tie/loss statistics
3. Player ranking with visual indicators
4. Key statistics and equity distribution

## Development

### Project Structure

```
src/
├── components/           # React components
│   ├── BoardSelector.tsx    # Community card selection
│   ├── HandRangeSelector.tsx # Hand range matrix
│   ├── ResultsDisplay.tsx   # Simulation results
│   ├── TableSelector.tsx    # Player seat selection
│   └── HelpPage.tsx        # Help modal
├── poker/               # Poker logic
│   ├── simulator.ts        # Monte Carlo simulation engine
│   ├── handStrength.ts     # Hand ranking and strength
│   ├── handEvaluator.ts    # Hand evaluation utilities
│   └── rangeParser.ts      # Range parsing utilities
├── types/               # TypeScript definitions
│   └── poker.ts            # Core poker types
├── tests/               # Test files
└── App.tsx              # Main application component
```

### Key Components

#### Monte Carlo Simulator (`src/poker/simulator.ts`)
- Generates random hands for each player within their ranges
- Evaluates hand strength using standard poker rules
- Runs thousands of iterations for statistical accuracy
- Returns detailed equity, win, and tie statistics

#### Hand Range System (`src/components/HandRangeSelector.tsx`)
- 13x13 matrix representing all possible starting hands
- Supports individual hand selection and range presets
- Real-time statistics and validation
- Drag-and-drop interface for bulk selection

#### Table Management (`src/components/TableSelector.tsx`)
- Dynamic seat positioning based on table format
- Hero designation and player management
- Visual table representation with SVG graphics
- Responsive layout for different screen sizes

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Tailwind CSS for consistent styling

### Performance Considerations

- Monte Carlo simulation runs in batches to prevent UI blocking
- Hand evaluation optimized for speed with lookup tables
- React components use proper memoization for range calculations
- Efficient state management to minimize re-renders

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing TypeScript patterns and interfaces
- Add tests for new functionality
- Update documentation for API changes
- Use semantic commit messages
- Ensure all tests pass before submitting PRs

## Known Issues

- Build warnings related to unused variables in test files
- Some test files need updates for current component interfaces
- TypeScript strict mode reveals some legacy code patterns

## Roadmap

### Planned Features
- **Range vs Range Analysis**: Compare two specific ranges head-to-head
- **Position-Based Presets**: Default ranges based on table position
- **Hand History Import**: Import and analyze real poker hands
- **Equity Graphs**: Visual equity distribution charts
- **Export Results**: Save results as CSV or PDF
- **Custom Bet Sizing**: Include bet sizes in equity calculations

### Technical Improvements
- **WebWorkers**: Move simulation to background threads
- **Progressive Web App**: Offline functionality and app-like experience
- **Database Integration**: Save and load custom ranges
- **Performance Monitoring**: Real-time performance metrics

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with love for the poker community
- Inspired by professional poker analysis tools
- Special thanks to the React and TypeScript communities

## Author

**Karthik Puthraya** - [GitHub](https://github.com/krthk)

---

*Vibe coded with ❤️ by Karthik Puthraya © 2025*