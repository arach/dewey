import { access, constants, lstat, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import matter from 'gray-matter'
import { basename, join } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { assertWritable, BUDGET, coverageHash, coverageHashes, lineCount, tokens, FIXES, lineAt, hash, human, json, loadModel, matches, optional, OUTPUT, packageInfo, resolveReference, safePath, sourceArea, sourceFiles, STATE, walk, type Issue, type Model, type Project } from './model.js'
import { attributes, llmsIndex, markdown, siteFiles } from './site.js'
import { extractLlmsSummary } from './summary.js'
import { hasSymbol, readText, SYMBOL_FILE } from './symbols.js'
import { region, regionState, updateRegion, writeOutputs, writeSafe } from './storage.js'

interface InitOptions { purpose?: string; rule?: string[]; rules?: boolean; host?: string[] }
interface Review { sourceHash: string; docHash: string; files?: Record<string, string> }
type Reviews = Record<string, Review>
const AUTHOR_SKILL = `---
name: dewey-author
description: Maintain this project's maps, guides, front door, and generated docs site using Dewey.
---
# Maintain project documentation

Use this skill after adding or changing a source area, command, public API, or task flow.

1. Read AGENTS.md and the affected docs map. Do not load history by default.
2. Run dewey check --json. Treat covered-code changes as a request for review, not proof the prose is false.
3. Before changing code, run dewey which <path> to find the docs that cover it. For a new area, run dewey new map <area> (dewey uncovered lists them). Describe files, data flow, invariants, and traps. Give it a real title. Do not pair every guide with a map.
4. Start new docs with dewey new guide|reference|history <title>. Write task-shaped guides with kind: guide, and API/CLI/config contracts with kind: reference. Use relative Markdown links. Set nav: false only for intentionally unlisted human pages. Keep history at kind: history.
5. Finish scaffold drafts and remove draft: true only after review. Never invent behavior. Cite code as path#symbol, for example src/model.ts#loadModel, so check can confirm the name still exists. Verify cited paths and package scripts without executing untrusted doc commands.
6. After reviewing a covered document against current code, run dewey review docs/<area>.agent.md. This explicitly records content hashes; build never acknowledges review for you.
7. Run dewey build, then dewey check. Repair broken links, missing navigation, and stale outputs. Site and llms.txt come from the same Markdown.
8. Keep AGENTS.md plus any host files at 150 lines and about 2,000 tokens or fewer, together. Put hard rules outside its observed generated region. Dewey may only update marked regions; do not overwrite authored text.
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
// A draft map for one source area, or a single file. Lists the files it covers.
function mapScaffold(area: string, sources: string[]): string {
  // Prefer the files Dewey assigns to this area, so sibling areas keep their own maps.
  const own = sources.filter(path => sourceArea(path) === area)
  const files = own.length ? own : sources.filter(path => path === area || path.startsWith(`${area}/`))
  const glob = area === '.' ? '*' : files.includes(area) ? area : files.some(path => path.slice(area.length + 1).includes('/')) ? `${area}/**` : `${area}/*`
  return `---\nkind: map\ntitle: ${yaml(`${area} map`)}\ncovers: [${yaml(glob)}]\ndraft: true\n---\n\n# ${area} map\n\n## Files\n\n${files.map(path => `- \`${path}\``).join('\n')}\n\n## Data flow\n\n<!-- Describe the actual flow. -->\n\n## Invariants and traps\n\n<!-- Record constraints and failure cases; then remove draft: true. -->\n`
}
// The observed region as the current model sees it: scripts, areas and the map for each.
function observedFor(model: Model): string {
  const areas = [...new Set(model.sources.map(sourceArea))].sort()
  const mapPaths = Object.fromEntries(areas.flatMap(area => {
    const map = model.docs.find(doc => doc.kind === 'map' && model.sources.filter(path => sourceArea(path) === area).every(path => doc.covers.some(pattern => matches(path, pattern))))
    return map ? [[area, map.path]] : []
  }))
  return observed(model.scripts, areas, mapPaths)
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
    const current = await optional(join(root, 'AGENTS.md'))
    const next = updateRegion(current, 'observed', observedFor(model))
    if (lineCount(next) > BUDGET.lines) throw new Error('AGENTS.md would exceed 150 lines; shorten its authored text first')
    await writeSafe(root, 'AGENTS.md', next)
    await freshBuild(root)
    return
  }
  // An adopted repo usually says what it is for in its README.
  const readme = await optional(join(root, 'README.md'))
  const described = readme ? extractLlmsSummary({ title: '', content: matter(readme).content }).trim() : ''
  const purpose = options.purpose?.trim() || pkg.description?.trim() || described || await answer('What is this project for?')
  if (!purpose) throw new Error('A project purpose is required')
  const rules = options.rule ?? (options.rules === false ? [] : (await answer('Which hard rules must agents follow? (empty means none)')).split('\n').filter(Boolean))
  const hosts = options.host ?? []
  for (const host of hosts) if (!/^[\w.-]+\.md$/.test(host) || host === 'AGENTS.md') throw new Error(`Invalid host file: ${host}; use a root Markdown file name`)
  const project: Project = { schemaVersion: 1, name: pkg.name || basename(root), purpose, rules, ...(hosts.length ? { hosts } : {}) }

  // Adopt what is already there. Authored files are kept; only marked regions and missing kinds are added.
  for (const path of ['.dewey/outputs.json', OUTPUT]) {
    await assertWritable(root, path)
    if (await lstat(safePath(root, path)).catch(() => null)) throw new Error(`Refusing existing init target: ${path}. Remove it and run dewey init again.`)
  }
  const llms = await optional(join(root, 'llms.txt'))
  if (llms !== null && regionState(llms, 'index') === 'broken') throw new Error('llms.txt has an incomplete or repeated index region. Leave one <!-- dewey:begin index --> … <!-- dewey:end index --> pair, or none, then run dewey init again.')
  const front = await optional(join(root, 'AGENTS.md'))
  if (front !== null && regionState(front, 'observed') === 'broken') throw new Error('AGENTS.md has an incomplete or repeated observed region. Leave one <!-- dewey:begin observed --> … <!-- dewey:end observed --> pair, or none, then run dewey init again.')
  const adopted: Record<string, string> = {}
  const maps: string[][] = []
  for (const path of (await walk(root, 'docs')).filter(path => path.endsWith('.md'))) {
    const raw = await readFile(safePath(root, path), 'utf8')
    let data: Record<string, unknown>
    try { data = matter(raw).data } catch { throw new Error(`${path}: the frontmatter is not valid YAML. Fix it and run dewey init again.`) }
    if (data.kind === 'map' && Array.isArray(data.covers)) maps.push(data.covers.filter((pattern): pattern is string => typeof pattern === 'string'))
    if (data.kind !== undefined) continue
    adopted[path] = guessKind(path)
  }
  const covered = (area: string) => maps.some(covers => sources.filter(path => sourceArea(path) === area).every(path => covers.some(pattern => matches(path, pattern))))
  const fresh = (scripts: Record<string, string>) => `# ${project.name}\n\n${purpose}\n\n## Hard rules\n\n${rules.length ? rules.map(rule => `- ${rule}`).join('\n') : 'No project-specific hard rules declared.'}\n\n${region('observed', observed(scripts, areas))}\n`
  const scaffolds: Record<string, string> = {
    [STATE]: json(project),
    'AGENTS.md': front === null ? fresh(pkg.scripts) : regionState(front, 'observed') === 'one' ? front : `${front.trimEnd()}\n\n${region('observed', observed(pkg.scripts, areas))}\n`,
    ...Object.fromEntries(hosts.map(host => [host, HOST_POINTER])),
    'docs/quickstart.md': `---\nkind: guide\ntitle: Get started\ncovers: []\ndraft: true\n---\n\n# Get started\n\n<!-- Author the task, prerequisites, and a verified success condition. Remove draft: true when reviewed. -->\n\n${Object.keys(pkg.scripts).map(script => `- Run \`bun run ${script}\`.`).join('\n')}\n`,
    'SKILL.md': `---\nname: ${yaml(project.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}\ndescription: ${yaml(`Use ${project.name} from another project. ${purpose}`)}\n---\n\n# Use ${project.name}\n\nRead [Get started](docs/quickstart.md) for verified setup and task instructions.\n\n- Use [llms.txt](llms.txt) to find the public guides and reference.\n- Follow the project's constraints:\n${rules.map(rule => `  - ${rule}`).join('\n') || '  - No additional constraints declared.'}\n- Verify prerequisites and the documented success condition before reporting completion.\n- Do not treat internal maps or historical plans as the public interface.\n`,
    '.agents/skills/dewey-author/SKILL.md': AUTHOR_SKILL,
  }
  for (const area of areas) if (!covered(area)) scaffolds[`docs/${mapName(area)}.agent.md`] = mapScaffold(area, sources)
  if (front === null && lineCount(scaffolds['AGENTS.md']) > BUDGET.lines) throw new Error('Observed project exceeds the front-door budget; narrow the project scope before init')
  const writes: Record<string, string> = {}
  const kept: string[] = []
  for (const [path, content] of Object.entries(scaffolds)) {
    await assertWritable(root, path)
    const existing = path === 'AGENTS.md' ? null : await optional(safePath(root, path))
    if (existing === null) writes[path] = content
    else kept.push(path)
  }
  if (llms !== null && regionState(llms, 'index') === 'none') writes['llms.txt'] = `${llms.trimEnd()}\n\n${region('index', '')}\n`
  for (const [path, kind] of Object.entries(adopted)) {
    const raw = await readFile(safePath(root, path), 'utf8')
    writes[path] = /^---\r?\n/.test(raw) ? raw.replace(/^---\r?\n/, `---\nkind: ${kind}\n`) : `---\nkind: ${kind}\n---\n\n${raw}`
  }

  // All or nothing: if any write or the first build fails, put every file back.
  const before: Record<string, string | null> = {}
  for (const path of new Set([...Object.keys(writes), 'llms.txt'])) before[path] = await optional(safePath(root, path))
  const absent: string[] = []
  for (const dir of ['.dewey', '.agents', 'docs']) if (!await lstat(safePath(root, dir)).catch(() => null)) absent.push(dir)
  try {
    for (const [path, content] of Object.entries(writes)) await writeSafe(root, path, content)
    await freshBuild(root)
  } catch (error) {
    for (const [path, content] of Object.entries(before)) {
      if (content === null) await rm(safePath(root, path), { force: true })
      else await writeFile(safePath(root, path), content)
    }
    for (const dir of absent) await rm(safePath(root, dir), { recursive: true, force: true })
    throw new Error(`dewey init made no changes: ${(error as Error).message}`)
  }
  const notes = [
    ...(Object.keys(adopted).length ? [`  Added a kind to ${Object.keys(adopted).length} docs (${(['guide', 'reference', 'history'] as const).map(kind => [kind, Object.values(adopted).filter(value => value === kind).length] as const).filter(([, count]) => count).map(([kind, count]) => `${count} ${kind}`).join(', ')}), guessed from the path. Check them with git diff.`] : []),
    ...kept.map(path => `  ${path}: kept as is`),
    ...(front !== null ? ['  AGENTS.md: kept your text; Dewey updates only the observed region'] : []),
    ...(llms !== null ? ['  llms.txt: kept your text; Dewey updates only the index region'] : []),
  ]
  console.log(`Initialized front door, draft maps/guide, SKILL.md, and .dewey/site/index.html. Author the drafts, review maps, then build and check.${notes.length ? `\nAdopted existing files:\n${notes.join('\n')}` : ''}`)
}
// A kind for a doc that has none, from where it lives. Plans and decisions are history.
function guessKind(path: string): 'guide' | 'reference' | 'history' {
  const lower = path.toLowerCase()
  if (/(^|\/)(history|archive|plans?|proposals?|decisions?|adrs?|rfcs?|specs?|reports?|briefs?)\//.test(lower)) return 'history'
  if (/(^|\/)(reference|api)\//.test(lower) || /(^|[-_/])(reference|api|cli|config|schema)[-_.]/.test(lower)) return 'reference'
  return 'guide'
}
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
// Skeletons for each kind. The comments say what belongs in each section; nothing is invented.
const SKELETONS: Record<'guide' | 'reference' | 'history', (title: string) => string> = {
  guide: title => `---\nkind: guide\ntitle: ${yaml(title)}\ncovers: []\ndraft: true\n---\n\n# ${title}\n\n<!-- One sentence: what the reader will have done at the end. -->\n\n## Before you start\n\n<!-- Prerequisites, with the working directory. -->\n\n## Steps\n\n1. <!-- One action per step, with the exact command. -->\n\n## Check it worked\n\n<!-- The command to run, the expected result, and what that check does not prove. -->\n`,
  reference: title => `---\nkind: reference\ntitle: ${yaml(title)}\ncovers: []\ndraft: true\n---\n\n# ${title}\n\n<!-- One sentence: what this reference covers. Add the source files it describes to covers. -->\n\n## Options\n\n| Name | Type | Default | Meaning |\n|---|---|---|---|\n\n## Errors\n\n<!-- Each error, what causes it, and the fix. -->\n`,
  history: title => `---\nkind: history\ntitle: ${yaml(title)}\n---\n\n# ${title}\n\n<!-- Date, decision, why, and what it replaced. History is kept out of the site and agent indexes. -->\n`,
}
export async function newDocument(kind: string, name: string, directory = process.cwd()): Promise<string> {
  const model = await loadModel(await realpath(directory))
  let path: string
  let content: string
  if (kind === 'map') {
    const area = name.replace(/^\.\//, '').replace(/\/+$/, '') || '.'
    if (!model.sources.some(path => sourceArea(path) === area || path === area || path.startsWith(`${area}/`))) throw new Error(`No source files under ${area}. Run dewey uncovered to list areas that need a map.`)
    path = `docs/${mapName(area)}.agent.md`
    content = mapScaffold(area, model.sources)
  } else if (kind === 'guide' || kind === 'reference' || kind === 'history') {
    const base = slug(name)
    if (!base) throw new Error('Give the document a name, for example: dewey new guide "Deploy to staging"')
    path = kind === 'guide' ? `docs/${base}.md` : kind === 'reference' ? `docs/reference/${base}.md` : `docs/history/${new Date().toISOString().slice(0, 10)}-${base}.md`
    content = SKELETONS[kind](name)
  } else throw new Error(`Unknown kind: ${kind}. Use map, guide, reference or history.`)
  await assertWritable(model.root, path)
  if (await lstat(safePath(model.root, path)).catch(() => null)) throw new Error(`${path} already exists`)
  await writeSafe(model.root, path, content)
  return path
}
export async function freshNew(kind: string, name: string): Promise<void> {
  const path = await newDocument(kind, name)
  console.log(`Created ${path}. Fill it in${kind === 'history' ? '' : ', remove draft: true'}, then run dewey build and dewey check.`)
}
async function expectedOutputs(model: Model): Promise<Record<string, string | Buffer>> {
  const site = siteFiles(model)
  const outputs: Record<string, string | Buffer> = Object.fromEntries(Object.entries(site).map(([path, content]) => [`${OUTPUT}/${path}`, content]))
  outputs['llms.txt'] = updateRegion(await optional(join(model.root, 'llms.txt')), 'index', llmsIndex(model, 'repo'))
  // AGENTS.md is authored; build refreshes only its observed region, and only when it has one.
  const front = await optional(join(model.root, 'AGENTS.md'))
  if (front !== null && regionState(front, 'observed') === 'one') outputs['AGENTS.md'] = updateRegion(front, 'observed', observedFor(model))
  // Materialize referenced project assets, not raw maps/history or arbitrary files.
  for (const doc of model.docs.filter(human)) {
    const rendered = markdown(doc.body)
    for (const href of [...attributes(rendered, 'href'), ...attributes(rendered, 'src')]) {
      const target = resolveReference(doc.path, href)
      if (!target || model.docs.some(candidate => candidate.path === target.path)) continue
      if (!/\.(png|jpe?g|gif|svg|webp|avif|ico|pdf|txt)$/i.test(target.path)) continue
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
// Name what moved, so a review is a reading list rather than a rubber stamp.
function reviewMessage(review: Review | undefined, now: Record<string, string>, docSame: boolean): string {
  if (!review) return 'This doc has never been reviewed against its covered code'
  if (!review.files) return 'Covered code or this doc changed since the last review'
  const changed = Object.keys(now).filter(path => path in review.files! && review.files![path] !== now[path])
  const added = Object.keys(now).filter(path => !(path in review.files!))
  const removed = Object.keys(review.files).filter(path => !(path in now))
  const parts = [[changed, 'changed'], [added, 'added'], [removed, 'removed']].filter(([paths]) => paths.length).map(([paths, verb]) => `${verb}: ${(paths as string[]).join(', ')}`)
  return [...parts.length ? [`Covered files moved since the last review (${parts.join('; ')})`] : [], ...docSame ? [] : ['This doc changed since the last review']].join('. ')
}
export async function reviewDocument(path: string, directory = process.cwd()): Promise<void> {
  const model = await loadModel(await realpath(directory))
  const doc = model.docs.find(doc => doc.path === path)
  if (!doc || !doc.covers.length) throw new Error(`Choose a document with covers frontmatter: ${path}`)
  if (doc.draft) throw new Error(`Finish the draft before reviewing ${path}`)
  if (model.issues.length) throw new Error('Repair document metadata before recording review')
  const reviews: Reviews = JSON.parse(await optional(join(model.root, '.dewey/reviews.json')) ?? '{}')
  reviews[path] = { sourceHash: await coverageHash(model, doc), docHash: hash(doc.raw), files: await coverageHashes(model, doc) }
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
// Commands a doc may run without saying more. The machine's PATH is not consulted: it passes on a laptop and fails in CI.
const ALLOWED = new Set(['bun', 'bunx', 'node', 'npm', 'npx', 'pnpm', 'yarn', 'deno', 'git', 'dewey', 'cd', 'echo', 'export', 'printf', 'true', 'false', 'test', 'set', 'pwd', 'ls', 'cat', 'mkdir', 'cp', 'mv', 'rm', 'touch', 'curl', 'tar', 'chmod', 'source', 'swift', 'xcodebuild', 'cargo', 'go', 'python3', 'pip', 'make', 'docker'])
function known(model: Model, command: string): boolean { return ALLOWED.has(command) || model.bins.includes(command) || (model.project.commands ?? []).includes(command) }
export async function checkProject(directory = process.cwd()): Promise<{ passed: boolean; issues: Issue[] }> {
  const model = await loadModel(await realpath(directory))
  const issues = [...model.issues]
  const issue = (code: string, path: string, message: string, line?: number, fix?: string) => issues.push({ code, path, ...(line ? { line } : {}), message, ...(fix ? { fix } : {}) })
  const front = await optional(join(model.root, 'AGENTS.md'))
  if (front === null) issue('FRONT_DOOR_MISSING', 'AGENTS.md', 'Front door is missing')
  const loaded: Array<[string, string]> = front === null ? [] : [['AGENTS.md', front]]
  for (const host of model.project.hosts ?? []) {
    const text = await optional(join(model.root, host))
    if (text !== null) loaded.push([host, text])
    if (!text?.includes('AGENTS.md')) issue('FRONT_DOOR_POINTER', host, `Point ${host} to AGENTS.md`)
  }
  const size = { lines: loaded.reduce((sum, [, text]) => sum + lineCount(text), 0), tokens: loaded.reduce((sum, [, text]) => sum + tokens(text), 0) }
  if (size.lines > BUDGET.lines || size.tokens > BUDGET.tokens) issue('FRONT_DOOR_BUDGET', 'AGENTS.md', `Front door is ${size.lines} lines and about ${size.tokens} tokens (${loaded.map(([path, text]) => `${path}: ${lineCount(text)} lines`).join(', ')}); the limit is ${BUDGET.lines} lines and ${BUDGET.tokens} tokens`, front && lineCount(front) > BUDGET.lines ? BUDGET.lines + 1 : undefined)
  if (await optional(join(model.root, 'SKILL.md')) === null) issue('SKILL_MISSING', 'SKILL.md', 'External consumer skill is missing')
  const omitted = await unpublished(model)
  if (omitted.length) issue('PUBLISH_MISSING', 'package.json', `The published package would leave out: ${omitted.join(', ')}`)
  const reviews: Reviews = JSON.parse(await optional(join(model.root, '.dewey/reviews.json')) ?? '{}')
  const maps = model.docs.filter(doc => doc.kind === 'map')
  const uncovered = model.sources.filter(path => !maps.some(doc => doc.covers.some(pattern => matches(path, pattern))))
  for (const [index, map] of maps.entries()) for (const other of maps.slice(index + 1)) {
    const shared = model.sources.filter(path => [map, other].every(doc => doc.covers.some(pattern => matches(path, pattern))))
    if (shared.length) issue('COVERAGE_OVERLAP', other.path, `${map.path} also covers ${shared.length} of these files: ${shared.slice(0, 5).join(', ')}${shared.length > 5 ? ', …' : ''}`, lineAt(other.raw, other.raw.search(/^covers:/m)))
  }
  if (front !== null && regionState(front, 'observed') === 'broken') issue('REGION_INVALID', 'AGENTS.md', 'The observed region markers are duplicated or out of order', lineAt(front, front.indexOf('<!-- dewey:')))
  for (const area of new Set(uncovered.map(sourceArea))) issue('MAP_MISSING', area, `${area} has no map for: ${uncovered.filter(path => sourceArea(path) === area).join(', ')}`)
  for (const doc of model.docs) {
    if (doc.draft) issue('DOC_DRAFT', doc.path, 'This doc is still a scaffold', lineAt(doc.raw, doc.raw.search(/^draft:/m)))
    const review = reviews[doc.path]
    if (doc.covers.length && (review?.sourceHash !== await coverageHash(model, doc) || review?.docHash !== hash(doc.raw))) issue('REVIEW_REQUIRED', doc.path, reviewMessage(review, await coverageHashes(model, doc), review?.docHash === hash(doc.raw)), undefined, `Re-read the covered code, correct the doc, then run dewey review ${doc.path}.`)
    for (const pattern of doc.kind === 'map' ? doc.covers : []) if (pattern.startsWith('**')) issue('COVERAGE_BROAD', doc.path, `Coverage pattern covers the whole repo: ${pattern}`, lineAt(doc.raw, doc.raw.indexOf(pattern)))
    for (const target of [...doc.supersedes, ...doc.supersededBy]) if (!model.docs.some(other => other.path === target)) issue('SUPERSEDES_MISSING', doc.path, `No doc at ${target}`, lineAt(doc.raw, doc.raw.indexOf(target)))
    for (const pattern of doc.covers) if (!model.sources.some(path => matches(path, pattern))) issue('COVERAGE_EMPTY', doc.path, `Coverage pattern matches no source files: ${pattern}`, lineAt(doc.raw, doc.raw.indexOf(pattern)))
  }
  const read = async (path: string) => { try { return await readText(safePath(model.root, path)) } catch { return null } }
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
        } else if (target.fragment && SYMBOL_FILE.test(target.path) && !await hasSymbol(read, target.path, target.fragment)) issue('MISSING_SYMBOL', doc.path, `${target.path} does not declare ${target.fragment}`, line)
      } catch (error) { issue('BROKEN_LINK', doc.path, `${href}: ${String(error)}`, line) }
    }
    for (const match of doc.body.matchAll(/`([^`\n]+)`/g)) {
      const symbol = match[1].match(/^([\w./-]+)#([\w$]+(?:\.[\w$]+)?)$/)
      if (symbol && SYMBOL_FILE.test(symbol[1])) {
        if (!(await lstat(safePath(model.root, symbol[1])).catch(() => null))) issue('MISSING_PATH', doc.path, `Cited path does not exist: ${symbol[1]}`, at(match.index))
        else if (!await hasSymbol(read, symbol[1], symbol[2])) issue('MISSING_SYMBOL', doc.path, `${symbol[1]} does not declare ${symbol[2]}`, at(match.index))
        continue
      }
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
        const command = line.trim().replace(/^\$\s+/, '').replace(/^(?:\w+=\S*\s+)+/, '').match(/^([\w./-]+)(?:\s|$)/)?.[1]
        if (!command) continue
        if (command.startsWith('./')) {
          try { await access(safePath(model.root, command), constants.X_OK) } catch { issue('MISSING_COMMAND', doc.path, `Local command is missing or not executable: ${command}`, lineNumber) }
        } else if (!known(model, command)) issue('UNKNOWN_COMMAND', doc.path, `Not a package bin, script runner or allowed command: ${command}`, lineNumber)
      }
    }
  }
  let expected: Record<string, string | Buffer> = {}
  try { expected = await expectedOutputs(model) } catch (error) { issue('OUTPUT_OWNERSHIP', 'llms.txt', String(error)) }
  for (const [path, value] of Object.entries(expected)) {
    let actual: Buffer | null = null
    try { actual = await readFile(safePath(model.root, path)) } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
    if (actual === null || hash(actual) !== hash(value)) {
      if (path === 'AGENTS.md') issue('REGION_STALE', path, 'The observed region does not match the project; run dewey build', lineAt(String(actual), String(actual).indexOf('<!-- dewey:begin observed')))
      else issue('STALE_OUTPUT', path, 'Generated output is missing or stale; run dewey build')
    }
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
