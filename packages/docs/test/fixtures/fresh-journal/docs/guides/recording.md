---
kind: guide
title: Record events
covers: []
---

# Record events

An event should describe something that already happened. Prefer stable names such as `build.done`, `deploy.failed`, and `review.accepted` over commands such as “please deploy.” Keep the details in the payload rather than encoding them into the type.

## Name the event

Types start with a lowercase letter and contain at most 64 characters. Remaining characters may be lowercase letters, digits, dots, or hyphens. `deploy.failed` is valid; `Deploy Failed` is not.

```sh
bun run journal -- add deploy.failed '{"service":"api","reason":"health-check","attempt":2}'
```

Validation happens before a write. A rejected type leaves the journal unchanged.

## Make the payload useful

| Field | Use it for | Example |
| --- | --- | --- |
| service | The component involved | api |
| revision | A source revision or build identifier | a1b2c3 |
| durationMs | An elapsed duration, with an explicit unit | 840 |
| reason | A stable reason code | health-check |

These are conventions, not reserved schema fields. Relaylog accepts any JSON object as `data`. Arrays, null, and single-value payloads are rejected.

## Append from TypeScript

```ts
import { appendEvent } from './src/index'

const event = await appendEvent('.data/events.jsonl', 'build.done', {
  service: 'api',
  durationMs: 840,
})
console.log(event.id)
```

The function adds one newline-terminated record. It never reads and rewrites older records during an append.

## Keep sensitive values out

Do not record access tokens, full request bodies containing personal data, or authentication headers. The journal is ordinary plaintext on your filesystem. An event ID is an identifier, not an access-control mechanism.

See [Event schema](../reference/schema.md) for validation details and [Recover a journal](recovery.md) for handling interrupted writes.
