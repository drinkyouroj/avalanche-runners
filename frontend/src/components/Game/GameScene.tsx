import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sky } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import { RunningTrack } from './RunningTrack';
import { Player } from './Player';
import { Obstacles } from './Obstacles';

const GameScene: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        {/* Add ambient light for general illumination */}
        <ambientLight intensity={0.3} />
        
        {/* Add directional light for shadows */}
        <directionalLight 
          position={[10, 10, 10]} 
          intensity={1} 
          castShadow 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024} 
        />
        
        {/* Physics world for collisions and gravity */}
        <Physics>
          {/* Game elements */}
          <Suspense fallback={null}>
            <RunningTrack />
            <Player />
            <Obstacles />
          </Suspense>
        </Physics>
        
        {/* Environment and sky */}
        <Sky sunPosition={[100, 20, 100]} />
        <Environment preset="park" />
        
        {/* Camera controls for development */}
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default GameScene;
