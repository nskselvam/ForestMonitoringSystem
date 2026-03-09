import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

// Simulates a terrain changing over time
function AnimatedTerrain() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const gridSize = 20;
  const count = gridSize * gridSize;
  
  // Create dummy data for heights and colors
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(() => {
    const array = new Float32Array(count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      // Base color green (vegetation), mix in some purple (urban) and red (deforest) randomly
      const rand = Math.random();
      if (rand > 0.8) color.setHSL(271/360, 0.81, 0.56); // Purple
      else if (rand > 0.7) color.setHSL(0/360, 0.84, 0.60); // Red
      else color.setHSL(142/360, 0.71, 0.45); // Green
      
      color.toArray(array, i * 3);
    }
    return array;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    let i = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        // Wave function for height
        const height = Math.sin(x * 0.5 + time) * Math.cos(z * 0.5 + time) * 0.5 + 0.5;
        
        dummy.position.set(
          x - gridSize / 2 + 0.5,
          height / 2,
          z - gridSize / 2 + 0.5
        );
        dummy.scale.set(0.9, height + 0.1, 0.9);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i++, dummy.matrix);
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]}>
        <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
      </boxGeometry>
      <meshStandardMaterial vertexColors toneMapped={false} />
    </instancedMesh>
  );
}

export function ThreeDTerrain() {
  return (
    <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 text-white pointer-events-none">
        <h3 className="font-semibold tracking-wide">Terrain Transition Model</h3>
        <p className="text-xs text-slate-400">Green → Built-up Simulation</p>
      </div>
      <Canvas camera={{ position: [15, 10, 15], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <AnimatedTerrain />
        <Grid infiniteGrid fadeDistance={40} sectionColor="#334155" cellColor="#1e293b" />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
