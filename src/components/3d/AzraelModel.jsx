import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const lerpEuler = (euler, tx, ty, tz, alpha) => {
  euler.x = THREE.MathUtils.lerp(euler.x, tx, alpha);
  euler.y = THREE.MathUtils.lerp(euler.y, ty, alpha);
  euler.z = THREE.MathUtils.lerp(euler.z, tz, alpha);
};

export default function AzraelModel({
  animationState: propAnimationState = 'idle',
  animVariant: propAnimVariant = 0,
  animProgress: propAnimProgress = 0,
  materialRef = null
}) {
  const modelRef = useRef();
  const bodyRef = useRef();

  // Joints/Parts Refs
  const headRef = useRef();
  const hairLeftRef = useRef();      // Left front hair lock
  const hairRightRef = useRef();     // Right front hair lock
  const hairBackUpperRef = useRef(); // Back cascading hair upper
  const hairBackLowerRef = useRef(); // Back cascading hair lower (secondary chain)
  const torsoRef = useRef();
  const collarRef = useRef();
  const robeSkirtRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const staffRef = useRef();
  const crystalOrbiterRef = useRef();

  // Additional detail refs
  const leftSleeveRef = useRef();      // Flared sleeve left
  const rightSleeveRef = useRef();     // Flared sleeve right
  const leftTailcoatRef = useRef();    // Skirt split drape left
  const rightTailcoatRef = useRef();   // Skirt split drape right
  const magicRingGroundRef = useRef(); // Cast circle under feet
  const magicRingFrontRef = useRef();  // Cast circle in front of staff

  useFrame((state) => {
    if (!modelRef.current) return;

    const time = state.clock.getElapsedTime();

    // Read from parent userData if available (for overworld and combat sync)
    let animationState = propAnimationState;
    let animVariant = propAnimVariant;
    let animProgress = propAnimProgress;

    if (modelRef.current.parent && modelRef.current.parent.userData && modelRef.current.parent.userData.animState) {
      animationState = modelRef.current.parent.userData.animState;
      animVariant = modelRef.current.parent.userData.animVariant !== undefined ? modelRef.current.parent.userData.animVariant : propAnimVariant;
      animProgress = modelRef.current.parent.userData.animProgress !== undefined ? modelRef.current.parent.userData.animProgress : propAnimProgress;
    }

    // 1. RESET ALL TRANSFORMS BEFORE RUNNING ANIMATION FRAME
    if (modelRef.current) {
      modelRef.current.rotation.set(0, 0, 0);
    }
    if (headRef.current) {
      headRef.current.position.set(0, 0.68, 0);
      headRef.current.rotation.set(0, 0, 0);
    }
    if (hairLeftRef.current) hairLeftRef.current.rotation.set(0, 0, 0);
    if (hairRightRef.current) hairRightRef.current.rotation.set(0, 0, 0);
    if (hairBackUpperRef.current) hairBackUpperRef.current.rotation.set(0, 0, 0);
    if (hairBackLowerRef.current) hairBackLowerRef.current.rotation.set(0, 0, 0);
    if (torsoRef.current) {
      torsoRef.current.position.set(0, 0.16, 0);
      torsoRef.current.rotation.set(0, 0, 0);
    }
    if (collarRef.current) collarRef.current.rotation.set(0, 0, 0);
    if (robeSkirtRef.current) {
      robeSkirtRef.current.position.set(0, -0.05, 0);
      robeSkirtRef.current.rotation.set(0, 0, 0);
      robeSkirtRef.current.scale.set(1, 1, 1);
    }
    if (leftArmRef.current) {
      leftArmRef.current.position.set(-0.24, 0.32, 0);
      leftArmRef.current.rotation.set(0.15, 0, 0.1);
    }
    if (rightArmRef.current) {
      rightArmRef.current.position.set(0.24, 0.32, 0);
      rightArmRef.current.rotation.set(-0.15, 0, -0.1);
    }
    if (leftLegRef.current) {
      leftLegRef.current.position.set(-0.08, -0.22, 0);
      leftLegRef.current.rotation.set(0, 0, 0);
    }
    if (rightLegRef.current) {
      rightLegRef.current.position.set(0.08, -0.22, 0);
      rightLegRef.current.rotation.set(0, 0, 0);
    }
    if (staffRef.current) {
      staffRef.current.position.set(-0.12, -0.22, 0.22);
      staffRef.current.rotation.set(0.2, 0.1, 0.15);
    }
    if (bodyRef.current) {
      bodyRef.current.position.set(0, 0.45, 0);
      bodyRef.current.rotation.set(0, 0, 0);
    }
    if (leftSleeveRef.current) leftSleeveRef.current.rotation.set(0.1, 0, 0.05);
    if (rightSleeveRef.current) rightSleeveRef.current.rotation.set(0.1, 0, -0.05);
    if (leftTailcoatRef.current) leftTailcoatRef.current.rotation.set(0.18, 0, -0.08);
    if (rightTailcoatRef.current) rightTailcoatRef.current.rotation.set(0.18, 0, 0.08);
    if (magicRingGroundRef.current) magicRingGroundRef.current.scale.set(0, 0, 0);
    if (magicRingFrontRef.current) magicRingFrontRef.current.scale.set(0, 0, 0);

    // Default orbital crystal spin
    if (crystalOrbiterRef.current) {
      const orbitSpeed = 4.2;
      const orbitRadius = 0.16;
      crystalOrbiterRef.current.position.set(
        Math.cos(time * orbitSpeed) * orbitRadius,
        0.58 + Math.sin(time * orbitSpeed * 2) * 0.05,
        Math.sin(time * orbitSpeed) * orbitRadius
      );
      crystalOrbiterRef.current.rotation.y = time * 3;
    }

    // --- ANIMATION CONTROLLER ---

    // 1. DEAD STATE
    if (animationState === 'dead') {
      if (bodyRef.current) {
        bodyRef.current.position.y = -0.35;
        bodyRef.current.position.z = -0.2;
        bodyRef.current.rotation.x = -Math.PI / 2; // Lie flat
        bodyRef.current.rotation.z = -0.25; // Angled body
      }
      if (staffRef.current) {
        staffRef.current.position.set(-0.45, -0.4, 0.45);
        staffRef.current.rotation.set(0.35, 0.45, -1.3); // Staff dropped nearby
      }
      if (hairBackUpperRef.current) hairBackUpperRef.current.rotation.x = 0.55;
      if (hairBackLowerRef.current) hairBackLowerRef.current.rotation.x = 0.35;
      if (leftSleeveRef.current) leftSleeveRef.current.rotation.set(0.1, 0, 0);
      if (rightSleeveRef.current) rightSleeveRef.current.rotation.set(0.1, 0, 0);
      return;
    }

    // 2. DYING STATE
    if (animationState === 'dying') {
      const progress = animProgress || (time % 1.5);
      const t = Math.min(progress / 1.2, 1.0); // 1.2s fall
      
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.45 - t * 0.8;
        bodyRef.current.position.z = -t * 0.2;
        bodyRef.current.rotation.x = -t * (Math.PI / 2);
        bodyRef.current.rotation.z = -t * 0.25;
      }
      if (staffRef.current) {
        staffRef.current.position.x = -0.12 - t * 0.33;
        staffRef.current.position.y = -0.22 - t * 0.18;
        staffRef.current.rotation.z = 0.15 - t * 1.45;
      }
      if (leftArmRef.current) leftArmRef.current.rotation.x = -t * 1.5;
      if (hairBackUpperRef.current) hairBackUpperRef.current.rotation.x = t * 0.55;
      if (hairBackLowerRef.current) hairBackLowerRef.current.rotation.x = t * 0.35;
      return;
    }

    // 3. BEING HIT STATE
    if (animationState === 'hit') {
      const progress = animProgress || (time % 0.8);
      const t = progress / 0.8;
      const recoil = t < 0.25 ? (t / 0.25) * 0.65 : (1 - (t - 0.25) / 0.75) * 0.65;
      
      if (bodyRef.current) {
        bodyRef.current.position.z = -recoil;
        bodyRef.current.position.y = 0.45 - recoil * 0.25;
        bodyRef.current.rotation.x = -recoil * 0.4;
      }
      if (headRef.current) headRef.current.rotation.x = -recoil * 0.3;
      if (hairBackUpperRef.current) hairBackUpperRef.current.rotation.x = -recoil * 0.9;
      if (hairBackLowerRef.current) hairBackLowerRef.current.rotation.x = -recoil * 0.55;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = 0.1 + recoil * 0.75;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -0.1 - recoil * 0.75;
      }
      if (leftSleeveRef.current) leftSleeveRef.current.rotation.x = 0.1 + recoil * 0.8;
      if (rightSleeveRef.current) rightSleeveRef.current.rotation.x = 0.1 + recoil * 0.8;
      return;
    }

    // 4. SPELL STATE (Powerful floating casting loop)
    if (animationState === 'spell') {
      const progress = animProgress || (time % 1.5);
      const t = Math.min(progress / 1.5, 1.0);
      const floatCycle = Math.sin(t * Math.PI) * 0.45; // Hover higher
      
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.45 + floatCycle;
        bodyRef.current.rotation.y = Math.sin(t * Math.PI * 2) * 0.2; // waist twisting
      }
      if (headRef.current) headRef.current.rotation.x = -0.32 * Math.sin(t * Math.PI); // Look up
      if (hairBackUpperRef.current) hairBackUpperRef.current.rotation.x = -0.45 * Math.sin(t * Math.PI);
      if (hairBackLowerRef.current) hairBackLowerRef.current.rotation.x = -0.4 * Math.sin(t * Math.PI);
      
      // Left arm raises staff high in front, spinning flat
      if (leftArmRef.current) {
        leftArmRef.current.rotation.set(-2.0 * Math.sin(t * Math.PI), 0, 0.4 * Math.sin(t * Math.PI));
      }
      if (staffRef.current) {
        staffRef.current.position.set(0.0, 0.15, 0.45);
        staffRef.current.rotation.set(Math.PI / 2, time * 18, 0); // Fast spinning horizontal staff
      }
      // Right hand extended forward-outward casting spell
      if (rightArmRef.current) {
        rightArmRef.current.rotation.set(-1.4 * Math.sin(t * Math.PI), -0.3 * Math.sin(t * Math.PI), -0.6 * Math.sin(t * Math.PI));
      }
      // sleeves flaring out
      if (leftSleeveRef.current) leftSleeveRef.current.rotation.set(0.1, 0, 0.6 * Math.sin(t * Math.PI));
      if (rightSleeveRef.current) rightSleeveRef.current.rotation.set(0.1, 0, -0.6 * Math.sin(t * Math.PI));

      // Fast spinning staff orbiter
      if (crystalOrbiterRef.current) {
        const orbitSpeed = 16.0;
        const orbitRadius = 0.25;
        crystalOrbiterRef.current.position.set(
          Math.cos(time * orbitSpeed) * orbitRadius,
          0.58 + Math.sin(time * orbitSpeed * 2) * 0.05,
          Math.sin(time * orbitSpeed) * orbitRadius
        );
      }

      // Render the two expanding casting magic rings
      if (magicRingGroundRef.current) {
        magicRingGroundRef.current.scale.set(t * 2.5, t * 2.5, t * 2.5);
        magicRingGroundRef.current.position.y = -0.45;
        magicRingGroundRef.current.rotation.z = time * 5.0;
      }
      if (magicRingFrontRef.current) {
        magicRingFrontRef.current.scale.set(t * 1.5, t * 1.5, t * 1.5);
        magicRingFrontRef.current.position.set(0, 0.18, 0.7);
        magicRingFrontRef.current.rotation.y = time * 4.0;
      }
      return;
    }

    // 5. ATTACK STATE (4 variants - spell focused)
    if (animationState === 'attack') {
      const progress = animProgress || (time % 1.2);
      const duration = 1.2;
      const t = progress / duration;
      const variant = animVariant % 4;

      if (variant === 0) {
        // --- Variant 1: Cast Bolt ---
        if (t < 0.35) {
          // Raise staff back
          const phase = t / 0.35;
          leftArmRef.current.rotation.set(-0.8 * phase, 0, 0.45 * phase);
          if (staffRef.current) {
            staffRef.current.position.set(-0.16, -0.08, 0.16);
            staffRef.current.rotation.set(0.7 * phase, 0, 0.35 * phase);
          }
          bodyRef.current.rotation.y = 0.3 * phase;
        } else if (t < 0.65) {
          // Thrust staff forward
          const phase = (t - 0.35) / 0.3;
          leftArmRef.current.rotation.set(-1.5, -0.3, -0.2);
          leftArmRef.current.position.z = 0.28 * phase;
          if (staffRef.current) {
            staffRef.current.position.set(-0.04, -0.06, 0.45);
            staffRef.current.rotation.set(-0.6, 0, 0); // point staff forward
          }
          bodyRef.current.rotation.y = 0.3 - 0.65 * phase;
          bodyRef.current.rotation.x = 0.12 * phase;
          
          // Render ring in front of staff
          if (magicRingFrontRef.current) {
            magicRingFrontRef.current.scale.set(1.4 * phase, 1.4 * phase, 1.4 * phase);
            magicRingFrontRef.current.position.set(0, 0.1, 0.5);
            magicRingFrontRef.current.rotation.y = time * 5;
          }
        } else {
          // Return
          const phase = (t - 0.65) / 0.55;
          bodyRef.current.rotation.x = 0.12 * (1 - phase);
          bodyRef.current.rotation.y = -0.35 * (1 - phase);
          lerpEuler(leftArmRef.current.rotation, 0.15, 0, 0.1, phase);
          leftArmRef.current.position.lerp(new THREE.Vector3(-0.24, 0.32, 0), phase);
          staffRef.current.position.lerp(new THREE.Vector3(-0.12, -0.22, 0.22), phase);
          lerpEuler(staffRef.current.rotation, 0.2, 0.1, 0.15, phase);
        }
      } else if (variant === 1) {
        // --- Variant 2: Summon Storm (Spell Call) ---
        if (t < 0.4) {
          // Lift staff high with both hands & float
          const phase = t / 0.4;
          leftArmRef.current.rotation.set(-2.3 * phase, 0, 0.3 * phase);
          leftArmRef.current.position.x = -0.15;
          leftArmRef.current.position.y = 0.42;
          if (staffRef.current) {
            staffRef.current.position.set(-0.02, 0.08, 0.12);
            staffRef.current.rotation.set(-0.25 * phase, 0, -0.35 * phase);
          }
          bodyRef.current.position.y = 0.45 + 0.3 * phase;
          bodyRef.current.rotation.x = -0.15 * phase;
          headRef.current.rotation.x = -0.22 * phase;
        } else if (t < 0.8) {
          // Channel energy, floating
          leftArmRef.current.rotation.set(-2.3, 0.2 * Math.sin(time * 14), 0.3);
          bodyRef.current.position.y = 0.75 + Math.sin(time * 8) * 0.06;
          // magic ring under feet
          if (magicRingGroundRef.current) {
            magicRingGroundRef.current.scale.set(2.4, 2.4, 2.4);
            magicRingGroundRef.current.position.y = -0.45;
            magicRingGroundRef.current.rotation.z = time * 6.0;
          }
        } else {
          // Return
          const phase = (t - 0.8) / 0.4;
          bodyRef.current.position.y = 0.75 - 0.3 * phase;
          bodyRef.current.rotation.x = -0.15 * (1 - phase);
          headRef.current.rotation.x = -0.22 * (1 - phase);
          lerpEuler(leftArmRef.current.rotation, 0.15, 0, 0.1, phase);
          leftArmRef.current.position.lerp(new THREE.Vector3(-0.24, 0.32, 0), phase);
          staffRef.current.position.lerp(new THREE.Vector3(-0.12, -0.22, 0.22), phase);
          lerpEuler(staffRef.current.rotation, 0.2, 0.1, 0.15, phase);
        }
      } else if (variant === 2) {
        // --- Variant 3: Double Spin Staff (Barrier) ---
        if (t < 0.2) {
          leftArmRef.current.rotation.set(-0.6, 0, 0.55);
        } else if (t < 0.8) {
          // Spin staff horizontally fast in front
          const phase = (t - 0.2) / 0.6;
          const spinAngle = phase * Math.PI * 5;
          leftArmRef.current.rotation.set(-0.95, 0, 0.35);
          if (staffRef.current) {
            staffRef.current.rotation.set(0.2, spinAngle, 0.15);
            staffRef.current.position.set(-0.04, -0.16, 0.28);
          }
          if (magicRingFrontRef.current) {
            magicRingFrontRef.current.scale.set(1.5, 1.5, 1.5);
            magicRingFrontRef.current.position.set(-0.1, 0.0, 0.3);
            magicRingFrontRef.current.rotation.x = Math.PI / 2; // Flat shield
            magicRingFrontRef.current.rotation.z = time * 4.0;
          }
        } else {
          // Return
          const phase = (t - 0.8) / 0.4;
          lerpEuler(leftArmRef.current.rotation, 0.15, 0, 0.1, phase);
          staffRef.current.position.lerp(new THREE.Vector3(-0.12, -0.22, 0.22), phase);
          lerpEuler(staffRef.current.rotation, 0.2, 0.1, 0.15, phase);
        }
      } else {
        // --- Variant 4: Telekinetic Blast ---
        if (t < 0.35) {
          const phase = t / 0.35;
          leftArmRef.current.rotation.set(0.7 * phase, 0, 0.45 * phase);
          rightArmRef.current.rotation.set(0.7 * phase, 0, -0.45 * phase);
          if (staffRef.current) {
            staffRef.current.position.set(-0.22, -0.08, 0.04);
            staffRef.current.rotation.set(0.45, 0, 0.25);
          }
        } else if (t < 0.7) {
          const phase = (t - 0.35) / 0.35;
          leftArmRef.current.rotation.set(-1.4, 0.35, -0.15);
          rightArmRef.current.rotation.set(-1.4, -0.35, 0.15);
          
          if (staffRef.current) {
            staffRef.current.position.set(0, 0.22, 0.6); // floats out front
            staffRef.current.rotation.y = time * 28;
            staffRef.current.rotation.x = Math.PI / 2;
          }
          bodyRef.current.position.z = 0.18 * phase;
          if (magicRingFrontRef.current) {
            magicRingFrontRef.current.scale.set(1.8 * phase, 1.8 * phase, 1.8 * phase);
            magicRingFrontRef.current.position.set(0, 0.22, 0.85);
            magicRingFrontRef.current.rotation.y = time * 6.0;
          }
        } else {
          // Return
          const phase = (t - 0.7) / 0.5;
          bodyRef.current.position.z = 0.18 * (1 - phase);
          lerpEuler(leftArmRef.current.rotation, 0.15, 0, 0.1, phase);
          lerpEuler(rightArmRef.current.rotation, -0.15, 0, -0.1, phase);
          staffRef.current.position.lerp(new THREE.Vector3(-0.12, -0.22, 0.22), phase);
          lerpEuler(staffRef.current.rotation, 0.2, 0.1, 0.15, phase);
        }
      }
      return;
    }

    // 6. WALK & RUN CYCLIC STATES
    if (animationState === 'walk' || animationState === 'run') {
      const isRun = animationState === 'run';
      const freq = isRun ? 18 : 10;
      const legSwingAmp = isRun ? 0.5 : 0.28;
      const armSwingAmp = isRun ? 0.8 : 0.45;
      const bobAmp = isRun ? 0.08 : 0.042;
      const leanAngle = isRun ? 0.22 : 0.07;
      const cycle = time * freq;

      // Body Bob, lean and twisting waist
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.45 + Math.sin(cycle * 2) * bobAmp;
        bodyRef.current.rotation.x = leanAngle;
        bodyRef.current.rotation.y = Math.sin(cycle) * (isRun ? 0.12 : 0.05);
      }

      // Legs swing (slightly smaller for long dress)
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(cycle) * legSwingAmp;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(cycle) * legSwingAmp;

      // Robe skirt & tailcoats wave
      if (robeSkirtRef.current) robeSkirtRef.current.rotation.x = Math.cos(cycle * 2) * 0.08;
      if (leftTailcoatRef.current) leftTailcoatRef.current.rotation.x = 0.18 + Math.sin(cycle * 2) * 0.08 + (isRun ? 0.2 : 0.05);
      if (rightTailcoatRef.current) rightTailcoatRef.current.rotation.x = 0.18 + Math.cos(cycle * 2) * 0.08 + (isRun ? 0.2 : 0.05);

      // Flapping sleeves motion
      if (leftSleeveRef.current) {
        leftSleeveRef.current.rotation.x = 0.1 + Math.sin(cycle) * (isRun ? 0.5 : 0.22);
        leftSleeveRef.current.rotation.z = 0.05 + Math.abs(Math.sin(cycle)) * (isRun ? 0.35 : 0.15);
      }
      if (rightSleeveRef.current) {
        rightSleeveRef.current.rotation.x = 0.1 - Math.sin(cycle) * (isRun ? 0.5 : 0.22);
        rightSleeveRef.current.rotation.z = -0.05 - Math.abs(Math.sin(cycle)) * (isRun ? 0.35 : 0.15);
      }

      // Arms swing
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0.15 - Math.sin(cycle) * armSwingAmp;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.15 + Math.sin(cycle) * armSwingAmp;

      // Long Hair waves
      if (hairLeftRef.current) hairLeftRef.current.rotation.x = -0.1 + Math.cos(cycle) * 0.04;
      if (hairRightRef.current) hairRightRef.current.rotation.x = -0.1 + Math.cos(cycle) * 0.04;
      if (hairBackUpperRef.current) {
        hairBackUpperRef.current.rotation.x = isRun ? -0.45 + Math.cos(cycle * 2) * 0.08 : -0.14 + Math.cos(cycle * 2) * 0.04;
      }
      if (hairBackLowerRef.current) {
        hairBackLowerRef.current.rotation.x = isRun ? -0.35 + Math.cos(cycle * 2 - 0.4) * 0.1 : -0.08 + Math.cos(cycle * 2 - 0.4) * 0.05;
      }

      // Staff bobs
      if (staffRef.current) {
        staffRef.current.position.y = -0.22 + Math.cos(cycle * 2) * 0.05;
        staffRef.current.rotation.x = 0.2 + Math.cos(cycle) * 0.08;
      }
      return;
    }

    // 7. IDLE STATES (4 variants)
    if (animationState === 'idle') {
      const variant = animVariant % 4;
      const breath = Math.sin(time * 2.0) * 0.022; // Soft breathing cycle
      
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.45 + breath;
      }
      if (torsoRef.current) {
        torsoRef.current.rotation.z = Math.sin(time * 1.4) * 0.01;
      }

      // Hair breathing sway
      if (hairLeftRef.current) hairLeftRef.current.rotation.z = Math.sin(time * 1.2) * 0.04;
      if (hairRightRef.current) hairRightRef.current.rotation.z = -Math.sin(time * 1.2) * 0.04;
      if (hairBackUpperRef.current) {
        hairBackUpperRef.current.rotation.z = Math.sin(time * 1.4) * 0.03;
        hairBackUpperRef.current.rotation.x = Math.sin(time * 1.0) * 0.02;
      }
      if (hairBackLowerRef.current) {
        hairBackLowerRef.current.rotation.z = Math.sin(time * 1.4 - 0.2) * 0.04;
        hairBackLowerRef.current.rotation.x = Math.sin(time * 1.0 - 0.2) * 0.03;
      }

      // Sleeve sways
      if (leftSleeveRef.current) {
        leftSleeveRef.current.rotation.x = 0.1 + Math.sin(time * 1.1) * 0.04;
        leftSleeveRef.current.rotation.z = 0.05 + Math.sin(time * 1.4) * 0.02;
      }
      if (rightSleeveRef.current) {
        rightSleeveRef.current.rotation.x = 0.1 + Math.cos(time * 1.1) * 0.04;
        rightSleeveRef.current.rotation.z = -0.05 - Math.sin(time * 1.4) * 0.02;
      }

      // Tailcoat sways
      if (leftTailcoatRef.current) leftTailcoatRef.current.rotation.x = 0.18 + Math.sin(time * 1.3) * 0.02;
      if (rightTailcoatRef.current) rightTailcoatRef.current.rotation.x = 0.18 + Math.cos(time * 1.3) * 0.02;

      if (variant === 0) {
        // --- Variant 1: Pure Breathing ---
        if (headRef.current) headRef.current.rotation.y = Math.sin(time * 0.4) * 0.06;
        if (staffRef.current) staffRef.current.position.y = -0.22 + Math.sin(time * 1.5) * 0.03;
      } else if (variant === 1) {
        // --- Variant 2: Staff Spin in Hand ---
        const cycle = (time * 0.8) % (Math.PI * 2);
        const actionPhase = Math.sin(cycle);
        
        if (actionPhase > 0) {
          if (leftArmRef.current) leftArmRef.current.rotation.set(-0.7, 0, 0.4);
          if (staffRef.current) {
            staffRef.current.position.set(-0.08, -0.18, 0.25);
            staffRef.current.rotation.set(0.2, actionPhase * Math.PI * 2, 0.15);
          }
        }
      } else if (variant === 2) {
        // --- Variant 3: Mage Meditation Float ---
        const floatCycle = Math.sin(time * 2.8) * 0.12 + 0.12; // float high
        if (bodyRef.current) bodyRef.current.position.y = 0.45 + floatCycle;
        if (robeSkirtRef.current) robeSkirtRef.current.scale.y = 1 + floatCycle * 0.15;
        if (leftTailcoatRef.current) leftTailcoatRef.current.rotation.x = 0.18 + floatCycle * 0.4;
        if (rightTailcoatRef.current) rightTailcoatRef.current.rotation.x = 0.18 + floatCycle * 0.4;
        if (staffRef.current) {
          staffRef.current.position.y = -0.22 + floatCycle * 0.8;
          staffRef.current.rotation.z = 0.15 + Math.sin(time * 2) * 0.08;
        }
      } else {
        // --- Variant 4: Astral Resonance ---
        const resonance = Math.sin(time * 5) * 0.04;
        if (bodyRef.current) bodyRef.current.position.y = 0.45 + resonance;
        if (crystalOrbiterRef.current) {
          const orbitSpeed = 12.0;
          const orbitRadius = 0.22;
          crystalOrbiterRef.current.position.set(
            Math.cos(time * orbitSpeed) * orbitRadius,
            0.58 + Math.sin(time * orbitSpeed * 2) * 0.05,
            Math.sin(time * orbitSpeed) * orbitRadius
          );
        }
        if (staffRef.current) staffRef.current.rotation.x = 0.2 + Math.sin(time * 8) * 0.05;
        
        // Ground magic circle glows/rotates
        if (magicRingGroundRef.current) {
          magicRingGroundRef.current.scale.set(1.4, 1.4, 1.4);
          magicRingGroundRef.current.position.y = -0.45;
          magicRingGroundRef.current.rotation.z = time * 3.0;
        }
      }
    }
  });

  const hairColor = '#3b0764'; // Deep dark purple hair

  return (
    <group ref={modelRef}>
      <group ref={bodyRef}>
        {/* Head Joint */}
        <group ref={headRef} position={[0, 0.68, 0]}>
          {/* Face Sphere */}
          <mesh castShadow>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshToonMaterial color="#fff1eb" roughness={0.8} />
          </mesh>
          <mesh scale={[1.05, 1.05, 1.05]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>

          {/* Main Hair (Top & Back of Head) */}
          <mesh position={[0, 0.05, -0.05]} castShadow>
            <sphereGeometry args={[0.21, 12, 12]} />
            <meshToonMaterial color={hairColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.05, -0.05]} scale={[1.04, 1.04, 1.04]}>
            <sphereGeometry args={[0.21, 12, 12]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>

          {/* Front Bangs (framing face) */}
          <group position={[0, 0.1, 0.13]} rotation={[0.18, 0, 0]}>
            <mesh castShadow>
              <coneGeometry args={[0.05, 0.16, 4]} />
              <meshToonMaterial color={hairColor} roughness={0.8} />
            </mesh>
          </group>

          {/* Left Side Lock */}
          <group position={[0.11, 0.02, 0.12]} rotation={[0.08, 0, -0.08]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.025, 0.01, 0.24, 8]} />
              <meshToonMaterial color={hairColor} roughness={0.8} />
            </mesh>
          </group>

          {/* Right Side Lock */}
          <group position={[-0.11, 0.02, 0.12]} rotation={[0.08, 0, 0.08]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.025, 0.01, 0.24, 8]} />
              <meshToonMaterial color={hairColor} roughness={0.8} />
            </mesh>
          </group>

          {/* Ornate Gold Hair Clip / Tiara */}
          <mesh position={[0, 0.12, 0.05]} rotation={[-0.1, 0, 0]}>
            <torusGeometry args={[0.12, 0.015, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.17, 0.05]}>
            <octahedronGeometry args={[0.02]} />
            <meshBasicMaterial color="#a855f7" /> {/* Violet gem in tiara center */}
          </mesh>

          {/* Anime Eyes */}
          <mesh position={[0.065, -0.01, 0.155]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.07, -0.01, 0.168]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#8b5cf6" /> {/* Violet iris */}
          </mesh>

          <mesh position={[-0.065, -0.01, 0.155]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.07, -0.01, 0.168]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#8b5cf6" />
          </mesh>

          {/* Hair Left Braid */}
          <group ref={hairLeftRef} position={[0.1, 0.03, -0.05]}>
            <mesh position={[0.06, -0.2, 0.05]} castShadow>
              <cylinderGeometry args={[0.03, 0.012, 0.45, 8]} />
              <meshToonMaterial color={hairColor} roughness={0.8} />
            </mesh>
            <mesh position={[0.06, -0.2, 0.05]} scale={[1.1, 1.02, 1.1]}>
              <cylinderGeometry args={[0.03, 0.012, 0.45, 8]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
          </group>

          {/* Hair Right Braid */}
          <group ref={hairRightRef} position={[-0.1, 0.03, -0.05]}>
            <mesh position={[-0.06, -0.2, 0.05]} castShadow>
              <cylinderGeometry args={[0.03, 0.012, 0.45, 8]} />
              <meshToonMaterial color={hairColor} roughness={0.8} />
            </mesh>
            <mesh position={[-0.06, -0.2, 0.05]} scale={[1.1, 1.02, 1.1]}>
              <cylinderGeometry args={[0.03, 0.012, 0.45, 8]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
          </group>

          {/* Long Cascading Back Hair Joint 1 (Upper) */}
          <group ref={hairBackUpperRef} position={[0, 0.02, -0.16]}>
            <mesh position={[0, -0.2, -0.04]} rotation={[-0.1, 0, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.045, 0.38, 8]} />
              <meshToonMaterial color={hairColor} roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.2, -0.04]} rotation={[-0.1, 0, 0]} scale={[1.08, 1.01, 1.08]}>
              <cylinderGeometry args={[0.06, 0.045, 0.38, 8]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>

            {/* Back Hair Joint 2 (Lower) for organic wavy trail */}
            <group ref={hairBackLowerRef} position={[0, -0.36, -0.06]}>
              <mesh position={[0, -0.2, -0.03]} rotation={[-0.08, 0, 0]} castShadow>
                <cylinderGeometry args={[0.045, 0.02, 0.42, 8]} />
                <meshToonMaterial color={hairColor} roughness={0.8} />
              </mesh>
              <mesh position={[0, -0.2, -0.03]} rotation={[-0.08, 0, 0]} scale={[1.09, 1.01, 1.09]}>
                <cylinderGeometry args={[0.045, 0.02, 0.42, 8]} />
                <meshBasicMaterial color="#000000" side={THREE.BackSide} />
              </mesh>
            </group>
          </group>
        </group>

        {/* Torso / Gown Upper */}
        <group ref={torsoRef} position={[0, 0.16, 0]}>
          {/* Gown Bodice */}
          <mesh castShadow>
            <cylinderGeometry args={[0.15, 0.18, 0.4, 8]} />
            <meshToonMaterial ref={materialRef} color="#581c87" roughness={0.7} metalness={0.2} emissive="#000000" emissiveIntensity={0} />
          </mesh>
          <mesh scale={[1.06, 1.02, 1.06]}>
            <cylinderGeometry args={[0.15, 0.18, 0.4, 8]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>

          {/* High Gold Neck Collar */}
          <mesh ref={collarRef} position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.085, 0.09, 0.05, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Ornate Gold Filigree Chest lines */}
          <mesh position={[0, 0.06, 0.15]} rotation={[0.08, 0, 0]}>
            <boxGeometry args={[0.06, 0.08, 0.025]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.06, 0.158]}>
            <octahedronGeometry args={[0.02]} />
            <meshBasicMaterial color="#a855f7" /> {/* Violet chest gem */}
          </mesh>
        </group>

        {/* Open Skirt drapes */}
        <group ref={robeSkirtRef} position={[0, -0.05, 0]}>
          {/* Skirt Upper Girdle */}
          <mesh castShadow>
            <cylinderGeometry args={[0.18, 0.22, 0.1, 8]} />
            <meshStandardMaterial color="#581c87" roughness={0.7} />
          </mesh>
          {/* Gold belt loops */}
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.185, 0.185, 0.025, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} />
          </mesh>

          {/* Left Split Drape (Solid violet + Gold border) */}
          <group ref={leftTailcoatRef} position={[-0.12, -0.05, -0.08]} rotation={[0.18, 0, -0.08]}>
            {/* Outer Gown flap */}
            <mesh position={[0, -0.28, 0]} castShadow>
              <boxGeometry args={[0.12, 0.55, 0.01]} />
              <meshToonMaterial color="#581c87" roughness={0.7} side={THREE.DoubleSide} />
            </mesh>
            {/* Gold border */}
            <mesh position={[0, -0.28, 0.005]} scale={[1.05, 1.01, 1.05]}>
              <boxGeometry args={[0.12, 0.55, 0.005]} />
              <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} wireframe />
            </mesh>
            {/* Transparent inner lining flap */}
            <mesh position={[-0.02, -0.32, -0.015]} scale={[0.9, 0.95, 0.9]}>
              <boxGeometry args={[0.11, 0.55, 0.005]} />
              <meshBasicMaterial color="#d8b4fe" transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
          </group>

          {/* Right Split Drape (Solid violet + Gold border) */}
          <group ref={rightTailcoatRef} position={[0.12, -0.05, -0.08]} rotation={[0.18, 0, 0.08]}>
            {/* Outer Gown flap */}
            <mesh position={[0, -0.28, 0]} castShadow>
              <boxGeometry args={[0.12, 0.55, 0.01]} />
              <meshToonMaterial color="#581c87" roughness={0.7} side={THREE.DoubleSide} />
            </mesh>
            {/* Gold border */}
            <mesh position={[0, -0.28, 0.005]} scale={[1.05, 1.01, 1.05]}>
              <boxGeometry args={[0.12, 0.55, 0.005]} />
              <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} wireframe />
            </mesh>
            {/* Transparent inner lining flap */}
            <mesh position={[0.02, -0.32, -0.015]} scale={[0.9, 0.95, 0.9]}>
              <boxGeometry args={[0.11, 0.55, 0.005]} />
              <meshBasicMaterial color="#d8b4fe" transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>

        {/* Left Arm Joint (Gesturing / Casting Staff) */}
        <group ref={leftArmRef} position={[-0.24, 0.32, 0]}>
          {/* Upper Arm Skin */}
          <mesh castShadow position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.035, 0.033, 0.1, 8]} />
            <meshToonMaterial color="#fff1eb" roughness={0.8} />
          </mesh>

          {/* Huge Wide Flared Sleeve */}
          <group ref={leftSleeveRef} position={[0, -0.1, 0]} rotation={[0.1, 0, 0.05]}>
            {/* Main sleeve block */}
            <mesh castShadow position={[0, -0.18, 0.02]}>
              <cylinderGeometry args={[0.035, 0.12, 0.36, 8]} />
              <meshToonMaterial color="#581c87" roughness={0.6} />
            </mesh>
            <mesh position={[0, -0.18, 0.02]} scale={[1.06, 1.01, 1.06]}>
              <cylinderGeometry args={[0.035, 0.12, 0.36, 8]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
            {/* Golden embroidery trim */}
            <mesh position={[0, -0.36, 0.02]}>
              <cylinderGeometry args={[0.122, 0.122, 0.015, 16]} />
              <meshStandardMaterial color="#ffd700" metalness={0.9} />
            </mesh>
            {/* Hanging gold tassel weight */}
            <mesh position={[0, -0.4, 0.1]}>
              <sphereGeometry args={[0.016, 6, 6]} />
              <meshStandardMaterial color="#ffd700" metalness={0.9} />
            </mesh>
          </group>

          {/* Hand */}
          <mesh position={[0, -0.22, 0]} castShadow>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshToonMaterial color="#fff1eb" />
          </mesh>

          {/* Floating/Held Astral Staff */}
          <group ref={staffRef} position={[-0.12, -0.22, 0.22]} rotation={[0.2, 0.1, 0.15]}>
            {/* Shaft (Violet/Metallic wood) */}
            <mesh castShadow>
              <cylinderGeometry args={[0.018, 0.018, 1.15, 8]} />
              <meshToonMaterial color="#4a1d95" roughness={0.5} />
            </mesh>
            <mesh scale={[1.2, 1.02, 1.2]}>
              <cylinderGeometry args={[0.018, 0.018, 1.15, 8]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>

            {/* Ornate Gold Crescent Moon Holder Head */}
            <group position={[0, 0.58, 0]}>
              {/* Crescent 1 */}
              <mesh rotation={[0, 0, 0]} castShadow>
                <torusGeometry args={[0.12, 0.018, 8, 24, Math.PI * 1.2]} />
                <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
              </mesh>
              {/* Crescent 2 (orthogonal) */}
              <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
                <torusGeometry args={[0.12, 0.018, 8, 24, Math.PI * 1.2]} />
                <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
              </mesh>
              {/* Gold star tips */}
              <mesh position={[0, 0.14, 0]}>
                <sphereGeometry args={[0.024]} />
                <meshStandardMaterial color="#ffd700" metalness={0.9} />
              </mesh>
            </group>

            {/* Central glowing starlight octahedron crystal core */}
            <mesh position={[0, 0.58, 0]} castShadow>
              <octahedronGeometry args={[0.09]} />
              <meshBasicMaterial color="#e9d5ff" transparent opacity={0.9} /> {/* Glowing crystal */}
            </mesh>

            {/* Orbiting Starlight Particle */}
            <mesh ref={crystalOrbiterRef}>
              <octahedronGeometry args={[0.032]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        </group>

        {/* Right Arm Joint */}
        <group ref={rightArmRef} position={[0.24, 0.32, 0]}>
          {/* Upper Arm Skin */}
          <mesh castShadow position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.035, 0.033, 0.1, 8]} />
            <meshToonMaterial color="#fff1eb" roughness={0.8} />
          </mesh>

          {/* Huge Wide Flared Sleeve */}
          <group ref={rightSleeveRef} position={[0, -0.1, 0]} rotation={[0.1, 0, -0.05]}>
            {/* Main sleeve block */}
            <mesh castShadow position={[0, -0.18, 0.02]}>
              <cylinderGeometry args={[0.035, 0.12, 0.36, 8]} />
              <meshToonMaterial color="#581c87" roughness={0.6} />
            </mesh>
            <mesh position={[0, -0.18, 0.02]} scale={[1.06, 1.01, 1.06]}>
              <cylinderGeometry args={[0.035, 0.12, 0.36, 8]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
            {/* Golden embroidery trim */}
            <mesh position={[0, -0.36, 0.02]}>
              <cylinderGeometry args={[0.122, 0.122, 0.015, 16]} />
              <meshStandardMaterial color="#ffd700" metalness={0.9} />
            </mesh>
            {/* Hanging gold tassel weight */}
            <mesh position={[0, -0.4, 0.1]}>
              <sphereGeometry args={[0.016, 6, 6]} />
              <meshStandardMaterial color="#ffd700" metalness={0.9} />
            </mesh>
          </group>

          {/* Hand */}
          <mesh position={[0, -0.22, 0]} castShadow>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshToonMaterial color="#fff1eb" />
          </mesh>
        </group>

        {/* Legs underneath gown */}
        {/* Left Leg Joint */}
        <group ref={leftLegRef} position={[-0.08, -0.22, 0]}>
          {/* Upper Thigh skin */}
          <mesh position={[0, -0.04, 0.02]} castShadow>
            <cylinderGeometry args={[0.044, 0.042, 0.1, 8]} />
            <meshToonMaterial color="#fff1eb" roughness={0.8} />
          </mesh>
          {/* Garter belt strap on one thigh */}
          <mesh position={[0, -0.04, 0.03]}>
            <cylinderGeometry args={[0.046, 0.046, 0.02, 8]} />
            <meshStandardMaterial color="#3f3f46" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.04, 0.076]}>
            <boxGeometry args={[0.018, 0.014, 0.01]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} />
          </mesh>

          {/* Boot Leg */}
          <mesh castShadow position={[0, -0.22, 0.02]}>
            <cylinderGeometry args={[0.046, 0.038, 0.26, 8]} />
            <meshToonMaterial color="#4c1d95" roughness={0.7} /> {/* Purple boots */}
          </mesh>
          <mesh position={[0, -0.22, 0.02]} scale={[1.07, 1.01, 1.07]}>
            <cylinderGeometry args={[0.046, 0.038, 0.26, 8]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>

          {/* Ornate Gold Knee Shield */}
          <mesh position={[0, -0.1, 0.065]} rotation={[0.06, 0, 0]} castShadow>
            <boxGeometry args={[0.075, 0.075, 0.018]} />
            <meshStandardMaterial color="#ffd700" metalness={0.85} roughness={0.1} />
          </mesh>

          {/* Wedge high heels foot */}
          <group position={[0, -0.35, 0.02]}>
            <mesh position={[0, -0.03, 0.02]} castShadow>
              <boxGeometry args={[0.085, 0.05, 0.14]} />
              <meshToonMaterial color="#4c1d95" roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.06, -0.03]} castShadow>
              <boxGeometry args={[0.045, 0.06, 0.045]} />
              <meshStandardMaterial color="#ffd700" metalness={0.9} />
            </mesh>
          </group>
        </group>

        {/* Right Leg Joint */}
        <group ref={rightLegRef} position={[0.08, -0.22, 0]}>
          {/* Upper Thigh skin */}
          <mesh position={[0, -0.04, 0.02]} castShadow>
            <cylinderGeometry args={[0.044, 0.042, 0.1, 8]} />
            <meshToonMaterial color="#fff1eb" roughness={0.8} />
          </mesh>

          {/* Boot Leg */}
          <mesh castShadow position={[0, -0.22, 0.02]}>
            <cylinderGeometry args={[0.046, 0.038, 0.26, 8]} />
            <meshToonMaterial color="#4c1d95" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.22, 0.02]} scale={[1.07, 1.01, 1.07]}>
            <cylinderGeometry args={[0.046, 0.038, 0.26, 8]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>

          {/* Ornate Gold Knee Shield */}
          <mesh position={[0, -0.1, 0.065]} rotation={[0.06, 0, 0]} castShadow>
            <boxGeometry args={[0.075, 0.075, 0.018]} />
            <meshStandardMaterial color="#ffd700" metalness={0.85} roughness={0.1} />
          </mesh>

          {/* Wedge high heels foot */}
          <group position={[0, -0.35, 0.02]}>
            <mesh position={[0, -0.03, 0.02]} castShadow>
              <boxGeometry args={[0.085, 0.05, 0.14]} />
              <meshToonMaterial color="#4c1d95" roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.06, -0.03]} castShadow>
              <boxGeometry args={[0.045, 0.06, 0.045]} />
              <meshStandardMaterial color="#ffd700" metalness={0.9} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Floating Spell Cast Magic Rings */}
      {/* 1. Magic Ring on Ground */}
      <mesh ref={magicRingGroundRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
        <torusGeometry args={[0.65, 0.03, 8, 32]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.75} /> {/* Purple spell ring */}
      </mesh>

      {/* 2. Magic Ring in Front (Staff Target Projection) */}
      <mesh ref={magicRingFrontRef} position={[0, 0.18, 0.7]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.3, 0.015, 8, 24]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}
