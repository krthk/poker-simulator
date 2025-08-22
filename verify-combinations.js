// Verify that range parser correctly generates the right number of combinations

// Simple recreation of the parsing logic to test combination counts
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const SUITS = ['h', 'd', 'c', 's'];

function parseHandRange(rangeArray) {
  const hands = [];
  
  for (const rangeToken of rangeArray) {
    hands.push(...parseRangeToken(rangeToken.trim()));
  }
  
  return hands;
}

function parseRangeToken(token) {
  if (token.length === 2) {
    return parsePocketPair(token);
  } else if (token.length === 3) {
    return parseSuitedOrOffsuit(token);
  }
  throw new Error(`Invalid range token: ${token}`);
}

function parsePocketPair(token) {
  const rank = token[0];
  const hands = [];
  
  for (let i = 0; i < SUITS.length; i++) {
    for (let j = i + 1; j < SUITS.length; j++) {
      hands.push([
        { rank, suit: SUITS[i] },
        { rank, suit: SUITS[j] }
      ]);
    }
  }
  return hands;
}

function parseSuitedOrOffsuit(token) {
  const rank1 = token[0];
  const rank2 = token[1];
  const suitedness = token[2];
  
  const hands = [];
  
  if (suitedness === 's') {
    for (const suit of SUITS) {
      hands.push([
        { rank: rank1, suit },
        { rank: rank2, suit }
      ]);
    }
  } else if (suitedness === 'o') {
    for (let i = 0; i < SUITS.length; i++) {
      for (let j = 0; j < SUITS.length; j++) {
        if (i !== j) {
          hands.push([
            { rank: rank1, suit: SUITS[i] },
            { rank: rank2, suit: SUITS[j] }
          ]);
        }
      }
    }
  }
  
  return hands;
}

console.log('🧪 Testing Range Parser Combination Counts\n');

// Test pocket pair - should generate 6 combinations
const aaRange = parseHandRange(['AA']);
console.log('AA range:');
console.log(`  Range notations: 1`);
console.log(`  Actual combinations: ${aaRange.length} (expected: 6)`);
console.log(`  ✅ Correct: ${aaRange.length === 6 ? 'YES' : 'NO'}`);
console.log('  Combinations:', aaRange.map(hand => `${hand[0].rank}${hand[0].suit}${hand[1].rank}${hand[1].suit}`));

console.log();

// Test suited hand - should generate 4 combinations  
const aksRange = parseHandRange(['AKs']);
console.log('AKs range:');
console.log(`  Range notations: 1`);
console.log(`  Actual combinations: ${aksRange.length} (expected: 4)`);
console.log(`  ✅ Correct: ${aksRange.length === 4 ? 'YES' : 'NO'}`);
console.log('  Combinations:', aksRange.map(hand => `${hand[0].rank}${hand[0].suit}${hand[1].rank}${hand[1].suit}`));

console.log();

// Test offsuit hand - should generate 12 combinations
const akoRange = parseHandRange(['AKo']);
console.log('AKo range:');
console.log(`  Range notations: 1`);
console.log(`  Actual combinations: ${akoRange.length} (expected: 12)`);
console.log(`  ✅ Correct: ${akoRange.length === 12 ? 'YES' : 'NO'}`);
console.log('  Combinations:', akoRange.map(hand => `${hand[0].rank}${hand[0].suit}${hand[1].rank}${hand[1].suit}`));

console.log();

// Test that "Any Two" generates all 1326 combinations
const allHands = [
  // All pocket pairs (13 × 6 = 78)
  'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
  // All suited combinations (78 × 4 = 312)  
  'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
  'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s',
  'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s',
  'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s',
  'T9s', 'T8s', 'T7s', 'T6s', 'T5s', 'T4s', 'T3s', 'T2s',
  '98s', '97s', '96s', '95s', '94s', '93s', '92s',
  '87s', '86s', '85s', '84s', '83s', '82s',
  '76s', '75s', '74s', '73s', '72s',
  '65s', '64s', '63s', '62s',
  '54s', '53s', '52s',
  '43s', '42s',
  '32s',
  // All offsuit combinations (78 × 12 = 936)
  'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o',
  'KQo', 'KJo', 'KTo', 'K9o', 'K8o', 'K7o', 'K6o', 'K5o', 'K4o', 'K3o', 'K2o',
  'QJo', 'QTo', 'Q9o', 'Q8o', 'Q7o', 'Q6o', 'Q5o', 'Q4o', 'Q3o', 'Q2o',
  'JTo', 'J9o', 'J8o', 'J7o', 'J6o', 'J5o', 'J4o', 'J3o', 'J2o',
  'T9o', 'T8o', 'T7o', 'T6o', 'T5o', 'T4o', 'T3o', 'T2o',
  '98o', '97o', '96o', '95o', '94o', '93o', '92o',
  '87o', '86o', '85o', '84o', '83o', '82o',
  '76o', '75o', '74o', '73o', '72o',
  '65o', '64o', '63o', '62o',
  '54o', '53o', '52o',
  '43o', '42o',
  '32o'
];

const allCombinations = parseHandRange(allHands);

console.log('📊 "Any Two" (100%) Analysis:');
console.log(`  Range notations: ${allHands.length} (expected: 169)`);
console.log(`  Actual combinations: ${allCombinations.length} (expected: 1326)`);
console.log(`  ✅ Range notations correct: ${allHands.length === 169 ? 'YES' : 'NO'}`);
console.log(`  ✅ Total combinations correct: ${allCombinations.length === 1326 ? 'YES' : 'NO'}`);

console.log('\n🎯 Summary:');
console.log('  • Pocket pairs: 13 notations × 6 combinations = 78 total');
console.log('  • Suited hands: 78 notations × 4 combinations = 312 total');  
console.log('  • Offsuit hands: 78 notations × 12 combinations = 936 total');
console.log('  • Grand total: 78 + 312 + 936 = 1,326 combinations');
console.log('\n✨ This ensures accurate probability weighting in simulations!');
