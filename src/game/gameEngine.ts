import {
  GameState,
  Player,
  Vehicle,
  Pedestrian,
  Bullet,
  Particle,
  SkidMark,
  PoliceState,
  WeaponType,
  WeaponInfo,
  Store,
} from './types';
import {
  CITY_SIZE,
  CITY_BUILDINGS,
  ROADS,
  STORES,
  SAFIEHOUSES,
  PAY_N_SPRAYS,
  AMMU_NATIONS,
  VEHICLE_PRESETS,
} from './cityData';
import { soundEngine } from './audio';

export const WEAPONS_DATA: Record<WeaponType, WeaponInfo> = {
  fists: {
    id: 'fists',
    name: 'Fists',
    damage: 25,
    fireRate: 400,
    range: 45,
    ammo: -1,
    maxAmmo: -1,
    price: 0,
    spread: 0.1,
    bulletSpeed: 0,
    bulletsPerShot: 1,
    description: 'Basic hand-to-hand combat.',
  },
  pistol: {
    id: 'pistol',
    name: '9mm Pistol',
    damage: 35,
    fireRate: 280,
    range: 500,
    ammo: 30,
    maxAmmo: 150,
    price: 600,
    spread: 0.05,
    bulletSpeed: 16,
    bulletsPerShot: 1,
    description: 'Reliable sidearm for quick self-defense.',
  },
  deagle: {
    id: 'deagle',
    name: 'Desert Eagle .50',
    damage: 75,
    fireRate: 420,
    range: 620,
    ammo: 21,
    maxAmmo: 90,
    price: 1800,
    spread: 0.04,
    bulletSpeed: 21,
    bulletsPerShot: 1,
    description: 'High-caliber hand cannon with devastating stopping power.',
  },
  smg: {
    id: 'smg',
    name: 'Micro-SMG',
    damage: 22,
    fireRate: 110,
    range: 450,
    ammo: 90,
    maxAmmo: 360,
    price: 2400,
    spread: 0.12,
    bulletSpeed: 18,
    bulletsPerShot: 1,
    description: 'Rapid-fire compact submachine gun for drive-bys.',
  },
  shotgun: {
    id: 'shotgun',
    name: 'Combat Shotgun',
    damage: 24,
    fireRate: 750,
    range: 360,
    ammo: 24,
    maxAmmo: 80,
    price: 4200,
    spread: 0.28,
    bulletSpeed: 15,
    bulletsPerShot: 6,
    description: 'Fires heavy buckshot pellets. Devastating in close quarters.',
  },
  rifle: {
    id: 'rifle',
    name: 'Assault Carbine',
    damage: 42,
    fireRate: 150,
    range: 650,
    ammo: 120,
    maxAmmo: 400,
    price: 8500,
    spread: 0.06,
    bulletSpeed: 22,
    bulletsPerShot: 1,
    description: 'Military-grade rifle with great range and high rate of fire.',
  },
  sniper: {
    id: 'sniper',
    name: 'Tactical Sniper 7.62',
    damage: 150,
    fireRate: 980,
    range: 980,
    ammo: 15,
    maxAmmo: 60,
    price: 13500,
    spread: 0.015,
    bulletSpeed: 28,
    bulletsPerShot: 1,
    description: 'Ultra-long range precision rifle capable of neutralizing targets in 1 shot.',
  },
  minigun: {
    id: 'minigun',
    name: 'Vulcan Micro-Gun',
    damage: 28,
    fireRate: 65,
    range: 620,
    ammo: 300,
    maxAmmo: 1200,
    price: 24000,
    spread: 0.14,
    bulletSpeed: 24,
    bulletsPerShot: 1,
    description: 'Six-barrel rotary machine gun. Shreds vehicles and barricades.',
  },
  grenade: {
    id: 'grenade',
    name: 'Frag Grenade',
    damage: 200,
    fireRate: 800,
    range: 380,
    ammo: 5,
    maxAmmo: 20,
    price: 900,
    spread: 0.1,
    bulletSpeed: 12,
    bulletsPerShot: 1,
    description: 'Thrown high explosive fragmentation grenade. Clears roadblock cars.',
  },
};

export class GameEngine {
  public gameState: GameState = 'TITLE';
  public player: Player;
  public vehicles: Vehicle[] = [];
  public pedestrians: Pedestrian[] = [];
  public bullets: Bullet[] = [];
  public grenadesList: GrenadeEntity[] = [];
  public particles: Particle[] = [];
  public skidMarks: SkidMark[] = [];
  public police: PoliceState;
  public stores: Store[] = [...STORES];
  public safehouses: Safehouse[] = [...SAFIEHOUSES];

  // Upgrades
  public upgrades = {
    sprintSpeed: 1, // multiplier
    maxArmor: 100,
    stealthBribe: false, // reduces star gain
    carArmor: 1,
    infiniteStamina: false,
    nitroUnlocked: false,
    bullbar: false,
  };

  // Keys state
  public keys: Record<string, boolean> = {};
  public mouseX: number = 0;
  public mouseY: number = 0;
  public isMouseDown: boolean = false;

  // Timers
  private lastShotTime: number = 0;
  private lastSkidTime: number = 0;
  private footstepTimer: number = 0;
  private lastRollTime: number = 0;
  private policeSpawnTimer: number = 0;
  private trafficSpawnTimer: number = 0;
  private pedestrianSpawnTimer: number = 0;

  // Callback for UI updates
  public onStateChange?: () => void;
  public onNotification?: (msg: string, type: 'info' | 'crime' | 'cash' | 'danger') => void;

  constructor() {
    this.player = this.createDefaultPlayer();
    this.police = {
      wantedLevel: 0,
      wantedPoints: 0,
      evasionTimer: 0,
      maxEvasionTimer: 18,
      isEvading: false,
      helicopterActive: false,
      helicopterPos: { x: 580, y: 2980 },
      spotlightTarget: { x: 580, y: 2980 },
    };

    this.initWorld();
  }

  private createDefaultPlayer(): Player {
    return {
      id: 'player',
      x: 580,
      y: 2980, // Directly on the wide 4-lane avenue intersection!
      angle: 0,
      vx: 0,
      vy: 0,
      width: 20,
      height: 20,
      health: 100,
      maxHealth: 100,
      armor: 50,
      maxArmor: 100,
      speed: 4.2, // Brisk responsive run
      stamina: 100,
      maxStamina: 100,
      isDodgeRolling: false,
      rollTimer: 0,
      walkAnimTimer: 0,
      dirtyCash: 0,
      stashedCash: 1500, // starting clean funds
      currentWeapon: 'fists',
      weapons: {
        fists: { owned: true, ammo: -1 },
        pistol: { owned: true, ammo: 45 },
        deagle: { owned: false, ammo: 0 },
        smg: { owned: false, ammo: 0 },
        shotgun: { owned: false, ammo: 0 },
        rifle: { owned: false, ammo: 0 },
        sniper: { owned: false, ammo: 0 },
        minigun: { owned: false, ammo: 0 },
        grenade: { owned: true, ammo: 3 },
      },
      inVehicleId: null,
      isSprinting: false,
      isRobbing: false,
      robbingStoreId: null,
      robberyProgress: 0,
      kills: 0,
      storesRobbed: 0,
      grenades: 3,
      medkits: 2,
      smokeBombs: 2,
      nitroUnlocked: false,
      nitroFuel: 100,
      maxNitroFuel: 100,
      isNitroActive: false,
      selectedWaypoint: null,
    };
  }

  public initWorld() {
    this.vehicles = [];
    this.pedestrians = [];
    this.bullets = [];
    this.grenadesList = [];
    this.particles = [];
    this.skidMarks = [];

    // Spawn player's starter getaway muscle car right beside player on the avenue lane
    this.spawnVehicle('muscle', 580, 3050, 0, false, '#f59e0b', '#b45309');

    // Spawn initial civilian traffic along roads
    for (let i = 0; i < 22; i++) {
      this.spawnRandomCivilianCar();
    }

    // Spawn initial civilians walking
    for (let i = 0; i < 35; i++) {
      this.spawnRandomPedestrian();
    }
  }

  public startNewGame() {
    this.player = this.createDefaultPlayer();
    this.police = {
      wantedLevel: 0,
      wantedPoints: 0,
      evasionTimer: 0,
      maxEvasionTimer: 18,
      isEvading: false,
      helicopterActive: false,
      helicopterPos: { x: this.player.x, y: this.player.y },
      spotlightTarget: { x: this.player.x, y: this.player.y },
    };
    this.initWorld();
    this.gameState = 'PLAYING';
    soundEngine.userInteraction();
    this.notify('Welcome to Street Heat. Rob stores, evade police, and stash your cash in safehouses!', 'info');
  }

  public notify(msg: string, type: 'info' | 'crime' | 'cash' | 'danger' = 'info') {
    if (this.onNotification) {
      this.onNotification(msg, type);
    }
  }

  // --- ENTITY SPAWNERS ---

  public spawnVehicle(
    model: keyof typeof VEHICLE_PRESETS,
    x: number,
    y: number,
    angle: number = 0,
    isPolice: boolean = false,
    color?: string,
    roofColor?: string
  ): Vehicle {
    const stats = { ...VEHICLE_PRESETS[model] };
    if (color) stats.color = color;
    if (roofColor) stats.roofColor = roofColor;

    const v: Vehicle = {
      id: `veh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      x,
      y,
      angle,
      vx: 0,
      vy: 0,
      width: stats.width,
      height: stats.height,
      model,
      speed: 0,
      health: stats.durability,
      maxHealth: stats.durability,
      stats,
      isPolice,
      sirenOn: isPolice,
      isOccupiedByPlayer: false,
      driverId: null,
      isSmoking: false,
      isDestroyed: false,
      burnTimer: 0,
      steerAngle: 0,
    };

    this.vehicles.push(v);
    return v;
  }

  public spawnRandomCivilianCar() {
    const road = ROADS[Math.floor(Math.random() * ROADS.length)];
    const models: (keyof typeof VEHICLE_PRESETS)[] = ['sedan', 'sedan', 'muscle', 'taxi', 'supercar'];
    const model = models[Math.floor(Math.random() * models.length)];

    let x = 0;
    let y = 0;
    let angle = 0;

    if (road.isVertical) {
      x = road.x + 40 + Math.floor(Math.random() * 2) * 80;
      y = Math.random() * CITY_SIZE;
      angle = Math.random() > 0.5 ? 0 : Math.PI;
    } else {
      x = Math.random() * CITY_SIZE;
      y = road.y + 40 + Math.floor(Math.random() * 2) * 80;
      angle = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
    }

    // Check distance from player to avoid pop-in right on top
    const dist = Math.hypot(x - this.player.x, y - this.player.y);
    if (dist > 300) {
      this.spawnVehicle(model, x, y, angle, false);
    }
  }

  public spawnRandomPedestrian() {
    const road = ROADS[Math.floor(Math.random() * ROADS.length)];
    let x = road.x + (Math.random() > 0.5 ? -25 : road.width + 25);
    let y = Math.random() * CITY_SIZE;
    if (!road.isVertical) {
      x = Math.random() * CITY_SIZE;
      y = road.y + (Math.random() > 0.5 ? -25 : road.height + 25);
    }

    const shirtColors = ['#f87171', '#60a5fa', '#fbbf24', '#a78bfa', '#34d399', '#cbd5e1'];
    this.pedestrians.push({
      id: `ped_${Date.now()}_${Math.random()}`,
      x,
      y,
      angle: Math.random() * Math.PI * 2,
      vx: 0,
      vy: 0,
      width: 14,
      height: 14,
      health: 40,
      speed: 1.2 + Math.random() * 0.4,
      state: 'wandering',
      targetX: x + (Math.random() - 0.5) * 400,
      targetY: y + (Math.random() - 0.5) * 400,
      color: '#fbcfe8',
      shirtColor: shirtColors[Math.floor(Math.random() * shirtColors.length)],
      isPolice: false,
      shootCooldown: 0,
    });
  }

  // --- INPUT CONTROLS ---

  public setKey(key: string, pressed: boolean) {
    const k = key.toLowerCase();
    this.keys[k] = pressed;

    if (pressed) {
      soundEngine.userInteraction();

      // Vehicle Enter / Exit
      if (k === 'f' || k === 'enter') {
        this.toggleVehicleEnterExit();
      }

      // Weapon selection: 1 to 9
      if (k === '1') this.switchWeapon('fists');
      if (k === '2') this.switchWeapon('pistol');
      if (k === '3') this.switchWeapon('deagle');
      if (k === '4') this.switchWeapon('smg');
      if (k === '5') this.switchWeapon('shotgun');
      if (k === '6') this.switchWeapon('rifle');
      if (k === '7') this.switchWeapon('sniper');
      if (k === '8') this.switchWeapon('minigun');
      if (k === '9') this.switchWeapon('grenade');

      // Quick abilities & items
      if (k === 'h' || k === 'm') this.useMedkit();
      if (k === 'x' || k === 'b') this.dropSmokeBomb();
      if (k === 'g') this.throwGrenade();
      if (k === 'q') this.cyclePreviousWeapon();
      if (k === 'v') this.cycleWaypoint();
      if (k === 'c') this.toggleAutoRun();

      // Robbery or interact
      if (k === 'e') {
        this.handleStoreRobberyAction();
      }

      // Radio change
      if (k === 'r') {
        const name = soundEngine.toggleRadio();
        this.notify(`Radio: ${name}`, 'info');
      }
    }
  }

  public setMousePosition(canvasX: number, canvasY: number, cameraX: number, cameraY: number) {
    this.mouseX = canvasX + cameraX;
    this.mouseY = canvasY + cameraY;
    if (this.player.inVehicleId === null) {
      this.player.angle = Math.atan2(this.mouseY - this.player.y, this.mouseX - this.player.x);
    }
  }

  public setMouseDown(isDown: boolean) {
    this.isMouseDown = isDown;
    if (isDown) {
      soundEngine.userInteraction();
    }
  }

  public switchWeapon(type: WeaponType) {
    if (this.player.weapons[type].owned) {
      this.player.currentWeapon = type;
      this.notify(`Equipped: ${WEAPONS_DATA[type].name}`, 'info');
    }
  }

  // --- VEHICLE JACKING / ENTER / EXIT ---

  public toggleVehicleEnterExit() {
    if (this.player.inVehicleId) {
      // Exit vehicle
      const currentVeh = this.vehicles.find((v) => v.id === this.player.inVehicleId);
      if (currentVeh) {
        // Place player safely to the left/side of the car
        const sideAngle = currentVeh.angle + Math.PI / 2;
        this.player.x = currentVeh.x + Math.cos(sideAngle) * 36;
        this.player.y = currentVeh.y + Math.sin(sideAngle) * 36;
        this.player.vx = currentVeh.vx * 0.4;
        this.player.vy = currentVeh.vy * 0.4;
        currentVeh.isOccupiedByPlayer = false;
        currentVeh.driverId = null;
      }
      this.player.inVehicleId = null;
      soundEngine.updateEngine(false, 0);
      this.notify('Exited vehicle', 'info');
    } else {
      // Enter nearest vehicle within 50px
      let nearestVeh: Vehicle | null = null;
      let minDist = 65;

      for (const v of this.vehicles) {
        if (v.isDestroyed) continue;
        const dist = Math.hypot(v.x - this.player.x, v.y - this.player.y);
        if (dist < minDist) {
          minDist = dist;
          nearestVeh = v;
        }
      }

      if (nearestVeh) {
        this.player.inVehicleId = nearestVeh.id;
        nearestVeh.isOccupiedByPlayer = true;
        nearestVeh.driverId = 'player';
        soundEngine.updateEngine(true, 0);

        if (nearestVeh.isPolice) {
          this.addWantedPoints(150); // stealing cop car gives heat!
          this.notify('Stole a Police Interceptor! Siren active!', 'danger');
        } else {
          this.notify(`Jacked ${nearestVeh.stats.name}!`, 'info');
        }
      }
    }
  }

  // --- ROBBERY MECHANIC ---

  public handleStoreRobberyAction() {
    if (this.player.inVehicleId) {
      this.notify('Exit your vehicle to rob the store!', 'danger');
      return;
    }

    // Check if player is near any store
    const store = this.stores.find((s) => {
      const dist = Math.hypot(s.x + s.width / 2 - this.player.x, s.y + s.height / 2 - this.player.y);
      return dist < 120;
    });

    if (!store) {
      // Check if near Safehouse
      const safehouse = SAFIEHOUSES.find((sh) => {
        const dist = Math.hypot(sh.x + sh.width / 2 - this.player.x, sh.y + sh.height / 2 - this.player.y);
        return dist < 120;
      });

      if (safehouse) {
        if (safehouse.isOwned) {
          this.openSafehouseMenu();
        } else {
          this.notify(`${safehouse.name} is for sale ($${safehouse.price.toLocaleString()})!`, 'info');
        }
        return;
      }

      // Check if near Ammu-Nation
      const ammu = AMMU_NATIONS.find((a) => {
        const dist = Math.hypot(a.x + a.width / 2 - this.player.x, a.y + a.height / 2 - this.player.y);
        return dist < 120;
      });

      if (ammu) {
        this.gameState = 'AMMUNATION_MENU';
        return;
      }

      return;
    }

    if (store.isRobbed && store.cooldownTimer > 0) {
      this.notify(`${store.name} was recently hit! Cooldown: ${Math.ceil(store.cooldownTimer)}s`, 'info');
      return;
    }

    if (!this.player.isRobbing) {
      // Begin robbery!
      this.player.isRobbing = true;
      this.player.robbingStoreId = store.id;
      this.player.robberyProgress = 0;
      soundEngine.playStoreAlarm();
      this.notify(`HEIST IN PROGRESS: Robbing ${store.name}! Hold position!`, 'crime');

      // Escalate wanted level
      this.triggerPoliceAlert(store.wantedStarsTrigger);
    }
  }

  public cancelRobbery() {
    if (this.player.isRobbing) {
      this.player.isRobbing = false;
      this.player.robbingStoreId = null;
      this.player.robberyProgress = 0;
      this.notify('Robbery aborted! Run from the cops!', 'danger');
    }
  }

  // --- POLICE AND WANTED LEVEL ---

  public triggerPoliceAlert(targetStars: number) {
    if (this.police.wantedLevel < targetStars) {
      this.police.wantedLevel = targetStars;
      this.police.wantedPoints = targetStars * 200;
    } else {
      this.police.wantedPoints += 150;
      if (this.police.wantedPoints > (this.police.wantedLevel + 1) * 250 && this.police.wantedLevel < 5) {
        this.police.wantedLevel += 1;
      }
    }

    this.police.isEvading = false;
    this.police.evasionTimer = this.police.maxEvasionTimer;
    soundEngine.updateSiren(this.police.wantedLevel);

    // Spawn initial police pursuit squad
    this.spawnPoliceUnitsForLevel(this.police.wantedLevel);
  }

  public addWantedPoints(pts: number) {
    if (this.upgrades.stealthBribe) pts *= 0.7;
    this.police.wantedPoints += pts;

    const newLevel = Math.min(5, Math.floor(this.police.wantedPoints / 250) + 1);
    if (newLevel > this.police.wantedLevel) {
      this.police.wantedLevel = newLevel;
      soundEngine.updateSiren(this.police.wantedLevel);
      this.notify(`WANTED LEVEL INCREASED: ★★★★★`.slice(0, this.police.wantedLevel) + ` (${this.police.wantedLevel} Stars)`, 'danger');
      this.spawnPoliceUnitsForLevel(this.police.wantedLevel);
    }
    this.police.isEvading = false;
    this.police.evasionTimer = this.police.maxEvasionTimer;
  }

  private spawnPoliceUnitsForLevel(level: number) {
    const copCount = level * 2;
    const currentCops = this.vehicles.filter((v) => v.isPolice && !v.isDestroyed).length;

    if (currentCops < copCount) {
      // Spawn police car on closest road ahead of player
      const road = ROADS.find((r) => {
        return Math.hypot(r.x + r.width / 2 - this.player.x, r.y + r.height / 2 - this.player.y) < 1000;
      }) || ROADS[0];

      const model = level >= 4 ? 'swat_van' : 'police_cruiser';
      const offsetAngle = Math.random() * Math.PI * 2;
      const spawnDist = 450 + Math.random() * 200;
      const px = Math.max(100, Math.min(CITY_SIZE - 100, this.player.x + Math.cos(offsetAngle) * spawnDist));
      const py = Math.max(100, Math.min(CITY_SIZE - 100, this.player.y + Math.sin(offsetAngle) * spawnDist));

      this.spawnVehicle(model, px, py, offsetAngle + Math.PI, true);
    }

    // Activate helicopter at 5 stars
    if (level >= 5) {
      this.police.helicopterActive = true;
    }
  }

  // --- SAFEHOUSE & STASH ---

  public openSafehouseMenu() {
    // Bank all dirty cash
    if (this.player.dirtyCash > 0) {
      const banked = this.player.dirtyCash;
      this.player.stashedCash += banked;
      this.player.dirtyCash = 0;
      soundEngine.playCashPickup();
      this.notify(`Stashed $${banked.toLocaleString()} dirty cash safely in your bankroll!`, 'cash');
    }

    // Clear wanted level if police are not in direct sight inside safehouse
    if (this.police.wantedLevel > 0) {
      this.police.wantedLevel = 0;
      this.police.wantedPoints = 0;
      this.police.isEvading = false;
      this.police.helicopterActive = false;
      soundEngine.updateSiren(0);
      this.notify('Police lost your trail! Safehouse heat wiped clean.', 'info');
    }

    // Heal player
    this.player.health = this.player.maxHealth;
    this.player.armor = this.upgrades.maxArmor;

    this.gameState = 'SAFEHOUSE_MENU';
  }

  // --- PAY 'N' SPRAY ---

  public checkPayNSpray(veh: Vehicle) {
    for (const pns of PAY_N_SPRAYS) {
      if (
        veh.x > pns.x &&
        veh.x < pns.x + pns.width &&
        veh.y > pns.y &&
        veh.y < pns.y + pns.height
      ) {
        if (this.player.dirtyCash >= pns.cost || this.player.stashedCash >= pns.cost) {
          if (this.player.dirtyCash >= pns.cost) {
            this.player.dirtyCash -= pns.cost;
          } else {
            this.player.stashedCash -= pns.cost;
          }

          // Respray random color
          const colors = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#0284c7', '#111827'];
          const newColor = colors[Math.floor(Math.random() * colors.length)];
          veh.stats.color = newColor;
          veh.stats.roofColor = newColor;
          veh.health = veh.maxHealth;
          veh.isSmoking = false;

          // Wipe wanted level
          this.police.wantedLevel = 0;
          this.police.wantedPoints = 0;
          this.police.isEvading = false;
          soundEngine.updateSiren(0);
          soundEngine.playSprayPaint();

          this.notify(`Pay 'n' Spray: Resprayed & Repaired for $${pns.cost}! Police heat cleared!`, 'cash');
          // Nudge car forward out of garage
          veh.y += 60;
        } else {
          this.notify(`Need $${pns.cost} to respray and lose police!`, 'danger');
        }
      }
    }
  }

  // --- MAIN GAME UPDATE LOOP ---

  public update(dt: number) {
    if (this.gameState !== 'PLAYING') return;

    // 1. Update Player
    this.updatePlayer(dt);

    // 2. Update Robbery In-Progress
    this.updateRobbery(dt);

    // 3. Update Vehicles
    this.updateVehicles(dt);

    // 4. Update Pedestrians
    this.updatePedestrians(dt);

    // 5. Update Police Pursuit AI & Evasion
    this.updatePoliceAI(dt);

    // 6. Update Weapons & Bullets
    this.updateBullets(dt);

    // 7. Update Particles & Skidmarks
    this.updateParticles(dt);

    // 8. Timers for World Population
    this.updateSpawners(dt);
  }

  public triggerDodgeRoll() {
    if (this.player.inVehicleId || this.player.isDodgeRolling) return;
    if (this.player.stamina < 18) {
      this.notify('Need stamina to dodge roll!', 'info');
      return;
    }
    this.player.isDodgeRolling = true;
    this.player.rollTimer = 0.35;
    this.player.stamina -= 18;
    soundEngine.playRoll();
    this.spawnDustParticle(this.player.x, this.player.y);
  }

  private updatePlayer(dt: number) {
    if (this.player.health <= 0) {
      this.handlePlayerWasted();
      return;
    }

    if (this.player.inVehicleId) {
      const veh = this.vehicles.find((v) => v.id === this.player.inVehicleId);
      if (!veh || veh.isDestroyed) {
        this.toggleVehicleEnterExit();
        return;
      }
      this.player.x = veh.x;
      this.player.y = veh.y;
      this.player.angle = veh.angle;
      this.player.vx = veh.vx;
      this.player.vy = veh.vy;
      // Recover stamina while sitting in vehicle
      this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + 25 * dt);
    } else {
      // Foot movement & Running
      this.footstepTimer += dt;

      // Check active dodge roll
      if (this.player.isDodgeRolling) {
        this.player.rollTimer -= dt;
        const rollSpeed = this.player.speed * 2.8 * this.upgrades.sprintSpeed;
        const nextX = this.player.x + Math.cos(this.player.angle) * rollSpeed;
        const nextY = this.player.y + Math.sin(this.player.angle) * rollSpeed;

        if (!this.checkBuildingCollision(nextX, this.player.y, this.player.width, this.player.height)) {
          this.player.x = Math.max(15, Math.min(CITY_SIZE - 15, nextX));
        }
        if (!this.checkBuildingCollision(this.player.x, nextY, this.player.width, this.player.height)) {
          this.player.y = Math.max(15, Math.min(CITY_SIZE - 15, nextY));
        }

        if (Math.random() < 0.4) {
          this.spawnDustParticle(this.player.x, this.player.y);
        }

        if (this.player.rollTimer <= 0) {
          this.player.isDodgeRolling = false;
        }
        return;
      }

      let moveX = 0;
      let moveY = 0;

      if (this.keys['w'] || this.keys['arrowup']) moveY -= 1;
      if (this.keys['s'] || this.keys['arrowdown']) moveY += 1;
      if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
      if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

      const isMoving = moveX !== 0 || moveY !== 0;

      // Spacebar triggers Dodge Roll on foot when moving!
      if (this.keys[' '] && isMoving) {
        const now = Date.now();
        if (now - this.lastRollTime > 450) {
          this.lastRollTime = now;
          this.triggerDodgeRoll();
          return;
        }
      }

      // Check sprint / run: Shift or on-screen sprint toggle
      const wantsToRun = Boolean(this.keys['shift'] || this.player.isSprinting);
      const isRunning = wantsToRun && isMoving && this.player.stamina > 3;

      let curSpeed = this.player.speed;
      if (isRunning) {
        curSpeed *= 2.05 * this.upgrades.sprintSpeed;
        // Asphalt Road Sprint Bonus
        if (this.isPlayerOnRoad(this.player.x, this.player.y)) {
          curSpeed *= 1.15; // +15% sprint speed on paved road asphalt!
        }
        // Drain stamina
        this.player.stamina = Math.max(0, this.player.stamina - 20 * dt);
        this.player.walkAnimTimer += dt * 16; // Fast running leg cycle
        if (Math.random() < 0.25) {
          this.spawnDustParticle(this.player.x, this.player.y);
        }
        // Footstep sound when sprinting
        if (this.footstepTimer > 0.17) {
          soundEngine.playFootstep(true);
          this.footstepTimer = 0;
        }
      } else if (isMoving) {
        curSpeed *= 1.0;
        this.player.walkAnimTimer += dt * 8; // Normal walking leg cycle
        // Footstep sound when walking
        if (this.footstepTimer > 0.33) {
          soundEngine.playFootstep(false);
          this.footstepTimer = 0;
        }
        // Walking slowly recovers stamina
        this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + 12 * dt);
      } else {
        // Idle - fast stamina recovery
        this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + 30 * dt);
      }

      if (isMoving) {
        const len = Math.hypot(moveX, moveY);
        moveX = (moveX / len) * curSpeed;
        moveY = (moveY / len) * curSpeed;

        this.player.angle = Math.atan2(moveY, moveX);
      }

      const nextX = this.player.x + moveX;
      const nextY = this.player.y + moveY;

      // Building Collision
      if (!this.checkBuildingCollision(nextX, this.player.y, this.player.width, this.player.height)) {
        this.player.x = Math.max(15, Math.min(CITY_SIZE - 15, nextX));
      }
      if (!this.checkBuildingCollision(this.player.x, nextY, this.player.width, this.player.height)) {
        this.player.y = Math.max(15, Math.min(CITY_SIZE - 15, nextY));
      }

      // Check shooting
      if (this.isMouseDown) {
        this.fireWeapon();
      }
    }
  }

  private updateRobbery(dt: number) {
    // Cooldown on stores
    this.stores.forEach((s) => {
      if (s.cooldownTimer > 0) {
        s.cooldownTimer -= dt;
        if (s.cooldownTimer <= 0) {
          s.isRobbed = false;
        }
      }
    });

    if (this.player.isRobbing && this.player.robbingStoreId) {
      const store = this.stores.find((s) => s.id === this.player.robbingStoreId);
      if (!store) {
        this.cancelRobbery();
        return;
      }

      // Check distance from store
      const dist = Math.hypot(store.x + store.width / 2 - this.player.x, store.y + store.height / 2 - this.player.y);
      if (dist > 150) {
        this.notify('Moved too far from store! Robbery failed!', 'danger');
        this.cancelRobbery();
        return;
      }

      // Advance progress
      this.player.robberyProgress += dt / store.robDuration;

      // Spawn cash particles
      if (Math.random() < 0.25) {
        this.spawnCashParticle(this.player.x + (Math.random() - 0.5) * 30, this.player.y + (Math.random() - 0.5) * 30);
      }

      // Periodic alarm ring
      if (Math.random() < 0.08) {
        soundEngine.playStoreAlarm();
      }

      if (this.player.robberyProgress >= 1) {
        // Robbery Complete!
        const loot = Math.floor(store.lootMin + Math.random() * (store.lootMax - store.lootMin));
        this.player.dirtyCash += loot;
        this.player.storesRobbed += 1;
        store.isRobbed = true;
        store.cooldownTimer = 90; // 90 seconds cooldown

        this.player.isRobbing = false;
        this.player.robbingStoreId = null;
        this.player.robberyProgress = 0;

        soundEngine.playCashPickup();
        this.notify(`HEIST SUCCESSFUL! Bagged $${loot.toLocaleString()} dirty cash! ESCAPE TO SAFEHOUSE!`, 'cash');
        this.addWantedPoints(300);
      }
    }
  }

  private updateVehicles(dt: number) {
    this.vehicles.forEach((v) => {
      if (v.isDestroyed) {
        if (v.burnTimer > 0) {
          v.burnTimer -= dt;
          if (Math.random() < 0.3) {
            this.spawnSmokeParticle(v.x, v.y);
          }
        }
        return;
      }

      if (v.isOccupiedByPlayer) {
        // Player Driving Controls
        let throttle = 0;
        let steer = 0;

        if (this.keys['w'] || this.keys['arrowup']) throttle += 1;
        if (this.keys['s'] || this.keys['arrowdown']) throttle -= 0.65;
        if (this.keys['a'] || this.keys['arrowleft']) steer -= 1;
        if (this.keys['d'] || this.keys['arrowright']) steer += 1;

        // Acceleration & Braking
        if (throttle > 0) {
          v.speed = Math.min(v.stats.maxSpeed, v.speed + v.stats.acceleration);
        } else if (throttle < 0) {
          v.speed = Math.max(-v.stats.maxSpeed * 0.45, v.speed - v.stats.acceleration * 0.8);
        } else {
          v.speed *= v.stats.friction;
        }

        // Steering based on speed direction
        if (Math.abs(v.speed) > 0.1) {
          const steerSpeed = v.stats.handling * (v.speed > 0 ? 1 : -1);
          v.angle += steer * steerSpeed;
          v.steerAngle = steer * 0.35;
        }

        // Drifting / Skid marks
        const isBrakingOrHandbrake = (throttle < 0 && v.speed > 2) || (this.keys[' '] && v.speed > 2);
        if (isBrakingOrHandbrake || (Math.abs(steer) > 0.5 && Math.abs(v.speed) > 4)) {
          if (Date.now() - this.lastSkidTime > 120) {
            this.createSkidMark(v.x, v.y, v.angle);
            soundEngine.playTireSkid();
            this.lastSkidTime = Date.now();
          }
        }

        // Calculate velocity
        v.vx = Math.sin(v.angle) * v.speed;
        v.vy = -Math.cos(v.angle) * v.speed;

        // Move vehicle
        const nextX = v.x + v.vx;
        const nextY = v.y + v.vy;

        // Collision with buildings
        if (!this.checkBuildingCollision(nextX, v.y, v.width, v.height)) {
          v.x = Math.max(20, Math.min(CITY_SIZE - 20, nextX));
        } else {
          v.speed *= -0.3;
          this.damageVehicle(v, Math.abs(v.speed) * 12);
        }

        if (!this.checkBuildingCollision(v.x, nextY, v.width, v.height)) {
          v.y = Math.max(20, Math.min(CITY_SIZE - 20, nextY));
        } else {
          v.speed *= -0.3;
          this.damageVehicle(v, Math.abs(v.speed) * 12);
        }

        // Check Pay'n'Spray
        this.checkPayNSpray(v);

        // Sound Engine RPM
        const speedRatio = Math.min(1, Math.abs(v.speed) / v.stats.maxSpeed);
        soundEngine.updateEngine(true, speedRatio);
      } else if (v.isPolice) {
        // Police AI Pursuit Driving
        this.updatePoliceVehicleAI(v, dt);
      } else {
        // Civilian Traffic AI
        this.updateCivilianVehicleAI(v, dt);
      }

      // Check smoking
      if (v.health < v.maxHealth * 0.35 && !v.isSmoking) {
        v.isSmoking = true;
      }
      if (v.isSmoking && Math.random() < 0.3) {
        this.spawnSmokeParticle(v.x, v.y);
      }
    });
  }

  private updatePoliceVehicleAI(v: Vehicle, dt: number) {
    const targetX = this.player.x;
    const targetY = this.player.y;
    const dx = targetX - v.x;
    const dy = targetY - v.y;
    const targetAngle = Math.atan2(dx, -dy);

    // Smooth turn towards player (wider turning radius so player can outmaneuver them)
    let angleDiff = targetAngle - v.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    v.angle += Math.max(-0.045, Math.min(0.045, angleDiff));

    // Police pursuit speed (moderated so player has room to outpace and escape)
    const chaseSpeed = v.stats.maxSpeed * (0.65 + this.police.wantedLevel * 0.05);
    v.speed = Math.min(chaseSpeed, v.speed + v.stats.acceleration * 0.85);
    v.vx = Math.sin(v.angle) * v.speed;
    v.vy = -Math.cos(v.angle) * v.speed;

    const nextX = v.x + v.vx;
    const nextY = v.y + v.vy;

    if (!this.checkBuildingCollision(nextX, v.y, v.width, v.height)) {
      v.x = nextX;
    } else {
      v.speed *= -0.3;
      v.angle += 0.5;
    }

    if (!this.checkBuildingCollision(v.x, nextY, v.width, v.height)) {
      v.y = nextY;
    } else {
      v.speed *= -0.3;
      v.angle -= 0.5;
    }

    // Ram player vehicle or hit player
    const distToPlayer = Math.hypot(dx, dy);
    if (distToPlayer < 40) {
      if (this.player.inVehicleId) {
        const playerVeh = this.vehicles.find((veh) => veh.id === this.player.inVehicleId);
        if (playerVeh) {
          this.damageVehicle(playerVeh, 12);
          soundEngine.playCrash();
        }
      } else {
        // Cop ran over player or tries to arrest
        this.damagePlayer(14);
        soundEngine.playCrash();
      }
    }
  }

  private updateCivilianVehicleAI(v: Vehicle, dt: number) {
    // If player is on foot nearby on the road, brake & honk instead of crashing
    if (!this.player.inVehicleId) {
      const dx = this.player.x - v.x;
      const dy = this.player.y - v.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 110) {
        v.speed *= 0.88;
        if (Math.random() < 0.03) {
          soundEngine.playHorn();
        }
      }

      if (dist < 26) {
        // Soft bump: gently nudge player without heavy damage
        this.player.x += Math.sin(v.angle) * 2.5;
        this.player.y += -Math.cos(v.angle) * 2.5;
        v.speed = 0;
      }
    }

    // Cruise along straight road or turn at intersection
    v.speed = Math.min(v.stats.maxSpeed * 0.55, v.speed + v.stats.acceleration * 0.4);
    v.vx = Math.sin(v.angle) * v.speed;
    v.vy = -Math.cos(v.angle) * v.speed;

    const nextX = v.x + v.vx;
    const nextY = v.y + v.vy;

    if (!this.checkBuildingCollision(nextX, nextY, v.width, v.height)) {
      v.x = nextX;
      v.y = nextY;
    } else {
      // Turn around if hit wall
      v.angle += Math.PI / 2;
    }
  }

  private updatePedestrians(dt: number) {
    this.pedestrians.forEach((ped) => {
      if (ped.state === 'dead') return;

      if (ped.isPolice) {
        // Police officer on foot
        const dist = Math.hypot(this.player.x - ped.x, this.player.y - ped.y);
        if (dist < 380 && this.police.wantedLevel > 0) {
          ped.angle = Math.atan2(this.player.y - ped.y, this.player.x - ped.x);
          // Moderate foot cop run speed so a sprinting player can outrun them
          ped.x += Math.cos(ped.angle) * (ped.speed * 1.05);
          ped.y += Math.sin(ped.angle) * (ped.speed * 1.05);

          // Shoot at player with reasonable cooldown
          ped.shootCooldown -= dt;
          if (ped.shootCooldown <= 0 && dist < 300) {
            ped.shootCooldown = 1.8;
            this.fireEnemyBullet(ped.x, ped.y, ped.angle, 10);
          }
        }
      } else {
        // Civilian logic
        if (this.police.wantedLevel > 0 || this.player.isRobbing) {
          const distToPlayer = Math.hypot(this.player.x - ped.x, this.player.y - ped.y);
          if (distToPlayer < 220) {
            ped.state = 'fleeing';
            // Flee away from player
            const fleeAngle = Math.atan2(ped.y - this.player.y, ped.x - this.player.x);
            ped.angle = fleeAngle;
            ped.x += Math.cos(fleeAngle) * (ped.speed * 1.8);
            ped.y += Math.sin(fleeAngle) * (ped.speed * 1.8);
            return;
          }
        }

        // Wander
        ped.x += Math.cos(ped.angle) * ped.speed;
        ped.y += Math.sin(ped.angle) * ped.speed;

        if (Math.random() < 0.02) {
          ped.angle += (Math.random() - 0.5) * 1.5;
        }
      }
    });
  }

  private updatePoliceAI(dt: number) {
    if (this.police.wantedLevel === 0) return;

    // Check line of sight from all active police vehicles
    let anyPoliceSeeingPlayer = false;
    const maxVisionDist = 550;

    for (const veh of this.vehicles) {
      if (veh.isPolice && !veh.isDestroyed) {
        const dist = Math.hypot(veh.x - this.player.x, veh.y - this.player.y);
        if (dist < maxVisionDist) {
          // Check if wall is blocking line
          if (!this.checkLineOfSightBlocked(veh.x, veh.y, this.player.x, this.player.y)) {
            anyPoliceSeeingPlayer = true;
            break;
          }
        }
      }
    }

    if (anyPoliceSeeingPlayer) {
      this.police.isEvading = false;
      this.police.evasionTimer = this.police.maxEvasionTimer;
    } else {
      // Out of sight -> EVADING! Stars flash, cool down
      this.police.isEvading = true;
      this.police.evasionTimer -= dt;

      if (this.police.evasionTimer <= 0) {
        // Successfully evaded police!
        this.police.wantedLevel = 0;
        this.police.wantedPoints = 0;
        this.police.isEvading = false;
        this.police.helicopterActive = false;
        soundEngine.updateSiren(0);
        this.notify('EVADED POLICE! Wanted heat cleared. Head to safehouse to bank cash!', 'info');
      }
    }

    // Update helicopter spotlight
    if (this.police.helicopterActive) {
      // Follow player smoothly
      this.police.helicopterPos.x += (this.player.x - this.police.helicopterPos.x) * 0.02;
      this.police.helicopterPos.y += (this.player.y - this.police.helicopterPos.y) * 0.02;
      this.police.spotlightTarget.x = this.player.x;
      this.police.spotlightTarget.y = this.player.y;
    }
  }

  // --- WEAPONS & COMBAT ---

  public fireWeapon() {
    const weapon = WEAPONS_DATA[this.player.currentWeapon];
    const now = Date.now();

    if (now - this.lastShotTime < weapon.fireRate) return;

    // Check ammo
    const inv = this.player.weapons[weapon.id];
    if (inv.ammo === 0) {
      this.notify(`Out of ammo for ${weapon.name}! Visit Ammu-Nation!`, 'danger');
      return;
    }

    if (inv.ammo > 0) {
      inv.ammo--;
    }

    this.lastShotTime = now;

    if (weapon.id === 'fists') {
      soundEngine.playPunch();
      this.checkMeleeHit();
      return;
    }

    soundEngine.playGunshot(weapon.id as 'pistol' | 'smg' | 'shotgun' | 'rifle');

    // Spawn bullets
    const bulletOriginX = this.player.inVehicleId ? this.player.x : this.player.x + Math.cos(this.player.angle) * 18;
    const bulletOriginY = this.player.inVehicleId ? this.player.y : this.player.y + Math.sin(this.player.angle) * 18;

    for (let i = 0; i < weapon.bulletsPerShot; i++) {
      const spread = (Math.random() - 0.5) * weapon.spread;
      const angle = this.player.angle + spread;

      this.bullets.push({
        id: `bullet_${Date.now()}_${Math.random()}`,
        x: bulletOriginX,
        y: bulletOriginY,
        vx: Math.cos(angle) * weapon.bulletSpeed,
        vy: Math.sin(angle) * weapon.bulletSpeed,
        damage: weapon.damage,
        isPlayerBullet: true,
        life: 0,
        maxLife: weapon.range / weapon.bulletSpeed,
        range: weapon.range,
      });
    }

    // Firing causes a crime alert if civilians/cops are nearby
    if (this.police.wantedLevel === 0) {
      this.addWantedPoints(60);
    }
  }

  private checkMeleeHit() {
    const hitReach = 45;
    // Check hit on pedestrians
    this.pedestrians.forEach((p) => {
      const dist = Math.hypot(p.x - this.player.x, p.y - this.player.y);
      if (dist < hitReach && p.state !== 'dead') {
        p.health -= 35;
        this.spawnBloodParticle(p.x, p.y);
        if (p.health <= 0) {
          p.state = 'dead';
          this.player.kills++;
          this.addWantedPoints(100);
        }
      }
    });
  }

  private fireEnemyBullet(x: number, y: number, angle: number, damage: number) {
    soundEngine.playGunshot('pistol');
    this.bullets.push({
      id: `ebullet_${Date.now()}_${Math.random()}`,
      x,
      y,
      vx: Math.cos(angle) * 14,
      vy: Math.sin(angle) * 14,
      damage,
      isPlayerBullet: false,
      life: 0,
      maxLife: 35,
      range: 400,
    });
  }

  private updateBullets(dt: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life++;

      // Check max range
      if (b.life >= b.maxLife) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Check wall collision
      if (this.checkBuildingCollision(b.x, b.y, 4, 4)) {
        this.spawnSparkParticle(b.x, b.y);
        this.bullets.splice(i, 1);
        continue;
      }

      // Check hit on player
      if (!b.isPlayerBullet) {
        const dist = Math.hypot(b.x - this.player.x, b.y - this.player.y);
        if (dist < 18) {
          this.damagePlayer(b.damage);
          this.spawnBloodParticle(this.player.x, this.player.y);
          this.bullets.splice(i, 1);
          continue;
        }
      }

      // Check hit on pedestrians/cops
      if (b.isPlayerBullet) {
        let hit = false;
        for (const ped of this.pedestrians) {
          if (ped.state === 'dead') continue;
          const dist = Math.hypot(b.x - ped.x, b.y - ped.y);
          if (dist < 16) {
            ped.health -= b.damage;
            this.spawnBloodParticle(ped.x, ped.y);
            if (ped.health <= 0) {
              ped.state = 'dead';
              this.player.kills++;
              this.addWantedPoints(ped.isPolice ? 220 : 120);
            }
            hit = true;
            break;
          }
        }

        if (hit) {
          this.bullets.splice(i, 1);
          continue;
        }

        // Check hit on vehicles
        for (const veh of this.vehicles) {
          if (veh.isDestroyed || veh.isOccupiedByPlayer) continue;
          const dist = Math.hypot(b.x - veh.x, b.y - veh.y);
          if (dist < 30) {
            this.damageVehicle(veh, b.damage);
            this.spawnSparkParticle(b.x, b.y);
            hit = true;
            break;
          }
        }

        if (hit) {
          this.bullets.splice(i, 1);
        }
      }
    }
  }

  // --- DAMAGE & WASTED / BUSTED ---

  public damagePlayer(amt: number) {
    if (this.player.isDodgeRolling) return; // Invulnerable during combat dodge roll!

    if (this.player.armor > 0) {
      const absorbed = Math.min(this.player.armor, amt * 0.7);
      this.player.armor -= absorbed;
      amt -= absorbed;
    }
    this.player.health = Math.max(0, this.player.health - amt);
    if (this.player.health <= 0) {
      this.handlePlayerWasted();
    }
  }

  public damageVehicle(veh: Vehicle, amt: number) {
    veh.health = Math.max(0, veh.health - amt);
    if (veh.health <= 0 && !veh.isDestroyed) {
      veh.isDestroyed = true;
      veh.burnTimer = 8;
      soundEngine.playExplosion();
      this.spawnExplosion(veh.x, veh.y);

      // If player inside, damage heavily and eject
      if (veh.isOccupiedByPlayer) {
        this.damagePlayer(60);
        this.toggleVehicleEnterExit();
      }
    }
  }

  private handlePlayerWasted() {
    this.gameState = 'WASTED';
    soundEngine.playWasted();
    soundEngine.updateSiren(0);
    soundEngine.updateEngine(false, 0);

    // Lose unbanked dirty cash
    const lostCash = this.player.dirtyCash;
    this.player.dirtyCash = 0;
    // Hospital fee
    const hospitalFee = Math.min(this.player.stashedCash, 500);
    this.player.stashedCash -= hospitalFee;

    this.notify(`WASTED! You were killed. Lost $${lostCash.toLocaleString()} unbanked cash and $${hospitalFee} medical fee.`, 'danger');
  }

  public respawnPlayer() {
    this.player.health = this.player.maxHealth;
    this.player.armor = 0;
    this.player.x = 420;
    this.player.y = 2800; // Southside open road intersection
    this.player.inVehicleId = null;
    this.player.isRobbing = false;
    this.player.robberyProgress = 0;
    this.police.wantedLevel = 0;
    this.police.wantedPoints = 0;
    this.police.isEvading = false;
    this.police.helicopterActive = false;

    this.gameState = 'PLAYING';
    this.initWorld();
  }

  // --- ROAD & BUILDING HELPERS ---

  public isPlayerOnRoad(x: number, y: number): boolean {
    for (const r of ROADS) {
      if (x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) {
        return true;
      }
    }
    return false;
  }

  public checkBuildingCollision(x: number, y: number, width: number, height: number): boolean {
    const halfW = width / 2;
    const halfH = height / 2;

    for (const b of CITY_BUILDINGS) {
      // Safehouses and Pay'n'Spray are open drive-in and walk-in garage zones!
      if (b.type === 'safehouse' || b.type === 'spray') {
        continue;
      }

      if (
        x + halfW > b.x &&
        x - halfW < b.x + b.width &&
        y + halfH > b.y &&
        y - halfH < b.y + b.height
      ) {
        return true;
      }
    }
    return false;
  }

  private checkLineOfSightBlocked(x1: number, y1: number, x2: number, y2: number): boolean {
    // Check multiple sample points along line
    const steps = 12;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;
      if (this.checkBuildingCollision(px, py, 12, 12)) {
        return true; // blocked by wall
      }
    }
    return false;
  }

  // --- PARTICLES ---

  public spawnSparkParticle(x: number, y: number) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        color: '#fbbf24',
        size: 2,
        life: 0,
        maxLife: 15,
        alpha: 1,
        type: 'spark',
      });
    }
  }

  public spawnBloodParticle(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        color: '#dc2626',
        size: 3,
        life: 0,
        maxLife: 20,
        alpha: 1,
        type: 'blood',
      });
    }
  }

  public spawnSmokeParticle(x: number, y: number) {
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -1 - Math.random() * 2,
      color: '#475569',
      size: 4 + Math.random() * 6,
      life: 0,
      maxLife: 45,
      alpha: 0.7,
      type: 'smoke',
    });
  }

  public spawnCashParticle(x: number, y: number) {
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: -1.5 - Math.random() * 2,
      color: '#22c55e',
      size: 6,
      life: 0,
      maxLife: 35,
      alpha: 1,
      type: 'cash',
    });
  }

  public spawnDustParticle(x: number, y: number) {
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      color: '#cbd5e1',
      size: 2.5 + Math.random() * 2.5,
      life: 0,
      maxLife: 20,
      alpha: 0.65,
      type: 'dust',
    });
  }

  public spawnExplosion(x: number, y: number) {
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.5 ? '#f97316' : '#ef4444',
        size: 4 + Math.random() * 8,
        life: 0,
        maxLife: 30 + Math.random() * 20,
        alpha: 1,
        type: 'explosion',
      });
    }
  }

  public createSkidMark(x: number, y: number, angle: number) {
    const rearDist = 24;
    const x1 = x - Math.sin(angle) * rearDist;
    const y1 = y + Math.cos(angle) * rearDist;
    this.skidMarks.push({
      x1,
      y1,
      x2: x1 + (Math.random() - 0.5) * 4,
      y2: y1 + (Math.random() - 0.5) * 4,
      alpha: 0.7,
    });
    if (this.skidMarks.length > 200) {
      this.skidMarks.shift();
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      p.alpha = 1 - p.life / p.maxLife;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateSpawners(dt: number) {
    this.trafficSpawnTimer += dt;
    if (this.trafficSpawnTimer > 4) {
      this.trafficSpawnTimer = 0;
      if (this.vehicles.filter((v) => !v.isDestroyed).length < 24) {
        this.spawnRandomCivilianCar();
      }
    }

    this.pedestrianSpawnTimer += dt;
    if (this.pedestrianSpawnTimer > 3) {
      this.pedestrianSpawnTimer = 0;
      if (this.pedestrians.filter((p) => p.state !== 'dead').length < 32) {
        this.spawnRandomPedestrian();
      }
    }
  }
}
