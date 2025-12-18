import { useState, useCallback } from 'react';

type Player = 'X' | 'O' | null;
type Board = Player[];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6] // Diagonals
];

export const TicTacToe = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Player>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [xWins, setXWins] = useState(0);
  const [oWins, setOWins] = useState(0);
  const [mode, setMode] = useState<'pvp' | 'ai'>('ai');

  const checkWinner = useCallback((squares: Board): Player => {
    for (const [a, b, c] of WINNING_COMBINATIONS) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  }, []);

  const getAIMove = useCallback((squares: Board): number => {
    // Check if AI can win
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        const testBoard = [...squares];
        testBoard[i] = 'O';
        if (checkWinner(testBoard) === 'O') return i;
      }
    }

    // Block player win
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        const testBoard = [...squares];
        testBoard[i] = 'X';
        if (checkWinner(testBoard) === 'X') return i;
      }
    }

    // Take center
    if (!squares[4]) return 4;

    // Take corner
    const corners = [0, 2, 6, 8];
    const emptyCorners = corners.filter(i => !squares[i]);
    if (emptyCorners.length > 0) {
      return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    }

    // Take any empty
    const emptySquares = squares.map((s, i) => s ? -1 : i).filter(i => i !== -1);
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
  }, [checkWinner]);

  const handleClick = useCallback((index: number) => {
    if (board[index] || winner || isDraw) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      if (gameWinner === 'X') setXWins(w => w + 1);
      else setOWins(w => w + 1);
      return;
    }

    if (newBoard.every(square => square !== null)) {
      setIsDraw(true);
      return;
    }

    if (mode === 'ai' && isXNext) {
      setIsXNext(false);
      setTimeout(() => {
        const aiMove = getAIMove(newBoard);
        const aiBoard = [...newBoard];
        aiBoard[aiMove] = 'O';
        setBoard(aiBoard);

        const aiWinner = checkWinner(aiBoard);
        if (aiWinner) {
          setWinner(aiWinner);
          setOWins(w => w + 1);
          return;
        }

        if (aiBoard.every(square => square !== null)) {
          setIsDraw(true);
          return;
        }

        setIsXNext(true);
      }, 500);
    } else {
      setIsXNext(!isXNext);
    }
  }, [board, isXNext, winner, isDraw, mode, checkWinner, getAIMove]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setIsDraw(false);
  };

  const resetAll = () => {
    resetGame();
    setXWins(0);
    setOWins(0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-gray-900 p-4">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => { setMode('ai'); resetAll(); }}
          className={`px-4 py-2 rounded-lg transition ${mode === 'ai' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          vs AI
        </button>
        <button
          onClick={() => { setMode('pvp'); resetAll(); }}
          className={`px-4 py-2 rounded-lg transition ${mode === 'pvp' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          2 Players
        </button>
      </div>

      <div className="flex gap-8 text-white text-xl mb-4 font-bold">
        <span className="text-blue-400">X: {xWins}</span>
        <span className="text-red-400">O: {oWins}</span>
      </div>

      <div className="text-white text-lg mb-4">
        {winner ? (
          <span className={winner === 'X' ? 'text-blue-400' : 'text-red-400'}>
            {winner} Wins!
          </span>
        ) : isDraw ? (
          <span className="text-yellow-400">Draw!</span>
        ) : (
          <span className={isXNext ? 'text-blue-400' : 'text-red-400'}>
            {isXNext ? 'X' : 'O'}'s Turn {mode === 'ai' && !isXNext && '(AI thinking...)'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 bg-gray-700 p-2 rounded-lg">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            disabled={!!cell || !!winner || isDraw || (mode === 'ai' && !isXNext)}
            className={`w-20 h-20 text-4xl font-bold rounded-lg transition-all ${
              cell === 'X' 
                ? 'bg-blue-600 text-white' 
                : cell === 'O' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-800 hover:bg-gray-600'
            }`}
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          New Game
        </button>
        <button
          onClick={resetAll}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
        >
          Reset Score
        </button>
      </div>
    </div>
  );
};
