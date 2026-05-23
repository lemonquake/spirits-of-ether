import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const lerpEuler = (euler, tx, ty, tz, alpha) => {
  euler.x = THREE.MathUtils.lerp(euler.x, tx, alpha);
  euler.y = THREE.MathUtils.lerp(euler.y, ty, alpha);
  euler.z = THREE.MathUtils.lerp(euler.z, tz, alpha);
};

export default function EnemyModel({
  type = 'slime', // 'slime' | 'skeleton_grunt' | 'finster_krab' | 'torchoise' | 'sand_snake'
  animationState: propAnimationState = 'idle',
  animVariant: propAnimVariant = 0,
  animProgress: propAnimProgress = 0,
  materialRef = null
}) {
  const modelRef = useRef();
  
  // Slime refs
  const slimeBodyRef = useRef();
  const slimeCoreRef = useRef();
  const slimeShieldRef = useRef();
  
  // Skeleton refs
  const bodyRef = useRef();
  const headRef = useRef();
  const torsoRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const swordRef = useRef();
  const shieldRef = useRef();

  // Finster Krab refs
  const krabBodyRef = useRef();
  const leftClawArmRef = useRef();
  const rightClawArmRef = useRef();
  const leftClawUpperRef = useRef();
  const leftClawLowerRef = useRef();
  const rightClawUpperRef = useRef();
  const rightClawLowerRef = useRef();
  const krabLegsRef = useRef([]);

  // Torchoise refs
  const tortoiseBodyRef = useRef();
  const tortoiseShellRef = useRef();
  const tortoiseHeadRef = useRef();
  const tortoiseFlameRef = useRef();
  const tortoiseLegsRef = useRef([]);

  // Sand Snake refs
  const snakeSegmentsRef = useRef([]);

  useFrame((state) => {
    if (!modelRef.current) return;

    const time = state.clock.getElapsedTime();

    // Read synced animation details from parent's userData if available
    let animationState = propAnimationState;
    let animVariant = propAnimVariant;
    let animProgress = propAnimProgress;

    if (modelRef.current.parent && modelRef.current.parent.userData && modelRef.current.parent.userData.animState) {
      animationState = modelRef.current.parent.userData.animState;
      animVariant = modelRef.current.parent.userData.animVariant !== undefined ? modelRef.current.parent.userData.animVariant : propAnimVariant;
      animProgress = modelRef.current.parent.userData.animProgress !== undefined ? modelRef.current.parent.userData.animProgress : propAnimProgress;
    }

    const progress = animProgress || (time % 1.2);
    const duration = 1.2;
    const t = Math.min(progress / duration, 1.0);

    // Reset model base rotations/scales
    modelRef.current.rotation.set(0, 0, 0);
    modelRef.current.scale.set(1, 1, 1);

    // ==========================================
    // 1. SLIME ANIMATIONS
    // ==========================================
    if (type === 'slime') {
      if (!slimeBodyRef.current || !slimeCoreRef.current) return;

      slimeBodyRef.current.scale.set(1.0, 1.0, 1.0);
      slimeBodyRef.current.position.set(0, 0, 0);
      slimeBodyRef.current.rotation.set(0, 0, 0);
      slimeCoreRef.current.position.set(0, 0.05, 0);
      slimeCoreRef.current.scale.set(1, 1, 1);
      
      if (slimeShieldRef.current) {
        slimeShieldRef.current.scale.set(0.001, 0.001, 0.001);
        slimeShieldRef.current.visible = false;
      }

      if (animationState === 'idle') {
        const breathe = Math.sin(time * 3.0 + animVariant) * 0.05;
        slimeBodyRef.current.scale.y = 1.0 + breathe;
        slimeBodyRef.current.scale.x = 1.0 - breathe * 0.6;
        slimeBodyRef.current.scale.z = 1.0 - breathe * 0.6;
        slimeCoreRef.current.position.y = 0.05 + Math.sin(time * 4) * 0.03;
      } else if (animationState === 'walk') {
        const cycle = time * 7.5;
        const hop = Math.max(0, Math.sin(cycle)) * 0.45;
        slimeBodyRef.current.position.y = hop;
        if (hop > 0.05) {
          slimeBodyRef.current.scale.y = 1.15;
          slimeBodyRef.current.scale.x = 0.92;
          slimeBodyRef.current.scale.z = 0.92;
        } else {
          const squash = Math.sin(cycle) * 0.15;
          slimeBodyRef.current.scale.y = 1.0 + squash;
          slimeBodyRef.current.scale.x = 1.0 - squash * 0.5;
          slimeBodyRef.current.scale.z = 1.0 - squash * 0.5;
        }
        slimeCoreRef.current.position.y = 0.05 + hop * 0.2;
      } else if (animationState === 'hit') {
        const hitT = progress / 0.8;
        let recoil = hitT < 0.25 ? (hitT / 0.25) * 0.4 : (1.0 - (hitT - 0.25) / 0.75) * 0.4;
        slimeBodyRef.current.position.z = -recoil * 0.8;
        slimeBodyRef.current.scale.y = 1.0 - recoil * 0.8;
        slimeBodyRef.current.scale.x = 1.0 + recoil * 0.6;
        slimeBodyRef.current.scale.z = 1.0 + recoil * 0.6;
        slimeBodyRef.current.position.x = Math.sin(time * 50) * 0.06 * recoil;
      } else if (animationState === 'attack') {
        if (t < 0.3) {
          const phase = t / 0.3;
          slimeBodyRef.current.scale.y = 1.0 - phase * 0.35;
          slimeBodyRef.current.scale.x = 1.0 + phase * 0.25;
          slimeBodyRef.current.scale.z = 1.0 + phase * 0.25;
        } else if (t < 0.6) {
          slimeBodyRef.current.scale.y = 1.25;
          slimeBodyRef.current.scale.x = 0.85;
          slimeBodyRef.current.scale.z = 0.85;
          slimeBodyRef.current.rotation.x = -0.3;
        } else {
          const phase = (t - 0.6) / 0.6;
          const bounce = Math.sin(phase * Math.PI) * 0.25;
          slimeBodyRef.current.scale.y = 1.0 - bounce;
          slimeBodyRef.current.scale.x = 1.0 + bounce * 0.5;
          slimeBodyRef.current.scale.z = 1.0 + bounce * 0.5;
        }
      } else if (animationState === 'def') {
        const tremble = Math.sin(time * 45) * 0.02;
        slimeBodyRef.current.scale.set(1.2 + tremble, 1.2 + tremble, 1.2 + tremble);
        if (slimeShieldRef.current) {
          slimeShieldRef.current.visible = true;
          const shieldScale = Math.min(1.0, progress / 0.4) * 1.45;
          slimeShieldRef.current.scale.set(shieldScale, shieldScale, shieldScale);
        }
      } else if (animationState === 'spell') {
        if (t < 0.4) {
          const phase = t / 0.4;
          slimeBodyRef.current.scale.y = 1.0 + phase * 0.3;
          slimeBodyRef.current.scale.x = 1.0 - phase * 0.15;
          slimeBodyRef.current.scale.z = 1.0 - phase * 0.15;
          slimeBodyRef.current.position.y = phase * 0.15;
        } else if (t < 0.75) {
          slimeBodyRef.current.scale.y = 0.7;
          slimeBodyRef.current.scale.x = 1.25;
          slimeBodyRef.current.scale.z = 1.25;
          slimeBodyRef.current.position.y = -0.1;
          slimeBodyRef.current.rotation.x = 0.45;
        } else {
          const phase = (t - 0.75) / 0.45;
          slimeBodyRef.current.scale.y = 0.7 + phase * 0.3;
          slimeBodyRef.current.scale.x = 1.25 - phase * 0.25;
          slimeBodyRef.current.scale.z = 1.25 - phase * 0.25;
        }
      } else if (animationState === 'dying' || animationState === 'dead') {
        const meltT = animationState === 'dead' ? 1.0 : Math.min(progress / 1.0, 1.0);
        slimeBodyRef.current.scale.y = Math.max(0.04, 1.0 - meltT * 0.96);
        slimeBodyRef.current.scale.x = 1.0 + meltT * 0.6;
        slimeBodyRef.current.scale.z = 1.0 + meltT * 0.6;
        slimeBodyRef.current.position.y = -0.36 * meltT;
        slimeCoreRef.current.scale.set(1.0 - meltT * 0.9, 1.0 - meltT * 0.9, 1.0 - meltT * 0.9);
      }
    }

    // ==========================================
    // 2. SKELETON GRUNT ANIMATIONS
    // ==========================================
    else if (type === 'skeleton_grunt') {
      if (!bodyRef.current || !headRef.current || !torsoRef.current ||
          !leftArmRef.current || !rightArmRef.current || 
          !leftLegRef.current || !rightLegRef.current ||
          !swordRef.current || !shieldRef.current) return;

      bodyRef.current.position.set(0, 0.4, 0);
      bodyRef.current.rotation.set(0, 0, 0);
      headRef.current.position.set(0, 0.65, 0);
      headRef.current.rotation.set(0, 0, 0);
      torsoRef.current.rotation.set(0, 0, 0);
      torsoRef.current.position.set(0, 0.2, 0);
      leftArmRef.current.position.set(-0.25, 0.45, 0);
      leftArmRef.current.rotation.set(0.15, 0, 0.25);
      rightArmRef.current.position.set(0.25, 0.45, 0);
      rightArmRef.current.rotation.set(0.25, 0, -0.2);
      leftLegRef.current.position.set(-0.12, -0.15, 0);
      leftLegRef.current.rotation.set(0, 0, 0);
      rightLegRef.current.position.set(0.12, -0.15, 0);
      rightLegRef.current.rotation.set(0, 0, 0);
      swordRef.current.position.set(0.08, -0.22, 0.15);
      swordRef.current.rotation.set(0.8, -0.2, -0.1);
      shieldRef.current.position.set(-0.12, -0.15, 0.12);
      shieldRef.current.rotation.set(0.0, 0.5, 0.0);

      if (animationState === 'dead') {
        bodyRef.current.position.y = -0.32;
        bodyRef.current.position.z = -0.1;
        bodyRef.current.rotation.x = -Math.PI / 2.1;
        bodyRef.current.rotation.z = 0.5;
        headRef.current.position.set(0.3, -0.1, 0.1);
        headRef.current.rotation.set(0.5, 0.8, -1.0);
        leftArmRef.current.position.set(-0.5, -0.1, -0.2);
        leftArmRef.current.rotation.set(0.3, -1.2, -0.5);
        rightArmRef.current.position.set(0.6, -0.1, 0.2);
        rightArmRef.current.rotation.set(-0.3, 1.2, 0.5);
        leftLegRef.current.position.set(-0.3, -0.2, -0.4);
        leftLegRef.current.rotation.set(-1.0, 0.2, -0.3);
        rightLegRef.current.position.set(0.2, -0.2, -0.5);
        rightLegRef.current.rotation.set(-1.2, -0.2, 0.3);
        swordRef.current.position.set(0.8, -0.25, -0.1);
        swordRef.current.rotation.set(0.1, 0.6, 1.4);
        shieldRef.current.position.set(-0.7, -0.2, 0.3);
        shieldRef.current.rotation.set(1.5, 0.1, 0.4);
        return;
      }

      if (animationState === 'dying') {
        const fallT = Math.min(progress / 1.0, 1.0);
        bodyRef.current.position.y = 0.4 - fallT * 0.72;
        bodyRef.current.position.z = -fallT * 0.1;
        bodyRef.current.rotation.x = -fallT * (Math.PI / 2.1);
        bodyRef.current.rotation.z = fallT * 0.5;
        headRef.current.position.x = fallT * 0.3;
        headRef.current.position.y = 0.65 - fallT * 0.75;
        headRef.current.rotation.y = fallT * 0.8;
        leftArmRef.current.position.x = -0.25 - fallT * 0.25;
        leftArmRef.current.rotation.z = 0.25 - fallT * 0.75;
        rightArmRef.current.position.x = 0.25 + fallT * 0.35;
        rightArmRef.current.rotation.z = -0.2 - fallT * 0.5;
        leftLegRef.current.position.z = -fallT * 0.4;
        leftLegRef.current.rotation.x = -fallT * 1.0;
        rightLegRef.current.position.z = -fallT * 0.5;
        rightLegRef.current.rotation.x = -fallT * 1.2;
        swordRef.current.position.x = 0.08 + fallT * 0.72;
        swordRef.current.position.y = -0.22 - fallT * 0.03;
        swordRef.current.rotation.z = -0.1 + fallT * 1.5;
        shieldRef.current.position.x = -0.12 - fallT * 0.58;
        shieldRef.current.rotation.x = fallT * 1.5;
        return;
      }

      if (animationState === 'idle') {
        const jitter = Math.sin(time * 25.0) * 0.012;
        const breathe = Math.sin(time * 2.2) * 0.015;
        bodyRef.current.position.y = 0.4 + breathe;
        headRef.current.rotation.y = jitter * 1.5;
        headRef.current.rotation.x = 0.05 + breathe * 0.5;
        torsoRef.current.rotation.z = Math.sin(time * 3.5) * 0.02;
        leftArmRef.current.rotation.z = 0.25 + jitter;
        rightArmRef.current.rotation.z = -0.2 - jitter;
        leftLegRef.current.rotation.z = Math.sin(time * 1.2) * 0.015;
        rightLegRef.current.rotation.z = -Math.sin(time * 1.2) * 0.015;
      } else if (animationState === 'walk') {
        const speedMultiplier = 11.0;
        const cycle = time * speedMultiplier;
        bodyRef.current.position.y = 0.4 + Math.abs(Math.sin(cycle * 2)) * 0.06;
        bodyRef.current.rotation.y = Math.sin(cycle) * 0.06;
        leftLegRef.current.rotation.x = Math.sin(cycle) * 0.5;
        rightLegRef.current.rotation.x = -Math.sin(cycle) * 0.5;
        leftArmRef.current.rotation.x = 0.15 - Math.sin(cycle) * 0.35;
        rightArmRef.current.rotation.x = 0.25 + Math.sin(cycle) * 0.45;
        headRef.current.rotation.y = Math.cos(cycle) * 0.1;
        headRef.current.position.y = 0.65 + Math.sin(cycle * 2) * 0.02;
      } else if (animationState === 'hit') {
        const hitT = progress / 0.8;
        let recoil = hitT < 0.2 ? (hitT / 0.2) * 0.5 : (1.0 - (hitT - 0.2) / 0.8) * 0.5;
        bodyRef.current.position.z = -recoil * 0.8;
        bodyRef.current.rotation.x = -recoil * 0.35;
        headRef.current.rotation.x = -recoil * 0.6;
        headRef.current.position.y = 0.65 + recoil * 0.1;
        leftArmRef.current.rotation.z = 0.25 + recoil * 1.2;
        rightArmRef.current.rotation.z = -0.2 - recoil * 1.2;
      } else if (animationState === 'attack') {
        if (t < 0.35) {
          const phase = t / 0.35;
          rightArmRef.current.rotation.set(-2.0 * phase, 0, -0.6 * phase);
          swordRef.current.rotation.set(1.5 * phase, -0.2, -0.1);
          bodyRef.current.rotation.y = -0.3 * phase;
          bodyRef.current.rotation.x = -0.1 * phase;
        } else if (t < 0.6) {
          const phase = (t - 0.35) / 0.25;
          rightArmRef.current.rotation.set(-2.0 + 2.5 * phase, 0, -0.6 + 0.4 * phase);
          swordRef.current.rotation.set(1.5 - 2.5 * phase, -0.2, -0.1);
          bodyRef.current.rotation.y = -0.3 + 0.6 * phase;
          bodyRef.current.rotation.x = -0.1 + 0.35 * phase;
        } else {
          const phase = (t - 0.6) / 0.6;
          lerpEuler(rightArmRef.current.rotation, 0.25, 0, -0.2, phase);
          lerpEuler(swordRef.current.rotation, 0.8, -0.2, -0.1, phase);
          bodyRef.current.rotation.y = 0.3 * (1.0 - phase);
          bodyRef.current.rotation.x = 0.25 * (1.0 - phase);
        }
      } else if (animationState === 'def') {
        bodyRef.current.position.y = 0.32;
        bodyRef.current.rotation.y = -0.45;
        leftArmRef.current.rotation.set(-0.8, 0.7, 0.1);
        shieldRef.current.rotation.set(0.0, 0.8, 0.0);
        headRef.current.rotation.x = 0.15;
      } else if (animationState === 'spell') {
        if (t < 0.45) {
          const phase = t / 0.45;
          rightArmRef.current.rotation.set(-2.4 * phase, 0, 0);
          swordRef.current.rotation.set(2.8 * phase, 0, 0);
          headRef.current.rotation.x = -0.45 * phase;
          bodyRef.current.position.y = 0.4 + phase * 0.1;
        } else if (t < 0.8) {
          const shiver = Math.sin(time * 50) * 0.025;
          rightArmRef.current.rotation.set(-2.4 + shiver, shiver, 0);
          headRef.current.rotation.x = -0.45 + shiver;
          bodyRef.current.position.y = 0.5 + shiver;
        } else {
          const phase = (t - 0.8) / 0.4;
          lerpEuler(rightArmRef.current.rotation, 0.25, 0, -0.2, phase);
          lerpEuler(swordRef.current.rotation, 0.8, -0.2, -0.1, phase);
          headRef.current.rotation.x = -0.45 * (1.0 - phase);
          bodyRef.current.position.y = 0.5 - phase * 0.1;
        }
      }
    }

    // ==========================================
    // 3. FINSTER KRAB ANIMATIONS
    // ==========================================
    else if (type === 'finster_krab') {
      if (!krabBodyRef.current || !leftClawArmRef.current || !rightClawArmRef.current ||
          !leftClawUpperRef.current || !leftClawLowerRef.current ||
          !rightClawUpperRef.current || !rightClawLowerRef.current) return;

      // Reset Defaults
      krabBodyRef.current.position.set(0, 0.05, 0);
      krabBodyRef.current.rotation.set(0, 0, 0);
      
      leftClawArmRef.current.position.set(-0.35, 0.05, 0.2);
      leftClawArmRef.current.rotation.set(0, 0.2, 0);
      leftClawUpperRef.current.rotation.z = 0.25;
      leftClawLowerRef.current.rotation.z = -0.25;
      
      rightClawArmRef.current.position.set(0.35, 0.05, 0.2);
      rightClawArmRef.current.rotation.set(0, -0.2, 0);
      rightClawUpperRef.current.rotation.z = -0.25;
      rightClawLowerRef.current.rotation.z = 0.25;

      // Leg resets
      krabLegsRef.current.forEach((leg, i) => {
        if (!leg) return;
        const side = i < 3 ? -1 : 1; // Left or Right
        const zOffset = (i % 3) * 0.15 - 0.15;
        leg.position.set(side * 0.38, -0.05, zOffset);
        leg.rotation.set(0, 0, side * 0.35);
      });

      // Walk sideways! Crab turns 90 degrees and walks
      if (animationState === 'walk') {
        krabBodyRef.current.rotation.y = Math.PI / 2.0; // face sideways
        const walkCycle = time * 12.0;
        krabBodyRef.current.position.y = 0.05 + Math.abs(Math.sin(walkCycle)) * 0.05;
        
        krabLegsRef.current.forEach((leg, i) => {
          if (!leg) return;
          const legIdx = i % 3;
          const phaseOffset = legIdx * 1.5;
          leg.rotation.x = Math.sin(walkCycle + phaseOffset) * 0.45;
        });

        // Snap claws slightly while running
        const clamp = Math.abs(Math.sin(time * 5.0)) * 0.15;
        leftClawUpperRef.current.rotation.z = 0.25 - clamp;
        leftClawLowerRef.current.rotation.z = -0.25 + clamp;
        rightClawUpperRef.current.rotation.z = -0.25 + clamp;
        rightClawLowerRef.current.rotation.z = 0.25 - clamp;
      }
      
      // Idle clacking
      else if (animationState === 'idle') {
        const breathe = Math.sin(time * 2.5) * 0.02;
        krabBodyRef.current.position.y = 0.05 + breathe;
        
        // Gentle eye stalk bobbing
        const clack = Math.abs(Math.sin(time * 3.5)) * 0.12;
        leftClawUpperRef.current.rotation.z = 0.25 - clack;
        leftClawLowerRef.current.rotation.z = -0.25 + clack;
        rightClawUpperRef.current.rotation.z = -0.25 + clack;
        rightClawLowerRef.current.rotation.z = 0.25 - clack;
      }
      
      // Hit state
      else if (animationState === 'hit') {
        const hitT = progress / 0.8;
        let recoil = hitT < 0.2 ? (hitT / 0.2) * 0.4 : (1.0 - (hitT - 0.2) / 0.8) * 0.4;
        krabBodyRef.current.position.z = -recoil * 0.6;
        krabBodyRef.current.position.y = 0.05 + recoil * 0.1;
        krabBodyRef.current.rotation.x = -recoil * 0.4;
        
        // Claws open wide in pain
        leftClawUpperRef.current.rotation.z = 0.6;
        leftClawLowerRef.current.rotation.z = -0.6;
        rightClawUpperRef.current.rotation.z = -0.6;
        rightClawLowerRef.current.rotation.z = 0.6;
      }
      
      // Attack state (pincer snap)
      else if (animationState === 'attack') {
        if (t < 0.3) {
          // Claws pull back, open wide
          const phase = t / 0.3;
          leftClawArmRef.current.rotation.set(-0.25 * phase, 0.4 * phase, 0);
          rightClawArmRef.current.rotation.set(-0.25 * phase, -0.4 * phase, 0);
          leftClawUpperRef.current.rotation.z = 0.25 + 0.4 * phase;
          leftClawLowerRef.current.rotation.z = -0.25 - 0.4 * phase;
          rightClawUpperRef.current.rotation.z = -0.25 - 0.4 * phase;
          rightClawLowerRef.current.rotation.z = 0.25 + 0.4 * phase;
        } else if (t < 0.55) {
          // Snap closed, lunging forward
          const phase = (t - 0.3) / 0.25;
          leftClawArmRef.current.position.z = 0.2 + 0.3 * phase;
          rightClawArmRef.current.position.z = 0.2 + 0.3 * phase;
          
          leftClawUpperRef.current.rotation.z = -0.05;
          leftClawLowerRef.current.rotation.z = 0.05;
          rightClawUpperRef.current.rotation.z = 0.05;
          rightClawLowerRef.current.rotation.z = -0.05;
        } else {
          // Recover
          const phase = (t - 0.55) / 0.65;
          leftClawArmRef.current.position.z = 0.5 - 0.3 * phase;
          rightClawArmRef.current.position.z = 0.5 - 0.3 * phase;
          lerpEuler(leftClawArmRef.current.rotation, 0, 0.2, 0, phase);
          lerpEuler(rightClawArmRef.current.rotation, 0, -0.2, 0, phase);
        }
      }
      
      // Def state (tuck in behind pincers)
      else if (animationState === 'def') {
        krabBodyRef.current.position.y = -0.02; // lower down
        
        // Claws fold in front of face
        leftClawArmRef.current.rotation.set(0.2, 0.8, -0.4);
        rightClawArmRef.current.rotation.set(0.2, -0.8, 0.4);
        
        leftClawUpperRef.current.rotation.z = 0.05;
        leftClawLowerRef.current.rotation.z = -0.05;
        rightClawUpperRef.current.rotation.z = -0.05;
        rightClawLowerRef.current.rotation.z = 0.05;
      }
      
      // Spell state (foam bubbles, arms waving)
      else if (animationState === 'spell') {
        const waving = Math.sin(time * 25.0) * 0.12;
        leftClawArmRef.current.rotation.set(-0.8 + waving, 0.2, waving);
        rightClawArmRef.current.rotation.set(-0.8 - waving, -0.2, -waving);
        
        leftClawUpperRef.current.rotation.z = 0.4 + waving;
        leftClawLowerRef.current.rotation.z = -0.4 - waving;
        rightClawUpperRef.current.rotation.z = -0.4 - waving;
        rightClawLowerRef.current.rotation.z = 0.4 + waving;
      }
      
      // Dying/Dead (Flip on back and legs curl up)
      else if (animationState === 'dying' || animationState === 'dead') {
        const fallT = animationState === 'dead' ? 1.0 : Math.min(progress / 1.0, 1.0);
        krabBodyRef.current.rotation.z = fallT * Math.PI; // roll over
        krabBodyRef.current.position.y = 0.05 + fallT * 0.25 - (fallT * 0.25); // bump and settle
        
        // Claws open dead-limp
        leftClawUpperRef.current.rotation.z = 0.55 * fallT;
        leftClawLowerRef.current.rotation.z = -0.55 * fallT;
        rightClawUpperRef.current.rotation.z = -0.55 * fallT;
        rightClawLowerRef.current.rotation.z = 0.55 * fallT;
        
        // Legs curl in
        krabLegsRef.current.forEach((leg, i) => {
          if (!leg) return;
          const side = i < 3 ? -1 : 1;
          leg.rotation.z = side * (0.35 - fallT * 0.7);
        });
      }
    }

    // ==========================================
    // 4. TORCHOISE ANIMATIONS
    // ==========================================
    else if (type === 'torchoise') {
      if (!tortoiseBodyRef.current || !tortoiseShellRef.current || !tortoiseHeadRef.current || !tortoiseFlameRef.current) return;

      // Reset Defaults
      tortoiseBodyRef.current.position.set(0, 0.02, 0);
      tortoiseBodyRef.current.rotation.set(0, 0, 0);
      tortoiseHeadRef.current.position.set(0, 0.12, 0.36);
      tortoiseHeadRef.current.rotation.set(0, 0, 0);
      tortoiseFlameRef.current.scale.set(1.0, 1.0, 1.0);
      
      // Flickering flame mesh
      const flameScaleX = 0.85 + Math.sin(time * 30.0) * 0.15;
      const flameScaleY = 1.0 + Math.cos(time * 25.0) * 0.25;
      tortoiseFlameRef.current.scale.set(flameScaleX, flameScaleY, flameScaleX);

      // Leg resets
      tortoiseLegsRef.current.forEach((leg, i) => {
        if (!leg) return;
        const side = (i === 0 || i === 2) ? -1 : 1; // Left or Right
        const fb = (i < 2) ? 1 : -1; // Front or Back
        leg.position.set(side * 0.36, -0.05, fb * 0.32);
        leg.rotation.set(0, 0, 0);
      });

      // Walk cycle
      if (animationState === 'walk') {
        const crawlCycle = time * 4.5;
        tortoiseBodyRef.current.position.y = 0.02 + Math.abs(Math.sin(crawlCycle * 2)) * 0.03;
        tortoiseHeadRef.current.position.z = 0.36 + Math.sin(crawlCycle) * 0.05; // head bobs in and out
        
        tortoiseLegsRef.current.forEach((leg, i) => {
          if (!leg) return;
          const offset = i * Math.PI / 2.0;
          leg.rotation.x = Math.sin(crawlCycle + offset) * 0.35;
        });
      }
      
      // Idle state
      else if (animationState === 'idle') {
        const breathe = Math.sin(time * 1.8) * 0.01;
        tortoiseBodyRef.current.position.y = 0.02 + breathe;
        tortoiseHeadRef.current.position.y = 0.12 + breathe * 0.8;
      }
      
      // Hit state (withdraw quickly)
      else if (animationState === 'hit') {
        const hitT = progress / 0.8;
        let recoil = hitT < 0.2 ? (hitT / 0.2) * 0.5 : (1.0 - (hitT - 0.2) / 0.8) * 0.5;
        
        tortoiseHeadRef.current.position.z = 0.36 - recoil * 0.32; // retract head
        tortoiseHeadRef.current.position.y = 0.12 - recoil * 0.08;
        tortoiseBodyRef.current.position.z = -recoil * 0.4;
      }
      
      // Attack state (neck lunge headbutt)
      else if (animationState === 'attack') {
        if (t < 0.3) {
          // Pull head back in preparation
          const phase = t / 0.3;
          tortoiseHeadRef.current.position.z = 0.36 - phase * 0.2;
          tortoiseHeadRef.current.position.y = 0.12 - phase * 0.05;
        } else if (t < 0.55) {
          // Lunge head forward quickly
          const phase = (t - 0.3) / 0.25;
          tortoiseHeadRef.current.position.z = 0.16 + 0.42 * phase;
          tortoiseHeadRef.current.rotation.x = -0.15 * phase;
        } else {
          // Recover
          const phase = (t - 0.55) / 0.65;
          tortoiseHeadRef.current.position.z = 0.58 - 0.22 * phase;
          tortoiseHeadRef.current.rotation.x = -0.15 * (1.0 - phase);
        }
      }
      
      // Def state (withdraw into shell, volcanic shell glow)
      else if (animationState === 'def') {
        // Fully retract limbs
        tortoiseHeadRef.current.position.z = 0.05;
        tortoiseHeadRef.current.position.y = 0.04;
        
        tortoiseLegsRef.current.forEach((leg, i) => {
          if (!leg) return;
          const side = (i === 0 || i === 2) ? -1 : 1;
          leg.rotation.z = side * -0.6; // fold inside
        });
      }
      
      // Spell state (flame eruption)
      else if (animationState === 'spell') {
        if (t < 0.45) {
          // Swell shell, head raises
          const phase = t / 0.45;
          tortoiseHeadRef.current.position.y = 0.12 + phase * 0.1;
          tortoiseHeadRef.current.rotation.x = -0.25 * phase;
          tortoiseFlameRef.current.scale.set(1.0 + phase * 1.5, 1.0 + phase * 2.0, 1.0 + phase * 1.5);
        } else if (t < 0.85) {
          // Tremble in high flame state
          const shiver = Math.sin(time * 50) * 0.02;
          tortoiseFlameRef.current.scale.set(2.5 + shiver, 3.0 + Math.cos(time * 40)*0.5, 2.5 + shiver);
        } else {
          // Recover
          const phase = (t - 0.85) / 0.35;
          tortoiseFlameRef.current.scale.set(2.5 - phase * 1.5, 3.0 - phase * 2.0, 2.5 - phase * 1.5);
        }
      }
      
      // Dying/Dead states (extinguish flame, wobbly tip over)
      else if (animationState === 'dying' || animationState === 'dead') {
        const meltT = animationState === 'dead' ? 1.0 : Math.min(progress / 1.0, 1.0);
        tortoiseBodyRef.current.rotation.x = meltT * 0.25;
        tortoiseBodyRef.current.rotation.z = -meltT * 0.35;
        tortoiseBodyRef.current.position.y = 0.02 - meltT * 0.08;
        
        // Flame shrinks to 0 (extinguished)
        tortoiseFlameRef.current.scale.set(1.0 - meltT, 1.0 - meltT, 1.0 - meltT);
        
        // Retract head
        tortoiseHeadRef.current.position.z = 0.36 - meltT * 0.3;
        tortoiseHeadRef.current.position.y = 0.12 - meltT * 0.1;
      }
    }

    // ==========================================
    // 5. SAND SNAKE ANIMATIONS
    // ==========================================
    else if (type === 'sand_snake') {
      const segments = snakeSegmentsRef.current;
      if (segments.length === 0) return;

      // Base resets
      segments.forEach((seg, i) => {
        if (!seg) return;
        const zPos = -i * 0.28;
        seg.position.set(0, 0.08, zPos);
        seg.rotation.set(0, 0, 0);
        seg.scale.set(1.0 - i * 0.07, 1.0 - i * 0.07, 1.0 - i * 0.07);
      });

      // Walk cycle (slithering sine wave along Z axis)
      if (animationState === 'walk') {
        const slitherSpeed = 10.0;
        const slitherWidth = 0.28;
        segments.forEach((seg, i) => {
          if (!seg) return;
          const angle = time * slitherSpeed - i * 0.75;
          seg.position.x = Math.sin(angle) * slitherWidth;
          seg.position.y = 0.08 + Math.max(0, Math.cos(angle * 2)) * 0.06;
          // Rotate segments along slither angle
          seg.rotation.y = Math.cos(angle) * 0.45;
        });
      }
      
      // Idle slithering
      else if (animationState === 'idle') {
        const slitherSpeed = 3.5;
        const slitherWidth = 0.12;
        segments.forEach((seg, i) => {
          if (!seg) return;
          const angle = time * slitherSpeed - i * 0.65;
          seg.position.x = Math.sin(angle) * slitherWidth;
          seg.position.y = 0.08 + Math.sin(time * 2 + i) * 0.02;
          seg.rotation.y = Math.cos(angle) * 0.15;
        });
      }
      
      // Hit state (flinch back)
      else if (animationState === 'hit') {
        const hitT = progress / 0.8;
        let recoil = hitT < 0.2 ? (hitT / 0.2) * 0.5 : (1.0 - (hitT - 0.2) / 0.8) * 0.5;
        
        segments.forEach((seg, i) => {
          if (!seg) return;
          seg.position.z = -i * 0.28 - recoil * 0.5 * (1.0 - i * 0.15);
          seg.position.x += Math.sin(time * 40.0 + i) * 0.03 * recoil;
        });
      }
      
      // Attack state (strike coil and lunge)
      else if (animationState === 'attack') {
        if (t < 0.35) {
          // Coil back segments
          const phase = t / 0.35;
          segments.forEach((seg, i) => {
            if (!seg) return;
            const angle = i * 0.95;
            seg.position.set(
              Math.sin(angle) * 0.22 * phase,
              0.08 + i * 0.03 * phase,
              -i * 0.18 + phase * i * 0.08
            );
          });
        } else if (t < 0.6) {
          // Lunge head forward quickly
          const phase = (t - 0.35) / 0.25;
          segments.forEach((seg, i) => {
            if (!seg) return;
            if (i === 0) {
              seg.position.set(0, 0.15, 0.45 * phase); // head snaps forward
              seg.scale.set(1.15, 1.15, 1.15);
            } else {
              seg.position.set(0, 0.08, -(i - 1) * 0.25 - (1.0 - phase) * 0.15);
            }
          });
        } else {
          // Recover
          const phase = (t - 0.6) / 0.6;
          segments.forEach((seg, i) => {
            if (!seg) return;
            const targetZ = -i * 0.28;
            seg.position.lerp(new THREE.Vector3(0, 0.08, targetZ), phase);
          });
        }
      }
      
      // Def state (coil tight on floor)
      else if (animationState === 'def') {
        segments.forEach((seg, i) => {
          if (!seg) return;
          // Spiral coordinates
          const angle = i * 0.9;
          const radius = 0.32 - i * 0.04;
          seg.position.set(
            Math.cos(angle) * radius,
            0.08 + i * 0.06, // stack slightly upward like a basket coil
            Math.sin(angle) * radius - 0.1
          );
          seg.rotation.y = angle + Math.PI / 2.0;
        });
      }
      
      // Spell state (coil + stand tall)
      else if (animationState === 'spell') {
        segments.forEach((seg, i) => {
          if (!seg) return;
          const angle = time * 8.0 - i * 0.4;
          if (i < 3) {
            // Stand tall and sway
            seg.position.set(
              Math.sin(angle) * 0.1,
              0.1 + (3 - i) * 0.25,
              Math.cos(angle) * 0.05
            );
          } else {
            // Spiral coil base
            const bAngle = (i - 3) * 1.25;
            const bRadius = 0.35 - (i - 3) * 0.05;
            seg.position.set(
              Math.cos(bAngle) * bRadius,
              0.08,
              Math.sin(bAngle) * bRadius - 0.1
            );
          }
        });
      }
      
      // Dying/Dead states (melting into sand heap)
      else if (animationState === 'dying' || animationState === 'dead') {
        const meltT = animationState === 'dead' ? 1.0 : Math.min(progress / 1.0, 1.0);
        segments.forEach((seg, i) => {
          if (!seg) return;
          seg.position.y = Math.max(0.015, 0.08 - meltT * 0.065);
          seg.scale.x = (1.0 - i * 0.07) * (1.0 + meltT * 0.5); // flatten/spread
          seg.scale.z = (1.0 - i * 0.07) * (1.0 + meltT * 0.5);
          seg.scale.y = (1.0 - i * 0.07) * Math.max(0.1, 1.0 - meltT * 0.9);
          seg.position.z = -i * 0.28 * (1.0 - meltT * 0.4); // bunch up
        });
      }
    }
  });

  // Material and color helpers
  const boneColor = '#e2e8f0';
  const jointsColor = '#334155';
  const rustyIronColor = '#5c4d43';
  const slimeTint = type === 'slime' ? '#c084fc' : '#a855f7';

  // Finster Krab styling
  const krabShellColor = '#ea580c'; // Vibrant orange-red
  const krabUnderbellyColor = '#fed7aa'; // light peach
  const krabJointColor = '#c2410c';

  // Torchoise styling
  const tortoiseSkinColor = '#15803d'; // Forest green
  const tortoiseShellColor = '#292524'; // volcanic stone charcoal
  const volcanicGlowColor = '#ea580c'; // Lava orange

  // Sand Snake styling
  const snakeSandColor = '#d97706'; // Golden desert sand
  const snakeUnderbellyColor = '#fef3c7';

  return (
    <group ref={modelRef}>
      {/* ========================================== */}
      {/* 1. SLIME GEOMETRY                          */}
      {/* ========================================== */}
      {type === 'slime' && (
        <group>
          <group ref={slimeBodyRef}>
            <mesh ref={slimeCoreRef} position={[0, 0.05, 0]}>
              <dodecahedronGeometry args={[0.2]} />
              <meshBasicMaterial color="#a855f7" />
            </mesh>
            <mesh castShadow>
              <dodecahedronGeometry args={[0.55]} />
              <meshStandardMaterial 
                ref={materialRef}
                color={slimeTint} 
                transparent 
                opacity={0.68} 
                roughness={0.15} 
                metalness={0.1}
                emissive="#000000"
                emissiveIntensity={0}
              />
            </mesh>
            <mesh scale={[1.05, 1.05, 1.05]}>
              <dodecahedronGeometry args={[0.55]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
            <group position={[0, 0.1, 0.45]} rotation={[-0.1, 0, 0]}>
              <mesh position={[0.13, 0, 0]}>
                <sphereGeometry args={[0.045, 8, 8]} />
                <meshBasicMaterial color="#1e1b4b" />
              </mesh>
              <mesh position={[-0.13, 0, 0]}>
                <sphereGeometry args={[0.045, 8, 8]} />
                <meshBasicMaterial color="#1e1b4b" />
              </mesh>
              <mesh position={[0, -0.06, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.04, 0.015, 8, 12, Math.PI]} />
                <meshBasicMaterial color="#1e1b4b" />
              </mesh>
              <mesh position={[0.2, -0.06, -0.05]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshBasicMaterial color="#f472b6" transparent opacity={0.6} />
              </mesh>
              <mesh position={[-0.2, -0.06, -0.05]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshBasicMaterial color="#f472b6" transparent opacity={0.6} />
              </mesh>
            </group>
          </group>
          <mesh ref={slimeShieldRef} scale={[0.001, 0.001, 0.001]}>
            <sphereGeometry args={[0.75, 16, 16]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.25} wireframe />
          </mesh>
        </group>
      )}

      {/* ========================================== */}
      {/* 2. SKELETON GRUNT GEOMETRY                 */}
      {/* ========================================== */}
      {type === 'skeleton_grunt' && (
        <group ref={bodyRef} position={[0, 0.4, 0]}>
          <group ref={headRef} position={[0, 0.65, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.2, 12, 12]} />
              <meshStandardMaterial color={boneColor} roughness={0.9} />
            </mesh>
            <mesh scale={[1.06, 1.06, 1.06]}>
              <sphereGeometry args={[0.2, 12, 12]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
            <mesh position={[0, -0.15, 0.03]} castShadow>
              <boxGeometry args={[0.13, 0.08, 0.14]} />
              <meshStandardMaterial color={boneColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.15, 0.03]} scale={[1.08, 1.08, 1.08]}>
              <boxGeometry args={[0.13, 0.08, 0.14]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
            <mesh position={[0.07, 0.03, 0.15]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color="#ff0044" />
            </mesh>
            <mesh position={[0.07, 0.03, 0.145]} scale={[1.1, 1.1, 1.1]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            <mesh position={[-0.07, 0.03, 0.15]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color="#ff0044" />
            </mesh>
            <mesh position={[-0.07, 0.03, 0.145]} scale={[1.1, 1.1, 1.1]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            <mesh position={[0, -0.11, 0.105]}>
              <boxGeometry args={[0.08, 0.02, 0.01]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          </group>
          <group ref={torsoRef} position={[0, 0.2, 0]}>
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.05, 0.45, 6]} />
              <meshStandardMaterial ref={materialRef} color={boneColor} roughness={0.9} emissive="#000000" emissiveIntensity={0} />
            </mesh>
            <mesh position={[0, 0.1, 0]} scale={[1.1, 1.02, 1.1]}>
              <cylinderGeometry args={[0.04, 0.05, 0.45, 6]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
            <mesh position={[0, 0.24, 0]} rotation={[0.08, 0, 0]} castShadow>
              <torusGeometry args={[0.18, 0.032, 6, 16]} />
              <meshStandardMaterial color={boneColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.14, 0]} rotation={[0.08, 0, 0]} castShadow>
              <torusGeometry args={[0.19, 0.032, 6, 16]} />
              <meshStandardMaterial color={boneColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.04, 0]} rotation={[0.08, 0, 0]} castShadow>
              <torusGeometry args={[0.17, 0.032, 6, 16]} />
              <meshStandardMaterial color={boneColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.32, 0]} castShadow>
              <boxGeometry args={[0.42, 0.04, 0.06]} />
              <meshStandardMaterial color={boneColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.32, 0]} scale={[1.08, 1.1, 1.08]}>
              <boxGeometry args={[0.42, 0.04, 0.06]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
            <mesh position={[0, -0.15, 0]} castShadow>
              <boxGeometry args={[0.22, 0.07, 0.13]} />
              <meshStandardMaterial color={boneColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.15, 0]} scale={[1.08, 1.1, 1.08]}>
              <boxGeometry args={[0.22, 0.07, 0.13]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
          </group>
          <group ref={leftArmRef} position={[-0.25, 0.45, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshStandardMaterial color={jointsColor} />
            </mesh>
            <mesh position={[-0.05, -0.14, 0]} rotation={[0, 0, 0.1]} castShadow>
              <cylinderGeometry args={[0.024, 0.02, 0.26, 6]} />
              <meshStandardMaterial color={boneColor} roughness={0.9} />
            </mesh>
            <mesh position={[-0.05, -0.14, 0]} rotation={[0, 0, 0.1]} scale={[1.12, 1.02, 1.12]}>
              <cylinderGeometry args={[0.024, 0.02, 0.26, 6]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
            <mesh position={[-0.08, -0.32, 0.04]} rotation={[0.2, 0, 0.15]} castShadow>
              <cylinderGeometry args={[0.02, 0.018, 0.22, 6]} />
              <meshStandardMaterial color={boneColor} roughness={0.9} />
            </mesh>
            <group ref={shieldRef} position={[-0.12, -0.36, 0.1]} rotation={[0, 0.5, 0]}>
              <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.04, 12]} />
                <meshStandardMaterial color={rustyIronColor} roughness={0.8} metalness={0.6} />
              </mesh>
              <mesh scale={[1.05, 1.05, 1.05]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.04, 12]} />
                <meshBasicMaterial color="#000000" side={THREE.BackSide} />
              </mesh>
              <mesh position={[0, 0, 0.025]}>
                <sphereGeometry args={[0.07, 8, 8]} />
                <meshStandardMaterial color="#b45309" roughness={0.3} metalness={0.8} />
              </mesh>
            </group>
          </group>
          <group ref={rightArmRef} position={[0.25, 0.45, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshStandardMaterial color={jointsColor} />
            </mesh>
            <mesh position={[0.05, -0.14, 0]} rotation={[0, 0, -0.1]} castShadow>
              <cylinderGeometry args={[0.024, 0.02, 0.26, 6]} />
              <meshStandardMaterial color={boneColor} roughness={0.9} />
            </mesh>
            <mesh position={[0.05, -0.14, 0]} rotation={[0, 0, -0.1]} scale={[1.12, 1.02, 1.12]}>
              <cylinderGeometry args={[0.024, 0.02, 0.26, 6]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
            <mesh position={[0.08, -0.32, 0.04]} rotation={[0.2, 0, -0.15]} castShadow>
              <cylinderGeometry args={[0.02, 0.018, 0.22, 6]} />
              <meshStandardMaterial color={boneColor} roughness={0.9} />
            </mesh>
            <group ref={swordRef} position={[0.08, -0.4, 0.12]} rotation={[0.8, -0.2, -0.1]}>
              <mesh position={[0, 0.24, 0]} castShadow>
                <boxGeometry args={[0.035, 0.58, 0.075]} />
                <meshStandardMaterial color={rustyIronColor} roughness={0.85} metalness={0.7} />
              </mesh>
              <mesh position={[0, 0.24, 0]} scale={[1.12, 1.02, 1.22]}>
                <boxGeometry args={[0.035, 0.58, 0.075]} />
                <meshBasicMaterial color="#000000" side={THREE.BackSide} />
              </mesh>
              <mesh position={[0, -0.06, 0]}>
                <boxGeometry args={[0.13, 0.035, 0.055]} />
                <meshStandardMaterial color="#475569" roughness={0.6} metalness={0.5} />
              </mesh>
              <mesh position={[0, -0.06, 0]} scale={[1.12, 1.12, 1.12]}>
                <boxGeometry args={[0.13, 0.035, 0.055]} />
                <meshBasicMaterial color="#000000" side={THREE.BackSide} />
              </mesh>
              <mesh position={[0, -0.16, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.16, 6]} />
                <meshStandardMaterial color="#451a03" />
              </mesh>
            </group>
          </group>
          <group ref={leftLegRef} position={[-0.12, -0.15, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshStandardMaterial color={jointsColor} />
            </mesh>
            <mesh position={[0, -0.16, 0]} castShadow>
              <cylinderGeometry args={[0.028, 0.022, 0.32, 6]} />
              <meshStandardMaterial color={boneColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.16, 0]} scale={[1.12, 1.02, 1.12]}>
              <cylinderGeometry args={[0.028, 0.022, 0.32, 6]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
            <mesh position={[0, -0.38, 0.01]} castShadow>
              <cylinderGeometry args={[0.022, 0.018, 0.28, 6]} />
              <meshStandardMaterial color={boneColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.52, 0.04]} castShadow>
              <boxGeometry args={[0.075, 0.045, 0.125]} />
              <meshStandardMaterial color={boneColor} roughness={0.9} />
            </mesh>
          </group>
          <group ref={rightLegRef} position={[0.12, -0.15, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshStandardMaterial color={jointsColor} />
            </mesh>
            <mesh position={[0, -0.16, 0]} castShadow>
              <cylinderGeometry args={[0.028, 0.022, 0.32, 6]} />
              <meshStandardMaterial color={boneColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.16, 0]} scale={[1.12, 1.02, 1.12]}>
              <cylinderGeometry args={[0.028, 0.022, 0.32, 6]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
            <mesh position={[0, -0.38, 0.01]} castShadow>
              <cylinderGeometry args={[0.022, 0.018, 0.28, 6]} />
              <meshStandardMaterial color={boneColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.52, 0.04]} castShadow>
              <boxGeometry args={[0.075, 0.045, 0.125]} />
              <meshStandardMaterial color={boneColor} roughness={0.9} />
            </mesh>
          </group>
        </group>
      )}

      {/* ========================================== */}
      {/* 3. FINSTER KRAB GEOMETRY                   */}
      {/* ========================================== */}
      {type === 'finster_krab' && (
        <group ref={krabBodyRef} position={[0, 0.05, 0]}>
          {/* Main Crab Carapace Shell */}
          <mesh castShadow>
            <cylinderGeometry args={[0.42, 0.45, 0.24, 8]} />
            <meshStandardMaterial 
              ref={materialRef}
              color={krabShellColor} 
              roughness={0.4} 
              metalness={0.1}
              emissive="#000000"
              emissiveIntensity={0}
            />
          </mesh>
          <mesh scale={[1.05, 1.05, 1.05]}>
            <cylinderGeometry args={[0.42, 0.45, 0.24, 8]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>

          {/* Peach Underbelly */}
          <mesh position={[0, -0.11, 0]}>
            <cylinderGeometry args={[0.39, 0.40, 0.03, 8]} />
            <meshToonMaterial color={krabUnderbellyColor} />
          </mesh>

          {/* Stalk Eyes */}
          {/* Left Eye Stalk */}
          <group position={[0.13, 0.12, 0.35]} rotation={[0.2, 0, 0.1]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.018, 0.018, 0.18, 5]} />
              <meshStandardMaterial color={krabShellColor} />
            </mesh>
            <mesh position={[0, 0.09, 0]}>
              <sphereGeometry args={[0.038, 8, 8]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          </group>
          {/* Right Eye Stalk */}
          <group position={[-0.13, 0.12, 0.35]} rotation={[0.2, 0, -0.1]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.018, 0.018, 0.18, 5]} />
              <meshStandardMaterial color={krabShellColor} />
            </mesh>
            <mesh position={[0, 0.09, 0]}>
              <sphereGeometry args={[0.038, 8, 8]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          </group>

          {/* Left Claw Arm & Pincer */}
          <group ref={leftClawArmRef} position={[-0.35, 0.05, 0.2]}>
            {/* Claw arm bone */}
            <mesh castShadow rotation={[0, 0, Math.PI / 4.0]}>
              <cylinderGeometry args={[0.035, 0.05, 0.18, 5]} />
              <meshStandardMaterial color={krabJointColor} />
            </mesh>
            
            {/* Giant Left Pincer base */}
            <group position={[-0.1, 0.05, 0.15]} rotation={[0.2, 0.3, -0.4]}>
              <mesh castShadow>
                <sphereGeometry args={[0.16, 8, 8]} />
                <meshStandardMaterial color={krabShellColor} />
              </mesh>
              <mesh scale={[1.05, 1.05, 1.05]}>
                <sphereGeometry args={[0.16, 8, 8]} />
                <meshBasicMaterial color="#000000" side={THREE.BackSide} />
              </mesh>
              
              {/* Upper Pincer blade */}
              <group ref={leftClawUpperRef} position={[-0.04, 0.05, 0.08]}>
                <mesh castShadow position={[-0.02, 0.07, 0.04]} rotation={[0, 0, 0.3]}>
                  <coneGeometry args={[0.04, 0.15, 4]} />
                  <meshStandardMaterial color={krabShellColor} />
                </mesh>
                <mesh scale={[1.08, 1.02, 1.08]} position={[-0.02, 0.07, 0.04]} rotation={[0, 0, 0.3]}>
                  <coneGeometry args={[0.04, 0.15, 4]} />
                  <meshBasicMaterial color="#000000" side={THREE.BackSide} />
                </mesh>
              </group>
              
              {/* Lower Pincer blade */}
              <group ref={leftClawLowerRef} position={[-0.04, -0.05, 0.08]}>
                <mesh castShadow position={[-0.02, -0.07, 0.04]} rotation={[0, 0, -0.3]}>
                  <coneGeometry args={[0.035, 0.14, 4]} />
                  <meshStandardMaterial color={krabShellColor} />
                </mesh>
                <mesh scale={[1.08, 1.02, 1.08]} position={[-0.02, -0.07, 0.04]} rotation={[0, 0, -0.3]}>
                  <coneGeometry args={[0.035, 0.14, 4]} />
                  <meshBasicMaterial color="#000000" side={THREE.BackSide} />
                </mesh>
              </group>
            </group>
          </group>

          {/* Right Claw Arm & Pincer */}
          <group ref={rightClawArmRef} position={[0.35, 0.05, 0.2]}>
            {/* Claw arm bone */}
            <mesh castShadow rotation={[0, 0, -Math.PI / 4.0]}>
              <cylinderGeometry args={[0.035, 0.05, 0.18, 5]} />
              <meshStandardMaterial color={krabJointColor} />
            </mesh>
            
            {/* Giant Right Pincer base */}
            <group position={[0.1, 0.05, 0.15]} rotation={[0.2, -0.3, 0.4]}>
              <mesh castShadow>
                <sphereGeometry args={[0.16, 8, 8]} />
                <meshStandardMaterial color={krabShellColor} />
              </mesh>
              <mesh scale={[1.05, 1.05, 1.05]}>
                <sphereGeometry args={[0.16, 8, 8]} />
                <meshBasicMaterial color="#000000" side={THREE.BackSide} />
              </mesh>
              
              {/* Upper Pincer blade */}
              <group ref={rightClawUpperRef} position={[0.04, 0.05, 0.08]}>
                <mesh castShadow position={[0.02, 0.07, 0.04]} rotation={[0, 0, -0.3]}>
                  <coneGeometry args={[0.04, 0.15, 4]} />
                  <meshStandardMaterial color={krabShellColor} />
                </mesh>
                <mesh scale={[1.08, 1.02, 1.08]} position={[0.02, 0.07, 0.04]} rotation={[0, 0, -0.3]}>
                  <coneGeometry args={[0.04, 0.15, 4]} />
                  <meshBasicMaterial color="#000000" side={THREE.BackSide} />
                </mesh>
              </group>
              
              {/* Lower Pincer blade */}
              <group ref={rightClawLowerRef} position={[0.04, -0.05, 0.08]}>
                <mesh castShadow position={[0.02, -0.07, 0.04]} rotation={[0, 0, 0.3]}>
                  <coneGeometry args={[0.035, 0.14, 4]} />
                  <meshStandardMaterial color={krabShellColor} />
                </mesh>
                <mesh scale={[1.08, 1.02, 1.08]} position={[0.02, -0.07, 0.04]} rotation={[0, 0, 0.3]}>
                  <coneGeometry args={[0.035, 0.14, 4]} />
                  <meshBasicMaterial color="#000000" side={THREE.BackSide} />
                </mesh>
              </group>
            </group>
          </group>

          {/* 6 Side Walking Legs */}
          {Array.from({ length: 6 }).map((_, i) => (
            <group 
              key={`krab-leg-${i}`}
              ref={el => krabLegsRef.current[i] = el}
            >
              <mesh castShadow>
                <cylinderGeometry args={[0.024, 0.015, 0.28, 4]} />
                <meshStandardMaterial color={krabShellColor} />
              </mesh>
              <mesh scale={[1.08, 1.02, 1.08]}>
                <cylinderGeometry args={[0.024, 0.015, 0.28, 4]} />
                <meshBasicMaterial color="#000000" side={THREE.BackSide} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* ========================================== */}
      {/* 4. TORCHOISE GEOMETRY                      */}
      {/* ========================================== */}
      {type === 'torchoise' && (
        <group ref={tortoiseBodyRef} position={[0, 0.02, 0]}>
          {/* Main Volcanic Coal Shell */}
          <group ref={tortoiseShellRef}>
            <mesh castShadow position={[0, 0.2, 0]}>
              <dodecahedronGeometry args={[0.5]} />
              <meshStandardMaterial 
                ref={materialRef}
                color={tortoiseShellColor} 
                roughness={0.9} 
                metalness={0.1}
                emissive="#000000"
                emissiveIntensity={0}
              />
            </mesh>
            <mesh position={[0, 0.2, 0]} scale={[1.04, 1.04, 1.04]}>
              <dodecahedronGeometry args={[0.5]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>

            {/* Glowing Orange Lava Cracks and Chimney */}
            <mesh position={[0, 0.58, 0]}>
              <cylinderGeometry args={[0.15, 0.18, 0.22, 6]} />
              <meshStandardMaterial color={tortoiseShellColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.58, 0]} scale={[1.08, 1.02, 1.08]}>
              <cylinderGeometry args={[0.15, 0.18, 0.22, 6]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>

            {/* Chimney opening glowing core */}
            <mesh position={[0, 0.69, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.02, 6]} />
              <meshBasicMaterial color={volcanicGlowColor} />
            </mesh>

            {/* Flickering Fire Torch Flame */}
            <group ref={tortoiseFlameRef} position={[0, 0.8, 0]}>
              <mesh>
                <coneGeometry args={[0.16, 0.42, 6]} />
                <meshBasicMaterial color="#f59e0b" /> {/* Amber */}
              </mesh>
              <mesh scale={[1.15, 1.15, 1.15]}>
                <coneGeometry args={[0.16, 0.42, 6]} />
                <meshBasicMaterial color="#ef4444" side={THREE.BackSide} transparent opacity={0.4} /> {/* red shell */}
              </mesh>
              <pointLight color="#f59e0b" intensity={2.0} distance={4} />
            </group>
          </group>

          {/* Wobbly Tortoise Head */}
          <group ref={tortoiseHeadRef} position={[0, 0.12, 0.36]}>
            {/* Neck */}
            <mesh position={[0, 0, -0.15]} rotation={[Math.PI / 4.0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.09, 0.3, 6]} />
              <meshStandardMaterial color={tortoiseSkinColor} roughness={0.8} />
            </mesh>
            <mesh position={[0, 0, -0.15]} rotation={[Math.PI / 4.0, 0, 0]} scale={[1.08, 1.02, 1.08]}>
              <cylinderGeometry args={[0.07, 0.09, 0.3, 6]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
            
            {/* Head Ball */}
            <mesh castShadow position={[0, 0.08, 0]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color={tortoiseSkinColor} roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.08, 0]} scale={[1.08, 1.08, 1.08]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
            
            {/* Angry Yellow eyes */}
            <mesh position={[0.06, 0.1, 0.08]}>
              <sphereGeometry args={[0.024, 8, 8]} />
              <meshBasicMaterial color="#facc15" />
            </mesh>
            <mesh position={[-0.06, 0.1, 0.08]}>
              <sphereGeometry args={[0.024, 8, 8]} />
              <meshBasicMaterial color="#facc15" />
            </mesh>
          </group>

          {/* 4 Stubby Tortoise Feet */}
          {Array.from({ length: 4 }).map((_, i) => (
            <group 
              key={`torchoise-leg-${i}`}
              ref={el => tortoiseLegsRef.current[i] = el}
            >
              <mesh castShadow position={[0, -0.1, 0]}>
                <cylinderGeometry args={[0.08, 0.1, 0.16, 5]} />
                <meshStandardMaterial color={tortoiseSkinColor} roughness={0.8} />
              </mesh>
              <mesh position={[0, -0.1, 0]} scale={[1.08, 1.02, 1.08]}>
                <cylinderGeometry args={[0.08, 0.1, 0.16, 5]} />
                <meshBasicMaterial color="#000000" side={THREE.BackSide} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* ========================================== */}
      {/* 5. SAND SNAKE GEOMETRY                     */}
      {/* ========================================== */}
      {type === 'sand_snake' && (
        <group>
          {/* Render 6 linked segments */}
          {Array.from({ length: 6 }).map((_, i) => {
            const isHead = i === 0;
            const isTail = i === 5;
            
            return (
              <group 
                key={`snake-seg-${i}`}
                ref={el => snakeSegmentsRef.current[i] = el}
              >
                {isHead ? (
                  /* HEAD SEGMENT */
                  <group>
                    <mesh castShadow>
                      <sphereGeometry args={[0.13, 8, 8]} />
                      <meshStandardMaterial 
                        ref={materialRef}
                        color={snakeSandColor} 
                        roughness={0.95} 
                        emissive="#000000"
                        emissiveIntensity={0}
                      />
                    </mesh>
                    <mesh scale={[1.06, 1.06, 1.06]}>
                      <sphereGeometry args={[0.13, 8, 8]} />
                      <meshBasicMaterial color="#000000" side={THREE.BackSide} />
                    </mesh>

                    {/* Glowing Red Eyes */}
                    <mesh position={[0.05, 0.04, 0.09]}>
                      <sphereGeometry args={[0.024, 6, 6]} />
                      <meshBasicMaterial color="#ff1133" />
                    </mesh>
                    <mesh position={[-0.05, 0.04, 0.09]}>
                      <sphereGeometry args={[0.024, 6, 6]} />
                      <meshBasicMaterial color="#ff1133" />
                    </mesh>

                    {/* Hissing red tongue */}
                    <mesh position={[0, -0.03, 0.14]} rotation={[0.1, 0, 0]}>
                      <boxGeometry args={[0.02, 0.015, 0.08]} />
                      <meshBasicMaterial color="#ff1133" />
                    </mesh>
                  </group>
                ) : isTail ? (
                  /* TAIL SEGMENT (Pointed cone) */
                  <group>
                    <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
                      <coneGeometry args={[0.05, 0.22, 6]} />
                      <meshStandardMaterial color={snakeSandColor} roughness={0.95} />
                    </mesh>
                    <mesh scale={[1.08, 1.02, 1.08]} rotation={[Math.PI / 2, 0, 0]}>
                      <coneGeometry args={[0.05, 0.22, 6]} />
                      <meshBasicMaterial color="#000000" side={THREE.BackSide} />
                    </mesh>
                  </group>
                ) : (
                  /* STANDARD BODY SEGMENTS */
                  <group>
                    <mesh castShadow>
                      <dodecahedronGeometry args={[0.12 - i * 0.01]} />
                      <meshStandardMaterial color={snakeSandColor} roughness={0.95} />
                    </mesh>
                    <mesh scale={[1.06, 1.06, 1.06]}>
                      <dodecahedronGeometry args={[0.12 - i * 0.01]} />
                      <meshBasicMaterial color="#000000" side={THREE.BackSide} />
                    </mesh>
                    {/* Ring stripes */}
                    <mesh scale={[1.02, 1.02, 1.02]}>
                      <torusGeometry args={[0.10 - i * 0.008, 0.02, 5, 8]} />
                      <meshStandardMaterial color={snakeUnderbellyColor} roughness={0.95} />
                    </mesh>
                  </group>
                )}
              </group>
            );
          })}
        </group>
      )}
    </group>
  );
}
