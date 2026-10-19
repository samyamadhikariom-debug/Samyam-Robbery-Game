import { Building, Road, Store, Safehouse, PayNSpray, AmmuNation, VehicleStats, VehicleModel } from './types';

// Exactly 4X larger area (7200 x 7200 = 51.84M sq px vs previous 3600 x 3600 = 12.96M sq px)
export const CITY_SIZE = 7200;

export const VEHICLE_PRESETS: Record<VehicleModel, VehicleStats> = {
  sedan: {
    model: 'sedan',
    name: 'Vapid Cruiser',
    maxSpeed: 7.2,
    acceleration: 0.18,
    handling: 0.048,
    friction: 0.965,
    durability: 180,
    mass: 1400,
    color: '#3b82f6',
    roofColor: '#1d4ed8',
    width: 32,
    height: 64,
  },
  muscle: {
    model: 'muscle',
    name: 'Bravado Phoenix',
    maxSpeed: 8.8,
    acceleration: 0.26,
    handling: 0.052,
    friction: 0.955, // driftier!
    durability: 210,
    mass: 1600,
    color: '#ef4444',
    roofColor: '#991b1b',
    width: 34,
    height: 68,
  },
  supercar: {
    model: 'supercar',
    name: 'Pegassi Turismo',
    maxSpeed: 10.4,
    acceleration: 0.34,
    handling: 0.065,
    friction: 0.975,
    durability: 150,
    mass: 1200,
    color: '#10b981',
    roofColor: '#047857',
    width: 32,
    height: 66,
  },
  hypercar: {
    model: 'hypercar',
    name: 'Infernus Hyper Prototype',
    maxSpeed: 12.2,
    acceleration: 0.42,
    handling: 0.072,
    friction: 0.98,
    durability: 160,
    mass: 1150,
    color: '#f97316',
    roofColor: '#0f172a',
    width: 34,
    height: 68,
  },
  armored_apc: {
    model: 'armored_apc',
    name: 'Goliath Armored APC',
    maxSpeed: 6.4,
    acceleration: 0.18,
    handling: 0.032,
    friction: 0.96,
    durability: 650,
    mass: 4800,
    color: '#334155',
    roofColor: '#1e293b',
    width: 42,
    height: 84,
  },
  swat_van: {
    model: 'swat_van',
    name: 'Brute SWAT Enforcer',
    maxSpeed: 5.2,
    acceleration: 0.12,
    handling: 0.034,
    friction: 0.96,
    durability: 450,
    mass: 3200,
    color: '#1e293b',
    roofColor: '#0f172a',
    width: 38,
    height: 76,
  },
  police_cruiser: {
    model: 'police_cruiser',
    name: 'LCPD Police Interceptor',
    maxSpeed: 5.6,
    acceleration: 0.14,
    handling: 0.038,
    friction: 0.965,
    durability: 240,
    mass: 1600,
    color: '#0f172a',
    roofColor: '#f8fafc',
    width: 33,
    height: 66,
  },
  taxi: {
    model: 'taxi',
    name: 'Downtown Cab',
    maxSpeed: 7.0,
    acceleration: 0.19,
    handling: 0.05,
    friction: 0.965,
    durability: 160,
    mass: 1350,
    color: '#eab308',
    roofColor: '#ca8a04',
    width: 32,
    height: 64,
  },
};

// 4X City Highway & Avenue Grid Network (6 East-West and 6 North-South)
export const ROADS: Road[] = [
  // Horizontal Avenues (East-West)
  { x: 0, y: 500, width: CITY_SIZE, height: 160, isVertical: false, lanes: 4 },
  { x: 0, y: 1700, width: CITY_SIZE, height: 160, isVertical: false, lanes: 4 },
  { x: 0, y: 2900, width: CITY_SIZE, height: 160, isVertical: false, lanes: 4 },
  { x: 0, y: 4100, width: CITY_SIZE, height: 160, isVertical: false, lanes: 4 },
  { x: 0, y: 5300, width: CITY_SIZE, height: 160, isVertical: false, lanes: 4 },
  { x: 0, y: 6500, width: CITY_SIZE, height: 160, isVertical: false, lanes: 4 },

  // Vertical Boulevards (North-South)
  { x: 500, y: 0, width: 160, height: CITY_SIZE, isVertical: true, lanes: 4 },
  { x: 1700, y: 0, width: 160, height: CITY_SIZE, isVertical: true, lanes: 4 },
  { x: 2900, y: 0, width: 160, height: CITY_SIZE, isVertical: true, lanes: 4 },
  { x: 4100, y: 0, width: 160, height: CITY_SIZE, isVertical: true, lanes: 4 },
  { x: 5300, y: 0, width: 160, height: CITY_SIZE, isVertical: true, lanes: 4 },
  { x: 6500, y: 0, width: 160, height: CITY_SIZE, isVertical: true, lanes: 4 },
];

// Helper to check if a rectangle overlaps any road (with buffer)
export function isOverlappingRoad(x: number, y: number, w: number, h: number, margin = 24): boolean {
  for (const r of ROADS) {
    if (
      x + w + margin > r.x &&
      x - margin < r.x + r.width &&
      y + h + margin > r.y &&
      y - margin < r.y + r.height
    ) {
      return true;
    }
  }
  return false;
}

// 12 High-Stakes Stores & Vaults to Rob Across All 4 Quadrants
export const STORES: Store[] = [
  // Southside Docks & Industrial
  {
    id: 'store_quickmart_south',
    name: '24/7 QuickMart South Docks',
    type: 'convenience',
    x: 740,
    y: 5540,
    width: 140,
    height: 100,
    lootMin: 900,
    lootMax: 2000,
    robDuration: 4.5,
    wantedStarsTrigger: 1,
    isRobbed: false,
    cooldownTimer: 0,
    color: '#166534',
    accentColor: '#4ade80',
    icon: 'Store',
    description: 'Corner shop by the harbor. Quick cash register hit with low police response.',
  },
  {
    id: 'store_downtown_liquor',
    name: 'Red Dragon Liquors Chinatown',
    type: 'liquor',
    x: 1940,
    y: 4340,
    width: 150,
    height: 110,
    lootMin: 2200,
    lootMax: 4200,
    robDuration: 5.5,
    wantedStarsTrigger: 2,
    isRobbed: false,
    cooldownTimer: 0,
    color: '#991b1b',
    accentColor: '#f87171',
    icon: 'Wine',
    description: 'Liquor depot with safe under register. Police cruisers dispatch in seconds.',
  },
  // Downtown Financial & Diamond Row
  {
    id: 'store_viceroy_jewelers',
    name: 'Viceroy Diamond Exchange',
    type: 'jewelry',
    x: 3140,
    y: 4340,
    width: 170,
    height: 130,
    lootMin: 6500,
    lootMax: 14000,
    robDuration: 7.5,
    wantedStarsTrigger: 3,
    isRobbed: false,
    cooldownTimer: 0,
    color: '#1e3a8a',
    accentColor: '#60a5fa',
    icon: 'Gem',
    description: 'High-value diamond display cases. High-pitch silent alarm alerts police interceptors.',
  },
  {
    id: 'store_central_bank',
    name: 'First Federal Reserve Bank',
    type: 'bank',
    x: 1940,
    y: 1940,
    width: 240,
    height: 170,
    lootMin: 25000,
    lootMax: 55000,
    robDuration: 12.0,
    wantedStarsTrigger: 4,
    isRobbed: false,
    cooldownTimer: 0,
    color: '#065f46',
    accentColor: '#34d399',
    icon: 'Landmark',
    description: 'Major downtown vault heist. Huge cash haul, but SWAT teams and roadblocks will swarm.',
  },
  // Northside High-Roller Strip
  {
    id: 'store_crown_casino',
    name: 'Crown Royale Casino Vault',
    type: 'casino',
    x: 3140,
    y: 740,
    width: 260,
    height: 190,
    lootMin: 50000,
    lootMax: 100000,
    robDuration: 15.0,
    wantedStarsTrigger: 5,
    isRobbed: false,
    cooldownTimer: 0,
    color: '#831843',
    accentColor: '#f472b6',
    icon: 'Coins',
    description: 'The ultimate heist. Massive payday, but 5-star pursuit and helicopter searchlight!',
  },
  // New East Coast / Airport / Marina Targets
  {
    id: 'store_airfield_cargo',
    name: 'Metro Airfield Contraband Depot',
    type: 'airfield',
    x: 5540,
    y: 740,
    width: 250,
    height: 160,
    lootMin: 35000,
    lootMax: 75000,
    robDuration: 11.0,
    wantedStarsTrigger: 4,
    isRobbed: false,
    cooldownTimer: 0,
    color: '#0284c7',
    accentColor: '#38bdf8',
    icon: 'Plane',
    description: 'Smuggler hangar cargo crates filled with unmarked bonds and foreign currency.',
  },
  {
    id: 'store_gold_pawn',
    name: 'Downtown Gold & Luxury Pawn',
    type: 'pawn',
    x: 4340,
    y: 3140,
    width: 150,
    height: 110,
    lootMin: 4500,
    lootMax: 9500,
    robDuration: 6.5,
    wantedStarsTrigger: 2,
    isRobbed: false,
    cooldownTimer: 0,
    color: '#d97706',
    accentColor: '#fbbf24',
    icon: 'Scale',
    description: 'Pawn shop vault packed with gold ingots, luxury watches, and quick cash.',
  },
  {
    id: 'store_midtown_mart',
    name: '24/7 Neon Mart Midtown',
    type: 'convenience',
    x: 1940,
    y: 3140,
    width: 140,
    height: 100,
    lootMin: 1200,
    lootMax: 2600,
    robDuration: 4.5,
    wantedStarsTrigger: 1,
    isRobbed: false,
    cooldownTimer: 0,
    color: '#166534',
    accentColor: '#4ade80',
    icon: 'Store',
    description: 'Busy midtown market. Grab the till and slip into adjacent back-alleys.',
  },
  {
    id: 'store_east_bank',
    name: 'Eastside Savings & Trust',
    type: 'bank',
    x: 5540,
    y: 4340,
    width: 220,
    height: 160,
    lootMin: 20000,
    lootMax: 45000,
    robDuration: 10.0,
    wantedStarsTrigger: 3,
    isRobbed: false,
    cooldownTimer: 0,
    color: '#047857',
    accentColor: '#10b981',
    icon: 'Landmark',
    description: 'Suburban bank with older security. Great payout before police arrive from downtown.',
  },
  {
    id: 'store_harbor_liquor',
    name: 'Harbor Mist Spirits & Wine',
    type: 'liquor',
    x: 4340,
    y: 5540,
    width: 140,
    height: 110,
    lootMin: 2400,
    lootMax: 4800,
    robDuration: 5.5,
    wantedStarsTrigger: 2,
    isRobbed: false,
    cooldownTimer: 0,
    color: '#991b1b',
    accentColor: '#f87171',
    icon: 'Wine',
    description: 'Waterfront liquor store. Quick escape route towards the coastal highway.',
  },
  {
    id: 'store_coastal_casino',
    name: 'Marina Bay Casino Club',
    type: 'casino',
    x: 740,
    y: 3140,
    width: 240,
    height: 180,
    lootMin: 40000,
    lootMax: 85000,
    robDuration: 14.0,
    wantedStarsTrigger: 5,
    isRobbed: false,
    cooldownTimer: 0,
    color: '#831843',
    accentColor: '#f472b6',
    icon: 'Coins',
    description: 'Exclusive beachside gambling club with reinforced electronic vault.',
  },
  {
    id: 'store_north_mart',
    name: 'QuickStop North Boulevard',
    type: 'convenience',
    x: 4340,
    y: 740,
    width: 130,
    height: 100,
    lootMin: 1100,
    lootMax: 2400,
    robDuration: 4.5,
    wantedStarsTrigger: 1,
    isRobbed: false,
    cooldownTimer: 0,
    color: '#166534',
    accentColor: '#4ade80',
    icon: 'Store',
    description: 'Highway rest stop convenience store. Easy grab-and-dash.',
  },
];

// 4 Safehouses Across the 4X City Districts
export const SAFIEHOUSES: Safehouse[] = [
  {
    id: 'safehouse_southside',
    name: 'Southside Garage Hideout',
    district: 'South Harbor District',
    x: 740,
    y: 6680,
    width: 160,
    height: 120,
    isOwned: true,
    price: 0,
  },
  {
    id: 'safehouse_midtown',
    name: 'Midtown Loft & Lockup',
    district: 'Downtown Commercial Core',
    x: 3140,
    y: 3140,
    width: 160,
    height: 130,
    isOwned: false,
    price: 18000,
  },
  {
    id: 'safehouse_penthouse',
    name: 'North Hills Luxury Penthouse',
    district: 'Northside Strip',
    x: 4340,
    y: 1940,
    width: 180,
    height: 140,
    isOwned: false,
    price: 45000,
  },
  {
    id: 'safehouse_airfield',
    name: 'Smuggler Airfield Hangar',
    district: 'Metropolitan Airfield Depot',
    x: 5540,
    y: 1940,
    width: 200,
    height: 150,
    isOwned: false,
    price: 75000,
  },
];

// 4 Pay 'n' Spray Garages evenly spread across city
export const PAY_N_SPRAYS: PayNSpray[] = [
  {
    id: 'spray_south',
    name: "Tony's Southside Respray",
    x: 1940,
    y: 5540,
    width: 130,
    height: 100,
    cost: 400,
  },
  {
    id: 'spray_downtown',
    name: 'Downtown Custom Body Shop',
    x: 3140,
    y: 1940,
    width: 130,
    height: 100,
    cost: 500,
  },
  {
    id: 'spray_north',
    name: 'Midtown Metro Auto Spray',
    x: 4340,
    y: 4340,
    width: 130,
    height: 100,
    cost: 450,
  },
  {
    id: 'spray_east',
    name: 'Eastside Performance & Paint',
    x: 5540,
    y: 5540,
    width: 130,
    height: 100,
    cost: 500,
  },
];

// 4 Ammu-Nation Weapon Stores Across the 4 Quadrants
export const AMMU_NATIONS: AmmuNation[] = [
  {
    id: 'ammu_downtown',
    name: 'Ammu-Nation Downtown Flagship',
    x: 740,
    y: 4340,
    width: 150,
    height: 120,
  },
  {
    id: 'ammu_north',
    name: 'Ammu-Nation North Hills',
    x: 1940,
    y: 740,
    width: 150,
    height: 120,
  },
  {
    id: 'ammu_east',
    name: 'Ammu-Nation East Metro',
    x: 5540,
    y: 3140,
    width: 150,
    height: 120,
  },
  {
    id: 'ammu_south',
    name: 'Ammu-Nation Harbor Point',
    x: 3140,
    y: 5540,
    width: 150,
    height: 120,
  },
];

// Procedural City Block Generation for 4X City Grid
export function generateCityBuildings(): Building[] {
  const buildings: Building[] = [];

  // Register stores as buildings
  STORES.forEach((s) => {
    buildings.push({
      id: s.id,
      x: s.x,
      y: s.y,
      width: s.width,
      height: s.height,
      color: s.color,
      roofColor: s.color,
      label: s.name,
      type: 'store',
      storeRefId: s.id,
    });
  });

  // Safehouses
  SAFIEHOUSES.forEach((sh) => {
    buildings.push({
      id: sh.id,
      x: sh.x,
      y: sh.y,
      width: sh.width,
      height: sh.height,
      color: '#1e293b',
      roofColor: '#334155',
      label: sh.name,
      type: 'safehouse',
    });
  });

  // Pay N Sprays
  PAY_N_SPRAYS.forEach((pns) => {
    buildings.push({
      id: pns.id,
      x: pns.x,
      y: pns.y,
      width: pns.width,
      height: pns.height,
      color: '#78350f',
      roofColor: '#b45309',
      label: pns.name,
      type: 'spray',
    });
  });

  // AmmuNations
  AMMU_NATIONS.forEach((an) => {
    buildings.push({
      id: an.id,
      x: an.x,
      y: an.y,
      width: an.width,
      height: an.height,
      color: '#365314',
      roofColor: '#4d7c0f',
      label: an.name,
      type: 'ammu',
    });
  });

  // Generate generic buildings in blocks between roads
  // Road bands: 500, 1700, 2900, 4100, 5300, 6500 (each 160 width)
  const blockXStarts = [740, 1940, 3140, 4340, 5540];
  const blockYStarts = [740, 1940, 3140, 4340, 5540];

  let bId = 200;
  blockXStarts.forEach((bxStart) => {
    blockYStarts.forEach((byStart) => {
      // 3 buildings per block
      const offsets = [
        { ox: 0, oy: 180, w: 200, h: 150, col: '#1e293b', roof: '#0f172a' },
        { ox: 240, oy: 0, w: 180, h: 180, col: '#334155', roof: '#1e293b' },
        { ox: 220, oy: 220, w: 210, h: 160, col: '#0f172a', roof: '#1e293b' },
      ];

      offsets.forEach((off) => {
        const bx = bxStart + off.ox;
        const by = byStart + off.oy;

        const collides = buildings.some((b) => {
          return (
            bx < b.x + b.width + 20 &&
            bx + off.w + 20 > b.x &&
            by < b.y + b.height + 20 &&
            by + off.h + 20 > b.y
          );
        });

        if (!collides && !isOverlappingRoad(bx, by, off.w, off.h, 24) && bx + off.w < CITY_SIZE - 60 && by + off.h < CITY_SIZE - 60) {
          buildings.push({
            id: `bldg_${bId++}`,
            x: bx,
            y: by,
            width: off.w,
            height: off.h,
            color: off.col,
            roofColor: off.roof,
            type: 'generic',
          });
        }
      });
    });
  });

  return buildings;
}

export const CITY_BUILDINGS = generateCityBuildings();
