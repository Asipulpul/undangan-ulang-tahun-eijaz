import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { sites } from '@openai/sites-vite-plugin'
import { mkdirSync, writeFileSync } from 'node:fs'

const staticWorker = () => ({
  name: 'eijaz-static-worker',
  closeBundle() {
    mkdirSync('dist/server', { recursive: true })
    writeFileSync(
      'dist/server/index.js',
      `export default {\n  async fetch(request, env) {\n    return env.ASSETS.fetch(request)\n  },\n}\n`,
    )
  },
})

export default defineConfig({
  plugins: [vue(), sites(), staticWorker()],
  build: {
    target: 'es2020',
  },
})
