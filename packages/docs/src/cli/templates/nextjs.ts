// ---------------------------------------------------------------------------
// Next.js template definitions
// Used by `dewey create` and `dewey update` for Next.js doc sites.
// ---------------------------------------------------------------------------

import { VALID_THEMES, resolveTheme, type ThemeName, type TemplateId } from './themes.js'
import { DEWEY_VERSION } from '../version.js'

export { VALID_THEMES, resolveTheme }
export type { ThemeName }

// ---------------------------------------------------------------------------
// Template arguments
// ---------------------------------------------------------------------------

export interface NextjsTemplateArgs {
  projectName: string
  theme: ThemeName
  templateId: TemplateId
  defaultPage: string
}

// ---------------------------------------------------------------------------
// Ejectible component metadata
// ---------------------------------------------------------------------------

export interface EjectibleComponent {
  tier: 'safe' | 'advanced'
  propsType: string
  defaultImport: string
  description: string
}

export const EJECTIBLE_COMPONENTS: Record<string, EjectibleComponent> = {
  Header: {
    tier: 'safe',
    propsType: 'HeaderProps',
    defaultImport: 'Header',
    description: 'Sticky header with project name, navigation, and theme toggle',
  },
  Sidebar: {
    tier: 'safe',
    propsType: 'SidebarProps',
    defaultImport: 'Sidebar',
    description: 'Navigation sidebar with collapsible groups and active page highlight',
  },
  TableOfContents: {
    tier: 'safe',
    propsType: 'AutoTocProps',
    defaultImport: 'AutoTableOfContents',
    description: 'On-this-page heading links with scroll spy (accepts markdown prop)',
  },
  MarkdownContent: {
    tier: 'advanced',
    propsType: 'MarkdownContentProps',
    defaultImport: 'MarkdownContent',
    description: 'Markdown rendering pipeline with syntax highlighting and plugins',
  },
}

// ---------------------------------------------------------------------------
// Next.js templates
// ---------------------------------------------------------------------------

export const NEXTJS_TEMPLATES: Record<string, (args: NextjsTemplateArgs) => string> = {

  'tailwind.config.ts': () => `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@arach/dewey/dist/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
`,

  'postcss.config.js': () => `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`,

  'next.config.js': () => `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  transpilePackages: ['@arach/dewey'],
}

module.exports = nextConfig
`,

  'tsconfig.json': () => JSON.stringify({
    compilerOptions: {
      target: 'es5',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      plugins: [{ name: 'next' }],
      paths: { '@/*': ['./src/*'] },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  }, null, 2) + '\n',

  'src/app/layout.tsx': (args) => {
    const isHudson = args.templateId === 'hudson'
    const fontLink = isHudson
      ? 'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap'
      : 'https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600&display=swap'
    return `import type { Metadata } from 'next'
import '@arach/dewey/css/base.css'
import '@arach/dewey/css/tokens'
import '@arach/dewey/css/colors/${args.theme}.css'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: '${args.projectName}',
  description: '${args.projectName} Documentation',
  generator: 'Dewey',
  other: { 'dewey-version': '${DEWEY_VERSION}' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-align="baseline" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="${fontLink}"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
`
  },

  'src/app/globals.css': (args) => {
    const isHudson = args.templateId === 'hudson'
    const fontVars = isHudson
      ? `  --dw-font-sans: 'Geist', system-ui, -apple-system, sans-serif;
  --dw-font-display: 'Geist', system-ui, -apple-system, sans-serif;
  --dw-font-mono: 'Geist Mono', ui-monospace, monospace;`
      : `  --dw-font-sans: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
  --dw-font-display: 'Fraunces', ui-serif, Georgia, serif;
  --dw-font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;`

    return `@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── Foundation ──────────────────────────────────────────── */
*,
*::before,
*::after {
  box-sizing: border-box;
}

:root {
${fontVars}

  /* Column alignment — all three columns share these to stay in sync */
  --dw-sidebar-top: 3.45rem;
  --dw-content-top: 2rem;
  --dw-toc-title-top: 1.5rem;
}

body {
  margin: 0;
  min-height: 100vh;
  background: var(--dw-background);
  color: var(--dw-foreground);
  font-family: var(--dw-font-sans);
  font-size: 0.9375rem;
  line-height: 1.75;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;${isHudson ? '\n  font-weight: 300;' : ''}
}

a {
  color: inherit;
  text-decoration: none;
}

/* ─── Header ─────────────────────────────────────────────── */
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--dw-header-bg, var(--dw-background));
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border-bottom: 1px solid var(--dw-header-border, var(--dw-border));
}

.site-header-inner {
  padding: 0 2rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  text-decoration: none;
}

.site-brand-name {
  font-family: var(--dw-font-mono);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--dw-foreground);
}

.site-brand-tag {
  font-family: var(--dw-font-mono);
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--dw-primary);
  background: color-mix(in srgb, var(--dw-primary) 10%, transparent);
  padding: 0.2rem 0.5rem;
  border-radius: var(--dw-radius-full, 999px);
}

.site-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.site-header-github {
  color: var(--dw-muted-foreground);
  transition: color 150ms;
  display: flex;
}

.site-header-github:hover {
  color: var(--dw-foreground);
}

/* Hide dewey's default header — replaced by site-header */
.dw-header { display: none !important; }

/* ─── Layout ─────────────────────────────────────────────── */
.docs-layout {
  display: flex;
  min-height: calc(100vh - 4rem);
}

/* ─── Sidebar ────────────────────────────────────────────── */
.docs-sidebar {
  width: 260px;
  flex-shrink: 0;
  padding: var(--dw-sidebar-top) 1.5rem 3rem 2rem;
  border-right: 1px solid var(--dw-border);
  background: var(--dw-sidebar-bg, var(--dw-background));
}

.docs-sidebar-sticky {
  position: sticky;
  top: calc(4rem + 1rem);
  max-height: calc(100vh - 4rem - 1.5rem);
  overflow-y: auto;
}

/* Hide the sidebar's own logo/title — already in the header */
.dw-sidebar-header { display: none !important; }

/* Remove inner padding so nav items align with header logo */
.dw-sidebar-nav,
.dw-sidebar-list {
  padding: 0 !important;
  margin: 0 !important;
}

.dw-sidebar-group-title {
  font-size: 0.625rem !important;
  font-weight: 700 !important;
  font-family: var(--dw-font-mono) !important;
  letter-spacing: 0.12em !important;
  text-transform: uppercase !important;
  color: var(--dw-muted-foreground) !important;
  margin: 1.75rem 0 0.5rem !important;
  padding: 0 !important;
}

.dw-sidebar-group:first-child .dw-sidebar-group-title {
  margin-top: 0 !important;
}

.dw-sidebar-item,
.dw-sidebar-item a {
  padding-left: 1rem !important;
}

.dw-sidebar-item-active {
  font-weight: 600 !important;
  color: #ffffff !important;
  background: var(--dw-primary) !important;
  border-radius: 0.75rem !important;
}

/* ─── Main Content Area ──────────────────────────────────── */
.docs-main {
  flex: 1;
  min-width: 0;
  padding: 0;
}

/* ─── Content Grid ───────────────────────────────────────── */
.docs-content-grid {
  display: flex;
  gap: 0;
}

.docs-article {
  flex: 1;
  min-width: 0;
  max-width: 52rem;
  padding: var(--dw-content-top) 3rem 4rem 3.5rem;
}

/* ─── Article Header ─────────────────────────────────────── */
.docs-article-header {
  margin-bottom: 2.5rem;
}

.docs-article-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
}

.docs-article-title {
  font-family: var(--dw-font-display);
  font-size: 2.5rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin: 0;
  color: var(--dw-foreground);
}

.docs-article-description {
  margin-top: 1rem;
  font-size: 1.0625rem;
  color: var(--dw-foreground);
  opacity: 0.7;
  line-height: 1.65;
}

.docs-article-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  padding-top: 0.75rem;
}

/* ─── Typography ─────────────────────────────────────────── */
/* Hide the markdown-rendered h1 — the article header already shows the title */
.docs-article > h1:not(.docs-article-title) {
  display: none;
}

.docs-article h1,
.docs-article h2,
.docs-article h3,
.docs-article h4 {
  font-family: var(--dw-font-sans);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--dw-foreground);
}

.docs-article h2 {
  font-size: 1.5rem;
  margin-top: 3rem;
  margin-bottom: 1rem;
}

.docs-article h3 {
  font-size: 1.2rem;
  margin-top: 2.25rem;
  margin-bottom: 0.75rem;
}

.docs-article h4 {
  font-size: 1rem;
  margin-top: 1.75rem;
  margin-bottom: 0.5rem;
  color: var(--dw-muted-foreground);
  font-weight: 600;
}

.docs-article p {
  margin: 0 0 1.25rem;
  color: var(--dw-foreground);
}

.docs-article ul,
.docs-article ol {
  margin: 0 0 1.25rem;
  padding-left: 1.5rem;
}

.docs-article li {
  margin-bottom: 0.375rem;
}

.docs-article li > p {
  margin-bottom: 0.5rem;
}

.docs-article a {
  color: var(--dw-primary);
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--dw-primary) 30%, transparent);
  text-underline-offset: 2px;
  transition: text-decoration-color 150ms;
}

.docs-article a:hover {
  text-decoration-color: var(--dw-primary);
}

.docs-article strong {
  font-weight: 600;
  color: var(--dw-foreground);
}

.docs-article hr {
  border: none;
  margin: 2rem 0;
}

/* ─── Heading Anchor Links ───────────────────────────────── */
h1 > a[title="Link to this section"],
h2 > a[title="Link to this section"],
h3 > a[title="Link to this section"],
h4 > a[title="Link to this section"] {
  color: var(--dw-muted-foreground) !important;
  opacity: 0;
  transition: opacity 150ms;
}

h1:hover > a[title="Link to this section"],
h2:hover > a[title="Link to this section"],
h3:hover > a[title="Link to this section"],
h4:hover > a[title="Link to this section"] {
  opacity: 0.5;
}

/* ─── Code Blocks ────────────────────────────────────────── */
.docs-article pre {
  background: hsl(220, 25%, 12%) !important;
  color: hsl(220, 15%, 82%) !important;
  border: 1px solid hsl(220, 20%, 18%);
  border-radius: var(--dw-radius-md, 0.75rem);
  padding: 1.25rem 1.5rem;
  margin: 1.5rem 0;
  overflow-x: auto;
  font-family: var(--dw-font-mono);
  font-size: 0.8125rem;
  line-height: 1.7;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
}

.docs-article pre code {
  background: none !important;
  border: none !important;
  padding: 0 !important;
  color: inherit !important;
  font-size: inherit;
  font-weight: 400;
}

/* Force dewey's code block wrapper to use dark theme */
.docs-article .group > div,
.docs-article [class*="code-block"],
.docs-article [class*="CodeBlock"] {
  background: hsl(220, 25%, 12%) !important;
  border-radius: var(--dw-radius-md, 0.75rem) !important;
  border: 1px solid hsl(220, 20%, 18%) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Inline code */
.docs-article p > code,
.docs-article li > code,
.docs-article td > code,
.docs-article th > code,
.docs-article h2 > code,
.docs-article h3 > code,
.docs-article h4 > code,
.docs-article strong > code {
  background: var(--dw-accent, rgba(0, 0, 0, 0.04));
  border: 1px solid var(--dw-border);
  padding: 0.125rem 0.4rem;
  border-radius: var(--dw-radius-sm, 0.25rem);
  font-family: var(--dw-font-mono);
  font-size: 0.8em;
  font-weight: 500;
  color: var(--dw-foreground);
}

/* ─── Syntax Highlighting — One Dark Theme ───────────────── */
.hljs-keyword,
.hljs-selector-tag,
.hljs-built_in { color: #c678dd; }

.hljs-name,
.hljs-tag { color: #e06c75; }

.hljs-string,
.hljs-section,
.hljs-attribute,
.hljs-literal,
.hljs-template-tag,
.hljs-template-variable { color: #98c379; }

.hljs-title,
.hljs-type { color: #e5c07b; }

.hljs-number,
.hljs-symbol,
.hljs-bullet,
.hljs-link { color: #d19a66; }

.hljs-params,
.hljs-variable { color: #e06c75; }

.hljs-comment,
.hljs-quote { color: hsl(220, 10%, 48%); font-style: italic; }

.hljs-meta,
.hljs-meta .hljs-keyword { color: #61afef; }

.hljs-attr { color: #d19a66; }

.hljs-function .hljs-title,
.hljs-title.function_ { color: #61afef; }

.hljs-addition { color: #98c379; background: rgba(152, 195, 121, 0.1); }

.hljs-deletion { color: #e06c75; background: rgba(224, 108, 117, 0.1); }

/* ─── Tables ─────────────────────────────────────────────── */
.docs-article table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 1.5rem 0;
  font-size: 0.875rem;
  border: 1px solid var(--dw-border);
  border-radius: var(--dw-radius-md, 0.75rem);
  overflow: hidden;
}

.docs-article th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--dw-muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: var(--dw-secondary);
  border-bottom: 1px solid var(--dw-border);
}

.docs-article td {
  padding: 0.625rem 1rem;
  border-bottom: 1px solid color-mix(in srgb, var(--dw-border) 60%, transparent);
  color: var(--dw-foreground);
  vertical-align: top;
}

.docs-article th + th,
.docs-article td + td {
  border-left: 1px solid color-mix(in srgb, var(--dw-border) 60%, transparent);
}

.docs-article tr:last-child td {
  border-bottom: none;
}

.docs-article tr:hover td {
  background: color-mix(in srgb, var(--dw-accent, var(--dw-secondary)) 50%, transparent);
}

/* ─── Blockquotes ────────────────────────────────────────── */
.docs-article blockquote {
  border-left: 3px solid var(--dw-primary);
  background: color-mix(in srgb, var(--dw-primary) 5%, transparent);
  border-radius: 0 var(--dw-radius, 0.375rem) var(--dw-radius, 0.375rem) 0;
  padding: 1rem 1.25rem;
  margin: 1.5rem 0;
  color: var(--dw-muted-foreground);
}

.docs-article blockquote p:last-child {
  margin-bottom: 0;
}

/* ─── Table of Contents ──────────────────────────────────── */
.docs-toc {
  width: 200px;
  flex-shrink: 0;
  border-left: 1px solid var(--dw-border);
  padding: 0 1.5rem 3rem 1.5rem;
  min-height: calc(100vh - 4rem);
}

.docs-toc-sticky {
  position: sticky;
  top: calc(4rem + 2rem);
  max-height: calc(100vh - 4rem - 3rem);
  overflow-y: auto;
  font-size: 0.75rem;
}

/* "On this page" title — baseline-aligned with article title */
.dw-toc-title {
  font-size: 0.6875rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.1em !important;
  text-transform: uppercase !important;
  color: var(--dw-muted-foreground) !important;
  margin: 0 0 0.75rem !important;
  padding: 0 !important;
  margin-top: var(--dw-toc-title-top) !important;
}

.dw-toc {
  padding: 0 !important;
  margin: 0 !important;
}

/* ─── Agent Toggle & Banner ──────────────────────────────── */
.docs-agent-toggle {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--dw-radius-full, 999px);
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 150ms;
  color: var(--dw-muted-foreground);
  border: 1px solid var(--dw-border);
  background: var(--dw-background);
}

.docs-agent-toggle:hover {
  border-color: var(--dw-primary);
  color: var(--dw-primary);
  background: color-mix(in srgb, var(--dw-primary) 5%, transparent);
}

.docs-agent-toggle.active {
  background: color-mix(in srgb, var(--dw-primary) 10%, transparent);
  border-color: color-mix(in srgb, var(--dw-primary) 40%, transparent);
  color: var(--dw-primary);
}

.docs-agent-banner {
  margin-bottom: 1.5rem;
  padding: 0.625rem 1rem;
  border-radius: var(--dw-radius, 0.375rem);
  font-size: 0.8125rem;
  background: color-mix(in srgb, var(--dw-primary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--dw-primary) 20%, transparent);
  color: var(--dw-primary);
}

/* ─── Footer ─────────────────────────────────────────────── */
.docs-agent-footer {
  margin-top: 4rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--dw-border);
  font-size: 0.8125rem;
  color: var(--dw-muted-foreground);
  display: flex;
  gap: 1rem;
  align-items: center;
}

.docs-agent-footer a {
  color: var(--dw-primary);
}

.docs-agent-footer a:hover {
  text-decoration: underline;
}

/* ─── Search ─────────────────────────────────────────────── */
.search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

.search-modal {
  background: var(--dw-background);
  border: 1px solid var(--dw-border);
  border-radius: var(--dw-radius-lg, 1rem);
  width: 90%;
  max-width: 560px;
  max-height: 70vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
}

/* Pagefind */
.pagefind-ui { color: var(--dw-foreground); }
.pagefind-ui__form input {
  background: var(--dw-secondary) !important;
  color: var(--dw-foreground) !important;
  border: 1px solid var(--dw-border) !important;
}
.pagefind-ui__result {
  background: var(--dw-muted);
  color: var(--dw-foreground);
  border: 1px solid var(--dw-border);
  border-radius: var(--dw-radius, 0.375rem);
  padding: 12px 14px;
}
.pagefind-ui__result-link { color: var(--dw-foreground) !important; font-weight: 600; }
.pagefind-ui__result-link:hover { color: var(--dw-primary) !important; }
.pagefind-ui__result-excerpt { color: var(--dw-muted-foreground) !important; }
.pagefind-ui__result-excerpt mark,
.pagefind-ui__result-title mark {
  background: color-mix(in srgb, var(--dw-primary) 25%, transparent);
  color: var(--dw-foreground);
  border-radius: 4px;
  padding: 0 2px;
}
.pagefind-ui__message { color: var(--dw-muted-foreground) !important; }
.pagefind-ui__button {
  background: var(--dw-muted) !important;
  color: var(--dw-foreground) !important;
  border: 1px solid var(--dw-border) !important;
}

/* ─── Midpoint Alignment Mode ────────────────────────────── */
[data-align="midpoint"] {
  --dw-sidebar-top: 2.85rem;
  --dw-toc-title-top: 0.9rem;
}

/* ─── Responsive ─────────────────────────────────────────── */
@media (max-width: 1280px) {
  .docs-toc { display: none; }
}

@media (max-width: 1024px) {
  .docs-sidebar { display: none; }
  .docs-main { padding: 2rem 1.5rem 3rem; }
}

@media (max-width: 768px) {
  .docs-article-title { font-size: 2rem; }
  .docs-article h2 { font-size: 1.3rem; }
  .docs-article pre { padding: 1rem; font-size: 0.75rem; }
}
`
  },

  'src/app/providers.tsx': () => `'use client'

import { DeweyProvider } from '@arach/dewey'
import { providerProps } from '@/lib/dewey'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DeweyProvider {...providerProps}>
      {children}
    </DeweyProvider>
  )
}
`,

  'src/app/page.tsx': (args) => `import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/docs/${args.defaultPage}')
}
`,

  'src/components/Search.tsx': () => `'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function Search() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const loadedRef = useRef(false)

  const loadPagefind = useCallback(async () => {
    if (loadedRef.current || !containerRef.current) return
    loadedRef.current = true

    try {
      // Load Pagefind UI CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/pagefind/pagefind-ui.css'
      document.head.appendChild(link)

      // Load and initialize Pagefind UI
      // @ts-expect-error — pagefind-ui.js is generated at build time by postbuild
      const mod = await import(/* webpackIgnore: true */ '/pagefind/pagefind-ui.js')
      const PagefindUI = mod.PagefindUI || mod.default
      new PagefindUI({
        element: containerRef.current,
        showSubResults: true,
        showImages: false,
      })

      // Focus the search input
      setTimeout(() => {
        const input = containerRef.current?.querySelector<HTMLInputElement>('input')
        input?.focus()
      }, 100)
    } catch {
      // Pagefind not built yet — show hint
      if (containerRef.current) {
        containerRef.current.innerHTML =
          '<p style="padding:1rem;color:var(--dw-muted-foreground);font-size:0.875rem;">Search index not found. Run <code>npm run build</code> to generate it.</p>'
      }
    }
  }, [])

  useEffect(() => {
    if (open) loadPagefind()
  }, [open, loadPagefind])

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.375rem 0.75rem',
          borderRadius: '0.5rem',
          fontSize: '0.8125rem',
          color: 'var(--dw-muted-foreground)',
          background: 'var(--dw-muted)',
          border: '1px solid var(--dw-border)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        Search\u2026
        <kbd style={{ fontSize: '0.6875rem', opacity: 0.6, marginLeft: '0.25rem' }}>\u2318K</kbd>
      </button>
      {open && (
        <div className="search-overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className="search-modal">
            <div ref={containerRef} />
          </div>
        </div>
      )}
    </>
  )
}
`,

  'src/app/docs/layout.tsx': (args) => `'use client'

import { usePathname } from 'next/navigation'
import { components, siteConfig } from '@/lib/dewey'
import { getNavTree } from '@/lib/navigation'
import { Search } from '@/components/Search'

const { Sidebar } = components

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const tree = getNavTree()
  const currentPage = pathname.replace(/^\\/docs\\//, '').replace(/\\/$/, '') || siteConfig.defaultPage

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <a href={siteConfig.basePath} className="site-brand">
            <span className="site-brand-name">${args.projectName.toLowerCase()}</span>
            <span className="site-brand-tag">docs</span>
          </a>
          <div className="site-header-actions">
            <Search />
          </div>
        </div>
      </header>
      <div className="docs-layout">
        <aside className="docs-sidebar">
          <div className="docs-sidebar-sticky">
            <Sidebar
              tree={tree}
              currentPage={currentPage}
              projectName={siteConfig.name}
              basePath={siteConfig.basePath}
            />
          </div>
        </aside>
        <main className="docs-main">
          {children}
        </main>
      </div>
    </>
  )
}
`,

  'src/app/docs/[...slug]/page.tsx': () => `import { getDocBySlug, getAllDocSlugs } from '@/lib/docs'
import { DocContent } from './content'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateStaticParams() {
  const slugs = getAllDocSlugs()
  return slugs.map((slug) => ({ slug: slug.split('/') }))
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params
  const slugStr = slug.join('/')
  const doc = getDocBySlug(slugStr)

  if (!doc) {
    return <div>Page not found</div>
  }

  return <DocContent doc={doc} />
}
`,

  'src/app/docs/[...slug]/content.tsx': () => `'use client'

import { useState } from 'react'
import { components } from '@/lib/dewey'
import { CopyButtons } from '@arach/dewey'
import type { DocData } from '@/lib/docs'

const { MarkdownContent, TableOfContents } = components

export function DocContent({ doc }: { doc: DocData }) {
  const [viewAgent, setViewAgent] = useState(false)
  const activeContent = viewAgent && doc.agentContent ? doc.agentContent : doc.content

  return (
    <div className="docs-content-grid">
      <article className="docs-article">
        <div className="docs-article-header">
          <div className="docs-article-header-top">
            <div>
              <h1 className="docs-article-title">{doc.title}</h1>
              {doc.description && (
                <p className="docs-article-description">{doc.description}</p>
              )}
            </div>
            <div className="docs-article-actions">
              {doc.agentContent && (
                <button
                  onClick={() => setViewAgent(!viewAgent)}
                  className={\`docs-agent-toggle\${viewAgent ? ' active' : ''}\`}
                  title={viewAgent ? 'Switch to human view' : 'View agent-optimized version'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
                  </svg>
                  <span>{viewAgent ? 'Human view' : 'Agent view'}</span>
                </button>
              )}
              <CopyButtons
                markdownContent={doc.content}
                agentContent={doc.agentContent}
              />
            </div>
          </div>
        </div>
        {viewAgent && (
          <div className="docs-agent-banner">
            Viewing agent-optimized content — dense, structured, designed for LLMs
          </div>
        )}
        <MarkdownContent content={activeContent} />
        <footer className="docs-agent-footer">
          <span>AI-ready docs</span>
          <a href="/llms.txt" target="_blank" rel="noopener">llms.txt</a>
          <a href="/AGENTS.md" target="_blank" rel="noopener">AGENTS.md</a>
        </footer>
      </article>
      <aside className="docs-toc">
        <div className="docs-toc-sticky">
          <TableOfContents markdown={activeContent} />
        </div>
      </aside>
    </div>
  )
}
`,

  'src/lib/docs.ts': () => `import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface DocData {
  slug: string
  title: string
  description?: string
  content: string
  agentContent?: string
  order: number
}

const docsDirectory = path.join(process.cwd(), 'docs')

export function getDocBySlug(slug: string): DocData | null {
  try {
    const fullPath = path.join(docsDirectory, \`\${slug}.md\`)
    const fileContents = fs.readFileSync(fullPath, 'utf-8')
    const { data, content } = matter(fileContents)

    // Look for a sibling .agent.md file, then docs/agent/*.agent.md
    let agentContent: string | undefined
    try {
      const candidatePaths = [
        path.join(docsDirectory, \`\${slug}.agent.md\`),
        path.join(docsDirectory, 'agent', \`\${slug}.agent.md\`),
      ]
      const agentPath = candidatePaths.find((candidate) => fs.existsSync(candidate))
      if (!agentPath) {
        throw new Error('missing agent doc')
      }
      const agentFile = fs.readFileSync(agentPath, 'utf-8')
      const { content: agentBody } = matter(agentFile)
      agentContent = agentBody.trim() || undefined
    } catch {
      // No agent file — that's fine
    }

    return {
      slug,
      title: (data.title as string) || slug.charAt(0).toUpperCase() + slug.slice(1),
      description: data.description as string | undefined,
      content: content.trim(),
      agentContent,
      order: (data.order as number) || 999,
    }
  } catch {
    return null
  }
}

function walkDir(dir: string, base: string = ''): string[] {
  const results: string[] = []
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const rel = base ? base + '/' + entry.name : entry.name
      if (entry.isDirectory()) {
        results.push(...walkDir(path.join(dir, entry.name), rel))
      } else {
        results.push(rel)
      }
    }
  } catch {
    // directory doesn't exist
  }
  return results
}

export function getAllDocSlugs(): string[] {
  const files = walkDir(docsDirectory)
  return files
    .filter((file) => file.endsWith('.md') && !file.endsWith('.agent.md'))
    .map((file) => file.replace(/\\.md$/, ''))
}
`,

  'src/lib/navigation.ts': () => `import docsJson from '../../docs.json'
import type { PageNode } from '@arach/dewey'

interface DocsGroup {
  id: string
  title: string
  items: { id: string; title: string; description?: string }[]
}

interface DocsJson {
  name: string
  groups: DocsGroup[]
}

export function getNavTree(): PageNode[] {
  const data = docsJson as DocsJson
  return data.groups.map((group) => ({
    type: 'folder' as const,
    name: group.title,
    defaultOpen: true,
    children: group.items.map((item) => ({
      type: 'page' as const,
      id: item.id,
      name: item.title,
      description: item.description,
    })),
  }))
}
`,
}

// ---------------------------------------------------------------------------
// Dewey-owned files -- regenerated by `dewey update`
// ---------------------------------------------------------------------------

export const NEXTJS_OWNED_FILES = [
  'tailwind.config.ts',
  'postcss.config.js',
  'next.config.js',
  'tsconfig.json',
  'src/app/layout.tsx',
  'src/app/globals.css',
  'src/app/providers.tsx',
  'src/app/page.tsx',
  'src/app/docs/layout.tsx',
  'src/app/docs/[...slug]/page.tsx',
  'src/app/docs/[...slug]/content.tsx',
  'src/components/Search.tsx',
  'src/lib/docs.ts',
  'src/lib/navigation.ts',
] as const

// ---------------------------------------------------------------------------
// Consumer-owned files -- never touched by update
// ---------------------------------------------------------------------------

export const NEXTJS_CONSUMER_OWNED_FILES = [
  'package.json',
  '.gitignore',
  'docs.json',
  'src/lib/dewey.tsx',
] as const

// ---------------------------------------------------------------------------
// Generate consumer-owned files (only written on create, never on update)
// ---------------------------------------------------------------------------

export function generateDeweyTsx(args: NextjsTemplateArgs): string {
  return `import {
  Header as DefaultHeader,
  Sidebar as DefaultSidebar,
  AutoTableOfContents as DefaultToc,
  MarkdownContent as DefaultContent,
} from '@arach/dewey'
import type { DeweyProviderProps } from '@arach/dewey'
import Link from 'next/link'
import Image from 'next/image'

// ─── Component Overrides ─────────────────────────────────────
// Swap any component with your own. Run \`dewey eject <name>\`
// to scaffold a starter override.
export const components = {
  Header: DefaultHeader,
  Sidebar: DefaultSidebar,
  TableOfContents: DefaultToc,
  MarkdownContent: DefaultContent,
}

// ─── Site Config ─────────────────────────────────────────────
export const siteConfig = {
  name: '${args.projectName}',
  defaultPage: '${args.defaultPage}',
  basePath: '/docs',
}

// ─── Provider Config ─────────────────────────────────────────
export const providerProps: Omit<DeweyProviderProps, 'children'> = {
  theme: '${args.theme}',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components: { Link: Link as any, Image: Image as any },
}
`
}

export function generateNextjsPackageJson(args: NextjsTemplateArgs): string {
  return JSON.stringify({
    name: args.projectName,
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      postbuild: 'npx -y pagefind --site out',
      start: 'next start',
      lint: 'next lint',
    },
    dependencies: {
      '@arach/dewey': '^0.3.0',
      'gray-matter': '^4.0.3',
      'next': '^14.2.0',
      'react': '^18.3.0',
      'react-dom': '^18.3.0',
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      '@types/react': '^18.3.0',
      '@types/react-dom': '^18.3.0',
      'autoprefixer': '^10.4.0',
      'postcss': '^8.4.0',
      'tailwindcss': '^3.4.0',
      'typescript': '^5.5.0',
    },
  }, null, 2)
}

export function generateNextjsGitignore(): string {
  return `# Dependencies
node_modules
.pnpm-store

# Next.js
.next
out

# Misc
.DS_Store
*.log
`
}
