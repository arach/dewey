import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, readdirSync } from 'fs'

// Plugin to copy CSS files to dist
function copyCssPlugin() {
  return {
    name: 'copy-css',
    closeBundle() {
      // Create dist/css directories
      mkdirSync('dist/css/colors', { recursive: true })

      // Copy main CSS files
      copyFileSync('src/css/index.css', 'dist/css/index.css')
      copyFileSync('src/css/base.css', 'dist/css/base.css')

      // Copy color presets
      const colorFiles = readdirSync('src/css/colors')
      for (const file of colorFiles) {
        if (file.endsWith('.css')) {
          copyFileSync(`src/css/colors/${file}`, `dist/css/colors/${file}`)
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      outDir: 'dist',
    }),
    copyCssPlugin(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DeweyDocs',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM',
        },
      },
    },
  },
})
