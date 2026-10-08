import { appendFile, mkdir, readFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { randomUUID } from 'node:crypto'

export interface JournalEvent {
  id: string
  at: string
  type: string
  data: Record<string, unknown>
}
export async function appendEvent(path: string, type: string, data: Record<string, unknown> = {}): Promise<JournalEvent> {
  if (!/^[a-z][a-z0-9.-]{0,63}$/.test(type)) throw new Error('type must be 1–64 lowercase letters, digits, dots, or hyphens; start with a letter')
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('data must be a JSON object')
  const event = { id: randomUUID(), at: new Date().toISOString(), type, data }
  const line = JSON.stringify(event) + '\n'
  await mkdir(dirname(path), { recursive: true })
  await appendFile(path, line, 'utf8')
  return event
}
export async function readEvents(path: string): Promise<JournalEvent[]> {
  let text: string
  try { text = await readFile(path, 'utf8') } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
  return text.split('\n').flatMap((line, index) => {
    if (!line.trim()) return []
    try {
      const value = JSON.parse(line)
      if (typeof value.id !== 'string' || typeof value.at !== 'string' || typeof value.type !== 'string' || !value.data || typeof value.data !== 'object' || Array.isArray(value.data)) throw new Error('invalid event shape')
      return [value as JournalEvent]
    } catch { throw new Error(`Invalid event at line ${index + 1}`) }
  })
}
export function summarize(events: JournalEvent[]): { total: number; byType: Record<string, number> } {
  const byType: Record<string, number> = Object.create(null)
  for (const event of events) byType[event.type] = (byType[event.type] ?? 0) + 1
  return { total: events.length, byType }
}
