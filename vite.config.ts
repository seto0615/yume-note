import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages（https://<user>.github.io/yume-note/）で配信するため build 時は base を固定。
// ローカル開発時は '/' のまま。
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/yume-note/' : '/',
  plugins: [react()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
}))
