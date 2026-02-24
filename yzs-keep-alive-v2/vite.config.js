import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'

export default defineConfig({
  plugins: [vue()],

  build: {
    target: 'es2015', // Output ES2015 compatible code
    lib: {
      entry: './src/index.js',
      name: 'YzsKeepAlive',
      formats: ['umd', 'es'], // Output both UMD and ES formats
      fileName: (format) => `yzs-keep-alive-v2.${format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  },

  // Dev server configuration
  server: {
    open: true,
    port: 5174
  }
})
