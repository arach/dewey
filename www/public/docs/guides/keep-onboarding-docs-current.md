---
kind: guide
title: Keep onboarding docs current as you ship
description: Use source maps, explicit review records, and CI checks to catch documentation drift.
---

# Keep onboarding docs current as you ship

**How do I stop a product release from silently breaking self-serve onboarding?**

Connect the instructions to the code they describe. Require review when that code changes, and run the quickstart separately. Dewey 0.5 can flag changed source and inconsistent references; it cannot determine whether every explanation is true.

The commands below run from an initialized product repository with Dewey installed locally.

## Give each source area a map

Start by finding unowned areas:

```sh
bunx dewey uncovered --json
bunx dewey which src/webhooks --json
```

Use your actual source paths. `which` lists documents whose `covers` patterns match a file or directory. It does not infer a relationship from prose.

If `src/webhooks` exists and is not already covered by a map, create one:

```sh
bunx dewey new map src/webhooks
```

Author `docs/src-webhooks.agent.md`, explaining the entry points, invariants, commands, and failure modes. Keep its coverage narrow:

```yaml
---
kind: map
title: Webhook delivery implementation
covers: [src/webhooks/**]
---
```

Every discovered source file needs one map. Two maps matching the same file produce `COVERAGE_OVERLAP`; patterns starting with `**` produce `COVERAGE_BROAD`. Do not add a catch-all map to make a check pass.

## Connect the onboarding guide to relevant source

A guide can declare coverage too. For example, if the test-delivery command is implemented in `src/webhooks/test-delivery.ts`, add this to its guide:

```yaml
covers: [src/webhooks/test-delivery.ts]
```

Use a path that exists in your product. Guide coverage makes the guide eligible for review tracking; it does not replace the required implementation map. Map-to-map overlap is prohibited, but a guide can describe code that also has a map.

After reading the implementation and verifying the instructions, record review for both documents:

```sh
bunx dewey review docs/src-webhooks.agent.md
bunx dewey review docs/send-a-test-event.md
bunx dewey build
bunx dewey check --json
```

Remove `draft: true` before recording review. `review` stores document and covered-source hashes in `.dewey/reviews.json`. Commit that file and `.dewey/project.json` so CI uses the same baseline.

## Make CI verify, not approve

With the dependency and lockfile committed, a CI shell step can run:

```sh
bun install --frozen-lockfile
bunx dewey build
bunx dewey check --json
```

The runner needs Bun installed. Preserve the check's exit status: findings make it exit 1. Keep the JSON as a CI artifact if you want reviewers to inspect issue paths, codes, and suggested fixes.

Do not run `dewey review` automatically in CI. That would record approval without anyone reviewing the change. `build` refreshes outputs but leaves review drift unresolved.

| Finding | Action |
| --- | --- |
| `REVIEW_REQUIRED` | Read the named source/document changes, correct the docs, then record review |
| `DOC_DRAFT` | Finish the scaffold before removing the draft flag |
| `MAP_MISSING` | Add or adjust a source-area map |
| `REGION_STALE` | Rebuild the observed `AGENTS.md` region |
| Broken paths, symbols, or links | Correct the cited target and rebuild |

Review freshness is based on changed content, not elapsed calendar time. A clean report does not establish that a guide was tested this week.

## Keep an executable onboarding check

Run your documented task in a disposable environment as a separate test. Dewey checks cited paths, supported symbol citations, script names, shell command names, links, and output consistency. It does not execute documentation commands or fetch external links.

A service-side permission change can break onboarding without changing any source in this repository. Schedule an actual integration run at a cadence appropriate to that dependency, and give failures an owner.

Before release, require both the documentation check and your product's first-success test. If one fails, fix that failure rather than treating the other pass as sufficient.

Next: [Run docs-led onboarding experiments](/docs/guides/docs-onboarding-experiments).
