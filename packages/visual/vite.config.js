import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        mainApp: fileURLToPath(new URL('./index.html', import.meta.url)),
        controlPanel: fileURLToPath(new URL('./controls.html', import.meta.url)),
      }
    }
  }
})
