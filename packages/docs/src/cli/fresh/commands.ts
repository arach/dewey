import { access, constants, lstat, readFile, realpath } from 'node:fs/promises'
import { basename, delimiter, join } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { assertWritable, coverageHash, FIXES, lineAt, hash, human, json, loadModel, matches, optional, OUTPUT, packageInfo, resolveReference, safePath, sourceArea, sourceFiles, STATE, walk, type Issue, type Model, type Project } from './model.js'
import { attributes, llmsIndex, markdown, siteFiles } from './site.js'
import { region, updateRegion, writeOutputs, writeSafe } from './storage.js'

interface InitOptions { purpose?: string; rule?: string[]; rules?: boolean; host?: string[] }
interface Review { sourceHash: string; docHash: string }
type Reviews = Record<string, Review>
const AUTHOR_SKILL = `---
name: dewey-author
description: Maintain this project's maps, guides, front door, and generated docs site using Dewey.
---
# Maintain project documentation

Use this skill after adding or changing a source area, command, public API, or task flow.

1. Read AGENTS.md and the affected docs map. Do not load history by default.
2. Run dewey check --json. Treat covered-code changes as a request for review, not proof the prose is false.
3. For a new area, add docs/<area>.agent.md with kind: map and covers: [src/<area>/**]. Describe files, data flow, invariants, and traps. Give it a real title. Do not pair every guide with a map.
4. Write task-shaped guides with kind: guide, and API/CLI/config contracts with kind: reference. Use relative Markdown links. Set nav: false only for intentionally unlisted human pages. Keep history at kind: history.
5. Finish scaffold drafts and remove draft: true only after review. Never invent behavior. Verify cited paths and package scripts without executing untrusted doc commands.
6. After reviewing a covered document against current code, run dewey review docs/<area>.agent.md. This explicitly records content hashes; build never acknowledges review for you.
7. Run dewey build, then dewey check. Repair broken links, missing navigation, and stale outputs. Site and llms.txt come from the same Markdown.
8. Keep AGENTS.md at 150 lines or fewer. Put hard rules outside its observed generated region. Dewey may only update marked regions; do not overwrite authored text.
9. Update root SKILL.md for agents using this project from outside. It is not this authoring skill.

Coverage supports *, **, and ?. A src/* map does not cover a new nested area such as src/sync/. No external-link network checks or command execution are performed by check. Root README.md is treated as a guide when it has no kind declaration.
`
async function answer(question: string): Promise<string> {
  if (!stdin.isTTY || !stdout.isTTY) throw new Error(`${question} Supply --purpose and either --rule or --no-rules in non-interactive use.`)
  const reader = createInterface({ input: stdin, output: stdout })
  try { return (await reader.question(`${question} `)).trim() } finally { reader.close() }
}
const HOST_POINTER = 'Read [AGENTS.md](./AGENTS.md) for this project’s instructions.\n'
function yaml(value: string): string { return JSON.stringify(value) }
function observed(scripts: Record<string, string>, areas: string[], mapPaths?: Record<string, string>): string {
  return ['## Commands', '', ...(Object.keys(scripts).length ? Object.keys(scripts).sort().map(script => `- \`bun run ${script}\``) : ['No package scripts were found.']), '', '## Where to work', '', ...areas.map(area => `- Working on \`${area}\` → read \`${mapPaths?.[area] ?? `docs/${mapName(area)}.agent.md`}\`.`), '', '## Documentation loop', '', '- Read `.agents/skills/dewey-author/SKILL.md` when maintaining docs.', '- Run `dewey build`, then `dewey check`.', '- Review covered-code changes with `dewey review <document>`.', '- Site output: `.dewey/site/`; agent index: `llms.txt`.'].join('\n')
}
function mapName(area: string): string { return area === '.' ? 'root' : area.replace(/\//g, '-') }
export async function freshInit(options: InitOptions = {}, directory = process.cwd()): Promise<void> {
  const root = await realpath(directory)
  const existing = await optional(join(root, STATE))
  const pkg = await packageInfo(root)
  const sources = await sourceFiles(root)
  const areas = [...new Set(sources.map(sourceArea))].sort()
  if (existing) {
    const model = await loadModel(root) // Never replace existing authored scaffolds.
    const mapPaths = Object.fromEntries(areas.flatMap(area => {
      const map = model.docs.find(doc => doc.kind === 'map' && sources.filter(path => sourceArea(path) === area).every(path => doc.covers.some(pattern => matches(path, pattern))))
      return map ? [[area, map.path]] : []
    }))
    const current = await optional(join(root, 'AGENTS.md'))
    const next = updateRegion(current, 'observed', observed(pkg.scripts, areas, mapPaths))
    if (next.trimEnd().split('\n').length > 150) throw new Error('AGENTS.md would exceed 150 lines; shorten its authored text first')
    await writeSafe(root, 'AGENTS.md', next)
    await freshBuild(root)
    return
  }
  const purpose = options.purpose?.trim() || pkg.description?.trim() || await answer('What is this project for?')
  if (!purpose) throw new Error('A project purpose is required')
  const rules = options.rule ?? (options.rules === false ? [] : (await answer('Which hard rules must agents follow? (empty means none)')).split('\n').filter(Boolean))
  const hosts = options.host ?? []
  for (const host of hosts) if (!/^[\w.-]+\.md$/.test(host) || host === 'AGENTS.md') throw new Error(`Invalid host file: ${host}; use a root Markdown file name`)
  const project: Project = { schemaVersion: 1, name: pkg.name || basename(root), purpose, rules, ...(hosts.length ? { hosts } : {}) }
  const scaffolds: Record<string, string> = {
    [STATE]: json(project),
    'AGENTS.md': `# ${project.name}\n\n${purpose}\n\n## Hard rules\n\n${rules.length ? rules.map(rule => `- ${rule}`).join('\n') : 'No project-specific hard rules declared.'}\n\n${region('observed', observed(pkg.scripts, areas))}\n`,
    ...Object.fromEntries(hosts.map(host => [host, HOST_POINTER])),
    'docs/quickstart.md': `---\nkind: guide\ntitle: Get started\ncovers: []\ndraft: true\n---\n\n# Get started\n\n<!-- Author the task, prerequisites, and a verified success condition. Remove draft: true when reviewed. -->\n\n${Object.keys(pkg.scripts).map(script => `- Run \`bun run ${script}\`.`).join('\n')}\n`,
    'SKILL.md': `---\nname: ${yaml(project.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}\ndescription: ${yaml(`Use ${project.name} from another project. ${purpose}`)}\n---\n\n# Use ${project.name}\n\nRead [Get started](docs/quickstart.md) for verified setup and task instructions.\n\n- Use [llms.txt](llms.txt) to find the public guides and reference.\n- Follow the project's constraints:\n${rules.map(rule => `  - ${rule}`).join('\n') || '  - No additional constraints declared.'}\n- Verify prerequisites and the documented success condition before reporting completion.\n- Do not treat internal maps or historical plans as the public interface.\n`,
    '.agents/skills/dewey-author/SKILL.md': AUTHOR_SKILL,
  }
  for (const area of areas) {
    const glob = area === '.' ? '*' : sources.some(path => sourceArea(path) === area && path.slice(area.length + 1).includes('/')) ? `${area}/**` : `${area}/*`
    scaffolds[`docs/${mapName(area)}.agent.md`] = `---\nkind: map\ntitle: ${yaml(`${area} map`)}\ncovers: [${yaml(glob)}]\ndraft: true\n---\n\n# ${area} map\n\n## Files\n\n${sources.filter(path => sourceArea(path) === area).map(path => `- \`${path}\``).join('\n')}\n\n## Data flow\n\n<!-- Describe the actual flow. -->\n\n## Invariants and traps\n\n<!-- Record constraints and failure cases; then remove draft: true. -->\n`
  }
  if (scaffolds['AGENTS.md'].trimEnd().split('\n').length > 150) throw new Error('Observed project exceeds the front-door budget; narrow the project scope before init')
  // Init is for fresh projects; preflight conflicts before creating anything.
  for (const path of [...Object.keys(scaffolds), 'llms.txt', '.dewey/outputs.json', '.dewey/site']) {
    await assertWritable(root, path)
    try { await lstat(safePath(root, path)); throw new Error(`Refusing existing init target: ${path}`) } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
  }
  for (const [path, content] of Object.entries(scaffolds)) await writeSafe(root, path, content)
  await freshBuild(root)
  console.log('Initialized front door, draft maps/guide, SKILL.md, and .dewey/site/index.html. Author the drafts, review maps, then build and check.')
}
async function expectedOutputs(model: Model): Promise<Record<string, string | Buffer>> {
  const site = siteFiles(model)
  const outputs: Record<string, string | Buffer> = Object.fromEntries(Object.entries(site).map(([path, content]) => [`${OUTPUT}/${path}`, content]))
  outputs['llms.txt'] = updateRegion(await optional(join(model.root, 'llms.txt')), 'index', llmsIndex(model, 'repo'))
  // Materialize referenced project assets, not raw maps/history or arbitrary files.
  for (const doc of model.docs.filter(human)) {
    const rendered = markdown(doc.body)
    for (const href of [...attributes(rendered, 'href'), ...attributes(rendered, 'src')]) {
      const target = resolveReference(doc.path, href)
      if (!target || model.docs.some(candidate => candidate.path === target.path)) continue
      if (!/\.(png|jpe?g|gif|webp|avif|ico|pdf|txt)$/i.test(target.path)) continue
      const absolute = safePath(model.root, target.path)
      await assertWritable(model.root, target.path) // also refuses symlink asset reads
      try { outputs[`${OUTPUT}/assets/${target.path}`] = await readFile(absolute) } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
    }
  }
  return outputs
}
export async function freshBuild(directory = process.cwd()): Promise<void> {
  const model = await loadModel(await realpath(directory))
  if (model.issues.length) throw new Error(model.issues.map(issue => `${issue.path}: ${issue.message}`).join('\n'))
  await writeOutputs(model, await expectedOutputs(model))
  console.log(`Built ${model.docs.filter(human).length} human pages, site navigation, and llms.txt → ${OUTPUT}`)
}
export async function reviewDocument(path: string, directory = process.cwd()): Promise<void> {
  const model = await loadModel(await realpath(directory))
  const doc = model.docs.find(doc => doc.path === path)
  if (!doc || !doc.covers.length) throw new Error(`Choose a document with covers frontmatter: ${path}`)
  if (doc.draft) throw new Error(`Finish the draft before reviewing ${path}`)
  if (model.issues.length) throw new Error('Repair document metadata before recording review')
  const reviews: Reviews = JSON.parse(await optional(join(model.root, '.dewey/reviews.json')) ?? '{}')
  reviews[path] = { sourceHash: await coverageHash(model, doc), docHash: hash(doc.raw) }
  await writeSafe(model.root, '.dewey/reviews.json', json(reviews))
  console.log(`Recorded explicit review of ${path} against current covered source`)
}
// Which project files npm would publish, judged from package.json files and .npmignore.
// Rough on purpose: it reads the two lists, not npm's full packing rules.
function listed(path: string, entry: string): boolean {
  const pattern = entry.replace(/^\.\//, '').replace(/\/+$/, '')
  if (!pattern) return false
  if (path === pattern || path.startsWith(`${pattern}/`)) return true
  try { return matches(path, pattern) } catch { return false }
}
async function unpublished(model: Model): Promise<string[]> {
  const raw = await optional(join(model.root, 'package.json'))
  const pkg = raw ? JSON.parse(raw) : null
  if (!pkg?.name || pkg.private === true) return []
  const wanted = ['AGENTS.md', 'SKILL.md', ...model.docs.filter(doc => human(doc) && doc.path.startsWith('docs/')).map(doc => doc.path)]
  if (Array.isArray(pkg.files)) {
    const entries = pkg.files.filter((entry: unknown): entry is string => typeof entry === 'string')
    return wanted.filter(path => !entries.some((entry: string) => !entry.startsWith('!') && listed(path, entry)) || entries.some((entry: string) => entry.startsWith('!') && listed(path, entry.slice(1))))
  }
  const ignore = (await optional(join(model.root, '.npmignore')))?.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#') && !line.startsWith('!')) ?? []
  return wanted.filter(path => ignore.some(entry => listed(path, entry.replace(/^\//, ''))))
}
async function executable(command: string): Promise<boolean> {
  if (['dewey', 'cd', 'echo', 'export', 'printf', 'true', 'false', 'test', 'set', 'pwd'].includes(command)) return true
  for (const directory of (process.env.PATH ?? '').split(delimiter)) {
    try { await access(join(directory, command), constants.X_OK); return true } catch { /* next PATH entry */ }
  }
  return false
}
export async function checkProject(directory = process.cwd()): Promise<{ passed: boolean; issues: Issue[] }> {
  const model = await loadModel(await realpath(directory))
  const issues = [...model.issues]
  const issue = (code: string, path: string, message: string, line?: number, fix?: string) => issues.push({ code, path, ...(line ? { line } : {}), message, ...(fix ? { fix } : {}) })
  const front = await optional(join(model.root, 'AGENTS.md'))
  if (front === null) issue('FRONT_DOOR_MISSING', 'AGENTS.md', 'Front door is missing')
  else if (front.trimEnd().split('\n').length > 150) issue('FRONT_DOOR_BUDGET', 'AGENTS.md', 'Front door exceeds 150 lines', 151)
  for (const host of model.project.hosts ?? []) {
    if (!(await optional(join(model.root, host)))?.includes('AGENTS.md')) issue('FRONT_DOOR_POINTER', host, `Point ${host} to AGENTS.md`)
  }
  if (await optional(join(model.root, 'SKILL.md')) === null) issue('SKILL_MISSING', 'SKILL.md', 'External consumer skill is missing')
  const omitted = await unpublished(model)
  if (omitted.length) issue('PUBLISH_MISSING', 'package.json', `The published package would leave out: ${omitted.join(', ')}`)
  const reviews: Reviews = JSON.parse(await optional(join(model.root, '.dewey/reviews.json')) ?? '{}')
  const maps = model.docs.filter(doc => doc.kind === 'map')
  const uncovered = model.sources.filter(path => !maps.some(doc => doc.covers.some(pattern => matches(path, pattern))))
  for (const area of new Set(uncovered.map(sourceArea))) issue('MAP_MISSING', area, `${area} has no map for: ${uncovered.filter(path => sourceArea(path) === area).join(', ')}`)
  for (const doc of model.docs) {
    if (doc.draft) issue('DOC_DRAFT', doc.path, 'This doc is still a scaffold', lineAt(doc.raw, doc.raw.search(/^draft:/m)))
    if (doc.covers.length && (reviews[doc.path]?.sourceHash !== await coverageHash(model, doc) || reviews[doc.path]?.docHash !== hash(doc.raw))) issue('REVIEW_REQUIRED', doc.path, 'Covered code or this doc changed since the last review', undefined, `Re-read the covered code, correct the doc, then run dewey review ${doc.path}.`)
    for (const pattern of doc.covers) if (!model.sources.some(path => matches(path, pattern))) issue('COVERAGE_EMPTY', doc.path, `Coverage pattern matches no source files: ${pattern}`, lineAt(doc.raw, doc.raw.indexOf(pattern)))
  }
  const texts = [...model.docs.map(doc => ({ path: doc.path, body: doc.body, offset: doc.offset })), ...await Promise.all(['AGENTS.md', 'SKILL.md'].map(async path => ({ path, body: await optional(join(model.root, path)) ?? '', offset: 0 })))]
  for (const doc of texts) {
    const at = (index: number) => index < 0 ? undefined : doc.offset + lineAt(doc.body, index)
    const rendered = markdown(doc.body)
    for (const href of [...attributes(rendered, 'href'), ...attributes(rendered, 'src')]) {
      const line = at(doc.body.indexOf(href))
      try {
        const target = resolveReference(doc.path, href)
        if (!target) continue
        const absolute = safePath(model.root, target.path)
        const other = model.docs.find(candidate => candidate.path === target.path)
        if (other && !human(other) && model.docs.some(candidate => candidate.path === doc.path && human(candidate))) issue('NON_PUBLIC_LINK', doc.path, `Human page links to unpublished ${other.kind}: ${target.path}`, line)
        if (!(await lstat(absolute).catch(() => null))) issue('BROKEN_LINK', doc.path, `Missing link target: ${href}`, line)
        else if (target.fragment && target.path.endsWith('.md')) {
          const body = other?.body ?? await readFile(absolute, 'utf8')
          if (!attributes(markdown(body), 'id').includes(target.fragment)) issue('BROKEN_ANCHOR', doc.path, `Missing heading: ${href}`, line)
        }
      } catch (error) { issue('BROKEN_LINK', doc.path, `${href}: ${String(error)}`, line) }
    }
    for (const match of doc.body.matchAll(/`([^`\n]+)`/g)) {
      const path = match[1].replace(/:\d+(?::\d+)?$/, '')
      if (/^(src|lib|Sources|packages|apps|scripts|docs|\.agents)\/[\w./-]+\/?$/.test(path) || /^[\w.-]+\.(?:md|json|ya?ml|toml|[cm]?[jt]sx?|swift|py|go|rs|sh)$/.test(path)) {
        if (!(await lstat(safePath(model.root, path)).catch(() => null))) issue('MISSING_PATH', doc.path, `Cited path does not exist: ${path}`, at(match.index))
      }
    }
    for (const match of doc.body.matchAll(/\b(?:bun|npm|pnpm|yarn) run ([\w:.-]+)/g)) {
      if (!(match[1] in model.scripts)) issue('MISSING_SCRIPT', doc.path, `No package script named ${match[1]}`, at(match.index))
    }
    for (const fence of doc.body.matchAll(/```(?:sh|bash|zsh|shell)\s*\n([\s\S]*?)```/g)) {
      let position = fence.index + fence[0].indexOf('\n') + 1
      for (const line of fence[1].split('\n')) {
        const lineNumber = at(position)
        position += line.length + 1
        const command = line.trim().replace(/^\$\s+/, '').match(/^([\w./-]+)(?:\s|$)/)?.[1]
        if (!command) continue
        if (command.startsWith('./')) {
          try { await access(safePath(model.root, command), constants.X_OK) } catch { issue('MISSING_COMMAND', doc.path, `Local command is missing or not executable: ${command}`, lineNumber) }
        } else if (!await executable(command)) issue('MISSING_COMMAND', doc.path, `Command not found on PATH: ${command}`, lineNumber)
      }
    }
  }
  let expected: Record<string, string | Buffer> = {}
  try { expected = await expectedOutputs(model) } catch (error) { issue('OUTPUT_OWNERSHIP', 'llms.txt', String(error)) }
  for (const [path, value] of Object.entries(expected)) {
    let actual: Buffer | null = null
    try { actual = await readFile(safePath(model.root, path)) } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
    if (actual === null || hash(actual) !== hash(value)) issue('STALE_OUTPUT', path, 'Generated output is missing or stale; run dewey build')
  }
  for (const path of await walk(model.root, OUTPUT)) {
    if (!(path in expected)) issue('STALE_OUTPUT', path, 'Unexpected or obsolete site output; build prunes unchanged owned files only')
  }
  const homepage = await optional(join(model.root, OUTPUT, 'index.html'))
  const navigation = homepage?.match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? ''
  const links = attributes(navigation, 'href').map(href => resolveReference(`${OUTPUT}/index.html`, href)?.path)
  for (const doc of model.docs.filter(doc => human(doc) && !doc.hidden)) if (!links.includes(`${OUTPUT}/${doc.route}`)) issue('NAV_MISSING', doc.path, 'Human page is missing from generated site navigation')
  // Check actual rendered outputs too, not just the expected Markdown model.
  for (const path of Object.keys(expected).filter(path => path.endsWith('.html'))) {
    const html = await optional(join(model.root, path))
    if (!html) continue
    for (const href of [...attributes(html, 'href'), ...attributes(html, 'src')]) {
      try {
        const target = resolveReference(path, href)
        if (!target) continue
        if (!target.path.startsWith(`${OUTPUT}/`)) { issue('SITE_LINK', path, `Link escapes site output: ${href}`); continue }
        const content = await optional(safePath(model.root, target.path))
        if (content === null) issue('SITE_LINK', path, `Broken rendered link: ${href}`)
        else if (target.fragment && !attributes(content, 'id').includes(target.fragment)) issue('SITE_LINK', path, `Broken rendered anchor: ${href}`)
      } catch (error) { issue('SITE_LINK', path, String(error)) }
    }
  }
  return { passed: issues.length === 0, issues: issues.map(item => ({ ...item, fix: item.fix ?? FIXES[item.code] })) }
}
// A pass means references, coverage and outputs line up. It cannot prove the prose is true.
const PASSED = 'Dewey check passed: references, coverage, reviews and outputs are consistent. It does not prove the prose is true.'
export async function freshCheck(options: { json?: boolean } = {}): Promise<void> {
  let result: { passed: boolean; issues: Issue[] }
  try { result = await checkProject() } catch (error) { result = { passed: false, issues: [{ code: 'PROJECT_INVALID', path: STATE, message: error instanceof Error ? error.message : String(error), fix: FIXES.PROJECT_INVALID }] } }
  console.log(options.json ? json(result).trimEnd() : result.passed ? PASSED : result.issues.map(issue => `${issue.path}${issue.line ? `:${issue.line}` : ''} ${issue.code} ${issue.message}\n  fix: ${issue.fix}`).join('\n'))
  if (!result.passed) process.exitCode = 1
}
