import { useState, useEffect } from 'react';

const EMOJIS = ['🎮', '🎯', '🎲', '🎸', '🎹', '🎺', '🎻', '🎼', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱'];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryGame = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const initGame = () => {
    const selectedEmojis = EMOJIS.slice(0, 8);
    const gameCards: Card[] = [];
    
    selectedEmojis.forEach((emoji, index) => {
      gameCards.push({ id: index * 2, emoji, isFlipped: false, isMatched: false });
      gameCards.push({ id: index * 2 + 1, emoji, isFlipped: false, isMatched: false });
    });

    // Shuffle
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }

    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameWon(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (matches === 8) {
      setGameWon(true);
    }
  }, [matches]);

  const handleCardClick = (cardId: number) => {
    if (isChecking) return;
    if (flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsChecking(true);

      const [firstId, secondId] = newFlipped;
      const firstCard = newCards.find(c => c.id === firstId);
      const secondCard = newCards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true }
              : c
          ));
          setMatches(m => m + 1);
          setFlippedCards([]);
          setIsChecking(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-gray-900 p-4">
      <div className="flex gap-8 text-white text-xl mb-6 font-bold">
        <span>Moves: {moves}</span>
        <span>Matches: {matches}/8</span>
      </div>

      <div className="grid grid-cols-4 gap-3 max-w-md">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg text-3xl sm:text-4xl flex items-center justify-center transition-all duration-300 transform ${
              card.isFlipped || card.isMatched
                ? 'bg-purple-600 rotate-0'
                : 'bg-gray-700 hover:bg-gray-600 rotate-180'
            } ${card.isMatched ? 'opacity-60 scale-95' : ''}`}
            disabled={card.isMatched}
          >
            {(card.isFlipped || card.isMatched) && card.emoji}
          </button>
        ))}
      </div>

      {gameWon && (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
          <div className="text-white text-3xl font-bold mb-2">🎉 You Won! 🎉</div>
          <div className="text-white text-lg mb-6">Completed in {moves} moves</div>
          <button
            onClick={initGame}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            Play Again
          </button>
        </div>
      )}

      <button
        onClick={initGame}
        className="mt-6 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
      >
        New Game
      </button>
    </div>
  );
};
