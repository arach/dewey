import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { assertWritable, hash, json, optional, safePath, type Model } from './model.js'

export function region(name: string, content: string): string { return `<!-- dewey:begin ${name} -->\n${content.trimEnd()}\n<!-- dewey:end ${name} -->` }
// 'none' when the file has no markers for this region, 'broken' when they are duplicated or out of order.
export function regionState(text: string, name: string): 'none' | 'one' | 'broken' {
  const [starts, ends] = [`<!-- dewey:begin ${name} -->`, `<!-- dewey:end ${name} -->`].map(marker => text.split(marker).length - 1)
  if (!starts && !ends) return 'none'
  return starts === 1 && ends === 1 && text.indexOf(`<!-- dewey:end ${name} -->`) > text.indexOf(`<!-- dewey:begin ${name} -->`) ? 'one' : 'broken'
}
export function updateRegion(original: string | null, name: string, content: string): string {
  if (original === null) return `${region(name, content)}\n`
  const start = `<!-- dewey:begin ${name} -->`
  const end = `<!-- dewey:end ${name} -->`
  if (original.split(start).length !== 2 || original.split(end).length !== 2 || original.indexOf(end) < original.indexOf(start)) throw new Error(`Refusing unmarked or ambiguous ${name} output; preserve/adopt it manually`)
  return original.slice(0, original.indexOf(start)) + region(name, content) + original.slice(original.indexOf(end) + end.length)
}
export async function writeSafe(root: string, path: string, content: string | Buffer): Promise<void> {
  await assertWritable(root, path)
  const absolute = safePath(root, path)
  await mkdir(dirname(absolute), { recursive: true })
  const temporary = `${path}.dewey-tmp-${process.pid}`
  await assertWritable(root, temporary)
  await writeFile(safePath(root, temporary), content, { flag: 'wx' })
  try { await rename(safePath(root, temporary), absolute) } finally { await rm(safePath(root, temporary), { force: true }) }
}
// Files Dewey writes only inside marked regions. The rest belongs to the author, so they are never pruned.
const REGION_FILES = new Set(['llms.txt', 'AGENTS.md'])
interface Owned { schemaVersion: 1; files: Record<string, string> }
export async function writeOutputs(model: Model, outputs: Record<string, string | Buffer>): Promise<void> {
  const { root } = model
  const raw = await optional(join(root, '.dewey/outputs.json'))
  const previous: Owned = raw ? JSON.parse(raw) : { schemaVersion: 1, files: {} }
  if (previous.schemaVersion !== 1 || !previous.files || typeof previous.files !== 'object') throw new Error('Invalid output ownership manifest')
  // Validate every target and stale deletion before making any changes.
  for (const path of new Set([...Object.keys(outputs), ...Object.keys(previous.files)])) {
    if (!(path.startsWith('.dewey/site/') || REGION_FILES.has(path))) throw new Error(`Invalid owned output path: ${path}`)
    await assertWritable(root, path)
    if (REGION_FILES.has(path)) continue // Its generated region has ownership; text outside belongs to the author.
    let existing: Buffer | null
    try { existing = await readFile(safePath(root, path)) } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; existing = null }
    if (existing && previous.files[path] !== hash(existing)) throw new Error(`Refusing modified or unowned generated output: ${path}`)
  }
  await assertWritable(root, '.dewey/outputs.json')
  for (const [path, content] of Object.entries(outputs)) await writeSafe(root, path, content)
  for (const path of Object.keys(previous.files)) if (!(path in outputs) && !REGION_FILES.has(path)) await rm(safePath(root, path), { force: true })
  await writeSafe(root, '.dewey/outputs.json', json({ schemaVersion: 1, files: Object.fromEntries(Object.entries(outputs).filter(([path]) => !REGION_FILES.has(path) || path === 'llms.txt').map(([path, content]) => [path, hash(content)])) }))
}
