import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Instagram Graph API (Business/Creator) — avoids browser CORS in dev
      '/api/instagram': {
        target: 'https://graph.instagram.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/instagram/, ''),
      },
    },
  },
})
