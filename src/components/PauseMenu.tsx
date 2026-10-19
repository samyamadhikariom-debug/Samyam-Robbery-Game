import React from 'react';
import { GameEngine } from '../game/gameEngine';
import { soundEngine } from '../game/audio';
import { Volume2, VolumeX, Play, ShieldAlert, Car, ShoppingCart, Landmark } from 'lucide-react';

interface PauseMenuProps {
  engine: GameEngine;
  onResume: () => void;
  onRestart: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ engine, onResume, onRestart }) => {
  const [muted, setMuted] = React.useState(soundEngine.getMuted());
  const [stationName, setStationName] = React.useState(soundEngine.getStationName());

  const toggleSound = () => {
    const isMuted = soundEngine.toggleMute();
    setMuted(isMuted);
  };

  const cycleRadio = () => {
    const s = soundEngine.toggleRadio();
    setStationName(s);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-xl overflow-hidden shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-mono uppercase text-amber-400 tracking-wider">Mission Briefing & Guide</div>
            <h2 className="text-2xl font-bold font-sans text-white">Game Suspended</h2>
          </div>
          <button
            onClick={onResume}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-sans text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Resume Game
          </button>
        </div>

        {/* Controls Grid */}
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">Keyboard & Controls</h3>
          <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
            <div className="p-2.5 bg-slate-800/80 rounded border border-slate-700/60 flex justify-between">
              <span className="text-slate-400">Drive / Move:</span>
              <span className="text-white font-bold">WASD / Arrow Keys</span>
            </div>
            <div className="p-2.5 bg-slate-800/80 rounded border border-slate-700/60 flex justify-between">
              <span className="text-slate-400">Aim & Shoot:</span>
              <span className="text-white font-bold">Mouse / Left Click</span>
            </div>
            <div className="p-2.5 bg-slate-800/80 rounded border border-slate-700/60 flex justify-between">
              <span className="text-slate-400">Rob Store / Interact:</span>
              <span className="text-amber-400 font-bold">[E] Key</span>
            </div>
            <div className="p-2.5 bg-slate-800/80 rounded border border-slate-700/60 flex justify-between">
              <span className="text-slate-400">Enter / Jack Car:</span>
              <span className="text-sky-400 font-bold">[F] or [Enter]</span>
            </div>
            <div className="p-2.5 bg-slate-800/80 rounded border border-slate-700/60 flex justify-between">
              <span className="text-slate-400">Sprint / Run:</span>
              <span className="text-amber-400 font-bold">[Shift] (Fast Run)</span>
            </div>
            <div className="p-2.5 bg-slate-800/80 rounded border border-slate-700/60 flex justify-between">
              <span className="text-slate-400">Dodge Roll / Brake:</span>
              <span className="text-sky-300 font-bold">[Space] (Roll on Foot)</span>
            </div>
            <div className="p-2.5 bg-slate-800/80 rounded border border-slate-700/60 flex justify-between">
              <span className="text-slate-400">Weapons (1-5):</span>
              <span className="text-emerald-400 font-bold">Fists, Pistol, SMG, Shotgun, AK</span>
            </div>
          </div>
        </div>

        {/* Heist Rules */}
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">How Heists & Police Work</h3>
          <div className="space-y-2 text-xs text-slate-300 font-sans">
            <div className="flex items-start gap-2.5">
              <ShoppingCart className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Rob Stores:</strong> Stand near any convenience store, liquor shop, jewelry store, or bank vault and press <strong>[E]</strong>. Hold your ground while the alarm blares until the safe cracks!
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                <strong>Run from Police:</strong> Escaping starts immediately upon robbery! Evade by weaving through alleys and breaking line of sight until your stars flash and cool down, or visit <strong>Pay &apos;n&apos; Spray</strong> to instantly respray.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <Landmark className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>
                <strong>Bank Your Stash:</strong> Carried dirty cash is lost if you get Wasted or Busted. Rush to your <strong>Safehouse</strong> to bank it permanently and unlock powerful vehicle deliveries & armor perks!
              </span>
            </div>
          </div>
        </div>

        {/* Audio Toggles */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSound}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white rounded transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span>{muted ? 'Sound Muted' : 'Sound Active'}</span>
            </button>

            <button
              onClick={cycleRadio}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white rounded transition-colors"
            >
              <Car className="w-4 h-4 text-pink-400" />
              <span>Station: {stationName}</span>
            </button>
          </div>

          <button
            onClick={onRestart}
            className="text-xs font-mono text-rose-400 hover:text-rose-300 underline underline-offset-4"
          >
            Reset Game Progress
          </button>
        </div>
      </div>
    </div>
  );
};
