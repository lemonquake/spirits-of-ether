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
  const hairLeftRef = useRef();
  const hairRightRef = useRef();
  const wizardHatRef = useRef();
  const torsoRef = useRef();
  const robeSkirtRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const staffRef = useRef();
  const crystalOrbiterRef = useRef(); // orbiting crystal around staff top

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

    // Reset all transformations
    if (headRef.current) {
      headRef.current.position.set(0, 0.68, 0);
      headRef.current.rotation.set(0, 0, 0);
    }
    if (hairLeftRef.current) hairLeftRef.current.rotation.set(0, 0, 0);
    if (hairRightRef.current) hairRightRef.current.rotation.set(0, 0, 0);
    if (wizardHatRef.current) wizardHatRef.current.rotation.set(-0.05, 0, 0);
    if (torsoRef.current) {
      torsoRef.current.position.set(0, 0.16, 0);
      torsoRef.current.rotation.set(0, 0, 0);
    }
    if (robeSkirtRef.current) {
      robeSkirtRef.current.position.set(0, -0.05, 0);
      robeSkirtRef.current.rotation.set(0, 0, 0);
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
    if (crystalOrbiterRef.current) {
      // Orbital crystal spin
      const orbitSpeed = 4;
      const orbitRadius = 0.15;
      crystalOrbiterRef.current.position.set(
        Math.cos(time * orbitSpeed) * orbitRadius,
        0.58 + Math.sin(time * orbitSpeed * 2) * 0.05,
        Math.sin(time * orbitSpeed) * orbitRadius
      );
      crystalOrbiterRef.current.rotation.y = time * 3;
    }

    // --- ANIMATION CONTROLLER ---

    // 1. DEAD / DYING STATES
    if (animationState === 'dead') {
      if (bodyRef.current) {
        bodyRef.current.position.y = -0.35;
        bodyRef.current.position.z = -0.2;
        bodyRef.current.rotation.x = -Math.PI / 2;
        bodyRef.current.rotation.z = -0.2;
      }
      if (wizardHatRef.current) {
        wizardHatRef.current.rotation.x = -0.3; // hat knocked askew
        wizardHatRef.current.position.z = -0.05;
      }
      if (staffRef.current) {
        staffRef.current.position.set(-0.4, -0.4, 0.4);
        staffRef.current.rotation.set(0.3, 0.4, -1.2); // staff dropped nearby
      }
      return;
    }

    if (animationState === 'dying') {
      const progress = animProgress || (time % 1.5);
      const t = Math.min(progress / 1.2, 1.0);
      
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.45 - t * 0.8;
        bodyRef.current.position.z = -t * 0.2;
        bodyRef.current.rotation.x = -t * (Math.PI / 2);
        bodyRef.current.rotation.z = -t * 0.2;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -t * 1.5;
      }
      if (staffRef.current) {
        staffRef.current.position.x = -0.12 - t * 0.3;
        staffRef.current.position.y = -0.22 - t * 0.15;
        staffRef.current.rotation.z = 0.15 - t * 1.5;
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
        recoil = (t / 0.2) * 0.55;
      } else {
        recoil = (1 - (t - 0.2) / 0.8) * 0.55;
      }

      if (bodyRef.current) {
        bodyRef.current.position.z = -recoil;
        bodyRef.current.position.y = 0.45 - recoil * 0.2;
        bodyRef.current.rotation.x = -recoil * 0.35;
      }
      if (headRef.current) {
        headRef.current.rotation.x = -recoil * 0.25;
      }
      if (wizardHatRef.current) {
        wizardHatRef.current.rotation.x = -0.05 - recoil * 0.5;
      }
      if (leftArmRef.current) leftArmRef.current.rotation.z = 0.1 + recoil * 0.65;
      if (rightArmRef.current) rightArmRef.current.rotation.z = -0.1 - recoil * 0.65;
      return;
    }

    // 3. ATTACK STATES (4 variants)
    if (animationState === 'attack') {
      const progress = animProgress || (time % 1.2);
      const duration = 1.2;
      const t = progress / duration;
      
      const variant = animVariant % 4;

      if (variant === 0) {
        // --- Variant 1: Cast Bolt (Point staff forward) ---
        if (t < 0.35) {
          // Raise staff back (charging)
          const phase = t / 0.35;
          leftArmRef.current.rotation.set(-0.8 * phase, 0, 0.4 * phase);
          if (staffRef.current) {
            staffRef.current.position.set(-0.15, -0.1, 0.15);
            staffRef.current.rotation.set(0.6 * phase, 0, 0.3 * phase);
          }
          bodyRef.current.rotation.y = 0.25 * phase;
        } else if (t < 0.65) {
          // Thrust staff forward (casting)
          const phase = (t - 0.35) / 0.3;
          leftArmRef.current.rotation.set(-1.4, -0.3, -0.2);
          leftArmRef.current.position.z = 0.25 * phase;
          if (staffRef.current) {
            staffRef.current.position.set(-0.05, -0.08, 0.4);
            staffRef.current.rotation.set(-0.5, 0, 0); // Point staff forward
          }
          bodyRef.current.rotation.y = 0.25 - 0.5 * phase;
          bodyRef.current.rotation.x = 0.1 * phase;
        } else {
          // Return
          const phase = (t - 0.65) / 0.55;
          bodyRef.current.rotation.x = 0.1 * (1 - phase);
          bodyRef.current.rotation.y = -0.25 * (1 - phase);
          lerpEuler(leftArmRef.current.rotation, 0.15, 0, 0.1, phase);
          leftArmRef.current.position.lerp(new THREE.Vector3(-0.24, 0.32, 0), phase);
          staffRef.current.position.lerp(new THREE.Vector3(-0.12, -0.22, 0.22), phase);
          lerpEuler(staffRef.current.rotation, 0.2, 0.1, 0.15, phase);
        }
      } else if (variant === 1) {
        // --- Variant 2: Summoning Storm (Raise staff high) ---
        if (t < 0.4) {
          // Lift staff high above head
          const phase = t / 0.4;
          leftArmRef.current.rotation.set(-2.2 * phase, 0, 0.3 * phase);
          leftArmRef.current.position.x = -0.15;
          leftArmRef.current.position.y = 0.4;
          
          if (staffRef.current) {
            staffRef.current.position.set(-0.02, 0.05, 0.1);
            staffRef.current.rotation.set(-0.2 * phase, 0, -0.3 * phase);
          }
          bodyRef.current.position.y = 0.45 + 0.25 * phase; // Float up!
          bodyRef.current.rotation.x = -0.1 * phase;
          if (headRef.current) headRef.current.rotation.x = -0.2 * phase; // Look up
        } else if (t < 0.8) {
          // Channel energy (holding floating pose)
          leftArmRef.current.rotation.set(-2.2, 0.15 * Math.sin(time * 12), 0.3);
          bodyRef.current.position.y = 0.7 + Math.sin(time * 8) * 0.05;
        } else {
          // Return
          const phase = (t - 0.8) / 0.4;
          bodyRef.current.position.y = 0.7 - 0.25 * phase;
          bodyRef.current.rotation.x = -0.1 * (1 - phase);
          if (headRef.current) headRef.current.rotation.x = -0.2 * (1 - phase);
          lerpEuler(leftArmRef.current.rotation, 0.15, 0, 0.1, phase);
          leftArmRef.current.position.lerp(new THREE.Vector3(-0.24, 0.32, 0), phase);
          staffRef.current.position.lerp(new THREE.Vector3(-0.12, -0.22, 0.22), phase);
          lerpEuler(staffRef.current.rotation, 0.2, 0.1, 0.15, phase);
        }
      } else if (variant === 2) {
        // --- Variant 3: Double Spin Staff ---
        if (t < 0.2) {
          leftArmRef.current.rotation.set(-0.5, 0, 0.5);
        } else if (t < 0.8) {
          // Spin staff
          const phase = (t - 0.2) / 0.6;
          const spinAngle = phase * Math.PI * 4; // Double spin
          
          leftArmRef.current.rotation.set(-0.9, 0, 0.3);
          if (staffRef.current) {
            staffRef.current.rotation.set(0.2, spinAngle, 0.15); // spin around staff shaft
            staffRef.current.position.set(-0.05, -0.18, 0.25);
          }
        } else {
          const phase = (t - 0.8) / 0.4;
          lerpEuler(leftArmRef.current.rotation, 0.15, 0, 0.1, phase);
          staffRef.current.position.lerp(new THREE.Vector3(-0.12, -0.22, 0.22), phase);
          lerpEuler(staffRef.current.rotation, 0.2, 0.1, 0.15, phase);
        }
      } else {
        // --- Variant 4: Telekinetic Blast ---
        if (t < 0.35) {
          // Push both hands back
          const phase = t / 0.35;
          leftArmRef.current.rotation.set(0.6 * phase, 0, 0.4 * phase);
          rightArmRef.current.rotation.set(0.6 * phase, 0, -0.4 * phase);
          if (staffRef.current) {
            staffRef.current.position.set(-0.2, -0.1, 0.05); // Staff floats behind
            staffRef.current.rotation.set(0.4, 0, 0.2);
          }
        } else if (t < 0.7) {
          // Push hands forward, staff zooms in front and spins rapidly
          const phase = (t - 0.35) / 0.35;
          leftArmRef.current.rotation.set(-1.3, 0.3, -0.1);
          rightArmRef.current.rotation.set(-1.3, -0.3, 0.1);
          
          if (staffRef.current) {
            staffRef.current.position.set(0, 0.2, 0.55); // Floats in front of body
            staffRef.current.rotation.y = time * 25; // Spinning staff!
            staffRef.current.rotation.x = Math.PI / 2; // Flat horizontal spin
          }
          bodyRef.current.position.z = 0.15 * phase;
        } else {
          // Return
          const phase = (t - 0.7) / 0.5;
          bodyRef.current.position.z = 0.15 * (1 - phase);
          lerpEuler(leftArmRef.current.rotation, 0.15, 0, 0.1, phase);
          lerpEuler(rightArmRef.current.rotation, -0.15, 0, -0.1, phase);
          staffRef.current.position.lerp(new THREE.Vector3(-0.12, -0.22, 0.22), phase);
          lerpEuler(staffRef.current.rotation, 0.2, 0.1, 0.15, phase);
        }
      }
      return;
    }

    // 4. WALK & RUN CYCLIC STATES
    if (animationState === 'walk' || animationState === 'run') {
      const isRun = animationState === 'run';
      const freq = isRun ? 20 : 12;
      const legSwingAmp = isRun ? 0.45 : 0.25; // Smaller swing because robe
      const armSwingAmp = isRun ? 0.75 : 0.4;
      const bobAmp = isRun ? 0.09 : 0.04;
      const leanAngle = isRun ? 0.20 : 0.06;
      
      const cycle = time * freq;

      // Body Bob and Lean forward
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.45 + Math.sin(cycle * 2) * bobAmp;
        bodyRef.current.rotation.x = leanAngle;
      }

      // Legs swing
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(cycle) * legSwingAmp;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(cycle) * legSwingAmp;

      // Robe skirt flaps
      if (robeSkirtRef.current) {
        robeSkirtRef.current.rotation.x = Math.cos(cycle * 2) * 0.08;
      }

      // Arms swing
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0.15 - Math.sin(cycle) * armSwingAmp;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.15 + Math.sin(cycle) * armSwingAmp;

      // Hair swing back
      if (hairLeftRef.current) hairLeftRef.current.rotation.x = isRun ? -0.3 + Math.cos(cycle) * 0.08 : -0.1 + Math.cos(cycle) * 0.04;
      if (hairRightRef.current) hairRightRef.current.rotation.x = isRun ? -0.3 + Math.cos(cycle) * 0.08 : -0.1 + Math.cos(cycle) * 0.04;

      // Staff bobs along
      if (staffRef.current) {
        staffRef.current.position.y = -0.22 + Math.cos(cycle * 2) * 0.06;
        staffRef.current.rotation.x = 0.2 + Math.cos(cycle) * 0.08;
      }
      return;
    }

    // 5. IDLE STATES (4 variants)
    if (animationState === 'idle') {
      const variant = animVariant % 4;

      // Base soft breathing
      const breath = Math.sin(time * 2.0) * 0.022;
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.45 + breath;
      }
      if (hairLeftRef.current) hairLeftRef.current.rotation.z = Math.sin(time * 1.2) * 0.05;
      if (hairRightRef.current) hairRightRef.current.rotation.z = -Math.sin(time * 1.2) * 0.05;

      if (variant === 0) {
        // --- Variant 1: Pure Breathing ---
        if (headRef.current) headRef.current.rotation.y = Math.sin(time * 0.4) * 0.06;
        if (staffRef.current) {
          staffRef.current.position.y = -0.22 + Math.sin(time * 1.5) * 0.03;
        }
      } else if (variant === 1) {
        // --- Variant 2: Staff Spin in Hand ---
        const cycle = (time * 0.8) % (Math.PI * 2);
        const actionPhase = Math.sin(cycle);
        
        if (actionPhase > 0) {
          leftArmRef.current.rotation.set(-0.7, 0, 0.4);
          if (staffRef.current) {
            staffRef.current.position.set(-0.08, -0.18, 0.25);
            staffRef.current.rotation.set(0.2, actionPhase * Math.PI * 2, 0.15); // spins staff
          }
        }
      } else if (variant === 2) {
        // --- Variant 3: Mage Meditation Float ---
        // Sinks down and floats higher
        const floatCycle = Math.sin(time * 2.8) * 0.12 + 0.12;
        if (bodyRef.current) {
          bodyRef.current.position.y = 0.45 + floatCycle;
        }
        if (robeSkirtRef.current) {
          robeSkirtRef.current.scale.y = 1 + floatCycle * 0.1; // robe extends
        }
        if (staffRef.current) {
          staffRef.current.position.y = -0.22 + floatCycle * 0.8;
          staffRef.current.rotation.z = 0.15 + Math.sin(time * 2) * 0.08;
        }
      } else {
        // --- Variant 4: Astral Resonance ---
        // Staff crystal orbits faster, torus ring glows/rotates
        const resonance = Math.sin(time * 5) * 0.04;
        if (bodyRef.current) {
          bodyRef.current.position.y = 0.45 + resonance;
        }
        if (crystalOrbiterRef.current) {
          // Hyper fast crystal spin
          const orbitSpeed = 12;
          const orbitRadius = 0.22;
          crystalOrbiterRef.current.position.set(
            Math.cos(time * orbitSpeed) * orbitRadius,
            0.58 + Math.sin(time * orbitSpeed * 2) * 0.05,
            Math.sin(time * orbitSpeed) * orbitRadius
          );
        }
        if (staffRef.current) {
          // staff tip glows/pulses
          staffRef.current.rotation.x = 0.2 + Math.sin(time * 8) * 0.05;
        }
      }
    }
  });

  const hairColor = '#d8b4fe'; // lavender hair

  return (
    <group ref={modelRef}>
      <group ref={bodyRef}>
        {/* Head Joint */}
        <group ref={headRef} position={[0, 0.68, 0]}>
          {/* Face Sphere */}
          <mesh castShadow>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshToonMaterial color="#ffdfc4" roughness={0.8} />
          </mesh>
          <mesh scale={[1.05, 1.05, 1.05]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>

          {/* Anime Eyes */}
          <mesh position={[0.065, -0.01, 0.155]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.07, -0.01, 0.168]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#8b5cf6" /> {/* Purple iris */}
          </mesh>

          <mesh position={[-0.065, -0.01, 0.155]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.07, -0.01, 0.168]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#8b5cf6" />
          </mesh>

          {/* Hair Left Braid / Locks */}
          <group ref={hairLeftRef} position={[0.1, 0.03, -0.05]}>
            <mesh position={[0.06, -0.2, 0.05]} castShadow>
              <cylinderGeometry args={[0.035, 0.015, 0.45, 8]} />
              <meshToonMaterial color={hairColor} roughness={0.8} />
            </mesh>
            <mesh position={[0.06, -0.2, 0.05]} scale={[1.1, 1.02, 1.1]}>
              <cylinderGeometry args={[0.035, 0.015, 0.45, 8]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
          </group>

          {/* Hair Right Braid / Locks */}
          <group ref={hairRightRef} position={[-0.1, 0.03, -0.05]}>
            <mesh position={[-0.06, -0.2, 0.05]} castShadow>
              <cylinderGeometry args={[0.035, 0.015, 0.45, 8]} />
              <meshToonMaterial color={hairColor} roughness={0.8} />
            </mesh>
            <mesh position={[-0.06, -0.2, 0.05]} scale={[1.1, 1.02, 1.1]}>
              <cylinderGeometry args={[0.035, 0.015, 0.45, 8]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
          </group>

          {/* Tall Wizard Hat */}
          <group ref={wizardHatRef} position={[0, 0.12, -0.02]} rotation={[-0.05, 0, 0]}>
            {/* Hat Brim */}
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.26, 0.04, 8, 32]} />
              <meshToonMaterial color="#2e1065" /> {/* Dark purple hat */}
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1.06, 1.06, 1.06]}>
              <torusGeometry args={[0.26, 0.04, 8, 32]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>
            
            {/* Hat Cone */}
            <mesh position={[0, 0.22, -0.04]} rotation={[-0.18, 0, 0]} castShadow>
              <coneGeometry args={[0.18, 0.45, 8]} />
              <meshToonMaterial color="#2e1065" />
            </mesh>
            <mesh position={[0, 0.22, -0.04]} rotation={[-0.18, 0, 0]} scale={[1.08, 1.05, 1.08]}>
              <coneGeometry args={[0.18, 0.45, 8]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>

            {/* Golden Hat Band */}
            <mesh position={[0, 0.045, -0.01]}>
              <cylinderGeometry args={[0.21, 0.21, 0.04, 16]} />
              <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.15} />
            </mesh>
          </group>
        </group>

        {/* Torso / Gown Upper */}
        <group ref={torsoRef} position={[0, 0.16, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.15, 0.18, 0.4, 8]} />
            <meshToonMaterial ref={materialRef} color="#b975ff" roughness={0.8} emissive="#000000" emissiveIntensity={0} />
          </mesh>
          <mesh scale={[1.06, 1.02, 1.06]}>
            <cylinderGeometry args={[0.15, 0.18, 0.4, 8]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>

          {/* Golden Collar Overlay */}
          <mesh position={[0, 0.15, 0]} rotation={[0.08, 0, 0]}>
            <cylinderGeometry args={[0.152, 0.162, 0.06, 8]} />
            <meshStandardMaterial color="#ffd700" metalness={0.8} />
          </mesh>
        </group>

        {/* Robe Skirt Lower (Flared Gown) */}
        <group ref={robeSkirtRef} position={[0, -0.05, 0]}>
          <mesh castShadow>
            <coneGeometry args={[0.34, 0.55, 8]} />
            <meshToonMaterial color="#7c3aed" roughness={0.8} /> {/* rich violet gown */}
          </mesh>
          <mesh scale={[1.06, 1.04, 1.06]}>
            <coneGeometry args={[0.34, 0.55, 8]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>
        </group>

        {/* Left Arm Joint (Holding/Gesturing Staff) */}
        <group ref={leftArmRef} position={[-0.24, 0.32, 0]}>
          {/* Robe sleeve wide */}
          <mesh castShadow position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.04, 0.07, 0.22, 8]} />
            <meshToonMaterial color="#b975ff" />
          </mesh>
          <mesh position={[0, -0.1, 0]} scale={[1.08, 1.02, 1.08]}>
            <cylinderGeometry args={[0.04, 0.07, 0.22, 8]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.22, 0]} castShadow>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshToonMaterial color="#ffdfc4" />
          </mesh>

          {/* Floating/Held Astral Staff */}
          <group ref={staffRef} position={[-0.12, -0.22, 0.22]} rotation={[0.2, 0.1, 0.15]}>
            {/* Shaft */}
            <mesh castShadow>
              <cylinderGeometry args={[0.02, 0.02, 1.15, 8]} />
              <meshToonMaterial color="#8b5cf6" />
            </mesh>
            <mesh scale={[1.2, 1.02, 1.2]}>
              <cylinderGeometry args={[0.02, 0.02, 1.15, 8]} />
              <meshBasicMaterial color="#000000" side={THREE.BackSide} />
            </mesh>

            {/* Gold Crystal holder rings */}
            <mesh position={[0, 0.58, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.13, 0.015, 8, 24]} />
              <meshStandardMaterial color="#ffd700" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.58, 0]} rotation={[0, Math.PI / 4, 0]}>
              <torusGeometry args={[0.13, 0.015, 8, 24]} />
              <meshStandardMaterial color="#ffd700" metalness={0.9} />
            </mesh>

            {/* Central crystal octahedron core */}
            <mesh position={[0, 0.58, 0]} castShadow>
              <octahedronGeometry args={[0.095]} />
              <meshBasicMaterial color="#d8b4fe" transparent opacity={0.95} />
            </mesh>

            {/* Orbiting Starlight Particle (Mesh attached to staff local space) */}
            <mesh ref={crystalOrbiterRef}>
              <octahedronGeometry args={[0.045]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        </group>

        {/* Right Arm Joint */}
        <group ref={rightArmRef} position={[0.24, 0.32, 0]}>
          {/* Robe sleeve wide */}
          <mesh castShadow position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.04, 0.07, 0.22, 8]} />
            <meshToonMaterial color="#b975ff" />
          </mesh>
          <mesh position={[0, -0.1, 0]} scale={[1.08, 1.02, 1.08]}>
            <cylinderGeometry args={[0.04, 0.07, 0.22, 8]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.22, 0]} castShadow>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshToonMaterial color="#ffdfc4" />
          </mesh>
        </group>

        {/* Hidden Legs underneath robe for walk geometry */}
        <group ref={leftLegRef} position={[-0.08, -0.22, 0]}>
          <mesh castShadow position={[0, -0.12, 0.02]}>
            <cylinderGeometry args={[0.04, 0.035, 0.25, 8]} />
            <meshToonMaterial color="#1f2937" />
          </mesh>
        </group>

        <group ref={rightLegRef} position={[0.08, -0.22, 0]}>
          <mesh castShadow position={[0, -0.12, 0.02]}>
            <cylinderGeometry args={[0.04, 0.035, 0.25, 8]} />
            <meshToonMaterial color="#1f2937" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
