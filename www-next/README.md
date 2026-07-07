# Dewey www (Next.js)

Next.js rebuild of the Dewey marketing site and docs — generated with `dewey create`, customized from there.

**Use Dewey to ship Dewey.**

## Stack

- `dewey create` scaffold (**Hudson** template, static export)
- `@arach/dewey` components (`DocsIndex`, `Sidebar`, `MarkdownContent`, `CopyButtons`, …)
- Markdown source in `docs/` (copied from repo root `docs/` at create time)

## Dev

```bash
# from repo root
bun install
cd www-next
bun run dev   # http://localhost:3001
```

## vs `www/` (Astro)

| | `www/` | `www-next/` |
|---|---|---|
| Framework | Astro | Next.js |
| Port | 4321 | 3001 |
| Status | Production site today | Replacement candidate |

## Updating docs content

Edit markdown in repo root `docs/`, then sync to `www-next/docs/` or re-run:

```bash
node packages/docs/dist/cli/index.js create www-next-tmp --source docs --name dewey --theme warm
# copy docs/ and docs.json as needed
```

Or wire `www-next/docs` as a symlink to `../docs` later.

## Dewey-owned files

Run `dewey update` from `www-next/` to refresh scaffold files listed in `.dewey-manifest.json`.
Consumer-owned: `docs.json`, `src/lib/dewey.tsx`, `src/app/page.tsx`, `src/app/landing.css`, `src/components/`.