import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Máquinas industriais montadas com primitivas (motor, bomba, ventilador, painel, esteira...).
// Cada uma fica numa baia lateral do corredor, virada para o centro.

const METAL = { color: '#1a2030', metalness: 0.7, roughness: 0.45 }
const DARK = { color: '#0e131e', metalness: 0.6, roughness: 0.5 }

function Emissive({ color, intensity = 2.2 }) {
  return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} />
}

// ---------------- MOTOR ----------------
export function Motor({ accent }) {
  const fan = useRef()
  useFrame((s, dt) => { if (fan.current) fan.current.rotation.x += dt * 6 })
  return (
    <group>
      {/* base */}
      <mesh position={[0, -1.1, 0]}><boxGeometry args={[3.2, 0.3, 1.6]} /><meshStandardMaterial {...DARK} /></mesh>
      {/* corpo cilíndrico */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, -0.2, 0]}><cylinderGeometry args={[0.9, 0.9, 2.4, 24]} /><meshStandardMaterial {...METAL} /></mesh>
      {/* aletas */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-1 + i * 0.28, -0.2, 0]}><boxGeometry args={[0.05, 1.9, 1.9]} /><meshStandardMaterial color="#222a3a" metalness={0.6} roughness={0.5} /></mesh>
      ))}
      {/* tampa + ventoinha girando */}
      <mesh position={[1.25, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.95, 0.95, 0.2, 24]} /><meshStandardMaterial {...METAL} /></mesh>
      <group ref={fan} position={[1.4, -0.2, 0]}>
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * Math.PI * 2
          return <mesh key={i} position={[0, Math.cos(a) * 0.5, Math.sin(a) * 0.5]} rotation={[a, 0, 0]}><boxGeometry args={[0.04, 0.7, 0.18]} /><meshStandardMaterial color="#3a4a66" /></mesh>
        })}
      </group>
      {/* eixo */}
      <mesh position={[-1.5, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.12, 0.12, 0.6, 12]} /><Emissive color={accent} intensity={1.2} /></mesh>
      {/* anel de luz accent */}
      <mesh position={[0, -0.2, 0.92]}><ringGeometry args={[0.5, 0.62, 24]} /><Emissive color={accent} /></mesh>
    </group>
  )
}

// ---------------- PAINEL ELÉTRICO ----------------
export function Panel({ accent }) {
  const cells = useMemo(() => Array.from({ length: 18 }), [])
  return (
    <group>
      {/* gabinetes */}
      {[-1.1, 0, 1.1].map((x, gi) => (
        <group key={gi} position={[x, 0, 0]}>
          <mesh><boxGeometry args={[1, 3.2, 0.7]} /><meshStandardMaterial color="#161c2a" metalness={0.6} roughness={0.4} /></mesh>
          <mesh position={[0, 0, 0.36]}><boxGeometry args={[0.86, 3, 0.04]} /><meshStandardMaterial color="#0c111b" metalness={0.5} roughness={0.5} /></mesh>
          {/* disjuntores/LEDs */}
          {cells.map((_, i) => {
            const col = i % 3, row = Math.floor(i / 3)
            return <mesh key={i} position={[-0.28 + col * 0.28, 1.1 - row * 0.42, 0.39]}>
              <boxGeometry args={[0.2, 0.28, 0.05]} />
              <meshStandardMaterial color="#0e1622" emissive={accent} emissiveIntensity={(i * gi) % 4 === 0 ? 1.6 : 0.15} toneMapped={false} />
            </mesh>
          })}
        </group>
      ))}
      {/* faixa superior acesa */}
      <mesh position={[0, 1.75, 0.38]}><boxGeometry args={[3.4, 0.12, 0.05]} /><Emissive color={accent} /></mesh>
    </group>
  )
}

// ---------------- BOMBA / COMPRESSOR ----------------
export function Pump({ accent }) {
  const rotor = useRef()
  useFrame((s, dt) => { if (rotor.current) rotor.current.rotation.z += dt * 5 })
  return (
    <group>
      <mesh position={[0, -1.2, 0]}><boxGeometry args={[3, 0.3, 1.6]} /><meshStandardMaterial {...DARK} /></mesh>
      {/* voluta */}
      <mesh position={[0.4, -0.3, 0]}><cylinderGeometry args={[1, 1, 0.9, 28]} /><meshStandardMaterial {...METAL} /></mesh>
      <mesh ref={rotor} position={[0.4, -0.3, 0.5]}><ringGeometry args={[0.3, 0.85, 8]} /><Emissive color={accent} intensity={1.6} /></mesh>
      {/* motor acoplado */}
      <mesh position={[-1.2, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.7, 0.7, 1.2, 20]} /><meshStandardMaterial {...METAL} /></mesh>
      {/* tubos */}
      <mesh position={[0.4, 0.7, 0]}><cylinderGeometry args={[0.32, 0.32, 1.6, 16]} /><meshStandardMaterial color="#24405f" metalness={0.6} roughness={0.4} /></mesh>
      <mesh position={[1.3, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.3, 0.3, 1.2, 16]} /><meshStandardMaterial color="#24405f" metalness={0.6} roughness={0.4} /></mesh>
    </group>
  )
}

// ---------------- VENTILADOR / HVAC ----------------
export function Fan({ accent }) {
  const blades = useRef()
  useFrame((s, dt) => { if (blades.current) blades.current.rotation.z += dt * 9 })
  return (
    <group>
      {/* carcaça */}
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.5, 1.5, 0.8, 32, 1, true]} /><meshStandardMaterial color="#1a2030" metalness={0.7} roughness={0.4} side={THREE.DoubleSide} /></mesh>
      <mesh><torusGeometry args={[1.5, 0.08, 12, 40]} /><Emissive color={accent} intensity={1.4} /></mesh>
      {/* pás */}
      <group ref={blades}>
        {Array.from({ length: 5 }).map((_, i) => {
          const a = (i / 5) * Math.PI * 2
          return <mesh key={i} position={[Math.cos(a) * 0.7, Math.sin(a) * 0.7, 0]} rotation={[0, 0, a + 0.5]}><boxGeometry args={[1.1, 0.5, 0.05]} /><meshStandardMaterial color="#33415c" metalness={0.5} roughness={0.5} /></mesh>
        })}
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.25, 0.25, 0.3, 16]} /><meshStandardMaterial {...METAL} /></mesh>
      </group>
      <mesh position={[0, -1.7, 0]}><boxGeometry args={[2, 0.4, 1.2]} /><meshStandardMaterial {...DARK} /></mesh>
    </group>
  )
}

// ---------------- ESTEIRA ----------------
export function Conveyor({ accent }) {
  const boxes = useRef([])
  useFrame((s) => {
    boxes.current.forEach((m, i) => {
      if (!m) return
      m.position.x = ((s.clock.elapsedTime * 0.8 + i * 1.3) % 4) - 2
    })
  })
  return (
    <group>
      <mesh position={[0, -0.8, 0]}><boxGeometry args={[4, 0.25, 1.2]} /><meshStandardMaterial {...METAL} /></mesh>
      <mesh position={[0, -0.62, 0]}><boxGeometry args={[3.8, 0.06, 1.1]} /><Emissive color={accent} intensity={0.8} /></mesh>
      {[-1.8, 1.8].map((x, i) => <mesh key={i} position={[x, -0.8, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.22, 0.22, 1.2, 16]} /><meshStandardMaterial {...DARK} /></mesh>)}
      {[0, 1, 2].map(i => (
        <mesh key={i} ref={el => boxes.current[i] = el} position={[0, -0.35, 0]}><boxGeometry args={[0.5, 0.5, 0.6]} /><meshStandardMaterial color="#3a2a18" metalness={0.2} roughness={0.8} /></mesh>
      ))}
      <mesh position={[0, -1.5, 0]}><boxGeometry args={[3.6, 0.4, 1]} /><meshStandardMaterial {...DARK} /></mesh>
    </group>
  )
}

// ---------------- GENÉRICO (tanques/caixas industriais) ----------------
export function Props({ accent }) {
  return (
    <group>
      <mesh position={[-0.8, -0.6, 0]}><cylinderGeometry args={[0.7, 0.7, 2, 20]} /><meshStandardMaterial {...METAL} /></mesh>
      <mesh position={[-0.8, 0.5, 0]}><torusGeometry args={[0.7, 0.06, 10, 28]} /><Emissive color={accent} intensity={1.2} /></mesh>
      <mesh position={[1, -0.9, 0]}><boxGeometry args={[1.2, 1.4, 1] } /><meshStandardMaterial {...DARK} /></mesh>
      <mesh position={[1, -0.2, 0.52]}><boxGeometry args={[0.8, 0.5, 0.05]} /><Emissive color={accent} intensity={1.4} /></mesh>
    </group>
  )
}

// mapeia cada cena -> máquina
export const MACHINE_BY_SCENE = {
  'motor-room': Motor,
  'pump-room': Pump,
  'compressor-room': Pump,
  'fan-room': Fan,
  conveyor: Conveyor,
  'panel-room': Panel,
  'electrical-wing': Panel,
  'control-room': Panel,
  'energy-room': Panel,
  office: Panel,
  cnc: Props,
  elevator: Props,
  'tool-bench': Props,
  workshop: Props,
  'hazard-room': Props,
  'safety-room': Props,
  street: null,
  facade: null,
  corridor: null,
}
