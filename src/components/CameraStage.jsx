import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import Scene from '../scenes/Scene'
import SlideRenderer from './SlideRenderer'

// Une a CENA de fundo + o conteúdo do slide e faz a transição de CÂMERA
// (dolly/zoom para frente ao avançar) com o conteúdo "subindo" como scroll.
export default function CameraStage({ slide, dir = 1, isAdmin, simData, onSimUpdate }) {
  const camRef = useRef(null)
  const contentRef = useRef(null)

  useLayoutEffect(() => {
    const cam = camRef.current
    const content = contentRef.current
    if (!cam) return
    const ctx = gsap.context(() => {
      // Câmera: avança = zoom de dentro (1.14→1); volta = recua (0.9→1)
      gsap.fromTo(cam,
        { scale: dir >= 0 ? 1.14 : 0.9, opacity: 0.35, filter: 'blur(6px)' },
        { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' })
      // Conteúdo sobe (sensação de rolar a página para o próximo setor)
      if (content) {
        gsap.fromTo(content,
          { y: dir >= 0 ? 80 : -80, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', delay: 0.15 })
      }
    })
    return () => ctx.revert()
  }, [slide.id, dir])

  return (
    <div ref={camRef} className="absolute inset-0" style={{ transformOrigin: '50% 56%', willChange: 'transform' }}>
      <Scene sceneKey={slide.scene} />
      <div ref={contentRef} className="absolute inset-0 z-10">
        <SlideRenderer slide={slide} isAdmin={isAdmin} simData={simData} onSimUpdate={onSimUpdate} />
      </div>
    </div>
  )
}
