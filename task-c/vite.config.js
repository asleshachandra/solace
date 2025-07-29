import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/encrypt-key': {
        target: 'https://zypexfre2k7xsol2wac4e76sm40wcibs.lambda-url.us-east-1.on.aws/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/encrypt-key/, ''),
      },
    },
  },
})
