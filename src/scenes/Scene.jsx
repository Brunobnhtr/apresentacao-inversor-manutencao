import { useRef, useEffect } from 'react'
import {
  DustParticles, LightRays, PerspectiveFloor, FactoryShell, Pipes, Vignette, AmbientGlow,
} from './primitives'
import {
  BuildingFacade, MotorHero, PumpHero, FanHero, ConveyorHero, CompressorHero,
  ElevatorHero, CncHero, PanelHero, ControlDeskHero, WorkbenchHero, HazardHero,
  SafetyHero, MetersHero,
} from './heroes'

const CYAN = '#00d4ff'
const ORANGE = '#ff6b00'

// Configuração de cada cena (setor da fábrica)
const SCENES = {
  // ---- Inversor ----
  street:          { hero: 'facade',   accent: CYAN,   exterior: true,  label: 'ENTRADA DA INDÚSTRIA' },
  facade:          { hero: 'facade',   accent: CYAN,   exterior: true,  label: 'FACHADA' },
  corridor:        { hero: null,       accent: CYAN,   pipes: true,     label: 'CORREDOR INDUSTRIAL' },
  'motor-room':    { hero: 'motor',    accent: CYAN,   pipes: true,     label: 'SALA DE MOTORES' },
  'pump-room':     { hero: 'pump',     accent: CYAN,   pipes: true,     label: 'SETOR — BOMBAS D\'ÁGUA' },
  'fan-room':      { hero: 'fan',      accent: CYAN,                    label: 'SETOR — VENTILAÇÃO / HVAC' },
  conveyor:        { hero: 'conveyor', accent: CYAN,                    label: 'SETOR — ESTEIRAS' },
  'compressor-room': { hero: 'compressor', accent: CYAN, pipes: true,   label: 'SETOR — AR COMPRIMIDO' },
  elevator:        { hero: 'elevator', accent: CYAN,                    label: 'SETOR — ELEVAÇÃO' },
  cnc:             { hero: 'cnc',      accent: CYAN,                    label: 'SETOR — USINAGEM CNC' },
  'energy-room':   { hero: 'meters',   accent: CYAN,                    label: 'GESTÃO DE ENERGIA' },
  'control-room':  { hero: 'control',  accent: CYAN,                    label: 'SALA DE CONTROLE — SCADA' },

  // ---- Manutenção ----
  'electrical-wing': { hero: 'panel',  accent: ORANGE, exterior: false, label: 'ALA ELÉTRICA' },
  workshop:        { hero: 'workbench', accent: ORANGE,                 label: 'OFICINA DE MANUTENÇÃO' },
  'hazard-room':   { hero: 'hazard',   accent: ORANGE,                  label: 'ZONA DE RISCO ELÉTRICO' },
  'panel-room':    { hero: 'panel',    accent: ORANGE, pipes: true,     label: 'QUADRO DE DISTRIBUIÇÃO' },
  'tool-bench':    { hero: 'workbench', accent: ORANGE,                 label: 'INSTRUMENTOS DE DIAGNÓSTICO' },
  'safety-room':   { hero: 'safety',   accent: ORANGE,                  label: 'SEGURANÇA — NR-10' },
  office:          { hero: 'control',  accent: ORANGE,                  label: 'GESTÃO / PLANEJAMENTO' },
}

const HEROES = {
  facade: BuildingFacade,
  motor: MotorHero,
  pump: PumpHero,
  fan: FanHero,
  conveyor: ConveyorHero,
  compressor: CompressorHero,
  elevator: ElevatorHero,
  cnc: CncHero,
  panel: PanelHero,
  control: ControlDeskHero,
  workbench: WorkbenchHero,
  hazard: HazardHero,
  safety: SafetyHero,
  meters: MetersHero,
}

// Hook de parallax leve: move camadas conforme ponteiro/auto-drift
function useParallax(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf, t = 0
    let targetX = 0, targetY = 0, curX = 0, curY = 0

    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      targetX = ((e.clientX - r.left) / r.width - 0.5) * 2
      targetY = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    el.addEventListener('pointermove', onMove)

    const loop = () => {
      t += 0.008
      // drift automático suave + ponteiro
      const driftX = Math.sin(t) * 0.3
      const driftY = Math.cos(t * 0.7) * 0.2
      curX += (targetX + driftX - curX) * 0.05
      curY += (targetY + driftY - curY) * 0.05
      el.style.setProperty('--px', curX.toFixed(3))
      el.style.setProperty('--py', curY.toFixed(3))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointermove', onMove) }
  }, [ref])
}

export default function Scene({ sceneKey }) {
  const ref = useRef(null)
  useParallax(ref)

  const cfg = SCENES[sceneKey] || SCENES['corridor']
  const Hero = cfg.hero ? HEROES[cfg.hero] : null
  const accent = cfg.accent

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden" style={{ background: '#050510' }}>
      {/* Camada FUNDO — estrutura (move pouco) */}
      <div className="absolute inset-0 layer" style={{ '--depth': 6 }}>
        {cfg.exterior
          ? <ExteriorBack accent={accent} />
          : <FactoryShell color={accent} />}
      </div>

      {/* Camada FUNDO-MÉDIO — piso + tubos */}
      <div className="absolute inset-0 layer" style={{ '--depth': 12 }}>
        {!cfg.exterior && <PerspectiveFloor color={accent} />}
        {cfg.pipes && <Pipes color={accent} />}
      </div>

      {/* Camada MÉDIO — máquina herói */}
      <div className="absolute inset-0 layer" style={{ '--depth': 22 }}>
        {Hero && <Hero accent={accent} />}
      </div>

      {/* Camada FRENTE — atmosfera (move muito) */}
      <div className="absolute inset-0 layer" style={{ '--depth': 40 }}>
        <LightRays color={accent} count={5} />
        <DustParticles color={accent} count={28} />
      </div>

      {/* Overlays fixos */}
      <AmbientGlow color={accent} />
      <Vignette />
    </div>
  )
}

// Fundo de exterior (céu noturno industrial)
function ExteriorBack({ accent }) {
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1280 720">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1228" />
          <stop offset="60%" stopColor="#0a0e1e" />
          <stop offset="100%" stopColor="#050510" />
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#sky)" />
      {/* estrelas */}
      {Array.from({ length: 40 }).map((_, i) => (
        <circle key={i} cx={Math.random() * 1280} cy={Math.random() * 300} r={Math.random() * 1.2}
          fill="#ffffff" fillOpacity={0.2 + Math.random() * 0.4} />
      ))}
      {/* silhueta de prédios distantes */}
      <g fill="#070b18">
        <rect x="0" y="360" width="180" height="260" />
        <rect x="1100" y="330" width="180" height="290" />
        <rect x="60" y="320" width="60" height="300" />
      </g>
    </svg>
  )
}

export { SCENES }
