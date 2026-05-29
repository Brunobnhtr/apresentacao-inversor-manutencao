import { useRef, useEffect, useState, useCallback } from 'react'

const MAX_FREQ = 90      // slider vai além dos 60 Hz da rede (o inversor gera sua própria frequência)
const NOMINAL = 60       // frequência nominal (rede)

export default function InverterSim({ isAdmin, simData, onUpdate }) {
  const motorRef = useRef(null)
  const waveRef = useRef(null)
  const angleRef = useRef(0)

  const [freq, setFreq] = useState(simData?.inverterFreq ?? 60)
  const [running, setRunning] = useState(simData?.inverterRunning ?? false)

  useEffect(() => {
    if (!isAdmin) {
      if (simData?.inverterFreq !== undefined) setFreq(simData.inverterFreq)
      if (simData?.inverterRunning !== undefined) setRunning(simData.inverterRunning)
    }
  }, [simData, isAdmin])

  // ---- Grandezas físicas ----
  const rpm = Math.round((freq / NOMINAL) * 1800)                 // motor 4 polos
  const voltage = Math.min(380, Math.round((380 * freq) / NOMINAL)) // V/f: tensão satura em 380V no nominal
  const torque = freq <= NOMINAL ? 100 : Math.round((NOMINAL / freq) * 100) // cai acima do nominal
  const powerCentrifugal = Math.round(Math.pow(freq / NOMINAL, 3) * 100)     // Lei da Afinidade (bomba/vent.)
  const economy = Math.max(0, 100 - powerCentrifugal)
  const aboveNominal = freq > NOMINAL

  // ---- Motor (canvas) ----
  useEffect(() => {
    const c = motorRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    const W = c.width, H = c.height, cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.4
    let last = 0, raf

    function draw(t) {
      if (running && freq > 0) angleRef.current += (freq / NOMINAL) * (t - last) / 1000 * 6
      last = t
      ctx.clearRect(0, 0, W, H)

      // glow
      const g = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.15)
      g.addColorStop(0, 'rgba(0,212,255,0)')
      g.addColorStop(1, running ? 'rgba(0,212,255,0.18)' : 'rgba(120,120,120,0.08)')
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.15, 0, 7); ctx.fillStyle = g; ctx.fill()

      // corpo
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7)
      ctx.fillStyle = '#0d1530'; ctx.strokeStyle = running ? '#00d4ff' : '#333'; ctx.lineWidth = 3
      ctx.fill(); ctx.stroke()

      // pás
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(angleRef.current)
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * R * 0.85, Math.sin(a) * R * 0.85)
        ctx.strokeStyle = running ? `rgba(0,212,255,${0.4 + 0.4 * Math.abs(Math.sin(i))})` : 'rgba(120,120,120,0.4)'
        ctx.lineWidth = 2.5; ctx.stroke()
      }
      ctx.restore()

      // cubo
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.15, 0, 7); ctx.fillStyle = running ? '#00d4ff' : '#555'; ctx.fill()

      // arco de velocidade (% do máximo do slider) — enche 100% no máximo
      const start = -Math.PI * 0.75, sweep = Math.PI * 1.5
      const frac = freq / MAX_FREQ
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.92, start, start + sweep)
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke()
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.92, start, start + sweep * frac)
      ctx.strokeStyle = aboveNominal ? '#ff6b00' : '#00ff88'; ctx.lineWidth = 5; ctx.stroke()

      // marca do nominal (60 Hz)
      const na = start + sweep * (NOMINAL / MAX_FREQ)
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(na) * R * 0.82, cy + Math.sin(na) * R * 0.82)
      ctx.lineTo(cx + Math.cos(na) * R * 1.02, cy + Math.sin(na) * R * 1.02)
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke()

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [running, freq, aboveNominal])

  // ---- Formas de onda (canvas) — mesma base de tempo p/ entrada e saída ----
  useEffect(() => {
    const c = waveRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    const W = c.width, H = c.height
    let offset = 0, raf

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#0a0a1e'; ctx.fillRect(0, 0, W, H)
      ctx.strokeStyle = 'rgba(0,212,255,0.07)'; ctx.lineWidth = 1
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }

      const baseCycles = 6                       // a entrada (60Hz) mostra 6 ciclos na tela
      const drawWave = (yMid, amp, cycles, color, label) => {
        ctx.fillStyle = color; ctx.font = '11px Inter'; ctx.fillText(label, 8, yMid - amp - 6)
        ctx.beginPath()
        for (let x = 0; x <= W; x++) {
          // offset igual p/ as duas ondas => mesma velocidade de varredura (base de tempo)
          const phase = ((x + offset) / W) * cycles * Math.PI * 2
          const y = yMid - Math.sin(phase) * amp
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.shadowColor = color; ctx.shadowBlur = 6; ctx.stroke(); ctx.shadowBlur = 0
      }

      drawWave(H * 0.30, H * 0.17, baseCycles, '#00d4ff', 'Entrada da rede: 60 Hz (fixo)')
      drawWave(H * 0.74, H * 0.17, (freq / NOMINAL) * baseCycles, '#00ff88', `Saída do inversor: ${freq} Hz`)

      ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, H * 0.5); ctx.lineTo(W, H * 0.5); ctx.stroke()

      if (running) offset += 2.4    // varredura constante p/ ambas
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [freq, running])

  const setF = useCallback((v) => { const f = Number(v); setFreq(f); if (isAdmin) onUpdate({ inverterFreq: f }) }, [isAdmin, onUpdate])
  const toggle = useCallback(() => { const n = !running; setRunning(n); if (isAdmin) onUpdate({ inverterRunning: n }) }, [running, isAdmin, onUpdate])

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-3 gap-3 overflow-auto">

      {/* Motor + métricas */}
      <div className="flex flex-wrap gap-3 w-full max-w-4xl items-stretch justify-center">
        <div className="glass rounded-xl p-3 flex flex-col items-center gap-1 flex-shrink-0">
          <div className="text-xs text-gray-400 font-industrial tracking-widest uppercase">Motor CA</div>
          <canvas ref={motorRef} width={150} height={150} className="rounded-lg" />
          <div className={`text-xs font-industrial tracking-widest ${running ? (aboveNominal ? 'text-neon-orange' : 'text-neon-green') : 'text-gray-500'}`}>
            {running ? (aboveNominal ? '● ACIMA DO NOMINAL' : '● OPERANDO') : '○ PARADO'}
          </div>
        </div>
        <div className="flex-1 min-w-[220px] grid grid-cols-2 gap-2 content-center">
          <Metric label="Frequência" value={`${freq} Hz`} color="#00d4ff" />
          <Metric label="Rotação" value={`${rpm} RPM`} color="#00ff88" />
          <Metric label="Tensão (V/f)" value={`${voltage} V`} color="#8b5cf6" />
          <Metric label="Torque disp." value={`${torque}%`} color={aboveNominal ? '#ff6b00' : '#00ff88'} />
        </div>
      </div>

      {/* Onda */}
      <div className="glass rounded-xl p-2 w-full max-w-4xl">
        <canvas ref={waveRef} width={760} height={130} className="w-full rounded" style={{ display: 'block' }} />
      </div>

      {/* Regiões V/f + economia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-4xl">
        {/* Curva de torque x frequência */}
        <div className="glass rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-industrial mb-1">Torque x Frequência</div>
          <TorqueChart freq={freq} />
          <div className="text-xs mt-1 font-industrial" style={{ color: aboveNominal ? '#ff6b00' : '#00ff88' }}>
            {aboveNominal
              ? '⚠ Enfraquecimento de campo: + velocidade, − torque'
              : '✓ Torque constante (V/f constante)'}
          </div>
        </div>

        {/* Economia (carga centrífuga) */}
        <div className="glass rounded-xl p-3 flex flex-col justify-center">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-industrial mb-1">Carga centrífuga (bomba/vent.)</div>
          <div className="flex items-end gap-3">
            <div>
              <div className="text-3xl font-industrial font-bold" style={{ color: economy > 0 ? '#00ff88' : '#ff6b00' }}>
                {economy > 0 ? `${economy}%` : `+${powerCentrifugal - 100}%`}
              </div>
              <div className="text-xs text-gray-400">{economy > 0 ? 'de economia de energia' : 'consome MAIS que o nominal'}</div>
            </div>
            <div className="flex-1 text-right">
              <div className="text-sm font-industrial text-gray-300">Potência: {powerCentrifugal}%</div>
              <div className="text-xs text-gray-500">P ∝ (f / 60)³</div>
            </div>
          </div>
          <div className="h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, powerCentrifugal)}%`, background: powerCentrifugal > 100 ? '#ff6b00' : 'linear-gradient(to right,#00ff88,#00d4ff)' }} />
          </div>
        </div>
      </div>

      {/* Controles (só admin) */}
      {isAdmin && (
        <div className="glass rounded-xl p-4 w-full max-w-4xl">
          <div className="flex items-center gap-4">
            <button onClick={toggle}
              className={`px-5 py-3 rounded-xl font-industrial font-bold text-sm tracking-widest touch-btn ${running ? 'bg-red-900/60 border border-red-500 text-red-400' : 'bg-green-900/60 border border-green-500 text-green-400'}`}>
              {running ? '⏹ PARAR' : '▶ LIGAR'}
            </button>
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-400 mb-1 font-industrial">
                <span>0 Hz</span>
                <span className="text-white">rede 60 ↑</span>
                <span className="text-neon-orange">{MAX_FREQ} Hz</span>
              </div>
              <input type="range" min={0} max={MAX_FREQ} step={1} value={freq}
                onChange={e => setF(e.target.value)} className="w-full accent-electric h-2 cursor-pointer" />
              <div className="text-center text-lg font-industrial font-bold mt-1" style={{ color: aboveNominal ? '#ff6b00' : '#00d4ff' }}>{freq} Hz</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, color }) {
  return (
    <div className="glass rounded-lg p-2.5 flex flex-col gap-0.5">
      <span className="text-xs text-gray-500 uppercase tracking-widest font-industrial">{label}</span>
      <span className="text-xl font-industrial font-bold" style={{ color }}>{value}</span>
    </div>
  )
}

// Curva torque x frequência com as duas regiões
function TorqueChart({ freq }) {
  const W = 320, H = 70, pad = 4
  const fx = (f) => pad + (f / MAX_FREQ) * (W - 2 * pad)
  const ty = (t) => H - pad - (t / 120) * (H - 2 * pad)
  // torque: 100% até 60, depois 60/f
  const pts = []
  for (let f = 0; f <= MAX_FREQ; f += 2) {
    const t = f <= NOMINAL ? 100 : (NOMINAL / f) * 100
    pts.push(`${fx(f)},${ty(t)}`)
  }
  const curFrac = freq / MAX_FREQ
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 70 }}>
      {/* região nominal */}
      <rect x={pad} y={pad} width={fx(NOMINAL) - pad} height={H - 2 * pad} fill="#00ff8810" />
      <rect x={fx(NOMINAL)} y={pad} width={W - pad - fx(NOMINAL)} height={H - 2 * pad} fill="#ff6b0010" />
      {/* linha nominal */}
      <line x1={fx(NOMINAL)} y1={pad} x2={fx(NOMINAL)} y2={H - pad} stroke="#ffffff" strokeOpacity="0.3" strokeDasharray="3 3" />
      <text x={fx(NOMINAL)} y={H - 1} fill="#fff" fillOpacity="0.5" fontSize="8" textAnchor="middle">60Hz</text>
      {/* curva torque */}
      <polyline points={pts.join(' ')} fill="none" stroke="#00d4ff" strokeWidth="2" />
      {/* marcador atual */}
      <line x1={fx(freq)} y1={pad} x2={fx(freq)} y2={H - pad} stroke={freq > NOMINAL ? '#ff6b00' : '#00ff88'} strokeWidth="1.5" />
      <circle cx={fx(freq)} cy={ty(freq <= NOMINAL ? 100 : (NOMINAL / freq) * 100)} r="3.5" fill={freq > NOMINAL ? '#ff6b00' : '#00ff88'} />
    </svg>
  )
}
