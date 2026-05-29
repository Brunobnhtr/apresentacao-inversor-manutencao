import { useState, useEffect, useCallback } from 'react'

const COMPONENTS = [
  { id: 'breaker_main', label: 'DJ Principal', x: 180, y: 40, w: 60, h: 40, issue: null, heat: 0.2, desc: 'Disjuntor geral 200A. Sem anomalias detectadas.' },
  { id: 'breaker_1', label: 'DJ 1 – Motor A', x: 60, y: 130, w: 50, h: 35, issue: 'SOBRECARGA', heat: 0.85, desc: '⚠️ Corrente acima do nominal! Relé térmico atuando. Verificar motor.' },
  { id: 'breaker_2', label: 'DJ 2 – Motor B', x: 130, y: 130, w: 50, h: 35, issue: null, heat: 0.3, desc: 'Disjuntor 32A. Operação normal.' },
  { id: 'breaker_3', label: 'DJ 3 – HVAC', x: 200, y: 130, w: 50, h: 35, issue: null, heat: 0.25, desc: 'Disjuntor 25A. Operação normal.' },
  { id: 'breaker_4', label: 'DJ 4 – Ilum.', x: 270, y: 130, w: 50, h: 35, issue: null, heat: 0.15, desc: 'Disjuntor 16A. Operação normal.' },
  { id: 'contactor_1', label: 'Contator KM1', x: 60, y: 210, w: 55, h: 40, issue: 'SUPERAQUECIMENTO', heat: 0.95, desc: '🔥 CRÍTICO: Temperatura 85°C! Contato oxidado causando arco elétrico.' },
  { id: 'contactor_2', label: 'Contator KM2', x: 140, y: 210, w: 55, h: 40, issue: null, heat: 0.35, desc: 'Contator 40A. Contatos em bom estado.' },
  { id: 'relay_1', label: 'Relé FR1', x: 220, y: 210, w: 55, h: 40, issue: null, heat: 0.28, desc: 'Relé de falta de fase. Calibrado em 25A. OK.' },
  { id: 'terminal', label: 'Régua de bornes', x: 90, y: 295, w: 150, h: 28, issue: 'FOLGA', heat: 0.6, desc: '⚠️ Terminal T3 com aperto insuficiente. Risco de aquecimento progressivo.' },
  { id: 'cable_1', label: 'Cabo 16mm²', x: 260, y: 270, w: 70, h: 20, issue: null, heat: 0.22, desc: 'Cabo de alimentação. Isolamento íntegro.' },
]

const CHECKLIST = [
  { id: 'visual', label: 'Inspeção visual geral', dep: [] },
  { id: 'breakers', label: 'Verificar disjuntores', dep: ['breaker_main', 'breaker_1', 'breaker_2', 'breaker_3', 'breaker_4'] },
  { id: 'contactors', label: 'Inspecionar contatores', dep: ['contactor_1', 'contactor_2'] },
  { id: 'relays', label: 'Checar relés de proteção', dep: ['relay_1'] },
  { id: 'terminals', label: 'Verificar bornes e fixações', dep: ['terminal', 'cable_1'] },
]

function heatToColor(heat, alpha = 0.6) {
  if (heat < 0.3) return `rgba(0, 100, 255, ${alpha})`
  if (heat < 0.5) return `rgba(0, 200, 100, ${alpha})`
  if (heat < 0.7) return `rgba(255, 200, 0, ${alpha})`
  if (heat < 0.85) return `rgba(255, 100, 0, ${alpha})`
  return `rgba(255, 30, 30, ${alpha})`
}

export default function MaintenanceSim({ isAdmin, simData, onUpdate }) {
  const [inspected, setInspected] = useState(new Set(simData?.inspected ?? []))
  const [thermal, setThermal] = useState(simData?.thermalMode ?? false)
  const [selected, setSelected] = useState(null)
  const [found, setFound] = useState(new Set())

  useEffect(() => {
    if (!isAdmin) {
      if (simData?.inspected) setInspected(new Set(simData.inspected))
      if (simData?.thermalMode !== undefined) setThermal(simData.thermalMode)
    }
  }, [simData, isAdmin])

  const handleClick = useCallback((comp) => {
    if (!isAdmin) return
    const next = new Set(inspected)
    next.add(comp.id)
    if (comp.issue) setFound(f => new Set([...f, comp.id]))
    setInspected(next)
    setSelected(comp)
    onUpdate({ inspected: [...next], thermalMode: thermal })
  }, [inspected, isAdmin, thermal, onUpdate])

  const handleThermal = useCallback(() => {
    const next = !thermal
    setThermal(next)
    if (isAdmin) onUpdate({ thermalMode: next, inspected: [...inspected] })
  }, [thermal, isAdmin, inspected, onUpdate])

  const handleReset = useCallback(() => {
    setInspected(new Set())
    setFound(new Set())
    setSelected(null)
    if (isAdmin) onUpdate({ inspected: [], thermalMode: false })
  }, [isAdmin, onUpdate])

  const issues = COMPONENTS.filter(c => c.issue)
  const foundIssues = COMPONENTS.filter(c => c.issue && found.has(c.id))

  const checklistDone = CHECKLIST.map(c => ({
    ...c,
    done: c.dep.length === 0
      ? inspected.size > 0
      : c.dep.every(d => inspected.has(d))
  }))

  return (
    <div className="h-full w-full flex gap-3 p-3 items-start">

      {/* Panel SVG */}
      <div className="glass rounded-xl p-3 flex-shrink-0">
        <div className="text-xs text-gray-400 uppercase tracking-widest font-industrial mb-2 text-center">
          Painel Elétrico Industrial — {thermal ? '🌡️ CÂMERA TÉRMICA' : '👁️ VISUAL'}
        </div>
        <div className="relative" style={{ width: 360, height: 350 }}>
          {/* Panel background */}
          <svg width="360" height="350" className="absolute inset-0">
            <rect x="0" y="0" width="360" height="350" rx="8" fill="#0d0d2b" stroke="#00d4ff33" strokeWidth="2"/>
            {/* Bus bar */}
            <rect x="40" y="95" width="280" height="6" fill="#00d4ff44" rx="2"/>
            <rect x="40" y="101" width="280" height="2" fill="#00d4ff22" rx="1"/>
            {/* Vertical feeders */}
            {[85, 155, 225, 295].map(x => (
              <line key={x} x1={x} y1="101" x2={x} y2="130" stroke="#00d4ff33" strokeWidth="2"/>
            ))}
            {/* From breakers to contactors */}
            <line x1="87" y1="165" x2="87" y2="210" stroke="#00d4ff22" strokeWidth="2"/>
            <line x1="167" y1="165" x2="167" y2="210" stroke="#00d4ff22" strokeWidth="2"/>
            {/* To terminals */}
            <line x1="165" y1="250" x2="165" y2="295" stroke="#00d4ff22" strokeWidth="2"/>
          </svg>

          {/* Clickable components */}
          {COMPONENTS.map(comp => {
            const isInsp = inspected.has(comp.id)
            const isSel = selected?.id === comp.id
            const hasIssue = !!comp.issue
            const isFound = found.has(comp.id)

            return (
              <button
                key={comp.id}
                onClick={() => handleClick(comp)}
                className={`absolute rounded transition-all duration-200 border flex items-center justify-center text-center ${
                  isAdmin ? 'cursor-pointer hover:scale-105 touch-btn' : 'cursor-default'
                }`}
                style={{
                  left: comp.x, top: comp.y, width: comp.w, height: comp.h,
                  background: thermal
                    ? heatToColor(comp.heat, 0.8)
                    : isFound
                    ? 'rgba(239,68,68,0.3)'
                    : isInsp
                    ? 'rgba(0,255,136,0.15)'
                    : 'rgba(18,18,42,0.9)',
                  borderColor: isSel
                    ? '#fff'
                    : thermal
                    ? heatToColor(comp.heat, 1)
                    : isFound
                    ? '#ef4444'
                    : isInsp
                    ? '#00ff88'
                    : hasIssue && !thermal
                    ? '#ff6b0055'
                    : '#00d4ff22',
                  boxShadow: isSel ? '0 0 12px rgba(255,255,255,0.4)' : thermal ? `0 0 8px ${heatToColor(comp.heat, 0.5)}` : 'none'
                }}
              >
                <span style={{ fontSize: '8px', lineHeight: '1.1', color: thermal ? '#fff' : isFound ? '#ef4444' : isInsp ? '#00ff88' : '#8899bb' }}>
                  {comp.label}
                </span>
                {isFound && !thermal && (
                  <span className="absolute -top-1 -right-1 text-xs">⚠️</span>
                )}
                {isInsp && !isFound && !thermal && (
                  <span className="absolute -top-1 -right-1 text-xs" style={{ fontSize: '10px' }}>✓</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Admin controls */}
        {isAdmin && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleThermal}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-industrial font-bold tracking-widest transition-all touch-btn ${
                thermal
                  ? 'bg-orange-900/60 border border-orange-500 text-orange-400'
                  : 'glass border-gray-600 text-gray-400 hover:border-electric hover:text-electric'
              }`}
            >
              🌡️ {thermal ? 'DESATIVAR TÉRMICA' : 'CÂMERA TÉRMICA'}
            </button>
            <button onClick={handleReset}
              className="py-2 px-3 rounded-lg text-xs font-industrial text-gray-500 glass border-gray-700 touch-btn">
              ↺ Reset
            </button>
          </div>
        )}
      </div>

      {/* Right panel: detail + checklist */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">

        {/* Component detail */}
        <div className="glass rounded-xl p-3 min-h-[80px]">
          {selected ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-industrial font-bold text-white">{selected.label}</span>
                {selected.issue && (
                  <span className="text-xs bg-red-900/60 border border-red-500 text-red-400 px-2 py-0.5 rounded-full font-industrial">
                    {selected.issue}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{selected.desc}</p>
              {selected.issue && (
                <div className="mt-2 text-xs text-red-400 font-industrial">
                  Temperatura: {Math.round(selected.heat * 100)}°C
                  <div className="mt-1 h-1.5 bg-gray-800 rounded-full">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${selected.heat * 100}%`, background: heatToColor(selected.heat, 1) }} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-gray-600 font-industrial">
              {isAdmin ? '👆 Clique nos componentes do painel para inspecionar' : 'Aguardando inspeção...'}
            </p>
          )}
        </div>

        {/* Issue tracker */}
        <div className="glass rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-industrial mb-2">
            Falhas Detectadas — {foundIssues.length}/{issues.length}
          </div>
          {issues.map(c => (
            <div key={c.id} className={`flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0 ${found.has(c.id) ? '' : 'opacity-40'}`}>
              <span className="text-sm">{found.has(c.id) ? '🔴' : '⬜'}</span>
              <div>
                <div className="text-xs text-white font-industrial">{c.label}</div>
                {found.has(c.id) && <div className="text-xs text-red-400">{c.issue}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Checklist */}
        <div className="glass rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-industrial mb-2">Checklist de Inspeção</div>
          {checklistDone.map(item => (
            <div key={item.id} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
              <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                item.done ? 'bg-green-500/20 border-green-500' : 'border-gray-600'
              }`}>
                {item.done && <span className="text-green-400 text-xs">✓</span>}
              </div>
              <span className={`text-xs font-industrial ${item.done ? 'text-green-400' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </div>
          ))}
          <div className="mt-2 h-1.5 bg-gray-800 rounded-full">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-electric to-neon-green transition-all duration-500"
              style={{ width: `${(checklistDone.filter(c => c.done).length / checklistDone.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
