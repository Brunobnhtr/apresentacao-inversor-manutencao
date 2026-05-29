import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Viewer from './pages/Viewer'
import Admin from './pages/Admin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Viewer />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  )
}
