// Detecta suporte a WebGL uma única vez (pra decidir 3D vs fallback 2.5D)
let cached = null

export function hasWebGL() {
  if (cached !== null) return cached
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    // exige WebGL + ao menos 2 núcleos (evita travar máquinas muito fracas)
    const cores = navigator.hardwareConcurrency || 4
    cached = !!gl && cores >= 2
  } catch {
    cached = false
  }
  return cached
}
