import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

interface DataBar {
  label: string;
  value: number;
  color: string;
  position: [number, number, number];
}

function AnimatedDataBars({ data }: { data: DataBar[] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    groupRef.current.children.forEach((child, i) => {
      if (child.type === 'Mesh') {
        const targetHeight = data[Math.floor(i / 2)]?.value || 0;
        const growth = Math.min(1, time / 3);
        child.scale.y = growth * targetHeight;
        child.position.y = (growth * targetHeight) / 2;
        
        // Pulse effect
        const pulse = Math.sin(time * 2 + i) * 0.05 + 1;
        child.scale.x = pulse;
        child.scale.z = pulse;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((bar, i) => (
        <group key={i} position={bar.position}>
          {/* Bar */}
          <mesh castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial 
              color={bar.color} 
              metalness={0.3}
              roughness={0.4}
              emissive={bar.color}
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Label */}
          <Text
            position={[0, -0.3, 0]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="top"
          >
            {bar.label}
          </Text>
          
          {/* Value on top */}
          <Text
            position={[0, bar.value + 0.5, 0]}
            fontSize={0.4}
            color={bar.color}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            {bar.value.toFixed(1)}%
          </Text>
        </group>
      ))}
    </group>
  );
}

// Animated connecting lines between data points
function DataConnections({ data }: { data: DataBar[] }) {
  const lineRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!lineRef.current) return;
    const time = state.clock.getElapsedTime();
    lineRef.current.rotation.y = time * 0.1;
  });

  return (
    <group ref={lineRef}>
      {data.map((bar, i) => {
        if (i === 0) return null;
        const prevBar = data[i - 1];
        return (
          <Line
            key={i}
            points={[
              [prevBar.position[0], prevBar.value / 2, prevBar.position[2]],
              [bar.position[0], bar.value / 2, bar.position[2]]
            ]}
            color="#60a5fa"
            lineWidth={2}
            transparent
            opacity={0.5}
          />
        );
      })}
    </group>
  );
}

// Orbiting particles around data
function DataParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 100;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 8 + Math.random() * 2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
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
        size={0.1}
        color="#60a5fa"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

interface DataVisualization3DProps {
  vegetationLoss: number;
  urbanExpansion: number;
  waterToBarren: number;
  totalChange: number;
}

export function DataVisualization3D({ 
  vegetationLoss, 
  urbanExpansion, 
  waterToBarren, 
  totalChange 
}: DataVisualization3DProps) {
  const data: DataBar[] = [
    { label: 'Veg Loss', value: vegetationLoss, color: '#ef4444', position: [-4, 0, 0] },
    { label: 'Urban', value: urbanExpansion, color: '#a855f7', position: [-1.5, 0, 0] },
    { label: 'Water→Barren', value: waterToBarren, color: '#f59e0b', position: [1.5, 0, 0] },
    { label: 'Total', value: totalChange, color: '#3b82f6', position: [4, 0, 0] },
  ];

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 text-white pointer-events-none">
        <h3 className="font-semibold tracking-wide">3D Data Analysis</h3>
        <p className="text-xs text-slate-400">Interactive Statistical View</p>
      </div>

      <Canvas camera={{ position: [8, 6, 12], fov: 50 }} shadows>
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#a855f7" />
        <pointLight position={[10, 5, 10]} intensity={0.5} color="#ef4444" />
        
        <AnimatedDataBars data={data} />
        <DataConnections data={data} />
        <DataParticles />
        
        {/* Floor grid */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#1e293b" opacity={0.5} transparent />
        </mesh>
        
        <OrbitControls 
          enableZoom={true}
          autoRotate
          autoRotateSpeed={1}
          maxPolarAngle={Math.PI / 2}
          minDistance={8}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
}
