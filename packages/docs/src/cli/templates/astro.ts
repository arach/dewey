// ---------------------------------------------------------------------------
// Shared Astro template definitions
// Extracted from create.ts so both `create` and `update` can use them.
// ---------------------------------------------------------------------------

export const VALID_THEMES = ['neutral', 'ocean', 'emerald', 'purple', 'dusk', 'rose', 'github', 'warm', 'hudson'] as const
export type ThemeName = typeof VALID_THEMES[number]

export function resolveTheme(theme?: string): ThemeName {
  if (!theme) return 'neutral'
  if (VALID_THEMES.includes(theme as ThemeName)) return theme as ThemeName
  return 'neutral'
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

export const THEME_TOKENS: Record<ThemeName, string> = {
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

  hudson: buildTokens(
    `    --color-bg: #fafafa;
    --color-surface: #ffffff;
    --color-surface-muted: #f5f5f5;
    --color-border: #e5e5e5;
    --color-text: #171717;
    --color-text-muted: #737373;
    --color-accent: #059669;
    --color-accent-strong: #059669;`,
    `    --color-bg: #0a0a0a;
    --color-surface: #141414;
    --color-surface-muted: #1a1a1a;
    --color-border: #262626;
    --color-text: #e5e5e5;
    --color-text-muted: #737373;
    --color-accent: #34d399;
    --color-accent-strong: #34d399;`,
  ),
}

// ---------------------------------------------------------------------------
// Template arguments used by templates that need project-specific data
// ---------------------------------------------------------------------------

export interface AstroTemplateArgs {
  projectName: string
  theme: ThemeName
  defaultPage: string
}

// ---------------------------------------------------------------------------
// Astro templates
// ---------------------------------------------------------------------------

export const ASTRO_TEMPLATES: Record<string, (args: AstroTemplateArgs) => string> = {
  'package.json': (args) => JSON.stringify({
    name: args.projectName,
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

  'astro.config.mjs': (args) => `import { defineConfig } from 'astro/config'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: '${args.theme === 'hudson' ? 'vitesse-dark' : 'github-dark'}',
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

  'src/styles/tokens.css': (args) => THEME_TOKENS[args.theme],

  'src/styles/base.css': (args) => args.theme === 'hudson' ? `@layer base {
  * {
    box-sizing: border-box;
  }

  html {
    color-scheme: light;
    font-family: "Geist", system-ui, -apple-system, sans-serif;
    font-weight: 300;
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
    font-family: "Geist Mono", ui-monospace, monospace;
    font-weight: 400;
    letter-spacing: 0.025em;
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
    font-family: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  .root {
    isolation: isolate;
  }
}
` : `@layer base {
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

  'src/styles/markdown.css': (args) => args.theme === 'hudson' ? `@layer base {
  .doc-content {
    font-size: 15px;
    line-height: 1.65;
    color: var(--color-text);
    overflow-wrap: break-word;
    min-width: 0;
  }

  .doc-content h1[id] {
    display: none;
  }

  .doc-content h1 {
    font-family: 'Geist Mono', monospace;
    font-weight: 400;
    letter-spacing: 0.025em;
    font-size: 1.75rem;
    color: var(--color-text);
    margin-top: 0;
    margin-bottom: 0.75rem;
    line-height: 1.2;
  }

  .doc-content h2 {
    font-family: 'Geist Mono', monospace;
    font-weight: 400;
    letter-spacing: 0.025em;
    font-size: 1.25rem;
    color: var(--color-text);
    margin-top: 2rem;
    margin-bottom: 0.5rem;
    padding-bottom: 0.375rem;
    border-bottom: 1px solid var(--color-border);
    line-height: 1.3;
    scroll-margin-top: 100px;
  }

  .doc-content h2:first-child {
    margin-top: 0;
  }

  .doc-content h3 {
    font-family: 'Geist Mono', monospace;
    font-weight: 400;
    letter-spacing: 0.025em;
    font-size: 1.0625rem;
    color: var(--color-text);
    margin-top: 1.5rem;
    margin-bottom: 0.375rem;
    line-height: 1.4;
    scroll-margin-top: 100px;
  }

  .doc-content h4 {
    font-family: 'Geist Mono', monospace;
    font-weight: 400;
    font-size: 0.9375rem;
    color: var(--color-text);
    margin-top: 1.25rem;
    margin-bottom: 0.375rem;
  }

  .doc-content p {
    margin-top: 0;
    margin-bottom: 1rem;
  }

  .doc-content ul,
  .doc-content ol {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }

  .doc-content ul {
    list-style-type: disc;
  }

  .doc-content ol {
    list-style-type: decimal;
  }

  .doc-content li {
    margin-bottom: 0.25rem;
  }

  .doc-content li > ul,
  .doc-content li > ol {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }

  .doc-content a {
    color: var(--color-accent);
    text-decoration: none;
    font-weight: 400;
  }

  .doc-content a:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .doc-content strong {
    font-weight: 500;
    color: var(--color-text);
  }

  .doc-content :not(pre) > code {
    background: color-mix(in srgb, var(--color-accent) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-accent) 20%, transparent);
    border-radius: 0.25rem;
    padding: 0.125rem 0.375rem;
    font-size: 0.8125rem;
    font-family: 'Geist Mono', monospace;
    color: var(--color-accent);
  }

  .doc-content pre {
    background: #111111 !important;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    padding: 1rem;
    overflow-x: auto;
    margin-bottom: 1.25rem;
    font-size: 0.8125rem;
    font-family: 'Geist Mono', monospace;
    font-weight: 300;
    line-height: 1.6;
    position: relative;
  }

  .doc-content pre code {
    background: none !important;
    border: none !important;
    padding: 0 !important;
    font-size: inherit;
    font-family: inherit;
    font-weight: inherit;
    color: inherit;
  }

  .doc-content blockquote {
    border-left: 3px solid var(--color-accent);
    padding-left: 1rem;
    margin-left: 0;
    margin-bottom: 1rem;
    color: var(--color-text-muted);
    font-style: italic;
  }

  .doc-content hr {
    border: none;
    border-top: 1px solid var(--color-border);
    margin: 1.5rem 0;
  }

  .doc-content table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.25rem;
    font-family: 'Geist Mono', monospace;
    font-size: 0.8125rem;
  }

  .doc-content thead th {
    text-align: left;
    font-weight: 600;
    color: var(--color-text);
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--color-border);
    white-space: nowrap;
  }

  .doc-content tbody td {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
  }

  .doc-content tbody tr:hover {
    background: color-mix(in srgb, var(--color-border) 40%, transparent);
  }

  .doc-content img {
    max-width: 100%;
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);
  }
}
` : `@layer base {
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

  'src/layouts/BaseLayout.astro': (args) => args.theme === 'hudson' ? `---
import '../styles/global.css'

const { title = 'Docs', description } = Astro.props
const pageTitle = \`\${title} - ${args.projectName}\`
const pageDescription = description || '${args.projectName} documentation'
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content="Dewey" />
    <meta name="description" content={pageDescription} />
    <title>{pageTitle}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap" rel="stylesheet" />
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
    <div class="dl" data-theme-root>
      <header class="dl-header" data-pagefind-ignore>
        <div class="dl-header-left">
          <a href="/" class="dl-header-brand">${args.projectName}</a>
          <span class="dl-header-sep">/</span>
          <a href="/" class="dl-header-brand dl-header-brand--active">Docs</a>
        </div>
        <div class="dl-header-right">
          <a href="/llms.txt" class="dl-header-link">llms.txt</a>
          <button class="dl-search-btn" type="button" data-search-toggle data-pagefind-ignore>
            Search\u2026
            <span class="dl-search-key">\u2318K</span>
          </button>
          <button class="dl-theme-btn" type="button" data-theme-toggle data-pagefind-ignore title="Toggle theme">
            <svg class="dl-theme-icon-light" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            <svg class="dl-theme-icon-dark" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>
        </div>
      </header>
      <div class="dl-body">
        <slot />
      </div>
    </div>
    <div class="dl-search-overlay" data-search-modal data-pagefind-ignore>
      <div class="dl-search-dialog">
        <div class="dl-search-dialog-header">
          <div>
            <p class="dl-search-dialog-label">Search</p>
            <h2 class="dl-search-dialog-title">Find docs fast</h2>
          </div>
          <button class="dl-search-dialog-close" data-search-close>Close</button>
        </div>
        <div id="search-modal" class="dl-search-dialog-body"></div>
        <p id="search-modal-fallback" class="dl-search-dialog-fallback" style="display:none;">
          Search index is generated on build. Run <code>pnpm build</code> to enable Pagefind locally.
        </p>
      </div>
    </div>

    <style is:inline>
      .dl {
        min-height: 100vh;
        background: var(--color-bg);
        color: var(--color-text);
        display: flex;
        flex-direction: column;
      }

      .dl-body {
        display: flex;
        flex: 1;
      }

      /* Header */
      .dl-header {
        height: 48px;
        flex-shrink: 0;
        border-bottom: 1px solid var(--color-border);
        background: var(--color-bg);
        backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        position: sticky;
        top: 0;
        z-index: 50;
      }

      .dl-header-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .dl-header-right {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .dl-header-brand {
        font-family: 'Geist Mono', monospace;
        font-size: 12px;
        font-weight: 400;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--color-text-muted);
        text-decoration: none;
        transition: color 0.15s;
      }

      .dl-header-brand:hover { color: var(--color-text); }
      .dl-header-brand--active { color: var(--color-text); }

      .dl-header-sep {
        color: var(--color-border);
        font-size: 14px;
      }

      .dl-header-link {
        font-family: 'Geist Mono', monospace;
        font-size: 11px;
        color: var(--color-text-muted);
        text-decoration: none;
        transition: color 0.15s;
      }

      .dl-header-link:hover { color: var(--color-accent); }

      .dl-search-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        color: var(--color-text-muted);
        font-family: 'Geist Mono', monospace;
        font-size: 11px;
        font-weight: 300;
        cursor: pointer;
        transition: all 0.15s;
        height: 28px;
      }

      .dl-search-btn:hover {
        border-color: var(--color-text-muted);
        color: var(--color-text);
      }

      .dl-search-key {
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        opacity: 0.6;
      }

      .dl-theme-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        color: var(--color-text-muted);
        cursor: pointer;
        padding: 4px;
        transition: color 0.15s;
      }

      .dl-theme-btn:hover { color: var(--color-text); }

      /* Sun/moon icon toggling */
      .dl-theme-icon-dark { display: none; }
      [data-theme='dark'] .dl-theme-icon-light { display: none; }
      [data-theme='dark'] .dl-theme-icon-dark { display: block; }

      @media (max-width: 640px) {
        .dl-search-btn { display: none; }
      }

      /* Search modal */
      .dl-search-overlay {
        position: fixed;
        inset: 0;
        z-index: 100;
        display: none;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.5);
        padding: 24px;
      }

      .dl-search-overlay.is-open {
        display: flex;
      }

      .dl-search-dialog {
        width: 100%;
        max-width: 640px;
        border-radius: 16px;
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        padding: 24px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      }

      .dl-search-dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .dl-search-dialog-label {
        font-family: 'Geist Mono', monospace;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: var(--color-text-muted);
        margin: 0;
      }

      .dl-search-dialog-title {
        font-size: 18px;
        font-weight: 500;
        margin: 4px 0 0;
      }

      .dl-search-dialog-close {
        font-family: 'Geist Mono', monospace;
        font-size: 11px;
        color: var(--color-text-muted);
        background: none;
        border: none;
        cursor: pointer;
      }

      .dl-search-dialog-close:hover { color: var(--color-text); }

      .dl-search-dialog-body {
        margin-top: 16px;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        background: var(--color-surface-muted);
        padding: 16px;
      }

      .dl-search-dialog-fallback {
        margin-top: 12px;
        font-family: 'Geist Mono', monospace;
        font-size: 11px;
        color: var(--color-text-muted);
      }
    </style>
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
                  if (fb) fb.style.display = 'block'
                }
              })
            }

            var openSearch = function () {
              if (!searchModal) return
              searchModal.classList.add('is-open')
              initPagefind()
            }

            var closeSearch = function () {
              if (!searchModal) return
              searchModal.classList.remove('is-open')
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
            button.style.cssText = 'position:absolute;right:12px;top:12px;border-radius:4px;background:rgba(0,0,0,0.6);padding:4px 8px;font-size:11px;font-family:Geist Mono,monospace;color:#fff;border:none;cursor:pointer;transition:background 0.15s;'
            button.addEventListener('mouseenter', function () { button.style.background = 'rgba(0,0,0,0.8)' })
            button.addEventListener('mouseleave', function () { button.style.background = 'rgba(0,0,0,0.6)' })
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
` : `---
import '../styles/global.css'

const { title = 'Docs' } = Astro.props
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content="Dewey" />
    <title>{title} - ${args.projectName}</title>
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
            <a class="text-lg font-semibold" href="/">${args.projectName}</a>
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

  'src/layouts/DocsLayout.astro': (args) => args.theme === 'hudson' ? `---
import BaseLayout from './BaseLayout.astro'
import SidebarNav from '../components/SidebarNav.astro'
import Toc from '../components/Toc.astro'

const {
  title = 'Docs',
  headings = [],
  description,
  badge,
  rawMarkdown = '',
  agentMarkdown = '',
} = Astro.props
---

<BaseLayout title={title} description={description}>
  <nav class="dl-sidebar" data-pagefind-ignore>
    <SidebarNav />
  </nav>

  <main class="dl-main">
    <div class="dl-content-area">
      <div class="dl-page-actions">
        {rawMarkdown && (
          <button class="dl-copy-btn" data-copy-agent-button>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy for agent
          </button>
        )}
        {rawMarkdown && (
          <button class="dl-copy-btn" data-copy-markdown-button>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy markdown
          </button>
        )}
      </div>

      <article class="doc-content" data-pagefind-body>
        {badge && (
          <span class="dl-badge">{badge}</span>
        )}
        <h1>{title}</h1>
        {description && (
          <p style="color: var(--color-text-muted); font-size: 15px;">{description}</p>
        )}
        <slot />
      </article>

      <div class="dl-agent-footer">
        <span class="dl-agent-footer-label">For AI agents</span>
        <div class="dl-agent-footer-links">
          <a href="/llms.txt">llms.txt</a>
          <span class="dl-agent-footer-sep">|</span>
          <a href="/llms-full.txt">llms-full.txt</a>
        </div>
      </div>
    </div>
  </main>

  <aside class="dl-toc" data-pagefind-ignore>
    <Toc headings={headings} />
  </aside>

  <style is:inline>
    .dl-sidebar {
      width: 260px;
      flex-shrink: 0;
      border-right: 1px solid var(--color-border);
      overflow-y: auto;
      padding: 16px 12px 20px 20px;
      position: sticky;
      top: 48px;
      height: calc(100vh - 48px);
      align-self: flex-start;
    }

    @media (max-width: 768px) {
      .dl-sidebar { display: none; }
    }

    .dl-main {
      flex: 1;
      min-width: 0;
    }

    .dl-content-area {
      max-width: 768px;
      margin: 0 auto;
      padding: 16px 24px 80px;
      position: relative;
    }

    .dl-page-actions {
      position: absolute;
      top: 16px;
      right: 24px;
      display: flex;
      gap: 8px;
      z-index: 5;
    }

    .dl-copy-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid var(--color-border);
      background: none;
      color: var(--color-text-muted);
      font-family: 'Geist Mono', monospace;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .dl-copy-btn:hover {
      color: var(--color-text);
      border-color: var(--color-text-muted);
    }

    .dl-badge {
      display: inline-block;
      margin-bottom: 12px;
      padding: 4px 10px;
      font-family: 'Geist Mono', monospace;
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      border-radius: 999px;
      border: 1px solid var(--color-border);
      color: var(--color-accent);
    }

    .dl-agent-footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .dl-agent-footer-label {
      font-family: 'Geist Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }

    .dl-agent-footer-links {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dl-agent-footer-links a {
      font-family: 'Geist Mono', monospace;
      font-size: 11px;
      color: var(--color-text-muted);
      text-decoration: none;
      transition: color 0.15s;
    }

    .dl-agent-footer-links a:hover { color: var(--color-accent); }

    .dl-agent-footer-sep {
      color: var(--color-border);
      font-size: 11px;
    }

    .dl-toc {
      width: 268px;
      flex-shrink: 0;
      padding: 16px 20px 40px 16px;
      position: sticky;
      top: 48px;
      height: calc(100vh - 48px);
      overflow-y: auto;
      align-self: flex-start;
    }

    @media (max-width: 1280px) {
      .dl-toc { display: none; }
    }
  </style>

  <script is:inline define:vars={{ rawMarkdown, agentMarkdown }}>
    const safeCopy = async (content, btn) => {
      if (!content) return
      try {
        await navigator.clipboard.writeText(content)
        if (btn) {
          const orig = btn.textContent
          btn.textContent = ' Copied!'
          setTimeout(() => { btn.textContent = orig }, 2000)
        }
      } catch {}
    }

    document.querySelector('[data-copy-agent-button]')?.addEventListener('click', function() {
      safeCopy(agentMarkdown || rawMarkdown, this)
    })

    document.querySelector('[data-copy-markdown-button]')?.addEventListener('click', function() {
      safeCopy(rawMarkdown, this)
    })
  </script>
</BaseLayout>
` : `---
import BaseLayout from './BaseLayout.astro'
import SidebarNav from '../components/SidebarNav.astro'
import Toc from '../components/Toc.astro'

const {
  title = 'Docs',
  headings = [],
  description,
  badge,
  rawMarkdown = '',
  agentMarkdown = '',
} = Astro.props
---

<BaseLayout title={title}>
  <div class="grid gap-8 lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)_var(--toc-width)]">
    <aside class="hidden lg:block" data-pagefind-ignore>
      <div class="sticky top-24">
        <SidebarNav />
      </div>
    </aside>

    <article class="min-w-0">
      <div class="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          {badge && (
            <span class="inline-block mb-3 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest rounded-full border border-[var(--color-border)] text-[var(--color-accent)]">
              {badge}
            </span>
          )}
          <h1 class="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p class="mt-3 text-lg text-[var(--color-text-muted)]">{description}</p>
          )}
        </div>
        {rawMarkdown && (
          <div class="flex items-center gap-2 flex-shrink-0 pt-1">
            <button
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-surface)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              data-copy-agent-button
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
              Copy for agent
            </button>
            <button
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-surface)] transition hover:border-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              data-copy-markdown-button
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy markdown
            </button>
          </div>
        )}
      </div>
      <div class="doc-content" data-pagefind-body>
        <slot />
      </div>
    </article>

    <aside class="hidden lg:block" data-pagefind-ignore>
      <div class="sticky top-24">
        <Toc headings={headings} />
      </div>
    </aside>
  </div>

  <script is:inline define:vars={{ rawMarkdown, agentMarkdown }}>
    const safeCopy = async (content, btn) => {
      if (!content) return
      try {
        await navigator.clipboard.writeText(content)
        if (btn) {
          const orig = btn.textContent
          btn.textContent = ' Copied!'
          setTimeout(() => { btn.textContent = orig }, 2000)
        }
      } catch {}
    }

    document.querySelector('[data-copy-agent-button]')?.addEventListener('click', function() {
      safeCopy(agentMarkdown || rawMarkdown, this)
    })

    document.querySelector('[data-copy-markdown-button]')?.addEventListener('click', function() {
      safeCopy(rawMarkdown, this)
    })
  </script>
</BaseLayout>
`,

  'src/components/SidebarNav.astro': (args) => args.theme === 'hudson' ? `---
import { navGroups } from '../lib/nav'

const currentPath = Astro.url.pathname.replace(/\\/$/, '') || '/'
---

<nav>
  {navGroups.map((group, i) => (
    <div class={\`dl-nav-section \${i > 0 ? 'dl-nav-section--bordered' : ''}\`}>
      <button class="dl-nav-label" data-nav-toggle aria-expanded="true">
        {group.title}
        <svg class="dl-nav-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div data-nav-list>
        <ul class="dl-nav-list">
          {group.items.map((item) => {
            const isActive = currentPath === item.href
            return (
              <li>
                <a
                  href={item.href}
                  class={\`dl-nav-item \${isActive ? 'active' : ''}\`}
                >
                  {item.title}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  ))}

  <div class="dl-nav-section dl-nav-section--bordered">
    <div class="dl-nav-label dl-nav-label--static">For AI Agents</div>
    <ul class="dl-nav-list">
      <li><a href="/llms.txt" class="dl-nav-item dl-nav-item--muted">llms.txt</a></li>
      <li><a href="/llms-full.txt" class="dl-nav-item dl-nav-item--muted">llms-full.txt</a></li>
    </ul>
  </div>
</nav>

<style is:inline>
  .dl-nav-section { margin-bottom: 4px; }

  .dl-nav-section--bordered {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);
  }

  .dl-nav-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0;
    margin-bottom: 8px;
    font-family: 'Geist Mono', monospace;
    font-size: 10px;
    font-weight: 400;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.15s;
  }

  .dl-nav-label:hover { color: var(--color-text); }

  .dl-nav-label--static {
    cursor: default;
  }

  .dl-nav-label--static:hover { color: var(--color-text-muted); }

  .dl-nav-chevron {
    transition: transform 0.2s;
    opacity: 0.5;
  }

  .dl-nav-label[aria-expanded='false'] .dl-nav-chevron {
    transform: rotate(-90deg);
  }

  [data-nav-list][data-collapsed='true'] {
    display: none;
  }

  .dl-nav-list {
    list-style: none;
    padding: 0;
    margin: 0 0 2px;
  }

  .dl-nav-item {
    display: block;
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 300;
    color: color-mix(in srgb, var(--color-text) 55%, transparent);
    text-decoration: none;
    transition: all 0.15s;
  }

  .dl-nav-item:hover {
    color: var(--color-text);
    background: color-mix(in srgb, var(--color-border) 40%, transparent);
  }

  .dl-nav-item.active {
    color: var(--color-accent);
    background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  }

  .dl-nav-item--muted {
    font-family: 'Geist Mono', monospace;
    font-size: 13px;
    color: var(--color-text-muted);
  }

  .dl-nav-item--muted:hover {
    color: var(--color-text);
  }
</style>

<script is:inline>
  document.querySelectorAll('[data-nav-toggle]').forEach(function (btn) {
    var list = btn.parentElement.querySelector('[data-nav-list]')
    if (!list) return
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true'
      btn.setAttribute('aria-expanded', String(!expanded))
      list.dataset.collapsed = String(expanded)
    })
  })
</script>
` : `---
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

  'src/components/Toc.astro': (args) => args.theme === 'hudson' ? `---
const { headings = [] } = Astro.props
const filtered = headings.filter((heading) => heading.depth >= 2 && heading.depth <= 3)
---

<div data-toc>
  <p class="dl-toc-label">On this page</p>
  <ul class="dl-toc-list">
    {filtered.map((heading) => (
      <li>
        <a
          class="dl-toc-link"
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
      { rootMargin: '-80px 0px -66% 0px' },
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
  .dl-toc-label {
    font-family: 'Geist Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--color-text-muted);
    margin: 0 0 16px;
  }

  .dl-toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    border-left: 1px solid var(--color-border);
  }

  .dl-toc-link {
    display: block;
    padding: 2px 0 2px 14px;
    font-family: 'Geist Mono', monospace;
    font-size: 12px;
    font-weight: 400;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.15s;
    margin-left: -1px;
    border-left: 1px solid transparent;
  }

  .dl-toc-link:hover { color: var(--color-text); }

  .dl-toc-link.is-active {
    color: var(--color-text);
    font-weight: 400;
    border-left-color: var(--color-accent);
  }

  .dl-toc-link[data-level='3'] { padding-left: 26px; }
</style>
` : `---
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

  'src/pages/index.astro': () => `---
import DocsLayout from '../layouts/DocsLayout.astro'
import { navGroups } from '../lib/nav'
---

<DocsLayout title="Documentation" headings={[]} rawMarkdown="" agentMarkdown="">
  <div class="space-y-10">
    {navGroups.map((group) => (
      <div>
        <h2 id={group.id} class="text-xl font-semibold tracking-tight mb-4" style="border: none; margin-top: 0; padding-top: 0;">{group.title}</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px;">
          {group.items.map((item) => (
            <a
              href={item.href}
              class="group block rounded-lg border border-[var(--color-border)] p-5 text-sm no-underline transition hover:border-[var(--color-text-muted)] hover:bg-[var(--color-surface)]"
            >
              <span class="font-medium text-[var(--color-text)]">{item.title}</span>
              <span class="mt-2 flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                Read more
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </a>
          ))}
        </div>
      </div>
    ))}
  </div>
</DocsLayout>
`,

  'src/pages/docs/[...slug].astro': (args) => `---
import DocsLayout from '../../layouts/DocsLayout.astro'

export async function getStaticPaths() {
  const markdownFiles = import.meta.glob('../../../docs/**/*.md')

  const entries = Object.entries(markdownFiles).filter(([filePath]) => {
    if (filePath.endsWith('.agent.md')) return false
    return true
  })

  return Promise.all(
    entries.map(async ([filePath, loader]) => {
      const page = await loader()
      const slug = filePath.split('/docs/')[1].replace(/\\.md$/, '')

      return {
        params: { slug },
        props: { page, filePath },
      }
    }),
  )
}

const { page, filePath } = Astro.props
const { Content, frontmatter } = page
const headings = (await page.getHeadings?.()) ?? page.headings ?? []
const slug = Astro.params.slug || '${args.defaultPage}'
const fileName = slug.split('/').pop() ?? 'Docs'
const fallbackTitle = fileName
  .split('-')
  .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  .join(' ')
const title = frontmatter?.title ?? fallbackTitle
const description = frontmatter?.description

const rawMarkdownFiles = import.meta.glob('../../../docs/**/*.md', {
  query: '?raw',
  import: 'default',
})
const agentMarkdownFiles = import.meta.glob('../../../docs/**/*.agent.md', {
  query: '?raw',
  import: 'default',
})

const rawLoader = rawMarkdownFiles[filePath]
const rawMarkdown = rawLoader ? await rawLoader() : ''

const agentFilePath = filePath.replace(/\\.md$/, '.agent.md')
const agentLoader = agentMarkdownFiles[agentFilePath]
const agentMarkdown = agentLoader ? await agentLoader() : ''
---

<DocsLayout title={title} headings={headings} description={description} rawMarkdown={rawMarkdown} agentMarkdown={agentMarkdown}>
  <Content />
</DocsLayout>
`,
}

// ---------------------------------------------------------------------------
// Dewey-owned files — these are regenerated by `dewey update`
// ---------------------------------------------------------------------------

export const DEWEY_OWNED_FILES = [
  'astro.config.mjs',
  'tsconfig.json',
  'src/styles/global.css',
  'src/styles/tokens.css',
  'src/styles/base.css',
  'src/styles/markdown.css',
  'src/layouts/BaseLayout.astro',
  'src/layouts/DocsLayout.astro',
  'src/components/SidebarNav.astro',
  'src/components/Toc.astro',
  'src/lib/nav.ts',
  'src/pages/index.astro',
  'src/pages/docs/[...slug].astro',
] as const

// Consumer-owned files — never touched by update
export const CONSUMER_OWNED_FILES = [
  'package.json',
  '.gitignore',
] as const
