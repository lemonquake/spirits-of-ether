import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import Player from './Player';
import Environment from './Environment';
import CombatArena from './CombatArena';
import CinemachineCamera from './CinemachineCamera';

function Skybox() {
  const uniforms = useRef({
    topColor: { value: new THREE.Color('#160b22') },     // deep twilight violet
    bottomColor: { value: new THREE.Color('#d97706') },  // sunset gold
  });
  
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[95, 32, 15]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms.current}
        vertexShader={`
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          varying vec3 vWorldPosition;
          void main() {
            float h = normalize(vWorldPosition).y;
            float t = max(0.0, min(1.0, h * 0.75 + 0.3));
            gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
          }
        `}
      />
    </mesh>
  );
}

export default function GameCanvas() {
  const phase = useGameStore(state => state.phase);
  const playerRef = useRef();

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        camera={{ position: [0, 8, 10], fov: 45 }}
        gl={{ antialias: true }}
        onPointerDown={(e) => {
          // Avoid stealing focus from standard UI click buttons
          if (e.target.tagName !== 'CANVAS') return;
        }}
      >
        {/* Skybox */}
        <Skybox />

        {/* Lights */}
        <ambientLight intensity={0.55} color="#4a3e35" />
        <directionalLight
          castShadow
          position={[12, 18, 8]}
          intensity={1.5}
          color="#fdf0d5"
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={40}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        <pointLight position={[-15, 10, -15]} intensity={0.6} color="#6d5c7e" />

        {/* Cinemachine Smooth Camera */}
        <CinemachineCamera playerRef={playerRef} />
        
        {/* Floating Sunset Fireflies */}
        <Sparkles count={55} scale={[30, 8, 30]} size={2.5} speed={0.5} color="#eedba5" opacity={0.8} />
        <Sparkles count={35} scale={[25, 6, 25]} size={1.8} speed={0.3} color="#fca5a5" opacity={0.6} />

        {/* Scene Switching */}
        {phase === 'COMBAT' ? (
          <CombatArena />
        ) : (
          <>
            <Environment playerRef={playerRef} />
            <Player playerRef={playerRef} />
          </>
        )}
      </Canvas>
    </div>
  );
}
