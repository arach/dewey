---
kind: guide
title: Relaylog
covers: []
---

# Relaylog

Relaylog is a local, append-only event journal for development workflows. Record a build, a deploy, or a manual checkpoint as one JSON object per line. Inspect the journal with a small CLI or import the same functions into a Bun script.

## Start with one event

```sh
bun run journal -- add build.done '{"service":"api","durationMs":840}'
bun run journal -- summary
```

The first command creates `.data/events.jsonl` if it does not exist. The second prints event counts grouped by type. Nothing is sent to a server.

## Choose your next step

| You want to… | Read |
| --- | --- |
| Run the project and verify the result | [Get started](docs/quickstart.md) |
| Choose useful event names and payloads | [Record events](docs/guides/recording.md) |
| Filter records and build a summary | [Inspect a journal](docs/guides/querying.md) |
| Diagnose a damaged line safely | [Recover a journal](docs/guides/recovery.md) |
| Integrate from TypeScript | [TypeScript API](docs/reference/api.md) |

## What the journal guarantees

Each successful append produces an ID, a UTC timestamp, a type, and a payload. Reads preserve file order. Missing files read as an empty journal. Malformed records fail with a line number rather than silently disappearing.

## Deliberate boundaries

Relaylog is a single-process development tool, not a database. It does not coordinate concurrent writers, rotate files, encrypt payloads, or provide a durable transaction acknowledgment. Keep secrets out of events. Use a database or a managed event service when those requirements matter.

The [event schema](docs/reference/schema.md) describes the record format. The [CLI reference](docs/reference/cli.md) lists every command and its exit behavior.
