"use client";
import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Text } from "@react-three/drei";
import { formatNumber } from "@/lib/utils";

interface DelegateUniverse3DProps {
  delegates: any[];
}

function DelegateSphere({ data, position, color }: { data: any, position: [number, number, number], color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  // Gentle rotation animation for the spheres
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      // Slight floating effect based on sine wave
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.2;
    }
  });

  // Calculate size based on voting power (normalized)
  const size = Math.max(1, Math.min(5, Math.log10(data.votingPower || 1) * 0.5));

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHover(false);
        }}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      {/* Name and Power Label on Hover */}
      {hovered && (
        <group position={[0, size + 1.5, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.8}
            color="white"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            {data.name}
          </Text>
          <Text
            position={[0, -0.8, 0]}
            fontSize={0.6}
            color="#a0aec0"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            {formatNumber(data.votingPower.toString() as any, 0, 0, false, true)}
          </Text>
        </group>
      )}
    </group>
  );
}

// Main Scene Component to access useThree hook
function UniverseScene({ chartData }: { chartData: any[] }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4fd1c5" />
      
      {/* Background stars */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Render delegates as spheres in a spiral galaxy formation */}
      {chartData.map((d, i) => {
        // Spiral formation math calculation
        const angle = i * 0.8;
        const radius = 5 + i * 1.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        // Introduce some random vertical jitter
        const y = (Math.random() - 0.5) * (radius * 0.5);
        
        // Color gradient from center out
        const color = `hsl(${220 - i * 5}, 80%, 60%)`;

        return (
          <DelegateSphere 
            key={d.rawAddress || i} 
            data={d} 
            position={[x, y, z]} 
            color={color}
          />
        );
      })}

      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={0.5}
        maxDistance={100}
        minDistance={5}
      />
    </>
  );
}

export default function DelegateUniverse3D({ delegates }: DelegateUniverse3DProps) {
  const chartData = useMemo(() => {
    if (!delegates || !Array.isArray(delegates) || delegates.length === 0) return [];
    
    // ... copy same parsePower logic to keep consistency ...
    const parsePower = (d: any) => {
      if (d?.votingPower && typeof d.votingPower === 'object' && d.votingPower.total) {
        return Number(d.votingPower.total);
      }
      if (d?.votingPower && typeof d.votingPower === 'string') {
        return Number(d.votingPower);
      }
      if (d?.voting_power) {
        return Number(d.voting_power);
      }
      return 0;
    };

    const sorted = [...delegates].sort((a, b) => parsePower(b) - parsePower(a));
    
    // Take the top 50 strictly for the 3D universe so it's not too crowded but looks like a galaxy
    const topDelegates = sorted.slice(0, 50).map((d) => ({
      name: d.account?.ensName || d.address?.substring(0, 6) + "..." + d.address?.substring(d.address.length - 4),
      votingPower: parsePower(d),
      rawAddress: d.address,
    }));

    return topDelegates.filter(d => d.votingPower > 0);
  }, [delegates]);

  if (chartData.length === 0) return null;

  return (
    <div className="w-full bg-[#0m0b14] border border-tertiary/10 rounded-xl p-6 mb-8 mt-4 shadow-sm overflow-hidden relative">
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-xl font-bold text-white drop-shadow-md">Governance Galaxy 🌌</h2>
        <p className="text-gray-300 text-sm drop-shadow-md">Top 50 Delegates - Drag to rotate, scroll to zoom</p>
      </div>
      
      {/* 3D Canvas Context */}
      <div className="h-[500px] w-full bg-gradient-to-b from-[#0f172a] to-[#020617] rounded-lg">
        <Canvas camera={{ position: [0, 20, 35], fov: 45 }}>
          <UniverseScene chartData={chartData} />
        </Canvas>
      </div>
    </div>
  );
}
