import { io } from 'socket.io-client'

export const socket = io(
  import.meta.env.PROD ? window.location.origin : window.location.origin,
  { autoConnect: true }
)
