import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/send-verification': {
        target: 'https://teste.berthia.com.br',
        changeOrigin: true,
        rewrite: () => '/webhook/controla_autenticacao%20',
        secure: true,
      },
    },
  },
})

