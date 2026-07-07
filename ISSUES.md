# Open Issues — Filed from OpenScout Integration Feedback

Source: `/Users/arach/dev/openscout/dewey-feedback.md`

---

## Bugs

### BUG-1: DocsLayout export mismatch — .d.ts says default but JS is named
**Severity:** High — breaks Turbopack/Next.js imports  
**File:** `packages/docs/src/components/DocsLayout.tsx` (line 224), `packages/docs/src/index.ts` (line 40)  
**Problem:** `DocsLayout.tsx` uses `export default function DocsLayout`, but `index.ts` re-exports it as `export { default as DocsLayout }`. The compiled `.d.ts` still declares it as a default export, causing "Export default doesn't exist in target module" in Turbopack.  
**Fix:** Change `DocsLayout.tsx` to use a named export (`export function DocsLayout`) to match the re-export pattern, or fix the `.d.ts` generation.

### ~~BUG-2: `dewey generate -o <dir>` fails if output directory doesn't exist~~ FIXED
**Status:** Already fixed — `mkdir(outputPath, { recursive: true })` exists at line 399 of `generate.ts`.

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

### IMP-2 / BUG-4: `dewey generate` silently skips docs not in config sections
**Priority:** High — confirmed by amplink integration (2026-04-05)  
**File:** `packages/docs/src/cli/commands/generate.ts` (lines 382–385)  
**Problem:** When `config.agent.sections` is non-empty, `generate` only indexes those sections, silently dropping any `.md` files on disk that aren't listed. Users must manually keep `dewey.config.ts` in sync with their docs directory — defeating the purpose of a generate command that reads from source.  
**Reported by:** @amplink — added 3 new docs (adapters.md, security.md, primitives.md), ran `dewey generate`, only 6 of 10 docs were indexed.  
**Fix:** Auto-discover all `.md` files in `docs.path`. Use `config.agent.sections` for ordering, but append any untracked docs and warn. See commit for implementation.

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

---

## Fixed

### ~~BUG-5: Escaped backticks in content.tsx template~~ FIXED
**Reported by:** @amplink (2026-04-05)  
**File:** `packages/docs/src/cli/templates/nextjs.ts` (content.tsx template)  
**Problem:** className template literal was emitted with `\\\`` instead of raw backticks, causing SWC "Unexpected token div" error.  
**Fix:** Removed extra escaping in the template string.

### ~~BUG-6: Pagefind import type error in Search.tsx~~ FIXED
**Reported by:** @amplink (2026-04-05)  
**File:** `packages/docs/src/cli/templates/nextjs.ts` (Search.tsx template)  
**Problem:** Dynamic import of `/pagefind/pagefind-ui.js` fails typecheck since the module doesn't exist until postbuild.  
**Fix:** Added `@ts-expect-error` comment above the import.

### ~~BUG-7: Next.js Link/Image type mismatch in dewey.tsx~~ FIXED
**Reported by:** @amplink (2026-04-05)  
**File:** `packages/docs/src/cli/templates/nextjs.ts` (`generateDeweyTsx`)  
**Problem:** `next/link` and `next/image` signatures are incompatible with `DeweyProviderProps.components` types.  
**Fix:** Added `as any` casts in the generated template. Longer-term: widen `DeweyProviderProps` types to accept Next.js components natively.

---

## Open — Template & Component Issues

### BUG-8: Generated Next.js site missing Tailwind — utility classes do nothing
**Severity:** High — affects all `dewey create` sites  
**Reported by:** @amplink (2026-04-05)  
**File:** `packages/docs/src/cli/templates/nextjs.ts` (package.json template)  
**Problem:** MarkdownContent, HeadingLink, and CodeBlock components use Tailwind utility classes (`group`, `opacity-0`, `group-hover:opacity-100`, `flex`, `items-center`, `px-4`, etc.) but the generated package.json has no Tailwind dependency and there's no Tailwind config. All utility classes are inert. This causes: heading link icons always visible, no flexbox on headings, no padding on table cells.  
**Fix:** Either add `tailwindcss` + `@tailwind` directives to the template, or rewrite MarkdownContent/HeadingLink/CodeBlock to use plain CSS instead of Tailwind classes.

### BUG-9: CodeBlock treats unfenced code blocks (no language) as inline code
**Severity:** Medium  
**Reported by:** @amplink (2026-04-05)  
**File:** `packages/docs/src/components/CodeBlock.tsx` (line 65)  
**Problem:** `if (inline || !className?.includes('language-'))` treats code blocks without a language tag as inline. A fenced block like ` ``` ` (no language) gets `<code>` without `className`, so it renders inline.  
**Fix:** The `pre` → `code` pipeline in MarkdownContent should pass a `block` flag, or CodeBlock should default to block when called from a `pre` context.

### BUG-10: No highlight.js theme CSS shipped with generated sites
**Severity:** Low  
**Reported by:** @amplink (2026-04-05)  
**File:** `packages/docs/src/components/CodeBlock.tsx`, template globals.css  
**Problem:** CodeBlock runs highlight.js and sets `dangerouslySetInnerHTML` with `.hljs-*` spans, but no highlight.js theme CSS is included. Token colors default to unstyled.  
**Fix:** Bundle a highlight.js theme in `@arach/dewey/css` or inject token colors into the generated globals.css.
