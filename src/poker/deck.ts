import { Card, Rank, Suit } from '../types/poker';

export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const SUITS: Suit[] = ['h', 'd', 'c', 's'];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function cardToString(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function stringToCard(str: string): Card {
  if (str.length !== 2) {
    throw new Error(`Invalid card string: ${str}`);
  }
  const rank = str[0] as Rank;
  const suit = str[1] as Suit;
  
  if (!RANKS.includes(rank) || !SUITS.includes(suit)) {
    throw new Error(`Invalid card string: ${str}`);
  }
  
  return { rank, suit };
}

export function removeCardsFromDeck(deck: Card[], cardsToRemove: Card[]): Card[] {
  return deck.filter(card => 
    !cardsToRemove.some(removeCard => 
      card.rank === removeCard.rank && card.suit === removeCard.suit
    )
  );
}
