import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import * as THREE from 'three'
import { SLIDES } from '../data/slides'
import { MACHINE_BY_SCENE } from './machines'

const PI = Math.PI
const HALF_W = 5          // meia-largura do corredor
const FLOOR_Y = -2.6
const CEIL_Y = 3.2
const SPACING = 18        // distância entre departamentos
const BG = '#05070e'
const N = SLIDES.length

const METAL = { color: '#1a2030', metalness: 0.7, roughness: 0.45 }

// ---- Câmera caminhando pelo corredor ----
function Rig({ index }) {
  const { camera } = useThree()
  const look = useRef(new THREE.Vector3(0, 0, -12))
  useFrame((state, dt) => {
    const k = Math.min(1, dt * 2.2)
    const stationZ = -index * SPACING
    const targetZ = stationZ + 7
    camera.position.z += (targetZ - camera.position.z) * k
    // head-bob suave (passos) + leve deslocamento para a esquerda (texto à esq., máquina à dir.)
    const t = state.clock.elapsedTime
    camera.position.y += ((Math.sin(t * 1.6) * 0.05) - camera.position.y) * 0.06
    camera.position.x += ((Math.sin(t * 0.8) * 0.12 - 0.8) - camera.position.x) * 0.04
    // olhar pra frente, levemente para o departamento ativo (sempre à direita)
    look.current.x += (1.4 - look.current.x) * 0.04
    look.current.z = camera.position.z - 12
    camera.lookAt(look.current.x, -0.2, look.current.z)
  })
  return null
}

function ColorRig({ index, lightRef }) {
  const { scene } = useThree()
  useFrame(() => {
    const c = new THREE.Color(SLIDES[index]?.accent || '#00d4ff')
    if (lightRef.current) lightRef.current.color.lerp(c, 0.05)
    if (scene.fog) scene.fog.color.lerp(new THREE.Color(BG), 0.05)
  })
  return null
}

// luzes que acompanham a câmera (iluminam o corredor por perto)
function FollowLights() {
  const a = useRef(), b = useRef()
  const { camera } = useThree()
  useFrame(() => {
    if (a.current) a.current.position.set(camera.position.x, 1.5, camera.position.z - 2)
    if (b.current) b.current.position.set(camera.position.x, 1.5, camera.position.z - 14)
  })
  return (<>
    <pointLight ref={a} intensity={14} distance={18} color="#cfe3ff" />
    <pointLight ref={b} intensity={10} distance={20} color="#9fc0ff" />
  </>)
}

function Emissive({ color, intensity = 2 }) {
  return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} />
}

// ---- Um trecho do corredor + o departamento daquele setor ----
function Section({ i }) {
  const slide = SLIDES[i]
  const accent = slide.accent
  const side = 1 // máquina sempre à direita (texto fica à esquerda)
  const Machine = MACHINE_BY_SCENE[slide.scene]
  const z0 = -i * SPACING
  const H = CEIL_Y - FLOOR_Y

  return (
    <group position={[0, 0, z0]}>
      {/* piso */}
      <mesh rotation={[-PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]}>
        <planeGeometry args={[2 * HALF_W, SPACING]} />
        <meshStandardMaterial color="#0a0e16" metalness={0.5} roughness={0.7} />
      </mesh>
      {/* faixa central do piso (cor do setor) */}
      <mesh rotation={[-PI / 2, 0, 0]} position={[0, FLOOR_Y + 0.02, 0]}>
        <planeGeometry args={[0.35, SPACING]} />
        <Emissive color={accent} intensity={0.7} />
      </mesh>
      {/* teto */}
      <mesh rotation={[PI / 2, 0, 0]} position={[0, CEIL_Y, 0]}>
        <planeGeometry args={[2 * HALF_W, SPACING]} />
        <meshStandardMaterial color="#0c1018" metalness={0.4} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* luminárias do teto (passam por cima = sensação de andar) */}
      {[-6, 0, 6].map((zz, k) => (
        <mesh key={k} position={[0, CEIL_Y - 0.06, zz]}>
          <boxGeometry args={[2.6, 0.1, 0.5]} />
          <meshStandardMaterial color="#ffffff" emissive="#dbeaff" emissiveIntensity={3.2} toneMapped={false} />
        </mesh>
      ))}
      {/* paredes + faixa de luz na base */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * HALF_W, (FLOOR_Y + CEIL_Y) / 2, 0]} rotation={[0, -s * PI / 2, 0]}>
            <planeGeometry args={[SPACING, H]} />
            <meshStandardMaterial color="#121726" metalness={0.5} roughness={0.6} side={THREE.DoubleSide} />
          </mesh>
          {/* nervuras verticais */}
          {[-6, -2, 2, 6].map((zz, k) => (
            <mesh key={k} position={[s * (HALF_W - 0.05), 0, zz]} rotation={[0, -s * PI / 2, 0]}>
              <planeGeometry args={[0.25, H]} />
              <meshStandardMaterial color="#1c2436" metalness={0.6} roughness={0.5} side={THREE.DoubleSide} />
            </mesh>
          ))}
          {/* faixa accent na base */}
          <mesh position={[s * (HALF_W - 0.04), FLOOR_Y + 0.45, 0]} rotation={[0, -s * PI / 2, 0]}>
            <planeGeometry args={[SPACING, 0.1]} />
            <Emissive color={accent} intensity={1.1} />
          </mesh>
        </group>
      ))}
      {/* colunas/vigas a cada divisão */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (HALF_W - 0.2), 0, -SPACING / 2]}>
          <boxGeometry args={[0.45, H, 0.45]} />
          <meshStandardMaterial {...METAL} />
        </mesh>
      ))}

      {/* DEPARTAMENTO: máquina do setor na baia à direita */}
      {Machine && (
        <group position={[side * (HALF_W - 2.4), FLOOR_Y + 1.3, 0.5]} rotation={[0, -side * 0.5, 0]} scale={1.18}>
          <Machine accent={accent} />
          <pointLight position={[0, 1.8, 2.5]} intensity={14} distance={12} color={accent} />
        </group>
      )}
    </group>
  )
}

function World({ index }) {
  const lightRef = useRef()
  const sections = []
  for (let i = Math.max(0, index - 2); i <= Math.min(N - 1, index + 4); i++) {
    sections.push(<Section key={i} i={i} />)
  }
  return (
    <>
      <fog attach="fog" args={[BG, 8, SPACING * 2.6]} />
      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#22304a', '#05070e', 0.5]} />
      <pointLight ref={lightRef} position={[0, 1, 4]} intensity={6} distance={22} color="#00d4ff" />

      <Rig index={index} />
      <ColorRig index={index} lightRef={lightRef} />
      <FollowLights />

      {sections}

      {/* poeira no ar */}
      <group>
        <Sparkles count={60} scale={[2 * HALF_W, CEIL_Y - FLOOR_Y, SPACING * 3]} position={[0, 0, -index * SPACING]} size={2.2} speed={0.25} color="#bcd6ff" opacity={0.4} noise={1} />
      </group>
    </>
  )
}

export default function Scene3D({ index = 0 }) {
  return (
    <Canvas
      className="absolute inset-0"
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 8], fov: 68, near: 0.1, far: 200 }}
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
