import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        entryFileNames: 'app-[hash].js',
        chunkFileNames: 'chunk-[hash].js',
        assetFileNames: '[name]-[hash][extname]'
      }
    }
  },
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/__openclaw__': {
        target: 'ws://127.0.0.1:18789',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
