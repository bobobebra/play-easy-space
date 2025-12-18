import { useState, useEffect, useRef, useCallback } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const PADDLE_SPEED = 8;
const INITIAL_BALL_SPEED = 5;

export const PongGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  
  const gameState = useRef({
    playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT / 2,
    ballVX: INITIAL_BALL_SPEED,
    ballVY: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    keys: { up: false, down: false }
  });

  const resetBall = useCallback((direction: number) => {
    gameState.current.ballX = CANVAS_WIDTH / 2;
    gameState.current.ballY = CANVAS_HEIGHT / 2;
    gameState.current.ballVX = INITIAL_BALL_SPEED * direction;
    gameState.current.ballVY = INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') gameState.current.keys.up = true;
      if (e.key === 'ArrowDown' || e.key === 's') gameState.current.keys.down = true;
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') gameState.current.keys.up = false;
      if (e.key === 'ArrowDown' || e.key === 's') gameState.current.keys.down = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!gameStarted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const gameLoop = () => {
      const state = gameState.current;
      
      // Player movement
      if (state.keys.up && state.playerY > 0) {
        state.playerY -= PADDLE_SPEED;
      }
      if (state.keys.down && state.playerY < CANVAS_HEIGHT - PADDLE_HEIGHT) {
        state.playerY += PADDLE_SPEED;
      }

      // AI movement
      const aiCenter = state.aiY + PADDLE_HEIGHT / 2;
      if (aiCenter < state.ballY - 20) {
        state.aiY += PADDLE_SPEED * 0.7;
      } else if (aiCenter > state.ballY + 20) {
        state.aiY -= PADDLE_SPEED * 0.7;
      }
      state.aiY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.aiY));

      // Ball movement
      state.ballX += state.ballVX;
      state.ballY += state.ballVY;

      // Ball collision with top/bottom
      if (state.ballY <= 0 || state.ballY >= CANVAS_HEIGHT - BALL_SIZE) {
        state.ballVY *= -1;
      }

      // Ball collision with player paddle
      if (
        state.ballX <= PADDLE_WIDTH + 20 &&
        state.ballY + BALL_SIZE >= state.playerY &&
        state.ballY <= state.playerY + PADDLE_HEIGHT
      ) {
        state.ballVX = Math.abs(state.ballVX) * 1.05;
        const hitPos = (state.ballY - state.playerY) / PADDLE_HEIGHT;
        state.ballVY = (hitPos - 0.5) * 10;
      }

      // Ball collision with AI paddle
      if (
        state.ballX >= CANVAS_WIDTH - PADDLE_WIDTH - 20 - BALL_SIZE &&
        state.ballY + BALL_SIZE >= state.aiY &&
        state.ballY <= state.aiY + PADDLE_HEIGHT
      ) {
        state.ballVX = -Math.abs(state.ballVX) * 1.05;
        const hitPos = (state.ballY - state.aiY) / PADDLE_HEIGHT;
        state.ballVY = (hitPos - 0.5) * 10;
      }

      // Scoring
      if (state.ballX < 0) {
        setAiScore(s => s + 1);
        resetBall(1);
      }
      if (state.ballX > CANVAS_WIDTH) {
        setPlayerScore(s => s + 1);
        resetBall(-1);
      }

      // Draw
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Center line
      ctx.setLineDash([10, 10]);
      ctx.strokeStyle = '#333';
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Paddles
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(10, state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH - 10, state.aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Ball
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(state.ballX + BALL_SIZE/2, state.ballY + BALL_SIZE/2, BALL_SIZE/2, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
    return () => cancelAnimationFrame(animationId);
  }, [gameStarted, resetBall]);

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-gray-900 p-4">
      <div className="flex gap-8 text-white text-3xl mb-4 font-bold">
        <span className="text-green-400">{playerScore}</span>
        <span>-</span>
        <span className="text-red-400">{aiScore}</span>
      </div>

      <div className="relative">
        <canvas 
          ref={canvasRef} 
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT}
          className="border-2 border-gray-600 rounded"
        />
        
        {!gameStarted && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
            <div className="text-white text-2xl font-bold mb-4">PONG</div>
            <button
              onClick={() => setGameStarted(true)}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Start Game
            </button>
          </div>
        )}
      </div>

      <div className="text-gray-400 text-sm mt-4">
        Use Arrow Keys or W/S to move paddle
      </div>
    </div>
  );
};
