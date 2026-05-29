import { useEffect, useState, useRef } from 'react'
import { socket } from '../socket'
import { SLIDES } from '../data/slides'
import CameraStage from '../components/CameraStage'

export default function Viewer() {
  const [state, setState] = useState({ currentSlide: 0, simData: {} })
  const [connected, setConnected] = useState(false)
  const [dir, setDir] = useState(1)
  const prevSlide = useRef(0)

  useEffect(() => {
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('sync', (s) => {
      setDir(s.currentSlide >= prevSlide.current ? 1 : -1)
      prevSlide.current = s.currentSlide
      setState(s)
    })
    socket.on('sim-update', (data) => setState(prev => ({ ...prev, simData: data })))
    return () => { socket.off('connect'); socket.off('disconnect'); socket.off('sync'); socket.off('sim-update') }
  }, [])

  const idx = state.currentSlide
  const slide = SLIDES[idx]
  const total = SLIDES.length
  const isInv = slide?.section === 'inversor'

  return (
    <div className="h-screen w-screen bg-dark-bg flex flex-col overflow-hidden">
      {/* Barra superior */}
      <div className="h-10 flex-shrink-0 flex items-center justify-between px-6 border-b border-white/5 relative z-20 bg-dark-bg/40 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-neon-green' : 'bg-red-500'}`}
            style={{ boxShadow: connected ? '0 0 8px #00ff88' : '0 0 8px #ef4444' }} />
          <span className="text-xs text-gray-400 font-industrial">{connected ? 'Conectado' : 'Aguardando conexão...'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-industrial px-3 py-1 rounded-full"
            style={{ background: isInv ? '#00d4ff1a' : '#ff6b001a', color: isInv ? '#00d4ff' : '#ff6b00', border: `1px solid ${isInv ? '#00d4ff33' : '#ff6b0033'}` }}>
            {isInv ? '⚡ Inversor de Frequência' : '🔧 Manutenção Elétrica'}
          </span>
          <span className="text-xs text-gray-500 font-industrial tracking-widest">{idx + 1} / {total}</span>
        </div>
      </div>

      {/* Palco */}
      <div className="flex-1 relative overflow-hidden">
        <CameraStage slide={slide} dir={dir} isAdmin={false} simData={state.simData} onSimUpdate={() => {}} />
      </div>

      {/* Barra de progresso */}
      <div className="h-1 flex-shrink-0 bg-gray-900 relative z-20">
        <div className="h-full transition-all duration-500"
          style={{ width: `${((idx + 1) / total) * 100}%`, background: isInv ? 'linear-gradient(to right,#0080ff,#00d4ff)' : 'linear-gradient(to right,#ff4400,#ff6b00)' }} />
      </div>

      {/* Bolinhas */}
      <div className="h-8 flex-shrink-0 flex items-center justify-center gap-1.5 px-4 relative z-20 bg-dark-bg/40 backdrop-blur">
        {SLIDES.map((s, i) => (
          <div key={i} className="rounded-full transition-all duration-300"
            style={{ width: i === idx ? 20 : 6, height: 6,
              background: i === idx ? (s.section === 'inversor' ? '#00d4ff' : '#ff6b00') : i < idx ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>
    </div>
  )
}
