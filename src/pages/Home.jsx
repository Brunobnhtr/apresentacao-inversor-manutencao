import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Home() {
  const nav = useNavigate()
  return (
    <div className="h-screen w-screen grid-bg flex flex-col items-center justify-center gap-8 p-8">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-6xl mb-4">⚡🔧</div>
        <h1 className="text-3xl font-industrial font-bold text-white mb-2">Apresentação Industrial</h1>
        <p className="text-gray-500 font-industrial">Inversor de Frequência · Manutenção Elétrica</p>
      </motion.div>

      <motion.div
        className="flex flex-col gap-4 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={() => nav('/')}
          className="glass rounded-2xl p-6 text-left hover:border-electric/40 transition-all group glow-blue"
        >
          <div className="text-3xl mb-2">👁️</div>
          <div className="font-industrial font-bold text-white text-lg group-hover:text-electric transition-colors">Modo Visitante</div>
          <div className="text-sm text-gray-500">Tela cheia — para o professor / projetor</div>
        </button>

        <button
          onClick={() => nav('/admin')}
          className="glass-orange rounded-2xl p-6 text-left hover:border-neon-orange/40 transition-all group"
          style={{ boxShadow: '0 0 20px rgba(255,107,0,0.1)' }}
        >
          <div className="text-3xl mb-2">🎮</div>
          <div className="font-industrial font-bold text-white text-lg group-hover:text-neon-orange transition-colors">Modo Admin</div>
          <div className="text-sm text-gray-500">Controle — para seu celular</div>
        </button>
      </motion.div>
    </div>
  )
}
