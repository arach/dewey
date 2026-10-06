/** Run after fresh-project-smoke.ts. Optional args: scratch root, screenshot directory. */
import { chromium, expect } from '@playwright/test'
import { mkdir, readFile } from 'node:fs/promises'
import { resolve, sep } from 'node:path'

const latest = JSON.parse(await readFile('/tmp/dewey-first-slice-latest.json', 'utf8'))
const root = resolve(process.argv[2] || latest.root, '.dewey/site')
const output = resolve(process.argv[3] || resolve(root, '../../browser-proof'))
await mkdir(output, { recursive: true })
const server = Bun.serve({ port: 0, hostname: '127.0.0.1', fetch(request) {
  const path = resolve(root, '.' + decodeURIComponent(new URL(request.url).pathname).replace(/\/$/, '/index.html'))
  if (!path.startsWith(root + sep)) return new Response('Forbidden', { status: 403 })
  return new Response(Bun.file(path))
} })
const browser = await chromium.launch({ headless: true })
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1024 }, permissions: ['clipboard-read', 'clipboard-write'] })
  const page = await context.newPage()
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`) })
  await page.goto(`${server.url}docs/reference/api.html`)
  await expect(page.getByRole('button', { name: 'Search documentation' })).toBeVisible()
  await expect(page.locator('.dw-sidebar')).toBeVisible()
  await expect(page.locator('pre').first()).toContainText('appendEvent')
  await page.getByRole('button', { name: 'Copy code', exact: true }).first().click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('appendEvent')
  await page.screenshot({ path: resolve(output, 'dewey-renderer-light.png') })
  await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.screenshot({ path: resolve(output, 'dewey-renderer-dark.png') })
  await page.getByLabel('Color theme').selectOption('emerald')
  await expect(page.locator('#dewey-preset')).toHaveAttribute('href', /emerald.css$/)
  await page.reload()
  await expect(page.getByLabel('Color theme')).toHaveValue('emerald')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.getByRole('button', { name: 'Search documentation' }).click()
  await page.getByRole('textbox', { name: 'Search docs' }).fill('Recover')
  await page.getByRole('dialog').getByText('Recover a journal', { exact: true }).click()
  await expect(page).toHaveURL(/docs\/guides\/recovery.html$/)
  await expect(page.getByRole('heading', { name: 'Recognize the error' })).toBeVisible()
  const payload = await page.locator('#dewey-data').textContent()
  expect(payload).not.toContain('Journal implementation')
  expect(payload).not.toContain('kind: history')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('button', { name: 'Search documentation' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: resolve(output, 'dewey-renderer-mobile.png') })
  expect(errors).toEqual([])
  console.log(`PASS: real sidebar, search navigation, code copy, themes, persistent dark mode, mobile, no browser/HTTP errors. Screenshots: ${output}`)
} finally {
  await browser.close()
  server.stop()
}
