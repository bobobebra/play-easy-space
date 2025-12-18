import { useState, useEffect, useRef, useCallback } from 'react';

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 6;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 54;
const BRICK_HEIGHT = 18;
const BRICK_PADDING = 4;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = 10;

const COLORS = ['#ff6b6b', '#ffa06b', '#ffd93d', '#6bcb77', '#4d96ff'];

interface Brick {
  x: number;
  y: number;
  visible: boolean;
  color: string;
}

export const BreakoutGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const gameState = useRef({
    paddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT - 50,
    ballVX: 4,
    ballVY: -4,
    bricks: [] as Brick[],
    mouseX: CANVAS_WIDTH / 2
  });

  const initBricks = useCallback(() => {
    const bricks: Brick[] = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
          y: BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
          visible: true,
          color: COLORS[row % COLORS.length]
        });
      }
    }
    return bricks;
  }, []);

  const resetGame = useCallback(() => {
    gameState.current = {
      paddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      ballX: CANVAS_WIDTH / 2,
      ballY: CANVAS_HEIGHT - 50,
      ballVX: 4 * (Math.random() > 0.5 ? 1 : -1),
      ballVY: -4,
      bricks: initBricks(),
      mouseX: CANVAS_WIDTH / 2
    };
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameWon(false);
  }, [initBricks]);

  useEffect(() => {
    if (!gameStarted) {
      gameState.current.bricks = initBricks();
    }
  }, [gameStarted, initBricks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      gameState.current.mouseX = e.clientX - rect.left;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver || gameWon) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const gameLoop = () => {
      const state = gameState.current;

      // Update paddle position
      state.paddleX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, state.mouseX - PADDLE_WIDTH / 2));

      // Update ball position
      state.ballX += state.ballVX;
      state.ballY += state.ballVY;

      // Wall collisions
      if (state.ballX - BALL_RADIUS < 0 || state.ballX + BALL_RADIUS > CANVAS_WIDTH) {
        state.ballVX *= -1;
      }
      if (state.ballY - BALL_RADIUS < 0) {
        state.ballVY *= -1;
      }

      // Paddle collision
      if (
        state.ballY + BALL_RADIUS > CANVAS_HEIGHT - PADDLE_HEIGHT - 10 &&
        state.ballX > state.paddleX &&
        state.ballX < state.paddleX + PADDLE_WIDTH
      ) {
        state.ballVY = -Math.abs(state.ballVY);
        const hitPos = (state.ballX - state.paddleX) / PADDLE_WIDTH;
        state.ballVX = (hitPos - 0.5) * 8;
      }

      // Ball out of bounds
      if (state.ballY > CANVAS_HEIGHT) {
        setLives(l => {
          const newLives = l - 1;
          if (newLives <= 0) {
            setGameOver(true);
          } else {
            state.ballX = CANVAS_WIDTH / 2;
            state.ballY = CANVAS_HEIGHT - 50;
            state.ballVX = 4 * (Math.random() > 0.5 ? 1 : -1);
            state.ballVY = -4;
          }
          return newLives;
        });
      }

      // Brick collisions
      let bricksRemaining = 0;
      state.bricks.forEach(brick => {
        if (!brick.visible) return;
        bricksRemaining++;

        if (
          state.ballX > brick.x &&
          state.ballX < brick.x + BRICK_WIDTH &&
          state.ballY - BALL_RADIUS < brick.y + BRICK_HEIGHT &&
          state.ballY + BALL_RADIUS > brick.y
        ) {
          brick.visible = false;
          state.ballVY *= -1;
          setScore(s => s + 10);
        }
      });

      if (bricksRemaining === 0) {
        setGameWon(true);
      }

      // Draw
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw bricks
      state.bricks.forEach(brick => {
        if (brick.visible) {
          ctx.fillStyle = brick.color;
          ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
        }
      });

      // Draw paddle
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(state.paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(state.ballX, state.ballY, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      if (!gameOver && !gameWon) {
        animationId = requestAnimationFrame(gameLoop);
      }
    };

    gameLoop();
    return () => cancelAnimationFrame(animationId);
  }, [gameStarted, gameOver, gameWon]);

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-gray-900 p-4">
      <div className="flex gap-8 text-white text-xl mb-4 font-bold">
        <span>Score: {score}</span>
        <span>Lives: {'❤️'.repeat(lives)}</span>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-gray-600 rounded cursor-none"
        />

        {(!gameStarted || gameOver || gameWon) && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
            <div className="text-white text-2xl font-bold mb-4">
              {gameOver ? 'Game Over!' : gameWon ? 'You Won!' : 'BREAKOUT'}
            </div>
            {(gameOver || gameWon) && (
              <div className="text-white text-lg mb-4">Final Score: {score}</div>
            )}
            <button
              onClick={() => {
                resetGame();
                setGameStarted(true);
              }}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              {gameStarted ? 'Play Again' : 'Start Game'}
            </button>
          </div>
        )}
      </div>

      <div className="text-gray-400 text-sm mt-4">
        Move mouse to control paddle
      </div>
    </div>
  );
};
