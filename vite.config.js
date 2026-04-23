import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  build: {
    outDir: 'wwwroot',
    emptyOutDir: true,
    watch: command === 'build' ? {} : null,
    sourcemap: true
  }
}))