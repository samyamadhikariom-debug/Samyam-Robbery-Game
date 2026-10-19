import React from 'react';
import { Play, Shield, DollarSign, Car, Crosshair } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-screen w-full bg-slate-950 flex flex-col justify-between overflow-x-hidden text-slate-100">
      {/* Background Graphic Hero */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/game_cover_art_1792329963592.jpg"
          alt="Street Heat 2D GTA Cover Art"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-35 filter saturate-150"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.85)_100%)]" />
      </div>

      {/* Top Bar according to Frontend Design Contract */}
      <header className="relative z-10 flex items-center justify-between gap-8 px-6 lg:px-12 py-5 border-b border-slate-800/80 backdrop-blur-sm">
        {/* Zone 1: Wordmark */}
        <div className="text-xl font-black tracking-tight text-white font-sans flex items-center gap-2 whitespace-nowrap shrink-0">
          <span className="text-rose-500">STREET</span>
          <span>HEAT</span>
        </div>

        {/* Zone 2: Nav items / highlights */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-slate-400">
          <span className="hover:text-white transition-colors whitespace-nowrap shrink-0">Open-World Top-Down</span>
          <span className="hover:text-white transition-colors whitespace-nowrap shrink-0">Store Robbery</span>
          <span className="hover:text-white transition-colors whitespace-nowrap shrink-0">5-Star Police Pursuits</span>
          <span className="hover:text-white transition-colors whitespace-nowrap shrink-0">Stash Hideouts</span>
        </nav>

        {/* Zone 3: Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onStart}
            className="px-5 py-2 text-xs font-mono font-bold text-slate-950 bg-rose-500 hover:bg-rose-400 rounded transition-colors uppercase whitespace-nowrap shrink-0 shadow-lg shadow-rose-950/40"
          >
            Play Now
          </button>
        </div>
      </header>

      {/* Main Hero Showcase */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 tracking-wider uppercase bg-amber-950/60 border border-amber-800/80 px-3 py-1 rounded">
            <span>2D Classic Heist Action</span>
            <span aria-hidden="true">·</span>
            <span>Evade The Heat</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-sans text-white tracking-tight leading-none text-balance">
            Hit The Stores. <br />
            <span className="text-rose-500">Outrun The Police.</span> <br />
            Bank The Stash.
          </h1>

          <p className="text-base text-slate-300 font-sans leading-relaxed">
            Roam a dense open-world city. Jack fast muscle cars and supercars, stick up convenience stores, crack bank vaults, and outwit escalating 1-to-5 star police cruisers, SWAT enforcers, and helicopter searchlights before stashing dirty cash in your safehouse.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onStart}
              className="px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold text-base rounded-lg transition-all shadow-xl shadow-rose-900/30 flex items-center gap-2.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-5 h-5 fill-current" /> Start Crime Wave
            </button>
          </div>
        </div>

        {/* 4 Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 pt-8 border-t border-slate-800/80">
          <div className="p-4 bg-slate-900/60 backdrop-blur-md rounded-lg border border-slate-800">
            <DollarSign className="w-6 h-6 text-emerald-400 mb-2" />
            <h3 className="text-sm font-bold text-white font-sans">Multi-Tier Heists</h3>
            <p className="text-xs text-slate-400 mt-1">
              From corner QuickMarts to the Grand Central Reserve and Crown Casino vaults.
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 backdrop-blur-md rounded-lg border border-slate-800">
            <Shield className="w-6 h-6 text-rose-400 mb-2" />
            <h3 className="text-sm font-bold text-white font-sans">1–5 Star Police AI</h3>
            <p className="text-xs text-slate-400 mt-1">
              Patrol cars, aggressive PIT maneuvers, tactical road blocks, and overhead searchlights.
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 backdrop-blur-md rounded-lg border border-slate-800">
            <Car className="w-6 h-6 text-sky-400 mb-2" />
            <h3 className="text-sm font-bold text-white font-sans">Top-Down Driving</h3>
            <p className="text-xs text-slate-400 mt-1">
              Jack any civilian car on the asphalt. Drift around corners and leave rubber skidmarks.
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 backdrop-blur-md rounded-lg border border-slate-800">
            <Crosshair className="w-6 h-6 text-amber-400 mb-2" />
            <h3 className="text-sm font-bold text-white font-sans">Safehouse Bankroll</h3>
            <p className="text-xs text-slate-400 mt-1">
              Lose dirty money if caught. Deposit cash in your hideout to purchase permanent upgrades.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-4 border-t border-slate-800/60 text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>Street Heat · 2D Open World Crime Action</span>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <span>WASD: Move / Drive</span>
          <span>Shift: Sprint / Run</span>
          <span>Space: Roll / Brake</span>
          <span>E: Rob Store</span>
          <span>F: Jack Car</span>
          <span>Click: Shoot</span>
        </div>
      </footer>
    </div>
  );
};
