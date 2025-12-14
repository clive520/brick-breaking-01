import React, { useEffect, useRef } from 'react';
import { 
  Ball, 
  Paddle, 
  Brick, 
  LevelConfig, 
  Particle,
  PowerUp,
  PowerUpType,
  BrickType
} from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PADDLE_WIDTH, 
  PADDLE_MAX_WIDTH,
  PADDLE_HEIGHT, 
  PADDLE_Y, 
  BALL_RADIUS, 
  BASE_SPEED, 
  BRICK_WIDTH, 
  BRICK_HEIGHT, 
  BRICK_PADDING, 
  BRICK_OFFSET_LEFT, 
  BRICK_OFFSET_TOP, 
  COLORS,
  POWERUP_SIZE,
  POWERUP_SPEED,
  POWERUP_CHANCE
} from '../constants';
import { soundEngine } from '../utils/SoundEngine';

interface GameCanvasProps {
  level: LevelConfig;
  onLevelComplete: () => void;
  onGameOver: () => void;
  onScoreUpdate: (score: number) => void;
  onLivesUpdate: (lives: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  level, 
  onLevelComplete, 
  onGameOver,
  onScoreUpdate,
  onLivesUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Game State Refs
  const paddleRef = useRef<Paddle>({ x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT });
  
  // Use array for balls to support Multiball
  const ballsRef = useRef<Ball[]>([]);
  
  const bricksRef = useRef<Brick[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const scoreRef = useRef<number>(0);
  const livesRef = useRef<number>(3);

  // Helper to create a ball
  const createBall = (x: number, y: number, speed: number, angleOffset: number = 0): Ball => {
    const angle = -Math.PI / 2 + angleOffset; // Upwards
    return {
      id: Math.random(),
      pos: { x, y },
      vel: { 
        x: Math.cos(angle) * speed, 
        y: Math.sin(angle) * speed 
      },
      radius: BALL_RADIUS,
      speed: speed,
      active: true
    };
  };

  // Initialize Bricks
  useEffect(() => {
    const newBricks: Brick[] = [];
    level.layout.forEach((row, r) => {
      row.forEach((brickCode, c) => {
        if (brickCode > 0) {
          const brickX = (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
          const brickY = (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP;
          
          let type = BrickType.NORMAL;
          let maxHealth = 1;
          let color = COLORS.bricks[brickCode];

          if (brickCode === 8) {
            type = BrickType.HARD;
            maxHealth = 3;
            color = COLORS.bricks[8];
          } else if (brickCode === 9) {
            type = BrickType.EXPLOSIVE;
            color = COLORS.bricks[9];
          }

          newBricks.push({
            x: brickX,
            y: brickY,
            width: BRICK_WIDTH,
            height: BRICK_HEIGHT,
            status: 1,
            health: maxHealth,
            maxHealth: maxHealth,
            type: type,
            color: color,
            scoreValue: brickCode * 10
          });
        }
      });
    });
    bricksRef.current = newBricks;
    
    // Reset Game State for Level
    resetToInitialBall();
    livesRef.current = 3;
    scoreRef.current = 0;
    powerUpsRef.current = [];
    onLivesUpdate(3);
    onScoreUpdate(0);
    
    soundEngine.playBGM();

    return () => {
      cancelAnimationFrame(requestRef.current);
      soundEngine.stopBGM();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const resetToInitialBall = () => {
    // Single inactive ball sitting on paddle
    ballsRef.current = [{
      id: 0,
      pos: { x: CANVAS_WIDTH / 2, y: PADDLE_Y - 20 },
      vel: { x: 0, y: 0 },
      radius: BALL_RADIUS,
      speed: BASE_SPEED * level.speedMultiplier,
      active: false
    }];
    paddleRef.current.x = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    paddleRef.current.width = PADDLE_WIDTH; // Reset size
    powerUpsRef.current = []; // Clear powerups on death
  };

  const launchBall = () => {
    if (ballsRef.current.length === 1 && !ballsRef.current[0].active) {
      ballsRef.current[0].active = true;
      const angle = -Math.PI / 4 - (Math.random() * Math.PI / 2);
      ballsRef.current[0].vel = {
        x: Math.cos(angle) * ballsRef.current[0].speed,
        y: Math.sin(angle) * ballsRef.current[0].speed
      };
      // Ensure audio context is resumed on user gesture
      soundEngine.init();
      soundEngine.playBGM();
    }
  };

  const createParticles = (x: number, y: number, color: string, count: number = 8) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1.0,
        color
      });
    }
  };

  const spawnPowerUp = (x: number, y: number) => {
    if (Math.random() > POWERUP_CHANCE) return;

    const rand = Math.random();
    let type = PowerUpType.EXTEND;
    if (rand < 0.4) type = PowerUpType.MULTIBALL;
    else if (rand > 0.9) type = PowerUpType.LIFE;

    powerUpsRef.current.push({
      id: Math.random(),
      x,
      y,
      width: POWERUP_SIZE,
      height: POWERUP_SIZE,
      vy: POWERUP_SPEED,
      type,
      active: true
    });
  };

  const applyPowerUp = (type: PowerUpType) => {
    soundEngine.playSFX('POWERUP');
    switch(type) {
      case PowerUpType.EXTEND:
        paddleRef.current.width = Math.min(paddleRef.current.width + 40, PADDLE_MAX_WIDTH);
        break;
      case PowerUpType.MULTIBALL:
        const mainBall = ballsRef.current.find(b => b.active) || ballsRef.current[0];
        if (mainBall) {
           ballsRef.current.push(createBall(mainBall.pos.x, mainBall.pos.y, mainBall.speed, 0.5));
           ballsRef.current.push(createBall(mainBall.pos.x, mainBall.pos.y, mainBall.speed, -0.5));
        }
        break;
      case PowerUpType.LIFE:
        livesRef.current++;
        onLivesUpdate(livesRef.current);
        break;
    }
  };

  const handleExplosion = (sourceBrick: Brick) => {
     soundEngine.playSFX('EXPLOSION');
     const explosionRadius = 100;
     createParticles(sourceBrick.x + BRICK_WIDTH/2, sourceBrick.y + BRICK_HEIGHT/2, '#ef4444', 30);
     
     // Destroy neighbors
     bricksRef.current.forEach(brick => {
       if (brick.status === 1) {
         const dx = brick.x - sourceBrick.x;
         const dy = brick.y - sourceBrick.y;
         const dist = Math.sqrt(dx*dx + dy*dy);
         if (dist < explosionRadius && brick !== sourceBrick) {
            hitBrick(brick, true);
         }
       }
     });
  };

  const hitBrick = (brick: Brick, instantKill: boolean = false) => {
      if (brick.status !== 1) return;

      if (instantKill) {
        brick.health = 0;
      } else {
        brick.health--;
      }
      
      if (brick.health <= 0) {
        brick.status = 0;
        scoreRef.current += brick.scoreValue;
        onScoreUpdate(scoreRef.current);
        createParticles(brick.x + brick.width/2, brick.y + brick.height/2, brick.color);
        spawnPowerUp(brick.x + brick.width/2, brick.y + brick.height/2);

        if (brick.type === BrickType.EXPLOSIVE) {
          handleExplosion(brick);
        } else {
          soundEngine.playSFX('BRICK_HIT');
        }
      } else {
        soundEngine.playSFX('BRICK_HIT');
        // Visual feedback for damaged hard bricks
        brick.color = `rgba(148, 163, 184, ${0.4 + (brick.health / brick.maxHealth) * 0.6})`;
      }
  };

  // Main Game Loop
  const update = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- Physics ---
    
    // 1. Update PowerUps
    powerUpsRef.current.forEach(p => {
        if (!p.active) return;
        p.y += p.vy;
        
        // Paddle Collision
        const pad = paddleRef.current;
        if (
            p.y + p.height >= PADDLE_Y &&
            p.y <= PADDLE_Y + pad.height &&
            p.x + p.width >= pad.x &&
            p.x <= pad.x + pad.width
        ) {
            p.active = false;
            applyPowerUp(p.type);
        }
        
        if (p.y > CANVAS_HEIGHT) p.active = false;
    });
    // Remove inactive powerups
    powerUpsRef.current = powerUpsRef.current.filter(p => p.active);

    // 2. Update Balls
    const activeBalls = ballsRef.current.filter(b => b.active);
    
    // If we have no active balls but we started with some (game is playing)
    // Check if waiting for launch
    const isWaiting = ballsRef.current.length === 1 && !ballsRef.current[0].active;

    if (!isWaiting) {
        // Process all active balls
        activeBalls.forEach(b => {
          b.pos.x += b.vel.x;
          b.pos.y += b.vel.y;

          // Wall Collisions
          if (b.pos.x + b.radius > CANVAS_WIDTH || b.pos.x - b.radius < 0) {
            b.vel.x = -b.vel.x;
            soundEngine.playSFX('WALL_HIT');
          }
          if (b.pos.y - b.radius < 0) {
            b.vel.y = -b.vel.y;
            soundEngine.playSFX('WALL_HIT');
          }
          
          // Paddle Collision
          const p = paddleRef.current;
          if (
            b.pos.y + b.radius >= PADDLE_Y &&
            b.pos.y - b.radius <= PADDLE_Y + p.height &&
            b.pos.x >= p.x &&
            b.pos.x <= p.x + p.width
          ) {
             // Only bounce if moving down
             if (b.vel.y > 0) {
                let collidePoint = b.pos.x - (p.x + p.width / 2);
                collidePoint = collidePoint / (p.width / 2);
                const angle = collidePoint * (Math.PI / 3); 
                const speed = Math.sqrt(b.vel.x*b.vel.x + b.vel.y*b.vel.y); // Maintain speed or slight increase?
                b.vel.x = speed * Math.sin(angle);
                b.vel.y = -speed * Math.cos(angle);
                soundEngine.playSFX('PADDLE_HIT');
             }
          }

          // Brick Collisions
          bricksRef.current.forEach(brick => {
            if (brick.status === 1) {
              if (
                b.pos.x > brick.x &&
                b.pos.x < brick.x + brick.width &&
                b.pos.y > brick.y &&
                b.pos.y < brick.y + brick.height
              ) {
                // Determine bounce direction (simple)
                // Check overlaps to see if horizontal or vertical hit
                const overlapX = Math.min(Math.abs(b.pos.x - brick.x), Math.abs(b.pos.x - (brick.x + brick.width)));
                const overlapY = Math.min(Math.abs(b.pos.y - brick.y), Math.abs(b.pos.y - (brick.y + brick.height)));

                if (overlapX < overlapY) {
                    b.vel.x = -b.vel.x;
                } else {
                    b.vel.y = -b.vel.y;
                }
                
                hitBrick(brick);
              }
            }
          });
        });

        // Filter out dead balls
        const ballsOnScreen = activeBalls.filter(b => b.pos.y - b.radius <= CANVAS_HEIGHT);
        
        // Update state
        ballsRef.current = ballsOnScreen;

        // Check lose condition
        if (ballsOnScreen.length === 0) {
            livesRef.current -= 1;
            onLivesUpdate(livesRef.current);
            soundEngine.playSFX('LOSE_LIFE');
            if (livesRef.current === 0) {
              onGameOver();
              return; 
            } else {
              resetToInitialBall();
            }
        }
    } else {
        // Stick ball to paddle
        const b = ballsRef.current[0];
        b.pos.x = paddleRef.current.x + paddleRef.current.width / 2;
        b.pos.y = PADDLE_Y - b.radius - 2;
    }

    // Check Win
    const activeBricks = bricksRef.current.filter(b => b.status === 1);
    if (activeBricks.length === 0) {
        soundEngine.playSFX('WIN');
        onLevelComplete();
        return; 
    }

    // 3. Update Particles
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);


    // --- Rendering ---

    // Clear Screen
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw PowerUps
    powerUpsRef.current.forEach(p => {
        ctx.beginPath();
        // Capsule shape
        ctx.roundRect(p.x, p.y, p.width, p.height, 10);
        ctx.fillStyle = COLORS.powerUps[p.type];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Icon/Text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        let symbol = '';
        if (p.type === PowerUpType.EXTEND) symbol = '<->';
        if (p.type === PowerUpType.MULTIBALL) symbol = 'ooo';
        if (p.type === PowerUpType.LIFE) symbol = '♥';
        ctx.fillText(symbol, p.x + p.width/2, p.y + 14);
        ctx.closePath();
    });

    // Draw Bricks
    bricksRef.current.forEach(brick => {
      if (brick.status === 1) {
        ctx.beginPath();
        ctx.rect(brick.x, brick.y, brick.width, brick.height);
        
        // Dynamic visual for Hard Bricks
        if (brick.type === BrickType.HARD) {
            ctx.fillStyle = brick.color; // Calculated in logic based on health
        } else if (brick.type === BrickType.EXPLOSIVE) {
             // Pulsing effect
             const pulse = Math.sin(Date.now() / 100) * 0.2 + 0.8;
             ctx.fillStyle = brick.color;
             ctx.globalAlpha = pulse;
        } else {
            ctx.fillStyle = brick.color;
        }

        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        // Border for hard bricks
        if (brick.type === BrickType.HARD) {
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Cracks?
            if (brick.health < brick.maxHealth) {
               ctx.fillStyle = 'rgba(0,0,0,0.3)';
               ctx.fillRect(brick.x + 5, brick.y + 10, brick.width - 10, 2);
            }
        }
        
        // Bomb Icon
        if (brick.type === BrickType.EXPLOSIVE) {
             ctx.fillStyle = '#fff';
             ctx.font = '12px Arial';
             ctx.textAlign = 'center';
             ctx.fillText('💣', brick.x + brick.width/2, brick.y + 18);
        }

        ctx.closePath();
      }
    });

    // Draw Paddle
    ctx.beginPath();
    ctx.roundRect(paddleRef.current.x, PADDLE_Y, paddleRef.current.width, paddleRef.current.height, 10);
    ctx.fillStyle = COLORS.paddle;
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.paddle;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.closePath();

    // Draw Balls
    ballsRef.current.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.ball;
        ctx.fill();
        ctx.closePath();
    });
    
    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.closePath();
    });

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  });

  // Controls
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      let relativeX = (e.clientX - rect.left) * scaleX;
      
      const halfPaddle = paddleRef.current.width / 2;
      
      if (relativeX < halfPaddle) relativeX = halfPaddle;
      if (relativeX > CANVAS_WIDTH - halfPaddle) relativeX = CANVAS_WIDTH - halfPaddle;
      
      paddleRef.current.x = relativeX - halfPaddle;
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        let relativeX = (e.touches[0].clientX - rect.left) * scaleX;
        
        const halfPaddle = paddleRef.current.width / 2;

        if (relativeX < halfPaddle) relativeX = halfPaddle;
        if (relativeX > CANVAS_WIDTH - halfPaddle) relativeX = CANVAS_WIDTH - halfPaddle;
        
        paddleRef.current.x = relativeX - halfPaddle;
    };

    const handleClick = () => {
      launchBall();
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            launchBall();
        }
    }

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
      canvas.addEventListener('mousedown', handleClick);
      canvas.addEventListener('touchstart', handleClick);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('mousedown', handleClick);
        canvas.removeEventListener('touchstart', handleClick);
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-4xl aspect-[4/3] bg-slate-800 rounded-xl overflow-hidden shadow-2xl ring-4 ring-slate-700">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full block cursor-none"
      />
      {ballsRef.current.length === 1 && !ballsRef.current[0].active && (
         <div className="absolute bottom-20 w-full text-center text-slate-400 text-sm animate-pulse pointer-events-none">
            Tap or Click to Launch (Starts Audio)
         </div>
      )}
    </div>
  );
};