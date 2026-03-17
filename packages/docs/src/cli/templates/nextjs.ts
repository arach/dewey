// ---------------------------------------------------------------------------
// Next.js template definitions
// Used by `dewey create` and `dewey update` for Next.js doc sites.
// ---------------------------------------------------------------------------

import { VALID_THEMES, resolveTheme, type ThemeName } from './astro.js'
import { DEWEY_VERSION } from '../version.js'

export { VALID_THEMES, resolveTheme }
export type { ThemeName }

// ---------------------------------------------------------------------------
// Template arguments
// ---------------------------------------------------------------------------

export interface NextjsTemplateArgs {
  projectName: string
  theme: ThemeName
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

  'src/app/layout.tsx': (args) => `import type { Metadata } from 'next'
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
`,

  'src/app/globals.css': () => `/* ─── Global Reset ─────────────────────────────────────────── */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: var(--dw-background);
  color: var(--dw-foreground);
  font-family: var(--dw-font-sans);
}

a {
  color: inherit;
  text-decoration: none;
}

/* ─── Docs Layout ─────────────────────────────────────────── */
.docs-layout {
  display: flex;
  max-width: 1320px;
  margin: 0 auto;
  padding: calc(var(--dw-header-height, 3.5rem) + 1.5rem) 1.5rem 2rem;
}

.docs-sidebar {
  width: var(--dw-sidebar-width, 280px);
  flex-shrink: 0;
  padding-right: 2rem;
}

.docs-sidebar-sticky {
  position: sticky;
  top: calc(var(--dw-header-height, 3.5rem) + 1.5rem);
}

.docs-main {
  flex: 1;
  min-width: 0;
}

/* ─── Content Grid (article + TOC) ────────────────────────── */
.docs-content-grid {
  display: flex;
  gap: 2rem;
}

.docs-article {
  flex: 1;
  min-width: 0;
}

.docs-article-header {
  margin-bottom: 2.5rem;
}

.docs-article-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.docs-article-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  padding-top: 0.5rem;
}

.docs-agent-toggle {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 150ms;
  color: var(--color-dw-muted-foreground, #5c676c);
  border: 1px solid var(--color-dw-border, rgba(16, 21, 24, 0.12));
  background: var(--color-dw-card, rgba(255,255,255,0.5));
}

.docs-agent-toggle:hover {
  border-color: var(--color-dw-primary, #3b82f6);
  color: var(--color-dw-primary, #3b82f6);
}

.docs-agent-toggle.active {
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.docs-agent-banner {
  margin-bottom: 1.5rem;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.docs-article-title {
  font-size: 2.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0;
}

.docs-article-description {
  margin-top: 0.75rem;
  font-size: 1.125rem;
  color: var(--dw-muted-foreground);
}

.docs-toc {
  width: var(--dw-toc-width, 220px);
  flex-shrink: 0;
}

.docs-toc-sticky {
  position: sticky;
  top: calc(var(--dw-header-height, 3.5rem) + 1.5rem);
}

/* ─── Responsive ──────────────────────────────────────────── */
@media (max-width: 1024px) {
  .docs-sidebar {
    display: none;
  }
}

@media (max-width: 1280px) {
  .docs-toc {
    display: none;
  }
}
`,

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

  'src/app/docs/layout.tsx': () => `'use client'

import { usePathname } from 'next/navigation'
import { components, siteConfig } from '@/lib/dewey'
import { getNavTree } from '@/lib/navigation'

const { Header, Sidebar } = components

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
      <Header
        projectName={siteConfig.name}
        homeUrl={siteConfig.basePath}
        showThemeToggle
      />
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
                  className={\\\`docs-agent-toggle\\\${viewAgent ? ' active' : ''}\\\`}
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

export function getAllDocSlugs(): string[] {
  try {
    const files = fs.readdirSync(docsDirectory)
    return files
      .filter((file) => file.endsWith('.md') && !file.endsWith('.agent.md'))
      .map((file) => file.replace(/\\.md$/, ''))
  } catch {
    return []
  }
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
  'next.config.js',
  'tsconfig.json',
  'src/app/layout.tsx',
  'src/app/globals.css',
  'src/app/providers.tsx',
  'src/app/page.tsx',
  'src/app/docs/layout.tsx',
  'src/app/docs/[...slug]/page.tsx',
  'src/app/docs/[...slug]/content.tsx',
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
  components: { Link, Image },
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
