import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import AzrinModel from './AzrinModel';
import AzraelModel from './AzraelModel';
import EnemyModel from './EnemyModel';
import { createBarkTexture, createLeafTexture, createStoneTexture } from '../../utils/textures';

function StoneColumn({ position, rotationY = 0, stoneTex }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Stone base pillar */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 3.0, 6]} />
        <meshStandardMaterial map={stoneTex} color="#57534e" roughness={0.9} />
      </mesh>
      
      {/* Stone top cap */}
      <mesh position={[0, 3.0, 0]} castShadow>
        <boxGeometry args={[0.55, 0.2, 0.55]} />
        <meshStandardMaterial map={stoneTex} color="#44403c" roughness={0.9} />
      </mesh>
      
      {/* Small iron hook */}
      <mesh position={[0.25, 2.7, 0]} castShadow>
        <boxGeometry args={[0.4, 0.08, 0.08]} />
        <meshStandardMaterial color="#1c1917" roughness={0.9} />
      </mesh>
      
      {/* Hanging lantern */}
      <group position={[0.4, 2.3, 0]}>
        {/* Lantern frame */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.35, 6]} />
          <meshStandardMaterial color="#1c1917" roughness={0.8} />
        </mesh>
        {/* Glowing flame */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        {/* Local light cast from lantern */}
        <pointLight position={[0, 0, 0]} intensity={1.5} distance={6} color="#f59e0b" />
      </group>
    </group>
  );
}

const getEnemyPosition = (idx) => {
  // idx 0 -> Middle, idx 1 -> Top, idx 2 -> Bottom
  if (idx === 0) return [2.5, 0.0, -2.0];
  if (idx === 1) return [2.5, 0.0, -3.2];
  return [2.5, 0.0, -0.8];
};

const getUnitBasePosition = (unitId, enemies) => {
  if (unitId === 'Azrin') return new THREE.Vector3(-2.5, 0.0, -2.0);
  if (unitId === 'Azrael') return new THREE.Vector3(-2.5, 0.0, -0.8);
  const enemyIdx = enemies.findIndex(e => e.id === unitId);
  if (enemyIdx !== -1) {
    const pos = getEnemyPosition(enemyIdx);
    return new THREE.Vector3(pos[0], 0.5, pos[2]); // Float center is at Y=0.5
  }
  return new THREE.Vector3(0, 0, 0);
};

export default function CombatArena() {
  const combat = useGameStore(state => state.combat);
  const characters = useGameStore(state => state.characters);
  const inventory = useGameStore(state => state.inventory);

  // New targeting actions
  const selectTargetUnit = useGameStore(state => state.selectTargetUnit);
  const selectEnemyTarget = useGameStore(state => state.selectEnemyTarget);

  const activeUnit = combat.turnOrder[combat.activeTurnIndex];

  // Load procedural textures
  const barkTex = useMemo(() => createBarkTexture(), []);
  const leafTex = useMemo(() => createLeafTexture(), []);
  const stoneTex = useMemo(() => createStoneTexture(), []);

  // Mesh references
  const azrinRef = useRef();
  const azraelRef = useRef();
  const enemyRefs = useRef([]);
  
  // Target pointers refs
  const azrinRingRef = useRef();
  const azraelRingRef = useRef();
  const enemyRingRefs = useRef([]);

  const azrinArrowRef = useRef();
  const azraelArrowRef = useRef();
  const enemyArrowRefs = useRef([]);

  // Materials refs
  const azrinMatRef = useRef();
  const azraelMatRef = useRef();
  const enemyMatRefs = useRef([]);

  // Particle pools refs
  const magicPartsRef = useRef([]);
  const healPartsRef = useRef([]);
  
  // Track particle physics
  const magicPhysicsRef = useRef([]); // array of { x, y, z, vx, vy, vz, life, maxLife }
  const healPhysicsRef = useRef([]); // array of { x, y, z, angle, radius, speedY, life, maxLife }
  
  // Animation tracking refs
  const lastActionRef = useRef(null);
  const actionStartTimeRef = useRef(0);
  const particlesSpawnedRef = useRef(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Calculate action animation progress at the top to avoid Temporal Dead Zone (TDZ) errors in loops
    let animProgress = 0;
    if (combat.animatingAction) {
      if (combat.animatingAction !== lastActionRef.current) {
        lastActionRef.current = combat.animatingAction;
        actionStartTimeRef.current = time;
        particlesSpawnedRef.current = false;
      }
      animProgress = time - actionStartTimeRef.current;
    }

    // 1. Orientations & Base Positions Reset
    let animatingAttacker = combat.animatingAction?.attacker;
    let isPhysicalAnimating = combat.animatingAction && 
      (combat.animatingAction.type === 'attack' || (combat.animatingAction.type === 'skill' && animatingAttacker === 'Azrin'));

    // Azrin
    if (azrinRef.current) {
      if (isPhysicalAnimating && animatingAttacker === 'Azrin') {
        // Handled by animation interpolation below
      } else {
        azrinRef.current.position.set(-2.5, 0.0, -2.0);
      }
      azrinRef.current.rotation.y = Math.PI / 2; // Face forward/right
    }

    // Azrael
    if (azraelRef.current) {
      if (isPhysicalAnimating && animatingAttacker === 'Azrael') {
        // Handled by animation interpolation below
      } else {
        azraelRef.current.position.set(-2.5, 0.0, -0.8);
      }
      azraelRef.current.rotation.y = Math.PI / 2; // Face forward/right
    }

    // Enemies positioning & animation state calculation
    combat.enemies.forEach((enemy, idx) => {
      const ref = enemyRefs.current[idx];
      if (ref) {
        let currentAnimState = 'idle';
        let progress = 0;

        if (enemy.hp <= 0) {
          const justDied = combat.animatingAction && 
            (combat.animatingAction.target === enemy.id || 
             (combat.animatingAction.target === 'all_enemies' && combat.animatingAction.targetsHit?.includes(enemy.id)));
          currentAnimState = justDied ? 'dying' : 'dead';
          progress = justDied ? animProgress : 1.0;

          // Ground dead enemies
          const basePos = getEnemyPosition(idx);
          ref.position.set(basePos[0], 0.08, basePos[2]);
          ref.rotation.y = -Math.PI / 2;
        } else {
          if (isPhysicalAnimating && animatingAttacker === enemy.id) {
            // Handled by animation interpolation below
          } else {
            const basePos = getEnemyPosition(idx);
            ref.position.set(
              basePos[0],
              0.5 + Math.sin(time * 2.5 + idx) * 0.08,
              basePos[2]
            );
          }
          ref.rotation.y = -Math.PI / 2; // Face forward/left

          if (combat.animatingAction) {
            const { attacker, target, type } = combat.animatingAction;
            if (attacker === enemy.id) {
              const actType = combat.animatingAction.details?.actionType || type;
              currentAnimState = actType === 'spell' ? 'spell' : (actType === 'def' ? 'def' : 'attack');
              progress = animProgress;
            } else if (animProgress >= 0.3 && animProgress <= 0.8) {
              if (target === enemy.id || (target === 'all_enemies' && !attacker.startsWith('enemy_'))) {
                currentAnimState = 'hit';
                progress = animProgress - 0.3;
              }
            }
          }
        }

        ref.userData = {
          animState: currentAnimState,
          animVariant: idx,
          animProgress: progress
        };
      }
    });

    // 2. Rotate targeting rings and bounce arrows
    const bounceY = 1.35 + Math.sin(time * 7) * 0.08;
    const ringAngle = time * 2.5;

    if (azrinRingRef.current) azrinRingRef.current.rotation.z = ringAngle;
    if (azraelRingRef.current) azraelRingRef.current.rotation.z = ringAngle;

    if (azrinArrowRef.current) {
      azrinArrowRef.current.position.y = bounceY;
      azrinArrowRef.current.rotation.y = time * 2;
    }
    if (azraelArrowRef.current) {
      azraelArrowRef.current.position.y = bounceY;
      azraelArrowRef.current.rotation.y = time * 2;
    }

    // Animate active enemy rings and arrows
    combat.enemies.forEach((enemy, idx) => {
      const ring = enemyRingRefs.current[idx];
      const arrow = enemyArrowRefs.current[idx];
      if (ring) ring.rotation.z = ringAngle;
      if (arrow) {
        arrow.position.y = bounceY + 0.35;
        arrow.rotation.y = time * 2;
      }
    });

    // 3. Action Animations and Flashes
    if (combat.animatingAction) {
      const { attacker, type, target, isCrit } = combat.animatingAction;

      // Physically move characters for physical strikes (attack / Azrin skill)
      if (isPhysicalAnimating) {
        let mesh;
        let startPos = getUnitBasePosition(attacker, combat.enemies);
        let targetPos = new THREE.Vector3();

        if (attacker === 'Azrin') {
          mesh = azrinRef.current;
        } else if (attacker === 'Azrael') {
          mesh = azraelRef.current;
        } else {
          // Find the active enemy index
          const enemyIdx = combat.enemies.findIndex(e => e.id === attacker);
          if (enemyIdx !== -1) {
            mesh = enemyRefs.current[enemyIdx];
          }
        }

        if (target === 'all_enemies') {
          targetPos.set(2.5, startPos.y, -2.0);
        } else {
          const rawTargetPos = getUnitBasePosition(target, combat.enemies);
          targetPos.set(rawTargetPos.x, startPos.y, rawTargetPos.z);
        }

        if (mesh) {
          const duration = 1.2;
          const phaseVal = animProgress / duration;
          
          if (phaseVal < 0.3) {
            const t = phaseVal / 0.3;
            mesh.position.lerpVectors(startPos, targetPos, t);
          } else if (phaseVal < 0.6) {
            mesh.position.copy(targetPos);
            mesh.position.x += Math.sin(time * 60) * 0.08;
          } else if (phaseVal < 1.0) {
            const t = (phaseVal - 0.6) / 0.4;
            mesh.position.lerpVectors(targetPos, startPos, t);
          } else {
            mesh.position.copy(startPos);
          }
        }
      }

      // Material flashes
      let flashIntensity = 0;
      if (animProgress >= 0.3 && animProgress <= 0.8) {
        const t = (animProgress - 0.3) / 0.5;
        flashIntensity = Math.sin(t * Math.PI) * 2.0;
      }

      // Determine flash color based on actions
      let flashColor = new THREE.Color('#ffffff');
      const isHealAction = type === 'skill' && characters[attacker]?.skills.find(s => s.id === combat.animatingAction.details?.skillId)?.type === 'heal';
      const isItemHealAction = type === 'item' && ['hp', 'mp', 'revive'].includes(inventory.find(i => i.id === combat.animatingAction.details?.itemId)?.valueType);
      const isHeal = isHealAction || isItemHealAction;

      const isMagicAction = type === 'skill' && characters[attacker]?.skills.find(s => s.id === combat.animatingAction.details?.skillId)?.type === 'attack';

      if (isHeal) {
        flashColor.set('#10b981'); // Emerald Green
      } else if (isCrit) {
        flashColor.set('#ff1122'); // Critical Red
      } else if (isMagicAction) {
        flashColor.set('#00b7ff'); // Ice/Ether Cyan-Blue
      } else {
        flashColor.set('#ff5555'); // Standard physical impact red
      }

      // Material helper
      const applyMaterialFlash = (matRef) => {
        if (matRef.current) {
          matRef.current.emissive.copy(flashColor);
          matRef.current.emissiveIntensity = flashIntensity;
        }
      };

      if (target === 'Azrin') {
        applyMaterialFlash(azrinMatRef);
      } else if (target === 'Azrael') {
        applyMaterialFlash(azraelMatRef);
      } else if (target === 'all_enemies') {
        // Flash all enemies!
        enemyMatRefs.current.forEach((mat) => {
          if (mat) {
            mat.emissive.copy(flashColor);
            mat.emissiveIntensity = flashIntensity;
          }
        });
      } else {
        // Target is a specific enemy ID
        const idx = combat.enemies.findIndex(e => e.id === target);
        if (idx !== -1) {
          const mat = enemyMatRefs.current[idx];
          if (mat) {
            mat.emissive.copy(flashColor);
            mat.emissiveIntensity = flashIntensity;
          }
        }
      }

      // 4. Trigger Particle Bursts on Impact
      if (animProgress >= 0.3 && !particlesSpawnedRef.current) {
        particlesSpawnedRef.current = true;
        
        let spawnPos = new THREE.Vector3();
        if (target === 'Azrin') {
          spawnPos.set(-2.5, 0.5, -2.0);
        } else if (target === 'Azrael') {
          spawnPos.set(-2.5, 0.5, -0.8);
        } else if (target === 'all_enemies') {
          spawnPos.set(2.5, 0.5, -2.0); // center of enemies
        } else {
          // target is an enemy ID
          const enemyIdx = combat.enemies.findIndex(e => e.id === target);
          if (enemyIdx !== -1) {
            const base = getEnemyPosition(enemyIdx);
            spawnPos.set(base[0], base[1] + 0.5, base[2]);
          } else {
            spawnPos.set(2.5, 0.5, -2.0);
          }
        }

        if (isHeal) {
          // Initialize rising green healing stars
          for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            healPhysicsRef.current[i] = {
              x: spawnPos.x,
              y: spawnPos.y - 0.5,
              z: spawnPos.z,
              angle: angle,
              radius: 0.35,
              speedY: 1.2 + Math.random() * 1.5,
              life: 1.0,
              maxLife: 1.0
            };
          }
        } else if (isMagicAction) {
          // Initialize exploding blue magic crystals
          for (let i = 0; i < 20; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const speed = 1.8 + Math.random() * 2.5;

            magicPhysicsRef.current[i] = {
              x: spawnPos.x,
              y: spawnPos.y + 0.1,
              z: spawnPos.z,
              vx: Math.sin(phi) * Math.cos(theta) * speed,
              vy: Math.sin(phi) * Math.sin(theta) * speed + 1.2, // bias upwards
              vz: Math.cos(phi) * speed,
              life: 0.8,
              maxLife: 0.8
            };
          }
        }
      }
    } else {
      // Clear material flashes when idle
      if (azrinMatRef.current) azrinMatRef.current.emissiveIntensity = 0;
      if (azraelMatRef.current) azraelMatRef.current.emissiveIntensity = 0;
      enemyMatRefs.current.forEach((mat) => {
        if (mat) mat.emissiveIntensity = 0;
      });
    }

    // 5. Update Particle Simulation
    // Magic particles
    for (let i = 0; i < 20; i++) {
      const p = magicPhysicsRef.current[i];
      const mesh = magicPartsRef.current[i];
      
      if (p && p.life > 0 && mesh) {
        p.life -= 0.016;
        p.vy -= 8.0 * 0.016; // gravity
        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016;
        p.z += p.vz * 0.016;

        mesh.position.set(p.x, p.y, p.z);
        mesh.rotation.x += 0.07;
        mesh.rotation.y += 0.07;
        
        const scale = (p.life / p.maxLife) * 1.3;
        mesh.scale.set(scale, scale, scale);
      } else if (mesh) {
        mesh.scale.set(0, 0, 0);
      }
    }

    // Heal particles
    for (let i = 0; i < 20; i++) {
      const p = healPhysicsRef.current[i];
      const mesh = healPartsRef.current[i];
      
      if (p && p.life > 0 && mesh) {
        p.life -= 0.016;
        p.angle += 0.16; // spiral spin
        p.radius -= 0.003;
        p.y += p.speedY * 0.016; // rise up

        const px = p.x + Math.cos(p.angle) * p.radius;
        const pz = p.z + Math.sin(p.angle) * p.radius;

        mesh.position.set(px, p.y, pz);
        const scale = (p.life / p.maxLife) * 0.9;
        mesh.scale.set(scale, scale, scale);
      } else if (mesh) {
        mesh.scale.set(0, 0, 0);
      }
    }

    // 6. Compute Combat animation states for Heroines
    let azrinAnim = 'idle';
    let azrinVariant = Math.floor(time / 5) % 4;
    let azrinProgress = 0;

    let azraelAnim = 'idle';
    let azraelVariant = Math.floor((time + 2.5) / 5) % 4;
    let azraelProgress = 0;

    if (combat.animatingAction) {
      const { attacker, target, details } = combat.animatingAction;
      
      let actionVariant = 0;
      if (details?.skillId) {
        if (details.skillId === 'ether_slash' || details.skillId === 'astral_heal' || details.skillId === 'spirit_surge') {
          actionVariant = 1;
        } else if (details.skillId === 'blade_dance') {
          actionVariant = 2;
        } else if (details.skillId === 'ether_shield' || details.skillId === 'nova_flare') {
          actionVariant = 3;
        }
      }

      if (attacker === 'Azrin') {
        azrinAnim = 'attack';
        azrinVariant = actionVariant;
        azrinProgress = animProgress;
      } else if (attacker === 'Azrael') {
        azraelAnim = 'attack';
        azraelVariant = actionVariant;
        azraelProgress = animProgress;
      }

      const isTargetingAll = target === 'all_enemies' || target === 'all_heroes';
      
      if (animProgress >= 0.3 && animProgress <= 0.8) {
        if (target === 'Azrin' || (isTargetingAll && attacker.startsWith('enemy_'))) {
          if (characters.Azrin.hp > 0) {
            azrinAnim = 'hit';
            azrinProgress = animProgress - 0.3;
          }
        }
        if (target === 'Azrael' || (isTargetingAll && attacker.startsWith('enemy_'))) {
          if (characters.Azrael.hp > 0) {
            azraelAnim = 'hit';
            azraelProgress = animProgress - 0.3;
          }
        }
      }
    }

    if (characters.Azrin.hp <= 0) {
      const justDied = combat.animatingAction && 
        (combat.animatingAction.target === 'Azrin' || 
         (combat.animatingAction.target === 'all_heroes' && combat.animatingAction.targetsHit?.includes('Azrin')));
      if (justDied) {
        azrinAnim = 'dying';
        azrinProgress = animProgress;
      } else {
        azrinAnim = 'dead';
      }
    }
    if (characters.Azrael.hp <= 0) {
      const justDied = combat.animatingAction && 
        (combat.animatingAction.target === 'Azrael' || 
         (combat.animatingAction.target === 'all_heroes' && combat.animatingAction.targetsHit?.includes('Azrael')));
      if (justDied) {
        azraelAnim = 'dying';
        azraelProgress = animProgress;
      } else {
        azraelAnim = 'dead';
      }
    }

    if (azrinRef.current) {
      azrinRef.current.userData = {
        animState: azrinAnim,
        animVariant: azrinVariant,
        animProgress: azrinProgress
      };
    }
    if (azraelRef.current) {
      azraelRef.current.userData = {
        animState: azraelAnim,
        animVariant: azraelVariant,
        animProgress: azraelProgress
      };
    }
  });

  // Filter floating text notifications
  const activeFloatingTexts = (combat.floatingTexts || []).filter(
    // eslint-disable-next-line react-hooks/purity
    (txt) => Date.now() - txt.createdAt < 1300
  );

  const getPos = (nameOrId) => {
    if (nameOrId === 'Azrin') return [-2.5, 1.8, -2.0];
    if (nameOrId === 'Azrael') return [-2.5, 1.8, -0.8];
    
    const enemyIdx = combat.enemies.findIndex(e => e.id === nameOrId);
    if (enemyIdx !== -1) {
      const base = getEnemyPosition(enemyIdx);
      return [base[0], base[1] + 1.8, base[2]];
    }
    return [2.5, 2.0, -2.0];
  };

  // Direct 3D mesh click targeting triggers
  const handleAzrinClick = (e) => {
    e.stopPropagation();
    if (combat.isTargeting) {
      const skillId = combat.pendingAction?.details?.skillId;
      const itemId = combat.pendingAction?.details?.itemId;
      const isHeal = combat.pendingAction?.type === 'skill' && characters[activeUnit]?.skills.find(s => s.id === skillId)?.type === 'heal';
      const isHeroItem = combat.pendingAction?.type === 'item' && ['hp', 'mp', 'revive'].includes(inventory.find(i => i.id === itemId)?.valueType);
      
      if (isHeal || isHeroItem) {
        const isReviveItem = combat.pendingAction?.type === 'item' && inventory.find(i => i.id === itemId)?.valueType === 'revive';
        if (isReviveItem && characters.Azrin.hp <= 0) {
          selectTargetUnit('Azrin');
        } else if (!isReviveItem && characters.Azrin.hp > 0) {
          selectTargetUnit('Azrin');
        }
      }
    }
  };

  const handleAzraelClick = (e) => {
    e.stopPropagation();
    if (combat.isTargeting) {
      const skillId = combat.pendingAction?.details?.skillId;
      const itemId = combat.pendingAction?.details?.itemId;
      const isHeal = combat.pendingAction?.type === 'skill' && characters[activeUnit]?.skills.find(s => s.id === skillId)?.type === 'heal';
      const isHeroItem = combat.pendingAction?.type === 'item' && ['hp', 'mp', 'revive'].includes(inventory.find(i => i.id === itemId)?.valueType);
      
      if (isHeal || isHeroItem) {
        const isReviveItem = combat.pendingAction?.type === 'item' && inventory.find(i => i.id === itemId)?.valueType === 'revive';
        if (isReviveItem && characters.Azrael.hp <= 0) {
          selectTargetUnit('Azrael');
        } else if (!isReviveItem && characters.Azrael.hp > 0) {
          selectTargetUnit('Azrael');
        }
      }
    }
  };

  const handleEnemyClick = (e, enemyId, idx) => {
    e.stopPropagation();
    if (combat.isTargeting) {
      const skillId = combat.pendingAction?.details?.skillId;
      const itemId = combat.pendingAction?.details?.itemId;
      const isHeal = combat.pendingAction?.type === 'skill' && characters[activeUnit]?.skills.find(s => s.id === skillId)?.type === 'heal';
      const isHeroItem = combat.pendingAction?.type === 'item' && ['hp', 'mp', 'revive'].includes(inventory.find(i => i.id === itemId)?.valueType);
      
      if (!isHeal && !isHeroItem) {
        selectTargetUnit(enemyId);
        selectEnemyTarget(idx);
      }
    }
  };

  return (
    <group>
      {/* Grassy Arena Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, -1.5]}>
        <planeGeometry args={[26, 26]} />
        <meshStandardMaterial color="#4c6633" roughness={0.9} />
      </mesh>

      {/* Forest Clearing Enclosure Trees and Boulders */}
      <group position={[0, 0, -1.5]}>
        {/* Left side trees */}
        <group position={[-11, 0, -5]} scale={[1.2, 1.2, 1.2]}>
          <mesh position={[0, 0.5, 0]} castShadow><cylinderGeometry args={[0.1, 0.15, 1, 8]} /><meshStandardMaterial map={barkTex} roughness={0.9} /></mesh>
          <mesh position={[0, 1.4, 0]} castShadow><coneGeometry args={[0.8, 1.5, 8]} /><meshStandardMaterial map={leafTex} roughness={0.8} /></mesh>
        </group>
        <group position={[-10, 0, 4]} scale={[0.9, 0.9, 0.9]}>
          <mesh position={[0, 0.5, 0]} castShadow><cylinderGeometry args={[0.1, 0.15, 1, 8]} /><meshStandardMaterial map={barkTex} roughness={0.9} /></mesh>
          <mesh position={[0, 1.4, 0]} castShadow><coneGeometry args={[0.8, 1.5, 8]} /><meshStandardMaterial map={leafTex} roughness={0.8} /></mesh>
        </group>
        
        {/* Right side trees */}
        <group position={[11, 0, -3]} scale={[1.4, 1.4, 1.4]}>
          <mesh position={[0, 0.5, 0]} castShadow><cylinderGeometry args={[0.1, 0.15, 1, 8]} /><meshStandardMaterial map={barkTex} roughness={0.9} /></mesh>
          <mesh position={[0, 1.4, 0]} castShadow><coneGeometry args={[0.8, 1.5, 8]} /><meshStandardMaterial map={leafTex} roughness={0.8} /></mesh>
        </group>
        
        {/* Back side trees */}
        <group position={[-6, 0, -11]} scale={[1.1, 1.1, 1.1]}>
          <mesh position={[0, 0.5, 0]} castShadow><cylinderGeometry args={[0.1, 0.15, 1, 8]} /><meshStandardMaterial map={barkTex} roughness={0.9} /></mesh>
          <mesh position={[0, 1.4, 0]} castShadow><coneGeometry args={[0.8, 1.5, 8]} /><meshStandardMaterial map={leafTex} roughness={0.8} /></mesh>
        </group>
        <group position={[3, 0, -11]} scale={[1.3, 1.3, 1.3]}>
          <mesh position={[0, 0.5, 0]} castShadow><cylinderGeometry args={[0.1, 0.15, 1, 8]} /><meshStandardMaterial map={barkTex} roughness={0.9} /></mesh>
          <mesh position={[0, 1.4, 0]} castShadow><coneGeometry args={[0.8, 1.5, 8]} /><meshStandardMaterial map={leafTex} roughness={0.8} /></mesh>
        </group>
        
        {/* Boulders around edge */}
        <mesh position={[-8, 0.4, -9]} rotation={[0.2, 0.5, 0.1]} castShadow>
          <dodecahedronGeometry args={[0.9]} />
          <meshStandardMaterial map={stoneTex} color="#57534e" roughness={0.9} />
        </mesh>
        <mesh position={[8, 0.4, -9]} rotation={[0.1, -0.4, 0.3]} castShadow>
          <dodecahedronGeometry args={[0.8]} />
          <meshStandardMaterial map={stoneTex} color="#57534e" roughness={0.9} />
        </mesh>
      </group>

      {/* Stone Lantern Columns */}
      <group position={[0, 0, -1.5]}>
        <StoneColumn position={[-9, 0, -9]} rotationY={Math.PI / 4} stoneTex={stoneTex} />
        <StoneColumn position={[9, 0, -9]} rotationY={-Math.PI / 4} stoneTex={stoneTex} />
        <StoneColumn position={[-9, 0, 9]} rotationY={(3 * Math.PI) / 4} stoneTex={stoneTex} />
        <StoneColumn position={[9, 0, 9]} rotationY={-(3 * Math.PI) / 4} stoneTex={stoneTex} />
      </group>

      {/* HERO 1: Azrin (Middle) */}
      <group ref={azrinRef} position={[-2.5, 0.0, -2.0]} onClick={handleAzrinClick}>
        {/* Animated 3D Targeting Arrow */}
        {combat.isTargeting && combat.currentTargetUnit === 'Azrin' && (
          <mesh ref={azrinArrowRef} position={[0, 1.4, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.15, 0.45, 4]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
        )}
        {/* Animated floor targeting ring */}
        {combat.isTargeting && combat.currentTargetUnit === 'Azrin' && (
          <mesh ref={azrinRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
            <ringGeometry args={[0.5, 0.55, 32]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
        )}
        <AzrinModel
          materialRef={azrinMatRef}
        />
      </group>

      {/* HERO 2: Azrael (Right/Bottom) */}
      <group ref={azraelRef} position={[-2.5, 0.0, -0.8]} onClick={handleAzraelClick}>
        {/* Animated 3D Targeting Arrow */}
        {combat.isTargeting && combat.currentTargetUnit === 'Azrael' && (
          <mesh ref={azraelArrowRef} position={[0, 1.4, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.15, 0.45, 4]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
        )}
        {/* Animated floor targeting ring */}
        {combat.isTargeting && combat.currentTargetUnit === 'Azrael' && (
          <mesh ref={azraelRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
            <ringGeometry args={[0.5, 0.55, 32]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
        )}
        <AzraelModel
          materialRef={azraelMatRef}
        />
      </group>

      {/* ENEMIES */}
      {combat.enemies.map((enemy, idx) => {
        const basePos = getEnemyPosition(idx);
        const isTargeted = combat.isTargeting && enemy.hp > 0 && (combat.currentTargetUnit === enemy.id || combat.currentTargetUnit === 'all_enemies');

        return (
          <group 
            key={enemy.id} 
            ref={el => enemyRefs.current[idx] = el} 
            position={[basePos[0], 0.5, basePos[2]]} 
            onClick={(e) => {
              if (enemy.hp > 0) {
                handleEnemyClick(e, enemy.id, idx);
              }
            }}
          >
            {/* Animated 3D Targeting Arrow */}
            {isTargeted && (
              <mesh ref={el => enemyArrowRefs.current[idx] = el} position={[0, 1.6, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.18, 0.45, 4]} />
                <meshBasicMaterial color="#10b981" />
              </mesh>
            )}
            {/* Animated floor targeting ring */}
            {isTargeted && (
              <mesh ref={el => enemyRingRefs.current[idx] = el} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
                <ringGeometry args={[0.75, 0.81, 32]} />
                <meshBasicMaterial color="#10b981" transparent opacity={0.8} side={THREE.DoubleSide} />
              </mesh>
            )}
            <EnemyModel
              type={enemy.type}
              animVariant={idx}
              materialRef={el => enemyMatRefs.current[idx] = el}
            />
          </group>
        );
      })}

      {/* Blue Magic Crystal Explosion Particle Pool */}
      {Array.from({ length: 20 }).map((_, idx) => (
        <mesh
          key={`magic-part-${idx}`}
          ref={el => magicPartsRef.current[idx] = el}
          scale={[0, 0, 0]}
        >
          <octahedronGeometry args={[0.08]} />
          <meshBasicMaterial color="#00d2ff" transparent opacity={0.8} />
        </mesh>
      ))}

      {/* Green Healing Star Particle Pool */}
      {Array.from({ length: 20 }).map((_, idx) => (
        <mesh
          key={`heal-part-${idx}`}
          ref={el => healPartsRef.current[idx] = el}
          scale={[0, 0, 0]}
        >
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.8} />
        </mesh>
      ))}

      {/* Floating 3D Text Projections */}
      {activeFloatingTexts.map((txt) => (
        <Html
          key={txt.id}
          position={txt.position}
          center
        >
          <div className={`floating-combat-text combat-text-${txt.type}`}>
            {txt.text}
          </div>
        </Html>
      ))}
    </group>
  );
}
