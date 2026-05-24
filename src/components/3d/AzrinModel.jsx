import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const lerpEuler = (euler, tx, ty, tz, alpha) => {
  euler.x = THREE.MathUtils.lerp(euler.x, tx, alpha);
  euler.y = THREE.MathUtils.lerp(euler.y, ty, alpha);
  euler.z = THREE.MathUtils.lerp(euler.z, tz, alpha);
};

export default function AzrinModel({
  animationState: propAnimationState = 'idle',
  animVariant: propAnimVariant = 0,
  animProgress: propAnimProgress = 0,
  materialRef = null
}) {
  const modelRef = useRef();
  const bodyRef = useRef();
  
  // Joint/Part Refs
  const headRef = useRef();
  const hairBackRef = useRef();   // Ponytail Upper
  const hairLowerRef = useRef();  // Ponytail Lower (Secondary motion)
  const torsoRef = useRef();
  const collarRef = useRef();
  const skirtRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const swordRef = useRef();

  // Additional detail refs
  const leftRibbonRef = useRef();
  const rightRibbonRef = useRef();
  const leftTailcoatRef = useRef();
  const rightTailcoatRef = useRef();
  const magicRingRef = useRef();

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
      headRef.current.position.set(0, 0.72, 0);
      headRef.current.rotation.set(0, 0, 0);
    }
    if (hairBackRef.current) {
      hairBackRef.current.rotation.set(0, 0, 0);
    }
    if (hairLowerRef.current) {
      hairLowerRef.current.rotation.set(0, 0, 0);
    }
    if (torsoRef.current) {
      torsoRef.current.position.set(0, 0.2, 0);
      torsoRef.current.rotation.set(0, 0, 0);
    }
    if (collarRef.current) {
      collarRef.current.rotation.set(0, 0, 0);
    }
    if (skirtRef.current) {
      skirtRef.current.position.set(0, 0.0, 0);
      skirtRef.current.rotation.set(0, 0, 0);
    }
    if (leftArmRef.current) {
      leftArmRef.current.position.set(-0.25, 0.35, 0);
      leftArmRef.current.rotation.set(0.2, 0, 0.1);
    }
    if (rightArmRef.current) {
      rightArmRef.current.position.set(0.25, 0.35, 0);
      rightArmRef.current.rotation.set(-0.2, 0, -0.1);
    }
    if (leftLegRef.current) {
      leftLegRef.current.position.set(-0.1, -0.18, 0);
      leftLegRef.current.rotation.set(0, 0, 0);
    }
    if (rightLegRef.current) {
      rightLegRef.current.position.set(0.1, -0.18, 0);
      rightLegRef.current.rotation.set(0, 0, 0);
    }
    if (swordRef.current) {
      swordRef.current.position.set(0.1, -0.28, 0.18);
      swordRef.current.rotation.set(0.8, -0.4, -0.3);
    }
    if (bodyRef.current) {
      bodyRef.current.position.set(0, 0.45, 0);
      bodyRef.current.rotation.set(0, 0, 0);
    }
    if (leftRibbonRef.current) {
      leftRibbonRef.current.rotation.set(0.4, 0, -0.15);
    }
    if (rightRibbonRef.current) {
      rightRibbonRef.current.rotation.set(0.4, 0, 0.15);
    }
    if (leftTailcoatRef.current) {
      leftTailcoatRef.current.rotation.set(0.2, 0, -0.1);
    }
    if (rightTailcoatRef.current) {
      rightTailcoatRef.current.rotation.set(0.2, 0, 0.1);
    }
    if (magicRingRef.current) {
      magicRingRef.current.scale.set(0, 0, 0);
    }

    // --- ANIMATION CONTROLLER ---
    
    // 1. DEAD STATE
    if (animationState === 'dead') {
      if (bodyRef.current) {
        bodyRef.current.position.y = -0.35;
        bodyRef.current.position.z = -0.2;
        bodyRef.current.rotation.x = -Math.PI / 2; // Lie flat on back
        bodyRef.current.rotation.z = 0.25; // angled head
      }
      if (hairBackRef.current) hairBackRef.current.rotation.x = 0.55;
      if (hairLowerRef.current) hairLowerRef.current.rotation.x = 0.35;
      if (swordRef.current) {
        swordRef.current.position.set(0.55, -0.4, 0.35);
        swordRef.current.rotation.set(0.25, 0.35, 1.4); // Sword dropped on ground
      }
      if (leftRibbonRef.current) leftRibbonRef.current.rotation.set(0.1, 0, -0.1);
      if (rightRibbonRef.current) rightRibbonRef.current.rotation.set(0.1, 0, 0.1);
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
        bodyRef.current.rotation.z = t * 0.25;
      }
      if (hairBackRef.current) hairBackRef.current.rotation.x = t * 0.55;
      if (hairLowerRef.current) hairLowerRef.current.rotation.x = t * 0.35;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -t * 1.5;
      if (swordRef.current) {
        swordRef.current.position.x = 0.1 + t * 0.45;
        swordRef.current.position.y = -0.28 - t * 0.12;
        swordRef.current.rotation.z = -0.3 + t * 1.7; // slide away
      }
      return;
    }

    // 3. BEING HIT STATE
    if (animationState === 'hit') {
      const progress = animProgress || (time % 0.8);
      const t = progress / 0.8;
      const recoil = t < 0.25 ? (t / 0.25) * 0.65 : (1 - (t - 0.25) / 0.75) * 0.65;
      
      if (bodyRef.current) {
        bodyRef.current.position.z = -recoil;
        bodyRef.current.position.y = 0.45 - recoil * 0.3;
        bodyRef.current.rotation.x = -recoil * 0.45;
      }
      if (headRef.current) headRef.current.rotation.x = -recoil * 0.35;
      if (hairBackRef.current) hairBackRef.current.rotation.x = -recoil * 0.9;
      if (hairLowerRef.current) hairLowerRef.current.rotation.x = -recoil * 0.5;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = 0.1 + recoil * 0.9;
        leftArmRef.current.rotation.x = 0.2 + recoil * 0.6;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -0.1 - recoil * 0.9;
        rightArmRef.current.rotation.x = -0.2 + recoil * 0.6;
      }
      if (leftRibbonRef.current) leftRibbonRef.current.rotation.x = 0.4 - recoil * 0.8;
      if (rightRibbonRef.current) rightRibbonRef.current.rotation.x = 0.4 - recoil * 0.8;
      return;
    }

    // 4. SPELL STATE (New!)
    if (animationState === 'spell') {
      const progress = animProgress || (time % 1.5);
      const t = Math.min(progress / 1.5, 1.0);
      const floatCycle = Math.sin(t * Math.PI) * 0.35; // Hover off ground
      
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.45 + floatCycle;
        bodyRef.current.rotation.y = Math.sin(t * Math.PI * 2) * 0.15;
      }
      if (headRef.current) headRef.current.rotation.x = -0.3 * Math.sin(t * Math.PI);
      if (hairBackRef.current) hairBackRef.current.rotation.x = -0.4 * Math.sin(t * Math.PI);
      if (hairLowerRef.current) hairLowerRef.current.rotation.x = -0.35 * Math.sin(t * Math.PI);
      
      // Right hand holds sword straight up to the sky
      if (rightArmRef.current) {
        rightArmRef.current.rotation.set(-2.5 * Math.sin(t * Math.PI), 0, 0.25 * Math.sin(t * Math.PI));
      }
      if (swordRef.current) {
        swordRef.current.position.set(0.05, -0.25, 0.15);
        swordRef.current.rotation.set(0.2, 0, 0);
      }
      // Left hand extended to channel spell
      if (leftArmRef.current) {
        leftArmRef.current.rotation.set(-1.0 * Math.sin(t * Math.PI), 0.2, 0.8 * Math.sin(t * Math.PI));
      }

      // Animate and show the casting magic ring under her feet
      if (magicRingRef.current) {
        magicRingRef.current.scale.set(t * 2.2, t * 2.2, t * 2.2);
        magicRingRef.current.position.y = -0.45 + t * 1.5;
        magicRingRef.current.rotation.z = time * 4.5;
      }
      return;
    }

    // 5. ATTACK STATE (4 variants)
    if (animationState === 'attack') {
      const progress = animProgress || (time % 1.2);
      const duration = 1.2;
      const t = progress / duration;
      const variant = animVariant % 4;

      if (variant === 0) {
        // --- Variant 1: Horizontal Slash ---
        if (t < 0.22) {
          // Wind up
          const phase = t / 0.22;
          rightArmRef.current.rotation.set(-0.7, -0.7, 0.45);
          if (swordRef.current) swordRef.current.rotation.set(1.4, -0.9, -0.6);
          bodyRef.current.rotation.y = -0.35 * phase;
          leftArmRef.current.rotation.set(0.4, 0.2, 0.2);
        } else if (t < 0.52) {
          // Swing
          const phase = (t - 0.22) / 0.3;
          const swingAngle = -0.7 + phase * 2.4;
          rightArmRef.current.rotation.set(0.1, swingAngle, -1.3);
          if (swordRef.current) swordRef.current.rotation.set(0.4, swingAngle - 0.6, 0.2);
          bodyRef.current.rotation.y = -0.35 + 0.9 * phase;
          // Ribbons swing violently
          leftRibbonRef.current.rotation.set(0.6, 0, -0.4);
          rightRibbonRef.current.rotation.set(0.6, 0, 0.4);
        } else {
          // Recovery
          const phase = (t - 0.52) / 0.48;
          bodyRef.current.rotation.y = 0.55 * (1 - phase);
          lerpEuler(rightArmRef.current.rotation, -0.2, 0, -0.1, phase);
          lerpEuler(leftArmRef.current.rotation, 0.2, 0, 0.1, phase);
        }
      } else if (variant === 1) {
        // --- Variant 2: Lunge Thrust ---
        if (t < 0.28) {
          // Pull back & crouch
          const phase = t / 0.28;
          rightArmRef.current.rotation.set(0.5, 0, 0.25);
          rightArmRef.current.position.z = -0.12 * phase;
          bodyRef.current.position.z = -0.15 * phase;
          bodyRef.current.position.y = 0.45 - 0.08 * phase;
        } else if (t < 0.55) {
          // Lunge forward
          const phase = (t - 0.28) / 0.27;
          rightArmRef.current.rotation.set(-1.5, 0, -0.15);
          rightArmRef.current.position.z = 0.28 * phase;
          if (swordRef.current) swordRef.current.rotation.set(0.0, 0, 0); // pointing sword directly forward
          bodyRef.current.position.z = 0.35 * phase;
          bodyRef.current.rotation.x = 0.18 * phase;
          leftArmRef.current.rotation.set(0.8, -0.3, 0.5); // extended back for balance
        } else {
          // Return
          const phase = (t - 0.55) / 0.45;
          bodyRef.current.position.z = 0.35 * (1 - phase);
          bodyRef.current.position.y = 0.37 + 0.08 * phase;
          bodyRef.current.rotation.x = 0.18 * (1 - phase);
          lerpEuler(rightArmRef.current.rotation, -0.2, 0, -0.1, phase);
          rightArmRef.current.position.lerp(new THREE.Vector3(0.25, 0.35, 0), phase);
          lerpEuler(leftArmRef.current.rotation, 0.2, 0, 0.1, phase);
        }
      } else if (variant === 2) {
        // --- Variant 3: Whirlwind Spin ---
        if (t < 0.18) {
          // Squat / gather force
          const phase = t / 0.18;
          bodyRef.current.position.y = 0.45 - 0.12 * phase;
          rightArmRef.current.rotation.set(0, -0.9, -0.25);
        } else if (t < 0.72) {
          // Spin 360 degrees & float up slightly
          const phase = (t - 0.18) / 0.54;
          const spinAngle = phase * Math.PI * 2;
          bodyRef.current.rotation.y = spinAngle;
          bodyRef.current.position.y = 0.33 + Math.sin(phase * Math.PI) * 0.25;
          
          // Extend arms with sword outward
          rightArmRef.current.rotation.set(-1.6, 0, -1.3);
          leftArmRef.current.rotation.set(-1.6, 0, 1.3);
          // Dress and ribbons swing outwards
          leftTailcoatRef.current.rotation.set(0.6, 0, -0.4);
          rightTailcoatRef.current.rotation.set(0.6, 0, 0.4);
          leftRibbonRef.current.rotation.set(0.8, 0, -0.5);
          rightRibbonRef.current.rotation.set(0.8, 0, 0.5);
        } else {
          // Finish spin
          const phase = (t - 0.72) / 0.28;
          bodyRef.current.rotation.y = Math.PI * 2 * (1 - phase);
          bodyRef.current.position.y = 0.33 + 0.12 * phase;
          lerpEuler(rightArmRef.current.rotation, -0.2, 0, -0.1, phase);
          lerpEuler(leftArmRef.current.rotation, 0.2, 0, 0.1, phase);
        }
      } else {
        // --- Variant 4: Heavy Overhead Slam ---
        if (t < 0.38) {
          // Raise sword with both arms & leap up
          const phase = t / 0.38;
          rightArmRef.current.rotation.set(-2.2, 0, -0.55);
          rightArmRef.current.position.x = 0.14;
          rightArmRef.current.position.y = 0.42;
          leftArmRef.current.rotation.set(-2.2, 0, 0.55);
          leftArmRef.current.position.x = -0.14;
          leftArmRef.current.position.y = 0.42;
          
          if (swordRef.current) {
            swordRef.current.position.set(0.0, 0.22, 0.18);
            swordRef.current.rotation.set(2.8, 0, 0); // Pointing straight up/back
          }
          bodyRef.current.rotation.x = -0.18 * phase;
          bodyRef.current.position.y = 0.45 + 0.15 * phase;
        } else if (t < 0.62) {
          // Slam down to the ground & bend knees
          const phase = (t - 0.38) / 0.24;
          rightArmRef.current.rotation.set(-0.35, 0, -0.25);
          leftArmRef.current.rotation.set(-0.35, 0, 0.25);
          if (swordRef.current) {
            swordRef.current.position.set(0.08, -0.22, 0.45);
            swordRef.current.rotation.set(0.2, 0, 0);
          }
          bodyRef.current.rotation.x = -0.18 + 0.45 * phase;
          bodyRef.current.position.y = 0.6 - 0.35 * phase;
          leftLegRef.current.rotation.x = -0.25 * phase;
          rightLegRef.current.rotation.x = -0.25 * phase;
        } else {
          // Recover
          const phase = (t - 0.62) / 0.38;
          bodyRef.current.rotation.x = 0.27 * (1 - phase);
          bodyRef.current.position.y = 0.25 + 0.2 * phase;
          lerpEuler(rightArmRef.current.rotation, -0.2, 0, -0.1, phase);
          rightArmRef.current.position.lerp(new THREE.Vector3(0.25, 0.35, 0), phase);
          lerpEuler(leftArmRef.current.rotation, 0.2, 0, 0.1, phase);
          leftArmRef.current.position.lerp(new THREE.Vector3(-0.25, 0.35, 0), phase);
        }
      }
      return;
    }

    // 6. WALK & RUN CYCLIC STATES
    if (animationState === 'walk' || animationState === 'run') {
      const isRun = animationState === 'run';
      const freq = isRun ? 18 : 10;
      const legSwingAmp = isRun ? 0.8 : 0.42;
      const armSwingAmp = isRun ? 0.9 : 0.48;
      const bobAmp = isRun ? 0.09 : 0.048;
      const leanAngle = isRun ? 0.25 : 0.08;
      const cycle = time * freq;

      // Body bobbing, forward lean, and waist twisting
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.45 + Math.sin(cycle * 2) * bobAmp;
        bodyRef.current.rotation.x = leanAngle;
        bodyRef.current.rotation.y = Math.sin(cycle) * (isRun ? 0.14 : 0.06); // Twist waist!
      }

      // Legs swing (alternating)
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(cycle) * legSwingAmp;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(cycle) * legSwingAmp;

      // Arms swing (alternating)
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = 0.2 - Math.sin(cycle) * armSwingAmp;
        leftArmRef.current.rotation.z = 0.1 + Math.abs(Math.sin(cycle)) * 0.2;
      }
      
      if (rightArmRef.current) {
        if (isRun) {
          // Running stance: holds sword in a ready combat guard pose in front
          rightArmRef.current.rotation.set(-0.8, -0.3, -0.2);
          if (swordRef.current) swordRef.current.rotation.x = 0.6 + Math.sin(cycle) * 0.1;
        } else {
          // Walking stance: swings sword hand gently
          rightArmRef.current.rotation.x = -0.2 + Math.sin(cycle) * armSwingAmp;
          if (swordRef.current) swordRef.current.rotation.x = 0.8 + Math.cos(cycle) * 0.12;
        }
      }

      // Ribbons sway in waves (delayed cycle)
      if (leftRibbonRef.current) leftRibbonRef.current.rotation.x = 0.4 + Math.sin(cycle * 2) * 0.15 + (isRun ? 0.45 : 0.18);
      if (rightRibbonRef.current) rightRibbonRef.current.rotation.x = 0.4 + Math.cos(cycle * 2) * 0.15 + (isRun ? 0.45 : 0.18);

      // Tailcoat waves
      if (leftTailcoatRef.current) leftTailcoatRef.current.rotation.x = 0.2 + Math.sin(cycle * 2) * 0.08 + (isRun ? 0.25 : 0.06);
      if (rightTailcoatRef.current) rightTailcoatRef.current.rotation.x = 0.2 + Math.cos(cycle * 2) * 0.08 + (isRun ? 0.25 : 0.06);

      // Ponytail waves in secondary motion
      if (hairBackRef.current) {
        hairBackRef.current.rotation.x = isRun ? -0.5 + Math.cos(cycle * 2) * 0.09 : -0.16 + Math.cos(cycle * 2) * 0.045;
      }
      if (hairLowerRef.current) {
        hairLowerRef.current.rotation.x = isRun ? -0.4 + Math.cos(cycle * 2 - 0.5) * 0.12 : -0.1 + Math.cos(cycle * 2 - 0.5) * 0.06;
      }
      return;
    }

    // 7. IDLE STATES (4 variants)
    if (animationState === 'idle') {
      const variant = animVariant % 4;
      const breath = Math.sin(time * 2.2) * 0.025; // Soft breathing cycle
      
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.45 + breath;
      }
      if (torsoRef.current) {
        torsoRef.current.rotation.z = Math.sin(time * 1.5) * 0.01; // micro body sway
      }
      
      // Secondary ponytail breathing motion
      if (hairBackRef.current) {
        hairBackRef.current.rotation.z = Math.sin(time * 1.5) * 0.04;
        hairBackRef.current.rotation.x = Math.sin(time * 1.1) * 0.03;
      }
      if (hairLowerRef.current) {
        hairLowerRef.current.rotation.z = Math.sin(time * 1.5 - 0.3) * 0.05;
        hairLowerRef.current.rotation.x = Math.sin(time * 1.1 - 0.3) * 0.04;
      }

      // Ribbon breathing sway
      if (leftRibbonRef.current) {
        leftRibbonRef.current.rotation.x = 0.4 + Math.sin(time * 1.2) * 0.04;
        leftRibbonRef.current.rotation.z = -0.15 + Math.sin(time * 1.5) * 0.03;
      }
      if (rightRibbonRef.current) {
        rightRibbonRef.current.rotation.x = 0.4 + Math.cos(time * 1.2) * 0.04;
        rightRibbonRef.current.rotation.z = 0.15 - Math.sin(time * 1.5) * 0.03;
      }

      // Skirt tailcoat breathing sway
      if (leftTailcoatRef.current) leftTailcoatRef.current.rotation.x = 0.2 + Math.sin(time * 1.3) * 0.02;
      if (rightTailcoatRef.current) rightTailcoatRef.current.rotation.x = 0.2 + Math.cos(time * 1.3) * 0.02;

      if (variant === 0) {
        // --- Variant 1: Pure Breathing ---
        if (headRef.current) headRef.current.rotation.y = Math.sin(time * 0.5) * 0.05;
      } else if (variant === 1) {
        // --- Variant 2: Weapon Inspect ---
        const cycle = (time * 0.6) % (Math.PI * 2);
        const actionPhase = Math.sin(cycle);
        
        if (actionPhase > 0) {
          // Lifts short sword, tilts head, strokes left hand near blade, shifts weight
          if (rightArmRef.current) {
            rightArmRef.current.rotation.set(-1.1 + actionPhase * 0.45, -0.65 * actionPhase, -0.45 * actionPhase);
          }
          if (headRef.current) {
            headRef.current.rotation.set(0.15 * actionPhase, 0.4 * actionPhase, 0);
          }
          if (swordRef.current) {
            swordRef.current.rotation.set(0.8 - actionPhase * 0.65, -0.4, 0.25 * actionPhase);
          }
          if (leftArmRef.current) {
            leftArmRef.current.rotation.set(-0.6 * actionPhase, 0.3 * actionPhase, 0.3 * actionPhase);
          }
          if (bodyRef.current) {
            bodyRef.current.position.x = actionPhase * 0.06;
          }
        }
      } else if (variant === 2) {
        // --- Variant 3: Stretch & Look Around ---
        const cycle = (time * 0.4) % (Math.PI * 2);
        
        if (Math.sin(cycle) > 0.3) {
          const intensity = (Math.sin(cycle) - 0.3) / 0.7;
          if (headRef.current) headRef.current.rotation.y = 0.5 * Math.sin(intensity * Math.PI * 2);
          if (leftArmRef.current) leftArmRef.current.rotation.z = 0.15 + intensity * 0.45;
          if (rightArmRef.current) rightArmRef.current.rotation.z = -0.15 - intensity * 0.45;
          if (hairBackRef.current) hairBackRef.current.rotation.x = -0.1 - intensity * 0.15;
        }
      } else {
        // --- Variant 4: Ether Surge (Glow & Float) ---
        const surgeCycle = Math.sin(time * 4) * 0.09;
        if (bodyRef.current) {
          bodyRef.current.position.y = 0.45 + surgeCycle;
        }
        if (hairBackRef.current) hairBackRef.current.rotation.x = -0.22 + Math.sin(time * 6) * 0.08;
        if (hairLowerRef.current) hairLowerRef.current.rotation.x = -0.15 + Math.sin(time * 6 - 0.5) * 0.1;
        if (swordRef.current) swordRef.current.position.y = -0.28 + surgeCycle * 0.6;
        if (rightArmRef.current) rightArmRef.current.rotation.set(-0.6 + Math.sin(time * 2) * 0.1, -0.2, -0.1);
        
        // Small casting ring rotates at feet
        if (magicRingRef.current) {
          magicRingRef.current.scale.set(1.2, 1.2, 1.2);
          magicRingRef.current.position.y = -0.45;
          magicRingRef.current.rotation.z = time * 3.0;
        }
      }
    }
  });

  return (
    <group ref={modelRef}>
      <group ref={bodyRef}>
        {/* Head Joint */}
        <group ref={headRef} position={[0, 0.72, 0]}>
          {/* Face Sphere */}
          <mesh castShadow>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshToonMaterial color="#fff1eb" roughness={0.8} />
          </mesh>
          {/* Cel-shading Outline */}
          <mesh scale={[1.05, 1.05, 1.05]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>

          {/* Main Hair (Back of Head) */}
          <mesh position={[0, 0.05, -0.06]} castShadow>
            <sphereGeometry args={[0.23, 12, 12]} />
            <meshToonMaterial color="#4a3728" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.05, -0.06]} scale={[1.04, 1.04, 1.04]}>
            <sphereGeometry args={[0.23, 12, 12]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>

          {/* Front Bangs (framing face) */}
          <group position={[0, 0.12, 0.15]} rotation={[0.2, 0, 0]}>
            <mesh castShadow>
              <coneGeometry args={[0.06, 0.18, 4]} />
              <meshToonMaterial color="#4a3728" roughness={0.8} />
            </mesh>
          </group>

          {/* Left Side Lock */}
          <group position={[0.13, 0.04, 0.14]} rotation={[0.1, 0, -0.1]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.03, 0.01, 0.28, 8]} />
              <meshToonMaterial color="#4a3728" roughness={0.8} />
            </mesh>
          </group>

          {/* Right Side Lock */}
          <group position={[-0.13, 0.04, 0.14]} rotation={[0.1, 0, 0.1]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.03, 0.01, 0.28, 8]} />
              <meshToonMaterial color="#4a3728" roughness={0.8} />
            </mesh>
          </group>

          {/* Golden Headband / Hairband */}
          <mesh position={[0, 0.08, -0.15]} rotation={[0.1, 0, 0]}>
            <torusGeometry args={[0.075, 0.02, 8, 16]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Ponytail Upper */}
          <group ref={hairBackRef} position={[0, 0.06, -0.17]}>
            <mesh castShadow position={[0, -0.15, -0.04]} rotation={[-0.15, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.045, 0.32, 8]} />
              <meshToonMaterial color="#4a3728" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.15, -0.04]} rotation={[-0.15, 0, 0]} scale={[1.08, 1.02, 1.08]}>
              <cylinderGeometry args={[0.06, 0.045, 0.32, 8]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>

            {/* Ponytail Lower (for secondary chain movement) */}
            <group ref={hairLowerRef} position={[0, -0.28, -0.07]}>
              <mesh castShadow position={[0, -0.18, -0.04]} rotation={[-0.1, 0, 0]}>
                <cylinderGeometry args={[0.045, 0.02, 0.36, 8]} />
                <meshToonMaterial color="#4a3728" roughness={0.8} />
              </mesh>
              <mesh position={[0, -0.18, -0.04]} rotation={[-0.1, 0, 0]} scale={[1.1, 1.02, 1.1]}>
                <cylinderGeometry args={[0.045, 0.02, 0.36, 8]} />
                <meshBasicMaterial color="#000000" side={THREE.BackSide} />
              </mesh>
            </group>
          </group>

          {/* Anime Eyes */}
          {/* Left Eye */}
          <mesh position={[0.07, -0.01, 0.17]}>
            <sphereGeometry args={[0.038, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.08, -0.01, 0.185]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshBasicMaterial color="#0ea5e9" /> {/* Sky Blue Iris */}
          </mesh>
          <mesh position={[0.09, 0.0, 0.198]}>
            <sphereGeometry args={[0.009, 8, 8]} />
            <meshBasicMaterial color="#ffffff" /> {/* Eye shine */}
          </mesh>

          {/* Right Eye */}
          <mesh position={[-0.07, -0.01, 0.17]}>
            <sphereGeometry args={[0.038, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.08, -0.01, 0.185]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshBasicMaterial color="#0ea5e9" />
          </mesh>
          <mesh position={[-0.09, 0.0, 0.198]}>
            <sphereGeometry args={[0.009, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Torso / Bodice Armor */}
        <group ref={torsoRef} position={[0, 0.2, 0]}>
          {/* Magenta/Pink Bodice */}
          <mesh castShadow>
            <cylinderGeometry args={[0.17, 0.21, 0.42, 8]} />
            <meshToonMaterial ref={materialRef} color="#be185d" roughness={0.5} metalness={0.25} emissive="#000000" emissiveIntensity={0} />
          </mesh>
          <mesh scale={[1.05, 1.02, 1.05]}>
            <cylinderGeometry args={[0.17, 0.21, 0.42, 8]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>

          {/* High Gold/Magenta Collar */}
          <mesh ref={collarRef} position={[0, 0.23, 0]}>
            <cylinderGeometry args={[0.09, 0.1, 0.06, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Gold Filigree / Breastplate Emblem */}
          <mesh position={[0, 0.08, 0.18]} rotation={[0.08, 0, 0]}>
            <boxGeometry args={[0.07, 0.08, 0.03]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.08, 0.185]}>
            <octahedronGeometry args={[0.022]} />
            <meshBasicMaterial color="#ec4899" /> {/* Pink heart gem */}
          </mesh>
          <mesh position={[0, -0.06, 0.19]} rotation={[0.05, 0, 0]}>
            <boxGeometry args={[0.02, 0.14, 0.015]} /> {/* Vertical gold trim line */}
            <meshStandardMaterial color="#d4af37" metalness={0.8} />
          </mesh>

          {/* Ornate Layered Pauldrons (Shoulders) */}
          {/* Left Pauldron */}
          <group position={[-0.22, 0.16, 0]}>
            {/* Plate 1 (Upper, gold) */}
            <mesh castShadow position={[0.02, 0.03, 0]} rotation={[0, 0, 0.15]}>
              <sphereGeometry args={[0.065, 8, 8]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Plate 2 (Middle, magenta) */}
            <mesh castShadow position={[-0.01, -0.01, 0]} rotation={[0, 0, 0.08]} scale={[0.95, 0.95, 0.95]}>
              <sphereGeometry args={[0.065, 8, 8]} />
              <meshToonMaterial color="#be185d" roughness={0.5} />
            </mesh>
            {/* Plate 3 (Lower, gold) */}
            <mesh castShadow position={[-0.04, -0.05, 0]} rotation={[0, 0, 0]} scale={[0.9, 0.9, 0.9]}>
              <sphereGeometry args={[0.065, 8, 8]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>

          {/* Right Pauldron */}
          <group position={[0.22, 0.16, 0]}>
            {/* Plate 1 (Upper, gold) */}
            <mesh castShadow position={[-0.02, 0.03, 0]} rotation={[0, 0, -0.15]}>
              <sphereGeometry args={[0.065, 8, 8]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Plate 2 (Middle, magenta) */}
            <mesh castShadow position={[0.01, -0.01, 0]} rotation={[0, 0, -0.08]} scale={[0.95, 0.95, 0.95]}>
              <sphereGeometry args={[0.065, 8, 8]} />
              <meshToonMaterial color="#be185d" roughness={0.5} />
            </mesh>
            {/* Plate 3 (Lower, gold) */}
            <mesh castShadow position={[0.04, -0.05, 0]} rotation={[0, 0, 0]} scale={[0.9, 0.9, 0.9]}>
              <sphereGeometry args={[0.065, 8, 8]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>

          {/* Flowing Shoulder Capes / Ribbons */}
          {/* Left Ribbon */}
          <group ref={leftRibbonRef} position={[-0.2, 0.08, -0.08]} rotation={[0.4, 0, -0.15]}>
            <mesh position={[0, -0.4, 0]}>
              <boxGeometry args={[0.05, 0.8, 0.01]} />
              <meshBasicMaterial color="#f472b6" transparent opacity={0.45} side={THREE.DoubleSide} />
            </mesh>
          </group>
          {/* Right Ribbon */}
          <group ref={rightRibbonRef} position={[0.2, 0.08, -0.08]} rotation={[0.4, 0, 0.15]}>
            <mesh position={[0, -0.4, 0]}>
              <boxGeometry args={[0.05, 0.8, 0.01]} />
              <meshBasicMaterial color="#f472b6" transparent opacity={0.45} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>

        {/* Split Skirt */}
        <group ref={skirtRef} position={[0, 0.0, 0]}>
          {/* Upper Skirt Base */}
          <mesh castShadow>
            <cylinderGeometry args={[0.22, 0.26, 0.14, 8]} />
            <meshStandardMaterial color="#be185d" roughness={0.5} />
          </mesh>
          {/* Gold belt / waist rim */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.225, 0.225, 0.03, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.06, 0.21]}>
            <octahedronGeometry args={[0.03]} />
            <meshBasicMaterial color="#00ffff" /> {/* glowing gem buckle */}
          </mesh>

          {/* Front gold-rimmed tabard */}
          <mesh position={[0, -0.14, 0.21]} rotation={[0.08, 0, 0]}>
            <boxGeometry args={[0.11, 0.26, 0.015]} />
            <meshToonMaterial color="#be185d" roughness={0.5} />
          </mesh>
          {/* Tabard Gold Trim */}
          <mesh position={[0, -0.14, 0.22]} rotation={[0.08, 0, 0]}>
            <boxGeometry args={[0.12, 0.27, 0.005]} />
            <meshBasicMaterial color="#d4af37" wireframe />
          </mesh>

          {/* Tailcoats (Long Drapes) */}
          {/* Left Tailcoat */}
          <group ref={leftTailcoatRef} position={[-0.14, -0.05, -0.1]} rotation={[0.2, 0, -0.1]}>
            <mesh position={[0, -0.32, 0]}>
              <boxGeometry args={[0.14, 0.65, 0.01]} />
              <meshToonMaterial color="#be185d" roughness={0.6} side={THREE.DoubleSide} />
            </mesh>
            {/* Gold border */}
            <mesh position={[0, -0.32, 0.005]} scale={[1.05, 1.01, 1.05]}>
              <boxGeometry args={[0.14, 0.65, 0.005]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} wireframe />
            </mesh>
          </group>

          {/* Right Tailcoat */}
          <group ref={rightTailcoatRef} position={[0.14, -0.05, -0.1]} rotation={[0.2, 0, 0.1]}>
            <mesh position={[0, -0.32, 0]}>
              <boxGeometry args={[0.14, 0.65, 0.01]} />
              <meshToonMaterial color="#be185d" roughness={0.6} side={THREE.DoubleSide} />
            </mesh>
            {/* Gold border */}
            <mesh position={[0, -0.32, 0.005]} scale={[1.05, 1.01, 1.05]}>
              <boxGeometry args={[0.14, 0.65, 0.005]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} wireframe />
            </mesh>
          </group>
        </group>

        {/* Left Arm Joint */}
        <group ref={leftArmRef} position={[-0.25, 0.35, 0]}>
          {/* Upper Arm Skin */}
          <mesh castShadow position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.04, 0.038, 0.12, 8]} />
            <meshToonMaterial color="#fff1eb" roughness={0.8} />
          </mesh>
          {/* Forearm Gauntlet (Bronze/Gold) */}
          <mesh castShadow position={[0, -0.18, 0]}>
            <cylinderGeometry args={[0.038, 0.032, 0.14, 8]} />
            <meshStandardMaterial color="#8a5c38" metalness={0.5} roughness={0.4} /> {/* brown base */}
          </mesh>
          {/* Gold wrist ring */}
          <mesh position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.041, 0.041, 0.02, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.24, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.02, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} />
          </mesh>
          {/* Fingerless glove hand */}
          <mesh position={[0, -0.27, 0]} castShadow>
            <sphereGeometry args={[0.034, 8, 8]} />
            <meshToonMaterial color="#221c1a" /> {/* dark leather */}
          </mesh>
        </group>

        {/* Right Arm Joint (Holding Short Sword) */}
        <group ref={rightArmRef} position={[0.25, 0.35, 0]}>
          {/* Upper Arm Skin */}
          <mesh castShadow position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.04, 0.038, 0.12, 8]} />
            <meshToonMaterial color="#fff1eb" roughness={0.8} />
          </mesh>
          {/* Forearm Gauntlet */}
          <mesh castShadow position={[0, -0.18, 0]}>
            <cylinderGeometry args={[0.038, 0.032, 0.14, 8]} />
            <meshStandardMaterial color="#8a5c38" metalness={0.5} roughness={0.4} />
          </mesh>
          {/* Gold wrist rings */}
          <mesh position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.041, 0.041, 0.02, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.24, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.02, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} />
          </mesh>
          {/* Fingerless glove hand */}
          <mesh position={[0, -0.27, 0]} castShadow>
            <sphereGeometry args={[0.034, 8, 8]} />
            <meshToonMaterial color="#221c1a" />
          </mesh>

          {/* Detailed Short Sword */}
          <group ref={swordRef} position={[0.1, -0.28, 0.18]} rotation={[0.8, -0.4, -0.3]}>
            {/* Blade: Steel with Gold Filigree */}
            <mesh castShadow position={[0, 0.28, 0]}>
              <boxGeometry args={[0.032, 0.65, 0.08]} />
              <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.15} />
            </mesh>
            {/* Gold blade center rib */}
            <mesh position={[0, 0.25, 0.041]}>
              <boxGeometry args={[0.006, 0.5, 0.005]} />
              <meshStandardMaterial color="#ffd700" metalness={0.9} />
            </mesh>
            {/* Winged Gold Crossguard */}
            <group position={[0, -0.06, 0]}>
              {/* Center block */}
              <mesh castShadow>
                <boxGeometry args={[0.07, 0.06, 0.08]} />
                <meshStandardMaterial color="#ffd700" metalness={0.85} roughness={0.15} />
              </mesh>
              {/* Left wing guard */}
              <mesh position={[-0.07, 0.02, 0]} rotation={[0, 0, -0.3]} castShadow>
                <coneGeometry args={[0.035, 0.12, 4]} />
                <meshStandardMaterial color="#ffd700" metalness={0.85} />
              </mesh>
              {/* Right wing guard */}
              <mesh position={[0.07, 0.02, 0]} rotation={[0, 0, 0.3]} castShadow>
                <coneGeometry args={[0.035, 0.12, 4]} />
                <meshStandardMaterial color="#ffd700" metalness={0.85} />
              </mesh>
              {/* Ruby gem in center */}
              <mesh position={[0, 0, 0.042]} rotation={[Math.PI / 4, 0, 0]}>
                <octahedronGeometry args={[0.022]} />
                <meshBasicMaterial color="#ef4444" />
              </mesh>
            </group>
            {/* Sword handle hilt */}
            <mesh position={[0, -0.16, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.15, 8]} />
              <meshStandardMaterial color="#1e293b" roughness={0.8} /> {/* dark grip */}
            </mesh>
            {/* Gold pommel sphere */}
            <mesh position={[0, -0.24, 0]} castShadow>
              <sphereGeometry args={[0.03]} />
              <meshStandardMaterial color="#ffd700" metalness={0.9} />
            </mesh>
          </group>
        </group>

        {/* Left Leg Joint */}
        <group ref={leftLegRef} position={[-0.1, -0.18, 0]}>
          {/* Upper Thigh skin */}
          <mesh position={[0, -0.05, 0]} castShadow>
            <cylinderGeometry args={[0.046, 0.044, 0.12, 8]} />
            <meshToonMaterial color="#fff1eb" roughness={0.8} />
          </mesh>
          {/* Thigh buckled garter strap */}
          <mesh position={[0, -0.04, 0.01]}>
            <cylinderGeometry args={[0.048, 0.048, 0.022, 8]} />
            <meshStandardMaterial color="#573c24" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.04, 0.058]}>
            <boxGeometry args={[0.02, 0.015, 0.01]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} /> {/* gold buckle */}
          </mesh>

          {/* Thigh-High Boot Leg */}
          <mesh castShadow position={[0, -0.24, 0]}>
            <cylinderGeometry args={[0.048, 0.04, 0.28, 8]} />
            <meshToonMaterial color="#1c1917" roughness={0.8} /> {/* Black/Dark charcoal leather */}
          </mesh>
          <mesh position={[0, -0.24, 0]} scale={[1.07, 1.01, 1.07]}>
            <cylinderGeometry args={[0.048, 0.04, 0.28, 8]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>

          {/* Ornate Gold Knee Guard */}
          <group position={[0, -0.11, 0.04]} rotation={[0.08, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.08, 0.08, 0.02]} />
              <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.15} />
            </mesh>
            <mesh position={[0, 0, 0.012]} rotation={[Math.PI / 4, 0, 0]}>
              <octahedronGeometry args={[0.015]} />
              <meshBasicMaterial color="#be185d" /> {/* pink knee gem */}
            </mesh>
          </group>

          {/* Gold shin plate */}
          <mesh position={[0, -0.24, 0.042]} rotation={[0.05, 0, 0]} castShadow>
            <boxGeometry args={[0.05, 0.16, 0.015]} />
            <meshStandardMaterial color="#d4af37" metalness={0.85} />
          </mesh>

          {/* Foot with high wedge heel */}
          <group position={[0, -0.38, 0]}>
            {/* Boot sole foot */}
            <mesh position={[0, -0.03, 0.02]} castShadow>
              <boxGeometry args={[0.09, 0.06, 0.15]} />
              <meshToonMaterial color="#1c1917" roughness={0.8} />
            </mesh>
            {/* Gold boot tip cap */}
            <mesh position={[0, -0.03, 0.085]} castShadow>
              <boxGeometry args={[0.075, 0.04, 0.03]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} />
            </mesh>
            {/* Wedge heel */}
            <mesh position={[0, -0.065, -0.04]} castShadow>
              <boxGeometry args={[0.05, 0.07, 0.05]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} />
            </mesh>
          </group>
        </group>

        {/* Right Leg Joint */}
        <group ref={rightLegRef} position={[0.1, -0.18, 0]}>
          {/* Upper Thigh skin */}
          <mesh position={[0, -0.05, 0]} castShadow>
            <cylinderGeometry args={[0.046, 0.044, 0.12, 8]} />
            <meshToonMaterial color="#fff1eb" roughness={0.8} />
          </mesh>
          {/* Thigh buckled garter strap */}
          <mesh position={[0, -0.04, 0.01]}>
            <cylinderGeometry args={[0.048, 0.048, 0.022, 8]} />
            <meshStandardMaterial color="#573c24" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.04, 0.058]}>
            <boxGeometry args={[0.02, 0.015, 0.01]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} />
          </mesh>

          {/* Thigh-High Boot Leg */}
          <mesh castShadow position={[0, -0.24, 0]}>
            <cylinderGeometry args={[0.048, 0.04, 0.28, 8]} />
            <meshToonMaterial color="#1c1917" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.24, 0]} scale={[1.07, 1.01, 1.07]}>
            <cylinderGeometry args={[0.048, 0.04, 0.28, 8]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>

          {/* Ornate Gold Knee Guard */}
          <group position={[0, -0.11, 0.04]} rotation={[0.08, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.08, 0.08, 0.02]} />
              <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.15} />
            </mesh>
            <mesh position={[0, 0, 0.012]} rotation={[Math.PI / 4, 0, 0]}>
              <octahedronGeometry args={[0.015]} />
              <meshBasicMaterial color="#be185d" />
            </mesh>
          </group>

          {/* Gold shin plate */}
          <mesh position={[0, -0.24, 0.042]} rotation={[0.05, 0, 0]} castShadow>
            <boxGeometry args={[0.05, 0.16, 0.015]} />
            <meshStandardMaterial color="#d4af37" metalness={0.85} />
          </mesh>

          {/* Foot with high wedge heel */}
          <group position={[0, -0.38, 0]}>
            <mesh position={[0, -0.03, 0.02]} castShadow>
              <boxGeometry args={[0.09, 0.06, 0.15]} />
              <meshToonMaterial color="#1c1917" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.03, 0.085]} castShadow>
              <boxGeometry args={[0.075, 0.04, 0.03]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} />
            </mesh>
            <mesh position={[0, -0.065, -0.04]} castShadow>
              <boxGeometry args={[0.05, 0.07, 0.05]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Spell casting Magic Ring Torus */}
      <mesh ref={magicRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
        <torusGeometry args={[0.65, 0.03, 8, 32]} />
        <meshBasicMaterial color="#ffd700" transparent opacity={0.65} />
      </mesh>
    </group>
  );
}
