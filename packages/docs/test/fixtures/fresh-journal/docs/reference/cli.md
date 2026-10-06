---
kind: reference
title: CLI reference
covers: []
---

# CLI reference

Run the CLI through the package script. Arguments after `--` are passed to the journal program.

## Commands

| Command | Arguments | Output |
| --- | --- | --- |
| add | type, optional JSON object | The appended event, as one JSON line |
| list | optional exact type | Matching events, one JSON line each |
| summary | none | Pretty-printed total and per-type counts |

```sh
bun run journal -- add build.done '{"durationMs":840}'
bun run journal -- list build.done
bun run journal -- summary
```

## Configuration

| Setting | Default | Meaning |
| --- | --- | --- |
| RELAYLOG_PATH | .data/events.jsonl | Journal path, relative to the working directory unless absolute |

There is no configuration file, daemon, network endpoint, or login step. The implementation reads the environment once when the CLI starts.

## Exit status

Successful commands exit with status zero. Invalid usage, invalid JSON, validation failures, and filesystem errors exit with status one. Errors go to stderr; successful records and summaries go to stdout.

A missing journal is not an error for `list` or `summary`. `add` creates missing parent directories. Extra arguments beyond those used by the selected command are currently ignored; this is a small fixture CLI, not a general-purpose argument parser.

## Project verification

```sh
bun run test
```

Tests use temporary files. The CLI entry point is `src/cli.ts`; the reusable functions live in `src/index.ts`. See [TypeScript API](api.md) to avoid spawning a subprocess from another Bun script.
