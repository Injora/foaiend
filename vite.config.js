import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/iss': {
        target: 'http://api.open-notify.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/iss/, ''),
      },
      '/api/nominatim': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nominatim/, ''),
      },
      '/api/ai': {
        target: 'https://api-inference.huggingface.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ai/, ''),
      },
      '/api/news': {
        target: 'https://gnews.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/news/, ''),
      },
    },
  },
})
