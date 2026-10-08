---
title: Keep onboarding docs current as you ship
---

# Keep onboarding docs current as you ship

| Field | Contract |
| --- | --- |
| Prerequisite | Initialized repo with Dewey 0.5 locally installed. |
| Discover | `bunx dewey uncovered --json`; `bunx dewey which src/webhooks --json`; replace sample area with existing source. |
| Map | If uncovered: `bunx dewey new map src/webhooks`. Author `docs/src-webhooks.agent.md`, `kind: map`, `covers: [src/webhooks/**]`; remove draft after review. |
| Guide coverage | A guide may cover `src/webhooks/test-delivery.ts` to request review when it changes. Guide coverage does not replace a map; map-to-map overlap fails. |
| Acknowledge | After checking code and examples: `bunx dewey review docs/src-webhooks.agent.md`; `bunx dewey review docs/send-a-test-event.md`. Commit `.dewey/reviews.json` and `.dewey/project.json`. |
| CI | `bun install --frozen-lockfile`; `bunx dewey build`; `bunx dewey check --json`. Preserve exit 1 on findings. Never automatically review in CI. |
| Findings | `REVIEW_REQUIRED`: reread/correct/review. `DOC_DRAFT`: author. `MAP_MISSING`: map discovered sources. `COVERAGE_OVERLAP`: remove map overlap. `COVERAGE_BROAD`: narrow leading ** pattern. `REGION_STALE`: rebuild. |
| Boundary | Freshness is hash-based, not age-based. Check does not run examples or fetch external links. Add independent executable first-success tests for service-side changes. |
