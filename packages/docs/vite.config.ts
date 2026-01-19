import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, readdirSync, watch } from 'fs'

// Copy all CSS files from src to dist
function copyCssFiles() {
  // Create dist/css directories
  mkdirSync('dist/css/colors', { recursive: true })

  // Copy main CSS files
  copyFileSync('src/css/index.css', 'dist/css/index.css')
  copyFileSync('src/css/base.css', 'dist/css/base.css')
  copyFileSync('src/css/tokens.css', 'dist/css/tokens.css')
  copyFileSync('src/css/tailwind.css', 'dist/css/tailwind.css')

  // Copy color presets
  const colorFiles = readdirSync('src/css/colors')
  for (const file of colorFiles) {
    if (file.endsWith('.css')) {
      copyFileSync(`src/css/colors/${file}`, `dist/css/colors/${file}`)
    }
  }
}

// Plugin to copy CSS files to dist with watch support
function copyCssPlugin() {
  let watcher: ReturnType<typeof watch> | null = null
  let colorsWatcher: ReturnType<typeof watch> | null = null

  return {
    name: 'copy-css',
    buildStart() {
      // Copy CSS files at build start
      copyCssFiles()

      // In watch mode, set up file watchers for CSS changes
      if (process.argv.includes('--watch')) {
        console.log('[copy-css] Watching src/css for changes...')

        // Watch main CSS directory
        watcher = watch('src/css', { recursive: false }, (eventType, filename) => {
          if (filename && filename.endsWith('.css')) {
            console.log(`[copy-css] ${filename} changed, copying to dist...`)
            try {
              copyFileSync(`src/css/${filename}`, `dist/css/${filename}`)
            } catch (e) {
              // Ignore errors for files that don't exist
            }
          }
        })

        // Watch colors subdirectory
        colorsWatcher = watch('src/css/colors', { recursive: false }, (eventType, filename) => {
          if (filename && filename.endsWith('.css')) {
            console.log(`[copy-css] colors/${filename} changed, copying to dist...`)
            try {
              copyFileSync(`src/css/colors/${filename}`, `dist/css/colors/${filename}`)
            } catch (e) {
              // Ignore errors
            }
          }
        })
      }
    },
    closeBundle() {
      // Also copy on close for non-watch builds
      copyCssFiles()
    },
    buildEnd() {
      // Clean up watchers if needed
      if (watcher && !process.argv.includes('--watch')) {
        watcher.close()
        watcher = null
      }
      if (colorsWatcher && !process.argv.includes('--watch')) {
        colorsWatcher.close()
        colorsWatcher = null
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
