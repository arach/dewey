---
kind: guide
title: Recover a journal
covers: []
---

# Recover a journal

A process interrupted during a write can leave an incomplete final line. Manual edits can also produce malformed JSON or an invalid envelope. Relaylog stops at the first bad record instead of returning a misleading partial history.

## Recognize the error

The reader reports a one-based line number:

```text
Invalid event at line 7
```

This message covers both JSON syntax errors and an invalid event shape. It does not claim that earlier or later records are safe to discard.

## Preserve the original

Stop writers before editing. Make a separate backup using your file manager or a copy command. Do not use the original file as the output of a filtering command that is reading it.

## Inspect the indicated line

Every nonblank line must be one complete JSON object. Check that it contains string values for `id`, `at`, and `type`, plus an object for `data`. Blank lines are ignored. A trailing newline is normal.

| Symptom | Likely cause | Safe next action |
| --- | --- | --- |
| Line ends inside a string | Interrupted append | Preserve the file; inspect the producer |
| Payload is an array | Manual edit or foreign producer | Correct against the documented envelope |
| Permission error | File or directory is not writable | Fix ownership outside Relaylog |
| Empty output | Missing or empty journal | Verify RELAYLOG_PATH and working directory |

## Validate a repaired copy

Point `RELAYLOG_PATH` at the repaired copy, then run:

```sh
bun run journal -- list
bun run journal -- summary
```

Only replace the original after reviewing the complete output. Relaylog has no automatic repair, truncation, or migration command. Never describe a failed read as an empty journal.

See [Event schema](../reference/schema.md) for the exact reader contract.
