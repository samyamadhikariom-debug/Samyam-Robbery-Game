import React from 'react';
import { GameEngine } from '../game/gameEngine';
import { Skull, AlertTriangle, RotateCcw } from 'lucide-react';

interface GameOverModalProps {
  engine: GameEngine;
  onRespawn: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ engine, onRespawn }) => {
  const isWasted = engine.gameState === 'WASTED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-xl overflow-hidden shadow-2xl text-center p-6 space-y-6">
        {/* Banner */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-700 flex items-center justify-center mb-3">
            {isWasted ? (
              <Skull className="w-8 h-8 text-rose-500 animate-pulse" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-amber-500 animate-pulse" />
            )}
          </div>
          <h1
            className={`text-4xl font-black font-sans tracking-widest ${
              isWasted ? 'text-rose-500' : 'text-blue-500'
            }`}
          >
            {isWasted ? 'WASTED' : 'BUSTED'}
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-wider">
            {isWasted ? 'You succumbed to critical injuries' : 'Arrested by Police Enforcers'}
          </p>
        </div>

        {/* Penalty details */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-left font-mono text-xs space-y-2">
          <div className="flex justify-between text-slate-400">
            <span>Carried Dirty Cash Lost:</span>
            <span className="text-rose-400 font-bold tabular-nums">
              -${engine.player.dirtyCash.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Hospital Emergency Care:</span>
            <span className="text-rose-400 font-bold tabular-nums">-$500</span>
          </div>
          <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-2">
            <span className="text-emerald-400">Preserved Stash Bankroll:</span>
            <span className="text-emerald-400 font-bold tabular-nums">
              ${engine.player.stashedCash.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Career stats */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Stores Robbed</div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {engine.player.storesRobbed}
            </div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Enemies Defeated</div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {engine.player.kills}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onRespawn}
          className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold font-sans text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
        >
          <RotateCcw className="w-4 h-4" /> Respawn at Southside Clinic
        </button>
      </div>
    </div>
  );
};
