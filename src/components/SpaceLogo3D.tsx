
import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center, Float } from '@react-three/drei';
import * as THREE from 'three';

const SpaceText = ({ text = '$SPACE', size = 1 }: { text?: string; size?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Enhanced rotation animation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  const materialProps = useMemo(() => ({
    color: '#ffffff', // Bright white color
    emissive: '#ffffff', // White emissive for enhanced brightness
    emissiveIntensity: 0.6, // Increased intensity for brighter appearance
    metalness: 0.3, // Reduced metalness for better visibility
    roughness: 0.2, // Reduced roughness for more shine
    transparent: true,
    opacity: 1.0, // Full opacity for maximum visibility
  }), []);

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <Center>
        <Text3D
          ref={meshRef}
          font="/fonts/helvetiker_bold.typeface.json"
          size={size}
          height={0.3}
          curveSegments={16}
          bevelEnabled
          bevelThickness={0.03}
          bevelSize={0.03}
          bevelOffset={0}
          bevelSegments={8}
        >
          {text}
          <meshStandardMaterial {...materialProps} />
        </Text3D>
      </Center>
    </Float>
  );
};

const EnhancedSpaceParticles = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const glowPointsRef = useRef<THREE.Points>(null);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(800 * 3); // Reduced from 2000 to 800
    for (let i = 0; i < 800; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return positions;
  }, []);

  const glowParticlesPosition = useMemo(() => {
    const positions = new Float32Array(200 * 3); // Reduced from 500 to 200
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.03;
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
    if (glowPointsRef.current) {
      glowPointsRef.current.rotation.x = -state.clock.elapsedTime * 0.02;
      glowPointsRef.current.rotation.y = state.clock.elapsedTime * 0.04;
    }
  });

  return (
    <group>
      {/* Main particle field - bright white stars */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlesPosition.length / 3}
            array={particlesPosition}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#ffffff"
          sizeAttenuation={true}
          transparent={true}
          opacity={1.0}
        />
      </points>
      
      {/* Glowing accent particles - bright white */}
      <points ref={glowPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={glowParticlesPosition.length / 3}
            array={glowParticlesPosition}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#ffffff"
          sizeAttenuation={true}
          transparent={true}
          opacity={0.8}
        />
      </points>
    </group>
  );
};

const Scene = ({ text = '$SPACE', size = 1 }: { text?: string; size?: number }) => {
  return (
    <>
      <EnhancedSpaceParticles />
      <SpaceText text={text} size={size} />
      
      {/* Enhanced lighting setup for bright white appearance */}
      <ambientLight intensity={0.5} color="#ffffff" />
      <pointLight position={[5, 5, 5]} color="#ffffff" intensity={1.2} />
      <pointLight position={[-5, -5, 5]} color="#ffffff" intensity={1.0} />
      <pointLight position={[0, 0, 8]} color="#ffffff" intensity={0.8} />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.8}
        color="#ffffff"
        castShadow
      />
    </>
  );
};

interface SpaceLogo3DProps {
  text?: string;
  size?: number;
}

const SpaceLogo3D: React.FC<SpaceLogo3DProps> = ({ 
  text = '$SPACE', 
  size = 1
}) => {
  return (
    <div className="w-full h-48">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Suspense fallback={null}>
          <Scene text={text} size={size} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SpaceLogo3D;
