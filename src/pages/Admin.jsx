import { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react'
import { socket } from '../socket'
import { SLIDES } from '../data/slides'
import CameraStage from '../components/CameraStage'
import SlideRenderer from '../components/SlideRenderer'

export default function Admin() {
  const [state, setState] = useState({ currentSlide: 0, simData: {} })
  const [connected, setConnected] = useState(false)
  const [showList, setShowList] = useState(false)
  const [dir, setDir] = useState(1)
  const touchStartX = useRef(null)
  const prevSlide = useRef(0)

  useEffect(() => {
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('sync', (s) => { setState(s); prevSlide.current = s.currentSlide })
    return () => { socket.off('connect'); socket.off('disconnect'); socket.off('sync') }
  }, [])

  const goTo = useCallback((i) => {
    if (i < 0 || i >= SLIDES.length) return
    setDir(i >= prevSlide.current ? 1 : -1)
    prevSlide.current = i
    const next = { ...state, currentSlide: i }
    setState(next)
    socket.emit('control', next)
    setShowList(false)
  }, [state])

  const prev = useCallback(() => goTo(state.currentSlide - 1), [goTo, state.currentSlide])
  const next = useCallback(() => goTo(state.currentSlide + 1), [goTo, state.currentSlide])

  const handleSimUpdate = useCallback((data) => {
    setState(s => {
      const merged = { ...s.simData, ...data }
      socket.emit('sim-update', merged)
      return { ...s, simData: merged }
    })
  }, [])

  // Swipe (só fora de slide de simulação, pra não atrapalhar o toque na simulação)
  const slide = SLIDES[state.currentSlide]
  const isSim = slide?.type === 'simulation'
  const onTouchStart = (e) => { if (!isSim) touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(dx) > 60) (dx > 0 ? next : prev)()
    touchStartX.current = null
  }

  const idx = state.currentSlide
  const total = SLIDES.length
  const isInv = slide?.section === 'inversor'

  return (
    <div className="h-screen w-screen bg-dark-bg flex flex-col overflow-hidden select-none" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Header */}
      <div className="h-12 flex-shrink-0 glass flex items-center justify-between px-4 border-b border-white/10 z-30">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-neon-green animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs font-industrial text-gray-400">{connected ? 'ADMIN' : 'OFFLINE'}</span>
        </div>
        <div className="text-sm font-industrial font-bold" style={{ color: isInv ? '#00d4ff' : '#ff6b00' }}>{idx + 1} / {total}</div>
        <button onClick={() => setShowList(v => !v)} className="text-xs font-industrial text-gray-300 glass px-3 py-1.5 rounded-lg touch-btn">
          {showList ? '✕' : '☰ Slides'}
        </button>
      </div>

      {/* Lista de slides */}
      {showList && (
        <div className="absolute inset-0 z-40 bg-dark-bg/95 backdrop-blur flex flex-col pt-14">
          <div className="flex-1 overflow-y-auto">
            {SLIDES.map((s, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-b border-white/5 text-left touch-btn ${i === idx ? 'bg-white/5' : ''}`}>
                <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-industrial font-bold flex-shrink-0"
                  style={{ background: i === idx ? (s.section === 'inversor' ? '#00d4ff22' : '#ff6b0022') : 'transparent', color: i === idx ? (s.section === 'inversor' ? '#00d4ff' : '#ff6b00') : '#666' }}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-industrial truncate ${i === idx ? 'text-white' : 'text-gray-500'}`}>{s.title || s.name}</div>
                  <div className="text-xs" style={{ color: s.section === 'inversor' ? '#00d4ff66' : '#ff6b0066' }}>{s.section === 'inversor' ? '⚡ Inversor' : '🔧 Manutenção'}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Corpo: simulação em tamanho cheio OU prévia 16:9 */}
      <div className="flex-1 overflow-hidden relative">
        {isSim ? (
          <div className="absolute inset-0 overflow-auto bg-dark-bg">
            <SlideRenderer slide={slide} isAdmin={true} simData={state.simData} onSimUpdate={handleSimUpdate} />
          </div>
        ) : (
          <Preview slide={slide} dir={dir} simData={state.simData} onSimUpdate={handleSimUpdate} />
        )}
      </div>

      {/* Controles */}
      <div className="flex-shrink-0 glass border-t border-white/10 p-3 z-30">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-base">{isInv ? '⚡' : '🔧'}</span>
          <span className="text-sm font-industrial text-white truncate">{slide?.title || slide?.name}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={prev} disabled={idx === 0}
            className="flex-1 h-14 rounded-xl text-base font-industrial font-bold touch-btn disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa' }}>← Anterior</button>
          <button onClick={next} disabled={idx === total - 1}
            className="h-14 px-8 rounded-xl text-base font-industrial font-bold touch-btn disabled:opacity-30"
            style={{ flex: 2,
              background: isInv ? 'linear-gradient(135deg,rgba(0,80,160,0.7),rgba(0,150,200,0.5))' : 'linear-gradient(135deg,rgba(160,40,0,0.7),rgba(255,107,0,0.5))',
              border: `1px solid ${isInv ? '#00d4ff66' : '#ff6b0066'}`, color: isInv ? '#00d4ff' : '#ff6b00', boxShadow: `0 0 20px ${isInv ? '#00d4ff33' : '#ff6b0033'}` }}>Próximo →</button>
        </div>
        <div className="mt-2 flex items-center gap-1 justify-center flex-wrap">
          {SLIDES.map((s, i) => (
            <button key={i} onClick={() => goTo(i)} className="rounded-full transition-all touch-btn"
              style={{ width: i === idx ? 16 : 5, height: 5, background: i === idx ? (s.section === 'inversor' ? '#00d4ff' : '#ff6b00') : i < idx ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Prévia 16:9 escalada (mostra exatamente o que o professor vê)
function Preview({ slide, dir, simData, onSimUpdate }) {
  const boxRef = useRef(null)
  const innerRef = useRef(null)

  useLayoutEffect(() => {
    const fit = () => {
      const box = boxRef.current, inner = innerRef.current
      if (!box || !inner) return
      const scale = Math.min(box.clientWidth / 1280, box.clientHeight / 720)
      inner.style.transform = `translate(-50%, -50%) scale(${scale})`
    }
    fit()
    const ro = new ResizeObserver(fit)
    if (boxRef.current) ro.observe(boxRef.current)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={boxRef} className="absolute inset-0 flex items-center justify-center p-2">
      <div className="relative w-full h-full">
        <div ref={innerRef} className="absolute left-1/2 top-1/2 overflow-hidden rounded-xl border border-white/10"
          style={{ width: 1280, height: 720, transformOrigin: 'center center' }}>
          <CameraStage slide={slide} dir={dir} isAdmin={true} lite simData={simData} onSimUpdate={onSimUpdate} />
        </div>
      </div>
    </div>
  )
}
