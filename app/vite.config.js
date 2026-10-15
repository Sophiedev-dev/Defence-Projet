import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration Vite : React + serveur accessible sur le réseau local
// (pratique pour tester directement sur la tablette).
export default defineConfig({
  plugins: [react()],
  server: { host: true },
})
