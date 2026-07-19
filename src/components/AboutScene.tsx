"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Float, OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function FloatingBalls() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
      groupRef.current.rotation.x = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[1, 32, 32]} position={[-1.5, 1, 0]}>
          <meshStandardMaterial color="#0ea5e9" roughness={0.1} metalness={0.5} />
        </Sphere>
      </Float>
      <Float speed={3} rotationIntensity={2} floatIntensity={1}>
        <Sphere args={[0.6, 32, 32]} position={[1.5, -1, 1]}>
          <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.8} />
        </Sphere>
      </Float>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={3}>
        <Sphere args={[1.2, 32, 32]} position={[0, 0, -1.5]}>
          <meshStandardMaterial color="#171717" roughness={0.4} metalness={0.2} wireframe />
        </Sphere>
      </Float>
    </group>
  );
}

export function AboutScene() {
  return (
    <div className="w-full h-full min-h-[400px] relative bg-card rounded-2xl border border-foreground/10 overflow-hidden shadow-sm">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-5, -5, -5]} intensity={1} color="#0ea5e9" />
        <FloatingBalls />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
