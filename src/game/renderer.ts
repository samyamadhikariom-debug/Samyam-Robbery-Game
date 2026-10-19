import { GameEngine, WEAPONS_DATA } from './gameEngine';
import { CITY_SIZE, CITY_BUILDINGS, ROADS, STORES, SAFIEHOUSES, PAY_N_SPRAYS, AMMU_NATIONS } from './cityData';
import { Vehicle } from './types';

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public cameraX: number = 0;
  public cameraY: number = 0;

  // Flash timer for sirens and wanted stars
  private pulseTimer: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  public render(engine: GameEngine) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    this.pulseTimer += 0.05;

    // Smooth camera tracking
    const targetCamX = engine.player.x - width / 2;
    const targetCamY = engine.player.y - height / 2;

    this.cameraX += (targetCamX - this.cameraX) * 0.12;
    this.cameraY += (targetCamY - this.cameraY) * 0.12;

    // Clamp camera within city bounds
    this.cameraX = Math.max(0, Math.min(CITY_SIZE - width, this.cameraX));
    this.cameraY = Math.max(0, Math.min(CITY_SIZE - height, this.cameraY));

    ctx.save();
    // Clear background (city ground / asphalt / grass)
    ctx.fillStyle = '#111827'; // Dark urban night asphalt
    ctx.fillRect(0, 0, width, height);

    ctx.translate(-this.cameraX, -this.cameraY);

    // 1. Draw Roads & Sidewalks
    this.drawRoads(ctx);

    // 2. Draw Skidmarks
    this.drawSkidmarks(ctx, engine);

    // 3. Draw Buildings, Stores, Safehouses
    this.drawBuildings(ctx, engine);

    // 4. Draw Pedestrians & Cops on Foot
    this.drawPedestrians(ctx, engine);

    // 5. Draw Vehicles (Civilian, Player, Police)
    this.drawVehicles(ctx, engine);

    // 6. Draw Player (if not in vehicle)
    if (!engine.player.inVehicleId) {
      this.drawPlayer(ctx, engine);
    }

    // 7. Draw Bullets
    this.drawBullets(ctx, engine);

    // 8. Draw Particles (Smoke, Sparks, Blood, Cash)
    this.drawParticles(ctx, engine);

    // 9. Draw Police Helicopter Searchlight (5 stars)
    if (engine.police.helicopterActive) {
      this.drawHelicopter(ctx, engine);
    }

    // 10. Draw In-World Robbery HUD / Safehouse Entrance Indicators
    this.drawWorldPrompts(ctx, engine);

    ctx.restore();
  }

  private drawRoads(ctx: CanvasRenderingContext2D) {
    ROADS.forEach((road) => {
      // Asphalt base
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(road.x, road.y, road.width, road.height);

      // Curbs / Sidewalk edges
      ctx.fillStyle = '#475569';
      if (road.isVertical) {
        ctx.fillRect(road.x - 12, road.y, 12, road.height);
        ctx.fillRect(road.x + road.width, road.y, 12, road.height);

        // Center dashed yellow lane dividers
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 3;
        ctx.setLineDash([24, 20]);
        ctx.beginPath();
        ctx.moveTo(road.x + road.width / 2, road.y);
        ctx.lineTo(road.x + road.width / 2, road.y + road.height);
        ctx.stroke();

        // White lane dashes
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.setLineDash([16, 24]);
        ctx.beginPath();
        ctx.moveTo(road.x + road.width * 0.25, road.y);
        ctx.lineTo(road.x + road.width * 0.25, road.y + road.height);
        ctx.moveTo(road.x + road.width * 0.75, road.y);
        ctx.lineTo(road.x + road.width * 0.75, road.y + road.height);
        ctx.stroke();
      } else {
        ctx.fillRect(road.x, road.y - 12, road.width, 12);
        ctx.fillRect(road.x, road.y + road.height, road.width, 12);

        // Center dashed yellow lane dividers
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 3;
        ctx.setLineDash([24, 20]);
        ctx.beginPath();
        ctx.moveTo(road.x, road.y + road.height / 2);
        ctx.lineTo(road.x + road.width, road.y + road.height / 2);
        ctx.stroke();

        // White lane dashes
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.setLineDash([16, 24]);
        ctx.beginPath();
        ctx.moveTo(road.x, road.y + road.height * 0.25);
        ctx.lineTo(road.x + road.width, road.y + road.height * 0.25);
        ctx.moveTo(road.x, road.y + road.height * 0.75);
        ctx.lineTo(road.x + road.width, road.y + road.height * 0.75);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    });
  }

  private drawSkidmarks(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    engine.skidMarks.forEach((skid) => {
      ctx.strokeStyle = `rgba(15, 23, 42, ${skid.alpha})`;
      ctx.beginPath();
      ctx.moveTo(skid.x1, skid.y1);
      ctx.lineTo(skid.x2, skid.y2);
      ctx.stroke();
    });
  }

  private drawBuildings(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    CITY_BUILDINGS.forEach((b) => {
      // 1. Drop shadow for 3D aerial elevation
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(b.x + 8, b.y + 12, b.width, b.height);

      // 2. Building Body
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.width, b.height);

      // 3. Roof trim / inner parapet
      ctx.fillStyle = b.roofColor;
      ctx.fillRect(b.x + 8, b.y + 8, b.width - 16, b.height - 16);

      // 4. Roof air conditioning vents & antennas
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(b.x + 20, b.y + 20, 24, 20);
      ctx.fillRect(b.x + b.width - 45, b.y + 24, 25, 25);

      // 5. Special building signs & glowing store logos
      if (b.type === 'store') {
        const store = STORES.find((s) => s.id === b.storeRefId);
        if (store) {
          // Store entrance awning
          ctx.fillStyle = store.accentColor;
          ctx.fillRect(b.x + b.width / 2 - 25, b.y + b.height - 8, 50, 8);

          // Store neon sign
          ctx.font = 'bold 11px "Oswald", sans-serif';
          ctx.fillStyle = store.accentColor;
          ctx.textAlign = 'center';
          ctx.fillText(store.name.toUpperCase(), b.x + b.width / 2, b.y + 35);

          // Loot rating icon & tag
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(`★`.repeat(store.wantedStarsTrigger) + ` RISKY`, b.x + b.width / 2, b.y + 50);

          if (store.isRobbed && store.cooldownTimer > 0) {
            ctx.fillStyle = '#ef4444';
            ctx.fillText(`LOCKED (${Math.ceil(store.cooldownTimer)}s)`, b.x + b.width / 2, b.y + 68);
          } else {
            ctx.fillStyle = '#22c55e';
            ctx.fillText(`OPEN FOR HEIST`, b.x + b.width / 2, b.y + 68);
          }
        }
      } else if (b.type === 'safehouse') {
        // Safehouse garage marker
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(b.x + b.width / 2 - 30, b.y + b.height - 12, 60, 12);

        // Hazard stripes on driveway
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(b.x + b.width / 2 - 30, b.y + b.height);
        ctx.lineTo(b.x + b.width / 2 + 30, b.y + b.height);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = 'bold 12px "Oswald", sans-serif';
        ctx.fillStyle = '#22c55e';
        ctx.textAlign = 'center';
        ctx.fillText('SAFEHOUSE HIDEAWAY', b.x + b.width / 2, b.y + 35);
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('BANK STASH & LOSE HEAT', b.x + b.width / 2, b.y + 52);
      } else if (b.type === 'spray') {
        ctx.font = 'bold 12px "Oswald", sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'center';
        ctx.fillText("PAY 'N' SPRAY GARAGE", b.x + b.width / 2, b.y + 35);
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#fcd34d';
        ctx.fillText('RESPRAY & CLEAR WANTED ($400)', b.x + b.width / 2, b.y + 52);
      } else if (b.type === 'ammu') {
        ctx.font = 'bold 12px "Oswald", sans-serif';
        ctx.fillStyle = '#84cc16';
        ctx.textAlign = 'center';
        ctx.fillText('AMMU-NATION WEAPONS', b.x + b.width / 2, b.y + 35);
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#bef264';
        ctx.fillText('GUNS, AMMO & BODY ARMOR', b.x + b.width / 2, b.y + 52);
      }
    });
  }

  private drawVehicles(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    engine.vehicles.forEach((v) => {
      ctx.save();
      ctx.translate(v.x, v.y);
      ctx.rotate(v.angle);

      // Vehicle Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(-v.width / 2 + 3, -v.height / 2 + 5, v.width, v.height);

      // Headlight beams onto road
      ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
      ctx.beginPath();
      ctx.moveTo(-v.width / 2 + 4, -v.height / 2);
      ctx.lineTo(-v.width - 25, -v.height / 2 - 130);
      ctx.lineTo(v.width + 25, -v.height / 2 - 130);
      ctx.lineTo(v.width / 2 - 4, -v.height / 2);
      ctx.closePath();
      ctx.fill();

      // Police Sirens Lightbars Flash
      if (v.isPolice) {
        const sirenCycle = Math.floor(this.pulseTimer * 8) % 2 === 0;
        const sirenColor = sirenCycle ? 'rgba(239, 68, 68, 0.35)' : 'rgba(59, 130, 246, 0.35)';

        // Flash aura on road
        ctx.fillStyle = sirenColor;
        ctx.beginPath();
        ctx.arc(0, 0, 75, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wheels
      ctx.fillStyle = '#0f172a';
      const steer = v.isOccupiedByPlayer ? v.steerAngle : 0;
      // Front Left
      ctx.save();
      ctx.translate(-v.width / 2 - 2, -v.height / 3);
      ctx.rotate(steer);
      ctx.fillRect(-3, -7, 6, 14);
      ctx.restore();
      // Front Right
      ctx.save();
      ctx.translate(v.width / 2 + 2, -v.height / 3);
      ctx.rotate(steer);
      ctx.fillRect(-3, -7, 6, 14);
      ctx.restore();
      // Rear Left
      ctx.fillRect(-v.width / 2 - 5, v.height / 3 - 7, 6, 14);
      // Rear Right
      ctx.fillRect(v.width / 2 - 1, v.height / 3 - 7, 6, 14);

      // Main Chassis Body
      ctx.fillStyle = v.isDestroyed ? '#334155' : v.stats.color;
      ctx.fillRect(-v.width / 2, -v.height / 2, v.width, v.height);

      // Front & Rear Bumpers
      ctx.fillStyle = v.isPolice ? '#f8fafc' : '#1e293b';
      ctx.fillRect(-v.width / 2, -v.height / 2, v.width, 6); // front
      ctx.fillRect(-v.width / 2, v.height / 2 - 6, v.width, 6); // rear

      // Windshield & Rear window
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-v.width / 2 + 4, -v.height / 4, v.width - 8, 10); // windshield
      ctx.fillRect(-v.width / 2 + 4, v.height / 5, v.width - 8, 8); // rear glass

      // Roof
      ctx.fillStyle = v.isDestroyed ? '#1e293b' : v.stats.roofColor;
      ctx.fillRect(-v.width / 2 + 4, -v.height / 4 + 10, v.width - 8, v.height / 2 - 14);

      // Headlights
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-v.width / 2 + 3, -v.height / 2, 6, 4);
      ctx.fillRect(v.width / 2 - 9, -v.height / 2, 6, 4);

      // Taillights
      const isBraking = v.speed < 0 || (v.isOccupiedByPlayer && engine.keys['s']);
      ctx.fillStyle = isBraking ? '#ff0000' : '#dc2626';
      ctx.fillRect(-v.width / 2 + 3, v.height / 2 - 4, 6, 4);
      ctx.fillRect(v.width / 2 - 9, v.height / 2 - 4, 6, 4);

      // Police Lightbar on Roof
      if (v.isPolice) {
        const sirenCycle = Math.floor(this.pulseTimer * 8) % 2 === 0;
        ctx.fillStyle = sirenCycle ? '#ef4444' : '#3b82f6';
        ctx.fillRect(-10, -4, 9, 8);
        ctx.fillStyle = sirenCycle ? '#3b82f6' : '#ef4444';
        ctx.fillRect(1, -4, 9, 8);
      }

      // Taxi Sign
      if (v.model === 'taxi') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-8, -4, 16, 8);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 7px sans-serif';
        ctx.fillText('TAXI', -7, 2);
      }

      // Damage smoke / fire
      if (v.isDestroyed) {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(0, 0, 10 + Math.sin(this.pulseTimer * 10) * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  private drawPlayer(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    const p = engine.player;
    ctx.save();
    ctx.translate(p.x, p.y);

    // If dodge rolling, rotate character rapidly
    if (p.isDodgeRolling) {
      const rollAngle = (1 - p.rollTimer / 0.35) * Math.PI * 4;
      ctx.rotate(p.angle + rollAngle);

      // Roll shadow & motion blur
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fcd34d';
      ctx.beginPath();
      ctx.arc(4, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      return;
    }

    ctx.rotate(p.angle);

    // Sprint wind streaks behind player
    const isRunning = Boolean(engine.keys['shift'] || p.isSprinting) && p.stamina > 3;
    if (isRunning) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-16, -5);
      ctx.lineTo(-32, -5);
      ctx.moveTo(-18, 5);
      ctx.lineTo(-34, 5);
      ctx.stroke();
    }

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(2, 3, 11, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Animated Running Legs (Jeans & Boots)
    const legStride = Math.sin(p.walkAnimTimer) * (isRunning ? 7 : 4);
    ctx.fillStyle = '#1e3a8a'; // Dark blue denim
    // Left leg
    ctx.fillRect(-7, legStride - 4, 4, 8);
    // Right leg
    ctx.fillRect(3, -legStride - 4, 4, 8);
    // Boots
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-7, legStride + 2, 4, 4);
    ctx.fillRect(3, -legStride + 2, 4, 4);

    // Player Duffel Bag of Stolen Cash (if carrying dirty money)
    if (p.dirtyCash > 0) {
      ctx.fillStyle = '#15803d';
      ctx.fillRect(-7, -15, 14, 8);
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1;
      ctx.strokeRect(-7, -15, 14, 8);
    }

    // Hands / Arms (swinging with walk/run cycle)
    const armSwing = Math.cos(p.walkAnimTimer) * (isRunning ? 5 : 2.5);
    ctx.fillStyle = '#f87171'; // Red jacket sleeves
    ctx.fillRect(-10, -8 + armSwing, 5, 12);
    ctx.fillRect(5, -8 - armSwing, 5, 12);

    // Weapon in hands
    if (p.currentWeapon !== 'fists') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(8, -3, p.currentWeapon === 'rifle' ? 18 : 12, 4);
    }

    // Torso / Jacket (slight forward lean if sprinting)
    ctx.fillStyle = '#dc2626';
    const leanOffset = isRunning ? 2 : 0;
    ctx.fillRect(-8 + leanOffset, -6, 16, 12);

    // Head
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(leanOffset, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    // Dark hair / cap
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(leanOffset, -1, 6, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawPedestrians(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    engine.pedestrians.forEach((ped) => {
      if (ped.state === 'dead') {
        // Blood pool & dead body
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.ellipse(ped.x, ped.y, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#64748b';
        ctx.fillRect(ped.x - 6, ped.y - 3, 12, 6);
        return;
      }

      ctx.save();
      ctx.translate(ped.x, ped.y);
      ctx.rotate(ped.angle);

      // Body / shirt
      ctx.fillStyle = ped.isPolice ? '#1e3a8a' : ped.shirtColor;
      ctx.fillRect(-6, -5, 12, 10);

      // Head
      ctx.fillStyle = ped.color;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      // Police Cap
      if (ped.isPolice) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-4, -4, 8, 4);
      }

      ctx.restore();
    });
  }

  private drawBullets(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    engine.bullets.forEach((b) => {
      ctx.fillStyle = b.isPlayerBullet ? '#fef08a' : '#f87171';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Tracer line
      ctx.strokeStyle = b.isPlayerBullet ? 'rgba(253, 224, 71, 0.4)' : 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - b.vx * 1.5, b.y - b.vy * 1.5);
      ctx.stroke();
    });
  }

  private drawParticles(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    engine.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'cash') {
        ctx.fillRect(p.x - 4, p.y - 2, 8, 5);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 6px sans-serif';
        ctx.fillText('$', p.x - 2, p.y + 3);
      } else if (p.type === 'dust') {
        ctx.fillStyle = 'rgba(203, 213, 225, 0.45)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  private drawHelicopter(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    const heli = engine.police.helicopterPos;
    const target = engine.police.spotlightTarget;

    // 1. Giant Searchlight Spotlight Cone
    const grad = ctx.createRadialGradient(target.x, target.y, 10, target.x, target.y, 110);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    grad.addColorStop(0.7, 'rgba(254, 240, 138, 0.2)');
    grad.addColorStop(1, 'rgba(254, 240, 138, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(target.x, target.y, 110, 0, Math.PI * 2);
    ctx.fill();

    // 2. Helicopter Aerial Shadow
    ctx.save();
    ctx.translate(heli.x, heli.y);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

    // Fuselage shadow
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotor blades shadow spinning
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    const rotorAngle = this.pulseTimer * 18;
    ctx.moveTo(Math.cos(rotorAngle) * 55, Math.sin(rotorAngle) * 55);
    ctx.lineTo(-Math.cos(rotorAngle) * 55, -Math.sin(rotorAngle) * 55);
    ctx.moveTo(Math.sin(rotorAngle) * 55, -Math.cos(rotorAngle) * 55);
    ctx.lineTo(-Math.sin(rotorAngle) * 55, Math.cos(rotorAngle) * 55);
    ctx.stroke();

    ctx.restore();
  }

  private drawWorldPrompts(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    // If player is robbing, draw live heist progress circle
    if (engine.player.isRobbing && engine.player.robbingStoreId) {
      const store = STORES.find((s) => s.id === engine.player.robbingStoreId);
      if (store) {
        ctx.save();
        ctx.translate(engine.player.x, engine.player.y - 45);

        // Progress bar background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(-50, -8, 100, 16);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.strokeRect(-50, -8, 100, 16);

        // Fill progress
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(-48, -6, 96 * engine.player.robberyProgress, 12);

        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`CRACKING SAFE: ${Math.floor(engine.player.robberyProgress * 100)}%`, 0, 3);

        ctx.restore();
      }
    }

    // Nearby interaction hints
    if (!engine.player.isRobbing && !engine.player.inVehicleId) {
      // Near Store?
      const store = STORES.find((s) => {
        const d = Math.hypot(s.x + s.width / 2 - engine.player.x, s.y + s.height / 2 - engine.player.y);
        return d < 120;
      });

      if (store && (!store.isRobbed || store.cooldownTimer <= 0)) {
        ctx.save();
        ctx.translate(engine.player.x, engine.player.y - 35);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(-65, -12, 130, 24);
        ctx.strokeStyle = store.accentColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-65, -12, 130, 24);

        ctx.font = 'bold 11px "Oswald", sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText(`PRESS [E] TO ROB STORE`, 0, 3);
        ctx.restore();
      }

      // Near Safehouse?
      const safehouse = SAFIEHOUSES.find((sh) => {
        const d = Math.hypot(sh.x + sh.width / 2 - engine.player.x, sh.y + sh.height / 2 - engine.player.y);
        return d < 120;
      });

      if (safehouse) {
        ctx.save();
        ctx.translate(engine.player.x, engine.player.y - 35);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(-70, -12, 140, 24);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-70, -12, 140, 24);

        ctx.font = 'bold 11px "Oswald", sans-serif';
        ctx.fillStyle = '#4ade80';
        ctx.textAlign = 'center';
        ctx.fillText(`PRESS [E] ENTER SAFEHOUSE`, 0, 3);
        ctx.restore();
      }

      // Near Car to jack?
      const nearCar = engine.vehicles.find((v) => {
        return !v.isDestroyed && Math.hypot(v.x - engine.player.x, v.y - engine.player.y) < 65;
      });

      if (nearCar) {
        ctx.save();
        ctx.translate(nearCar.x, nearCar.y - nearCar.height / 2 - 18);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(-55, -10, 110, 20);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(-55, -10, 110, 20);

        ctx.font = 'bold 10px "Oswald", sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText(`[F] DRIVE ${nearCar.stats.name.toUpperCase()}`, 0, 4);
        ctx.restore();
      }
    }
  }
}
