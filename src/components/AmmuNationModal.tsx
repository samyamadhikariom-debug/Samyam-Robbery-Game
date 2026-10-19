import React from 'react';
import { GameEngine, WEAPONS_DATA } from '../game/gameEngine';
import { soundEngine } from '../game/audio';
import { WeaponType } from '../game/types';
import { Shield, Crosshair, X, ShoppingBag } from 'lucide-react';

interface AmmuNationModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const AmmuNationModal: React.FC<AmmuNationModalProps> = ({ engine, onClose }) => {
  const [, setTick] = React.useState(0);

  const buyWeapon = (type: WeaponType) => {
    const w = WEAPONS_DATA[type];
    const totalCost = w.price;
    const availableCash = engine.player.dirtyCash + engine.player.stashedCash;

    if (availableCash < totalCost) {
      engine.notify(`Not enough funds to purchase ${w.name}!`, 'danger');
      return;
    }

    // Deduct cash
    if (engine.player.dirtyCash >= totalCost) {
      engine.player.dirtyCash -= totalCost;
    } else {
      const remaining = totalCost - engine.player.dirtyCash;
      engine.player.dirtyCash = 0;
      engine.player.stashedCash -= remaining;
    }

    engine.player.weapons[type].owned = true;
    engine.player.weapons[type].ammo = w.ammo;
    engine.player.currentWeapon = type;

    soundEngine.playCashPickup();
    engine.notify(`Purchased ${w.name}!`, 'cash');
    setTick((t) => t + 1);
  };

  const buyAmmo = (type: WeaponType, count: number, cost: number) => {
    const availableCash = engine.player.dirtyCash + engine.player.stashedCash;
    if (availableCash < cost) {
      engine.notify(`Need $${cost} for ammunition!`, 'danger');
      return;
    }

    if (engine.player.dirtyCash >= cost) {
      engine.player.dirtyCash -= cost;
    } else {
      const remaining = cost - engine.player.dirtyCash;
      engine.player.dirtyCash = 0;
      engine.player.stashedCash -= remaining;
    }

    const currentAmmo = engine.player.weapons[type].ammo;
    engine.player.weapons[type].ammo = Math.min(
      WEAPONS_DATA[type].maxAmmo,
      (currentAmmo < 0 ? 0 : currentAmmo) + count
    );

    soundEngine.playCashPickup();
    engine.notify(`Bought +${count} ammo for ${WEAPONS_DATA[type].name}!`, 'cash');
    setTick((t) => t + 1);
  };

  const buyArmorRefill = () => {
    const cost = 500;
    const availableCash = engine.player.dirtyCash + engine.player.stashedCash;
    if (availableCash < cost) {
      engine.notify('Need $500 for body armor!', 'danger');
      return;
    }

    if (engine.player.dirtyCash >= cost) {
      engine.player.dirtyCash -= cost;
    } else {
      const remaining = cost - engine.player.dirtyCash;
      engine.player.dirtyCash = 0;
      engine.player.stashedCash -= remaining;
    }

    engine.player.armor = engine.upgrades.maxArmor;
    soundEngine.playCashPickup();
    engine.notify('Kevlar Armor replenished to 100%!', 'cash');
    setTick((t) => t + 1);
  };

  const weaponsList: WeaponType[] = ['pistol', 'smg', 'shotgun', 'rifle'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-lime-950 border border-lime-800/80 text-lime-400 rounded-lg">
              <Crosshair className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-lime-400 tracking-wider">Gun Store & Armory</div>
              <h2 className="text-2xl font-bold font-sans text-white">Ammu-Nation Metro</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[11px] font-mono text-slate-400">Total Funds</div>
              <div className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                ${(engine.player.dirtyCash + engine.player.stashedCash).toLocaleString()}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Catalog */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Armor Top Pick */}
          <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-sky-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Standard Kevlar Vest Refill</h4>
                <p className="text-xs text-slate-400">Restores armor to maximum ({engine.upgrades.maxArmor} AP).</p>
              </div>
            </div>
            <button
              onClick={buyArmorRefill}
              disabled={engine.player.armor >= engine.upgrades.maxArmor}
              className={`px-4 py-2 rounded text-xs font-mono font-bold ${
                engine.player.armor >= engine.upgrades.maxArmor
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-500 text-white'
              }`}
            >
              {engine.player.armor >= engine.upgrades.maxArmor ? 'Armor Full' : 'Refill ($500)'}
            </button>
          </div>

          {/* Firearms List */}
          <div className="space-y-3">
            {weaponsList.map((wId) => {
              const w = WEAPONS_DATA[wId];
              const owned = engine.player.weapons[wId].owned;
              const currentAmmo = engine.player.weapons[wId].ammo;

              return (
                <div
                  key={wId}
                  className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{w.name}</span>
                      {owned && (
                        <span className="text-[10px] font-mono bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 px-2 py-0.5 rounded">
                          Owned
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-3">
                      <span>Dmg: {w.damage}</span>
                      <span>·</span>
                      <span>Fire Rate: {w.fireRate}ms</span>
                      <span>·</span>
                      <span>Range: {w.range}px</span>
                      {owned && (
                        <>
                          <span>·</span>
                          <span className="text-amber-400">Ammo: {currentAmmo} / {w.maxAmmo}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!owned ? (
                      <button
                        onClick={() => buyWeapon(wId)}
                        className="px-4 py-2 bg-lime-600 hover:bg-lime-500 text-slate-950 font-bold font-mono text-xs rounded transition-colors flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Buy Gun (${w.price.toLocaleString()})
                      </button>
                    ) : (
                      <button
                        onClick={() => buyAmmo(wId, w.ammo, Math.round(w.price * 0.15))}
                        disabled={currentAmmo >= w.maxAmmo}
                        className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-lime-300 font-mono text-xs rounded transition-colors"
                      >
                        +Ammo (${Math.round(w.price * 0.15)})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-lg transition-colors"
          >
            Leave Ammu-Nation
          </button>
        </div>
      </div>
    </div>
  );
};
