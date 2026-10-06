---
kind: reference
title: Event schema
covers: []
---

# Event schema

A journal is a UTF-8 JSON Lines file. Each nonblank line is one envelope. Writers terminate each record with a newline; readers preserve file order and ignore blank lines.

## Envelope

| Field | Type | Writer behavior | Reader requirement |
| --- | --- | --- | --- |
| id | string | Generated UUID | Must be a string |
| at | string | Current UTC ISO timestamp | Must be a string |
| type | string | Validated lowercase event name | Must be a string |
| data | object | Supplied payload, default empty object | Non-null object, not an array |

```ts
interface JournalEvent {
  id: string
  at: string
  type: string
  data: Record<string, unknown>
}
```

## Writer validation

Event types match this pattern:

```text
^[a-z][a-z0-9.-]{0,63}$
```

The writer rejects a non-object payload. JSON serialization also fails for circular structures or unsupported values such as BigInt. Serialization occurs before opening the file for append.

## Reader validation

The reader verifies the envelope shape, not the full history. It does not enforce UUID formatting, parse timestamps, deduplicate IDs, or reapply the writer’s type-name pattern. Additional envelope fields are accepted.

A malformed record throws `Invalid event at line N`. Filesystem errors other than a missing file propagate to the caller. Missing files return an empty event list.

## Ordering

The authoritative order is file order, not timestamp sorting. Two events can share a timestamp. Concurrent writers are outside the supported contract; use one writer per journal.

See [TypeScript API](api.md) for return values and [CLI reference](cli.md) for process exit behavior.
