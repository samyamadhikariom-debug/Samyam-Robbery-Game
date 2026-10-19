import React from 'react';
import { GameEngine } from '../game/gameEngine';
import { soundEngine } from '../game/audio';
import { Shield, Zap, Radio, Car, Home, X, Check } from 'lucide-react';

interface SafehouseModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const SafehouseModal: React.FC<SafehouseModalProps> = ({ engine, onClose }) => {
  const [cash, setCash] = React.useState(engine.player.stashedCash);

  const buyUpgrade = (type: 'armor' | 'sprint' | 'scrambler', cost: number) => {
    if (engine.player.stashedCash < cost) {
      engine.notify(`Not enough stashed cash ($${cost.toLocaleString()} needed)!`, 'danger');
      return;
    }

    engine.player.stashedCash -= cost;
    setCash(engine.player.stashedCash);
    soundEngine.playCashPickup();

    if (type === 'armor') {
      engine.upgrades.maxArmor = 150;
      engine.player.armor = 150;
      engine.notify('Upgraded to Heavy Kevlar Armor (150 AP)!', 'cash');
    } else if (type === 'sprint') {
      engine.upgrades.sprintSpeed = 1.3;
      engine.notify('Athletic Sprint Conditioning unlocked (+30% speed)!', 'cash');
    } else if (type === 'scrambler') {
      engine.upgrades.stealthBribe = true;
      engine.notify('Police Dispatch Scrambler active (-30% wanted heat)!', 'cash');
    }
  };

  const spawnGetawayCar = (model: 'muscle' | 'supercar') => {
    const cost = model === 'supercar' ? 3000 : 1000;
    if (engine.player.stashedCash < cost) {
      engine.notify(`Need $${cost.toLocaleString()} for vehicle delivery!`, 'danger');
      return;
    }
    engine.player.stashedCash -= cost;
    setCash(engine.player.stashedCash);
    soundEngine.playCashPickup();

    // Spawn right outside the safehouse garage
    engine.spawnVehicle(model, engine.player.x + 40, engine.player.y - 60, 0, false);
    engine.notify(`Fresh ${model === 'supercar' ? 'Pegassi Turismo' : 'Bravado Phoenix'} delivered outside!`, 'cash');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Safehouse Header Banner */}
        <div className="relative h-44 bg-slate-950 overflow-hidden shrink-0 border-b border-slate-800">
          <img
            src="/src/assets/images/heist_safehouse_bg_1792329964567.jpg"
            alt="Safehouse Garage Workbench"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Home className="w-4 h-4" /> Underground Hideout & Safehouse
              </div>
              <h2 className="text-2xl font-bold text-white font-sans">Southside Garage Stash</h2>
            </div>

            <div className="text-right bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-700">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Stashed Bankroll</div>
              <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                ${cash.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Message */}
          <div className="bg-emerald-950/40 border border-emerald-800/60 p-3.5 rounded-lg text-emerald-300 text-xs font-mono flex items-center justify-between">
            <span>✓ ALL DIRTY CASH SAFELY BANKED · WANTED HEAT WIPED · HEALTH & ARMOR RESTORED</span>
          </div>

          {/* Upgrades Grid */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
              Perks & Equipment Upgrades
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Heavy Kevlar */}
              <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="w-5 h-5 text-sky-400" />
                    <span className="text-xs font-mono text-amber-400 font-bold">$3,500</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">Heavy Kevlar</h4>
                  <p className="text-xs text-slate-400 mt-1">Expands max armor protection to 150 AP.</p>
                </div>
                <button
                  disabled={engine.upgrades.maxArmor >= 150}
                  onClick={() => buyUpgrade('armor', 3500)}
                  className={`mt-4 py-1.5 px-3 rounded text-xs font-mono font-semibold transition-colors ${
                    engine.upgrades.maxArmor >= 150
                      ? 'bg-emerald-900/50 text-emerald-300 cursor-default'
                      : 'bg-sky-600 hover:bg-sky-500 text-white'
                  }`}
                >
                  {engine.upgrades.maxArmor >= 150 ? 'Equipped' : 'Purchase'}
                </button>
              </div>

              {/* Sprint Conditioning */}
              <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-mono text-amber-400 font-bold">$2,000</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">Sprint Conditioning</h4>
                  <p className="text-xs text-slate-400 mt-1">Boosts sprint speed by 30% on foot.</p>
                </div>
                <button
                  disabled={engine.upgrades.sprintSpeed > 1}
                  onClick={() => buyUpgrade('sprint', 2000)}
                  className={`mt-4 py-1.5 px-3 rounded text-xs font-mono font-semibold transition-colors ${
                    engine.upgrades.sprintSpeed > 1
                      ? 'bg-emerald-900/50 text-emerald-300 cursor-default'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  {engine.upgrades.sprintSpeed > 1 ? 'Unlocked' : 'Purchase'}
                </button>
              </div>

              {/* Radio Scrambler */}
              <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Radio className="w-5 h-5 text-rose-400" />
                    <span className="text-xs font-mono text-amber-400 font-bold">$6,000</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">Police Scrambler</h4>
                  <p className="text-xs text-slate-400 mt-1">Slows down wanted level accumulation by 30%.</p>
                </div>
                <button
                  disabled={engine.upgrades.stealthBribe}
                  onClick={() => buyUpgrade('scrambler', 6000)}
                  className={`mt-4 py-1.5 px-3 rounded text-xs font-mono font-semibold transition-colors ${
                    engine.upgrades.stealthBribe
                      ? 'bg-emerald-900/50 text-emerald-300 cursor-default'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  {engine.upgrades.stealthBribe ? 'Active' : 'Purchase'}
                </button>
              </div>
            </div>
          </div>

          {/* Driveway Getaway Car Drop */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
              Driveway Getaway Vehicles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-lg flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-white">Bravado Phoenix</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Heavy muscle car with high acceleration & drift.</p>
                </div>
                <button
                  onClick={() => spawnGetawayCar('muscle')}
                  className="py-1.5 px-3 bg-slate-700 hover:bg-slate-600 text-amber-300 rounded text-xs font-mono font-semibold"
                >
                  Order ($1,000)
                </button>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-lg flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Pegassi Turismo</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">High-speed exotic supercar for rapid escapes.</p>
                </div>
                <button
                  onClick={() => spawnGetawayCar('supercar')}
                  className="py-1.5 px-3 bg-slate-700 hover:bg-slate-600 text-emerald-300 rounded text-xs font-mono font-semibold"
                >
                  Order ($3,000)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400">
            Stores Robbed: <span className="text-white font-bold">{engine.player.storesRobbed}</span> · Police Evaded:{' '}
            <span className="text-white font-bold">{engine.player.kills}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-sans text-xs rounded-lg transition-colors"
          >
            Back to Streets
          </button>
        </div>
      </div>
    </div>
  );
};
