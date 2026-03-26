import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))


// https://vite.dev/config/
export default defineConfig({
  css: {
    transformer: 'tailwindcss',
  },
  plugins: [react(), tailwindcss()],
  envDir: path.resolve(__dirname, '..')
})
