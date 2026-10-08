import { expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import docsIndex from '../../../www/docs.json'
import { navGroups } from '../../../www/src/lib/nav'

const root = resolve(import.meta.dir, '../../..')

test('growth guides have sidebar entries, paired content, and raw handoff routes', async () => {
  const group = docsIndex.groups.find(group => group.id === 'growth-guides')!
  expect(group.title).toBe('Growth guides')
  expect(group.items).toHaveLength(5)
  expect(navGroups.find(group => group.id === 'growth-guides')?.items).toEqual(
    group.items.map(item => ({ title: item.title, href: `/docs/${item.id}` })),
  )

  for (const item of group.items) {
    const human = await readFile(resolve(root, `www/docs/${item.id}.md`), 'utf8')
    const agent = await readFile(resolve(root, `www/docs/${item.id}.agent.md`), 'utf8')
    expect(human).toContain(`title: ${item.title}`)
    expect(human).toContain('bunx dewey build')
    expect(human).toContain('bunx dewey check --json')
    expect(agent).toContain('| Field | Contract |')
    expect(await readFile(resolve(root, `www/public/docs/${item.id}.md`), 'utf8')).toBe(human)
    expect(await readFile(resolve(root, `www/public/agents/${item.id}.md`), 'utf8')).toBe(agent)
  }
})
