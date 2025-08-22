import { describe, it, expect } from 'vitest';
import { evaluateHand, compareHands } from '../poker/handEvaluator';
import { HandRank, Card } from '../types/poker';

describe('Hand Ranking Tests', () => {
  // Helper function to create cards
  const card = (rank: string, suit: string): Card => ({ rank: rank as any, suit: suit as any });

  describe('Basic Hand Rankings', () => {
    it('should correctly identify and rank Royal Flush', () => {
      const royalFlush = [
        card('A', 'h'), card('K', 'h'), card('Q', 'h'), card('J', 'h'), card('T', 'h')
      ];
      const evaluation = evaluateHand(royalFlush);
      expect(evaluation.rank).toBe(HandRank.ROYAL_FLUSH);
      expect(evaluation.value).toBe(14); // Ace high
    });

    it('should correctly identify and rank Straight Flush', () => {
      const straightFlush = [
        card('9', 'h'), card('8', 'h'), card('7', 'h'), card('6', 'h'), card('5', 'h')
      ];
      const evaluation = evaluateHand(straightFlush);
      expect(evaluation.rank).toBe(HandRank.STRAIGHT_FLUSH);
      expect(evaluation.value).toBe(9); // 9 high
    });

    it('should correctly identify wheel straight flush (A-2-3-4-5)', () => {
      const wheelStraightFlush = [
        card('A', 's'), card('2', 's'), card('3', 's'), card('4', 's'), card('5', 's')
      ];
      const evaluation = evaluateHand(wheelStraightFlush);
      expect(evaluation.rank).toBe(HandRank.STRAIGHT_FLUSH);
      expect(evaluation.value).toBe(5); // 5 high, not Ace high!
    });

    it('should correctly identify Four of a Kind', () => {
      const fourOfAKind = [
        card('A', 'h'), card('A', 'd'), card('A', 'c'), card('A', 's'), card('K', 'h')
      ];
      const evaluation = evaluateHand(fourOfAKind);
      expect(evaluation.rank).toBe(HandRank.FOUR_OF_A_KIND);
      expect(evaluation.value).toBe(14); // Aces
    });

    it('should correctly identify Full House', () => {
      const fullHouse = [
        card('A', 'h'), card('A', 'd'), card('A', 'c'), card('K', 's'), card('K', 'h')
      ];
      const evaluation = evaluateHand(fullHouse);
      expect(evaluation.rank).toBe(HandRank.FULL_HOUSE);
      expect(evaluation.value).toBe(14); // Aces full
    });

    it('should correctly identify Flush', () => {
      const flush = [
        card('A', 'h'), card('J', 'h'), card('9', 'h'), card('7', 'h'), card('3', 'h')
      ];
      const evaluation = evaluateHand(flush);
      expect(evaluation.rank).toBe(HandRank.FLUSH);
      expect(evaluation.value).toBe(14); // Ace high
    });

    it('should correctly identify Straight', () => {
      const straight = [
        card('A', 'h'), card('K', 'd'), card('Q', 'c'), card('J', 's'), card('T', 'h')
      ];
      const evaluation = evaluateHand(straight);
      expect(evaluation.rank).toBe(HandRank.STRAIGHT);
      expect(evaluation.value).toBe(14); // Ace high
    });

    it('should correctly identify wheel straight (A-2-3-4-5)', () => {
      const wheelStraight = [
        card('A', 'h'), card('2', 'd'), card('3', 'c'), card('4', 's'), card('5', 'h')
      ];
      const evaluation = evaluateHand(wheelStraight);
      expect(evaluation.rank).toBe(HandRank.STRAIGHT);
      expect(evaluation.value).toBe(5); // 5 high, not Ace high!
    });

    it('should correctly identify Three of a Kind', () => {
      const threeOfAKind = [
        card('A', 'h'), card('A', 'd'), card('A', 'c'), card('K', 's'), card('Q', 'h')
      ];
      const evaluation = evaluateHand(threeOfAKind);
      expect(evaluation.rank).toBe(HandRank.THREE_OF_A_KIND);
      expect(evaluation.value).toBe(14); // Trip Aces
    });

    it('should correctly identify Two Pair', () => {
      const twoPair = [
        card('A', 'h'), card('A', 'd'), card('K', 'c'), card('K', 's'), card('Q', 'h')
      ];
      const evaluation = evaluateHand(twoPair);
      expect(evaluation.rank).toBe(HandRank.TWO_PAIR);
      expect(evaluation.value).toBe(1413); // AA KK (14*100 + 13)
    });

    it('should correctly identify One Pair', () => {
      const onePair = [
        card('A', 'h'), card('A', 'd'), card('K', 'c'), card('Q', 's'), card('J', 'h')
      ];
      const evaluation = evaluateHand(onePair);
      expect(evaluation.rank).toBe(HandRank.PAIR);
      expect(evaluation.value).toBe(14); // Pair of Aces
    });

    it('should correctly identify High Card', () => {
      const highCard = [
        card('A', 'h'), card('K', 'd'), card('Q', 'c'), card('J', 's'), card('9', 'h')
      ];
      const evaluation = evaluateHand(highCard);
      expect(evaluation.rank).toBe(HandRank.HIGH_CARD);
      expect(evaluation.value).toBe(14); // Ace high
    });
  });

  describe('Hand Comparison Tests', () => {
    it('should correctly compare hands of different ranks', () => {
      const flush = evaluateHand([
        card('A', 'h'), card('J', 'h'), card('9', 'h'), card('7', 'h'), card('3', 'h')
      ]);
      const fullHouse = evaluateHand([
        card('A', 'h'), card('A', 'd'), card('A', 'c'), card('K', 's'), card('K', 'h')
      ]);
      
      expect(compareHands(fullHouse, flush)).toBe(1); // Full house beats flush
      expect(compareHands(flush, fullHouse)).toBe(-1); // Flush loses to full house
    });

    it('should correctly compare same rank hands by value', () => {
      const aceHigh = evaluateHand([
        card('A', 'h'), card('K', 'd'), card('Q', 'c'), card('J', 's'), card('9', 'h')
      ]);
      const kingHigh = evaluateHand([
        card('K', 'h'), card('Q', 'd'), card('J', 'c'), card('T', 's'), card('8', 'h')
      ]);
      
      expect(compareHands(aceHigh, kingHigh)).toBe(1); // Ace high beats King high
      expect(compareHands(kingHigh, aceHigh)).toBe(-1); // King high loses to Ace high
    });

    it('should correctly identify ties', () => {
      const hand1 = evaluateHand([
        card('A', 'h'), card('K', 'd'), card('Q', 'c'), card('J', 's'), card('9', 'h')
      ]);
      const hand2 = evaluateHand([
        card('A', 's'), card('K', 'c'), card('Q', 'd'), card('J', 'h'), card('9', 's')
      ]);
      
      expect(compareHands(hand1, hand2)).toBe(0); // Same hand ranks should tie
    });
  });

  describe('Critical Edge Cases', () => {
    it('should handle wheel straight correctly in comparison', () => {
      const wheelStraight = evaluateHand([
        card('A', 'h'), card('2', 'd'), card('3', 'c'), card('4', 's'), card('5', 'h')
      ]);
      const sixHighStraight = evaluateHand([
        card('6', 'h'), card('5', 'd'), card('4', 'c'), card('3', 's'), card('2', 'h')
      ]);
      
      expect(compareHands(sixHighStraight, wheelStraight)).toBe(1); // 6-high straight beats wheel
    });

    it('should correctly compare different two pairs', () => {
      const acesKings = evaluateHand([
        card('A', 'h'), card('A', 'd'), card('K', 'c'), card('K', 's'), card('Q', 'h')
      ]);
      const kingsQueens = evaluateHand([
        card('K', 'h'), card('K', 'd'), card('Q', 'c'), card('Q', 's'), card('A', 'h')
      ]);
      
      
      expect(compareHands(acesKings, kingsQueens)).toBe(1); // AA KK beats KK QQ
    });
  });

  describe('Texas Hold\'em Starting Hand Rankings', () => {
    
    it('should rank AA as stronger than KK', () => {
      const aces = [card('A', 'h'), card('A', 'd')];
      const kings = [card('K', 'h'), card('K', 'd')];
      
      // Test with a neutral board
      const board = [card('2', 'c'), card('7', 's'), card('9', 'h')];
      
      const aaHand = evaluateHand([...aces, ...board]);
      const kkHand = evaluateHand([...kings, ...board]);
      
      expect(compareHands(aaHand, kkHand)).toBe(1); // AA should beat KK
    });
  });
});