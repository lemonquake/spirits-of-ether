import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import { getHeight, getFoliage } from '../../utils/terrain';
import { createBarkTexture, createLeafTexture, createStoneTexture } from '../../utils/textures';
import EnemyModel from './EnemyModel';

// Glowing crystal nodes (scaled out for larger map)
const CRYSTALS = [
  { id: 'c1', pos: [-18, 0, -14], color: '#00ffff' },
  { id: 'c2', pos: [18, 0, -22], color: '#d8b4fe' },
  { id: 'c3', pos: [-16, 0, 10], color: '#00ffff' },
  { id: 'c4', pos: [22, 0, 8], color: '#d8b4fe' },
  { id: 'c5', pos: [0, 0, -32], color: '#ffb700' }
];

const ENEMIES_DATA = [
  { id: 'enemy_void_1', name: 'Void Slime Pack', pos: [-6, 0, -8], type: 'slime' },
  { id: 'enemy_void_2', name: 'Void Skirmishers', pos: [12, 0, -12], type: 'skeleton_grunt' },
  { id: 'enemy_void_3', name: 'Wight Vanguard', pos: [-15, 0, -22], type: 'skeleton_grunt' },
  // Beach/shore enemies
  { id: 'enemy_krab_1', name: 'Finster Krab Pair', pos: [15, 0, 18], type: 'finster_krab' },
  { id: 'enemy_krab_2', name: 'Beach Skirmishers', pos: [-25, 0, 20], type: 'finster_krab' },
  // Torchoise + Slime
  { id: 'enemy_torchoise_1', name: 'Torchoise Pack', pos: [22, 0, 12], type: 'torchoise' },
  // Boss team
  { id: 'enemy_boss_anomaly', name: 'Boss Anomaly', pos: [0, 0, 28], type: 'torchoise' }
];

// Custom Terrain component with rolling hills, beach sand painting, and vertex colors
function Terrain() {
  const size = 120; // 120x120 map size
  const segments = 200;
  
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);
    
    const pos = geo.attributes.position;
    const colorArray = [];
    
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const height = getHeight(x, z);
      
      pos.setY(i, height);
      
      let color = new THREE.Color();
      if (height < -1.1) {
        // Wet sand shore / sea floor
        color.setHSL(0.11, 0.45, 0.55 + Math.sin(x * 5) * 0.02);
      } else if (height < -0.6) {
        // Fine beach sand
        color.setHSL(0.12, 0.48, 0.65);
      } else if (height < 1.1) {
        // Lush green valleys
        const t = (height + 0.6) / 1.7;
        const cGrass1 = new THREE.Color('#4d6b2f'); // rich olive
        const cGrass2 = new THREE.Color('#789a3c'); // bright grass
        color.lerpColors(cGrass1, cGrass2, t);
      } else {
        // Rocky soil on hills/mountains
        const t = Math.min(1, (height - 1.1) / 1.8);
        const cMoss = new THREE.Color('#384e1f');
        const cDirt = new THREE.Color('#4e392d');
        color.lerpColors(cMoss, cDirt, t);
      }
      colorArray.push(color.r, color.g, color.b);
    }
    
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3));
    geo.computeVertexNormals();
    
    return geo;
  }, []);
  
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.95} metalness={0.05} />
    </mesh>
  );
}

// Low-poly tall grass tufts
function GrassTuft({ x, z, scale }) {
  const y = getHeight(x, z);
  return (
    <group position={[x, y, z]} scale={[scale, scale * 1.2, scale]}>
      <mesh position={[0.04, 0.15, 0]} rotation={[0.08, 0, 0.12]} castShadow>
        <coneGeometry args={[0.02, 0.35, 4]} />
        <meshStandardMaterial color="#6e8d3c" roughness={0.9} />
      </mesh>
      <mesh position={[-0.04, 0.15, 0.04]} rotation={[-0.08, 0, -0.08]} castShadow>
        <coneGeometry args={[0.015, 0.3, 4]} />
        <meshStandardMaterial color="#55702b" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.18, -0.04]} rotation={[0, 0.08, -0.12]} castShadow>
        <coneGeometry args={[0.018, 0.38, 4]} />
        <meshStandardMaterial color="#7ca23a" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Procedural foliage renderer
function FoliageItem({ item, textures }) {
  const y = getHeight(item.x, item.z);
  
  if (item.type === 0) {
    // Stacked Pine Tree
    return (
      <group position={[item.x, y, item.z]} scale={[item.scale, item.scale, item.scale]} rotation={[0, item.rotation, 0]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.13, 0.8, 8]} />
          <meshStandardMaterial map={textures.barkTex} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.9, 0]} castShadow>
          <coneGeometry args={[0.65, 0.85, 8]} />
          <meshStandardMaterial map={textures.leafTex} roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.35, 0]} castShadow>
          <coneGeometry args={[0.5, 0.7, 8]} />
          <meshStandardMaterial map={textures.leafTex} roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.75, 0]} castShadow>
          <coneGeometry args={[0.35, 0.55, 8]} />
          <meshStandardMaterial map={textures.leafTex} roughness={0.85} />
        </mesh>
      </group>
    );
  } else if (item.type === 1) {
    // Round Leafy Oak Tree
    return (
      <group position={[item.x, y, item.z]} scale={[item.scale, item.scale, item.scale]} rotation={[0, item.rotation, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.16, 0.9, 8]} />
          <meshStandardMaterial map={textures.barkTex} roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.3, 0]} castShadow>
          <dodecahedronGeometry args={[0.65]} />
          <meshStandardMaterial map={textures.leafTex} roughness={0.85} />
        </mesh>
        <mesh position={[0.2, 1.6, 0.15]} scale={[0.7, 0.7, 0.7]} castShadow>
          <dodecahedronGeometry args={[0.65]} />
          <meshStandardMaterial map={textures.leafTex} roughness={0.85} />
        </mesh>
        <mesh position={[-0.2, 1.5, -0.1]} scale={[0.65, 0.65, 0.65]} castShadow>
          <dodecahedronGeometry args={[0.65]} />
          <meshStandardMaterial map={textures.leafTex} roughness={0.85} />
        </mesh>
      </group>
    );
  } else if (item.type === 2) {
    // Flat Ground Bush
    return (
      <group position={[item.x, y, item.z]} scale={[item.scale, item.scale * 0.75, item.scale]} rotation={[0, item.rotation, 0]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <dodecahedronGeometry args={[0.4]} />
          <meshStandardMaterial map={textures.leafTex} roughness={0.9} />
        </mesh>
        <mesh position={[0.15, 0.18, -0.1]} scale={[0.75, 0.75, 0.75]} castShadow>
          <dodecahedronGeometry args={[0.4]} />
          <meshStandardMaterial map={textures.leafTex} roughness={0.9} />
        </mesh>
      </group>
    );
  } else {
    // Weathered Rock
    return (
      <group position={[item.x, y, item.z]} scale={[item.scale, item.scale * 0.7, item.scale]} rotation={[Math.random() * 0.15, item.rotation, Math.random() * 0.15]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <dodecahedronGeometry args={[0.42]} />
          <meshStandardMaterial map={textures.stoneTex} roughness={0.85} metalness={0.1} />
        </mesh>
      </group>
    );
  }
}

// Shader-based beautiful water plane with Gerstner waves, twilight sky reflection, and sunlight specularity
function Water() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  const shaderData = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColorBeach: { value: new THREE.Color('#22d3ee') }, // Bright Cyan Shore
      uColorDeep: { value: new THREE.Color('#0369a1') }  // Deep Azure Blue
    },
    vertexShader: `
      uniform float uTime;
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vPosition = position;
        
        // Sum of 3 waves (Gerstner-like sine waves)
        float wave1 = sin(position.x * 0.15 + uTime * 1.6) * cos(position.y * 0.15 + uTime * 1.6) * 0.15;
        float wave2 = sin(position.x * 0.35 - uTime * 2.2) * 0.06;
        float wave3 = sin(position.y * 0.08 + uTime * 0.9) * 0.2;
        float waveHeight = wave1 + wave2 + wave3;
        
        vec3 newPos = vec3(position.x, position.y, position.z + waveHeight);
        
        // Derivatives for normal calculation
        float dzdx = 0.15 * 0.15 * cos(position.x * 0.15 + uTime * 1.6) * cos(position.y * 0.15 + uTime * 1.6) - 0.35 * 0.06 * cos(position.x * 0.35 - uTime * 2.2);
        float dzdy = -0.15 * 0.15 * sin(position.x * 0.15 + uTime * 1.6) * sin(position.y * 0.15 + uTime * 1.6) + 0.08 * 0.2 * cos(position.y * 0.08 + uTime * 0.9);
        
        // Normal in local space: normalize(-dzdx, -dzdy, 1)
        vec3 localNormal = normalize(vec3(-dzdx, -dzdy, 1.0));
        
        // Pass to fragment shader
        vNormal = normalize(normalMatrix * localNormal);
        
        vec4 worldPos = modelMatrix * vec4(newPos, 1.0);
        vWorldPosition = worldPos.xyz;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        vec3 normal = normalize(vNormal);
        
        if (!gl_FrontFacing) normal = -normal;
        
        // Sky reflection vector
        vec3 reflectDir = reflect(-viewDir, normal);
        
        // Twilight sky gradient reflection approximation
        vec3 topColor = vec3(0.086, 0.043, 0.133);     // #160b22 (deep twilight violet)
        vec3 middleColor = vec3(0.08, 0.22, 0.45);     // twilight blue
        vec3 bottomColor = vec3(0.85, 0.47, 0.02);     // #d97706 (sunset gold)
        float h = reflectDir.y;
        vec3 skyReflection = mix(bottomColor, middleColor, clamp(h * 1.5 + 0.5, 0.0, 1.0));
        skyReflection = mix(skyReflection, topColor, clamp((h - 0.3) * 1.5, 0.0, 1.0));
        
        // Fresnel reflection coefficient
        float fresnel = pow(1.0 - max(0.0, dot(viewDir, normal)), 4.0);
        fresnel = clamp(fresnel * 0.78 + 0.06, 0.0, 1.0);
        
        // Depth-based water coloration
        float worldZ = 46.0 + vPosition.y; 
        float depthFactor = clamp((worldZ - 23.0) / 14.0, 0.0, 1.0);
        
        vec3 shallowColor = vec3(0.05, 0.68, 0.82); // Turquoise Shore
        vec3 deepColor = vec3(0.01, 0.12, 0.28);    // Deep Navy Blue
        vec3 waterColor = mix(shallowColor, deepColor, depthFactor);
        
        // Caustics light ray simulation in shallow water
        float caustics1 = sin(vPosition.x * 5.0 + uTime * 1.8) * cos(vPosition.y * 5.0 - uTime * 1.8) * 0.5 + 0.5;
        float caustics2 = sin(vPosition.x * 10.0 - uTime * 2.5) * cos(vPosition.y * 10.0 + uTime * 2.5) * 0.5 + 0.5;
        float caustics = max(0.0, caustics1 * caustics2) * (1.0 - depthFactor) * 0.22;
        vec3 baseWaterColor = waterColor + vec3(0.85, 0.98, 1.0) * caustics;
        
        // Organic shoreline foam effect
        float foamDistort = sin(vPosition.x * 8.0 + uTime * 3.0) * 0.05 + cos(vPosition.y * 6.0 - uTime * 2.0) * 0.03;
        float foamFactor = clamp((26.2 + foamDistort - worldZ) / 2.5, 0.0, 1.0);
        float foamPattern = sin(vPosition.x * 5.0 + uTime * 3.5) * cos(vPosition.y * 5.0 - uTime * 2.5) * 0.5 + 0.5;
        float foam = step(0.42, foamPattern) * foamFactor * 0.4;
        
        vec3 finalColor = mix(baseWaterColor, vec3(0.96, 0.96, 0.98), foam);
        
        // Blend in sky reflections
        vec3 colorWithReflection = mix(finalColor, skyReflection, fresnel);
        
        // Glistening sun specular reflection highlights
        float sparkleNoise = sin(vPosition.x * 20.0 + uTime * 6.0) * cos(vPosition.y * 20.0 - uTime * 4.0);
        float sparkleFactor = step(0.85, sparkleNoise) * 0.4;
        
        vec3 sunDir = normalize(vec3(12.0, 18.0, 8.0));
        vec3 halfDir = normalize(sunDir + viewDir);
        float spec = pow(max(0.0, dot(normal, halfDir)), 120.0);
        vec3 specularColor = vec3(0.99, 0.92, 0.78) * (spec + spec * sparkleFactor) * 1.6;
        
        // Opacity changes based on view angle for liquid look
        float opacity = mix(0.72, 0.92, fresnel);
        
        gl_FragColor = vec4(colorWithReflection + specularColor, opacity);
      }
    `
  }), []);

  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -1.15, 46]}
    >
      <planeGeometry args={[130, 42, 120, 60]} />
      <shaderMaterial
        uniforms={shaderData.uniforms}
        vertexShader={shaderData.vertexShader}
        fragmentShader={shaderData.fragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

// 3D Straw Beach Hut
function Hut({ position, scale = 1.0 }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Wood log cylinder base */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.25, 1.8, 8]} />
        <meshStandardMaterial color="#854d0e" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.9, 0]} scale={[1.02, 1.0, 1.02]}>
        <cylinderGeometry args={[1.2, 1.25, 1.8, 8]} />
        <meshBasicMaterial color="#000000" side={THREE.BackSide} />
      </mesh>

      {/* Straw Thatched Roof cone */}
      <mesh position={[0, 2.3, 0]} castShadow>
        <coneGeometry args={[1.7, 1.3, 8]} />
        <meshStandardMaterial color="#ca8a04" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.3, 0]} scale={[1.03, 1.02, 1.03]}>
        <coneGeometry args={[1.7, 1.3, 8]} />
        <meshBasicMaterial color="#000000" side={THREE.BackSide} />
      </mesh>

      {/* Hut Door */}
      <mesh position={[0, 0.55, 1.21]} castShadow>
        <boxGeometry args={[0.55, 1.1, 0.04]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.55, 1.21]} scale={[1.06, 1.04, 1.1]}>
        <boxGeometry args={[0.55, 1.1, 0.04]} />
        <meshBasicMaterial color="#000000" side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

// Low-poly curved Coconut Palm Tree
function CoconutTree({ position }) {
  return (
    <group position={position}>
      {/* segment 1 */}
      <mesh position={[0, 0.5, 0]} rotation={[0.06, 0, 0.05]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 1.0, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
      {/* segment 2 */}
      <mesh position={[0.05, 1.4, -0.04]} rotation={[0.1, 0, 0.12]} castShadow>
        <cylinderGeometry args={[0.075, 0.09, 1.0, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
      {/* segment 3 */}
      <mesh position={[0.22, 2.25, -0.12]} rotation={[0.16, 0, 0.2]} castShadow>
        <cylinderGeometry args={[0.06, 0.075, 0.9, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>

      {/* Fronds / Canopy */}
      <group position={[0.34, 2.65, -0.18]}>
        {Array.from({ length: 5 }).map((_, i) => {
          const angle = (i / 5) * Math.PI * 2;
          return (
            <mesh 
              key={`palm-leaf-${i}`}
              position={[Math.cos(angle) * 0.42, -0.08, Math.sin(angle) * 0.42]}
              rotation={[0.22, angle, -0.22]}
              castShadow
            >
              <boxGeometry args={[0.8, 0.015, 0.2]} />
              <meshStandardMaterial color="#166534" roughness={0.9} />
            </mesh>
          );
        })}
        {/* coconuts */}
        <mesh position={[-0.04, -0.12, 0.04]}>
          <sphereGeometry args={[0.07, 5, 5]} />
          <meshStandardMaterial color="#451a03" roughness={0.8} />
        </mesh>
        <mesh position={[0.04, -0.12, -0.04]}>
          <sphereGeometry args={[0.07, 5, 5]} />
          <meshStandardMaterial color="#451a03" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

// Flickering campfire with stone ring, logs, cone flames, smoke particles, and light
function Fireplace({ position }) {
  const fireRef = useRef();
  const lightRef = useRef();
  const smokeRefs = useRef([]);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (fireRef.current) {
      const scaleY = 0.8 + Math.sin(time * 32.0) * 0.15 + Math.cos(time * 18.0) * 0.08;
      const scaleXZ = 0.95 + Math.cos(time * 26.0) * 0.1;
      fireRef.current.scale.set(scaleXZ, scaleY, scaleXZ);
    }
    if (lightRef.current) {
      lightRef.current.intensity = 2.2 + Math.sin(time * 40.0) * 0.4 + Math.cos(time * 22.0) * 0.2;
    }
    smokeRefs.current.forEach((smoke, i) => {
      if (!smoke) return;
      const speed = 0.4 + i * 0.06;
      const cycle = (time * speed + i * 0.75) % 2.5;
      const yPos = 0.12 + cycle * 0.8;
      const drift = Math.sin(time * 1.6 + i) * 0.1 * cycle;
      smoke.position.set(drift, yPos, drift);
      
      const scale = Math.max(0.001, (1.0 - cycle / 2.5) * 0.075);
      smoke.scale.set(scale, scale, scale);
    });
  });

  return (
    <group position={position}>
      {/* Stone Ring */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 0.42;
        return (
          <mesh 
            key={`fireplace-stone-${i}`}
            position={[Math.cos(angle) * radius, 0.03, Math.sin(angle) * radius]}
            rotation={[Math.random() * 0.2, angle, Math.random() * 0.2]}
            castShadow
          >
            <dodecahedronGeometry args={[0.075]} />
            <meshStandardMaterial color="#57534e" roughness={0.9} />
          </mesh>
        );
      })}
      
      {/* Crossed wood logs */}
      <mesh rotation={[0.22, 0.4, 0.52]} position={[0, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.38, 5]} />
        <meshStandardMaterial color="#451a03" roughness={0.95} />
      </mesh>
      <mesh rotation={[0.22, -1.0, -0.52]} position={[0, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.38, 5]} />
        <meshStandardMaterial color="#451a03" roughness={0.95} />
      </mesh>

      {/* Fire Cone */}
      <mesh ref={fireRef} position={[0, 0.14, 0]} castShadow>
        <coneGeometry args={[0.13, 0.48, 6]} />
        <meshBasicMaterial color="#ea580c" />
      </mesh>
      <mesh position={[0, 0.14, 0]} scale={[1.15, 1.15, 1.15]}>
        <coneGeometry args={[0.13, 0.48, 6]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.45} side={THREE.BackSide} />
      </mesh>

      <pointLight ref={lightRef} color="#ea580c" intensity={2.2} distance={8} position={[0, 0.2, 0]} castShadow />

      {/* Smoke particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`smoke-p-${i}`} ref={el => smokeRefs.current[i] = el}>
          <sphereGeometry args={[0.3, 5, 5]} />
          <meshBasicMaterial color="#78716c" transparent opacity={0.32} />
        </mesh>
      ))}
    </group>
  );
}

// Dadilo Alex wizard NPC
function DadiloAlexNPC({ isNear }) {
  const staffGlowRef = useRef();
  
  useFrame((state) => {
    if (staffGlowRef.current) {
      staffGlowRef.current.intensity = 1.2 + Math.sin(state.clock.getElapsedTime() * 4.5) * 0.3;
    }
  });

  return (
    <group position={[-12, getHeight(-12, 22), 22]} rotation={[0, Math.PI / 4, 0]}>
      {/* Wizard Body / Robe */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 0.8, 8]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.8} /> {/* Dark Blue Robe */}
      </mesh>
      <mesh position={[0, 0.4, 0]} scale={[1.06, 1.0, 1.06]}>
        <cylinderGeometry args={[0.16, 0.22, 0.8, 8]} />
        <meshBasicMaterial color="#000000" side={THREE.BackSide} />
      </mesh>

      {/* Head & Beard */}
      <group position={[0, 0.88, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.13, 8, 8]} />
          <meshStandardMaterial color="#ffdfc4" />
        </mesh>
        
        {/* White Beard */}
        <mesh position={[0, -0.16, 0.08]} rotation={[0.2, 0, 0]} castShadow>
          <coneGeometry args={[0.09, 0.38, 6]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
        </mesh>
        
        {/* Wizard Pointed Hat */}
        <group position={[0, 0.12, 0]} rotation={[-0.1, 0, 0]}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <coneGeometry args={[0.14, 0.32, 6]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.85} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.18, 0.02, 6, 16]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.85} />
          </mesh>
        </group>
      </group>

      {/* Wizard Staff */}
      <group position={[0.22, 0.4, 0.15]} rotation={[0.06, 0, -0.06]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.018, 0.018, 1.1, 6]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0, 0.58, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color="#fbbf24" /> {/* Glowing gold crystal ball */}
        </mesh>
        <pointLight ref={staffGlowRef} color="#fbbf24" intensity={1.5} distance={5} position={[0, 0.58, 0]} />
      </group>

      {/* Talking bubble prompt */}
      {isNear && (
        <Html position={[0, 1.55, 0]} center distanceFactor={5.5}>
          <div className="glass-panel overworld-interact-badge" style={{
            padding: '5px 12px',
            fontSize: '11px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            boxShadow: '0 0 10px rgba(234,179,8,0.25)',
            border: '1px solid var(--xp-color)',
            animation: 'float-y 2.5s infinite ease-in-out'
          }}>
            Talk to Dadilo Alex [F]
          </div>
        </Html>
      )}
    </group>
  );
}

export default function Environment({ playerRef }) {
  const phase = useGameStore(state => state.phase);
  const defeatedEnemies = useGameStore(state => state.defeatedEnemies);
  const startCombat = useGameStore(state => state.startCombat);
  const setPlayerPosition = useGameStore(state => state.setPlayerPosition);
  
  const crystalsRef = useRef([]);
  const enemiesRef = useRef([]);
  const merchantRef = useRef();

  // Load textures
  const barkTex = useMemo(() => createBarkTexture(), []);
  const leafTex = useMemo(() => createLeafTexture(), []);
  const stoneTex = useMemo(() => createStoneTexture(), []);
  const textures = useMemo(() => ({ barkTex, leafTex, stoneTex }), [barkTex, leafTex, stoneTex]);

  const foliage = useMemo(() => getFoliage(), []);

  // Grass tufts
  const grassTufts = useMemo(() => {
    const list = [];
    let state = 98765;
    const nextRandom = () => {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
    
    for (let i = 0; i < 220; i++) {
      const x = nextRandom() * 110 - 55;
      const z = nextRandom() * 110 - 55;
      
      const distFromCenter = Math.sqrt(x * x + z * z);
      if (distFromCenter < 4.5) continue;
      if (z > 17) continue; // no grass on beach/underwater
      
      const scale = 0.45 + nextRandom() * 0.8;
      list.push({ x, z, scale });
    }
    return list;
  }, []);

  const triggerTransitionFlash = () => {
    const flash = document.getElementById('combat-flash');
    if (flash) {
      flash.classList.add('active');
      setTimeout(() => {
        flash.classList.remove('active');
      }, 1200);
    }
  };

  // Near NPC checking state
  const isNearNPC = useGameStore(state => state.isNearNPC);
  const dialogueActive = useGameStore(state => state.dialogue.active);

  useFrame((state, delta) => {
    const isPaused = useGameStore.getState().isPaused;
    if (phase !== 'EXPLORING' || isPaused) return;

    // Process respawns tick
    useGameStore.getState().updateRespawns();

    const time = state.clock.getElapsedTime();

    // Bob Crystals
    crystalsRef.current.forEach((crystal, idx) => {
      if (crystal) {
        const cData = CRYSTALS[idx];
        const baseY = getHeight(cData.pos[0], cData.pos[2]) + 0.65;
        crystal.position.y = baseY + Math.sin(time * 2 + idx) * 0.15;
        crystal.rotation.y += delta * 0.8;
      }
    });

    const player = playerRef.current;
    if (!player) return;

    // Bob Merchant
    if (merchantRef.current) {
      const baseY = getHeight(0, 4) + 0.65;
      merchantRef.current.position.y = baseY + Math.sin(time * 1.5) * 0.12;
      merchantRef.current.rotation.y += delta * 0.5;
    }

    // Proximity check for Merchant
    const merchantDistance = player.position.distanceTo(new THREE.Vector3(0, player.position.y, 4));
    const isNear = merchantDistance < 2.0;
    if (isNear !== useGameStore.getState().isNearMerchant) {
      useGameStore.setState({ isNearMerchant: isNear });
    }

    // Proximity check for Dadilo Alex NPC
    const npcDistance = player.position.distanceTo(new THREE.Vector3(-12, player.position.y, 22));
    const isNearNPCNow = npcDistance < 2.2;
    if (isNearNPCNow !== useGameStore.getState().isNearNPC) {
      useGameStore.setState({ isNearNPC: isNearNPCNow });
    }

    // Ground enemies and check collision
    enemiesRef.current.forEach((enemy, idx) => {
      const data = ENEMIES_DATA[idx];
      if (!enemy || defeatedEnemies.includes(data.id)) return;

      const radius = data.id === 'enemy_boss_anomaly' ? 1.2 : 3.2;
      const speed = data.id === 'enemy_boss_anomaly' ? 0.35 : 0.6;
      const angle = time * speed + idx;
      
      const patrolX = data.pos[0] + Math.cos(angle) * radius;
      const patrolZ = data.pos[2] + Math.sin(angle) * radius;
      
      enemy.position.x = patrolX;
      enemy.position.z = patrolZ;
      enemy.position.y = getHeight(patrolX, patrolZ) + 0.12;
      
      enemy.rotation.y = angle + Math.PI / 2;

      // Distance check to trigger Combat (only if not in dialogue!)
      if (!dialogueActive) {
        const distance = player.position.distanceTo(enemy.position);
        if (distance < 1.9) {
          triggerTransitionFlash();
          setPlayerPosition([player.position.x, player.position.y, player.position.z]);
          
          setTimeout(() => {
            // Stats are overridden in startCombat by ENCOUNTERS templates!
            startCombat(data.id, data.name, 100, 10, 5, 10);
          }, 350);
        }
      }
    });
  });

  return (
    <group>
      {/* Enlarged low-poly terrain */}
      <Terrain />

      {/* Dynamic realistic water shader plane */}
      <Water />

      {/* Beach campsites Huts & Campfires */}
      <Hut position={[-15, getHeight(-15, 25), 25]} scale={1.0} />
      <Hut position={[-6, getHeight(-6, 26), 26]} scale={0.88} />
      <Fireplace position={[-10, getHeight(-10, 24), 24]} />

      {/* Coconut Palm Trees along beach shore */}
      <CoconutTree position={[-20, getHeight(-20, 18), 18]} />
      <CoconutTree position={[-1, getHeight(-1, 19), 19]} />
      <CoconutTree position={[12, getHeight(12, 18), 18]} />
      <CoconutTree position={[26, getHeight(26, 17), 17]} />

      {/* Dadilo Alex NPC */}
      <DadiloAlexNPC isNear={isNearNPC} />

      {/* Rocky Boundary cliffs */}
      <mesh position={[0, 4, -62]} receiveShadow>
        <boxGeometry args={[130, 10, 2]} />
        <meshStandardMaterial map={stoneTex} color="#2e2a27" roughness={0.9} />
      </mesh>
      <mesh position={[0, 4, 62]} receiveShadow>
        <boxGeometry args={[130, 10, 2]} />
        <meshStandardMaterial map={stoneTex} color="#2e2a27" roughness={0.9} />
      </mesh>
      <mesh position={[-62, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[130, 10, 2]} />
        <meshStandardMaterial map={stoneTex} color="#2e2a27" roughness={0.9} />
      </mesh>
      <mesh position={[62, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[130, 10, 2]} />
        <meshStandardMaterial map={stoneTex} color="#2e2a27" roughness={0.9} />
      </mesh>

      {/* Scattered Pine/Oak Trees and Boulders */}
      {foliage.map((item, idx) => (
        <FoliageItem key={`foliage-${idx}`} item={item} textures={textures} />
      ))}

      {/* Scattered Tall Grass */}
      {grassTufts.map((g, idx) => (
        <GrassTuft key={`grass-${idx}`} x={g.x} z={g.z} scale={g.scale} />
      ))}

      {/* Glowing Crystals */}
      {CRYSTALS.map((c, idx) => (
        <group key={`crystal-${c.id}`} position={[c.pos[0], 0, c.pos[2]]} ref={el => crystalsRef.current[idx] = el}>
          <mesh castShadow>
            <octahedronGeometry args={[0.25]} />
            <meshBasicMaterial color={c.color} />
          </mesh>
          <mesh scale={[1.15, 1.15, 1.15]}>
            <octahedronGeometry args={[0.25]} />
            <meshBasicMaterial color={c.color} side={THREE.BackSide} transparent opacity={0.3} />
          </mesh>
        </group>
      ))}

      {/* Patrolling Overworld Monsters with respective EnemyModels */}
      {ENEMIES_DATA.map((e, idx) => {
        if (defeatedEnemies.includes(e.id)) return null;
        
        return (
          <group 
            key={e.id} 
            position={[e.pos[0], 0.6, e.pos[2]]} 
            ref={el => enemiesRef.current[idx] = el}
          >
            <EnemyModel
              type={e.type}
              animationState="walk"
              animVariant={idx}
            />
          </group>
        );
      })}

      {/* Ethereal Shop Merchant */}
      <group position={[0, 0, 4]}>
        <group ref={merchantRef}>
          <mesh castShadow>
            <octahedronGeometry args={[0.5]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>
          <mesh scale={[1.1, 1.1, 1.1]}>
            <octahedronGeometry args={[0.5]} />
            <meshBasicMaterial color="#ffffff" side={THREE.BackSide} transparent opacity={0.15} />
          </mesh>
        </group>
        
        <mesh rotation={[Math.PI / 4, 0, 0]} position={[0, getHeight(0, 4) + 0.65, 0]}>
          <torusGeometry args={[0.8, 0.02, 8, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
        <mesh rotation={[-Math.PI / 4, 0, 0]} position={[0, getHeight(0, 4) + 0.65, 0]}>
          <torusGeometry args={[0.9, 0.02, 8, 32]} />
          <meshBasicMaterial color="#eab308" transparent opacity={0.4} />
        </mesh>
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, getHeight(0, 4) + 0.1, 0]}>
          <ringGeometry args={[0.1, 1.2, 32]} />
          <meshBasicMaterial color="#eab308" side={THREE.DoubleSide} transparent opacity={0.15} />
        </mesh>
      </group>
    </group>
  );
}
