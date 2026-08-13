import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 5173,
    // Mirror production: nginx proxies /api to the contact service, so in dev
    // Vite does the same. The frontend then talks same-origin in both places —
    // no VITE_CONTACT_API to set, and no CORS in the loop locally.
    proxy: {
      '/api': {
        target: process.env.API_ORIGIN || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
