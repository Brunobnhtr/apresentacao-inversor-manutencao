import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Scene from '../scenes/Scene'
import Background3DBoundary from '../three/Background3DBoundary'
import SlideRenderer from './SlideRenderer'
import { hasWebGL } from '../three/webgl'
import { TRAVEL_MS } from '../three/path'

// Fundo (corredor 3D / 2.5D) + conteúdo. As LETRAS somem ao sair andando e
// só CARREGAM ao chegar no próximo setor (sincronizado com a caminhada).
export default function CameraStage({ slide, index = 0, dir = 1, isAdmin, simData, onSimUpdate, lite = false }) {
  const sceneRef = useRef(null)
  const contentRef = useRef(null)
  const shownRef = useRef(slide)
  const first = useRef(true)
  const use3D = !lite && hasWebGL()
  const [shown, setShown] = useState(slide)

  // slide mudou: fundo 2.5D faz scroll + texto antigo some; depois troca o conteúdo
  useLayoutEffect(() => {
    if (slide.id === shownRef.current.id) return
    const ct = contentRef.current
    const sc = sceneRef.current
    const fwd = dir >= 0
    if (sc) gsap.fromTo(sc, { yPercent: fwd ? 55 : -55, scale: 1.12, opacity: 0.35 },
      { yPercent: 0, scale: 1, opacity: 1, duration: 1.1, ease: 'power2.out' })
    gsap.to(ct, {
      opacity: 0, z: -180, duration: 0.5, ease: 'power2.in', overwrite: 'auto',
      onComplete: () => { shownRef.current = slide; setShown(slide) },
    })
  }, [slide.id, dir])

  // conteúdo novo montou (ao chegar): carrega vindo da profundidade
  useLayoutEffect(() => {
    const ct = contentRef.current
    if (!ct) return
    const delay = first.current ? 0.2 : Math.max(0, TRAVEL_MS / 1000 - 1.25)
    first.current = false
    gsap.fromTo(ct, { opacity: 0, z: -700, y: 40 },
      { opacity: 1, z: 0, y: 0, duration: 0.85, ease: 'power3.out', delay, overwrite: 'auto' })
  }, [shown.id])

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ perspective: '1500px' }}>
      <div className="absolute inset-0">
        {use3D
          ? <Background3DBoundary index={index} sceneKey={slide.scene} />
          : <div ref={sceneRef} className="absolute inset-0 gpu"><Scene sceneKey={slide.scene} /></div>}
      </div>
      <div ref={contentRef} className="absolute inset-0 z-10 gpu">
        <SlideRenderer slide={shown} isAdmin={isAdmin} simData={simData} onSimUpdate={onSimUpdate} />
      </div>
    </div>
  )
}
