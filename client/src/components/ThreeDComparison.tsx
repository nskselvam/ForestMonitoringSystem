import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Side-by-side terrain comparison
function ComparisonTerrain({ position, isAfter }: { position: [number, number, number], isAfter: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const gridSize = 12;
  const count = gridSize * gridSize;
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const cellData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      type: Math.random(),
      height: Math.random() * 0.5 + 0.3,
    }));
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    let i = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const data = cellData[i];
        const color = new THREE.Color();
        
        if (isAfter) {
          // After: More deforestation and urban
          if (data.type > 0.7) {
            color.set('#9333ea'); // Urban (purple)
          } else if (data.type > 0.5) {
            color.set('#ef4444'); // Deforestation (red)
          } else {
            color.setHSL(142/360, 0.71, 0.35); // Darker green (less vegetation)
          }
        } else {
          // Before: Mostly vegetation
          if (data.type > 0.9) {
            color.set('#9333ea'); // Some urban
          } else if (data.type > 0.85) {
            color.set('#ef4444'); // Minimal deforestation
          } else {
            color.setHSL(142/360, 0.71, 0.45); // Healthy vegetation
          }
        }
        
        const pulse = Math.sin(time + i * 0.1) * 0.05 + 1;
        const height = data.height * pulse;
        
        dummy.position.set(
          x - gridSize / 2 + 0.5 + position[0],
          height / 2 + position[1],
          z - gridSize / 2 + 0.5 + position[2]
        );
        dummy.scale.set(0.8, height, 0.8);
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
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.2} roughness={0.7} />
      </instancedMesh>
      
      {/* Label */}
      <Text
        position={[position[0], -0.5, position[2] - 7]}
        fontSize={0.6}
        color={isAfter ? '#ef4444' : '#10b981'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {isAfter ? 'AFTER' : 'BEFORE'}
      </Text>
      
      {/* Year label */}
      <Text
        position={[position[0], -1.2, position[2] - 7]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {isAfter ? '2026' : '2022'}
      </Text>
    </group>
  );
}

// Arrow indicating change direction
function TransitionArrow() {
  const arrowRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!arrowRef.current) return;
    const time = state.clock.getElapsedTime();
    const pulse = Math.sin(time * 2) * 0.3;
    arrowRef.current.position.x = pulse;
  });

  return (
    <group ref={arrowRef} position={[0, 2, -3]}>
      {/* Arrow shaft */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Arrow head */}
      <mesh position={[1.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.3, 0.6, 16]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Change label */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.35}
        color="#f59e0b"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        CHANGE
      </Text>
    </group>
  );
}

// Floating change indicators
function ChangeIndicators() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = time * 0.3;
    groupRef.current.position.y = Math.sin(time) * 0.5 + 3;
  });

  return (
    <group ref={groupRef}>
      <Text
        position={[0, 0, 0]}
        fontSize={0.5}
        color="#ef4444"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        -12.4% Vegetation
      </Text>
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.4}
        color="#9333ea"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        +5.1% Urban
      </Text>
    </group>
  );
}

interface ThreeDComparisonProps {
  vegetationLoss: number;
  urbanExpansion: number;
  startYear: number;
  endYear: number;
}

export function ThreeDComparison({ 
  vegetationLoss, 
  urbanExpansion,
  startYear,
  endYear
}: ThreeDComparisonProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 text-white pointer-events-none">
        <h3 className="font-semibold tracking-wide">3D Temporal Comparison</h3>
        <p className="text-xs text-slate-400">Side-by-Side Change Analysis</p>
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Vegetation Loss:</span>
            <span className="text-red-400 font-bold font-mono">{vegetationLoss}%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Urban Expansion:</span>
            <span className="text-purple-400 font-bold font-mono">{urbanExpansion}%</span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-700">
            <span className="text-slate-300 font-medium">Period:</span>
            <span className="text-blue-400 font-mono">{startYear} → {endYear}</span>
          </div>
        </div>
      </div>

      <Canvas camera={{ position: [0, 8, 15], fov: 50 }} shadows>
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <directionalLight position={[-10, 10, -5]} intensity={0.5} />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#60a5fa" />
        
        {/* Before terrain */}
        <ComparisonTerrain position={[-8, 0, 0]} isAfter={false} />
        
        {/* After terrain */}
        <ComparisonTerrain position={[8, 0, 0]} isAfter={true} />
        
        {/* Transition arrow */}
        <TransitionArrow />
        
        {/* Change indicators */}
        <ChangeIndicators />
        
        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
          <planeGeometry args={[30, 20]} />
          <meshStandardMaterial color="#0f172a" opacity={0.8} transparent />
        </mesh>
        
        {/* Grid lines */}
        <gridHelper args={[30, 20, '#334155', '#1e293b']} position={[0, -0.15, 0]} />
        
        <OrbitControls
          enableZoom={true}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={10}
          maxDistance={30}
        />
      </Canvas>
    </div>
  );
}
