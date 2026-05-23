import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

export default function CinemachineCamera({ playerRef }) {
  const phase = useGameStore(state => state.phase);
  const combat = useGameStore(state => state.combat);
  
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentPos = useRef(new THREE.Vector3(0, 8, 10));

  useFrame((state) => {
    const camera = state.camera;
    
    if (phase === 'COMBAT') {
      // Combat Arena Camera Angles
      let targetPos = new THREE.Vector3(6, 6, 6);
      let targetLookAt = new THREE.Vector3(0, 0.5, -2);
      
      // If there is an active animating action, create dynamic camera work
      if (combat.animatingAction) {
        const { attacker } = combat.animatingAction;
        if (attacker === 'Azrin' || attacker === 'Azrael') {
          // Hero attacking: camera swoops behind the hero or zooms in
          targetPos.set(0, 2, 4); // close up from front-left
          targetLookAt.set(0, 0.5, -4); // looking at enemy
        } else {
          // Enemy attacking: camera looks from behind the enemy
          targetPos.set(0, 3, -8);
          targetLookAt.set(0, 0.5, 0); // looking at heroes
        }
      } else {
        // Normal combat overview camera
        targetPos.set(5, 5, 5);
        targetLookAt.set(0, 0.5, -2);
      }

      currentPos.current.lerp(targetPos, 0.05);
      currentLookAt.current.lerp(targetLookAt, 0.05);
      
      camera.position.copy(currentPos.current);
      camera.lookAt(currentLookAt.current);
    } else {
      // Overworld Camera Follow
      if (!playerRef.current) return;
      
      const playerPos = playerRef.current.position;
      
      // Target position: offset behind and above the player
      // We'll set a standard follow offset of [0, 6, 8]
      const offset = new THREE.Vector3(0, 6.5, 8.5);
      const targetPos = new THREE.Vector3().copy(playerPos).add(offset);
      
      // Interpolate camera position
      camera.position.lerp(targetPos, 0.07);
      
      // Interpolate lookAt target (slightly above player origin)
      const lookAtTarget = new THREE.Vector3(playerPos.x, playerPos.y + 0.8, playerPos.z);
      currentLookAt.current.lerp(lookAtTarget, 0.08);
      camera.lookAt(currentLookAt.current);
    }
  });

  return null;
}
