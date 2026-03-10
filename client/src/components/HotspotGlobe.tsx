import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface Hotspot {
  id: number;
  position: [number, number, number];
  intensity: number;
  type: 'deforestation' | 'urban';
}

// Individual hotspot marker with pulsing animation
function HotspotMarker({ position, intensity, type }: Omit<Hotspot, 'id'>) {
  const markerRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!markerRef.current || !ringsRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Pulse animation
    const pulse = Math.sin(time * 3) * 0.2 + 1;
    markerRef.current.scale.setScalar(pulse * intensity);
    
    // Expanding rings
    ringsRef.current.children.forEach((ring, i) => {
      const scale = ((time * 2 + i) % 3) / 3;
      ring.scale.setScalar(1 + scale * 2);
      const material = (ring as THREE.Mesh).material as THREE.MeshBasicMaterial;
      if (material) {
        material.opacity = 1 - scale;
      }
    });
  });

  const color = type === 'deforestation' ? '#ef4444' : '#a855f7';

  return (
    <group position={position}>
      {/* Main marker */}
      <mesh ref={markerRef}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Expanding rings */}
      <group ref={ringsRef}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.15, 0.2, 32]} />
            <meshBasicMaterial
              color={color}
              transparent
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
      
      {/* Light */}
      <pointLight color={color} intensity={intensity * 2} distance={3} />
    </group>
  );
}

// Animated sphere representing Earth/Region
function AnimatedGlobe() {
  const globeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!globeRef.current) return;
    globeRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
  });

  return (
    <mesh ref={globeRef}>
      <Sphere args={[3, 64, 64]}>
        <MeshDistortMaterial
          color="#1e40af"
          attach="material"
          distort={0.3}
          speed={1.5}
          roughness={0.4}
          metalness={0.1}
          opacity={0.6}
          transparent
        />
      </Sphere>
      
      {/* Inner glow */}
      <Sphere args={[2.9, 32, 32]}>
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
    </mesh>
  );
}

// Orbiting data satellites/sensors
function OrbitingSensors() {
  const groupRef = useRef<THREE.Group>(null);
  const sensorCount = 3;

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: sensorCount }).map((_, i) => {
        const angle = (i / sensorCount) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 5,
              Math.sin(angle * 2) * 2,
              Math.sin(angle) * 5
            ]}
          >
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial
              color="#60a5fa"
              emissive="#60a5fa"
              emissiveIntensity={0.5}
              metalness={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Atmosphere effect
function Atmosphere() {
  return (
    <Sphere args={[3.5, 64, 64]}>
      <meshBasicMaterial
        color="#3b82f6"
        transparent
        opacity={0.1}
        side={THREE.BackSide}
      />
    </Sphere>
  );
}

interface HotspotGlobeProps {
  hotspots?: Array<{
    id: string | number;
    area: string;
    location: [number, number];
    pixels: string | number;
  }>;
}

export function HotspotGlobe({ hotspots = [] }: HotspotGlobeProps) {
  // Convert lat/lng to 3D sphere coordinates
  const hotspot3D: Hotspot[] = useMemo(() => {
    return hotspots.map((spot, i) => {
      const radius = 3.2;
      // Convert to radians and create 3D position
      const phi = (90 - spot.location[0]) * (Math.PI / 180);
      const theta = (spot.location[1] + 180) * (Math.PI / 180);
      
      return {
        id: typeof spot.id === 'string' ? parseInt(spot.id) : spot.id,
        position: [
          -(radius * Math.sin(phi) * Math.cos(theta)),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        ] as [number, number, number],
        intensity: 1 + (i * 0.2),
        type: (i % 2 === 0 ? 'deforestation' : 'urban') as 'deforestation' | 'urban'
      };
    });
  }, [hotspots]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 rounded-xl overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 text-white pointer-events-none">
        <h3 className="font-semibold tracking-wide">Global Hotspot Monitor</h3>
        <p className="text-xs text-slate-400">Real-time Threat Detection</p>
      </div>

      <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-red-400 font-medium">Deforestation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
          <span className="text-purple-400 font-medium">Urban Expansion</span>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        <AnimatedGlobe />
        <Atmosphere />
        <OrbitingSensors />
        
        {hotspot3D.map((hotspot) => (
          <HotspotMarker
            key={hotspot.id}
            position={hotspot.position}
            intensity={hotspot.intensity}
            type={hotspot.type}
          />
        ))}
        
        <OrbitControls
          enableZoom={true}
          autoRotate
          autoRotateSpeed={0.5}
          minDistance={6}
          maxDistance={15}
        />
        
        {/* Stars background */}
        <Stars />
      </Canvas>
    </div>
  );
}

// Background stars
function Stars() {
  const starsRef = useRef<THREE.Points>(null);
  const starCount = 1000;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 50;
      pos[i * 3] = (Math.random() - 0.5) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * radius;
      pos[i * 3 + 2] = (Math.random() - 0.5) * radius;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!starsRef.current) return;
    starsRef.current.rotation.y = state.clock.getElapsedTime() * 0.01;
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={starCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}
