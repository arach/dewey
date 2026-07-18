import { mkdir, readdir, readFile, writeFile } from 'fs/promises'
import type { Dirent } from 'fs'
import { basename, dirname, extname, join, relative, resolve } from 'path'
import matter from 'gray-matter'
import { DEWEY_SCHEMA_VERSION, getGeneratedAt } from './version.js'

export interface AgentArtifactsProject {
  name: string
  version?: string
  tagline?: string
  repository?: string
}

export interface CollectMarkdownArtifactsOptions {
  rootDir?: string
  docsDir?: string
}

export interface WriteAgentArtifactsOptions extends CollectMarkdownArtifactsOptions {
  outputDir?: string
  project?: AgentArtifactsProject
}

export interface MarkdownArtifact {
  id: string
  slug: string
  kind: MarkdownArtifactKind
  promptId?: string
  title: string
  description: string
  sourcePath: string
  url: string
  rawUrl: string
  promptUrl?: string
  frontmatter: Record<string, unknown>
  headings: MarkdownHeading[]
  tokensEstimate: number
  rawMarkdown: string
  content: string
}

export type MarkdownArtifactKind = 'doc' | 'agent' | 'prompt' | 'reference' | 'proposal'

export interface MarkdownHeading {
  depth: number
  text: string
  anchor: string
}

export interface AgentManifest {
  schemaVersion: 1
  version: 1
  project: Required<Pick<AgentArtifactsProject, 'name'>> & {
    version: string | null
    tagline: string | null
    repository: string | null
  }
  generatedAt?: string
  artifacts: Record<string, string | Record<string, string>>
  recommendedReadOrder: string[]
  docs: AgentManifestEntry[]
  prompts: PromptManifestEntry[]
}

export interface AgentManifestEntry {
  id: string
  slug: string
  kind: MarkdownArtifactKind
  title: string
  description: string
  sourcePath: string
  url: string
  rawUrl: string
  promptId?: string
  promptUrl?: string
  headings: MarkdownHeading[]
  tokensEstimate: number
  frontmatter: Record<string, unknown>
  markdown?: string
  content?: string
}

export interface PromptManifestEntry {
  id: string
  slug: string
  title: string
  description: string
  sourcePath: string
  promptUrl: string
  rawUrl: string
  headings: MarkdownHeading[]
  tokensEstimate: number
  frontmatter: Record<string, unknown>
  markdown?: string
  content?: string
}

const kindRank: Record<MarkdownArtifactKind, number> = {
  doc: 0,
  agent: 1,
  reference: 2,
  proposal: 3,
  prompt: 4,
}

const defaultReadOrder = ['overview', 'quickstart', 'concepts', 'config', 'api', 'agents']

export async function collectMarkdownArtifacts(options: CollectMarkdownArtifactsOptions = {}): Promise<MarkdownArtifact[]> {
  const resolved = resolveOptions(options)
  const files = await walkMarkdownFiles(resolved.docsDir)
  const docs = await Promise.all(files.map((filePath) => parseDocArtifact(filePath, undefined, resolved)))
  return docs.sort(compareArtifacts)
}

export async function getMarkdownArtifact(
  slug: string,
  options: CollectMarkdownArtifactsOptions = {},
): Promise<MarkdownArtifact | null> {
  const normalized = normalizeSlug(slug)
  const docs = await collectMarkdownArtifacts(options)
  return docs.find((doc) => doc.slug === normalized || doc.sourcePath === normalized) || null
}

export async function getPromptArtifact(
  promptId: string,
  options: CollectMarkdownArtifactsOptions = {},
): Promise<MarkdownArtifact | null> {
  const normalized = normalizeSlug(promptId).replace(/^prompts\//, '')
  const docs = await collectMarkdownArtifacts(options)
  return docs.find((doc) => doc.kind === 'prompt' && (doc.promptId === normalized || doc.slug === `prompts/${normalized}`)) || null
}

export async function parseDocArtifact(
  filePath: string,
  raw?: string,
  options: CollectMarkdownArtifactsOptions = {},
): Promise<MarkdownArtifact> {
  const resolved = resolveOptions(options)
  const absoluteFilePath = resolve(filePath)
  const rawMarkdown = (raw ?? await readFile(absoluteFilePath, 'utf-8')).replace(/\r\n/g, '\n')
  const parsed = matter(rawMarkdown)
  const content = parsed.content.trim()
  const slug = stripMarkdownExtension(normalizePath(relative(resolved.docsDir, absoluteFilePath)))
  const sourcePath = normalizePath(relative(resolved.rootDir, absoluteFilePath))
  const kind = inferKind(slug)
  const promptId = kind === 'prompt' ? slug.replace(/^prompts\//, '') : undefined
  const headings = extractHeadings(content)
  const title = getString(parsed.data.title) || headings.find((heading) => heading.depth === 1)?.text || titleFromSlug(slug)
  const description = getString(parsed.data.description) || extractDescription(content)

  return {
    id: slug,
    slug,
    kind,
    promptId,
    title,
    description,
    sourcePath,
    url: urlForArtifact(slug, kind),
    rawUrl: `/agent/raw/docs/${slug}.md`,
    promptUrl: promptId ? `/agent/prompts/${promptId}.md` : undefined,
    frontmatter: parsed.data,
    headings,
    tokensEstimate: estimateTokens(content),
    rawMarkdown,
    content,
  }
}

export function buildAgentManifest(
  docs: MarkdownArtifact[],
  options: { project?: AgentArtifactsProject; includeContent?: boolean } = {},
): AgentManifest {
  const prompts = docs.filter((doc) => doc.kind === 'prompt')
  const generatedAt = getGeneratedAt()

  return {
    schemaVersion: DEWEY_SCHEMA_VERSION,
    version: 1,
    project: {
      name: options.project?.name || 'project',
      version: options.project?.version || null,
      tagline: options.project?.tagline || null,
      repository: options.project?.repository || null,
    },
    ...(generatedAt ? { generatedAt } : {}),
    artifacts: {
      manifest: '/agent/manifest.json',
      docs: '/agent/docs.json',
      prompts: '/agent/prompts.json',
      context: '/agent/context.md',
      contextJson: '/agent/context.json',
      allMarkdown: '/agent/bundles/all.md',
      promptBundle: '/agent/bundles/prompts.md',
      rawMarkdownBase: '/agent/raw/docs/',
      bundles: {
        core: '/agent/bundles/core.md',
        prompts: '/agent/bundles/prompts.md',
        all: '/agent/bundles/all.md',
      },
    },
    recommendedReadOrder: defaultReadOrder.filter((slug) => docs.some((doc) => doc.slug === slug)),
    docs: docs.map((doc) => toManifestEntry(doc, options.includeContent)),
    prompts: prompts.map((prompt) => toPromptEntry(prompt, options.includeContent)),
  }
}

export function buildPromptRegistry(
  docs: MarkdownArtifact[],
  options: { project?: AgentArtifactsProject; includeContent?: boolean } = {},
) {
  const manifest = buildAgentManifest(docs, options)

  return {
    schemaVersion: DEWEY_SCHEMA_VERSION,
    version: 1,
    project: manifest.project,
    ...(manifest.generatedAt ? { generatedAt: manifest.generatedAt } : {}),
    prompts: manifest.prompts,
  }
}

export function buildContextBundle(
  docs: MarkdownArtifact[],
  slugs: string[],
  title = 'Agent Context Bundle',
): string {
  const bySlug = new Map(docs.map((doc) => [doc.slug, doc]))
  const selected = slugs.map((slug) => bySlug.get(slug)).filter((doc): doc is MarkdownArtifact => Boolean(doc))
  return formatBundle(title, selected)
}

export async function writeAgentArtifacts(options: WriteAgentArtifactsOptions = {}) {
  const resolved = resolveOptions(options)
  const outputDir = options.outputDir ? resolve(options.outputDir) : resolved.rootDir
  const docs = await collectMarkdownArtifacts(resolved)
  const prompts = docs.filter((doc) => doc.kind === 'prompt')
  const manifest = buildAgentManifest(docs, { project: options.project })
  const fullManifest = buildAgentManifest(docs, { project: options.project, includeContent: true })
  const promptRegistry = buildPromptRegistry(docs, { project: options.project, includeContent: true })
  const context = formatAgentContext(docs, fullManifest)
  const written: string[] = []

  const writeArtifact = async (artifactPath: string, value: string) => {
    const filePath = join(outputDir, artifactPath)
    await mkdir(dirname(filePath), { recursive: true })
    await writeFile(filePath, ensureTrailingNewline(value))
    written.push(normalizePath(artifactPath))
  }

  const writeJsonArtifact = async (artifactPath: string, value: unknown) => {
    await writeArtifact(artifactPath, `${JSON.stringify(value, null, 2)}\n`)
  }

  await writeJsonArtifact('agent/manifest.json', manifest)
  await writeJsonArtifact('agent/docs.json', fullManifest)
  await writeJsonArtifact('agent/prompts.json', promptRegistry)
  await writeJsonArtifact('agent/context.json', {
    schemaVersion: DEWEY_SCHEMA_VERSION,
    version: 1,
    project: fullManifest.project,
    ...(fullManifest.generatedAt ? { generatedAt: fullManifest.generatedAt } : {}),
    artifacts: fullManifest.artifacts,
    docs: fullManifest.docs,
    prompts: fullManifest.prompts,
  })

  await writeArtifact('agent/context.md', context)
  await writeArtifact('agent/bundles/all.md', formatBundle('All Documentation', docs))
  await writeArtifact('agent/bundles/core.md', buildContextBundle(docs, fullManifest.recommendedReadOrder, 'Core Documentation'))
  await writeArtifact('agent/bundles/prompts.md', formatPromptsBundle(prompts))

  for (const doc of docs) {
    await writeArtifact(`agent/raw/docs/${doc.slug}.md`, doc.rawMarkdown)
  }

  for (const prompt of prompts) {
    await writeArtifact(`agent/prompts/${prompt.promptId}.md`, prompt.rawMarkdown)
  }

  return {
    docs: docs.length,
    prompts: prompts.length,
    written,
  }
}

function resolveOptions(options: CollectMarkdownArtifactsOptions) {
  const rootDir = options.rootDir ? resolve(options.rootDir) : process.cwd()

  return {
    rootDir,
    docsDir: options.docsDir ? resolve(options.docsDir) : join(rootDir, 'docs'),
  }
}

async function walkMarkdownFiles(directory: string): Promise<string[]> {
  let entries: Dirent[]

  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch {
    return []
  }

  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = join(directory, entry.name)
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.')) return []
      return walkMarkdownFiles(entryPath)
    }
    if (entry.isFile() && ['.md', '.mdx'].includes(extname(entry.name))) {
      return [entryPath]
    }
    return []
  }))

  return nested.flat().sort()
}

function toManifestEntry(doc: MarkdownArtifact, includeContent = false): AgentManifestEntry {
  return {
    id: doc.id,
    slug: doc.slug,
    kind: doc.kind,
    title: doc.title,
    description: doc.description,
    sourcePath: doc.sourcePath,
    url: doc.url,
    rawUrl: doc.rawUrl,
    promptId: doc.promptId,
    promptUrl: doc.promptUrl,
    headings: doc.headings,
    tokensEstimate: doc.tokensEstimate,
    frontmatter: doc.frontmatter,
    markdown: includeContent ? doc.rawMarkdown : undefined,
    content: includeContent ? doc.content : undefined,
  }
}

function toPromptEntry(prompt: MarkdownArtifact, includeContent = false): PromptManifestEntry {
  return {
    id: prompt.promptId || prompt.slug,
    slug: prompt.slug,
    title: prompt.title,
    description: prompt.description,
    sourcePath: prompt.sourcePath,
    promptUrl: prompt.promptUrl || `/agent/prompts/${prompt.slug}.md`,
    rawUrl: prompt.rawUrl,
    headings: prompt.headings,
    tokensEstimate: prompt.tokensEstimate,
    frontmatter: prompt.frontmatter,
    markdown: includeContent ? prompt.rawMarkdown : undefined,
    content: includeContent ? prompt.content : undefined,
  }
}

function formatAgentContext(docs: MarkdownArtifact[], manifest: AgentManifest): string {
  const lines = [
    `# ${manifest.project.name} Agent Context`,
    '',
    manifest.project.tagline || 'Agent-ready documentation context generated by Dewey.',
    '',
    '## Fast Retrieval',
    '',
    '| Need | Artifact |',
    '|------|----------|',
    '| Discovery manifest | `/agent/manifest.json` |',
    '| Full docs with markdown | `/agent/docs.json` |',
    '| Prompt registry | `/agent/prompts.json` |',
    '| Combined context | `/agent/context.md` |',
    '| Raw markdown base | `/agent/raw/docs/` |',
    '| Core bundle | `/agent/bundles/core.md` |',
    '| Prompt bundle | `/agent/bundles/prompts.md` |',
    '',
    '## Recommended Read Order',
    '',
    ...manifest.recommendedReadOrder.map((slug) => `- ${slug}: /agent/raw/docs/${slug}.md`),
    '',
    '## Documentation Index',
    '',
    '| Kind | Title | Source | Raw markdown |',
    '|------|-------|--------|--------------|',
    ...docs.map((doc) => `| ${doc.kind} | ${escapeTable(doc.title)} | \`${doc.sourcePath}\` | ${doc.rawUrl} |`),
    '',
  ]

  lines.push(formatBundle('Documentation', docs.filter((doc) => doc.kind !== 'prompt')))

  const prompts = docs.filter((doc) => doc.kind === 'prompt')
  if (prompts.length > 0) {
    lines.push(formatPromptsBundle(prompts))
  }

  return lines.join('\n')
}

function formatBundle(title: string, docs: MarkdownArtifact[]): string {
  const lines = [
    `# ${title}`,
    '',
    '| Kind | Title | Source | Raw markdown |',
    '|------|-------|--------|--------------|',
    ...docs.map((doc) => `| ${doc.kind} | ${escapeTable(doc.title)} | \`${doc.sourcePath}\` | ${doc.rawUrl} |`),
    '',
  ]

  for (const doc of docs) {
    lines.push('---', '', `<!-- source: ${doc.sourcePath} -->`, '')
    lines.push(normalizeMarkdownTitle(doc), '')
  }

  return lines.join('\n')
}

function formatPromptsBundle(prompts: MarkdownArtifact[]): string {
  const lines = [
    '# Prompt Bundle',
    '',
    '| Prompt | Source | Raw markdown |',
    '|--------|--------|--------------|',
    ...prompts.map((prompt) => `| ${escapeTable(prompt.title)} | \`${prompt.sourcePath}\` | ${prompt.promptUrl || prompt.rawUrl} |`),
    '',
  ]

  for (const prompt of prompts) {
    lines.push('---', '', `<!-- source: ${prompt.sourcePath} -->`, '')
    lines.push(normalizeMarkdownTitle(prompt), '')
  }

  return lines.join('\n')
}

function inferKind(slug: string): MarkdownArtifactKind {
  if (slug.startsWith('prompts/')) return 'prompt'
  if (slug.startsWith('agent/') || slug.endsWith('.agent')) return 'agent'
  if (slug.startsWith('reference/')) return 'reference'
  if (slug.startsWith('proposals/')) return 'proposal'
  return 'doc'
}

function urlForArtifact(slug: string, kind: MarkdownArtifactKind): string {
  if (kind === 'doc' && !slug.includes('/')) return `/docs/${slug}`
  return `/agent/raw/docs/${slug}.md`
}

function extractHeadings(content: string): MarkdownHeading[] {
  const headings: MarkdownHeading[] = []
  const pattern = /^(#{1,6})\s+(.+)$/gm
  let match = pattern.exec(content)

  while (match) {
    const text = cleanInlineMarkdown(match[2])
    headings.push({
      depth: match[1].length,
      text,
      anchor: slugify(text),
    })
    match = pattern.exec(content)
  }

  return headings
}

function extractDescription(content: string): string {
  const blockquote = content.match(/^>\s+(.+)$/m)
  if (blockquote) return cleanInlineMarkdown(blockquote[1])

  const paragraph = content
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .find((part) => part && !part.startsWith('#') && !part.startsWith('```') && !part.startsWith('|'))

  return paragraph ? cleanInlineMarkdown(paragraph).slice(0, 220) : ''
}

function normalizeMarkdownTitle(doc: MarkdownArtifact): string {
  if (/^#\s+/m.test(doc.content)) return doc.content.trim()
  return `# ${doc.title}\n\n${doc.content.trim()}`
}

function compareArtifacts(left: MarkdownArtifact, right: MarkdownArtifact): number {
  const rank = kindRank[left.kind] - kindRank[right.kind]
  if (rank !== 0) return rank

  return left.slug.localeCompare(right.slug)
}

function estimateTokens(content: string): number {
  return Math.ceil(content.split(/\s+/).filter(Boolean).length * 1.33)
}

function titleFromSlug(slug: string): string {
  return basename(slug)
    .replace(/\.agent$/, '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function stripMarkdownExtension(path: string): string {
  return path.replace(/\.(md|mdx)$/, '')
}

function normalizeSlug(slug: string): string {
  return stripMarkdownExtension(slug.replace(/^\/+/, '').replace(/^docs\//, '').replace(/^agent\/raw\/docs\//, ''))
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, '/')
}

function cleanInlineMarkdown(value: string): string {
  return value
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~#]/g, '')
    .trim()
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function escapeTable(value: string): string {
  return value.replace(/\|/g, '\\|')
}

function ensureTrailingNewline(value: string): string {
  return value.endsWith('\n') ? value : `${value}\n`
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}
