import { useState, useEffect, useRef, useCallback } from 'react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 60;
const PIPE_GAP = 160;
const GRAVITY = 0.5;
const JUMP_FORCE = -9;
const PIPE_SPEED = 3;

interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}

export const FlappyGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const gameState = useRef({
    birdY: CANVAS_HEIGHT / 2,
    birdVelocity: 0,
    pipes: [] as Pipe[],
    frameCount: 0
  });

  const jump = useCallback(() => {
    if (gameOver) return;
    if (!gameStarted) {
      setGameStarted(true);
    }
    gameState.current.birdVelocity = JUMP_FORCE;
  }, [gameOver, gameStarted]);

  const resetGame = useCallback(() => {
    gameState.current = {
      birdY: CANVAS_HEIGHT / 2,
      birdVelocity: 0,
      pipes: [],
      frameCount: 0
    };
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (gameOver) {
          resetGame();
        } else {
          jump();
        }
      }
    };

    const handleClick = () => {
      if (gameOver) {
        resetGame();
      } else {
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    const canvas = canvasRef.current;
    canvas?.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      canvas?.removeEventListener('click', handleClick);
    };
  }, [jump, gameOver, resetGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const gameLoop = () => {
      const state = gameState.current;

      // Draw background
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (gameStarted && !gameOver) {
        // Update bird
        state.birdVelocity += GRAVITY;
        state.birdY += state.birdVelocity;

        // Spawn pipes
        state.frameCount++;
        if (state.frameCount % 100 === 0) {
          const topHeight = Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50;
          state.pipes.push({ x: CANVAS_WIDTH, topHeight, passed: false });
        }

        // Update pipes
        state.pipes = state.pipes.filter(pipe => pipe.x > -PIPE_WIDTH);
        state.pipes.forEach(pipe => {
          pipe.x -= PIPE_SPEED;

          // Score
          if (!pipe.passed && pipe.x + PIPE_WIDTH < CANVAS_WIDTH / 2 - BIRD_SIZE / 2) {
            pipe.passed = true;
            setScore(s => {
              const newScore = s + 1;
              setHighScore(h => Math.max(h, newScore));
              return newScore;
            });
          }

          // Collision detection
          const birdLeft = CANVAS_WIDTH / 2 - BIRD_SIZE / 2;
          const birdRight = CANVAS_WIDTH / 2 + BIRD_SIZE / 2;
          const birdTop = state.birdY - BIRD_SIZE / 2;
          const birdBottom = state.birdY + BIRD_SIZE / 2;

          if (
            birdRight > pipe.x &&
            birdLeft < pipe.x + PIPE_WIDTH &&
            (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + PIPE_GAP)
          ) {
            setGameOver(true);
          }
        });

        // Ground/ceiling collision
        if (state.birdY - BIRD_SIZE / 2 < 0 || state.birdY + BIRD_SIZE / 2 > CANVAS_HEIGHT) {
          setGameOver(true);
        }
      }

      // Draw pipes
      ctx.fillStyle = '#2ecc71';
      state.pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, PIPE_WIDTH + 10, 20);
        
        // Bottom pipe
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.topHeight - PIPE_GAP);
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(pipe.x - 5, pipe.topHeight + PIPE_GAP, PIPE_WIDTH + 10, 20);
      });

      // Draw bird
      const birdX = CANVAS_WIDTH / 2;
      const birdY = gameStarted ? gameState.current.birdY : CANVAS_HEIGHT / 2;
      
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(birdX, birdY, BIRD_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Bird eye
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(birdX + 8, birdY - 5, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(birdX + 10, birdY - 5, 3, 0, Math.PI * 2);
      ctx.fill();

      // Bird beak
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.moveTo(birdX + BIRD_SIZE / 2, birdY);
      ctx.lineTo(birdX + BIRD_SIZE / 2 + 10, birdY + 5);
      ctx.lineTo(birdX + BIRD_SIZE / 2, birdY + 10);
      ctx.closePath();
      ctx.fill();

      // Draw score
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(score.toString(), CANVAS_WIDTH / 2, 60);

      if (!gameOver) {
        animationId = requestAnimationFrame(gameLoop);
      }
    };

    gameLoop();
    return () => cancelAnimationFrame(animationId);
  }, [gameStarted, gameOver, score]);

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-gray-900 p-4">
      <div className="flex gap-8 text-white text-lg mb-4 font-bold">
        <span>Score: {score}</span>
        <span>Best: {highScore}</span>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-gray-600 rounded cursor-pointer"
        />

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
            <div className="text-white text-3xl font-bold mb-4">FLAPPY BIRD</div>
            <div className="text-gray-300 text-lg mb-4">Click or Press Space to Start</div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
            <div className="text-white text-3xl font-bold mb-2">Game Over!</div>
            <div className="text-white text-xl mb-4">Score: {score}</div>
            <div className="text-gray-300 mb-4">Click or Press Space to Retry</div>
          </div>
        )}
      </div>

      <div className="text-gray-400 text-sm mt-4">
        Click or Press Space to fly
      </div>
    </div>
  );
};
