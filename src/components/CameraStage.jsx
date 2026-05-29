import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import Scene from '../scenes/Scene'
import SlideRenderer from './SlideRenderer'

// Une CENA de fundo + conteúdo e faz a transição estilo "scroll para o próximo setor":
// o cenário sobe (com leve dolly/zoom) e o conteúdo sobe mais rápido por cima (parallax).
// IMPORTANTE: sem prop `style` nos wrappers — assim o React não sobrescreve o transform do GSAP.
export default function CameraStage({ slide, dir = 1, isAdmin, simData, onSimUpdate }) {
  const sceneRef = useRef(null)
  const contentRef = useRef(null)

  useLayoutEffect(() => {
    const sc = sceneRef.current
    const ct = contentRef.current
    const fwd = dir >= 0
    const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })

    // Cenário de fundo: entra deslizando de baixo (ou de cima ao voltar) + leve zoom
    if (sc) tl.fromTo(sc,
      { yPercent: fwd ? 55 : -55, scale: 1.12, opacity: 0.35 },
      { yPercent: 0, scale: 1, opacity: 1, duration: 0.95, ease: 'power2.out' }, 0)

    // Conteúdo: sobe MAIS (mais rápido) que o fundo => sensação de profundidade/parallax
    if (ct) tl.fromTo(ct,
      { yPercent: fwd ? 115 : -115, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.75, ease: 'power3.out' }, 0.06)

    return () => tl.kill()
  }, [slide.id, dir])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div ref={sceneRef} className="absolute inset-0 gpu">
        <Scene sceneKey={slide.scene} />
      </div>
      <div ref={contentRef} className="absolute inset-0 z-10 gpu">
        <SlideRenderer slide={slide} isAdmin={isAdmin} simData={simData} onSimUpdate={onSimUpdate} />
      </div>
    </div>
  )
}
