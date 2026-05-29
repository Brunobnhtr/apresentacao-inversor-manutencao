import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { socket } from '../socket'
import { SLIDES } from '../data/slides'
import SlideRenderer from '../components/SlideRenderer'

export default function Viewer() {
  const [state, setState] = useState({ currentSlide: 0, simData: {} })
  const [connected, setConnected] = useState(false)
  const [dir, setDir] = useState(1)

  useEffect(() => {
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('sync', (s) => {
      setState(prev => {
        setDir(s.currentSlide >= prev.currentSlide ? 1 : -1)
        return s
      })
    })

    socket.on('sim-update', (data) => {
      setState(prev => ({ ...prev, simData: data }))
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('sync')
      socket.off('sim-update')
    }
  }, [])

  const slide = SLIDES[state.currentSlide]
  const total = SLIDES.length
  const idx = state.currentSlide

  const slideVariants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 80 : -80 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -80 : 80, transition: { duration: 0.3 } }),
  }

  return (
    <div className="h-screen w-screen bg-dark-bg flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="h-10 flex-shrink-0 flex items-center justify-between px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-neon-green' : 'bg-red-500'}`}
            style={{ boxShadow: connected ? '0 0 8px #00ff88' : '0 0 8px #ef4444' }} />
          <span className="text-xs text-gray-500 font-industrial">
            {connected ? 'Conectado — Aguardando apresentador' : 'Aguardando conexão...'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Section indicator */}
          <span className="text-xs font-industrial px-3 py-1 rounded-full"
            style={{
              background: slide?.section === 'inversor' ? 'rgba(0,212,255,0.1)' : 'rgba(255,107,0,0.1)',
              color: slide?.section === 'inversor' ? '#00d4ff' : '#ff6b00',
              border: `1px solid ${slide?.section === 'inversor' ? '#00d4ff33' : '#ff6b0033'}`
            }}>
            {slide?.section === 'inversor' ? '⚡ Inversor de Frequência' : '🔧 Manutenção Elétrica'}
          </span>

          {/* Slide counter */}
          <span className="text-xs text-gray-600 font-industrial tracking-widest">
            {idx + 1} / {total}
          </span>
        </div>
      </div>

      {/* Main slide area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence custom={dir} mode="wait">
          <motion.div
            key={idx}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <SlideRenderer
              slide={slide}
              isAdmin={false}
              simData={state.simData}
              onSimUpdate={() => {}}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom progress bar */}
      <div className="h-1 flex-shrink-0 bg-gray-900">
        <motion.div
          className="h-full"
          style={{ background: slide?.section === 'inversor' ? 'linear-gradient(to right, #0080ff, #00d4ff)' : 'linear-gradient(to right, #ff4400, #ff6b00)' }}
          animate={{ width: `${((idx + 1) / total) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Slide dots */}
      <div className="h-8 flex-shrink-0 flex items-center justify-center gap-1.5 px-4">
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === idx ? 20 : 6,
              height: 6,
              background: i === idx
                ? (s.section === 'inversor' ? '#00d4ff' : '#ff6b00')
                : i < idx
                ? 'rgba(255,255,255,0.3)'
                : 'rgba(255,255,255,0.1)'
            }}
          />
        ))}
      </div>
    </div>
  )
}
