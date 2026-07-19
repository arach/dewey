---
title: Integrate existing site (agent)
description: Dense contract for embedding Dewey components in React/Next.js while keeping generate/audit/agent as the core path
order: 6
group: Guides
groupId: guides
---

# Dewey embed contract (existing React / Next.js)

## Positioning

| Layer | Role | Required? |
|---|---|---|
| CLI `init` / `audit` / `generate` / `agent` | Judgment + retrieval artifacts | Yes for agent-ready docs |
| React components + CSS | Optional human UI in host app | No |
| `dewey create` | Scaffold standalone site | Alternative to embed |

Dewey is a **docs agent**, not a docs framework. Embedding components does not replace generation.

## Decision table

| Situation | Action |
|---|---|
| Existing React/Next app needs `/docs` | Embed components (this doc) |
| No site yet | `bunx dewey create … --template nextjs` |
| Agents only | `bunx dewey generate` (+ audit/agent); skip UI |

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

**Themes:** `neutral` \| `ocean` \| `emerald` \| `purple` \| `dusk` \| `rose` \| `github` \| `warm` \| `midnight` \| `editorial` \| `mono` \| `hudson`

## Onboarding sequence (shared)

| # | Step | Command / action |
|---|---|---|
| 1 | Install | `bun add @arach/dewey gray-matter` |
| 2 | Init | `bunx dewey init` (if no `docs/` + config) |
| 3 | Author | Human `.md` + optional `.agent.md` |
| 4 | Generate | `bunx dewey generate` |
| 5 | Audit | `bunx dewey audit` / `--json` |
| 6 | Score | `bunx dewey agent` / `--json` |
| 7 | Embed UI | Host routes + provider + loaders |
| 8 | Optional | `bunx dewey create` only for separate site |

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
- Tests: complete/dead tokens, WCAG AA text pairs, focus, reduced motion, component semantics, 24 Playwright screenshots.

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
| Generate default | `agent.sections: []` → all human docs recursively |
| CLI override | `dewey generate --source <path> --output <path>` |

## Provider snippet contract

```tsx
'use client'
import { DeweyProvider } from '@arach/dewey'
import Link from 'next/link'
import Image from 'next/image'

// theme: ThemePreset | ThemeConfig
// components.Link / components.Image for framework routing/images
<DeweyProvider theme="ocean" components={{ Link, Image }}>{children}</DeweyProvider>
```

Root `<html suppressHydrationWarning>` recommended for theme class hydration.

## Scripts (host package.json)

| Script | Command |
|---|---|
| `docs:generate` | `bunx dewey generate` |
| `docs:audit` | `bunx dewey audit` |
| `docs:agent` | `bunx dewey agent` |
| `prebuild` | generate before `next build` when importing `docs.json` / public artifacts |

## CI (minimum)

```bash
bun install
bunx dewey generate
bunx dewey audit --json
bunx dewey agent --json
```

Gate on audit failures and/or agent score thresholds as policy.

## Public agent URLs (optional)

| Artifact | URL example |
|---|---|
| `llms.txt` | `/llms.txt` |
| `AGENTS.md` | `/AGENTS.md` |
| `install.md` | `/install.md` |
| `agent/**` | `/agent/**` |

Write via `docs.output` / `--output public` or post-generate copy.

## Monorepo

| Case | Approach |
|---|---|
| Docs at repo root | Resolve `docsDirectory` to monorepo root, not app `cwd` alone |
| Docs package | `--source` to package; app depends on `@arach/dewey` |
| Multi-app | Generate once at root; ship static `agent/` + `docs.json` |

## Anti-patterns

| Don't | Do |
|---|---|
| Treat embed as replacing `generate` | Always run generate for agent surface |
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
| `docs/maintenance.md` | Update/eject ownership, adoption, backups, recovery, release |
| `packages/docs/src/cli/templates/nextjs.ts` | Canonical scaffold reference (implementation, not consumer edit target) |
