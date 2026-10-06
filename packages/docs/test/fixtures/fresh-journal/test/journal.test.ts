import { test, expect } from 'bun:test'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { appendEvent, readEvents, summarize } from '../src/index'
test('append, filterable envelopes, summary, and malformed-line failure', async () => {
  const root = await mkdtemp(join(tmpdir(), 'relaylog-'))
  try {
    const path = join(root, 'events.jsonl')
    expect(await readEvents(path)).toEqual([])
    await appendEvent(path, 'build.done', { durationMs: 120 })
    await appendEvent(path, 'build.done', { durationMs: 95 })
    const events = await readEvents(path)
    expect(events).toHaveLength(2)
    expect(summarize(events)).toEqual({ total: 2, byType: { 'build.done': 2 } })
    await expect(appendEvent(path, 'INVALID', {})).rejects.toThrow('type must')
    await writeFile(path, '{broken\n')
    await expect(readEvents(path)).rejects.toThrow('Invalid event at line 1')
  } finally { await rm(root, { recursive: true, force: true }) }
})
