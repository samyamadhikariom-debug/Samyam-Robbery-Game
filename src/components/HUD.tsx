import React, { useEffect, useRef } from 'react';
import { GameEngine, WEAPONS_DATA } from '../game/gameEngine';
import { soundEngine } from '../game/audio';
import { CITY_SIZE, STORES, SAFIEHOUSES, PAY_N_SPRAYS } from '../game/cityData';
import { Shield, Heart, DollarSign, Crosshair, Volume2, VolumeX, Radio, Navigation, HelpCircle } from 'lucide-react';

interface HUDProps {
  engine: GameEngine;
  onOpenPause: () => void;
  notification: { msg: string; type: 'info' | 'crime' | 'cash' | 'danger' } | null;
}

export const HUD: React.FC<HUDProps> = ({ engine, onOpenPause, notification }) => {
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const [muted, setMuted] = React.useState(soundEngine.getMuted());
  const [stationName, setStationName] = React.useState(soundEngine.getStationName());

  // Render Minimap Radar
  useEffect(() => {
    let animId: number;
    const renderMinimap = () => {
      const canvas = minimapRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const mapSize = canvas.width;
          const scale = mapSize / CITY_SIZE;

          // Clear map radar
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, mapSize, mapSize);

          // Grid lines
          ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
          ctx.lineWidth = 1;
          for (let i = 0; i < mapSize; i += 30) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, mapSize);
            ctx.moveTo(0, i);
            ctx.lineTo(mapSize, i);
            ctx.stroke();
          }

          // Stores (dollar green blips)
          STORES.forEach((s) => {
            ctx.fillStyle = s.isRobbed && s.cooldownTimer > 0 ? '#64748b' : '#22c55e';
            ctx.beginPath();
            ctx.arc((s.x + s.width / 2) * scale, (s.y + s.height / 2) * scale, 3, 0, Math.PI * 2);
            ctx.fill();
          });

          // Safehouses (blue/cyan blip)
          SAFIEHOUSES.forEach((sh) => {
            ctx.fillStyle = sh.isOwned ? '#38bdf8' : '#94a3b8';
            ctx.fillRect(sh.x * scale, sh.y * scale, 5, 5);
          });

          // Pay N Sprays (amber blip)
          PAY_N_SPRAYS.forEach((p) => {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(p.x * scale, p.y * scale, 2.5, 0, Math.PI * 2);
            ctx.fill();
          });

          // Police cars (flashing red/blue blips)
          engine.vehicles.forEach((v) => {
            if (v.isPolice && !v.isDestroyed) {
              const flash = Math.floor(Date.now() / 200) % 2 === 0;
              ctx.fillStyle = flash ? '#ef4444' : '#3b82f6';
              ctx.beginPath();
              ctx.arc(v.x * scale, v.y * scale, 3.5, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // Player Blip
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(engine.player.x * scale, engine.player.y * scale, 4, 0, Math.PI * 2);
          ctx.fill();

          // Player direction arrow
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(engine.player.x * scale, engine.player.y * scale);
          ctx.lineTo(
            engine.player.x * scale + Math.cos(engine.player.angle) * 8,
            engine.player.y * scale + Math.sin(engine.player.angle) * 8
          );
          ctx.stroke();

          // Radar circle border
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.strokeRect(0, 0, mapSize, mapSize);
        }
      }
      animId = requestAnimationFrame(renderMinimap);
    };

    animId = requestAnimationFrame(renderMinimap);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  const toggleSound = () => {
    const isMuted = soundEngine.toggleMute();
    setMuted(isMuted);
  };

  const cycleRadio = () => {
    const newStation = soundEngine.toggleRadio();
    setStationName(newStation);
  };

  const playerVeh = engine.player.inVehicleId
    ? engine.vehicles.find((v) => v.id === engine.player.inVehicleId)
    : null;

  const currentWeapon = WEAPONS_DATA[engine.player.currentWeapon];
  const weaponAmmo = engine.player.weapons[engine.player.currentWeapon].ammo;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 z-20">
      {/* Top Bar HUD */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Player Status (Health, Armor, Cash) */}
        <div className="pointer-events-auto flex flex-col gap-2 bg-slate-950/85 backdrop-blur-md p-3 rounded-lg border border-slate-800 shadow-xl max-w-sm">
          {/* Health & Armor Bars */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1">
                <span className="flex items-center gap-1 text-rose-400 font-semibold">
                  <Heart className="w-3.5 h-3.5 fill-rose-400" /> HP
                </span>
                <span className="tabular-nums font-bold">
                  {Math.max(0, Math.ceil(engine.player.health))} / {engine.player.maxHealth}
                </span>
              </div>
              <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-150"
                  style={{ width: `${(engine.player.health / engine.player.maxHealth) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1">
                <span className="flex items-center gap-1 text-sky-400 font-semibold">
                  <Shield className="w-3.5 h-3.5 fill-sky-400" /> ARMOR
                </span>
                <span className="tabular-nums font-bold">
                  {Math.ceil(engine.player.armor)} / {engine.upgrades.maxArmor}
                </span>
              </div>
              <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all duration-150"
                  style={{ width: `${(engine.player.armor / engine.upgrades.maxArmor) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Running Stamina Bar (On Foot) */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-0.5">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> RUN STAMINA [SHIFT]
              </span>
              <span className="tabular-nums font-bold text-amber-300">
                {Math.ceil(engine.player.stamina)}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${
                  engine.player.stamina < 20 ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'
                }`}
                style={{ width: `${(engine.player.stamina / engine.player.maxStamina) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mt-1">
              <span>HOLD [SHIFT] SPRINT</span>
              <span className="text-sky-300">[SPACE] DODGE ROLL</span>
            </div>
          </div>

          {/* Cash Ledger */}
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs font-mono">
            {/* Dirty Cash Carried */}
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-semibold">CARRIED:</span>
              <span className={`tabular-nums font-bold text-sm ${engine.player.dirtyCash > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
                ${engine.player.dirtyCash.toLocaleString()}
              </span>
              {engine.player.dirtyCash > 0 && (
                <span className="text-[10px] text-amber-500/90 font-sans uppercase tracking-tight">(At Risk)</span>
              )}
            </div>

            {/* Stashed Cash in Safehouse */}
            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-800">
              <span className="text-slate-400 font-semibold">STASHED:</span>
              <span className="text-emerald-400 font-bold text-sm tabular-nums">
                ${engine.player.stashedCash.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Wanted Stars & Evasion status */}
        <div className="pointer-events-auto flex flex-col items-center bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-800 shadow-xl">
          <div className="text-[11px] font-mono tracking-wider uppercase text-slate-400 mb-0.5">
            Wanted Rating
          </div>
          <div className="flex items-center gap-1.5 text-2xl font-bold">
            {[1, 2, 3, 4, 5].map((starNum) => {
              const active = engine.police.wantedLevel >= starNum;
              const isEvading = engine.police.isEvading;
              return (
                <span
                  key={starNum}
                  className={`transition-colors duration-150 ${
                    active
                      ? isEvading
                        ? 'text-amber-400 animate-pulse'
                        : 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                      : 'text-slate-700'
                  }`}
                >
                  ★
                </span>
              );
            })}
          </div>

          {engine.police.wantedLevel > 0 && (
            <div className="mt-1 text-[11px] font-mono tabular-nums">
              {engine.police.isEvading ? (
                <span className="text-amber-400 font-semibold">
                  EVADING COPS: {Math.ceil(engine.police.evasionTimer)}s
                </span>
              ) : (
                <span className="text-rose-400 font-semibold tracking-wide animate-pulse">
                  IN PURSUIT · BREAK SIGHT!
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Controls & Audio Quick Bar */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/85 backdrop-blur-md p-2 rounded-lg border border-slate-800 shadow-xl">
          <button
            onClick={cycleRadio}
            title="Toggle Radio Station (R)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-pink-400" />
            <span className="truncate max-w-[130px]">{stationName}</span>
          </button>

          <button
            onClick={toggleSound}
            title={muted ? 'Unmute' : 'Mute Sound'}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={onOpenPause}
            title="Help / Pause Game (ESC)"
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Center Notification Toast */}
      {notification && (
        <div className="pointer-events-auto self-center bg-slate-950/90 backdrop-blur-md px-5 py-2.5 rounded-lg border border-slate-700 shadow-2xl text-center max-w-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <p
            className={`text-sm font-sans font-semibold ${
              notification.type === 'crime'
                ? 'text-amber-400'
                : notification.type === 'danger'
                ? 'text-rose-400'
                : notification.type === 'cash'
                ? 'text-emerald-400'
                : 'text-sky-300'
            }`}
          >
            {notification.msg}
          </p>
        </div>
      )}

      {/* Bottom Area: Minimap, Vehicle Speedometer, Weapon Selector */}
      <div className="flex items-end justify-between gap-4">
        {/* Bottom Left: Minimap Radar */}
        <div className="pointer-events-auto flex flex-col items-center bg-slate-950/90 backdrop-blur-md p-2 rounded-lg border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-400 mb-1 px-1">
            <span className="flex items-center gap-1">
              <Navigation className="w-3 h-3 text-sky-400" /> GPS RADAR
            </span>
            <span className="text-emerald-400">● STORE · ■ HIDE</span>
          </div>
          <canvas
            ref={minimapRef}
            width={130}
            height={130}
            className="rounded border border-slate-800 bg-slate-950"
          />
        </div>

        {/* Bottom Center: Vehicle Speedometer (if in car) */}
        {playerVeh && (
          <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md px-5 py-2.5 rounded-lg border border-slate-800 shadow-xl flex items-center gap-6 font-mono">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Vehicle</div>
              <div className="text-sm font-bold text-white">{playerVeh.stats.name}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Speed</div>
              <div className="text-lg font-bold text-amber-400 tabular-nums">
                {Math.round(Math.abs(playerVeh.speed) * 14)} <span className="text-xs text-slate-400">MPH</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Condition</div>
              <div className="w-24 h-2 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full ${
                    playerVeh.health > playerVeh.maxHealth * 0.4 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${(playerVeh.health / playerVeh.maxHealth) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Right: Weapon & Ammo Selector */}
        <div className="pointer-events-auto flex flex-col items-end gap-2 bg-slate-950/85 backdrop-blur-md p-3 rounded-lg border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-slate-400">Current Weapon [1-5]</div>
              <div className="text-base font-bold font-sans text-white">{currentWeapon.name}</div>
            </div>
            <div className="bg-slate-900 border border-slate-700/80 p-2 rounded text-amber-400">
              <Crosshair className="w-6 h-6" />
            </div>
          </div>

          <div className="text-xs font-mono text-slate-300">
            AMMO:{' '}
            <span className="font-bold text-emerald-400 tabular-nums">
              {weaponAmmo === -1 ? '∞' : weaponAmmo}
            </span>
          </div>

          {/* Quick weapon switch buttons */}
          <div className="flex items-center gap-1 pt-1 border-t border-slate-800/80">
            {(['fists', 'pistol', 'smg', 'shotgun', 'rifle'] as const).map((wId, idx) => {
              const owned = engine.player.weapons[wId].owned;
              const isSelected = engine.player.currentWeapon === wId;
              return (
                <button
                  key={wId}
                  onClick={() => engine.switchWeapon(wId)}
                  disabled={!owned}
                  title={`[${idx + 1}] ${WEAPONS_DATA[wId].name}`}
                  className={`w-7 h-7 text-xs font-mono rounded flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : owned
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-900/50 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
