---
kind: map
title: Journal implementation
covers: ["src/*"]
---
# Journal implementation

| File | Contract |
|---|---|
| `src/index.ts` | appendEvent, readEvents, summarize |
| `src/cli.ts` | add/list/summary dispatch; RELAYLOG_PATH |

Flow: validate → serialize → append; read → parse each line → validate envelope → optional summary. Do not rewrite existing records during append. Keep single-writer semantics explicit. Never suppress malformed-line errors.
