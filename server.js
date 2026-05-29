import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { networkInterfaces } from 'os'
import { existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
})

let state = {
  currentSlide: 0,
  simData: {
    inverterFreq: 60,
    inverterRunning: false,
    thermalMode: false,
    inspected: [],
    found: [],
    selectedId: null,
    scan: { x: 0.5, y: 0.5, active: false }
  }
}

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id)
  socket.emit('sync', state)

  socket.on('control', (data) => {
    state = { ...state, ...data }
    socket.broadcast.emit('sync', state)
  })

  socket.on('sim-update', (data) => {
    state.simData = { ...state.simData, ...data }
    socket.broadcast.emit('sim-update', state.simData)
  })

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id)
  })
})

// Serve frontend se o build existir (produção)
const distPath = join(__dirname, 'dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
}

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('\n========================================')
  console.log('  APRESENTACAO - SERVIDOR INICIADO')
  console.log('========================================')
  console.log(`\nLocal:     http://localhost:${PORT}`)

  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`\nRede WiFi:`)
        console.log(`  Visitante (Professor): http://${net.address}:${PORT}/`)
        console.log(`  Admin (Seu celular):   http://${net.address}:${PORT}/admin`)
      }
    }
  }
  console.log('\n========================================\n')
})
