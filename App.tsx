import React, { useState, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { Overlay } from './components/Overlay';
import { GameState } from './types';
import { LEVELS } from './constants';
import { Heart, Activity, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from './utils/SoundEngine';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isMuted, setIsMuted] = useState(false);

  const startGame = () => {
    // Audio context requires user gesture
    soundEngine.init();
    if (!isMuted) soundEngine.playBGM();
    
    setGameState(GameState.PLAYING);
    setCurrentLevelIndex(0);
    setScore(0);
    setLives(3);
  };

  const handleLevelComplete = useCallback(() => {
    if (currentLevelIndex + 1 < LEVELS.length) {
      setGameState(GameState.LEVEL_COMPLETE);
      setScore(prev => prev + 500);
    } else {
      setGameState(GameState.VICTORY);
      setScore(prev => prev + 1000);
    }
  }, [currentLevelIndex]);

  const handleNextLevel = () => {
    setCurrentLevelIndex(prev => prev + 1);
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = useCallback(() => {
    setGameState(GameState.GAME_OVER);
  }, []);

  const handleRestart = () => {
    setGameState(GameState.MENU);
    setCurrentLevelIndex(0);
    setScore(0);
  };

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    soundEngine.setMute(newState);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      
      {/* HUD */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-4 px-6 py-3 bg-slate-900/50 backdrop-blur border border-slate-800 rounded-full shadow-lg">
        <div className="flex items-center gap-4">
           <div className="flex items-center text-rose-500">
             <Heart className="fill-current" size={20} />
             <span className="ml-2 text-2xl font-bold font-mono">x {lives}</span>
           </div>
        </div>
        
        <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 uppercase tracking-widest">Level {currentLevelIndex + 1}</span>
            <span className="text-cyan-400 font-bold">{LEVELS[currentLevelIndex].name}</span>
        </div>

        <div className="flex items-center gap-6">
             <div className="flex items-center text-amber-400">
                <Activity size={20} className="mr-2" />
                <span className="text-2xl font-bold font-mono">{score.toString().padStart(5, '0')}</span>
             </div>
             <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors">
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
             </button>
        </div>
      </div>

      {/* Game Container */}
      <div className="relative w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden">
        {gameState === GameState.PLAYING && (
          <GameCanvas 
            level={LEVELS[currentLevelIndex]}
            onLevelComplete={handleLevelComplete}
            onGameOver={handleGameOver}
            onScoreUpdate={setScore}
            onLivesUpdate={setLives}
          />
        )}
        
        {gameState !== GameState.PLAYING && (
           <div className="w-full aspect-[4/3] bg-slate-900 flex items-center justify-center">
               <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
           </div>
        )}

        <Overlay 
          state={gameState} 
          score={score}
          level={currentLevelIndex + 1}
          onStart={startGame}
          onNextLevel={handleNextLevel}
          onRestart={handleRestart}
        />
      </div>

      <footer className="mt-8 text-slate-600 text-sm">
        Use Mouse/Touch to move paddle. Click/Tap/Space to launch.
      </footer>
    </div>
  );
}