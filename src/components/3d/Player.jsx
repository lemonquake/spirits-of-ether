import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import AzrinModel from './AzrinModel';
import AzraelModel from './AzraelModel';
import { getHeight, getFoliage } from '../../utils/terrain';

// Simple keyboard listener hook
function useKeyboard() {
  const keys = useRef({ w: false, a: false, s: false, d: false });
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') {
        useGameStore.getState().toggleMovementMode();
      }
      const key = e.key.toLowerCase();
      if (key in keys.current) keys.current[key] = true;
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) keys.current[key] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  return keys;
}

export default function Player({ playerRef }) {
  const keys = useKeyboard();
  const { camera } = useThree();
  
  const phase = useGameStore(state => state.phase);
  const setPlayerPosition = useGameStore(state => state.setPlayerPosition);
  const dialogueActive = useGameStore(state => state.dialogue?.active);
  
  // Stamina and speed states from global store
  const stamina = useGameStore(state => state.stamina);
  const maxStamina = useGameStore(state => state.maxStamina);
  const movementMode = useGameStore(state => state.movementMode);
  const isStaminaExhausted = useGameStore(state => state.isStaminaExhausted);
  
  // Follower character ref (Azrael following Azrin)
  const followerRef = useRef();
  const lastFollowerPos = useRef(new THREE.Vector3());
  
  // History of positions for trailing animation
  const trail = useRef([]);
  const MAX_TRAIL_LENGTH = 15;
  
  // Mana regeneration timer ref
  const manaRegenTimerRef = useRef(0);

  useFrame((state, delta) => {
    const isPaused = useGameStore.getState().isPaused;
    if (phase !== 'EXPLORING' || isPaused) return;

    // Mana Regeneration tick
    const hasManaRegen = Object.values(useGameStore.getState().characters).some(c => 
      c.skills.some(s => s.id === 'mana_regeneration')
    );
    if (hasManaRegen) {
      manaRegenTimerRef.current += delta;
      if (manaRegenTimerRef.current >= 3.0) {
        manaRegenTimerRef.current -= 3.0;
        
        const currentCharacters = useGameStore.getState().characters;
        const nextCharacters = { ...currentCharacters };
        let anyRegened = false;

        Object.keys(nextCharacters).forEach(name => {
          const char = nextCharacters[name];
          const regenSkill = char.skills.find(s => s.id === 'mana_regeneration');
          if (regenSkill && char.mp < char.maxMp && char.hp > 0) {
            const regenLevel = regenSkill.level || 1;
            nextCharacters[name] = {
              ...char,
              mp: Math.min(char.maxMp, char.mp + regenLevel)
            };
            anyRegened = true;
          }
        });

        if (anyRegened) {
          useGameStore.setState({ characters: nextCharacters });
        }
      }
    }

    const player = playerRef.current;
    if (!player) return;

    if (dialogueActive) {
      player.position.y = getHeight(player.position.x, player.position.z);
      if (followerRef.current) {
        followerRef.current.position.y = getHeight(followerRef.current.position.x, followerRef.current.position.z);
      }
      
      const time = state.clock.getElapsedTime();
      const playerIdleVariant = Math.floor(time / 6.0) % 4;
      const companionIdleVariant = Math.floor((time + 3.0) / 6.0) % 4;
      
      player.userData = {
        animState: 'idle',
        idleVariant: playerIdleVariant
      };
      if (followerRef.current) {
        followerRef.current.userData = {
          animState: 'idle',
          animStateName: 'idle',
          idleVariant: companionIdleVariant
        };
      }
      return;
    }

    const time = state.clock.getElapsedTime();

    // 1. Calculate input vector
    let inputX = 0; // horizontal (A/D)
    let inputZ = 0; // vertical (W/S)

    const controlSchemeNow = useGameStore.getState().controlScheme;
    if (controlSchemeNow === 'MOBILE') {
      const joystick = useGameStore.getState().joystick;
      if (joystick.x !== 0 || joystick.y !== 0) {
        inputX = joystick.x;
        inputZ = joystick.y;
      }
    } else {
      if (keys.current.w) inputZ += 1;
      if (keys.current.s) inputZ -= 1;
      
      if (keys.current.a) inputX -= 1; // A moves left
      if (keys.current.d) inputX += 1; // D moves right
    }

    // 2. Get camera vectors projected on XZ plane
    const camForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    camForward.y = 0;
    camForward.normalize();

    const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    camRight.y = 0;
    camRight.normalize();

    // 3. Compute target direction
    const moveDir = new THREE.Vector3()
      .addScaledVector(camForward, inputZ)
      .addScaledVector(camRight, inputX);

    const isMoving = moveDir.lengthSq() > 0.01;
    
    // 4. Handle stamina and speed states
    let targetSpeed = 5.5; // Walking speed
    let playerAnimState;
    
    let nextStamina;
    let nextExhausted = isStaminaExhausted;
    let nextMode = movementMode;

    if (controlSchemeNow === 'MOBILE' && isMoving) {
      const joystick = useGameStore.getState().joystick;
      const joystickLengthSq = joystick.x * joystick.x + joystick.y * joystick.y;
      if (joystickLengthSq > 0.56 && !nextExhausted) { // 0.75^2 = 0.5625
        nextMode = 'RUN';
      } else {
        nextMode = 'WALK';
      }
    }

    if (isMoving) {
      if (nextMode === 'RUN' && !nextExhausted) {
        targetSpeed = 10.0; // Running speed
        playerAnimState = 'run';
        // Drain stamina: lasts 4 seconds at 25/sec
        nextStamina = Math.max(0, stamina - 25 * delta);
        if (nextStamina <= 0) {
          nextExhausted = true;
          nextMode = 'WALK';
        }
      } else {
        targetSpeed = 5.5;
        playerAnimState = 'walk';
        // Recharge stamina slowly while walking
        nextStamina = Math.min(maxStamina, stamina + 12 * delta);
      }
    } else {
      playerAnimState = 'idle';
      // Recharge stamina faster when idle
      nextStamina = Math.min(maxStamina, stamina + 18 * delta);
    }

    // Recover from exhaustion threshold
    if (nextExhausted && nextStamina >= 25) {
      nextExhausted = false;
    }

    // Batch update store to keep UI in sync
    if (nextStamina !== stamina || nextExhausted !== isStaminaExhausted || nextMode !== movementMode) {
      useGameStore.setState({
        stamina: nextStamina,
        isStaminaExhausted: nextExhausted,
        movementMode: nextMode
      });
    }

    // 5. Move & Rotate Player
    if (isMoving) {
      moveDir.normalize();
      
      // Move player
      player.position.addScaledVector(moveDir, targetSpeed * delta);
      
      // Collision check against trees and rocks (Foliage)
      const obstacles = getFoliage();
      const playerRadius = 0.4;
      
      for (const item of obstacles) {
        if (!item.hasCollision) continue;
        
        const dx = player.position.x - item.x;
        const dz = player.position.z - item.z;
        const distSq = dx * dx + dz * dz;
        const minDist = item.collisionRadius + playerRadius;
        
        if (distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq);
          const pushX = dx / dist;
          const pushZ = dz / dist;
          
          // Relocate outside the collision radius
          player.position.x = item.x + pushX * minDist;
          player.position.z = item.z + pushZ * minDist;
        }
      }
      
      // Collision check against shop merchant base at [0, 4]
      const merchantX = 0;
      const merchantZ = 4;
      const dxMerchant = player.position.x - merchantX;
      const dzMerchant = player.position.z - merchantZ;
      const distSqMerchant = dxMerchant * dxMerchant + dzMerchant * dzMerchant;
      const minMerchantDist = 1.0 + playerRadius;
      if (distSqMerchant < minMerchantDist * minMerchantDist) {
        const distMerchant = Math.sqrt(distSqMerchant);
        const pushX = dxMerchant / distMerchant;
        const pushZ = dzMerchant / distMerchant;
        player.position.x = merchantX + pushX * minMerchantDist;
        player.position.z = merchantZ + pushZ * minMerchantDist;
      }

      // Collision check against Huts
      const huts = [
        { x: -15, z: 25, radius: 1.25 },
        { x: -6, z: 26, radius: 1.1 }
      ];
      for (const hut of huts) {
        const dx = player.position.x - hut.x;
        const dz = player.position.z - hut.z;
        const distSq = dx * dx + dz * dz;
        const minDist = hut.radius + playerRadius;
        
        if (distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq);
          const pushX = dx / dist;
          const pushZ = dz / dist;
          player.position.x = hut.x + pushX * minDist;
          player.position.z = hut.z + pushZ * minDist;
        }
      }
      
      // Keep inside bounds of our overworld map
      player.position.x = Math.max(-55, Math.min(55, player.position.x));
      player.position.z = Math.max(-55, Math.min(31.0, player.position.z));

      // Rotate player smoothly towards movement direction
      const targetRotation = Math.atan2(moveDir.x, moveDir.z);
      const currentRotation = player.rotation.y;
      let diff = targetRotation - currentRotation;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      player.rotation.y += diff * 0.15;
    }

    // Ground the player
    player.position.y = getHeight(player.position.x, player.position.z);

    // Save player position to global store for UI positioning & saving
    setPlayerPosition([player.position.x, player.position.y, player.position.z]);

    // 6. Follower logic (Azrael trailing Azrin)
    if (followerRef.current) {
      const follower = followerRef.current;
      
      // Update trail history only if the player has moved significantly from the last record
      const currentPos = new THREE.Vector3().copy(player.position);
      const lastTrailPoint = trail.current[trail.current.length - 1];
      if (!lastTrailPoint || currentPos.distanceTo(lastTrailPoint) > 0.15) {
        trail.current.push(currentPos);
        if (trail.current.length > MAX_TRAIL_LENGTH) {
          trail.current.shift();
        }
      }

      if (trail.current.length > 0) {
        // Target is some frames behind
        const targetFollowPos = trail.current[0];
        follower.position.lerp(targetFollowPos, 0.12);
      }

      // Hard circle-circle collision check between Azrin (player) and Azrael (follower)
      const minDistance = 1.2;
      const collisionVec = new THREE.Vector3().subVectors(follower.position, player.position);
      collisionVec.y = 0; // lock to XZ plane
      const dist = collisionVec.length();
      
      if (dist < minDistance) {
        if (dist > 0.001) {
          collisionVec.normalize().multiplyScalar(minDistance);
        } else {
          // fallback direction if exact overlap
          collisionVec.set(0, 0, minDistance);
        }
        follower.position.copy(player.position).add(collisionVec);
      }

      // Point follower towards the player
      const followDir = new THREE.Vector3().subVectors(player.position, follower.position);
      if (followDir.lengthSq() > 0.05) {
        const followRot = Math.atan2(followDir.x, followDir.z);
        let fDiff = followRot - follower.rotation.y;
        while (fDiff < -Math.PI) fDiff += Math.PI * 2;
        while (fDiff > Math.PI) fDiff -= Math.PI * 2;
        follower.rotation.y += fDiff * 0.15;
      }
      
      // Ground the follower
      follower.position.y = getHeight(follower.position.x, follower.position.z);
    }

    // Determine companion's animation state based on actual movement speed
    let companionAnimState = 'idle';
    if (followerRef.current) {
      const currentFollowerPos = followerRef.current.position;
      const movedDist = lastFollowerPos.current.distanceTo(currentFollowerPos);
      const followerMoving = movedDist > 0.015;
      lastFollowerPos.current.copy(currentFollowerPos);
      
      if (followerMoving) {
        companionAnimState = (movementMode === 'RUN' && !isStaminaExhausted) ? 'run' : 'walk';
      }
    }

    // Offset idle variants so they look natural
    const playerIdleVariant = Math.floor(time / 6.0) % 4;
    const companionIdleVariant = Math.floor((time + 3.0) / 6.0) % 4;

    // Attach animation variables to the refs so we can pass them to children
    playerRef.current.userData = {
      animState: playerAnimState,
      idleVariant: playerIdleVariant
    };
    if (followerRef.current) {
      followerRef.current.userData = {
        animState: companionAnimState,
        idleVariant: companionIdleVariant
      };
    }
  });

  return (
    <>
      {/* Azrin - Player character container (handles movement/physics) */}
      <group ref={playerRef} position={[0, 0, 0]}>
        <AzrinModel />
        
        {/* Floating 3D Overworld Stamina Bar */}
        {stamina < maxStamina && (
          <Html position={[0, 1.45, 0]} center distanceFactor={5}>
            <div style={{
              width: '45px',
              height: '5px',
              background: 'rgba(0,0,0,0.65)',
              borderRadius: '3px',
              padding: '1px',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 0 8px rgba(0,0,0,0.5)',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(stamina / maxStamina) * 100}%`,
                height: '100%',
                background: isStaminaExhausted 
                  ? 'linear-gradient(90deg, #ef4444, #f87171)' 
                  : 'linear-gradient(90deg, #10b981, #34d399)',
                borderRadius: '2px',
                transition: 'width 0.05s linear'
              }}></div>
            </div>
          </Html>
        )}
      </group>

      {/* Azrael - Follower character */}
      <group ref={followerRef} position={[-0.8, 0, 1]}>
        <AzraelModel />
      </group>
    </>
  );
}
