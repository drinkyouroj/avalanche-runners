import React, { useRef, useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

export const Player: React.FC = () => {
  // State for player movement
  const [position, setPosition] = useState<[number, number, number]>([0, 1, 0]);
  const [lane, setLane] = useState(0); // -1: left, 0: center, 1: right
  const [isJumping, setIsJumping] = useState(false);

  // References
  const playerRef = useRef<THREE.Group>(null);
  const jumptimeRef = useRef(0);
  
  // Physics body for collisions
  const [physicsRef, api] = useBox(() => ({
    mass: 1,
    position: [0, 1, 0],
    args: [0.5, 1, 0.5], // Box size
    fixedRotation: true,
    onCollide: (e) => handleCollision(e),
  }));

  // Handle collisions with obstacles
  const handleCollision = (event: any) => {
    // In a real game, implement player damage, game over, etc.
    console.log('Collision detected!', event);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          if (lane > -1) setLane(lane - 1);
          break;
        case 'ArrowRight':
          if (lane < 1) setLane(lane + 1);
          break;
        case 'ArrowUp':
        case ' ': // Spacebar
          if (!isJumping) {
            setIsJumping(true);
            jumptimeRef.current = 0;
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lane, isJumping]);

  // Animation loop
  useFrame((state, delta) => {
    if (!playerRef.current) return;

    // Handle lane changes (left/right movement)
    const targetX = lane * 3; // 3 units between lanes
    playerRef.current.position.x = THREE.MathUtils.lerp(
      playerRef.current.position.x, 
      targetX, 
      0.1
    );
    
    // Update physics body position
    api.position.set(playerRef.current.position.x, playerRef.current.position.y, playerRef.current.position.z);

    // Handle jumping
    if (isJumping) {
      jumptimeRef.current += delta;
      
      // Jump curve - simple sine wave
      const jumpHeight = 2.5;
      const jumpDuration = 1; // in seconds
      
      playerRef.current.position.y = 1 + Math.sin((jumptimeRef.current / jumpDuration) * Math.PI) * jumpHeight;
      
      // End jump when animation completes
      if (jumptimeRef.current >= jumpDuration) {
        setIsJumping(false);
        playerRef.current.position.y = 1;
      }
    }
  });

  // For development, use a simple colored box
  // In a production game, replace with a 3D model
  return (
    <group ref={playerRef} position={position}>
      {/* This is the visible player model */}
      <mesh castShadow>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      
      {/* This is the invisible physics body */}
      <mesh ref={physicsRef as any} visible={false}>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial wireframe opacity={0} transparent />
      </mesh>
    </group>
  );
};
