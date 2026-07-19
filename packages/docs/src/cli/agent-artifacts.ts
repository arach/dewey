import { readFile } from 'fs/promises'
import { basename, join, relative, resolve } from 'path'
import matter from 'gray-matter'
import { discoverDocuments } from './docs-manifest.js'
import { DEWEY_SCHEMA_VERSION, getGeneratedAt } from './version.js'
import {
  applyGenerationPlan,
  planGeneratedArtifacts,
  type GeneratedArtifact,
  type GenerationOperation,
} from './generation-plan.js'

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
  dryRun?: boolean
  overwrite?: boolean
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
  ownership: {
    owner: 'dewey'
    lifecycle: 'regenerate'
    registry: '/.dewey-generated.json'
  }
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
  const discovered = await discoverDocuments({ ...resolved, audience: 'all' })
  const docs = discovered.map((doc) => toMarkdownArtifact({
    absoluteFilePath: doc.absoluteSourcePath,
    rawMarkdown: doc.rawContent,
    content: doc.content,
    frontmatter: doc.frontmatter,
    title: doc.title,
    description: doc.description,
  }, resolved))
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
  return toMarkdownArtifact({
    absoluteFilePath,
    rawMarkdown,
    content: parsed.content.trim(),
    frontmatter: parsed.data,
    title: getString(parsed.data.title),
    description: getString(parsed.data.description),
  }, resolved)
}

function toMarkdownArtifact(
  document: {
    absoluteFilePath: string
    rawMarkdown: string
    content: string
    frontmatter: Record<string, unknown>
    title?: string
    description?: string
  },
  resolved: ReturnType<typeof resolveOptions>,
): MarkdownArtifact {
  const { absoluteFilePath, rawMarkdown, content, frontmatter } = document
  const slug = stripMarkdownExtension(normalizePath(relative(resolved.docsDir, absoluteFilePath)))
  const sourcePath = normalizePath(relative(resolved.rootDir, absoluteFilePath))
  const kind = inferKind(slug)
  const promptId = kind === 'prompt' ? slug.replace(/^prompts\//, '') : undefined
  const headings = extractHeadings(content)
  const title = document.title || headings.find((heading) => heading.depth === 1)?.text || titleFromSlug(slug)
  const description = document.description || extractDescription(content)

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
    frontmatter,
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
  return assembleAgentManifest(docs, options)
}

function assembleAgentManifest(
  docs: MarkdownArtifact[],
  options: { project?: AgentArtifactsProject; includeContent?: boolean },
  contentKinds?: MarkdownArtifactKind[],
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
    ownership: {
      owner: 'dewey',
      lifecycle: 'regenerate',
      registry: '/.dewey-generated.json',
    },
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
    docs: docs.map((doc) => toManifestEntry(
      doc,
      options.includeContent && (!contentKinds || contentKinds.includes(doc.kind)),
    )),
    prompts: prompts.map((prompt) => toPromptEntry(
      prompt,
      options.includeContent && (!contentKinds || contentKinds.includes(prompt.kind)),
    )),
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
    ownership: manifest.ownership,
    prompts: manifest.prompts,
  }
}

export function buildContextBundle(
  docs: MarkdownArtifact[],
  slugs: string[],
  title = 'Agent Context Bundle',
): string {
  const manifest = buildAgentManifest(docs)
  const bySlug = new Map(docs.map((doc) => [doc.slug, doc]))
  const selected = slugs
    .map(slug => manifest.docs.find(doc => doc.slug === slug))
    .filter((doc): doc is AgentManifestEntry => Boolean(doc))
  return formatBundle(title, selected, bySlug)
}

export async function buildAgentArtifactFiles(options: WriteAgentArtifactsOptions = {}) {
  const resolved = resolveOptions(options)
  const docs = await collectMarkdownArtifacts(resolved)
  const prompts = docs.filter((doc) => doc.kind === 'prompt')
  const manifest = buildAgentManifest(docs, { project: options.project })
  // Keep content in its purpose-built JSON registry instead of cloning every
  // document into docs.json, prompts.json, and context.json.
  const fullManifest = assembleAgentManifest(
    docs,
    { project: options.project, includeContent: true },
    ['doc', 'agent', 'reference', 'proposal'],
  )
  const promptRegistry = buildPromptRegistry(docs, { project: options.project, includeContent: true })
  const docsBySlug = new Map(docs.map(doc => [doc.slug, doc]))
  const context = formatAgentContext(manifest)
  const files: GeneratedArtifact[] = []
  const addArtifact = (path: string, content: string, marker = false) => {
    files.push({ path, content: ensureTrailingNewline(content), marker, scope: 'agentArtifacts' })
  }
  const addJsonArtifact = (path: string, value: unknown) => {
    addArtifact(path, JSON.stringify(value, null, 2))
  }

  addJsonArtifact('agent/manifest.json', manifest)
  addJsonArtifact('agent/docs.json', fullManifest)
  addJsonArtifact('agent/prompts.json', promptRegistry)
  addJsonArtifact('agent/context.json', {
    schemaVersion: DEWEY_SCHEMA_VERSION,
    version: 1,
    project: fullManifest.project,
    ...(fullManifest.generatedAt ? { generatedAt: fullManifest.generatedAt } : {}),
    ownership: fullManifest.ownership,
    artifacts: fullManifest.artifacts,
    recommendedReadOrder: manifest.recommendedReadOrder,
    docs: manifest.docs,
    prompts: manifest.prompts,
  })

  addArtifact('agent/context.md', context, true)
  addArtifact('agent/bundles/all.md', formatBundle('All Documentation', manifest.docs, docsBySlug), true)
  addArtifact(
    'agent/bundles/core.md',
    formatBundle(
      'Core Documentation',
      manifest.recommendedReadOrder
        .map(slug => manifest.docs.find(doc => doc.slug === slug))
        .filter((doc): doc is AgentManifestEntry => Boolean(doc)),
      docsBySlug,
    ),
    true,
  )
  addArtifact('agent/bundles/prompts.md', formatPromptsBundle(manifest.prompts, docsBySlug), true)

  for (const doc of docs) {
    addArtifact(`agent/raw/docs/${doc.slug}.md`, doc.rawMarkdown)
  }

  for (const prompt of prompts) {
    addArtifact(`agent/prompts/${prompt.promptId}.md`, prompt.rawMarkdown)
  }

  return {
    docs: docs.length,
    prompts: prompts.length,
    manifest,
    files,
  }
}

export async function writeAgentArtifacts(options: WriteAgentArtifactsOptions = {}) {
  const resolved = resolveOptions(options)
  const outputDir = options.outputDir ? resolve(options.outputDir) : resolved.rootDir
  const built = await buildAgentArtifactFiles(options)
  const plan = await planGeneratedArtifacts(outputDir, built.files, ['agentArtifacts'], {
    overwrite: options.overwrite,
  })

  if (!options.dryRun) await applyGenerationPlan(plan)

  return {
    docs: built.docs,
    prompts: built.prompts,
    written: options.dryRun ? [] : built.files.map(file => file.path),
    changed: changedPaths(plan.operations, 'create', 'update'),
    deleted: changedPaths(plan.operations, 'delete'),
    operations: plan.operations,
  }
}

function changedPaths(
  operations: GenerationOperation[],
  ...actions: GenerationOperation['action'][]
): string[] {
  return operations
    .filter((operation) => actions.includes(operation.action) && operation.scope === 'agentArtifacts')
    .map((operation) => operation.path)
}

function resolveOptions(options: CollectMarkdownArtifactsOptions) {
  const rootDir = options.rootDir ? resolve(options.rootDir) : process.cwd()

  return {
    rootDir,
    docsDir: options.docsDir ? resolve(options.docsDir) : join(rootDir, 'docs'),
  }
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
  const promptId = prompt.promptId || prompt.slug.replace(/^prompts\//, '')
  return {
    id: promptId,
    slug: prompt.slug,
    title: prompt.title,
    description: prompt.description,
    sourcePath: prompt.sourcePath,
    promptUrl: prompt.promptUrl || `/agent/prompts/${promptId}.md`,
    rawUrl: prompt.rawUrl,
    headings: prompt.headings,
    tokensEstimate: prompt.tokensEstimate,
    frontmatter: prompt.frontmatter,
    markdown: includeContent ? prompt.rawMarkdown : undefined,
    content: includeContent ? prompt.content : undefined,
  }
}

function artifactPath(manifest: AgentManifest, key: string): string {
  const value = manifest.artifacts[key]
  return typeof value === 'string' ? value : ''
}

function formatAgentContext(manifest: AgentManifest): string {
  const lines = [
    `# ${manifest.project.name} Agent Context`,
    '',
    manifest.project.tagline || 'Agent-ready documentation context generated by Dewey.',
    '',
    '## Fast Retrieval',
    '',
    '| Need | Artifact |',
    '|------|----------|',
    `| Discovery manifest | \`${artifactPath(manifest, 'manifest')}\` |`,
    `| Docs with markdown | \`${artifactPath(manifest, 'docs')}\` |`,
    `| Prompt registry | \`${artifactPath(manifest, 'prompts')}\` |`,
    `| Retrieval index | \`${artifactPath(manifest, 'context')}\` |`,
    `| Raw markdown base | \`${artifactPath(manifest, 'rawMarkdownBase')}\` |`,
    `| All-docs bundle | \`${artifactPath(manifest, 'allMarkdown')}\` |`,
    `| Prompt bundle | \`${artifactPath(manifest, 'promptBundle')}\` |`,
    '',
    '## Recommended Read Order',
    '',
    ...manifest.recommendedReadOrder.map((slug) => {
      const entry = manifest.docs.find(doc => doc.slug === slug)
      return `- ${slug}: ${entry?.rawUrl || `${artifactPath(manifest, 'rawMarkdownBase')}${slug}.md`}`
    }),
    '',
    '## Documentation Index',
    '',
    '| Kind | Title | Source | Raw markdown |',
    '|------|-------|--------|--------------|',
    ...manifest.docs.map((doc) => `| ${doc.kind} | ${escapeTable(doc.title)} | \`${doc.sourcePath}\` | ${doc.rawUrl} |`),
    '',
  ]

  return lines.join('\n')
}

function formatBundle(
  title: string,
  entries: AgentManifestEntry[],
  docsBySlug: Map<string, MarkdownArtifact>,
): string {
  const lines = [
    `# ${title}`,
    '',
    '| Kind | Title | Source | Raw markdown |',
    '|------|-------|--------|--------------|',
    ...entries.map((doc) => `| ${doc.kind} | ${escapeTable(doc.title)} | \`${doc.sourcePath}\` | ${doc.rawUrl} |`),
    '',
  ]

  for (const entry of entries) {
    const doc = docsBySlug.get(entry.slug)
    if (!doc) continue
    lines.push('---', '', `<!-- source: ${entry.sourcePath} -->`, '')
    lines.push(normalizeMarkdownTitle(doc), '')
  }

  return lines.join('\n')
}

function formatPromptsBundle(
  prompts: PromptManifestEntry[],
  docsBySlug: Map<string, MarkdownArtifact>,
): string {
  const lines = [
    '# Prompt Bundle',
    '',
    '| Prompt | Source | Raw markdown |',
    '|--------|--------|--------------|',
    ...prompts.map((prompt) => `| ${escapeTable(prompt.title)} | \`${prompt.sourcePath}\` | ${prompt.promptUrl || prompt.rawUrl} |`),
    '',
  ]

  for (const prompt of prompts) {
    const doc = docsBySlug.get(prompt.slug)
    if (!doc) continue
    lines.push('---', '', `<!-- source: ${prompt.sourcePath} -->`, '')
    lines.push(normalizeMarkdownTitle(doc), '')
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
