import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles, Grid } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import * as THREE from 'three'
import { SLIDES } from '../data/slides'

const SPACING = 13
const BG = '#04040c'

// ---- Câmera voando pra frente até o setor atual ----
function Rig({ index }) {
  const { camera } = useThree()
  useFrame((state, dt) => {
    const k = Math.min(1, dt * 2.4)
    const targetZ = 6 - index * SPACING
    camera.position.z += (targetZ - camera.position.z) * k
    const t = state.clock.elapsedTime
    camera.position.x += (Math.sin(t * 0.3) * 0.7 - camera.position.x) * 0.03
    camera.position.y += (Math.cos(t * 0.22) * 0.4 - camera.position.y) * 0.03
    camera.lookAt(0, 0, camera.position.z - 10)
  })
  return null
}

// ---- Cor ambiente (névoa + luz) transita entre setores ----
function ColorRig({ index, lightRef }) {
  const { scene } = useThree()
  const target = useMemo(() => new THREE.Color(SLIDES[index]?.accent || '#00d4ff'), [index])
  useFrame(() => {
    if (lightRef.current) lightRef.current.color.lerp(target, 0.05)
    if (scene.fog) scene.fog.color.lerp(new THREE.Color(BG), 0.05)
  })
  return null
}

// ---- Formas orbitando cada gate (dão tecnologia/detalhe) ----
function Orbiters({ color }) {
  const ref = useRef()
  useFrame((s, dt) => { if (ref.current) ref.current.rotation.z -= dt * 0.4 })
  const items = useMemo(() => [0, 1, 2, 3].map(i => {
    const a = (i / 4) * Math.PI * 2
    return { x: Math.cos(a) * 5.2, y: Math.sin(a) * 5.2, s: 0.18 + (i % 2) * 0.12 }
  }), [])
  return (
    <group ref={ref}>
      {items.map((it, i) => (
        <mesh key={i} position={[it.x, it.y, 0]}>
          <icosahedronGeometry args={[it.s, 0]} />
          <meshBasicMaterial color={color} toneMapped={false} wireframe />
        </mesh>
      ))}
    </group>
  )
}

// ---- "Portal" de cada setor (a câmera atravessa) ----
function Gate({ z, color, active }) {
  const ref = useRef()
  useFrame((s, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.12 })
  return (
    <group position={[0, 0, z]}>
      <mesh ref={ref}>
        <torusGeometry args={[4.3, 0.055, 18, 90]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh>
        <torusGeometry args={[3.1, 0.03, 12, 70]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.45} />
      </mesh>
      <mesh>
        <torusGeometry args={[5.6, 0.02, 12, 90]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.2} />
      </mesh>
      <Orbiters color={color} />
    </group>
  )
}

// ---- Poeira/feixes que acompanham a câmera (campo infinito) ----
function FollowField() {
  const ref = useRef()
  const { camera } = useThree()
  useFrame(() => { if (ref.current) ref.current.position.z = camera.position.z - 18 })
  return (
    <group ref={ref}>
      <Sparkles count={150} scale={[28, 16, 56]} size={3.2} speed={0.35} color="#bfe9ff" opacity={0.5} noise={1.4} />
      {/* feixes de luz volumétrica */}
      {[-7, 7].map((x, i) => (
        <mesh key={i} position={[x, 3, 0]} rotation={[0, 0, x > 0 ? -0.3 : 0.3]}>
          <planeGeometry args={[1.4, 40]} />
          <meshBasicMaterial color="#1b3b6f" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

// ---- Conteúdo 3D da cena ----
function World({ index }) {
  const lightRef = useRef()
  // só renderiza gates próximos do índice atual (performance)
  const gates = []
  for (let i = Math.max(0, index - 1); i <= Math.min(SLIDES.length - 1, index + 3); i++) {
    gates.push(<Gate key={i} z={-i * SPACING} color={SLIDES[i].accent} active={i === index} />)
  }
  return (
    <>
      <fog attach="fog" args={[BG, 6, SPACING * 2.4]} />
      <ambientLight intensity={0.4} />
      <pointLight ref={lightRef} position={[0, 0, 6]} intensity={40} distance={40} color="#00d4ff" />

      <Rig index={index} />
      <ColorRig index={index} lightRef={lightRef} />

      {gates}
      <FollowField />

      {/* piso em grade infinita */}
      <Grid
        position={[0, -4, 0]}
        args={[60, 200]}
        cellSize={2}
        cellThickness={0.6}
        cellColor="#0a2a4a"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#0e3b66"
        fadeDistance={45}
        fadeStrength={3}
        infiniteGrid
      />
    </>
  )
}

export default function Scene3D({ index = 0 }) {
  return (
    <Canvas
      className="absolute inset-0"
      dpr={[1, 1.7]}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      camera={{ position: [0, 0, 6], fov: 64, near: 0.1, far: 140 }}
      style={{ pointerEvents: 'none' }}
    >
      <color attach="background" args={[BG]} />
      <World index={index} />
      <EffectComposer disableNormalPass>
        <Bloom intensity={0.85} luminanceThreshold={0.12} luminanceSmoothing={0.35} mipmapBlur />
        <Vignette eskil={false} offset={0.22} darkness={0.9} />
        <Noise opacity={0.05} premultiply />
      </EffectComposer>
    </Canvas>
  )
}
