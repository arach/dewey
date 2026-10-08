---
kind: guide
title: Get started
covers: []
---

# Get started

This guide takes you from a source checkout to a journal containing one event. You need Bun on your PATH and write access to the project directory. This fixture has no third-party runtime dependencies.

## Verify

Run the executable tests before creating your first journal:

```sh
bun run test
```

The test appends two records, reads them back, checks the summary, rejects an invalid event type, and verifies the malformed-line error. It uses a temporary directory and removes it afterward.

## Record a checkpoint

```sh
bun run journal -- add release.ready '{"service":"worker","revision":"a1b2c3"}'
```

The command prints the new event as JSON. Your ID and timestamp will differ from this illustrative shape:

```json
{
  "id": "a-generated-uuid",
  "at": "2026-10-06T12:00:00.000Z",
  "type": "release.ready",
  "data": { "service": "worker", "revision": "a1b2c3" }
}
```

## Read it back

```sh
bun run journal -- list release.ready
bun run journal -- summary
```

On a fresh journal, the summary contains `total: 1` and a count of one for `release.ready`. Repeating the add command creates another event; it does not update the existing one.

## Select another file

Set `RELAYLOG_PATH` in your shell to keep a separate journal. Paths are resolved relative to the process working directory. The CLI creates missing parent directories when you append; reading a missing path returns no events.

Continue with [Record events](guides/recording.md), or open the [CLI reference](reference/cli.md).
