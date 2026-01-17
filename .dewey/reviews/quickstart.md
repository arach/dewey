# Quickstart Page Review

**File:** `www/src/pages/Docs.tsx` (quickstartContent)
**Reviewed:** 2026-01-16

## Scores

| Criterion | Score | Notes |
|-----------|-------|-------|
| Grounding | 4/5 | Clear getting-started flow |
| Completeness | 2/5 | Missing install config, agent command |
| Clarity | 4/5 | Good step-by-step structure |
| Examples | 4/5 | Working examples with commands |
| Agent-Friendliness | 2/5 | No structured parameter data |
| **Total** | **16/25** | |

## Verdict: NEEDS_WORK

---

## Issues Found

1. **generate output incomplete** - Shows 3 files, missing `install.md`
2. **No install config** - `install` section not shown in config example
3. **dewey agent not mentioned** - Should show in workflow
4. **No prerequisites section** - Should list Node.js version
5. **pnpm-only** - Could mention npm/yarn alternatives

## Drift from Codebase

| Documented | Actual | Status |
|------------|--------|--------|
| generate creates 3 files | 4 files (+ install.md) | DRIFT |
| config has 3 sections | 4 sections (+ install) | DRIFT |
| No agent command | `dewey agent` exists | MISSING |

## Recommendations

1. Add `install.md` to generate output
2. Add `install` section to config example
3. Add `dewey agent` step after audit
4. Add prerequisites (Node.js >= 18)
5. Show alternative package managers

---

## History

| Run | Score | Delta |
|-----|-------|-------|
| #1 | 16/25 | - |
