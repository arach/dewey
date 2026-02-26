#!/usr/bin/env node
import { execSync, spawn } from 'node:child_process'
import { mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const wwwRoot = resolve(__dirname, '..')
const outDir = resolve(wwwRoot, 'public/templates')

const VIEWPORT = { width: 1440, height: 900 }
const QUALITY = 85
const PORT = 4321
const BASE_URL = `http://localhost:${PORT}`

// Dark-only templates — capture once, use for both light and dark
const DARK_ONLY = new Set(['hudson'])

const templates = [
  // Templates (structurally unique)
  'hudson', 'topnav', 'splitpane',
  // Themes (color/typography variations)
  'neutral', 'ocean', 'emerald', 'purple', 'dusk', 'rose', 'github',
  'warm', 'midnight', 'mono',
]

async function main() {
  // 1. Build the site
  console.log('Building site...')
  execSync('pnpm build', { cwd: wwwRoot, stdio: 'inherit' })

  // 2. Start preview server
  console.log(`Starting preview server on port ${PORT}...`)
  const server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], {
    cwd: wwwRoot,
    stdio: 'pipe',
  })

  // Wait for server to be ready
  await waitForServer(BASE_URL, 30_000)
  console.log('Server ready.')

  // 3. Ensure output directory
  mkdirSync(outDir, { recursive: true })

  // 4. Launch Puppeteer
  const puppeteer = await import('puppeteer')
  const browser = await puppeteer.default.launch({ headless: true })

  try {
    const page = await browser.newPage()
    await page.setViewport(VIEWPORT)

    for (const name of templates) {
      const url = `${BASE_URL}/templates/${name}`
      console.log(`Capturing ${name}...`)

      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 })

      // Hide the preview banner
      await page.evaluate(() => {
        const banner = document.querySelector('.preview-banner')
        if (banner) banner.style.display = 'none'
        // Remove the body padding-top that the banner creates
        document.body.style.paddingTop = '0'
      })

      // Wait for fonts
      await page.evaluate(() => document.fonts.ready)

      // Small delay for rendering to settle
      await new Promise((r) => setTimeout(r, 500))

      if (DARK_ONLY.has(name)) {
        // Dark-only: single capture used for both
        const path = resolve(outDir, `${name}-dark.webp`)
        await page.screenshot({ path, type: 'webp', quality: QUALITY })
        console.log(`  -> ${name}-dark.webp (dark-only, used for both)`)

        // Copy as light too
        const lightPath = resolve(outDir, `${name}-light.webp`)
        const { copyFileSync } = await import('node:fs')
        copyFileSync(path, lightPath)
        console.log(`  -> ${name}-light.webp (copy of dark)`)
      } else {
        // Light mode screenshot
        const lightPath = resolve(outDir, `${name}-light.webp`)
        await page.screenshot({ path: lightPath, type: 'webp', quality: QUALITY })
        console.log(`  -> ${name}-light.webp`)

        // Toggle dark mode
        await page.evaluate(() => {
          document.documentElement.classList.add('dark')
          document.documentElement.dataset.theme &&= document.documentElement.dataset.theme
        })

        await new Promise((r) => setTimeout(r, 300))

        // Dark mode screenshot
        const darkPath = resolve(outDir, `${name}-dark.webp`)
        await page.screenshot({ path: darkPath, type: 'webp', quality: QUALITY })
        console.log(`  -> ${name}-dark.webp`)

        // Reset for next template
        await page.evaluate(() => {
          document.documentElement.classList.remove('dark')
        })
      }
    }
  } finally {
    await browser.close()
    server.kill()
  }

  console.log(`\nDone! ${templates.length * 2} screenshots saved to www/public/templates/`)
}

async function waitForServer(url, timeout) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Server at ${url} did not start within ${timeout}ms`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
