import { useEffect, useState, useRef, useCallback } from 'react'
import { socket } from '../socket'
import { SLIDES } from '../data/slides'
import SlideRenderer from '../components/SlideRenderer'

export default function Admin() {
  const [state, setState] = useState({ currentSlide: 0, simData: {} })
  const [connected, setConnected] = useState(false)
  const [showList, setShowList] = useState(false)
  const touchStartX = useRef(null)

  useEffect(() => {
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('sync', (s) => setState(s))
    return () => { socket.off('connect'); socket.off('disconnect'); socket.off('sync') }
  }, [])

  const goTo = useCallback((idx) => {
    if (idx < 0 || idx >= SLIDES.length) return
    const next = { ...state, currentSlide: idx }
    setState(next)
    socket.emit('control', next)
    setShowList(false)
  }, [state])

  const prev = useCallback(() => goTo(state.currentSlide - 1), [goTo, state.currentSlide])
  const next = useCallback(() => goTo(state.currentSlide + 1), [goTo, state.currentSlide])

  const handleSimUpdate = useCallback((data) => {
    const next = { ...state.simData, ...data }
    setState(s => ({ ...s, simData: next }))
    socket.emit('sim-update', next)
  }, [state.simData])

  // Swipe gesture
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(dx) > 50) { dx > 0 ? next() : prev() }
    touchStartX.current = null
  }

  const slide = SLIDES[state.currentSlide]
  const idx = state.currentSlide
  const total = SLIDES.length

  return (
    <div
      className="h-screen w-screen bg-dark-bg flex flex-col overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="h-12 flex-shrink-0 glass flex items-center justify-between px-4 gap-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-neon-green animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs font-industrial text-gray-400">{connected ? 'ADMIN CONECTADO' : 'OFFLINE'}</span>
        </div>
        <div className="text-sm font-industrial font-bold text-electric">{idx + 1} / {total}</div>
        <button
          onClick={() => setShowList(v => !v)}
          className="text-xs font-industrial text-gray-400 glass px-3 py-1.5 rounded-lg border-gray-700 touch-btn"
        >
          {showList ? '✕ Fechar' : '☰ Slides'}
        </button>
      </div>

      {/* Slide list overlay */}
      {showList && (
        <div className="absolute inset-0 z-50 glass flex flex-col pt-14 overflow-hidden">
          <div className="px-4 py-2 border-b border-white/10">
            <div className="text-xs font-industrial text-gray-400 uppercase tracking-widest">Navegar para slide</div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {SLIDES.map((s, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-b border-white/5 text-left touch-btn ${i === idx ? 'bg-white/5' : ''}`}
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-xs font-industrial font-bold flex-shrink-0"
                  style={{
                    background: i === idx ? (s.section === 'inversor' ? '#00d4ff22' : '#ff6b0022') : 'transparent',
                    color: i === idx ? (s.section === 'inversor' ? '#00d4ff' : '#ff6b00') : '#666'
                  }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-industrial truncate ${i === idx ? 'text-white' : 'text-gray-500'}`}>
                    {s.title}
                  </div>
                  <div className="text-xs" style={{ color: s.section === 'inversor' ? '#00d4ff66' : '#ff6b0066' }}>
                    {s.section === 'inversor' ? '⚡ Inversor' : '🔧 Manutenção'}
                  </div>
                </div>
                {i === idx && <div className="w-1.5 h-1.5 rounded-full bg-electric flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preview of current slide (scaled down) */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center p-3">
          <div
            className="relative rounded-xl overflow-hidden border border-white/10"
            style={{ width: '100%', height: '100%', maxWidth: '500px' }}
          >
            <div
              className="absolute origin-top-left"
              style={{
                width: '1280px',
                height: '720px',
                transform: 'scale(var(--preview-scale))',
              }}
            >
              <SlideRenderer
                slide={slide}
                isAdmin={true}
                simData={state.simData}
                onSimUpdate={handleSimUpdate}
              />
            </div>
            <PreviewScaler />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 glass border-t border-white/10 p-4">
        {/* Slide info */}
        <div className="mb-3 flex items-center gap-2">
          <div
            className="px-2 py-0.5 rounded-full text-xs font-industrial"
            style={{
              background: slide?.section === 'inversor' ? 'rgba(0,212,255,0.1)' : 'rgba(255,107,0,0.1)',
              color: slide?.section === 'inversor' ? '#00d4ff' : '#ff6b00',
              border: `1px solid ${slide?.section === 'inversor' ? '#00d4ff33' : '#ff6b0033'}`
            }}
          >
            {slide?.section === 'inversor' ? '⚡' : '🔧'}
          </div>
          <span className="text-sm font-industrial text-white truncate">{slide?.title}</span>
        </div>

        {/* Nav buttons */}
        <div className="flex gap-3">
          <button
            onClick={prev}
            disabled={idx === 0}
            className="flex-1 h-14 rounded-xl text-lg font-industrial font-bold transition-all touch-btn disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa' }}
          >
            ← Anterior
          </button>
          <button
            onClick={next}
            disabled={idx === total - 1}
            className="flex-2 h-14 px-8 rounded-xl text-lg font-industrial font-bold transition-all touch-btn disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              flex: 2,
              background: slide?.section === 'inversor'
                ? 'linear-gradient(135deg, rgba(0,80,160,0.6), rgba(0,150,200,0.4))'
                : 'linear-gradient(135deg, rgba(160,40,0,0.6), rgba(255,107,0,0.4))',
              border: `1px solid ${slide?.section === 'inversor' ? '#00d4ff44' : '#ff6b0044'}`,
              color: slide?.section === 'inversor' ? '#00d4ff' : '#ff6b00',
              boxShadow: `0 0 20px ${slide?.section === 'inversor' ? 'rgba(0,212,255,0.15)' : 'rgba(255,107,0,0.15)'}`,
            }}
          >
            Próximo →
          </button>
        </div>

        {/* Progress dots */}
        <div className="mt-3 flex items-center gap-1 justify-center overflow-x-auto">
          {SLIDES.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="flex-shrink-0 rounded-full transition-all duration-300 touch-btn"
              style={{
                width: i === idx ? 16 : 5,
                height: 5,
                background: i === idx
                  ? (s.section === 'inversor' ? '#00d4ff' : '#ff6b00')
                  : i < idx ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Scales the preview div to fit container
function PreviewScaler() {
  useEffect(() => {
    function update() {
      const el = document.querySelector('[style*="1280px"]')
      if (!el || !el.parentElement) return
      const parent = el.parentElement
      const scaleX = parent.clientWidth / 1280
      const scaleY = parent.clientHeight / 720
      const scale = Math.min(scaleX, scaleY)
      el.style.setProperty('transform', `scale(${scale})`)
      el.parentElement.style.setProperty('--preview-scale', scale)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return null
}
