export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'BUSTED' | 'WASTED' | 'STORE_INTERACTION' | 'SAFEHOUSE_MENU' | 'AMMUNATION_MENU';

export type WeaponType = 'fists' | 'pistol' | 'deagle' | 'smg' | 'shotgun' | 'rifle' | 'sniper' | 'minigun' | 'grenade';

export interface WeaponInfo {
  id: WeaponType;
  name: string;
  damage: number;
  fireRate: number; // ms between shots
  range: number;
  ammo: number; // -1 for infinite (fists)
  maxAmmo: number;
  price: number;
  spread: number;
  bulletSpeed: number;
  bulletsPerShot: number;
  description: string;
}

export type VehicleModel = 'sedan' | 'muscle' | 'supercar' | 'hypercar' | 'armored_apc' | 'swat_van' | 'police_cruiser' | 'taxi';

export interface VehicleStats {
  model: VehicleModel;
  name: string;
  maxSpeed: number;
  acceleration: number;
  handling: number; // turning rate
  friction: number;
  durability: number; // max health
  mass: number;
  color: string;
  roofColor: string;
  width: number;
  height: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  angle: number; // in radians
  vx: number;
  vy: number;
  width: number;
  height: number;
}

export interface Player extends Entity {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  speed: number;
  dirtyCash: number; // carried stolen cash
  stashedCash: number; // safely stored in safehouse
  currentWeapon: WeaponType;
  weapons: Record<WeaponType, { owned: boolean; ammo: number }>;
  inVehicleId: string | null;
  isSprinting: boolean;
  stamina: number;
  maxStamina: number;
  isDodgeRolling: boolean;
  rollTimer: number;
  walkAnimTimer: number;
  isRobbing: boolean;
  robbingStoreId: string | null;
  robberyProgress: number; // 0 to 1
  kills: number;
  storesRobbed: number;
  grenades: number;
  medkits: number;
  smokeBombs: number;
  nitroUnlocked: boolean;
  nitroFuel: number;
  maxNitroFuel: number;
  isNitroActive: boolean;
  selectedWaypoint: { x: number; y: number; name: string } | null;
}

export interface Vehicle extends Entity {
  model: VehicleModel;
  speed: number;
  health: number;
  maxHealth: number;
  stats: VehicleStats;
  isPolice: boolean;
  sirenOn: boolean;
  isOccupiedByPlayer: boolean;
  driverId: string | null;
  isSmoking: boolean;
  isDestroyed: boolean;
  burnTimer: number;
  steerAngle: number;
  nitroActive: boolean;
}

export interface Pedestrian extends Entity {
  health: number;
  speed: number;
  state: 'wandering' | 'fleeing' | 'dead';
  targetX: number;
  targetY: number;
  color: string;
  shirtColor: string;
  isPolice: boolean;
  copType?: 'patrol' | 'swat' | 'detective';
  shootCooldown: number;
}

export type StoreType = 'convenience' | 'liquor' | 'jewelry' | 'bank' | 'casino' | 'pawn' | 'airfield';

export interface Store {
  id: string;
  name: string;
  type: StoreType;
  x: number;
  y: number;
  width: number;
  height: number;
  lootMin: number;
  lootMax: number;
  robDuration: number; // seconds to empty safe
  wantedStarsTrigger: number;
  isRobbed: boolean;
  cooldownTimer: number; // can be robbed again after cooldown
  color: string;
  accentColor: string;
  icon: string;
  description: string;
}

export interface Safehouse {
  id: string;
  name: string;
  district: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isOwned: boolean;
  price: number;
}

export interface PayNSpray {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  cost: number;
}

export interface AmmuNation {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Building {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  roofColor: string;
  label?: string;
  type?: 'generic' | 'store' | 'safehouse' | 'spray' | 'ammu';
  storeRefId?: string;
}

export interface Road {
  x: number;
  y: number;
  width: number;
  height: number;
  isVertical: boolean;
  lanes: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  isPlayerBullet: boolean;
  life: number;
  maxLife: number;
  range: number;
}

export interface GrenadeEntity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  timer: number;
  radius: number;
  damage: number;
  isSmoke: boolean;
}

export interface RoadblockSpike {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  alpha: number;
  type: 'smoke' | 'spark' | 'blood' | 'cash' | 'skid' | 'explosion' | 'dust' | 'dash' | 'nitro';
}

export interface SkidMark {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
}

export interface PoliceState {
  wantedLevel: number; // 0 to 5
  wantedPoints: number;
  evasionTimer: number; // seconds remaining to lose stars when out of sight
  maxEvasionTimer: number;
  isEvading: boolean; // true when cops have lost direct line of sight
  helicopterActive: boolean;
  helicopterPos: { x: number; y: number };
  spotlightTarget: { x: number; y: number };
}
