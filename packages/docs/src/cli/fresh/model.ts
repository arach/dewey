import { createHash } from 'node:crypto'
import { lstat, readdir, readFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, posix, resolve, sep } from 'node:path'
import matter from 'gray-matter'
import { extractLlmsSummary } from './summary.js'

export const STATE = '.dewey/project.json'
export const OUTPUT = '.dewey/site'
export const KINDS = ['guide', 'map', 'reference', 'history'] as const
// shipped: describes what ships today. proposal: planned. abandoned: kept for the record, never published.
export const STATUSES = ['shipped', 'proposal', 'abandoned'] as const
// hosts: tool-specific instruction files (named by the project) that must redirect to AGENTS.md.
// commands: extra shell commands docs may use, beyond the package's bins and the built-in allowlist.
export interface Project { schemaVersion: 1; name: string; purpose: string; rules: string[]; hosts?: string[]; commands?: string[] }
// offset: lines of frontmatter before body, so body positions map to file lines.
export interface Doc { path: string; title: string; summary: string; kind: typeof KINDS[number]; covers: string[]; body: string; raw: string; offset: number; draft: boolean; hidden: boolean; route: string
  status: typeof STATUSES[number]; applies: string[]; supersedes: string[]; supersededBy: string[]; order?: number; group?: string }
export interface Issue { code: string; path: string; line?: number; message: string; fix?: string }
// One default repair per issue code; an issue may carry a more specific fix.
export const FIXES: Record<string, string> = {
  PROJECT_INVALID: 'Run dewey init, or repair .dewey/project.json.',
  DOC_KIND: 'Add kind: guide, reference, map or history to the frontmatter.',
  DOC_STATUS: 'Set status to shipped, proposal or abandoned, or remove it (shipped is the default).',
  DOC_META: 'Set applies, supersedes and superseded_by to a string or a list of strings, order to a number and group to a string.',
  SUPERSEDES_MISSING: 'Point supersedes and superseded_by at doc paths from the project root, such as docs/old-guide.md.',
  DOC_COVERS: 'Set covers to a project-relative path or glob, or a list of them, using *, ** or ?.',
  FRONT_DOOR_MISSING: 'Run dewey init, or restore AGENTS.md.',
  FRONT_DOOR_BUDGET: 'Move tutorials and reference into docs/ and link to them from AGENTS.md. Keep host files to a one-line pointer.',
  FRONT_DOOR_POINTER: 'Replace the file with one line that links to AGENTS.md.',
  SKILL_MISSING: 'Add SKILL.md that tells another project how to use this one.',
  MAP_MISSING: 'Run dewey new map <area>, then describe its files, data flow and traps.',
  DOC_DRAFT: 'Finish the doc, then delete the draft: true line.',
  REVIEW_REQUIRED: 'Re-read the covered code, correct the doc, then run dewey review <doc>.',
  COVERAGE_EMPTY: 'Fix the pattern or remove it.',
  COVERAGE_OVERLAP: 'Give each file one map: narrow one pattern, or merge the two maps.',
  COVERAGE_BROAD: 'Cover one area, such as src/sync/**, instead of every file in the repo.',
  REGION_STALE: 'Run dewey build. Keep hand edits outside the dewey:begin and dewey:end markers.',
  REGION_INVALID: 'Leave exactly one dewey:begin observed and one dewey:end observed marker in AGENTS.md, or remove both.',
  NON_PUBLIC_LINK: 'Link to a guide or reference instead, or cite the path in backticks.',
  BROKEN_LINK: 'Point the link at a file that exists, or remove it.',
  BROKEN_ANCHOR: 'Use a heading that exists in the target file.',
  MISSING_PATH: 'Update the path to where the file lives now, or remove the reference.',
  MISSING_SCRIPT: 'Use a script from package.json, or add the script.',
  MISSING_SYMBOL: 'Cite a name the file declares, such as `src/model.ts#loadModel` or `src/model.ts#Model.docs`, or update the doc.',
  MISSING_COMMAND: 'Restore the local script, or make it executable.',
  UNKNOWN_COMMAND: 'Use a package bin or script, add the command to commands in .dewey/project.json, or mark the fence ```sh ignore.',
  PUBLISH_MISSING: 'Add "docs", "AGENTS.md" and "SKILL.md" to the files list in package.json, or drop the .npmignore entry.',
  OUTPUT_OWNERSHIP: 'Move hand edits out of the generated file, delete it, then run dewey build.',
  STALE_OUTPUT: 'Run dewey build.',
  NAV_MISSING: 'Run dewey build; if it persists, remove nav: false.',
  SITE_LINK: 'Fix the link in the source Markdown, then run dewey build.',
}
export function lineAt(text: string, index: number): number { return text.slice(0, Math.max(0, index)).split('\n').length }
export interface Model { root: string; project: Project; docs: Doc[]; sources: string[]; scripts: Record<string, string>; bins: string[]; issues: Issue[] }
const IGNORED = new Set(['node_modules', 'dist', 'build', 'coverage', 'vendor', 'docs', 'test', 'tests', '__tests__'])
export const hash = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
export const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
export async function optional(path: string): Promise<string | null> {
  try { return await readFile(path, 'utf8') } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}
export function safePath(root: string, path: string): string {
  if (isAbsolute(path) || path.split(/[\\/]/).includes('..') || path.includes('\\')) throw new Error(`Unsafe project path: ${path}`)
  const absolute = resolve(root, path)
  if (!absolute.startsWith(`${resolve(root)}${sep}`)) throw new Error(`Unsafe project path: ${path}`)
  return absolute
}
// Never write through a symlink, including an intermediate component.
export async function assertWritable(root: string, path: string): Promise<void> {
  safePath(root, path)
  let current = root
  for (const segment of path.split('/')) {
    current = join(current, segment)
    try { if ((await lstat(current)).isSymbolicLink()) throw new Error(`Refusing symlink output: ${path}`) } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }
  }
}
export async function walk(root: string, dir = '', source = false): Promise<string[]> {
  let entries
  try { entries = await readdir(join(root, dir), { withFileTypes: true }) } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
  const files: string[] = []
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isSymbolicLink() || entry.name.startsWith('.') || (source && IGNORED.has(entry.name))) continue
    const path = posix.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...await walk(root, path, source))
    else if (entry.isFile()) files.push(path)
  }
  return files
}
export function matches(path: string, pattern: string): boolean {
  safePath('/dewey-root', pattern)
  if (/[\[\]{}]/.test(pattern)) throw new Error(`Unsupported coverage glob: ${pattern}; use *, ** or ?`)
  let expression = ''
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i]
    if (char === '*' && pattern[i + 1] === '*') {
      i++
      if (pattern[i + 1] === '/') { i++; expression += '(?:.*/)?' } else expression += '.*'
    } else if (char === '*') expression += '[^/]*'
    else if (char === '?') expression += '[^/]'
    else expression += char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
  return new RegExp(`^${expression}$`).test(path)
}
export async function packageInfo(root: string): Promise<{ name?: string; description?: string; scripts: Record<string, string>; entries: string[]; bins: string[] }> {
  const raw = await optional(join(root, 'package.json'))
  const pkg = raw ? JSON.parse(raw) : {}
  const scripts = Object.fromEntries(Object.entries(pkg.scripts ?? {}).filter(([, value]) => typeof value === 'string')) as Record<string, string>
  const entries = [pkg.main, pkg.module, pkg.types, ...(typeof pkg.bin === 'string' ? [pkg.bin] : Object.values(pkg.bin ?? {}))].filter((value): value is string => typeof value === 'string')
  const bins = typeof pkg.bin === 'string' ? (typeof pkg.name === 'string' ? [pkg.name.replace(/^@[^/]+\//, '')] : []) : Object.keys(pkg.bin ?? {})
  return { name: pkg.name, description: pkg.description, scripts, entries, bins }
}
export async function sourceFiles(root: string): Promise<string[]> {
  const files = await walk(root, '', true)
  const { entries } = await packageInfo(root)
  const source = /\.(?:[cm]?[jt]sx?|swift|py|go|rs|c|cpp|h|sh)$/
  return files.filter(path => source.test(path) && (path.startsWith('src/') || path.startsWith('lib/') || path.startsWith('Sources/') || /^(packages|apps)\/[^/]+\/(src|Sources)\//.test(path) || !path.includes('/') || entries.includes(path))).sort()
}
export function sourceArea(path: string): string {
  const parts = path.split('/')
  const start = ['packages', 'apps'].includes(parts[0]) ? 3 : 1
  if (parts.length === 1) return '.'
  return parts.slice(0, parts.length > start + 1 ? start + 1 : start).join('/')
}
export async function loadModel(root: string): Promise<Model> {
  const state = await optional(join(root, STATE))
  if (!state) throw new Error('Run dewey init in this project first.')
  const project = JSON.parse(state) as Project
  if (project.schemaVersion !== 1 || typeof project.name !== 'string' || typeof project.purpose !== 'string' || !Array.isArray(project.rules) || project.rules.some(rule => typeof rule !== 'string') || (project.hosts !== undefined && (!Array.isArray(project.hosts) || project.hosts.some(host => typeof host !== 'string' || !/^[\w.-]+\.md$/.test(host)))) || (project.commands !== undefined && (!Array.isArray(project.commands) || project.commands.some(command => typeof command !== 'string')))) throw new Error(`Invalid ${STATE}`)
  const issues: Issue[] = []
  const files = (await walk(root, 'docs')).filter(path => path.endsWith('.md'))
  if (await optional(join(root, 'README.md')) !== null) files.unshift('README.md')
  const docs: Doc[] = []
  for (const path of files) {
    const raw = await readFile(join(root, path), 'utf8')
    const { data, content } = matter(raw)
    const kind = data.kind ?? (path === 'README.md' ? 'guide' : undefined)
    if (!KINDS.includes(kind)) { issues.push({ code: 'DOC_KIND', path, line: 1, message: `Declare kind: ${KINDS.join(' | ')}` }); continue }
    const covers = typeof data.covers === 'string' ? [data.covers] : data.covers ?? []
    if (!Array.isArray(covers) || covers.some(pattern => typeof pattern !== 'string')) { issues.push({ code: 'DOC_COVERS', path, message: 'covers must be a path/glob or an array of paths/globs' }); continue }
    let valid = true
    for (const pattern of covers) {
      try { matches('', pattern) } catch (error) { valid = false; issues.push({ code: 'DOC_COVERS', path, message: String(error) }) }
    }
    if (!valid) continue
    if (kind === 'map' && !covers.length) issues.push({ code: 'DOC_COVERS', path, message: 'A map must declare the code it covers' })
    const status = data.status ?? 'shipped'
    if (!STATUSES.includes(status)) { issues.push({ code: 'DOC_STATUS', path, line: lineAt(raw, raw.search(/^status:/m)), message: `Unknown status: ${String(status)}` }); continue }
    const list = (key: string): string[] | null => {
      const value = data[key] ?? []
      const items = typeof value === 'string' ? [value] : value
      return Array.isArray(items) && items.every(item => typeof item === 'string') ? items : null
    }
    const [applies, supersedes, supersededBy] = [list('applies'), list('supersedes'), list('superseded_by')]
    if ((data.order !== undefined && typeof data.order !== 'number') || (data.group !== undefined && typeof data.group !== 'string')) { issues.push({ code: 'DOC_META', path, line: 1, message: 'order must be a number and group a string' }); continue }
    if (!applies || !supersedes || !supersededBy) { issues.push({ code: 'DOC_META', path, line: 1, message: 'applies, supersedes and superseded_by must be strings or lists of strings' }); continue }
    const route = path === 'README.md' ? 'readme.html' : `${path.replace(/\.md$/, '')}.html`
    const title = String(data.title ?? content.match(/^#\s+(.+)$/m)?.[1] ?? path)
    docs.push({ path, title, summary: extractLlmsSummary({ title, content, description: typeof data.description === 'string' ? data.description : undefined }), kind, covers, body: content, raw, offset: lineAt(raw, raw.lastIndexOf(content)) - 1, draft: data.draft === true, hidden: data.nav === false, route, status, applies, supersedes, supersededBy, ...(data.order !== undefined ? { order: data.order } : {}), ...(data.group ? { group: data.group } : {}) })
  }
  return { root, project, docs, sources: await sourceFiles(root), ...await packageInfo(root).then(({ scripts, bins }) => ({ scripts, bins })), issues }
}
// Same rough estimate as agent-artifacts: whitespace-separated words × 1.33.
// Rough token estimate: the larger of a word count and a character count, so dense lines can't hide.
export function tokens(text: string): number { return Math.ceil(Math.max(text.split(/\s+/).filter(Boolean).length * 1.33, text.length / 4)) }
// Everything an agent loads automatically: AGENTS.md plus the host files.
export const BUDGET = { lines: 150, tokens: 2000 }
export function lineCount(text: string): number { return text.trimEnd().split('\n').length }
// Published as a page: guides and reference, unless abandoned.
export function human(doc: Doc): boolean { return (doc.kind === 'guide' || doc.kind === 'reference') && doc.status !== 'abandoned' }
// What an agent should trust as today's behavior: shipped and not replaced.
export function current(doc: Doc): boolean { return human(doc) && doc.status === 'shipped' && !doc.supersededBy.length }
export async function coverageHashes(model: Model, doc: Doc): Promise<Record<string, string>> {
  const files = model.sources.filter(path => doc.covers.some(pattern => matches(path, pattern)))
  return Object.fromEntries(await Promise.all(files.map(async path => [path, hash(await readFile(join(model.root, path), 'utf8'))])))
}
export async function coverageHash(model: Model, doc: Doc): Promise<string> { return hash(json(Object.entries(await coverageHashes(model, doc)))) }
export function resolveReference(from: string, href: string): { path: string; fragment: string } | null {
  if (/^(?:[a-z][\w+.-]*:|\/\/)/i.test(href)) return null
  const [withoutFragment, fragment = ''] = href.split('#', 2)
  const path = decodeURIComponent(withoutFragment.split('?')[0])
  return { path: path ? posix.normalize(path.startsWith('/') ? path.slice(1) : posix.join(dirname(from), path)) : from, fragment: decodeURIComponent(fragment) }
}
