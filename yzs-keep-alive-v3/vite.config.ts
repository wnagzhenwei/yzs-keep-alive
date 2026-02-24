import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [vue(), dts({ outDir: 'dist/types', insertTypesEntry: true, skipDiagnostics: true })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'YzsKeepAlive',
      formats: ['es', 'umd'],
      fileName: (format) => `yzs-keep-alive-v3.${format}.js`
    },
    rollupOptions: {
      external: ['vue', '@vue/shared'],
      output: {
        globals: {
          vue: 'Vue',
          '@vue/shared': 'VueShared'
        }
      }
    }
  }
})