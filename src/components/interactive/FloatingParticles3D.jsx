import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function ParticlesCloud({ count = 56 }) {
  const groupRef = useRef(null)

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, index) => ({
      id: index,
      position: [
        (Math.random() - 0.5) * 6.2,
        (Math.random() - 0.5) * 3.3,
        (Math.random() - 0.5) * 3.8,
      ],
      scale: 0.02 + Math.random() * 0.05,
      speed: 0.18 + Math.random() * 0.24,
    }))
  }, [count])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    groupRef.current.rotation.y += delta * 0.07
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.16) * 0.05
  })

  return (
    <group ref={groupRef}>
      {particles.map((particle) => (
        <mesh key={particle.id} position={particle.position} scale={particle.scale * 8}>
          <sphereGeometry args={[particle.scale, 10, 10]} />
          <meshBasicMaterial
            color={new THREE.Color(`hsl(${190 + particle.id * 2.1}, 85%, 70%)`)}
            transparent
            opacity={0.72}
          />
        </mesh>
      ))}
    </group>
  )
}

export function FloatingParticles3D() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 4], fov: 46 }} dpr={[1, 1.4]}>
        <ambientLight intensity={0.8} />
        <pointLight position={[2, 2, 3]} intensity={2.1} color="#5eead4" />
        <pointLight position={[-3, -2, 2]} intensity={1.3} color="#818cf8" />
        <ParticlesCloud />
      </Canvas>
    </div>
  )
}
