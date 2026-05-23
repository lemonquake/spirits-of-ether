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
  const hairBackRef = useRef();
  const torsoRef = useRef();
  const skirtRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const swordRef = useRef();

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
    
    // Reset all transformations before applying animation frame
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
    if (torsoRef.current) {
      torsoRef.current.position.set(0, 0.2, 0);
      torsoRef.current.rotation.set(0, 0, 0);
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
      swordRef.current.position.set(0.1, -0.3, 0.2);
      swordRef.current.rotation.set(0.8, -0.4, -0.3);
    }
    if (bodyRef.current) {
      bodyRef.current.position.set(0, 0.45, 0);
      bodyRef.current.rotation.set(0, 0, 0);
    }

    // --- ANIMATION CONTROLLER ---
    
    // 1. DEAD / DYING STATES
    if (animationState === 'dead') {
      if (bodyRef.current) {
        bodyRef.current.position.y = -0.35;
        bodyRef.current.position.z = -0.2;
        bodyRef.current.rotation.x = -Math.PI / 2; // Lie flat
        bodyRef.current.rotation.z = 0.2; // Slightly angled head
      }
      if (hairBackRef.current) {
        hairBackRef.current.rotation.x = 0.5; // Hair flat
      }
      if (swordRef.current) {
        swordRef.current.position.set(0.5, -0.4, 0.3);
        swordRef.current.rotation.set(0.2, 0.3, 1.3); // Sword lying nearby
      }
      return;
    }

    if (animationState === 'dying') {
      const progress = animProgress || (time % 1.5); // Fall duration 1.5s max
      const t = Math.min(progress / 1.2, 1.0); // clamped to 1
      
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.45 - t * 0.8;
        bodyRef.current.position.z = -t * 0.2;
        bodyRef.current.rotation.x = -t * (Math.PI / 2);
        bodyRef.current.rotation.z = t * 0.2;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -t * 1.5;
      }
      if (swordRef.current) {
        swordRef.current.position.x = 0.1 + t * 0.4;
        swordRef.current.position.y = -0.3 - t * 0.1;
        swordRef.current.rotation.z = -0.3 + t * 1.6;
      }
      return;
    }

    // 2. HIT STATE
    if (animationState === 'hit') {
      const progress = animProgress || (time % 0.8);
      const duration = 0.8;
      const t = progress / duration;
      
      let recoil;
      if (t < 0.2) {
        // Sudden jerk back
        recoil = (t / 0.2) * 0.5;
      } else {
        // Slow spring recovery
        recoil = (1 - (t - 0.2) / 0.8) * 0.5;
      }

      if (bodyRef.current) {
        bodyRef.current.position.z = -recoil;
        bodyRef.current.position.y = 0.45 - recoil * 0.3;
        bodyRef.current.rotation.x = -recoil * 0.4;
      }
      if (headRef.current) {
        headRef.current.rotation.x = -recoil * 0.3;
      }
      if (hairBackRef.current) {
        hairBackRef.current.rotation.x = -recoil * 0.8;
      }
      if (leftArmRef.current) leftArmRef.current.rotation.z = 0.1 + recoil * 0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.z = -0.1 - recoil * 0.8;
      return;
    }

    // 3. ATTACK STATES (4 variants)
    if (animationState === 'attack') {
      const progress = animProgress || (time % 1.2);
      const duration = 1.2;
      const t = progress / duration;
      
      const variant = animVariant % 4;

      if (variant === 0) {
        // --- Variant 1: Horizontal Slash ---
        if (t < 0.25) {
          // Wind up
          const phase = t / 0.25;
          rightArmRef.current.rotation.set(-0.8, -0.6, 0.4);
          if (swordRef.current) swordRef.current.rotation.set(1.5, -0.8, -0.5);
          bodyRef.current.rotation.y = -0.3 * phase;
        } else if (t < 0.55) {
          // Slash sweep
          const phase = (t - 0.25) / 0.3;
          const swingAngle = -0.8 + phase * 2.2;
          rightArmRef.current.rotation.set(0.2, swingAngle, -1.2);
          if (swordRef.current) swordRef.current.rotation.set(0.5, swingAngle - 0.5, 0.2);
          bodyRef.current.rotation.y = -0.3 + 0.8 * phase;
        } else {
          // Return
          const phase = (t - 0.55) / 0.65;
          bodyRef.current.rotation.y = 0.5 * (1 - phase);
          lerpEuler(rightArmRef.current.rotation, -0.2, 0, -0.1, phase);
        }
      } else if (variant === 1) {
        // --- Variant 2: Thrust ---
        if (t < 0.3) {
          // Pull back
          const phase = t / 0.3;
          rightArmRef.current.rotation.set(0.4, 0, 0.2);
          rightArmRef.current.position.z = -0.1 * phase;
          bodyRef.current.position.z = -0.1 * phase;
        } else if (t < 0.55) {
          // Thrust forward
          const phase = (t - 0.3) / 0.25;
          rightArmRef.current.rotation.set(-1.4, 0, -0.1);
          rightArmRef.current.position.z = 0.25 * phase;
          if (swordRef.current) swordRef.current.rotation.set(0.0, 0, 0); // Point sword forward
          bodyRef.current.position.z = 0.3 * phase;
          bodyRef.current.rotation.x = 0.15 * phase;
        } else {
          // Return
          const phase = (t - 0.55) / 0.65;
          bodyRef.current.position.z = 0.3 * (1 - phase);
          bodyRef.current.rotation.x = 0.15 * (1 - phase);
          lerpEuler(rightArmRef.current.rotation, -0.2, 0, -0.1, phase);
          rightArmRef.current.position.lerp(new THREE.Vector3(0.25, 0.35, 0), phase);
        }
      } else if (variant === 2) {
        // --- Variant 3: Whirlwind Spin ---
        if (t < 0.2) {
          // Crouch / Windup
          const phase = t / 0.2;
          bodyRef.current.position.y = 0.45 - 0.1 * phase;
          rightArmRef.current.rotation.set(0, -0.8, -0.2);
        } else if (t < 0.75) {
          // SPIN 360 degrees
          const phase = (t - 0.2) / 0.55;
          const spinAngle = phase * Math.PI * 2;
          bodyRef.current.rotation.y = spinAngle;
          bodyRef.current.position.y = 0.35 + Math.sin(phase * Math.PI) * 0.15;
          
          // Extend arms with sword outward
          rightArmRef.current.rotation.set(-1.5, 0, -1.2);
          leftArmRef.current.rotation.set(-1.5, 0, 1.2);
        } else {
          // Return
          const phase = (t - 0.75) / 0.45;
          bodyRef.current.rotation.y = Math.PI * 2 * (1 - phase);
          bodyRef.current.position.y = 0.35 + 0.1 * phase;
          lerpEuler(rightArmRef.current.rotation, -0.2, 0, -0.1, phase);
          lerpEuler(leftArmRef.current.rotation, 0.2, 0, 0.1, phase);
        }
      } else {
        // --- Variant 4: Heavy Overhead Slam ---
        if (t < 0.4) {
          // Raise sword overhead with both arms
          const phase = t / 0.4;
          rightArmRef.current.rotation.set(-2.0, 0, -0.5);
          rightArmRef.current.position.x = 0.15; // Bring hand inward
          rightArmRef.current.position.y = 0.45;
          leftArmRef.current.rotation.set(-2.0, 0, 0.5);
          leftArmRef.current.position.x = -0.15;
          leftArmRef.current.position.y = 0.45;
          
          if (swordRef.current) {
            swordRef.current.position.set(0.0, 0.2, 0.15);
            swordRef.current.rotation.set(2.6, 0, 0); // pointing straight up/back
          }
          bodyRef.current.rotation.x = -0.15 * phase;
        } else if (t < 0.65) {
          // Slam down
          const phase = (t - 0.4) / 0.25;
          rightArmRef.current.rotation.set(-0.4, 0, -0.2);
          leftArmRef.current.rotation.set(-0.4, 0, 0.2);
          if (swordRef.current) {
            swordRef.current.position.set(0.1, -0.2, 0.4);
            swordRef.current.rotation.set(0.3, 0, 0); // slammed down
          }
          bodyRef.current.rotation.x = -0.15 + 0.4 * phase;
          bodyRef.current.position.y = 0.45 - 0.15 * phase;
        } else {
          // Return
          const phase = (t - 0.65) / 0.55;
          bodyRef.current.rotation.x = 0.25 * (1 - phase);
          bodyRef.current.position.y = 0.3 + 0.15 * phase;
          lerpEuler(rightArmRef.current.rotation, -0.2, 0, -0.1, phase);
          rightArmRef.current.position.lerp(new THREE.Vector3(0.25, 0.35, 0), phase);
          lerpEuler(leftArmRef.current.rotation, 0.2, 0, 0.1, phase);
          leftArmRef.current.position.lerp(new THREE.Vector3(-0.25, 0.35, 0), phase);
        }
      }
      return;
    }

    // 4. WALK & RUN CYCLIC STATES
    if (animationState === 'walk' || animationState === 'run') {
      const isRun = animationState === 'run';
      const freq = isRun ? 20 : 12;
      const legSwingAmp = isRun ? 0.7 : 0.4;
      const armSwingAmp = isRun ? 0.8 : 0.45;
      const bobAmp = isRun ? 0.08 : 0.045;
      const leanAngle = isRun ? 0.22 : 0.07;
      
      const cycle = time * freq;

      // Body Bob and Lean forward
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.45 + Math.sin(cycle * 2) * bobAmp;
        bodyRef.current.rotation.x = leanAngle; // Leaning forward
      }

      // Legs swing
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(cycle) * legSwingAmp;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(cycle) * legSwingAmp;

      // Arms swing
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0.2 - Math.sin(cycle) * armSwingAmp;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.2 + Math.sin(cycle) * armSwingAmp;

      // Hair swing back
      if (hairBackRef.current) {
        hairBackRef.current.rotation.x = isRun ? -0.45 + Math.cos(cycle * 2) * 0.08 : -0.15 + Math.cos(cycle * 2) * 0.04;
      }
      
      // Sword bobbing in hand
      if (swordRef.current) {
        swordRef.current.rotation.x = 0.8 + Math.cos(cycle) * 0.12;
      }
      return;
    }

    // 5. IDLE STATES (4 variants)
    if (animationState === 'idle') {
      const variant = animVariant % 4;
      
      // Base soft breathing
      const breath = Math.sin(time * 2.2) * 0.02;
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.45 + breath;
      }
      if (hairBackRef.current) {
        hairBackRef.current.rotation.z = Math.sin(time * 1.5) * 0.04;
        hairBackRef.current.rotation.x = Math.sin(time * 1.1) * 0.03;
      }

      if (variant === 0) {
        // --- Variant 1: Pure Breathing ---
        if (headRef.current) headRef.current.rotation.y = Math.sin(time * 0.5) * 0.05;
      } else if (variant === 1) {
        // --- Variant 2: Weapon Inspect ---
        const cycle = (time * 0.6) % (Math.PI * 2);
        const actionPhase = Math.sin(cycle);
        
        if (actionPhase > 0) {
          // Lift arm and inspect sword
          rightArmRef.current.rotation.set(-1.0 + actionPhase * 0.4, -0.5 * actionPhase, -0.4 * actionPhase);
          if (headRef.current) headRef.current.rotation.set(0.15 * actionPhase, 0.35 * actionPhase, 0);
          if (swordRef.current) swordRef.current.rotation.set(0.8 - actionPhase * 0.5, -0.4, 0.2 * actionPhase);
        }
      } else if (variant === 2) {
        // --- Variant 3: Stretch & Look Around ---
        const cycle = (time * 0.4) % (Math.PI * 2);
        
        if (Math.sin(cycle) > 0.3) {
          const intensity = (Math.sin(cycle) - 0.3) / 0.7;
          if (headRef.current) headRef.current.rotation.y = 0.45 * Math.sin(intensity * Math.PI * 2);
          if (leftArmRef.current) leftArmRef.current.rotation.z = 0.1 + intensity * 0.4;
          if (rightArmRef.current) rightArmRef.current.rotation.z = -0.1 - intensity * 0.4;
        }
      } else {
        // --- Variant 4: Ether Surge (Glow & Float) ---
        const floatCycle = Math.sin(time * 4) * 0.08;
        if (bodyRef.current) {
          bodyRef.current.position.y = 0.45 + floatCycle;
        }
        if (hairBackRef.current) {
          hairBackRef.current.rotation.x = -0.2 + Math.sin(time * 6) * 0.05; // hair flows faster
        }
        if (swordRef.current) {
          swordRef.current.position.y = -0.3 + floatCycle * 0.5;
        }
      }
    }
  });

  // Hair color: Cyan
  const hairColor = '#00ffcc';
  
  return (
    <group ref={modelRef}>
      <group ref={bodyRef}>
        {/* Head Joint */}
        <group ref={headRef} position={[0, 0.72, 0]}>
          {/* Face Sphere */}
          <mesh castShadow>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshToonMaterial color="#ffdfc4" roughness={0.8} />
          </mesh>
          <mesh scale={[1.05, 1.05, 1.05]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>

          {/* Main Hair (Back of Head) */}
          <mesh position={[0, 0.05, -0.06]} castShadow>
            <sphereGeometry args={[0.23, 12, 12]} />
            <meshToonMaterial color={hairColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.05, -0.06]} scale={[1.04, 1.04, 1.04]}>
            <sphereGeometry args={[0.23, 12, 12]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>

          {/* Front Bangs & Side Hair Locks framing the face */}
          {/* Center Bangs */}
          <group position={[0, 0.12, 0.15]} rotation={[0.2, 0, 0]}>
            <mesh castShadow>
              <coneGeometry args={[0.06, 0.18, 4]} />
              <meshToonMaterial color={hairColor} roughness={0.8} />
            </mesh>
            <mesh scale={[1.1, 1.05, 1.1]}>
              <coneGeometry args={[0.06, 0.18, 4]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
          </group>

          {/* Left Side Lock */}
          <group position={[0.13, 0.04, 0.14]} rotation={[0.1, 0, -0.1]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.03, 0.01, 0.28, 8]} />
              <meshToonMaterial color={hairColor} roughness={0.8} />
            </mesh>
            <mesh scale={[1.1, 1.05, 1.1]}>
              <cylinderGeometry args={[0.03, 0.01, 0.28, 8]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
          </group>

          {/* Right Side Lock */}
          <group position={[-0.13, 0.04, 0.14]} rotation={[0.1, 0, 0.1]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.03, 0.01, 0.28, 8]} />
              <meshToonMaterial color={hairColor} roughness={0.8} />
            </mesh>
            <mesh scale={[1.1, 1.05, 1.1]}>
              <cylinderGeometry args={[0.03, 0.01, 0.28, 8]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
          </group>

          {/* Silver Headband */}
          <mesh position={[0, 0.08, 0.02]} rotation={[0.1, 0, 0]}>
            <torusGeometry args={[0.225, 0.02, 8, 32]} />
            <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Long Ponytail Joint at Back of Head */}
          <group ref={hairBackRef} position={[0, 0.05, -0.18]}>
            {/* Hair strands cascading down */}
            <mesh castShadow position={[0, -0.22, -0.06]} rotation={[-0.1, 0, 0]}>
              <cylinderGeometry args={[0.07, 0.02, 0.5, 8]} />
              <meshToonMaterial color={hairColor} roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.22, -0.06]} rotation={[-0.1, 0, 0]} scale={[1.07, 1.02, 1.07]}>
              <cylinderGeometry args={[0.07, 0.02, 0.5, 8]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>

            {/* Glowing blue ponytail band */}
            <mesh position={[0, -0.02, 0]}>
              <torusGeometry args={[0.07, 0.015, 8, 16]} />
              <meshBasicMaterial color="#00ffff" />
            </mesh>
          </group>

          {/* Anime Eyes */}
          {/* Eye Left */}
          <mesh position={[0.07, -0.01, 0.17]}>
            <sphereGeometry args={[0.038, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.08, -0.01, 0.185]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshBasicMaterial color="#0284c7" /> {/* Blue Iris */}
          </mesh>
          <mesh position={[0.09, 0.0, 0.198]}>
            <sphereGeometry args={[0.009, 8, 8]} />
            <meshBasicMaterial color="#ffffff" /> {/* Pupil Highlight */}
          </mesh>

          {/* Eye Right */}
          <mesh position={[-0.07, -0.01, 0.17]}>
            <sphereGeometry args={[0.038, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.08, -0.01, 0.185]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
          <mesh position={[-0.09, 0.0, 0.198]}>
            <sphereGeometry args={[0.009, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Torso / Armor */}
        <group ref={torsoRef} position={[0, 0.2, 0]}>
          {/* Knight Chestplate */}
          <mesh castShadow>
            <cylinderGeometry args={[0.18, 0.22, 0.42, 8]} />
            <meshToonMaterial ref={materialRef} color="#4e9eff" roughness={0.4} metalness={0.6} emissive="#000000" emissiveIntensity={0} />
          </mesh>
          <mesh scale={[1.05, 1.02, 1.05]}>
            <cylinderGeometry args={[0.18, 0.22, 0.42, 8]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>

          {/* Silver Chest Emblem / Center Ribbon */}
          <mesh position={[0, 0.05, 0.18]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.08, 0.12, 0.03]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.05, 0.185]}>
            <octahedronGeometry args={[0.035]} />
            <meshBasicMaterial color="#00ffff" /> {/* Glowing heart gem */}
          </mesh>
          
          {/* Pauldrons (Shoulder Guards) */}
          {/* Left Pauldron */}
          <group position={[-0.24, 0.16, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.075, 8, 8]} />
              <meshToonMaterial color="#4e9eff" roughness={0.4} metalness={0.5} />
            </mesh>
            <mesh scale={[1.06, 1.06, 1.06]}>
              <sphereGeometry args={[0.075, 8, 8]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
          </group>

          {/* Right Pauldron */}
          <group position={[0.24, 0.16, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.075, 8, 8]} />
              <meshToonMaterial color="#4e9eff" roughness={0.4} metalness={0.5} />
            </mesh>
            <mesh scale={[1.06, 1.06, 1.06]}>
              <sphereGeometry args={[0.075, 8, 8]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
          </group>
        </group>

        {/* Plate Skirt */}
        <group ref={skirtRef} position={[0, 0.0, 0]}>
          {/* Armor Tassets / Skirt segments */}
          <mesh castShadow>
            <coneGeometry args={[0.28, 0.32, 8]} />
            <meshToonMaterial color="#1e3a8a" roughness={0.6} /> {/* dark blue base skirt */}
          </mesh>
          <mesh scale={[1.05, 1.05, 1.05]}>
            <coneGeometry args={[0.28, 0.32, 8]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>

          {/* Front gold-rimmed tabard */}
          <mesh position={[0, -0.06, 0.20]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.12, 0.22, 0.02]} />
            <meshToonMaterial color="#00ffff" />
          </mesh>
        </group>

        {/* Left Arm Joint */}
        <group ref={leftArmRef} position={[-0.25, 0.35, 0]}>
          {/* Arm Sleeve */}
          <mesh castShadow position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.045, 0.035, 0.24, 8]} />
            <meshToonMaterial color="#ffdfc4" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.12, 0]} scale={[1.08, 1.02, 1.08]}>
            <cylinderGeometry args={[0.045, 0.035, 0.24, 8]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>
          {/* Hand glove */}
          <mesh position={[0, -0.25, 0]} castShadow>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshToonMaterial color="#1e3a8a" />
          </mesh>
        </group>

        {/* Right Arm Joint (Holding Sword) */}
        <group ref={rightArmRef} position={[0.25, 0.35, 0]}>
          {/* Arm Sleeve */}
          <mesh castShadow position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.045, 0.035, 0.24, 8]} />
            <meshToonMaterial color="#ffdfc4" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.12, 0]} scale={[1.08, 1.02, 1.08]}>
            <cylinderGeometry args={[0.045, 0.035, 0.24, 8]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>
          {/* Hand glove */}
          <mesh position={[0, -0.25, 0]} castShadow>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshToonMaterial color="#1e3a8a" />
          </mesh>

          {/* Floating / Held Etheric Sword */}
          <group ref={swordRef} position={[0.1, -0.3, 0.2]} rotation={[0.8, -0.4, -0.3]}>
            {/* Blade: Glowing Cyan Crystal */}
            <mesh castShadow>
              <boxGeometry args={[0.04, 0.85, 0.1]} />
              <meshBasicMaterial color="#00ffff" transparent opacity={0.85} />
            </mesh>
            <mesh scale={[1.15, 1.02, 1.25]}>
              <boxGeometry args={[0.04, 0.85, 0.1]} />
              <meshBasicMaterial color="#008888" side={THREE.BackSide} />
            </mesh>
            {/* Elegant Guard */}
            <mesh position={[0, -0.42, 0]}>
              <boxGeometry args={[0.13, 0.04, 0.13]} />
              <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, -0.42, 0]} scale={[1.1, 1.1, 1.1]}>
              <boxGeometry args={[0.13, 0.04, 0.13]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
            {/* Sword Hilt */}
            <mesh position={[0, -0.55, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.22, 8]} />
              <meshToonMaterial color="#374151" />
            </mesh>
            <mesh position={[0, -0.66, 0]}>
              <sphereGeometry args={[0.035]} />
              <meshStandardMaterial color="#ffd700" metalness={0.8} />
            </mesh>
          </group>
        </group>

        {/* Left Leg Joint */}
        <group ref={leftLegRef} position={[-0.1, -0.18, 0]}>
          {/* Leg Boot */}
          <mesh castShadow position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.05, 0.042, 0.34, 8]} />
            <meshToonMaterial color="#1f2937" roughness={0.8} /> {/* Dark boots */}
          </mesh>
          <mesh position={[0, -0.15, 0]} scale={[1.08, 1.02, 1.08]}>
            <cylinderGeometry args={[0.05, 0.042, 0.34, 8]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>
          <mesh position={[0, -0.32, 0.02]} castShadow>
            <boxGeometry args={[0.1, 0.06, 0.16]} />
            <meshToonMaterial color="#4e9eff" metalness={0.5} roughness={0.4} /> {/* Steel boot tip */}
          </mesh>
        </group>

        {/* Right Leg Joint */}
        <group ref={rightLegRef} position={[0.1, -0.18, 0]}>
          {/* Leg Boot */}
          <mesh castShadow position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.05, 0.042, 0.34, 8]} />
            <meshToonMaterial color="#1f2937" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.15, 0]} scale={[1.08, 1.02, 1.08]}>
            <cylinderGeometry args={[0.05, 0.042, 0.34, 8]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>
          <mesh position={[0, -0.32, 0.02]} castShadow>
            <boxGeometry args={[0.1, 0.06, 0.16]} />
            <meshToonMaterial color="#4e9eff" metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
