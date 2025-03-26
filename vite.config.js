import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/gpg-json-verifier/',
  build: {
    rollupOptions: {
      external: [], // Добавь пустой массив, чтобы Vite не пытался исключить openpgp
    },
  },
  optimizeDeps: {
    include: ['openpgp'], // Явно укажем openpgp как зависимость
  },
})
