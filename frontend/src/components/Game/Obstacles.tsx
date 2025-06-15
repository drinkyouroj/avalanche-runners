import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';

// Types of obstacles we can generate
type ObstacleType = 'box' | 'wall' | 'barrier';

interface Obstacle {
  id: number;
  type: ObstacleType;
  position: [number, number, number];
  lane: number; // -1, 0, 1
  scale: [number, number, number];
  color: string;
}

export const Obstacles: React.FC = () => {
  // State to keep track of active obstacles
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  
  // Ref to keep track of time for spawning obstacles
  const spawnTimerRef = useRef(0);
  const obstacleRefs = useRef<{ [key: number]: THREE.Mesh }>({});
  const nextIdRef = useRef(1);

  // Obstacle colors for visual variety
  const obstacleColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];

  // Function to spawn a new obstacle
  const spawnObstacle = () => {
    const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    const obstacleTypes: ObstacleType[] = ['box', 'wall', 'barrier'];
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    
    let scale: [number, number, number];
    switch (type) {
      case 'box':
        scale = [1, 1, 1];
        break;
      case 'wall':
        scale = [3, 2, 0.5];
        break;
      case 'barrier':
        scale = [1.5, 0.5, 0.5];
        break;
    }
    
    const color = obstacleColors[Math.floor(Math.random() * obstacleColors.length)];
    const id = nextIdRef.current++;
    
    // Create new obstacle and add to state
    const newObstacle: Obstacle = {
      id,
      type,
      position: [lane * 3, scale[1] / 2, -50], // Place far down the track
      lane,
      scale,
      color,
    };
    
    setObstacles(prev => [...prev, newObstacle]);
  };

  // Animation and game logic loop
  useFrame((state, delta) => {
    // Update spawn timer
    spawnTimerRef.current += delta;
    
    // Spawn new obstacles periodically
    if (spawnTimerRef.current > 2) { // every 2 seconds
      spawnObstacle();
      spawnTimerRef.current = 0;
    }
    
    // Move obstacles towards player and remove when passed
    setObstacles(prev => {
      return prev
        .map(obstacle => {
          // Update obstacle position
          const mesh = obstacleRefs.current[obstacle.id];
          if (mesh) {
            mesh.position.z += 10 * delta; // Move towards player
          }
          
          return {
            ...obstacle,
            position: [
              obstacle.position[0],
              obstacle.position[1],
              obstacle.position[2] + 10 * delta
            ]
          };
        })
        .filter(obstacle => obstacle.position[2] < 20); // Remove obstacles that pass the player
    });
  });

  return (
    <group>
      {obstacles.map(obstacle => (
        <ObstacleInstance 
          key={obstacle.id} 
          obstacle={obstacle} 
          ref={(el: THREE.Mesh | null) => {
            if (el) obstacleRefs.current[obstacle.id] = el;
          }} 
        />
      ))}
    </group>
  );
};

// Individual obstacle instance
interface ObstacleInstanceProps {
  obstacle: Obstacle;
}

const ObstacleInstance = React.forwardRef<THREE.Mesh, ObstacleInstanceProps>(
  ({ obstacle }, ref) => {
    // Physics body for collision detection
    const [physicsRef] = useBox(() => ({
      mass: 0, // Static object
      position: obstacle.position,
      args: obstacle.scale,
      type: 'Static',
    }));

    return (
      <mesh 
        ref={(el) => {
          if (el) {
            // Update both refs
            if (typeof ref === 'function') ref(el);
            (physicsRef as any).current = el;
          }
        }} 
        position={obstacle.position}
        castShadow
      >
        <boxGeometry args={obstacle.scale} />
        <meshStandardMaterial color={obstacle.color} />
      </mesh>
    );
  }
);
