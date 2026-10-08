---
title: Integrate into an existing site
description: Embed Dewey docs components in an existing React or Next.js app while dewey build and check keep the docs honest
order: 6
group: Guides
groupId: guides
---

Dewey's CLI (`init`, `build`, `check`) keeps your Markdown, `AGENTS.md` and `llms.txt` in step with the code, and `build` writes its own static site to `.dewey/site/`. The React components are an **optional presentation layer** for rendering the same Markdown inside a site you already own.

This guide is for teams that already have a React or Next.js app and want docs under a route such as `/docs`. If a standalone static site is enough, `dewey build` already makes one; see [Quickstart](./quickstart.md).

## When to embed

| Path | Use when |
|------|----------|
| **Embed components** (this guide) | You already have React/Next.js routing, layout, design system, or deploy pipeline |
| **`dewey build`** | A static site in `.dewey/site/` is enough; serve that folder |
| **`dewey create`** (frozen) | Existing scaffolded Next.js or Astro sites only; see [Maintaining generated sites](./maintenance.md) |

Embedding does not replace `dewey build` and `dewey check`. Keep running them; use components only to render Markdown for people.

## Prerequisites

| Requirement | Notes |
|-------------|--------|
| Node.js 18+ | |
| Bun 1.3+ (recommended) | Examples below use Bun |
| React 18 or 19 | Peer dependency of `@deweydocs/dewey` |
| Next.js App Router | Patterns below target App Router; adapt for Pages Router if needed |
| Existing Markdown under `docs/` | With a `kind` in each file's frontmatter; see [Kinds of doc](./overview.md#kinds-of-doc) |

## Package and CSS installation

```bash
bun add @deweydocs/dewey gray-matter
```

- Runtime dependency (not only `-d`) when the site imports Dewey components.
- `gray-matter` is the usual choice for frontmatter when you load files from disk.
- No router package is required by Dewey. `react-router-dom` is not a peer dependency; pass a framework link adapter where needed.

### CSS entry points

Import base styles, design tokens, and one color theme in a root layout or global CSS entry:

```tsx
// app/layout.tsx (or app/docs/layout.tsx)
import '@deweydocs/dewey/css/base.css'
import '@deweydocs/dewey/css/tokens'
import '@deweydocs/dewey/css/colors/ocean.css'
```

| Export | Purpose |
|--------|---------|
| `@deweydocs/dewey/css` | Full bundle (base + tokens + default theme wiring) |
| `@deweydocs/dewey/css/base.css` | Reset and base rules |
| `@deweydocs/dewey/css/tokens` | Semantic `--dw-*` CSS variables |
| `@deweydocs/dewey/css/colors/<theme>.css` | Color preset |
| `@deweydocs/dewey/styles` | Alias of the full CSS bundle |
| `@deweydocs/dewey/tailwind` | Tailwind preset for `--dw-*` utilities |

**Themes:** `neutral`, `ocean`, `emerald`, `purple`, `dusk`, `rose`, `github`, `warm`, `midnight`, `editorial`, `mono`, `hudson`, `ink`, `slate`.

Tokens use the `--dw-*` prefix so they rarely collide with a host design system. Dark mode follows a `.dark` class on an ancestor (DeweyProvider manages this when you use the provider).

The complete semantic contract covers surfaces and foregrounds; primary, secondary, and accent pairs; border/ring; info, warning, error, and success pairs; code and syntax colors; sidebar/header colors; typography, radii, shadows, and motion. Every public component and generated theme consumes this contract. The package verifies WCAG AA pairs, focus and reduced motion, plus 28 representative Playwright screenshots (14 themes × light/dark).

### Import path note

`@deweydocs/dewey` and `@deweydocs/dewey/react` resolve to the **same** module surface. Prefer `@deweydocs/dewey` in new code; treat `/react` as a compatibility alias, not a separate React-only package.

```tsx
import {
  DeweyProvider,
  Header,
  Sidebar,
  MarkdownContent,
  AutoTableOfContents,
  CopyButtons,
} from '@deweydocs/dewey'
```

## Recommended architecture

Keep a clear server/client boundary (required for static export and App Router):

```
app/
  layout.tsx              # server: fonts, CSS imports, Providers shell
  providers.tsx           # client: DeweyProvider + Next.js Link/Image
  docs/
    layout.tsx            # client or server shell: Header + Sidebar
    [...slug]/
      page.tsx            # server: load markdown, generateStaticParams
      content.tsx         # client: MarkdownContent, TOC, CopyButtons
lib/
  dewey.tsx               # components map + providerProps + siteConfig
  docs.ts                 # recursive fs loaders (server-only)
  navigation.ts           # nav tree from docs.json (optional)
docs/                     # source markdown (project root or monorepo package)
```

This mirrors the layout of the frozen `dewey create --template nextjs` scaffold, without a separate project.

## Server-to-client wrapper

Dewey layout and content components use React hooks (theme, TOC scroll-spy, copy buttons). In the App Router they must run as **client** components. Static export and `generateStaticParams` must run on the **server**.

**Pattern:** server page loads and serializes doc data → client content component renders Dewey UI.

### 1. Client provider

```tsx
// app/providers.tsx
'use client'

import { DeweyProvider } from '@deweydocs/dewey'
import type { DeweyProviderProps } from '@deweydocs/dewey'
import type { AnchorHTMLAttributes } from 'react'
import Link from 'next/link'

type DeweyLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
const DeweyLink = ({ href, ...props }: DeweyLinkProps) => <Link href={href} {...props} />

const providerProps: Omit<DeweyProviderProps, 'children'> = {
  theme: 'ocean',
  components: { Link: DeweyLink },
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <DeweyProvider {...providerProps}>{children}</DeweyProvider>
}
```

Wire `Providers` once in the root layout (server component):

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import '@deweydocs/dewey/css/base.css'
import '@deweydocs/dewey/css/tokens'
import '@deweydocs/dewey/css/colors/ocean.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Project docs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

`suppressHydrationWarning` on `<html>` avoids noise from theme class hydration.

### 2. Server page + client content

```tsx
// app/docs/[...slug]/page.tsx
import { getDocBySlug, getAllDocSlugs } from '@/lib/docs'
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
  const doc = getDocBySlug(slug.join('/'))

  if (!doc) {
    return <div>Page not found</div>
  }

  return <DocContent doc={doc} />
}
```

```tsx
// app/docs/[...slug]/content.tsx
'use client'

import { MarkdownContent, AutoTableOfContents, CopyButtons } from '@deweydocs/dewey'
import type { DocData } from '@/lib/docs'

export function DocContent({ doc }: { doc: DocData }) {
  return (
    <div className="docs-content-grid">
      <article>
        <h1>{doc.title}</h1>
        {doc.description ? <p>{doc.description}</p> : null}
        <CopyButtons
          markdownContent={doc.content}
          agentContent={doc.agentContent}
        />
        <MarkdownContent content={doc.content} />
      </article>
      <aside>
        <AutoTableOfContents markdown={doc.content} />
      </aside>
    </div>
  )
}
```

Pass only serializable props (`string`, plain objects) across the boundary — not file handles or class instances.

## Static export configuration

For fully static hosting (GitHub Pages, S3, many CDNs):

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  transpilePackages: ['@deweydocs/dewey'],
}

module.exports = nextConfig
```

| Setting | Why |
|---------|-----|
| `output: 'export'` | Emits a static `out/` directory |
| `images.unoptimized` | Required when using `output: 'export'` with Next Image |
| `transpilePackages: ['@deweydocs/dewey']` | Ensures Dewey ESM ships correctly through Next’s bundler |

`generateStaticParams` must return every docs slug you want pre-rendered. Without it, nested routes are missing from the export.

If the host app is **not** a pure static export, you can still use the same server/client split and omit `output: 'export'`; keep `transpilePackages` when bundling Dewey.

## Recursive content loading

Discover human Markdown recursively; exclude `.agent.md` from the page list, then attach an agent counterpart when present.

```ts
// lib/docs.ts
import fs from 'fs'
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

function walkDir(dir: string, base = ''): string[] {
  const results: string[] = []
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = base ? `${base}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        results.push(...walkDir(path.join(dir, entry.name), rel))
      } else {
        results.push(rel)
      }
    }
  } catch {
    // missing directory
  }
  return results
}

export function getAllDocSlugs(): string[] {
  return walkDir(docsDirectory)
    .filter((file) => file.endsWith('.md') && !file.endsWith('.agent.md'))
    .map((file) => file.replace(/\.md$/, ''))
}

export function getDocBySlug(slug: string): DocData | null {
  try {
    const fullPath = path.join(docsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf-8')
    const { data, content } = matter(fileContents)

    let agentContent: string | undefined
    const agentCandidates = [
      path.join(docsDirectory, `${slug}.agent.md`),
      path.join(docsDirectory, 'agent', `${slug}.agent.md`),
    ]
    const agentPath = agentCandidates.find((p) => fs.existsSync(p))
    if (agentPath) {
      const agentFile = fs.readFileSync(agentPath, 'utf-8')
      const { content: agentBody } = matter(agentFile)
      agentContent = agentBody.trim() || undefined
    }

    return {
      slug,
      title: (data.title as string) || slug,
      description: data.description as string | undefined,
      content: content.trim(),
      agentContent,
      order: (data.order as number) || 999,
    }
  } catch {
    return null
  }
}
```

| Rule | Behavior |
|------|----------|
| Human page | `docs/**/*.md` excluding `*.agent.md` |
| Colocated agent | `docs/guides/install.agent.md` next to `docs/guides/install.md` |
| Nested agent folder | `docs/agent/guides/install.agent.md` (or `docs/agent/overview.agent.md` for top-level pages) |
| Nested routes | Slug `guides/install` → URL `/docs/guides/install` |

In 0.5.0 a `*.agent.md` file under `docs/` is usually a map (`kind: map`): an internal doc about a source area, not an agent copy of a human page. `dewey build` leaves maps off its site. Filter on the `kind` frontmatter if you only want guides and references in the UI.

### Optional navigation from `docs.json`

`docs.json` comes from the frozen `dewey generate`. `dewey build` writes `.dewey/site/nav.json` instead, with a different shape: groups of `{ title, summary, url, markdown, source }`. With the frozen pipeline, import the generated manifest for sidebar groups:

```ts
// lib/navigation.ts
import docsJson from '../../docs.json'
import type { PageNode } from '@deweydocs/dewey'

export function getNavTree(): PageNode[] {
  return (docsJson as { groups: { title: string; items: { id: string; title: string; description?: string }[] }[] })
    .groups.map((group) => ({
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
```

With the frozen pipeline, regenerate `docs.json` whenever nav or page set changes so the UI and agent artifacts stay aligned.

## Themes at runtime

Preset via provider:

```tsx
<DeweyProvider theme="purple" components={{ Link: DeweyLink }}>
  {children}
</DeweyProvider>
```

Or partial overrides:

```tsx
<DeweyProvider
  theme={{
    preset: 'ocean',
    colors: { primary: '#0ea5e9' },
    fonts: { sans: 'var(--font-sans)', mono: 'var(--font-mono)' },
  }}
>
  {children}
</DeweyProvider>
```

Pair the CSS file (`@deweydocs/dewey/css/colors/purple.css`) with the matching `theme` prop so tokens and components stay in sync.

Optional Tailwind:

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'
import deweyPreset from '@deweydocs/dewey/tailwind'

export default {
  presets: [deweyPreset],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
} satisfies Config
```

## Docs layout shell (Header + Sidebar)

```tsx
// app/docs/layout.tsx
'use client'

import { usePathname } from 'next/navigation'
import { Header, Sidebar } from '@deweydocs/dewey'
import { getNavTree } from '@/lib/navigation'

const basePath = '/docs'
const projectName = 'My Project'
const defaultPage = 'overview'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const currentPage =
    pathname.replace(new RegExp(`^${basePath}/?`), '').replace(/\/$/, '') || defaultPage

  return (
    <>
      <Header projectName={projectName} homeUrl={basePath} showThemeToggle />
      <div className="docs-layout">
        <aside className="docs-sidebar">
          <Sidebar
            tree={getNavTree()}
            currentPage={currentPage}
            projectName={projectName}
            basePath={basePath}
          />
        </aside>
        <main className="docs-main">{children}</main>
      </div>
    </>
  )
}
```

Prefer composing `Header`, `Sidebar`, `MarkdownContent`, and `AutoTableOfContents` when you want full control. The packaged `DocsLayout` is also router-neutral: it uses anchors by default and accepts `LinkComponent` plus `currentPage`.

```tsx
import { DocsLayout, MarkdownContent } from '@deweydocs/dewey'

<DocsLayout
  title={doc.title}
  navigation={navigation}
  projectName="My Project"
  currentPage={doc.id}
  LinkComponent={DeweyLink}
>
  <MarkdownContent content={doc.content} />
</DocsLayout>
```

## Dewey alongside the site

Keep Dewey in the **same repository** as the host app. Components render Markdown; `build` and `check` keep it consistent with the code and write the agent files.

### Onboarding sequence

| Step | Command | Role |
|------|---------|------|
| 1. Install | `bun add @deweydocs/dewey gray-matter` | Package on the site; CLI available via `bunx` |
| 2. Init (once) | `bunx dewey init --purpose "…" --no-rules` | Front door, draft maps and guide, `.dewey/project.json` |
| 3. Author | Finish the drafts in `docs/` | Guides, references and maps |
| 4. Review | `bunx dewey review docs/<area>.agent.md` | Record each map as checked against the code |
| 5. Build | `bunx dewey build` | `AGENTS.md` and `llms.txt` regions, `.dewey/site/` |
| 6. Check | `bunx dewey check` | Fails on drafts, stale reviews, broken links, stale outputs |
| 7. Render | Your Next/React routes | Human UI (this guide) |

Suggested `package.json` scripts:

```json
{
  "scripts": {
    "docs:build": "dewey build",
    "docs:check": "dewey check",
    "prebuild": "bun run docs:build",
    "dev": "next dev",
    "build": "next build"
  }
}
```

### Serve agent files from the static host

`dewey build` writes these under `.dewey/site/`. Copy the ones you want into `public/` (or your static asset root) in a build step:

| Artifact | Typical public URL |
|----------|-------------------|
| `.dewey/site/llms.txt` | `/llms.txt` |
| `.dewey/site/llms-full.txt` | `/llms-full.txt` |
| `.dewey/site/**/*.md` | Markdown copy of each page |
| `AGENTS.md` (repo root) | `/AGENTS.md` |

The `.md` links in `.dewey/site/llms.txt` are relative to `.dewey/site/`. Keep the same layout when you copy them, or serve `.dewey/site/` as its own path.

## CI

Check the docs without depending on the UI build:

```yaml
# .github/workflows/docs.yml (illustrative)
name: docs
on:
  pull_request:

jobs:
  dewey:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bunx dewey build
      - run: bunx dewey check
```

| Command | CI use |
|---------|--------|
| `dewey build` | Refresh the site and agent files |
| `dewey check` | Exit 1 on drafts, uncovered code, stale reviews, broken references or stale outputs |
| `dewey check --json` | The same, as `{ passed, issues[] }` |

Commit `.dewey/project.json` and `.dewey/reviews.json` so CI checks against the same reviewed baseline. Run `build` **before** `next build` when the app serves files from `.dewey/site/`.

## Monorepo notes

| Setup | Approach |
|-------|----------|
| Docs package + app package | Run `dewey init` in the package whose `docs/` you render; depend on `@deweydocs/dewey` from the app |
| Shared `docs/` at repo root | `process.cwd()` in Next is the app package — set `docsDirectory` to a path relative to the monorepo root (or symlink `docs` into the app) |
| One docs set for many apps | Run `dewey build` at the repo root; copy files from `.dewey/site/` into each app's static assets |

## Checklist

- [ ] `@deweydocs/dewey` + CSS theme imported
- [ ] `DeweyProvider` in a client `Providers` wrapper with Next `Link` / `Image`
- [ ] Server `page.tsx` + client `content.tsx` split
- [ ] `generateStaticParams` covers recursive slugs (if static export)
- [ ] Recursive loader skips `.agent.md` for routes but loads agent siblings for `CopyButtons` / agent view
- [ ] `bunx dewey build` and `bunx dewey check` in local and CI pipelines
- [ ] Agent artifacts reachable at stable URLs if you expose them publicly

## Related

- [Quickstart](./quickstart.md) — init, author, review, build, check
- [CLI Reference](./cli.md) — every command, `.dewey/project.json` and site settings
- [Overview](./overview.md) — the docs loop and kinds of doc
- [Skills](./skills.md) — LLM prompt skills for review and install.md
- [Maintaining generated sites](./maintenance.md) — frozen `create`/`update`/`eject` sites and release checks

For a static site without embedding, run `bunx dewey build` and serve `.dewey/site/`.
