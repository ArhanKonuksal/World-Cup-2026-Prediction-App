import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('framer-motion') || id.includes('motion-dom')) return 'motion';
          if (id.includes('@dnd-kit')) return 'dnd';
          if (id.includes('html-to-image')) return 'export';
        },
      },
    },
  },
})
