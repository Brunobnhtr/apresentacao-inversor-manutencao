import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import * as THREE from 'three'
import { SLIDES } from '../data/slides'
import { MACHINE_BY_SCENE } from './machines'
import {
  N, HALF_W, FLOOR_OFF, CEIL_OFF, TRAVEL_MS,
  curve, frameAt, tOf, buildCorridor, ceilingLights,
} from './path'

const BG = '#05070e'
const UP = new THREE.Vector3(0, 1, 0)
const ZAX = new THREE.Vector3(0, 0, 1)

function easeInOut(p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2 }

// ---- Câmera caminhando pela curva (lento) ----
function Rig({ index }) {
  const { camera } = useThree()
  const s = useRef(index), from = useRef(index), to = useRef(index), t0 = useRef(performance.now())
  useEffect(() => { from.current = s.current; to.current = index; t0.current = performance.now() }, [index])
  useFrame((state) => {
    const p = Math.min(1, (performance.now() - t0.current) / TRAVEL_MS)
    s.current = from.current + (to.current - from.current) * easeInOut(p)
    const t = THREE.MathUtils.clamp(s.current / (N - 1), 0, 1)
    const { p: pos, tan, right } = frameAt(t)
    const tt = state.clock.elapsedTime
    camera.position.set(pos.x, pos.y + Math.sin(tt * 1.7) * 0.06, pos.z)
    const look = pos.clone().addScaledVector(tan, 6).addScaledVector(right, 0.7)
    camera.lookAt(look.x, look.y - 0.12, look.z)
  })
  return null
}

function ColorRig({ index, lightRef }) {
  const { scene } = useThree()
  useFrame(() => {
    const c = new THREE.Color(SLIDES[index]?.accent || '#00d4ff')
    if (lightRef.current) lightRef.current.color.lerp(c, 0.06)
    if (scene.fog) scene.fog.color.lerp(new THREE.Color(BG), 0.05)
  })
  return null
}

function FollowLights() {
  const a = useRef(), b = useRef()
  const { camera } = useThree()
  useFrame(() => {
    const d = new THREE.Vector3()
    camera.getWorldDirection(d)
    if (a.current) a.current.position.copy(camera.position).addScaledVector(d, 3).setY(camera.position.y + 1.2)
    if (b.current) b.current.position.copy(camera.position).addScaledVector(d, 14)
  })
  return (<>
    <pointLight ref={a} intensity={16} distance={20} color="#cfe3ff" />
    <pointLight ref={b} intensity={12} distance={24} color="#9fc0ff" />
  </>)
}

// ---- Porta entre setores (moldura que a câmera atravessa) ----
function Door({ pos, quat, accent }) {
  const H = CEIL_OFF - FLOOR_OFF
  return (
    <group position={pos} quaternion={quat}>
      {[-1, 1].map(s => (
        <mesh key={s} position={[s * (HALF_W - 0.25), (FLOOR_OFF + CEIL_OFF) / 2, 0]}>
          <boxGeometry args={[0.4, H, 0.4]} /><meshStandardMaterial color="#1a2233" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, CEIL_OFF - 0.25, 0]}>
        <boxGeometry args={[2 * HALF_W, 0.5, 0.45]} /><meshStandardMaterial color="#1a2233" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, CEIL_OFF - 0.52, 0.18]}>
        <boxGeometry args={[2 * HALF_W - 0.8, 0.09, 0.05]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
    </group>
  )
}

// ---- Estrutura do corredor (gerada uma vez) ----
function Corridor() {
  const g = useMemo(() => buildCorridor(), [])
  return (
    <group>
      <mesh geometry={g.floor}><meshStandardMaterial color="#0a0e16" metalness={0.5} roughness={0.75} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={g.ceil}><meshStandardMaterial color="#0c1018" metalness={0.4} roughness={0.7} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={g.left}><meshStandardMaterial color="#121726" metalness={0.5} roughness={0.6} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={g.right}><meshStandardMaterial color="#121726" metalness={0.5} roughness={0.6} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={g.stripe}><meshStandardMaterial color="#1c8fff" emissive="#1c8fff" emissiveIntensity={0.7} toneMapped={false} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={g.base}><meshStandardMaterial color="#1c8fff" emissive="#1c8fff" emissiveIntensity={1} toneMapped={false} side={THREE.DoubleSide} /></mesh>
    </group>
  )
}

function CeilingLights() {
  const lights = useMemo(() => ceilingLights(), [])
  return lights.map((l, i) => (
    <mesh key={i} position={l.pos} quaternion={l.quat}>
      <boxGeometry args={[2.4, 0.1, 0.5]} />
      <meshStandardMaterial color="#ffffff" emissive="#dbeaff" emissiveIntensity={3} toneMapped={false} />
    </mesh>
  ))
}

function World({ index }) {
  const lightRef = useRef()

  // layout fixo (portas + máquinas por estação)
  const layout = useMemo(() => SLIDES.map((sl, i) => {
    const { p, tan, right } = frameAt(tOf(i))
    const doorPos = p.clone().addScaledVector(tan, -2)
    const dq = new THREE.Quaternion().setFromUnitVectors(ZAX, tan)
    const mPos = p.clone().addScaledVector(tan, 2.5).addScaledVector(right, HALF_W - 2).addScaledVector(UP, FLOOR_OFF + 1.3)
    const mq = new THREE.Quaternion().setFromUnitVectors(ZAX, tan.clone().multiplyScalar(-1))
    return { doorPos: doorPos.toArray(), doorQuat: dq.toArray(), mPos: mPos.toArray(), mQuat: mq.toArray(), accent: sl.accent, scene: sl.scene }
  }), [])

  const win = []
  for (let i = Math.max(0, index - 1); i <= Math.min(N - 1, index + 2); i++) win.push(i)

  return (
    <>
      <fog attach="fog" args={[BG, 6, 42]} />
      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#243a58', '#05070e', 0.5]} />
      <pointLight ref={lightRef} intensity={6} distance={22} color="#00d4ff" position={[0, 1, 0]} />

      <Rig index={index} />
      <ColorRig index={index} lightRef={lightRef} />
      <FollowLights />

      <Corridor />
      <CeilingLights />

      {win.map(i => {
        const L = layout[i]
        const Machine = MACHINE_BY_SCENE[L.scene]
        return (
          <group key={i}>
            <Door pos={L.doorPos} quat={L.doorQuat} accent={L.accent} />
            {Machine && (
              <group position={L.mPos} quaternion={L.mQuat} scale={1.15}>
                <Machine accent={L.accent} />
                <pointLight position={[0, 1.8, 2.5]} intensity={14} distance={12} color={L.accent} />
              </group>
            )}
          </group>
        )
      })}

      <FollowDust />
    </>
  )
}

function FollowDust() {
  const ref = useRef()
  const { camera } = useThree()
  useFrame(() => { if (ref.current) ref.current.position.copy(camera.position) })
  return <group ref={ref}><Sparkles count={50} scale={[16, 8, 30]} size={2.2} speed={0.25} color="#bcd6ff" opacity={0.4} noise={1} /></group>
}

export default function Scene3D({ index = 0 }) {
  return (
    <Canvas
      className="absolute inset-0"
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 0], fov: 70, near: 0.1, far: 220 }}
      style={{ pointerEvents: 'none' }}
    >
      <color attach="background" args={[BG]} />
      <World index={index} />
      <EffectComposer disableNormalPass>
        <Bloom intensity={0.7} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.85} />
        <Noise opacity={0.04} premultiply />
      </EffectComposer>
    </Canvas>
  )
}
