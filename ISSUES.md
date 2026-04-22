# Open Issues — Filed from OpenScout Integration Feedback

Source: `/Users/arach/dev/openscout/dewey-feedback.md`

---

## Bugs

### BUG-1: DocsLayout export mismatch — .d.ts says default but JS is named
**Severity:** High — breaks Turbopack/Next.js imports  
**File:** `packages/docs/src/components/DocsLayout.tsx` (line 224), `packages/docs/src/index.ts` (line 40)  
**Problem:** `DocsLayout.tsx` uses `export default function DocsLayout`, but `index.ts` re-exports it as `export { default as DocsLayout }`. The compiled `.d.ts` still declares it as a default export, causing "Export default doesn't exist in target module" in Turbopack.  
**Fix:** Change `DocsLayout.tsx` to use a named export (`export function DocsLayout`) to match the re-export pattern, or fix the `.d.ts` generation.

### BUG-2: `dewey generate -o <dir>` fails if output directory doesn't exist
**Severity:** Medium  
**File:** `packages/docs/src/cli/commands/generate.ts` (lines 398–441)  
**Problem:** `writeFile()` is called without ensuring the output directory exists first. Throws `ENOENT`.  
**Fix:** Add `await mkdir(outputDir, { recursive: true })` before file writes.

### BUG-3: `dewey create --source` ignores subdirectories
**Severity:** Medium  
**File:** `packages/docs/src/cli/commands/create.ts` (lines 59–89)  
**Problem:** `loadMarkdownDocs` uses `readdir(docsPath)` which only reads top-level entries. Markdown files in subdirectories (e.g., `docs/guides/*.md`) are silently skipped.  
**Fix:** Use recursive `readdir` or a glob pattern to find all `.md` files in the source tree.

---

## Improvements

### IMP-1: Add "Embedding into an existing site" documentation
**Priority:** High  
**Problem:** The component library is the right answer for adding docs to an existing Next.js/React site, but this workflow is undocumented. Users can only discover it by asking the agent.  
**Action:** Add an integration guide covering: installing `@arach/dewey`, importing components + CSS, building a `[...slug]` route, and using `dewey generate` for nav/agent files.

### IMP-2: `dewey generate --docs-json` indexes scaffold content instead of real docs
**Priority:** Medium  
**Problem:** After `dewey init` + `dewey generate --docs-json`, output contains scaffold boilerplate (overview.md, quickstart.md) rather than actual docs. The `sections` config defaults are too narrow and the mapping between section IDs and filenames is unclear.  
**Action:** Default to indexing all `.md` files in `docs.path`. Treat `sections` as an optional filter.

### IMP-3: Add `--source` flag to `dewey generate`
**Priority:** Low  
**Problem:** `dewey create` accepts `--source` but `dewey generate` only reads from config. Inconsistent CLI surface.  
**Action:** Add `--source <path>` to `dewey generate` to override `docs.path` from config.

### IMP-4: Document Next.js static export + client component pattern
**Priority:** Low  
**Problem:** Dewey components use hooks (client), but Next.js static export requires `generateStaticParams` (server). Every page needs a server→client wrapper. Not a bug, but a guide would save time.  
**Action:** Include this pattern in the embedding guide (IMP-1).

### IMP-5: Clarify or remove `@arach/dewey/react` export path
**Priority:** Low  
**Problem:** `./react` re-export is identical to the main `@arach/dewey` export, which adds confusion during import troubleshooting.  
**Action:** Either differentiate it (React-specific subset) or document that it's an alias.
