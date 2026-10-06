---
kind: guide
title: Inspect a journal
covers: []
---

# Inspect a journal

Read operations do not mutate the journal. They parse the file in order and either return the complete set of valid records or report the first malformed line.

## List every record

```sh
bun run journal -- list
```

Output is JSON Lines: one event per output line. This makes it straightforward to save or pipe records into another local tool. No header or decorative output is mixed into stdout.

## Select an exact type

```sh
bun run journal -- list build.done
```

The optional argument is an exact match, not a prefix or regular expression. `build` does not match `build.done`. Filtering preserves the order of matching records.

## Count by type

```sh
bun run journal -- summary
```

```json
{
  "total": 3,
  "byType": {
    "build.done": 2,
    "release.ready": 1
  }
}
```

The numbers above are illustrative. The command counts records in the selected file, including repeated event types and repeated payloads. There is no deduplication pass.

## Query with the API

```ts
import { readEvents, summarize } from './src/index'

const events = await readEvents('.data/events.jsonl')
const forApi = events.filter(event => event.data.service === 'api')
console.log(summarize(forApi))
```

`readEvents` loads the complete file into memory. Keep journals bounded for development use; this API is not a streaming query engine. A missing journal produces an empty array and a summary with a zero total.

For malformed input, follow [Recover a journal](recovery.md) rather than ignoring the error.
