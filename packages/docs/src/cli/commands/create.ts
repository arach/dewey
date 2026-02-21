import chalk from 'chalk'
import { mkdir, writeFile, readFile, readdir, access } from 'fs/promises'
import { join, basename, relative } from 'path'
import matter from 'gray-matter'

interface CreateOptions {
  source?: string
  template?: 'astro'
  theme?: string
  name?: string
}

interface DocFile {
  id: string
  title: string
  description?: string
  content: string
  rawContent: string
  order: number
}

interface NavSection {
  title: string
  items: { id: string; title: string; description?: string }[]
}

const VALID_THEMES = ['neutral', 'ocean', 'emerald', 'purple', 'dusk', 'rose', 'github', 'warm'] as const
type ThemeName = typeof VALID_THEMES[number]

function resolveTheme(theme?: string): ThemeName {
  if (!theme) return 'neutral'
  if (VALID_THEMES.includes(theme as ThemeName)) return theme as ThemeName
  console.log(chalk.yellow(`⚠️  Unknown theme "${theme}". Falling back to "neutral".`))
  return 'neutral'
}

function resolveTemplate(_template?: string): 'astro' {
  return 'astro'
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function loadMarkdownDocs(docsPath: string): Promise<DocFile[]> {
  const docs: DocFile[] = []

  if (!await fileExists(docsPath)) {
    return docs
  }

  const files = await readdir(docsPath)

  for (const file of files) {
    if (!file.endsWith('.md')) continue

    const filePath = join(docsPath, file)
    const rawContent = await readFile(filePath, 'utf-8')
    const { data: frontmatter, content: body } = matter(rawContent)
    const id = file.replace('.md', '')

    docs.push({
      id,
      title: (frontmatter.title as string) || id.charAt(0).toUpperCase() + id.slice(1),
      description: frontmatter.description as string | undefined,
      content: body.trim(),
      rawContent,
      order: (frontmatter.order as number) || 999,
    })
  }

  docs.sort((a, b) => a.order - b.order)

  return docs
}

function generateNavigation(docs: DocFile[]): NavSection[] {
  const gettingStarted = docs.filter(d => d.order <= 10)
  const features = docs.filter(d => d.order > 10 && d.order <= 50)
  const reference = docs.filter(d => d.order > 50)

  const sections: NavSection[] = []

  if (gettingStarted.length > 0) {
    sections.push({
      title: 'Getting Started',
      items: gettingStarted.map(d => ({ id: d.id, title: d.title, description: d.description })),
    })
  }

  if (features.length > 0) {
    sections.push({
      title: 'Features',
      items: features.map(d => ({ id: d.id, title: d.title, description: d.description })),
    })
  }

  if (reference.length > 0) {
    sections.push({
      title: 'Reference',
      items: reference.map(d => ({ id: d.id, title: d.title, description: d.description })),
    })
  }

  if (sections.length === 0 && docs.length > 0) {
    sections.push({
      title: 'Documentation',
      items: docs.map(d => ({ id: d.id, title: d.title, description: d.description })),
    })
  }

  return sections
}

function generateDocsJson(projectName: string, navigation: NavSection[]): string {
  const groups = navigation.map(section => ({
    id: section.title.toLowerCase().replace(/\s+/g, '-'),
    title: section.title,
    items: section.items.map(item => ({
      id: item.id,
      title: item.title,
      ...(item.description ? { description: item.description } : {}),
    })),
  }))

  return JSON.stringify({ name: projectName, groups }, null, 2)
}

// ---------------------------------------------------------------------------
// Theme tokens
// ---------------------------------------------------------------------------

const SHARED_LAYOUT_VARS = `    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --sidebar-width: 260px;
    --toc-width: 220px;
    --content-max: 760px;`

function buildTokens(lightColors: string, darkColors: string): string {
  return `@layer base {
  :root {
${lightColors}
${SHARED_LAYOUT_VARS}
    --shadow-soft: 0 12px 30px rgba(16, 21, 24, 0.08);
  }

  [data-theme='dark'] {
${darkColors}
    --shadow-soft: 0 12px 30px rgba(0, 0, 0, 0.35);
  }
}
`
}

const THEME_TOKENS: Record<ThemeName, string> = {
  neutral: buildTokens(
    `    --color-bg: #f7f3ec;
    --color-surface: #ffffff;
    --color-surface-muted: #f3efe7;
    --color-border: rgba(16, 21, 24, 0.1);
    --color-text: #101518;
    --color-text-muted: #5c676c;
    --color-accent: #f07c4f;
    --color-accent-strong: #e86f42;`,
    `    --color-bg: #0a0c0e;
    --color-surface: #101418;
    --color-surface-muted: #121820;
    --color-border: rgba(255, 255, 255, 0.08);
    --color-text: #e5e7eb;
    --color-text-muted: #9ca3af;
    --color-accent: #f07c4f;
    --color-accent-strong: #f07c4f;`,
  ),

  warm: buildTokens(
    `    --color-bg: #f7f3ec;
    --color-surface: #ffffff;
    --color-surface-muted: #f3efe7;
    --color-border: rgba(16, 21, 24, 0.1);
    --color-text: #101518;
    --color-text-muted: #5c676c;
    --color-accent: #f07c4f;
    --color-accent-strong: #e86f42;`,
    `    --color-bg: #0a0c0e;
    --color-surface: #101418;
    --color-surface-muted: #121820;
    --color-border: rgba(255, 255, 255, 0.08);
    --color-text: #e5e7eb;
    --color-text-muted: #9ca3af;
    --color-accent: #f07c4f;
    --color-accent-strong: #f07c4f;`,
  ),

  ocean: buildTokens(
    `    --color-bg: #f0f4f8;
    --color-surface: #ffffff;
    --color-surface-muted: #e4ecf4;
    --color-border: rgba(16, 21, 24, 0.1);
    --color-text: #101518;
    --color-text-muted: #5c676c;
    --color-accent: #3b82f6;
    --color-accent-strong: #2563eb;`,
    `    --color-bg: #0a0e14;
    --color-surface: #101820;
    --color-surface-muted: #121a24;
    --color-border: rgba(255, 255, 255, 0.08);
    --color-text: #e5e7eb;
    --color-text-muted: #9ca3af;
    --color-accent: #60a5fa;
    --color-accent-strong: #60a5fa;`,
  ),

  emerald: buildTokens(
    `    --color-bg: #eef7f3;
    --color-surface: #ffffff;
    --color-surface-muted: #e2f0ea;
    --color-border: rgba(16, 21, 24, 0.1);
    --color-text: #101518;
    --color-text-muted: #5c676c;
    --color-accent: #10b981;
    --color-accent-strong: #059669;`,
    `    --color-bg: #0a0e0c;
    --color-surface: #101814;
    --color-surface-muted: #12201a;
    --color-border: rgba(255, 255, 255, 0.08);
    --color-text: #e5e7eb;
    --color-text-muted: #9ca3af;
    --color-accent: #34d399;
    --color-accent-strong: #34d399;`,
  ),

  purple: buildTokens(
    `    --color-bg: #f3f0fa;
    --color-surface: #ffffff;
    --color-surface-muted: #ebe5f5;
    --color-border: rgba(16, 21, 24, 0.1);
    --color-text: #101518;
    --color-text-muted: #5c676c;
    --color-accent: #8b5cf6;
    --color-accent-strong: #7c3aed;`,
    `    --color-bg: #0c0a12;
    --color-surface: #141020;
    --color-surface-muted: #181424;
    --color-border: rgba(255, 255, 255, 0.08);
    --color-text: #e5e7eb;
    --color-text-muted: #9ca3af;
    --color-accent: #a78bfa;
    --color-accent-strong: #a78bfa;`,
  ),

  dusk: buildTokens(
    `    --color-bg: #f5f0eb;
    --color-surface: #ffffff;
    --color-surface-muted: #ede5dc;
    --color-border: rgba(16, 21, 24, 0.1);
    --color-text: #101518;
    --color-text-muted: #5c676c;
    --color-accent: #d97706;
    --color-accent-strong: #b45309;`,
    `    --color-bg: #0e0c0a;
    --color-surface: #181410;
    --color-surface-muted: #201c16;
    --color-border: rgba(255, 255, 255, 0.08);
    --color-text: #e5e7eb;
    --color-text-muted: #9ca3af;
    --color-accent: #fbbf24;
    --color-accent-strong: #fbbf24;`,
  ),

  rose: buildTokens(
    `    --color-bg: #fdf0f2;
    --color-surface: #ffffff;
    --color-surface-muted: #f8e5e8;
    --color-border: rgba(16, 21, 24, 0.1);
    --color-text: #101518;
    --color-text-muted: #5c676c;
    --color-accent: #f43f5e;
    --color-accent-strong: #e11d48;`,
    `    --color-bg: #0e0a0b;
    --color-surface: #181012;
    --color-surface-muted: #201418;
    --color-border: rgba(255, 255, 255, 0.08);
    --color-text: #e5e7eb;
    --color-text-muted: #9ca3af;
    --color-accent: #fb7185;
    --color-accent-strong: #fb7185;`,
  ),

  github: buildTokens(
    `    --color-bg: #ffffff;
    --color-surface: #f6f8fa;
    --color-surface-muted: #f0f2f4;
    --color-border: rgba(31, 35, 40, 0.15);
    --color-text: #1f2328;
    --color-text-muted: #656d76;
    --color-accent: #0969da;
    --color-accent-strong: #0550ae;`,
    `    --color-bg: #0d1117;
    --color-surface: #161b22;
    --color-surface-muted: #1c2129;
    --color-border: rgba(255, 255, 255, 0.1);
    --color-text: #e6edf3;
    --color-text-muted: #8b949e;
    --color-accent: #58a6ff;
    --color-accent-strong: #58a6ff;`,
  ),
}

// ---------------------------------------------------------------------------
// Astro templates
// ---------------------------------------------------------------------------

const ASTRO_TEMPLATES: Record<string, (...args: any[]) => string> = {
  'package.json': (projectName: string) => JSON.stringify({
    name: projectName,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'astro dev',
      build: 'astro build',
      postbuild: 'npx -y pagefind --site dist',
      preview: 'astro preview',
    },
    dependencies: {
      'astro': '^5.2.0',
      '@tailwindcss/vite': '^4.1.0',
      'tailwindcss': '^4.1.0',
    },
  }, null, 2),

  'astro.config.mjs': () => `import { defineConfig } from 'astro/config'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
  vite: {
    plugins: [tailwind()],
  },
})
`,

  'tsconfig.json': () => JSON.stringify({
    extends: 'astro/tsconfigs/strict',
    compilerOptions: {
      resolveJsonModule: true,
      types: ['astro/client'],
    },
  }, null, 2),

  'src/styles/global.css': () => `@import "tailwindcss";
@import "./tokens.css";
@import "./base.css";
@import "./markdown.css";

@layer base {
  .pagefind-ui {
    color: var(--color-text);
  }
  .pagefind-ui__form input {
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }
  .pagefind-ui__result {
    background: var(--color-surface-muted);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 12px 14px;
  }
  .pagefind-ui__result-link {
    color: var(--color-text);
    font-weight: 600;
  }
  .pagefind-ui__result-link:hover {
    color: var(--color-accent);
  }
  .pagefind-ui__result-excerpt {
    color: var(--color-text-muted);
  }
  .pagefind-ui__result-excerpt mark,
  .pagefind-ui__result-title mark {
    background: color-mix(in srgb, var(--color-accent) 25%, transparent);
    color: var(--color-text);
    border-radius: 4px;
    padding: 0 2px;
  }
  .pagefind-ui__message {
    color: var(--color-text-muted);
  }
  .pagefind-ui__button {
    background: var(--color-surface-muted);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }
}
`,

  'src/styles/tokens.css': (theme: ThemeName) => THEME_TOKENS[theme],

  'src/styles/base.css': () => `@layer base {
  * {
    box-sizing: border-box;
  }

  html {
    color-scheme: light;
    font-family: "Space Grotesk", "Inter", "SF Pro Text", system-ui, -apple-system, sans-serif;
    background: var(--color-bg);
    color: var(--color-text);
  }

  body {
    min-height: 100vh;
    margin: 0;
    background: var(--color-bg);
    color: var(--color-text);
    position: relative;
  }

  [data-theme='dark'] {
    color-scheme: dark;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: "Fraunces", "Space Grotesk", serif;
    color: var(--color-text);
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  a:hover {
    color: var(--color-accent-strong);
  }

  img {
    max-width: 100%;
    display: block;
  }

  pre {
    position: relative;
  }

  code {
    font-family: "JetBrains Mono", "SF Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  }

  .root {
    isolation: isolate;
  }
}
`,

  'src/styles/markdown.css': () => `@layer base {
  .doc-content {
    font-size: 15px;
    line-height: 1.75;
    color: var(--color-text);
    overflow-wrap: break-word;
    min-width: 0;
  }

  .doc-content h1 {
    font-size: 2.25rem;
    margin: 0 0 1rem;
    letter-spacing: -0.02em;
  }

  .doc-content h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 3rem 0 1.25rem;
    padding-top: 2rem;
    border-top: 1px solid var(--color-border);
    scroll-margin-top: 100px;
  }

  .doc-content h2:first-child {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }

  .doc-content h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 2rem 0 1rem;
    scroll-margin-top: 100px;
  }

  .doc-content p,
  .doc-content ul,
  .doc-content ol,
  .doc-content table {
    margin: 0 0 1.25rem;
  }

  .doc-content ul,
  .doc-content ol {
    padding-left: 1.5rem;
  }

  .doc-content li {
    margin-bottom: 0.5rem;
  }

  .doc-content li::marker {
    color: var(--color-text-muted);
  }

  .doc-content a {
    color: var(--color-accent);
    text-decoration: none;
    font-weight: 500;
  }

  .doc-content a:hover {
    text-decoration: underline;
  }

  .doc-content strong {
    font-weight: 600;
    color: var(--color-text);
  }

  .doc-content pre {
    background: #1e1e1e;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md);
    padding: 1rem 1.25rem;
    overflow-x: auto;
  }

  .doc-content code {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 4px;
    padding: 0.15rem 0.4rem;
    font-size: 12px;
  }

  .doc-content pre code {
    background: transparent;
    border: none;
    padding: 0;
    color: inherit;
  }

  .doc-content hr {
    border: none;
    border-top: 1px solid var(--color-border);
    margin: 3rem 0;
  }

  .doc-content table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .doc-content th,
  .doc-content td {
    border-bottom: 1px solid var(--color-border);
    padding: 0.6rem 0.8rem;
    text-align: left;
  }

  .doc-content tr:last-child td {
    border-bottom: none;
  }
}
`,

  'src/layouts/BaseLayout.astro': (projectName: string) => `---
import '../styles/global.css'

const { title = 'Docs' } = Astro.props
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} - ${projectName}</title>
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600&display=swap"
    />
    <link rel="stylesheet" href="/pagefind/pagefind-ui.css" />
    <script is:inline>
      ;(function () {
        try {
          var saved = localStorage.getItem('theme')
        } catch (e) {}
        var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        document.documentElement.setAttribute('data-theme', theme)
      })()
    </script>
  </head>
  <body>
    <div class="root min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]" data-theme-root>
      <header class="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur" data-pagefind-ignore>
        <div class="mx-auto flex w-full max-w-[1320px] items-center justify-between px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_20%,transparent)]"></div>
            <a class="text-lg font-semibold" href="/">${projectName}</a>
          </div>
          <div class="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
            <button
              class="hidden sm:flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-text-muted)]"
              type="button"
              data-search-toggle
              data-pagefind-ignore
            >
              Search\u2026
              <span class="text-[10px] uppercase tracking-[0.2em]">\u2318K</span>
            </button>
            <button
              class="hidden sm:flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text-muted)]"
              type="button"
              data-theme-toggle
              data-pagefind-ignore
            >
              Theme
            </button>
          </div>
        </div>
      </header>
      <main class="mx-auto w-full max-w-[1320px] px-6 py-8" data-pagefind-body>
        <slot />
      </main>
    </div>
    <div
      class="fixed inset-0 z-50 hidden items-center justify-center bg-black/50 p-6"
      data-search-modal
      data-pagefind-ignore
    >
      <div class="w-full max-w-2xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-widest text-[var(--color-text-muted)]">Search</p>
            <h2 class="text-lg font-semibold">Find docs fast</h2>
          </div>
          <button class="text-xs text-[var(--color-text-muted)]" data-search-close>Close</button>
        </div>
        <div id="search-modal" class="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4"></div>
        <p id="search-modal-fallback" class="mt-3 hidden text-xs text-[var(--color-text-muted)]">
          Search index is generated on build. Run <code>pnpm build</code> to enable Pagefind locally.
        </p>
      </div>
    </div>
    <script is:inline>
      (() => {
        const initUi = () => {
          try {
            var themeToggle = document.querySelector('[data-theme-toggle]')
            themeToggle && themeToggle.addEventListener('click', function () {
              var current = document.documentElement.getAttribute('data-theme') || 'light'
              var next = current === 'dark' ? 'light' : 'dark'
              document.documentElement.setAttribute('data-theme', next)
              try { localStorage.setItem('theme', next) } catch (e) {}
            })

            window.addEventListener('keydown', function (event) {
              var isMac = navigator.platform && navigator.platform.toUpperCase().indexOf('MAC') >= 0
              var isCmdK = isMac ? event.metaKey && event.key.toLowerCase() === 'k' : event.ctrlKey && event.key.toLowerCase() === 'k'
              if (isCmdK) {
                event.preventDefault()
                window.dispatchEvent(new CustomEvent('open-search'))
              }
            })

            var searchModal = document.querySelector('[data-search-modal]')
            var searchClose = document.querySelector('[data-search-close]')
            var searchToggles = document.querySelectorAll('[data-search-toggle]')

            var loadPagefind = function () {
              return new Promise(function (resolve) {
                if (window.PagefindUI) return resolve(true)
                var existing = document.querySelector('script[data-pagefind]')
                if (existing) {
                  existing.addEventListener('load', function () { resolve(true) })
                  existing.addEventListener('error', function () { resolve(false) })
                  return
                }
                var script = document.createElement('script')
                script.src = '/pagefind/pagefind-ui.js'
                script.async = true
                script.dataset.pagefind = 'true'
                script.addEventListener('load', function () { resolve(true) })
                script.addEventListener('error', function () { resolve(false) })
                document.head.appendChild(script)
              })
            }

            var initPagefind = function () {
              loadPagefind().then(function (ok) {
                if (ok && window.PagefindUI) {
                  new window.PagefindUI({ element: '#search-modal', showSubResults: true })
                } else {
                  var fb = document.getElementById('search-modal-fallback')
                  if (fb) fb.classList.remove('hidden')
                }
              })
            }

            var openSearch = function () {
              if (!searchModal) return
              searchModal.classList.remove('hidden')
              searchModal.classList.add('flex')
              initPagefind()
            }

            var closeSearch = function () {
              if (!searchModal) return
              searchModal.classList.add('hidden')
              searchModal.classList.remove('flex')
            }

            searchToggles.forEach(function (btn) { btn.addEventListener('click', openSearch) })
            searchClose && searchClose.addEventListener('click', closeSearch)
            searchModal && searchModal.addEventListener('click', function (event) {
              if (event.target === searchModal) closeSearch()
            })
            window.addEventListener('open-search', openSearch)
          } catch (error) {
            console.error('UI init failed', error)
          }
        }

        var addCopyButtons = function () {
          document.querySelectorAll('pre').forEach(function (block) {
            if (block.dataset.copyReady) return
            block.dataset.copyReady = 'true'
            var button = document.createElement('button')
            button.textContent = 'Copy'
            button.className = 'absolute right-3 top-3 rounded bg-black/60 px-2 py-1 text-xs text-white transition hover:bg-black/80'
            button.addEventListener('click', function () {
              var code = block.querySelector('code')
              if (!code) return
              navigator.clipboard.writeText(code.innerText).then(function () {
                button.textContent = 'Copied'
                setTimeout(function () { button.textContent = 'Copy' }, 1200)
              })
            })
            block.appendChild(button)
          })
        }

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initUi)
          document.addEventListener('DOMContentLoaded', addCopyButtons)
        } else {
          initUi()
          addCopyButtons()
        }
      })()
    </script>
  </body>
</html>
`,

  'src/layouts/DocsLayout.astro': () => `---
import BaseLayout from './BaseLayout.astro'
import SidebarNav from '../components/SidebarNav.astro'
import Toc from '../components/Toc.astro'

const { title = 'Docs', headings = [], description } = Astro.props
---

<BaseLayout title={title}>
  <div class="grid gap-8 lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)_var(--toc-width)]">
    <aside class="hidden lg:block" data-pagefind-ignore>
      <div class="sticky top-24">
        <SidebarNav />
      </div>
    </aside>

    <article class="min-w-0">
      <div class="mb-10">
        <h1 class="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p class="mt-3 text-lg text-[var(--color-text-muted)]">{description}</p>
        )}
      </div>
      <div class="doc-content">
        <slot />
      </div>
    </article>

    <aside class="hidden lg:block" data-pagefind-ignore>
      <div class="sticky top-24">
        <Toc headings={headings} />
      </div>
    </aside>
  </div>
</BaseLayout>
`,

  'src/components/SidebarNav.astro': () => `---
import { navGroups } from '../lib/nav'

const currentPath = Astro.url.pathname.replace(/\\/$/, '') || '/'
---

<nav class="space-y-4">
  {navGroups.map((group) => (
    <details class="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]" open>
      <summary class="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-sm font-semibold text-[var(--color-text)] [&::-webkit-details-marker]:hidden">
        <span>{group.title}</span>
        <span class="text-xs text-[var(--color-text-muted)]">\u25BE</span>
      </summary>
      <div class="border-t border-[var(--color-border)] px-3 py-2">
        <ul class="m-0 list-none space-y-1 p-0 text-sm">
          {group.items.map((item) => {
            const isActive = currentPath === item.href
            return (
              <li>
                <a
                  class={'block rounded px-2 py-1 transition ' + (isActive
                    ? 'font-medium text-[var(--color-accent)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  )}
                  style={isActive ? 'background:color-mix(in srgb,var(--color-accent) 10%,transparent)' : undefined}
                  href={item.href}
                >
                  {item.title}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </details>
  ))}
</nav>
`,

  'src/components/Toc.astro': () => `---
const { headings = [] } = Astro.props
const filtered = headings.filter((heading) => heading.depth >= 2 && heading.depth <= 3)
---

<div class="space-y-3 text-sm" data-toc>
  <p class="text-xs uppercase tracking-widest text-[var(--color-text-muted)]">On this page</p>
  <ul class="space-y-2">
    {filtered.map((heading) => (
      <li>
        <a
          class="block text-[13px] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
          data-toc-link
          data-level={heading.depth}
          href={'#' + heading.slug}
        >
          {heading.text}
        </a>
      </li>
    ))}
  </ul>
</div>

<script is:inline>
  var initToc = function () {
    var tocLinks = Array.from(document.querySelectorAll('[data-toc-link]'))
    var headings = tocLinks
      .map(function (link) { return document.querySelector(link.getAttribute('href')) })
      .filter(Boolean)

    if (!headings.length) return
    var activeId = null

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return
          activeId = entry.target.id
          tocLinks.forEach(function (link) { link.classList.remove('is-active') })
          var activeLink = document.querySelector('[data-toc-link][href="#' + entry.target.id + '"]')
          if (activeLink) activeLink.classList.add('is-active')
        })
      },
      { rootMargin: '-120px 0px -66% 0px' },
    )

    headings.forEach(function (heading) { observer.observe(heading) })

    window.addEventListener('mousemove', function (event) {
      var atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2
      if (!atBottom) return

      var closest = null
      var closestDistance = Infinity
      headings.forEach(function (heading) {
        var rect = heading.getBoundingClientRect()
        var distance = Math.abs(rect.top - event.clientY)
        if (distance < closestDistance) {
          closestDistance = distance
          closest = heading
        }
      })

      if (closest && closest.id !== activeId) {
        activeId = closest.id
        tocLinks.forEach(function (link) { link.classList.remove('is-active') })
        var activeLink = document.querySelector('[data-toc-link][href="#' + closest.id + '"]')
        if (activeLink) activeLink.classList.add('is-active')
      }
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToc)
  } else {
    initToc()
  }
</script>

<style is:inline>
  [data-toc-link][data-level='3'] {
    padding-left: 12px;
  }
  [data-toc-link].is-active {
    color: var(--color-accent);
    font-weight: 500;
  }
</style>
`,

  'src/lib/nav.ts': () => `import docsJson from '../../docs.json'

export type NavItem = {
  title: string
  href: string
}

export type NavGroup = {
  id: string
  title: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = (docsJson as any).groups.map((group: any) => ({
  id: group.id,
  title: group.title,
  items: group.items.map((item: any) => ({
    title: item.title,
    href: '/docs/' + item.id,
  })),
}))
`,

  'src/pages/index.astro': (defaultPage: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0;url=/docs/${defaultPage}" />
    <title>Redirecting\u2026</title>
  </head>
  <body>
    <p>Redirecting to <a href="/docs/${defaultPage}">documentation</a>\u2026</p>
  </body>
</html>
`,

  'src/pages/docs/[...slug].astro': (defaultPage: string) => `---
import DocsLayout from '../../layouts/DocsLayout.astro'

export async function getStaticPaths() {
  const markdownFiles = import.meta.glob('../../../docs/**/*.md')

  return Promise.all(
    Object.entries(markdownFiles).map(async ([filePath, loader]) => {
      const page = await loader()
      const slug = filePath.split('/docs/')[1].replace(/\\.md$/, '')

      return {
        params: { slug },
        props: { page },
      }
    }),
  )
}

const { page } = Astro.props
const { Content, frontmatter } = page
const headings = (await page.getHeadings?.()) ?? page.headings ?? []
const slug = Astro.params.slug || '${defaultPage}'
const fileName = slug.split('/').pop() ?? 'Docs'
const fallbackTitle = fileName
  .split('-')
  .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  .join(' ')
const title = frontmatter?.title ?? fallbackTitle
const description = frontmatter?.description
---

<DocsLayout title={title} headings={headings} description={description}>
  <Content />
</DocsLayout>
`,
}

// ---------------------------------------------------------------------------
// Create command
// ---------------------------------------------------------------------------

export async function createCommand(projectDir: string, options: CreateOptions) {
  const cwd = process.cwd()
  const targetDir = join(cwd, projectDir)
  const sourcePath = options.source ? join(cwd, options.source) : join(cwd, 'docs')
  const projectName = options.name || basename(projectDir)
  resolveTemplate(options.template)
  const theme = resolveTheme(options.theme)

  console.log(chalk.blue(`\n🚀 Creating Dewey docs site: ${projectName}\n`))

  // Check if target directory exists
  if (await fileExists(targetDir)) {
    console.log(chalk.red(`❌ Directory already exists: ${projectDir}`))
    console.log(chalk.gray('   Use a different name or remove the existing directory.\n'))
    process.exit(1)
  }

  // Load markdown docs from source
  console.log(chalk.gray(`📖 Loading docs from: ${relative(cwd, sourcePath) || '.'}`))
  const docs = await loadMarkdownDocs(sourcePath)

  if (docs.length === 0) {
    console.log(chalk.yellow(`⚠️  No markdown files found in ${sourcePath}`))
    console.log(chalk.gray('   Creating with sample documentation...\n'))

    docs.push({
      id: 'overview',
      title: 'Overview',
      description: 'Welcome to the documentation',
      content: `# Welcome to ${projectName}\n\nThis is your documentation site. Add markdown files to your docs directory to get started.`,
      rawContent: `---\ntitle: Overview\ndescription: Welcome to the documentation\norder: 1\n---\n\n# Welcome to ${projectName}\n\nThis is your documentation site. Add markdown files to your docs directory to get started.\n`,
      order: 1,
    })
  }

  console.log(chalk.green(`✓ Found ${docs.length} doc${docs.length === 1 ? '' : 's'}`))

  // Generate navigation from docs
  const navigation = generateNavigation(docs)
  const defaultPage = docs[0]?.id || 'overview'

  // Create directory structure
  console.log(chalk.gray('\n📁 Creating project structure...'))

  await mkdir(targetDir, { recursive: true })

  // Assemble template files
  const files: [string, string][] = [
    ['package.json', ASTRO_TEMPLATES['package.json'](projectName)],
    ['astro.config.mjs', ASTRO_TEMPLATES['astro.config.mjs']()],
    ['tsconfig.json', ASTRO_TEMPLATES['tsconfig.json']()],
    ['docs.json', generateDocsJson(projectName, navigation)],
    ['src/styles/global.css', ASTRO_TEMPLATES['src/styles/global.css']()],
    ['src/styles/tokens.css', ASTRO_TEMPLATES['src/styles/tokens.css'](theme)],
    ['src/styles/base.css', ASTRO_TEMPLATES['src/styles/base.css']()],
    ['src/styles/markdown.css', ASTRO_TEMPLATES['src/styles/markdown.css']()],
    ['src/layouts/BaseLayout.astro', ASTRO_TEMPLATES['src/layouts/BaseLayout.astro'](projectName)],
    ['src/layouts/DocsLayout.astro', ASTRO_TEMPLATES['src/layouts/DocsLayout.astro']()],
    ['src/components/SidebarNav.astro', ASTRO_TEMPLATES['src/components/SidebarNav.astro']()],
    ['src/components/Toc.astro', ASTRO_TEMPLATES['src/components/Toc.astro']()],
    ['src/lib/nav.ts', ASTRO_TEMPLATES['src/lib/nav.ts']()],
    ['src/pages/index.astro', ASTRO_TEMPLATES['src/pages/index.astro'](defaultPage)],
    ['src/pages/docs/[...slug].astro', ASTRO_TEMPLATES['src/pages/docs/[...slug].astro'](defaultPage)],
  ]

  // Write template files
  for (const [filePath, content] of files) {
    const fullPath = join(targetDir, filePath)
    const dir = join(targetDir, filePath.split('/').slice(0, -1).join('/'))
    await mkdir(dir, { recursive: true })
    await writeFile(fullPath, content)
    console.log(chalk.green('✓') + ` ${filePath}`)
  }

  // Copy raw markdown files to docs/
  const docsDir = join(targetDir, 'docs')
  await mkdir(docsDir, { recursive: true })

  for (const doc of docs) {
    const docPath = join(docsDir, `${doc.id}.md`)
    await writeFile(docPath, doc.rawContent)
    console.log(chalk.green('✓') + ` docs/${doc.id}.md`)
  }

  // Create .gitignore
  const gitignore = `# Dependencies
node_modules
.pnpm-store

# Astro
dist
.astro

# Misc
.DS_Store
*.log
`

  await writeFile(join(targetDir, '.gitignore'), gitignore)
  console.log(chalk.green('✓') + ' .gitignore')

  console.log(chalk.blue('\n✨ Docs site created!\n'))

  console.log('Next steps:')
  console.log(chalk.gray(`  cd ${projectDir}`))
  console.log(chalk.gray('  pnpm install'))
  console.log(chalk.gray('  pnpm dev'))
  console.log('')
  console.log('Your docs will be available at:')
  console.log(chalk.cyan('  http://localhost:4321/docs/'))
  console.log('')

  if (docs.length > 0) {
    console.log('Included documentation:')
    for (const doc of docs) {
      console.log(chalk.gray(`  - ${doc.title} (${doc.id}.md)`))
    }
    console.log('')
  }

  console.log(chalk.gray('To add more docs, create markdown files and run:'))
  console.log(chalk.cyan(`  dewey create ${projectDir} --source ./docs`))
  console.log('')
}
