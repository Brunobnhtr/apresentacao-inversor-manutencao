import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import Scene from '../scenes/Scene'
import Background3DBoundary from '../three/Background3DBoundary'
import SlideRenderer from './SlideRenderer'
import { hasWebGL } from '../three/webgl'

// Une o FUNDO (3D WebGL no projetor / 2.5D leve no celular) + o conteúdo do slide.
// O conteúdo "vem da profundidade" em direção à tela (câmera andando pra frente).
export default function CameraStage({ slide, index = 0, dir = 1, isAdmin, simData, onSimUpdate, lite = false }) {
  const sceneRef = useRef(null)
  const contentRef = useRef(null)
  const use3D = !lite && hasWebGL()

  useLayoutEffect(() => {
    const ct = contentRef.current
    const sc = sceneRef.current
    const fwd = dir >= 0
    const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })

    // Fundo 2.5D (fallback/celular): scroll vertical. No 3D o fundo se move sozinho.
    if (sc) tl.fromTo(sc,
      { yPercent: fwd ? 55 : -55, scale: 1.12, opacity: 0.35 },
      { yPercent: 0, scale: 1, opacity: 1, duration: 0.95, ease: 'power2.out' }, 0)

    // Conteúdo: aproxima-se da câmera (profundidade Z) — leve, sem blur (suave em PC fraco)
    if (ct) tl.fromTo(ct,
      { z: fwd ? -750 : 380, y: fwd ? 50 : -50, opacity: 0 },
      { z: 0, y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0.05)

    return () => tl.kill()
  }, [slide.id, dir])

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ perspective: '1500px' }}>
      <div className="absolute inset-0">
        {use3D
          ? <Background3DBoundary index={index} sceneKey={slide.scene} />
          : <div ref={sceneRef} className="absolute inset-0 gpu"><Scene sceneKey={slide.scene} /></div>}
      </div>
      <div ref={contentRef} className="absolute inset-0 z-10 gpu">
        <SlideRenderer slide={slide} isAdmin={isAdmin} simData={simData} onSimUpdate={onSimUpdate} />
      </div>
    </div>
  )
}
