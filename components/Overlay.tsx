import React from 'react';
import { GameState } from '../types';
import { Button } from './Button';
import { Trophy, Skull, Play, SkipForward, RotateCcw } from 'lucide-react';

interface OverlayProps {
  state: GameState;
  score: number;
  level: number;
  onStart: () => void;
  onNextLevel: () => void;
  onRestart: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({
  state,
  score,
  level,
  onStart,
  onNextLevel,
  onRestart
}) => {
  if (state === GameState.PLAYING) return null;

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm p-6 text-center animate-in fade-in duration-300">
      
      {state === GameState.MENU && (
        <>
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-purple-500 mb-8 filter drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            NEON<br/>BREAKOUT
          </h1>
          <p className="text-slate-300 mb-10 text-lg tracking-wide">Destroy all bricks. Don't drop the ball.</p>
          <Button onClick={onStart}>
            <div className="flex items-center gap-2">
              <Play size={24} /> START GAME
            </div>
          </Button>
        </>
      )}

      {state === GameState.LEVEL_COMPLETE && (
        <>
          <h2 className="text-5xl font-bold text-green-400 mb-4 drop-shadow-glow">LEVEL {level} CLEARED</h2>
          <p className="text-2xl text-white mb-8">Score: {score}</p>
          <Button onClick={onNextLevel}>
             <div className="flex items-center gap-2">
              <SkipForward size={24} /> NEXT LEVEL
            </div>
          </Button>
        </>
      )}

      {state === GameState.GAME_OVER && (
        <>
          <Skull size={64} className="text-red-500 mb-4" />
          <h2 className="text-5xl font-bold text-red-500 mb-4">GAME OVER</h2>
          <p className="text-xl text-slate-300 mb-2">You reached Level {level}</p>
          <p className="text-2xl text-white mb-8 font-bold">Final Score: {score}</p>
          <Button onClick={onRestart} variant="secondary">
             <div className="flex items-center gap-2">
              <RotateCcw size={24} /> TRY AGAIN
            </div>
          </Button>
        </>
      )}

      {state === GameState.VICTORY && (
        <>
          <Trophy size={80} className="text-yellow-400 mb-6 animate-bounce" />
          <h2 className="text-6xl font-black text-yellow-400 mb-6">VICTORY!</h2>
          <p className="text-slate-200 text-lg mb-2">You have conquered the Neon Trilogy.</p>
          <p className="text-3xl text-white mb-10 font-bold border-b-2 border-yellow-500/50 pb-2">Final Score: {score}</p>
          <Button onClick={onRestart}>
             <div className="flex items-center gap-2">
              <Play size={24} /> PLAY AGAIN
            </div>
          </Button>
        </>
      )}
    </div>
  );
};