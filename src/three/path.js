import * as THREE from 'three'
import { SLIDES } from '../data/slides'

// ===== Caminho sinuoso pela fábrica: curvas, subidas e descidas =====
export const TRAVEL_MS = 1900            // transição lenta (caminhada)
export const N = SLIDES.length
export const HALF_W = 4.6                 // meia-largura do corredor
export const FLOOR_OFF = -2.4             // piso (relativo à linha dos olhos)
export const CEIL_OFF = 1.9               // teto
const UP = new THREE.Vector3(0, 1, 0)

// turn (graus, vira antes de avançar) · len (avanço) · rise (sobe/desce)
const MOVES = [
  null,
  { turn: 0, len: 18, rise: 0 },
  { turn: 0, len: 18, rise: 0 },
  { turn: 90, len: 18, rise: 0 },    // vira à direita
  { turn: 0, len: 18, rise: 0 },
  { turn: -90, len: 18, rise: 0 },   // vira à esquerda
  { turn: 0, len: 18, rise: 0 },
  { turn: 0, len: 17, rise: 7 },     // SOBE (escada/elevador)
  { turn: 0, len: 18, rise: 0 },
  { turn: -90, len: 18, rise: 0 },   // vira à esquerda
  { turn: 0, len: 18, rise: 0 },
  { turn: 0, len: 17, rise: -6 },    // DESCE
  { turn: 0, len: 18, rise: 0 },
  { turn: 90, len: 20, rise: 0 },    // entra na ala de manutenção (vira)
  { turn: 0, len: 18, rise: 0 },
  { turn: -90, len: 18, rise: 0 },
  { turn: 0, len: 18, rise: 0 },
  { turn: 0, len: 17, rise: 5 },     // sobe
  { turn: 90, len: 18, rise: 0 },
  { turn: 0, len: 18, rise: 0 },
]

export const stations = (() => {
  const pts = []
  let pos = new THREE.Vector3(0, 0, 0)
  let yaw = 0
  const fwd = (y) => new THREE.Vector3(Math.sin(y), 0, -Math.cos(y))
  pts.push(pos.clone())
  for (let i = 1; i < N; i++) {
    const m = MOVES[i] || { turn: 0, len: 18, rise: 0 }
    yaw += THREE.MathUtils.degToRad(m.turn)
    pos = pos.clone().add(fwd(yaw).multiplyScalar(m.len)).add(new THREE.Vector3(0, m.rise, 0))
    pts.push(pos.clone())
  }
  return pts
})()

export const curve = new THREE.CatmullRomCurve3(stations, false, 'centripetal', 0.5)

// estação i -> t do parâmetro (CatmullRom passa exatamente nos pontos)
export const tOf = (i) => i / (N - 1)

export function frameAt(t) {
  const p = curve.getPoint(t)
  const tan = curve.getTangent(t).normalize()
  let right = new THREE.Vector3().crossVectors(tan, UP)
  if (right.lengthSq() < 1e-4) right.set(1, 0, 0)
  right.normalize()
  return { p, tan, right }
}

// ===== Geometria do corredor extrudada ao longo da curva =====
function pushQuad(arr, a, b, c, d) {
  arr.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z)
  arr.push(a.x, a.y, a.z, c.x, c.y, c.z, d.x, d.y, d.z)
}

export function buildCorridor() {
  const SAMPLES = (N - 1) * 7
  const floor = [], ceil = [], left = [], right = [], stripe = [], base = []
  let prev = null
  for (let k = 0; k <= SAMPLES; k++) {
    const t = k / SAMPLES
    const { p, right: R } = frameAt(t)
    const fL = p.clone().addScaledVector(R, -HALF_W).addScaledVector(UP, FLOOR_OFF)
    const fR = p.clone().addScaledVector(R, HALF_W).addScaledVector(UP, FLOOR_OFF)
    const cL = p.clone().addScaledVector(R, -HALF_W).addScaledVector(UP, CEIL_OFF)
    const cR = p.clone().addScaledVector(R, HALF_W).addScaledVector(UP, CEIL_OFF)
    const sL = p.clone().addScaledVector(R, -0.3).addScaledVector(UP, FLOOR_OFF + 0.02)
    const sR = p.clone().addScaledVector(R, 0.3).addScaledVector(UP, FLOOR_OFF + 0.02)
    const bL = p.clone().addScaledVector(R, -HALF_W + 0.03).addScaledVector(UP, FLOOR_OFF + 0.5)
    const bR = p.clone().addScaledVector(R, HALF_W - 0.03).addScaledVector(UP, FLOOR_OFF + 0.5)
    const cur = { fL, fR, cL, cR, sL, sR, bL, bR }
    if (prev) {
      pushQuad(floor, prev.fL, prev.fR, cur.fR, cur.fL)
      pushQuad(ceil, cur.cL, cur.cR, prev.cR, prev.cL)
      pushQuad(left, prev.fL, prev.cL, cur.cL, cur.fL)
      pushQuad(right, cur.fR, cur.cR, prev.cR, prev.fR)
      pushQuad(stripe, prev.sL, prev.sR, cur.sR, cur.sL)
      // faixas de base (finas, na altura bL/bR)
      const bL2 = prev.bL, bR2 = prev.bR
      pushQuad(base, bL2, cur.bL, cur.bL.clone().addScaledVector(UP, 0.12), bL2.clone().addScaledVector(UP, 0.12))
      pushQuad(base, bR2, cur.bR, cur.bR.clone().addScaledVector(UP, 0.12), bR2.clone().addScaledVector(UP, 0.12))
    }
    prev = cur
  }
  const geo = (arr) => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3))
    g.computeVertexNormals()
    return g
  }
  return { floor: geo(floor), ceil: geo(ceil), left: geo(left), right: geo(right), stripe: geo(stripe), base: geo(base) }
}

// luzes de teto distribuídas ao longo do caminho
export function ceilingLights() {
  const out = []
  const total = curve.getLength()
  const step = 6
  for (let d = 4; d < total; d += step) {
    const t = d / total
    const { p, tan } = frameAt(Math.min(0.999, t))
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan)
    out.push({ pos: [p.x, p.y + CEIL_OFF - 0.08, p.z], quat: [q.x, q.y, q.z, q.w] })
  }
  return out
}
