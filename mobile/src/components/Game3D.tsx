import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, PointLight, MeshDistortMaterial } from '@react-three/drei';
import * as CANNON from 'cannon-es';
import { Vector3 } from 'three';
import { useAudio } from '../hooks/useAudio';
import { useParticleEffects } from '../hooks/useParticleEffects';
import { useGameEffects } from '../hooks/useGameEffects';

interface GameState {
  score: number;
  isPlaying: boolean;
  sphereColor: string;
}

function Game3D({ onScoreChange, onHit }: { onScoreChange: (score: number) => void; onHit: () => void }) {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    isPlaying: false,
    sphereColor: '#ff6b6b'
  });

  const sphereRef = useRef<any>();
  const worldRef = useRef<CANNON.World | null>(null);
  const sphereBodyRef = useRef<CANNON.Body | null>(null);
  const arrowRef = useRef<any>(null);
  const lastHitTime = useRef<number>(0);

  // Custom hooks
  const { playSound } = useAudio();
  const { createHitEffect, createFireTrail } = useParticleEffects();
  const { triggerHitEffect, triggerShootEffect } = useGameEffects();

  // Initialize physics world
  useEffect(() => {
    worldRef.current = new CANNON.World();
    worldRef.current.gravity.set(0, 0, 0);
    worldRef.current.broadphase.setStrategy(0);
    worldRef.current.solver.iterations = 10;

    // Create sphere physics body
    const sphereShape = new CANNON.Sphere(2);
    const sphereBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 0, 0),
      shape: sphereShape,
      material: new CANNON.Material({
        friction: 0.4,
        restitution: 0.3
      })
    });
    worldRef.current.addBody(sphereBody);
    sphereBodyRef.current = sphereBody;

    return () => {
      worldRef.current = null;
      sphereBodyRef.current = null;
    };
  }, []);

  // Game loop
  useFrame((state, delta) => {
    if (worldRef.current) {
      worldRef.current.step(1/60, delta, 3);
    }

    // Update sphere visual position with physics body
    if (sphereRef.current && sphereBodyRef.current) {
      sphereRef.current.position.copy(sphereBodyRef.current.position as Vector3);
      sphereRef.current.quaternion.copy(sphereBodyRef.current.quaternion as any);
    }

    // Arrow animation (if exists)
    if (arrowRef.current) {
      arrowRef.current.position.z += 0.05;
      if (arrowRef.current.position.z > 10) {
        // Reset arrow
        arrowRef.current.position.set(0, 0, -5);
        arrowRef.current.rotation.y = 0;
      }
    }
  });

  const handleShoot = () => {
    if (!arrowRef.current) return;
    
    // Play shoot sound
    playSound('shoot');
    triggerShootEffect();
    
    // Create fire trail effect
    createFireTrail({ x: 0, y: 0, z: -5 });
    
    // Check collision
    const distance = Math.sqrt(
      Math.pow(arrowRef.current.position.x, 2) +
      Math.pow(arrowRef.current.position.y, 2) +
      Math.pow(arrowRef.current.position.z - 2, 2)
    );
    
    if (distance < 3) {
      // Hit detected
      const now = Date.now();
      if (now - lastHitTime.current > 500) { // Prevent rapid multiple hits
        const newScore = gameState.score + 1;
        setGameState(prev => ({
          ...prev,
          score: newScore,
          sphereColor: `#${Math.floor(Math.random()*16777215).toString(16)}`
        }));
        onScoreChange(newScore);
        onHit();
        
        // Trigger visual and audio effects
        triggerHitEffect();
        playSound('hit');
        createHitEffect({ x: 0, y: 0, z: 2 });
        
        lastHitTime.current = now;
      }
    }
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={2} />
      <pointLight position={[-10, -10, 10]} intensity={2} />
      <pointLight position={[0, 10, -10]} intensity={2} />

      <Sphere
        ref={sphereRef}
        args={[2, 32, 32]}
        position={[0, 0, 0]}
        scale={1}
      >
        <MeshDistortMaterial
          color={gameState.sphereColor}
          emissive={gameState.sphereColor}
          emissiveIntensity={0.2}
          speed={2}
          distort={0.1}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      {/* Arrow visualization */}
      <mesh ref={arrowRef} position={[0, 0, -5]}>
        <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
        <meshPhongMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.5} />
      </mesh>

      <OrbitControls enableZoom={false} enablePan={false} />
    </>
  );
}

export default Game3D;