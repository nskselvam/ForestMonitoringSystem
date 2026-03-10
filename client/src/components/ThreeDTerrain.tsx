import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

// Animated particles for deforestation effect
function DeforestationParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 200;
  
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 20;
      pos[i3 + 1] = Math.random() * 2;
      pos[i3 + 2] = (Math.random() - 0.5) * 20;
      
      vel[i3] = (Math.random() - 0.5) * 0.02;
      vel[i3 + 1] = Math.random() * 0.05 + 0.02;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    return [pos, vel];
  }, []);

  useFrame(() => {
    if (!particlesRef.current) return;
    const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      posArray[i3] += velocities[i3];
      posArray[i3 + 1] += velocities[i3 + 1];
      posArray[i3 + 2] += velocities[i3 + 2];
      
      // Reset particle if it goes too high
      if (posArray[i3 + 1] > 8) {
        posArray[i3] = (Math.random() - 0.5) * 20;
        posArray[i3 + 1] = 0;
        posArray[i3 + 2] = (Math.random() - 0.5) * 20;
      }
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ef4444"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Animated urban buildings growing
function UrbanBuildings() {
  const groupRef = useRef<THREE.Group>(null);
  const buildingCount = 15;
  
  const buildings = useMemo(() => {
    return Array.from({ length: buildingCount }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 15,
        0,
        (Math.random() - 0.5) * 15
      ] as [number, number, number],
      height: Math.random() * 3 + 1,
      delay: i * 0.3,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    groupRef.current.children.forEach((child, i) => {
      const targetHeight = buildings[i].height;
      const delay = buildings[i].delay;
      const growth = Math.min(1, Math.max(0, (time - delay) / 2));
      child.scale.y = growth * targetHeight;
      child.position.y = (growth * targetHeight) / 2;
    });
  });

  return (
    <group ref={groupRef}>
      {buildings.map((building, i) => (
        <mesh key={i} position={building.position} castShadow>
          <boxGeometry args={[0.8, 1, 0.8]} />
          <meshStandardMaterial color="#9333ea" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// Simulates a terrain changing over time with enhanced animations
function AnimatedTerrain() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const gridSize = 20;
  const count = gridSize * gridSize;
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Store initial random states for each cell
  const cellData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      type: Math.random(),
      transitionTime: Math.random() * 10,
      originalHeight: Math.random() * 0.5 + 0.3,
    }));
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    let i = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const data = cellData[i];
        
        // Dynamic color transition based on time
        const transitionProgress = (Math.sin(time * 0.5 + data.transitionTime) + 1) / 2;
        const color = new THREE.Color();
        
        if (data.type > 0.85) {
          // Urban (purple)
          color.lerp(new THREE.Color('#9333ea'), transitionProgress);
        } else if (data.type > 0.7) {
          // Deforestation (red)
          color.lerp(new THREE.Color('#ef4444'), transitionProgress);
        } else {
          // Vegetation (green) transitioning
          color.setHSL(142/360, 0.71, 0.45 - transitionProgress * 0.2);
        }
        
        // Wave animation with terrain influence
        const waveHeight = Math.sin(x * 0.3 + time * 0.8) * Math.cos(z * 0.3 + time * 0.8) * 0.3;
        const height = data.originalHeight + waveHeight * (1 - transitionProgress * 0.5);
        
        dummy.position.set(
          x - gridSize / 2 + 0.5,
          height / 2,
          z - gridSize / 2 + 0.5
        );
        dummy.scale.set(0.9, height, 0.9);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        meshRef.current.setColorAt(i, color);
        i++;
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial metalness={0.2} roughness={0.8} />
    </instancedMesh>
  );
}

export function ThreeDTerrain() {
  const [showParticles, setShowParticles] = useState(true);
  const [showBuildings, setShowBuildings] = useState(true);
  
  return (
    <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 text-white pointer-events-none">
        <h3 className="font-semibold tracking-wide">Land Change Simulation</h3>
        <p className="text-xs text-slate-400">Real-time Terrain Transition Model</p>
      </div>
      
      {/* Interactive Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setShowParticles(!showParticles)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            showParticles 
              ? 'bg-red-500/90 text-white shadow-lg' 
              : 'bg-slate-700/70 text-slate-300 hover:bg-slate-600/70'
          }`}
          style={{ pointerEvents: 'auto' }}
        >
          Deforestation
        </button>
        <button
          onClick={() => setShowBuildings(!showBuildings)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            showBuildings 
              ? 'bg-purple-500/90 text-white shadow-lg' 
              : 'bg-slate-700/70 text-slate-300 hover:bg-slate-600/70'
          }`}
          style={{ pointerEvents: 'auto' }}
        >
          Urban Growth
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-slate-300">Vegetation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-slate-300">Deforestation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500"></div>
            <span className="text-slate-300">Urban Areas</span>
          </div>
        </div>
      </div>

      <Canvas 
        camera={{ position: [20, 12, 20], fov: 45 }}
        shadows
      >
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 15, 5]} 
          intensity={1.2} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#60a5fa" />
        
        {/* Animated Terrain */}
        <AnimatedTerrain />
        
        {/* Conditional Effects */}
        {showParticles && <DeforestationParticles />}
        {showBuildings && <UrbanBuildings />}
        
        {/* Floating Labels */}
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
          <Text
            position={[0, 8, 0]}
            fontSize={0.8}
            color="#10b981"
            anchorX="center"
            anchorY="middle"
          >
            LIVE ANALYSIS
          </Text>
        </Float>
        
        <Grid 
          infiniteGrid 
          fadeDistance={40} 
          sectionColor="#334155" 
          cellColor="#1e293b"
          sectionSize={5}
          cellSize={1}
        />
        <OrbitControls 
          enableZoom={true}
          autoRotate 
          autoRotateSpeed={0.8}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={10}
          maxDistance={40}
        />
      </Canvas>
    </div>
  );
}
