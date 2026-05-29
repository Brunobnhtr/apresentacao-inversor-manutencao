import { useState, useEffect, useRef, useCallback } from 'react'

// Espaço interno do painel (coordenadas dos componentes)
const PW = 360, PH = 360

const COMPONENTS = [
  { id: 'main', label: 'DJ Geral', x: 150, y: 30, w: 64, h: 38, heat: 0.22, issue: null, visible: false,
    desc: 'Disjuntor geral 200A. Operação normal.' },
  { id: 'b1', label: 'DJ1 Motor A', x: 40, y: 110, w: 54, h: 36, heat: 0.85, issue: 'SOBRECARGA', visible: true,
    desc: 'Corrente acima do nominal. O relé térmico está atuando. Verificar o motor acionado.' },
  { id: 'b2', label: 'DJ2 Motor B', x: 110, y: 110, w: 54, h: 36, heat: 0.30, issue: null, visible: false,
    desc: 'Disjuntor 32A. Operação normal.' },
  { id: 'b3', label: 'DJ3 HVAC', x: 180, y: 110, w: 54, h: 36, heat: 0.28, issue: null, visible: false,
    desc: 'Disjuntor 25A. Operação normal.' },
  { id: 'b4', label: 'DJ4 Luz', x: 250, y: 110, w: 54, h: 36, heat: 0.18, issue: null, visible: false,
    desc: 'Disjuntor 16A. Operação normal.' },
  { id: 'km1', label: 'Contator KM1', x: 45, y: 195, w: 62, h: 42, heat: 0.97, issue: 'SUPERAQUECIMENTO', visible: false,
    desc: 'CRÍTICO: 92°C! Contato oxidado gerando arco. NÃO aparece a olho nu — só a termografia revela.' },
  { id: 'km2', label: 'Contator KM2', x: 130, y: 195, w: 62, h: 42, heat: 0.34, issue: null, visible: false,
    desc: 'Contator 40A. Contatos em bom estado.' },
  { id: 'fr1', label: 'Relé FR1', x: 215, y: 195, w: 62, h: 42, heat: 0.30, issue: null, visible: false,
    desc: 'Relé de falta de fase. Calibrado em 25A. OK.' },
  { id: 'term', label: 'Régua de bornes', x: 70, y: 285, w: 150, h: 30, heat: 0.62, issue: 'CONEXÃO FROUXA', visible: true,
    desc: 'Borne T3 com aperto insuficiente — visível e já esquentando. Reapertar no torque correto.' },
  { id: 'cable', label: 'Cabo 16mm²', x: 240, y: 270, w: 80, h: 22, heat: 0.24, issue: null, visible: false,
    desc: 'Cabo de alimentação. Isolamento íntegro.' },
]

const CHECKLIST = [
  { id: 'visual', label: 'Inspeção visual', dep: [] },
  { id: 'breakers', label: 'Disjuntores', dep: ['main', 'b1', 'b2', 'b3', 'b4'] },
  { id: 'contactors', label: 'Contatores', dep: ['km1', 'km2'] },
  { id: 'relays', label: 'Relés', dep: ['fr1'] },
  { id: 'terminals', label: 'Bornes e cabos', dep: ['term', 'cable'] },
]

// Paleta térmica estilo FLIR (0=frio azul, 1=quente branco)
function flir(v) {
  const stops = [
    [0.0, [10, 10, 60]], [0.25, [40, 0, 130]], [0.45, [180, 0, 120]],
    [0.6, [255, 80, 0]], [0.78, [255, 180, 0]], [0.9, [255, 240, 120]], [1.0, [255, 255, 255]],
  ]
  for (let i = 0; i < stops.length - 1; i++) {
    const [a, ca] = stops[i], [b, cb] = stops[i + 1]
    if (v >= a && v <= b) {
      const t = (v - a) / (b - a)
      return `rgb(${ca.map((c, k) => Math.round(c + (cb[k] - c) * t)).join(',')})`
    }
  }
  return 'rgb(255,255,255)'
}

export default function MaintenanceSim({ isAdmin, simData, onUpdate }) {
  const [inspected, setInspected] = useState(new Set(simData?.inspected ?? []))
  const [found, setFound] = useState(new Set(simData?.found ?? []))
  const [thermal, setThermal] = useState(simData?.thermalMode ?? false)
  const [selected, setSelected] = useState(simData?.selectedId ?? null)
  const [scan, setScan] = useState(simData?.scan ?? { x: 0.5, y: 0.5, active: false })

  const canvasRef = useRef(null)
  const boxRef = useRef(null)
  const scanRef = useRef(scan)
  const lastEmit = useRef(0)
  scanRef.current = scan

  // Sincronização (viewer recebe do admin)
  useEffect(() => {
    if (isAdmin) return
    if (simData?.inspected) setInspected(new Set(simData.inspected))
    if (simData?.found) setFound(new Set(simData.found))
    if (simData?.thermalMode !== undefined) setThermal(simData.thermalMode)
    if (simData?.selectedId !== undefined) setSelected(simData.selectedId)
    if (simData?.scan) setScan(simData.scan)
  }, [simData, isAdmin])

  const emit = useCallback((patch) => {
    if (isAdmin) onUpdate(patch)
  }, [isAdmin, onUpdate])

  // ---- Mapa de calor (canvas) com reticula que segue o scan ----
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv || !thermal) return
    const ctx = cv.getContext('2d')
    let raf, lerpX = scanRef.current.x, lerpY = scanRef.current.y, t = 0

    function draw() {
      t += 0.05
      const W = cv.width, H = cv.height
      const sx = (x) => (x / PW) * W, sy = (y) => (y / PH) * H

      // fundo frio
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#06061a'
      ctx.fillRect(0, 0, W, H)

      // blobs de calor (aditivo)
      ctx.globalCompositeOperation = 'lighter'
      for (const c of COMPONENTS) {
        const cx = sx(c.x + c.w / 2), cy = sy(c.y + c.h / 2)
        const r = sx(Math.max(c.w, c.h)) * (0.8 + c.heat * 0.7)
        const flick = c.heat > 0.7 ? 1 + Math.sin(t * 4 + c.x) * 0.04 : 1
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * flick)
        g.addColorStop(0, flir(c.heat))
        g.addColorStop(0.5, flir(c.heat * 0.6))
        g.addColorStop(1, 'rgba(10,10,40,0)')
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(cx, cy, r * flick, 0, 7); ctx.fill()
      }

      // reticula de varredura (lente do termômetro) — suaviza até o alvo
      const target = scanRef.current
      lerpX += (target.x - lerpX) * 0.2
      lerpY += (target.y - lerpY) * 0.2
      if (target.active) {
        const rx = lerpX * W, ry = lerpY * H
        ctx.globalCompositeOperation = 'source-over'
        // foco mais claro
        const lens = ctx.createRadialGradient(rx, ry, 0, rx, ry, W * 0.18)
        lens.addColorStop(0, 'rgba(255,255,255,0.12)')
        lens.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = lens; ctx.beginPath(); ctx.arc(rx, ry, W * 0.18, 0, 7); ctx.fill()
        // crosshair
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.arc(rx, ry, 22, 0, 7); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(rx - 30, ry); ctx.lineTo(rx + 30, ry); ctx.moveTo(rx, ry - 30); ctx.lineTo(rx, ry + 30); ctx.stroke()
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [thermal])

  // componente sob o scan (para readout de temperatura)
  const scanComp = (() => {
    const px = scan.x * PW, py = scan.y * PH
    return COMPONENTS.find(c => px >= c.x && px <= c.x + c.w && py >= c.y && py <= c.y + c.h)
  })()

  // ---- Interações (admin) ----
  const pointer = useCallback((e) => {
    if (!isAdmin) return
    const box = boxRef.current
    if (!box) return
    const r = box.getBoundingClientRect()
    const pt = e.touches ? e.touches[0] : e
    const x = Math.max(0, Math.min(1, (pt.clientX - r.left) / r.width))
    const y = Math.max(0, Math.min(1, (pt.clientY - r.top) / r.height))
    setScan({ x, y, active: true })
    const now = Date.now()
    if (now - lastEmit.current > 70) { lastEmit.current = now; emit({ scan: { x, y, active: true } }) }
  }, [isAdmin, emit])

  const pointerEnd = useCallback(() => {
    if (!isAdmin) return
    setScan(s => { const ns = { ...s, active: false }; emit({ scan: ns }); return ns })
  }, [isAdmin, emit])

  const clickComp = useCallback((c) => {
    if (!isAdmin) return
    const ni = new Set(inspected); ni.add(c.id)
    const nf = new Set(found); if (c.issue) nf.add(c.id)
    setInspected(ni); setFound(nf); setSelected(c.id)
    emit({ inspected: [...ni], found: [...nf], selectedId: c.id })
  }, [inspected, found, isAdmin, emit])

  const toggleThermal = useCallback(() => {
    const n = !thermal; setThermal(n); emit({ thermalMode: n })
  }, [thermal, emit])

  const reset = useCallback(() => {
    setInspected(new Set()); setFound(new Set()); setSelected(null); setThermal(false)
    setScan({ x: 0.5, y: 0.5, active: false })
    emit({ inspected: [], found: [], selectedId: null, thermalMode: false, scan: { x: 0.5, y: 0.5, active: false } })
  }, [emit])

  const issues = COMPONENTS.filter(c => c.issue)
  const foundIssues = issues.filter(c => found.has(c.id))
  const sel = COMPONENTS.find(c => c.id === selected)
  const checklist = CHECKLIST.map(c => ({ ...c, done: c.dep.length === 0 ? inspected.size > 0 : c.dep.every(d => inspected.has(d)) }))

  return (
    <div className="h-full w-full flex flex-col md:flex-row gap-3 p-3 items-center md:items-start overflow-auto">

      {/* PAINEL */}
      <div className="glass rounded-xl p-3 flex-shrink-0">
        <div className="text-xs text-gray-400 uppercase tracking-widest font-industrial mb-2 text-center">
          {thermal ? '🌡️ CÂMERA TERMOGRÁFICA' : '👁️ INSPEÇÃO VISUAL'}
          {thermal && scanComp && (
            <span className="ml-2 text-white">— {scanComp.label}: <b style={{ color: flir(scanComp.heat) }}>{Math.round(20 + scanComp.heat * 80)}°C</b></span>
          )}
        </div>

        <div ref={boxRef} className="relative mx-auto" style={{ width: 320, height: 320, maxWidth: '88vw' }}
          onMouseMove={pointer} onMouseLeave={pointerEnd}
          onTouchStart={pointer} onTouchMove={pointer} onTouchEnd={pointerEnd}>

          {/* Estrutura do painel (SVG) */}
          <svg viewBox={`0 0 ${PW} ${PH}`} className="absolute inset-0 w-full h-full">
            <rect x="2" y="2" width={PW - 4} height={PH - 4} rx="8" fill="#0d0d2b" stroke="#00d4ff33" strokeWidth="2" />
            <rect x="30" y="85" width="300" height="6" fill="#00d4ff44" rx="2" />
            {[67, 137, 207, 277].map(x => <line key={x} x1={x} y1="91" x2={x} y2="110" stroke="#00d4ff33" strokeWidth="2" />)}
          </svg>

          {/* Mapa de calor por cima (modo térmico) */}
          {thermal && <canvas ref={canvasRef} width={320} height={320} className="absolute inset-0 w-full h-full rounded-lg pointer-events-none" style={{ mixBlendMode: 'screen' }} />}

          {/* Componentes */}
          {COMPONENTS.map(c => {
            const insp = inspected.has(c.id), isFound = found.has(c.id), isSel = selected === c.id
            const showVisualIssue = !thermal && c.issue && c.visible        // defeito visível a olho nu
            return (
              <button key={c.id} onClick={() => clickComp(c)}
                className={`absolute rounded flex items-center justify-center text-center border transition-all duration-150 ${isAdmin ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                style={{
                  left: `${(c.x / PW) * 100}%`, top: `${(c.y / PH) * 100}%`,
                  width: `${(c.w / PW) * 100}%`, height: `${(c.h / PH) * 100}%`,
                  background: thermal ? 'transparent'
                    : showVisualIssue ? 'rgba(245,158,11,0.18)'
                    : isFound ? 'rgba(239,68,68,0.22)'
                    : insp ? 'rgba(0,255,136,0.12)' : 'rgba(18,18,42,0.85)',
                  borderColor: isSel ? '#fff'
                    : thermal ? 'rgba(255,255,255,0.15)'
                    : showVisualIssue ? '#f59e0b'
                    : isFound ? '#ef4444'
                    : insp ? '#00ff88' : '#00d4ff22',
                  boxShadow: isSel ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
                  zIndex: isSel ? 5 : 1,
                }}>
                {!thermal && (
                  <span style={{ fontSize: 8, lineHeight: 1.05, color: showVisualIssue ? '#f59e0b' : isFound ? '#ef4444' : insp ? '#00ff88' : '#8aa' }}>
                    {c.label}
                  </span>
                )}
                {/* defeito visível a olho nu */}
                {showVisualIssue && <span className="absolute -top-1.5 -right-1.5 text-xs" style={{ animation: 'hotPulse 1.2s infinite' }}>⚠️</span>}
                {/* confirmado na inspeção */}
                {isFound && !c.visible && !thermal && <span className="absolute -top-1.5 -right-1.5 text-xs">🔴</span>}
                {insp && !isFound && !thermal && <span className="absolute -top-1.5 -right-1.5 text-[10px] text-neon-green">✓</span>}
              </button>
            )
          })}
        </div>

        {/* Controles admin */}
        {isAdmin && (
          <div className="flex gap-2 mt-3">
            <button onClick={toggleThermal}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-industrial font-bold tracking-widest touch-btn ${thermal ? 'bg-orange-900/60 border border-orange-500 text-orange-300' : 'glass text-gray-300'}`}>
              🌡️ {thermal ? 'VOLTAR AO VISUAL' : 'CÂMERA TÉRMICA'}
            </button>
            <button onClick={reset} className="py-2.5 px-3 rounded-lg text-xs font-industrial text-gray-400 glass touch-btn">↺</button>
          </div>
        )}
        {isAdmin && thermal && (
          <div className="text-xs text-gray-500 text-center mt-2 font-industrial">👆 arraste o dedo sobre o painel para escanear o calor</div>
        )}
      </div>

      {/* INFO */}
      <div className="flex-1 w-full flex flex-col gap-2.5 min-w-0">
        {/* Detalhe */}
        <div className="glass rounded-xl p-3 min-h-[72px]">
          {sel ? (
            <>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-industrial font-bold text-white">{sel.label}</span>
                {sel.issue && <span className="text-xs bg-red-900/60 border border-red-500 text-red-300 px-2 py-0.5 rounded-full font-industrial">{sel.issue}</span>}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">{sel.desc}</p>
              {sel.issue && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs font-industrial mb-1">
                    <span className="text-gray-400">Temperatura</span>
                    <span style={{ color: flir(sel.heat) }}>{Math.round(20 + sel.heat * 80)}°C</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full"><div className="h-1.5 rounded-full" style={{ width: `${sel.heat * 100}%`, background: flir(sel.heat) }} /></div>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-gray-500 font-industrial">{isAdmin ? '👆 Toque nos componentes para inspecionar' : 'Aguardando inspeção...'}</p>
          )}
        </div>

        {/* Falhas */}
        <div className="glass rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-industrial mb-2">Falhas — {foundIssues.length}/{issues.length}</div>
          {issues.map(c => (
            <div key={c.id} className={`flex items-center gap-2 py-1 border-b border-white/5 last:border-0 ${found.has(c.id) ? '' : 'opacity-40'}`}>
              <span className="text-sm">{found.has(c.id) ? '🔴' : '⬜'}</span>
              <div className="min-w-0">
                <div className="text-xs text-white font-industrial truncate">{c.label}</div>
                {found.has(c.id) && <div className="text-xs text-red-300">{c.issue} {!c.visible && '(oculto — só na térmica)'}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Checklist */}
        <div className="glass rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-industrial mb-2">Checklist</div>
          {checklist.map(it => (
            <div key={it.id} className="flex items-center gap-2 py-1">
              <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${it.done ? 'bg-green-500/20 border-green-500' : 'border-gray-600'}`}>
                {it.done && <span className="text-green-400 text-xs">✓</span>}
              </div>
              <span className={`text-xs font-industrial ${it.done ? 'text-green-400' : 'text-gray-500'}`}>{it.label}</span>
            </div>
          ))}
          <div className="mt-2 h-1.5 bg-gray-800 rounded-full">
            <div className="h-1.5 rounded-full bg-gradient-to-r from-electric to-neon-green transition-all duration-500"
              style={{ width: `${(checklist.filter(c => c.done).length / checklist.length) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}
