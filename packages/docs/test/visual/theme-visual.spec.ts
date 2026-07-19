import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PUBLISHED_CSS_THEMES } from '../../src/themes'

const here = dirname(fileURLToPath(import.meta.url))
const cssDir = resolve(here, '../../src/css')
const tokens = readFileSync(resolve(cssDir, 'tokens.css'), 'utf8')
const base = readFileSync(resolve(cssDir, 'base.css'), 'utf8')

function gallery(theme: string, mode: 'light' | 'dark') {
  const themeCss = readFileSync(resolve(cssDir, `colors/${theme}.css`), 'utf8')
  const darkClass = mode === 'dark' ? ' dark' : ''
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>${tokens}\n${themeCss}\n${base}
* { box-sizing: border-box; }
body { margin: 0; background: var(--dw-background); }
.visual-surface { width: 1180px; min-height: 820px; padding: 24px; background: var(--dw-background); color: var(--dw-foreground); font-family: Arial, sans-serif; }
.visual-header { position: relative; inset: auto; width: 100%; border: 1px solid var(--dw-header-border); border-radius: var(--dw-radius-md); }
.visual-grid { display: grid; grid-template-columns: 220px 1fr; gap: 24px; margin-top: 20px; }
.visual-nav { padding: 18px; border: 1px solid var(--dw-sidebar-border); border-radius: var(--dw-radius-md); background: var(--dw-sidebar-bg); }
.visual-nav a { display: block; padding: 8px 10px; border-radius: var(--dw-radius); color: var(--dw-muted-foreground); text-decoration: none; }
.visual-nav a.active { background: var(--dw-sidebar-active-bg); color: var(--dw-sidebar-active); }
.visual-content { min-width: 0; }
.visual-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin: 14px 0; }
.visual-focus { outline: 2px solid var(--dw-ring); outline-offset: 2px; }
.dw-code-block-copy { opacity: 1; }
</style></head>
<body><div data-testid="surface" class="visual-surface${darkClass}">
  <header class="dw-shell-header visual-header">
    <a class="dw-shell-brand" href="#"><span class="dw-shell-brand-dot"></span>Dewey ${theme}</a>
    <div class="dw-shell-header-right"><button class="dw-shell-icon-button visual-focus" data-testid="focus">◐</button><span class="dw-shell-label">${mode}</span></div>
  </header>
  <div class="visual-grid">
    <nav class="visual-nav" aria-label="Documentation navigation">
      <p class="dw-shell-nav-title">Guides</p>
      <a class="active" href="#">Overview</a><a href="#">Quickstart</a><a href="#">API Reference</a>
      <p class="dw-shell-nav-title" style="margin-top:20px">Resources</p><a href="#">Agent context</a>
    </nav>
    <main class="visual-content">
      <div style="display:flex;align-items:center;gap:10px"><span class="dw-badge dw-badge-primary">Theme</span><span class="dw-badge dw-badge-success">Ready</span><span class="dw-badge dw-badge-warning">Review</span><span class="dw-badge dw-badge-error">Error</span></div>
      <h1 style="font-family:var(--dw-font-serif);margin:14px 0 4px">Documentation that agents can use</h1>
      <p style="color:var(--dw-muted-foreground);margin:0">Representative navigation, prose, controls, semantic states, code, and structured content.</p>
      <div class="visual-row">
        <article class="dw-card"><div class="dw-card-content"><span class="dw-card-title">Human documentation</span><span class="dw-card-description">Narrative explanations and examples.</span></div><span class="dw-card-arrow">→</span></article>
        <article class="dw-card"><div class="dw-card-content"><span class="dw-card-title">Agent retrieval</span><span class="dw-card-description">Dense, structured context bundles.</span></div><span class="dw-card-arrow">→</span></article>
      </div>
      <div class="visual-row">
        <section class="dw-callout dw-callout-info"><div class="dw-callout-title">Information</div><div class="dw-callout-body">A semantic callout using the complete theme contract.</div></section>
        <section class="dw-callout dw-callout-warning"><div class="dw-callout-title">Warning</div><div class="dw-callout-body">Review generated output before publishing.</div></section>
      </div>
      <div class="dw-tabs"><div class="dw-tabs-list" role="tablist"><button class="dw-tabs-trigger active">React</button><button class="dw-tabs-trigger">Next.js</button><button class="dw-tabs-trigger">Astro</button></div><div class="dw-tabs-content">Install Dewey and generate agent-ready artifacts.</div></div>
      <div class="visual-row">
        <div class="dw-code-block"><div class="dw-code-block-frame"><div class="dw-code-block-scroll"><span class="dw-code-block-language">typescript</span><button class="dw-code-block-copy">□</button><pre class="dw-code-block-pre"><code class="dw-code-block-code"><span class="hljs-keyword">export</span> <span class="hljs-keyword">const</span> docs = <span class="hljs-string">'agent-ready'</span></code></pre></div></div></div>
        <div class="dw-api-table"><div class="dw-api-table-title">Configuration</div><table><thead><tr><th>Property</th><th>Type</th><th>Default</th></tr></thead><tbody><tr><td><code class="dw-api-table-name">theme</code></td><td><code class="dw-api-table-type">string</code></td><td class="dw-api-table-default"><code>${theme}</code></td></tr><tr><td><code class="dw-api-table-name">agent</code><span class="dw-api-table-required">required</span></td><td><code class="dw-api-table-type">boolean</code></td><td class="dw-api-table-default"><code>true</code></td></tr></tbody></table></div>
      </div>
    </main>
  </div>
</div></body></html>`
}

for (const theme of PUBLISHED_CSS_THEMES) {
  for (const mode of ['light', 'dark'] as const) {
    test(`${theme} ${mode} representative gallery`, async ({ page }) => {
      await page.setContent(gallery(theme, mode), { waitUntil: 'load' })
      const surface = page.getByTestId('surface')
      await expect(surface).toBeVisible()
      await expect(page.getByRole('navigation', { name: 'Documentation navigation' })).toBeVisible()
      await expect(page.getByTestId('focus')).toHaveCSS('outline-style', 'solid')
      await expect(surface).toHaveScreenshot(`${theme}-${mode}.png`)
    })
  }
}
