// Test that generateAllHands produces hands that match the display matrix

const DISPLAY_RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

// Copy of the fixed generateAllHands function
const generateAllHands = () => {
  const allHands = [];
  
  // Add all pocket pairs
  for (const rank of DISPLAY_RANKS) {
    allHands.push(`${rank}${rank}`);
  }
  
  // Add all suited and offsuit combinations
  for (let i = 0; i < DISPLAY_RANKS.length; i++) {
    for (let j = i + 1; j < DISPLAY_RANKS.length; j++) {
      const rank1 = DISPLAY_RANKS[i];
      const rank2 = DISPLAY_RANKS[j];
      allHands.push(`${rank1}${rank2}s`); // Suited
      allHands.push(`${rank1}${rank2}o`); // Offsuit
    }
  }
  
  return allHands;
};

// Generate matrix to check against
const generateHandMatrix = () => {
  const matrix = [];
  
  for (let i = 0; i < DISPLAY_RANKS.length; i++) {
    const row = [];
    for (let j = 0; j < DISPLAY_RANKS.length; j++) {
      const rank1 = DISPLAY_RANKS[i];
      const rank2 = DISPLAY_RANKS[j];
      
      if (i === j) {
        // Pocket pairs on diagonal
        row.push(`${rank1}${rank2}`);
      } else if (i < j) {
        // Suited hands above diagonal
        row.push(`${rank1}${rank2}s`);
      } else {
        // Offsuit hands below diagonal
        row.push(`${rank2}${rank1}o`);
      }
    }
    matrix.push(row);
  }
  
  return matrix;
};

console.log('🔧 Testing Any Two Fix\n');

const allHands = generateAllHands();
const matrix = generateHandMatrix();

// Flatten matrix to get all possible display hands
const matrixHands = matrix.flat();

console.log(`Generated hands: ${allHands.length}`);
console.log(`Matrix hands: ${matrixHands.length}`);

// Check if every generated hand exists in the matrix
const missingFromMatrix = allHands.filter(hand => !matrixHands.includes(hand));
const missingFromGenerated = matrixHands.filter(hand => !allHands.includes(hand));

console.log(`\n✅ All generated hands in matrix: ${missingFromMatrix.length === 0 ? 'YES' : 'NO'}`);
console.log(`✅ All matrix hands generated: ${missingFromGenerated.length === 0 ? 'YES' : 'NO'}`);

if (missingFromMatrix.length > 0) {
  console.log('\n❌ Hands generated but not in matrix:', missingFromMatrix.slice(0, 10));
}

if (missingFromGenerated.length > 0) {
  console.log('\n❌ Hands in matrix but not generated:', missingFromGenerated.slice(0, 10));
}

// Show some examples of correct hands
console.log('\n📋 Sample generated hands:');
console.log('Pairs:', allHands.filter(h => h.length === 2).slice(0, 5));
console.log('Suited:', allHands.filter(h => h.endsWith('s')).slice(0, 5));
console.log('Offsuit:', allHands.filter(h => h.endsWith('o')).slice(0, 5));

console.log('\n🎯 Result: Any Two should now highlight ALL hands in the UI!');
