---
kind: reference
title: TypeScript API
covers: []
---

# TypeScript API

Import the journal functions directly when a local script needs structured results. All paths are filesystem paths. No function starts a server or schedules background work.

## appendEvent

```ts
appendEvent(
  path: string,
  type: string,
  data?: Record<string, unknown>,
): Promise<JournalEvent>
```

Validate the type and payload, serialize an envelope, create missing parent directories, and append one line. The returned event is the same object serialized to disk. An append failure rejects the promise.

```ts
import { appendEvent } from './src/index'

const event = await appendEvent('.data/events.jsonl', 'deploy.done', {
  service: 'worker',
  revision: 'a1b2c3',
})
console.log(event.id, event.at)
```

## readEvents

```ts
readEvents(path: string): Promise<JournalEvent[]>
```

Read the complete journal into memory. A missing file returns an empty array. A malformed nonblank line rejects with its one-based line number. The returned array preserves file order.

## summarize

```ts
summarize(events: JournalEvent[]): {
  total: number
  byType: Record<string, number>
}
```

Count an already-loaded event list. The function does not touch the filesystem or mutate the input. The `byType` object has a null prototype, so event names cannot shadow inherited object properties.

```ts
import { readEvents, summarize } from './src/index'

const events = await readEvents('.data/events.jsonl')
const deployments = events.filter(event => event.type === 'deploy.done')
const report = summarize(deployments)
console.log(report.total)
```

## Error handling

| Operation | Failure | Caller responsibility |
| --- | --- | --- |
| appendEvent | Invalid name, invalid payload, serialization or filesystem error | Report the failure; do not claim the record was stored |
| readEvents | Invalid line or filesystem error | Preserve the journal before attempting recovery |
| summarize | Caller supplies an invalid event array | Validate inputs before calling |

The CLI translates rejected promises into stderr messages and exit status one. API callers choose their own reporting and retry policy. See [Recover a journal](../guides/recovery.md) before retrying a malformed file.
