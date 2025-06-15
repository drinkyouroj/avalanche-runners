import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePlane } from '@react-three/cannon';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export const RunningTrack: React.FC = () => {
  // Physics for the ground plane
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0], // Rotate to be flat
    position: [0, 0, 0],
    type: 'Static',
  }));

  // Create segments of the track that will move
  const trackSegments = useRef<THREE.Mesh[]>([]);
  const segmentLength = 20;
  const totalSegments = 5;
  
  // Optional: Load texture for the track
  const trackTexture = useTexture('/assets/kenney/platformer-pack/textures/ground.png');
  trackTexture.wrapS = trackTexture.wrapT = THREE.RepeatWrapping;
  trackTexture.repeat.set(5, 20); // Adjust based on your texture
  
  // Animation for track movement
  useFrame((state, delta) => {
    // Move track segments to create infinite scrolling effect
    trackSegments.current.forEach((segment, index) => {
      segment.position.z += 5 * delta; // Move forward
      
      // If a segment has moved past the player, reset it to the back
      if (segment.position.z > 20) {
        segment.position.z = -segmentLength * (totalSegments - 1);
      }
    });
  });

  return (
    <group>
      {/* Main ground plane with physics */}
      <mesh ref={ref as any} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#4a7026" 
          roughness={0.8} 
        />
      </mesh>

      {/* Track segments that will move */}
      {Array(totalSegments).fill(0).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) trackSegments.current[i] = el;
          }}
          position={[0, 0.01, -i * segmentLength]} // Slightly above ground to avoid z-fighting
          receiveShadow
        >
          <planeGeometry args={[10, segmentLength]} />
          <meshStandardMaterial 
            map={trackTexture}
            roughness={0.7} 
            color="#7a6c4e"
          />
        </mesh>
      ))}
    </group>
  );
};
