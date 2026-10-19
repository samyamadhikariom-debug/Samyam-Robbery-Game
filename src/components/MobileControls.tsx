import React from 'react';
import { GameEngine } from '../game/gameEngine';
import { Car, Crosshair, DollarSign, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface MobileControlsProps {
  engine: GameEngine;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ engine }) => {
  const inCar = Boolean(engine.player.inVehicleId);

  const handleTouchStart = (key: string) => {
    engine.setKey(key, true);
  };

  const handleTouchEnd = (key: string) => {
    engine.setKey(key, false);
  };

  return (
    <div className="pointer-events-none md:hidden absolute inset-0 z-30 flex flex-col justify-end p-4 pb-20 select-none">
      <div className="flex items-end justify-between w-full">
        {/* Left Side: Directional Pad */}
        <div className="pointer-events-auto grid grid-cols-3 gap-1.5 w-36 h-36 bg-slate-950/60 backdrop-blur-sm p-2 rounded-2xl border border-slate-800">
          <div />
          <button
            onTouchStart={() => handleTouchStart('w')}
            onTouchEnd={() => handleTouchEnd('w')}
            onMouseDown={() => handleTouchStart('w')}
            onMouseUp={() => handleTouchEnd('w')}
            className="bg-slate-800/90 active:bg-slate-700 rounded-lg flex items-center justify-center text-white active:scale-95 shadow"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />

          <button
            onTouchStart={() => handleTouchStart('a')}
            onTouchEnd={() => handleTouchEnd('a')}
            onMouseDown={() => handleTouchStart('a')}
            onMouseUp={() => handleTouchEnd('a')}
            className="bg-slate-800/90 active:bg-slate-700 rounded-lg flex items-center justify-center text-white active:scale-95 shadow"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-center text-[10px] font-mono text-slate-500 font-bold">
            NAV
          </div>
          <button
            onTouchStart={() => handleTouchStart('d')}
            onTouchEnd={() => handleTouchEnd('d')}
            onMouseDown={() => handleTouchStart('d')}
            onMouseUp={() => handleTouchEnd('d')}
            className="bg-slate-800/90 active:bg-slate-700 rounded-lg flex items-center justify-center text-white active:scale-95 shadow"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div />
          <button
            onTouchStart={() => handleTouchStart('s')}
            onTouchEnd={() => handleTouchEnd('s')}
            onMouseDown={() => handleTouchStart('s')}
            onMouseUp={() => handleTouchEnd('s')}
            className="bg-slate-800/90 active:bg-slate-700 rounded-lg flex items-center justify-center text-white active:scale-95 shadow"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <div />
        </div>

        {/* Right Side: Action Buttons */}
        <div className="pointer-events-auto flex flex-col gap-2 items-end">
          {/* On-foot Run and Roll Buttons */}
          {!inCar && (
            <div className="flex items-center gap-2">
              {/* Sprint / Run Button */}
              <button
                onTouchStart={() => handleTouchStart('shift')}
                onTouchEnd={() => handleTouchEnd('shift')}
                onMouseDown={() => handleTouchStart('shift')}
                onMouseUp={() => handleTouchEnd('shift')}
                className="w-13 h-13 rounded-full bg-amber-500 active:bg-amber-400 text-slate-950 font-black flex flex-col items-center justify-center shadow-lg active:scale-90 border-2 border-amber-300"
              >
                <span className="text-[10px] font-mono font-bold leading-tight uppercase">RUN</span>
              </button>

              {/* Dodge Roll Button */}
              <button
                onClick={() => engine.triggerDodgeRoll()}
                className="w-13 h-13 rounded-full bg-indigo-600 active:bg-indigo-500 text-white font-black flex flex-col items-center justify-center shadow-lg active:scale-90 border-2 border-indigo-400"
              >
                <span className="text-[9px] font-mono font-bold leading-tight uppercase">ROLL</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Rob Store Button */}
            <button
              onClick={() => engine.setKey('e', true)}
              className="w-14 h-14 rounded-full bg-emerald-600 active:bg-emerald-500 text-slate-950 font-black flex flex-col items-center justify-center shadow-lg active:scale-90 border-2 border-emerald-400"
            >
              <DollarSign className="w-5 h-5" />
              <span className="text-[9px] font-mono font-bold leading-tight">ROB</span>
            </button>

            {/* Jack / Enter Car Button */}
            <button
              onClick={() => engine.setKey('f', true)}
              className="w-14 h-14 rounded-full bg-sky-600 active:bg-sky-500 text-white font-black flex flex-col items-center justify-center shadow-lg active:scale-90 border-2 border-sky-400"
            >
              <Car className="w-5 h-5" />
              <span className="text-[9px] font-mono font-bold leading-tight">{inCar ? 'EXIT' : 'JACK'}</span>
            </button>
          </div>

          {/* Fire / Shoot Button */}
          <button
            onTouchStart={() => engine.setMouseDown(true)}
            onTouchEnd={() => engine.setMouseDown(false)}
            onMouseDown={() => engine.setMouseDown(true)}
            onMouseUp={() => engine.setMouseDown(false)}
            className="w-16 h-16 rounded-full bg-rose-600 active:bg-rose-500 text-white flex flex-col items-center justify-center shadow-xl active:scale-90 border-2 border-rose-400"
          >
            <Crosshair className="w-7 h-7" />
            <span className="text-[9px] font-mono font-bold uppercase">{inCar ? 'RAM' : 'FIRE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
