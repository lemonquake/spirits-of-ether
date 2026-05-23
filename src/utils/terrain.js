export const getHeight = (x, z) => {
  const distFromCenter = Math.sqrt(x * x + z * z);
  
  // Base rolling hills height
  const wave1 = Math.sin(x * 0.10) * Math.cos(z * 0.10) * 2.8;
  const wave2 = Math.sin(x * 0.24 + 1.0) * Math.sin(z * 0.18) * 0.9;
  const wave3 = Math.cos(x * 0.05 - z * 0.07) * 1.5;
  const hillHeight = wave1 + wave2 + wave3;
  
  // Center flat spawn zone (radius 0 to 4 is flat, smoothly blending by radius 12)
  const spawnT = Math.max(0, Math.min(1, (distFromCenter - 4) / 8));
  const spawnWeight = spawnT * spawnT * (3 - 2 * spawnT); // smoothstep
  
  const baseHeight = hillHeight * spawnWeight;

  // Slope down to beach at positive Z: z > 18
  if (z > 18) {
    const beachWeight = Math.max(0, Math.min(1, (z - 18) / 12));
    const smoothBeach = beachWeight * beachWeight * (3 - 2 * beachWeight);
    const beachHeight = baseHeight * (1 - smoothBeach) + (-1.2) * smoothBeach;

    if (z > 30) {
      const oceanWeight = Math.max(0, Math.min(1, (z - 30) / 12));
      const smoothOcean = oceanWeight * oceanWeight * (3 - 2 * oceanWeight);
      return beachHeight * (1 - smoothOcean) + (-3.5) * smoothOcean;
    }
    return beachHeight;
  }
  
  return baseHeight;
};

// Deterministic pseudo-random foliage layout
// Returns scattered positions, scales, types, and collision properties
export const getFoliage = () => {
  const list = [];
  let state = 12345;
  const nextRandom = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
  
  // Increase tree count to populate the expanded map (120x120)
  for (let i = 0; i < 280; i++) {
    const x = nextRandom() * 110 - 55;
    const z = nextRandom() * 110 - 55;
    
    // Clear zone around center spawn
    const distFromCenter = Math.sqrt(x * x + z * z);
    if (distFromCenter < 5.0) continue;
    
    // Clear zone around shop merchant
    const distFromMerchant = Math.sqrt(x * x + (z - 4) * (z - 4));
    if (distFromMerchant < 3.2) continue;

    // Clear zone around Dadilo Alex (Huts area near x = -12, z = 22)
    const distFromNPC = Math.sqrt((x + 12) * (x + 12) + (z - 22) * (z - 22));
    if (distFromNPC < 5.5) continue;
    
    // Clear beach and water area (z > 17)
    if (z > 17) continue;
    
    const scale = 0.7 + nextRandom() * 1.1;
    const type = Math.floor(nextRandom() * 4); // 0: Pine, 1: Oak, 2: Bush, 3: Rock
    const rotation = nextRandom() * Math.PI * 2;
    
    // Collision mapping
    let hasCollision = false;
    let collisionRadius = 0;
    
    if (type === 0) {
      // Conical Pine tree
      hasCollision = true;
      collisionRadius = 0.22 * scale;
    } else if (type === 1) {
      // Round Oak tree
      hasCollision = true;
      collisionRadius = 0.28 * scale;
    } else if (type === 3) {
      // Boulders: only large ones block player
      if (scale >= 1.15) {
        hasCollision = true;
        collisionRadius = 0.42 * scale;
      }
    }
    
    list.push({ x, z, scale, type, rotation, hasCollision, collisionRadius });
  }
  return list;
};
