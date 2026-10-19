import React, { useState, useEffect, useRef } from 'react';
import { GameEngine } from './game/gameEngine';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { MobileControls } from './components/MobileControls';
import { TitleScreen } from './components/TitleScreen';
import { SafehouseModal } from './components/SafehouseModal';
import { AmmuNationModal } from './components/AmmuNationModal';
import { GameOverModal } from './components/GameOverModal';
import { PauseMenu } from './components/PauseMenu';

export default function App() {
  const engineRef = useRef<GameEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new GameEngine();
  }
  const engine = engineRef.current;

  const [gameState, setGameState] = useState(engine.gameState);
  const [notification, setNotification] = useState<{
    msg: string;
    type: 'info' | 'crime' | 'cash' | 'danger';
  } | null>(null);

  const notifTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Connect notification callback
    engine.onNotification = (msg, type) => {
      setNotification({ msg, type });
      if (notifTimeoutRef.current) clearTimeout(notifTimeoutRef.current);
      notifTimeoutRef.current = window.setTimeout(() => {
        setNotification(null);
      }, 3500);
    };

    // ESC to pause/resume
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (engine.gameState === 'PLAYING') {
          engine.gameState = 'PAUSED';
          setGameState('PAUSED');
        } else if (engine.gameState === 'PAUSED') {
          engine.gameState = 'PLAYING';
          setGameState('PLAYING');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Sync game state periodically
    const interval = setInterval(() => {
      if (engine.gameState !== gameState) {
        setGameState(engine.gameState);
      }
    }, 150);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
      if (notifTimeoutRef.current) clearTimeout(notifTimeoutRef.current);
    };
  }, [engine, gameState]);

  const handleStartGame = () => {
    engine.startNewGame();
    setGameState('PLAYING');
  };

  const handleResumeGame = () => {
    engine.gameState = 'PLAYING';
    setGameState('PLAYING');
  };

  const handleRestartGame = () => {
    engine.startNewGame();
    setGameState('PLAYING');
  };

  const handleCloseSafehouse = () => {
    engine.gameState = 'PLAYING';
    setGameState('PLAYING');
  };

  const handleCloseAmmuNation = () => {
    engine.gameState = 'PLAYING';
    setGameState('PLAYING');
  };

  const handleRespawn = () => {
    engine.respawnPlayer();
    setGameState('PLAYING');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {gameState === 'TITLE' && <TitleScreen onStart={handleStartGame} />}

      {gameState !== 'TITLE' && (
        <>
          {/* Main 2D Game Canvas */}
          <GameCanvas engine={engine} />

          {/* Interactive HUD & Radar */}
          <HUD
            engine={engine}
            onOpenPause={() => {
              engine.gameState = 'PAUSED';
              setGameState('PAUSED');
            }}
            notification={notification}
          />

          {/* Mobile touch controls */}
          <MobileControls engine={engine} />

          {/* Safehouse Menu Modal */}
          {gameState === 'SAFEHOUSE_MENU' && (
            <SafehouseModal engine={engine} onClose={handleCloseSafehouse} />
          )}

          {/* Ammu-Nation Weapon Shop Modal */}
          {gameState === 'AMMUNATION_MENU' && (
            <AmmuNationModal engine={engine} onClose={handleCloseAmmuNation} />
          )}

          {/* Wasted / Busted Modal */}
          {(gameState === 'WASTED' || gameState === 'BUSTED') && (
            <GameOverModal engine={engine} onRespawn={handleRespawn} />
          )}

          {/* Pause / Guide Menu */}
          {gameState === 'PAUSED' && (
            <PauseMenu
              engine={engine}
              onResume={handleResumeGame}
              onRestart={handleRestartGame}
            />
          )}
        </>
      )}
    </div>
  );
}
