# Dewey Roadmap

## Completed

### 1. GitHub Actions: Deploy www to GitHub Pages
- [x] Create `.github/workflows/deploy.yml`
- [x] Build www package and deploy on push to main

### 2. GitHub Actions: npm Publish Workflow
- [x] Create `.github/workflows/publish.yml`
- [x] Manual trigger (workflow_dispatch) — not automatic
- [x] Publish `@dewey/docs` and `@dewey/cli` packages
- [x] Use npm automation token (bypasses OTP)

### 3. New Components
- [x] `FileTree` — visualize directory structures
- [x] `ApiTable` — document props/parameters
- [x] `Badge` — version/status indicators
- [ ] `Accordion` — collapsible sections
- [ ] `LinkCard` — rich navigation cards

### 4. install.md Generation
- [x] Add `InstallConfig` schema
- [x] Add `installMdGenerator` skill
- [x] Add `--install-md` flag to generate command
- [x] Add install config to dewey.config.ts template

---

## Backlog

### Documentation (Priority - from self-review)
- [ ] Document install.md generation (installmd.org standard)
- [ ] Document `dewey agent` command
- [ ] Document Skills system (docsReviewAgent, promptSlideoutGenerator, installMdGenerator)
- [ ] Document Agent-Friendly components (AgentContext, PromptSlideout, CopyButtons)
- [ ] Document theming system (DeweyProvider, 8 presets, CSS vars, Tailwind preset)
- [ ] Expand Components page (16 undocumented components)
- [ ] Component usage docs in www
- [ ] Contributing guide
- [ ] Changelog

### Features
- [ ] Search integration (Pagefind or Fuse.js)
- [ ] Versioned docs support
- [ ] More project types for `dewey init`

### Polish
- [ ] Error boundaries in components
- [ ] Accessibility audit (a11y)
- [ ] SSR/SSG support investigation
