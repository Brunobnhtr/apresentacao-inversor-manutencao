import { useRef, useEffect, useState, useCallback } from 'react'
import { socket } from '../../socket'

export default function InverterSim({ isAdmin, simData, onUpdate }) {
  const waveCanvasRef = useRef(null)
  const motorRef = useRef(null)
  const animFrameRef = useRef(null)
  const angleRef = useRef(0)

  const [freq, setFreq] = useState(simData?.inverterFreq ?? 30)
  const [running, setRunning] = useState(simData?.inverterRunning ?? false)

  // Sync incoming data from viewer side
  useEffect(() => {
    if (!isAdmin) {
      if (simData?.inverterFreq !== undefined) setFreq(simData.inverterFreq)
      if (simData?.inverterRunning !== undefined) setRunning(simData.inverterRunning)
    }
  }, [simData, isAdmin])

  const rpm = Math.round((freq / 60) * 1800)
  const power = Math.round(Math.pow(freq / 60, 3) * 100)
  const torque = freq > 0 ? Math.round(100 * Math.min(1, freq / 10)) : 0

  // Motor canvas animation
  useEffect(() => {
    const motor = motorRef.current
    if (!motor) return

    const ctx = motor.getContext('2d')
    const W = motor.width
    const H = motor.height
    const cx = W / 2
    const cy = H / 2
    const R = Math.min(W, H) * 0.4

    let lastTime = 0

    function draw(time) {
      if (running && freq > 0) {
        const delta = (time - lastTime) / 1000
        angleRef.current += (freq / 60) * 2 * Math.PI * delta * 2
      }
      lastTime = time

      ctx.clearRect(0, 0, W, H)

      // Outer ring glow
      const grd = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.1)
      grd.addColorStop(0, 'rgba(0,212,255,0)')
      grd.addColorStop(1, running ? 'rgba(0,212,255,0.2)' : 'rgba(100,100,100,0.1)')
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2)
      ctx.fillStyle = grd
      ctx.fill()

      // Body
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = '#12122a'
      ctx.strokeStyle = running ? '#00d4ff' : '#333'
      ctx.lineWidth = 3
      ctx.fill()
      ctx.stroke()

      // Rotor blades
      const bladeCount = 8
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(angleRef.current)
      for (let i = 0; i < bladeCount; i++) {
        const a = (i / bladeCount) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(Math.cos(a) * R * 0.85, Math.sin(a) * R * 0.85)
        ctx.strokeStyle = running
          ? `rgba(0,212,255,${0.4 + 0.4 * Math.sin(i)})`
          : 'rgba(100,100,100,0.4)'
        ctx.lineWidth = 2.5
        ctx.stroke()
      }
      ctx.restore()

      // Center hub
      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.15, 0, Math.PI * 2)
      ctx.fillStyle = running ? '#00d4ff' : '#555'
      ctx.fill()

      // Speed indicator arc
      const speedAngle = (freq / 70) * Math.PI * 1.5 - Math.PI * 0.75
      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.92, -Math.PI * 0.75, speedAngle)
      ctx.strokeStyle = running ? '#00ff88' : '#333'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.stroke()

      animFrameRef.current = requestAnimationFrame(draw)
    }

    animFrameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [running, freq])

  // Waveform canvas
  useEffect(() => {
    const canvas = waveCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    let offset = 0
    let raf

    function draw() {
      ctx.clearRect(0, 0, W, H)

      // Background
      ctx.fillStyle = '#0a0a1e'
      ctx.fillRect(0, 0, W, H)

      // Grid lines
      ctx.strokeStyle = 'rgba(0,212,255,0.08)'
      ctx.lineWidth = 1
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = 0; y < H; y += H / 4) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }

      const midTop = H * 0.28
      const midBot = H * 0.78
      const ampTop = H * 0.18
      const ampBot = H * 0.15

      // Input wave label
      ctx.fillStyle = '#00d4ff'
      ctx.font = '11px Inter'
      ctx.fillText('Entrada: 60 Hz', 8, 14)

      // Input 60Hz sine (always fixed)
      ctx.beginPath()
      for (let x = 0; x < W; x++) {
        const t = (x + offset * 0.8) / W
        const y = midTop - Math.sin(t * Math.PI * 2 * 6) * ampTop
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.strokeStyle = '#00d4ff'
      ctx.lineWidth = 2
      ctx.shadowColor = '#00d4ff'
      ctx.shadowBlur = 6
      ctx.stroke()
      ctx.shadowBlur = 0

      // Output wave label
      ctx.fillStyle = '#00ff88'
      ctx.fillText(`Saída: ${freq} Hz`, 8, H * 0.54)

      // Output variable freq sine
      const cycles = (freq / 60) * 6
      ctx.beginPath()
      for (let x = 0; x < W; x++) {
        const t = (x + offset * (freq / 60)) / W
        const y = midBot - Math.sin(t * Math.PI * 2 * cycles) * ampBot
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.strokeStyle = '#00ff88'
      ctx.lineWidth = 2
      ctx.shadowColor = '#00ff88'
      ctx.shadowBlur = 6
      ctx.stroke()
      ctx.shadowBlur = 0

      // Center line
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, H * 0.5); ctx.lineTo(W, H * 0.5); ctx.stroke()

      if (running) offset += freq * 0.15 + 0.5
      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [freq, running])

  const handleFreqChange = useCallback((val) => {
    const f = Number(val)
    setFreq(f)
    if (isAdmin) onUpdate({ inverterFreq: f })
  }, [isAdmin, onUpdate])

  const handleToggle = useCallback(() => {
    const next = !running
    setRunning(next)
    if (isAdmin) onUpdate({ inverterRunning: next })
  }, [running, isAdmin, onUpdate])

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4 gap-4">

      {/* Motor + Metrics row */}
      <div className="flex gap-4 w-full max-w-4xl">

        {/* Motor canvas */}
        <div className="glass rounded-xl p-3 flex flex-col items-center gap-2 flex-shrink-0">
          <div className="text-xs text-gray-400 font-industrial tracking-widest uppercase">Motor CA</div>
          <canvas ref={motorRef} width={160} height={160} className="rounded-lg" />
          <div className={`text-xs font-industrial tracking-widest ${running ? 'text-neon-green' : 'text-gray-500'}`}>
            {running ? '● OPERANDO' : '○ PARADO'}
          </div>
        </div>

        {/* Metrics */}
        <div className="flex-1 grid grid-cols-3 gap-3">
          <Metric label="Frequência" value={`${freq} Hz`} color="#00d4ff" />
          <Metric label="Rotação" value={`${rpm} RPM`} color="#00ff88" />
          <Metric label="Potência" value={`${power}%`} color="#ff6b00" />
        </div>
      </div>

      {/* Waveform */}
      <div className="glass rounded-xl p-2 w-full max-w-4xl">
        <canvas ref={waveCanvasRef} width={740} height={120}
          className="w-full rounded" style={{ display: 'block' }} />
      </div>

      {/* Torque-speed visual */}
      <div className="glass rounded-xl p-3 w-full max-w-4xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-400 uppercase tracking-widest font-industrial">Lei da Afinidade — Potência consumida</span>
        </div>
        <div className="flex items-end gap-1 h-12">
          {[10,20,30,40,50,60].map(f => {
            const pct = Math.pow(f / 60, 3) * 100
            return (
              <div key={f} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t transition-all duration-300"
                  style={{
                    height: `${pct * 0.44}px`,
                    background: f <= freq
                      ? `linear-gradient(to top, #00ff88, #00d4ff)`
                      : 'rgba(255,255,255,0.08)',
                    boxShadow: f === freq ? '0 0 8px #00ff88' : 'none'
                  }}
                />
                <span className="text-xs text-gray-500">{f}Hz</span>
              </div>
            )
          })}
        </div>
        <div className="text-center text-xs text-neon-green mt-1 font-industrial">
          Consumo atual: {power}% · Economia: {100 - power}%
        </div>
      </div>

      {/* Admin controls only */}
      {isAdmin && (
        <div className="glass rounded-xl p-4 w-full max-w-4xl">
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggle}
              className={`px-6 py-3 rounded-xl font-industrial font-bold text-sm tracking-widest transition-all touch-btn ${
                running
                  ? 'bg-red-900/60 border border-red-500 text-red-400 hover:bg-red-800/60'
                  : 'bg-green-900/60 border border-green-500 text-green-400 hover:bg-green-800/60'
              }`}
            >
              {running ? '⏹ PARAR' : '▶ LIGAR'}
            </button>
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-400 mb-1 font-industrial">
                <span>0 Hz</span>
                <span className="text-electric font-bold">{freq} Hz</span>
                <span>60 Hz</span>
              </div>
              <input
                type="range" min={0} max={60} step={1} value={freq}
                onChange={e => handleFreqChange(e.target.value)}
                className="w-full accent-electric h-2 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, color }) {
  return (
    <div className="glass rounded-xl p-3 flex flex-col gap-1">
      <span className="text-xs text-gray-500 uppercase tracking-widest font-industrial">{label}</span>
      <span className="text-2xl font-industrial font-bold" style={{ color }}>{value}</span>
    </div>
  )
}
