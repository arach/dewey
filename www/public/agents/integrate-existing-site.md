---
title: Integrate existing site (agent)
description: Dense contract for embedding Dewey components in React/Next.js while dewey build and check stay the core path
order: 6
group: Guides
groupId: guides
---

# Dewey embed contract (existing React / Next.js)

## Positioning

| Layer | Role | Required? |
|---|---|---|
| CLI `init` / `build` / `check` | Front door, `llms.txt`, `.dewey/site/`, consistency gate | Yes |
| React components + CSS | Optional human UI in host app | No |
| `dewey create` (frozen) | Scaffold standalone Next.js/Astro site | Existing sites only |

Embedding components does not replace `build` and `check`.

## Decision table

| Situation | Action |
|---|---|
| Existing React/Next app needs `/docs` | Embed components (this doc) |
| Static site is enough | `bunx dewey build`; serve `.dewey/site/` |
| Agents only | `bunx dewey build` + `check`; ignore the site |

## Install

```bash
bun add @arach/dewey gray-matter
```

| Export | Use |
|---|---|
| `@arach/dewey` | Canonical JS/TS imports |
| `@arach/dewey/react` | **Same as main** — compatibility alias only |
| `@arach/dewey/css` | Full CSS bundle |
| `@arach/dewey/css/base.css` | Base |
| `@arach/dewey/css/tokens` | `--dw-*` tokens |
| `@arach/dewey/css/colors/<theme>.css` | Theme preset |
| `@arach/dewey/tailwind` | Tailwind preset |
| `@arach/dewey/agent-artifacts` | Programmatic collectors |

Router dependency: none. `react-router-dom` is not a peer dependency.

**Themes:** `neutral` \| `ocean` \| `emerald` \| `purple` \| `dusk` \| `rose` \| `github` \| `warm` \| `midnight` \| `editorial` \| `mono` \| `hudson` \| `ink` \| `slate`

## Onboarding sequence (shared)

| # | Step | Command / action |
|---|---|---|
| 1 | Install | `bun add @arach/dewey gray-matter` |
| 2 | Init | `bunx dewey init --purpose "…" --no-rules` (once) |
| 3 | Author | Guides/references (`.md`), maps (`<area>.agent.md`, `kind: map`) |
| 4 | Review | `bunx dewey review docs/<area>.agent.md` |
| 5 | Build | `bunx dewey build` |
| 6 | Check | `bunx dewey check` / `--json` |
| 7 | Embed UI | Host routes + provider + loaders |

## Architecture (Next App Router)

| File | Runtime | Duty |
|---|---|---|
| `app/layout.tsx` | server | CSS imports, wrap `Providers` |
| `app/providers.tsx` | client | `DeweyProvider` + Next `Link`/`Image` |
| `app/docs/layout.tsx` | client (typical) | `Header` + `Sidebar` |
| `app/docs/[...slug]/page.tsx` | server | `getDocBySlug`, `generateStaticParams` |
| `app/docs/[...slug]/content.tsx` | client | `MarkdownContent`, TOC, `CopyButtons` |
| `lib/docs.ts` | server-only | Recursive fs + gray-matter |
| `lib/navigation.ts` | either | Nav from `docs.json` |

### Boundary rule

- Hooks / Dewey interactive UI → **client** (`'use client'`).
- `generateStaticParams` / fs / static export → **server**.
- Cross boundary: serializable props only (`DocData` strings/numbers).

### Prefer composed shell

Compose `Header`, `Sidebar`, `MarkdownContent`, `AutoTableOfContents` for maximum host control. `DocsLayout` is also router-neutral: default anchors, optional `LinkComponent`, optional `currentPage`, browser-path fallback.

## Theme proof contract

- Twelve presets; light and dark.
- Shared semantic `--dw-*` contract across components, CSS, Tailwind, generated sites.
- Categories: surfaces/foregrounds; primary/secondary/accent; border/ring; status pairs; code/syntax; sidebar/header; typography/radius/shadow/motion.
- Tests: complete/dead tokens, WCAG AA text pairs, focus, reduced motion, component semantics, 28 Playwright screenshots.

## Static export

```js
// next.config.js
module.exports = {
  output: 'export',
  images: { unoptimized: true },
  transpilePackages: ['@arach/dewey'],
}
```

| Key | Required for |
|---|---|
| `output: 'export'` | Pure static `out/` |
| `images.unoptimized` | Next Image under export |
| `transpilePackages` | Bundle `@arach/dewey` ESM |
| `generateStaticParams` | Pre-render every nested slug |

## Content discovery rules

| Rule | Value |
|---|---|
| Human pages | recursive `**/*.md` excluding `*.agent.md` |
| Agent colocated | `<slug>.agent.md` beside human file |
| Agent nested | `docs/agent/<slug>.agent.md` |
| Slug | path without `.md` (e.g. `guides/install`) |
| Maps | `*.agent.md` with `kind: map` are internal; `build` leaves them off the site. Filter on `kind` |
| Nav data | `.dewey/site/nav.json` from `build` (groups of `{title,summary,url,markdown,source}`); `docs.json` only from frozen `generate` |

## Provider snippet contract

```tsx
'use client'
import { DeweyProvider } from '@arach/dewey'
import type { AnchorHTMLAttributes } from 'react'
import Link from 'next/link'

type DeweyLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
const DeweyLink = ({ href, ...props }: DeweyLinkProps) => <Link href={href} {...props} />

// theme: ThemePreset | ThemeConfig
// Adapt framework links to Dewey's required string-href contract.
<DeweyProvider theme="ocean" components={{ Link: DeweyLink }}>{children}</DeweyProvider>
```

Root `<html suppressHydrationWarning>` recommended for theme class hydration.

## Scripts (host package.json)

| Script | Command |
|---|---|
| `docs:build` | `dewey build` |
| `docs:check` | `dewey check` |
| `prebuild` | `docs:build` before `next build` when serving files from `.dewey/site/` |

## CI (minimum)

```bash
bun install
bunx dewey build
bunx dewey check
```

Check exits 1 on any issue. Commit `.dewey/project.json` and `.dewey/reviews.json`.

## Public agent URLs (optional)

| Artifact | URL example |
|---|---|
| `llms.txt` | `/llms.txt` |
| `AGENTS.md` | `/AGENTS.md` |
| `llms-full.txt` | `/llms-full.txt` |

Copy from `.dewey/site/` (and root `AGENTS.md`) after `build`, keeping relative `.md` paths.

## Monorepo

| Case | Approach |
|---|---|
| Docs at repo root | Resolve `docsDirectory` to monorepo root, not app `cwd` alone |
| Docs package | `dewey init` in that package; app depends on `@arach/dewey` |
| Multi-app | `dewey build` once at root; copy from `.dewey/site/` |

## Anti-patterns

| Don't | Do |
|---|---|
| Treat embed as replacing `build`/`check` | Always run them |
| Import hooks in server `page.tsx` | Split page (server) / content (client) |
| Use only top-level `docs/*.md` walk | Recursive walk; nested routes |
| Prefer `@arach/dewey/react` as different API | Import from `@arach/dewey` |
| Frame as competing docs frameworks | Present as optional UI on agent pipeline |

## Related paths

| Doc | Role |
|---|---|
| `docs/integrate-existing-site.md` | Human narrative guide |
| `docs/quickstart.md` | Greenfield sequence |
| `docs/cli.md` | Flags |
| `docs/maintenance.md` | Frozen create/update/eject sites, release |
| `packages/docs/src/cli/templates/nextjs.ts` | Canonical scaffold reference (implementation, not consumer edit target) |
