import { Component, Suspense, lazy } from 'react'
import Scene from '../scenes/Scene'

const Scene3D = lazy(() => import('./Scene3D'))

// Se o WebGL falhar em runtime, cai automaticamente pro cenário 2.5D.
export default class Background3DBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err) {
    console.warn('WebGL falhou, usando fallback 2.5D:', err?.message)
  }
  render() {
    if (this.state.failed) {
      return <Scene sceneKey={this.props.sceneKey} />
    }
    return (
      <Suspense fallback={<Scene sceneKey={this.props.sceneKey} />}>
        <Scene3D index={this.props.index} />
      </Suspense>
    )
  }
}
