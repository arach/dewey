# Dewey site (Next.js)

Canonical Dewey marketing site and docs — generated with `dewey create`, customized from there.

**Use Dewey to ship Dewey.**

## Stack

- `dewey create` scaffold (static export)
- Custom Next.js components + Shiki markdown pipeline
- Markdown source in `docs/` (sync from repo root `docs/`)

## Dev

```bash
# from repo root
bun install
cd www
bun run dev   # http://localhost:3001
```

## vs `www-astro/` (archived)

| | `www/` | `www-astro/` |
|---|---|---|
| Framework | Next.js | Astro |
| Port | 3001 | 4321 |
| Status | **Canonical** — production target | Archived reference |

## Updating docs content

Edit markdown in repo root `docs/`, then sync to `www/docs/` or re-run:

```bash
node packages/docs/dist/cli/index.js create www-tmp --source docs --name dewey --theme warm
```

## Dewey-owned files

Run `dewey update` from `www/` to refresh scaffold files listed in `.dewey-manifest.json`.