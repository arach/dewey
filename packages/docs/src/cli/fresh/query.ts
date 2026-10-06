import { realpath } from 'node:fs/promises'
import { isAbsolute, relative, resolve, sep } from 'node:path'
import { json, loadModel, matches, sourceArea, tokens, type Doc } from './model.js'

export interface Covering { path: string; kind: Doc['kind']; title: string; pattern: string; lines: number; tokens: number }
const ORDER: Doc['kind'][] = ['map', 'reference', 'guide', 'history']

function projectPath(root: string, target: string): string {
  const path = relative(root, resolve(root, target)).split(sep).join('/')
  if (path.startsWith('..') || isAbsolute(path)) throw new Error(`Path is outside the project: ${target}`)
  return path
}
// Docs whose covers match the path, or any source file under it when it is a directory.
export async function whichDocs(target: string, directory = process.cwd()): Promise<{ path: string; docs: Covering[] }> {
  const model = await loadModel(await realpath(directory))
  const path = projectPath(model.root, target)
  const files = [path, ...model.sources.filter(source => path === '' || source.startsWith(`${path}/`))]
  const docs = model.docs.flatMap(doc => {
    const pattern = doc.covers.find(pattern => files.some(file => matches(file, pattern)))
    return pattern ? [{ path: doc.path, kind: doc.kind, title: doc.title, pattern, lines: doc.raw.trimEnd().split('\n').length, tokens: tokens(doc.raw) }] : []
  })
  return { path, docs: docs.sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || a.path.localeCompare(b.path)) }
}
// Source files that no map covers, grouped by area.
export async function uncoveredSources(directory = process.cwd()): Promise<{ areas: { area: string; files: string[] }[] }> {
  const model = await loadModel(await realpath(directory))
  const maps = model.docs.filter(doc => doc.kind === 'map')
  const files = model.sources.filter(path => !maps.some(doc => doc.covers.some(pattern => matches(path, pattern))))
  return { areas: [...new Set(files.map(sourceArea))].map(area => ({ area, files: files.filter(path => sourceArea(path) === area) })) }
}
export async function freshWhich(target: string, options: { json?: boolean } = {}): Promise<void> {
  const result = await whichDocs(target)
  if (options.json) { console.log(json(result).trimEnd()); return }
  if (!result.docs.length) { console.log(`No doc covers ${result.path || '.'}. Add covers: to a doc, or run dewey new map <area>.`); return }
  for (const doc of result.docs) console.log(`${doc.path}  ${doc.kind}  ${doc.title}  ${doc.lines} lines, ~${doc.tokens} tokens  (covers ${doc.pattern})`)
}
export async function freshUncovered(options: { json?: boolean } = {}): Promise<void> {
  const result = await uncoveredSources()
  if (options.json) { console.log(json(result).trimEnd()); return }
  if (!result.areas.length) { console.log('Every source file is covered by a map.'); return }
  for (const { area, files } of result.areas) console.log(`${area}  ${files.length} file${files.length === 1 ? '' : 's'}: ${files.join(', ')}\n  fix: dewey new map ${area}`)
}
