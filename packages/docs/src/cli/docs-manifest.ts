import { access, readFile, readdir } from 'fs/promises'
import type { Dirent } from 'fs'
import { extname, join, relative, resolve } from 'path'
import matter from 'gray-matter'
import { DEWEY_SCHEMA_VERSION, DEWEY_VERSION, getGeneratedAt } from './version.js'

export interface ManifestDocInput {
  id: string
  title: string
  description?: string
  content: string
  order: number
  groupId?: string
  groupTitle?: string
  sourcePath: string
  agentSourcePath?: string
}

export interface DiscoveredDocument extends ManifestDocInput {
  rawContent: string
  frontmatter: Record<string, unknown>
  extension: '.md' | '.mdx'
  absoluteSourcePath: string
  relativeSourcePath: string
  absoluteAgentSourcePath?: string
  relativeAgentSourcePath?: string
}

export interface DiscoverDocumentsOptions {
  rootDir: string
  docsDir: string
  /** Human pages exclude `.agent` variants and the conventional `agent/` tree. */
  audience?: 'human' | 'all'
}

interface ManifestGroup {
  id: string
  title: string
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, '/')
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function humanize(value: string): string {
  return value
    .split(/[-_/]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function titleFromContent(content: string): string | undefined {
  return content.match(/^#\s+(.+)$/m)?.[1]
    ?.replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[\*_~]/g, '')
    .trim()
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
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
    if (entry.isFile() && ['.md', '.mdx'].includes(extname(entry.name))) return [entryPath]
    return []
  }))

  return nested.flat().sort((left, right) => left.localeCompare(right))
}

function stripMarkdownExtension(value: string): string {
  return value.replace(/\.(md|mdx)$/, '')
}

function isAgentVariant(relativePath: string): boolean {
  const slug = stripMarkdownExtension(normalizePath(relativePath))
  return slug.startsWith('agent/') || slug.endsWith('.agent')
}

/**
 * Canonical document discovery and frontmatter parsing used by `generate`,
 * `create`, and the public agent-artifact API.
 */
export async function discoverDocuments(options: DiscoverDocumentsOptions): Promise<DiscoveredDocument[]> {
  const rootDir = resolve(options.rootDir)
  const docsDir = resolve(options.docsDir)
  const files = await walkMarkdownFiles(docsDir)
  const selected = options.audience === 'human'
    ? files.filter(filePath => !isAgentVariant(relative(docsDir, filePath)))
    : files

  const docs = await Promise.all(selected.map(async (absoluteSourcePath) => {
    const rawContent = (await readFile(absoluteSourcePath, 'utf-8')).replace(/\r\n/g, '\n')
    let parsed: ReturnType<typeof matter>

    try {
      parsed = matter(rawContent)
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      const displayPath = normalizePath(relative(rootDir, absoluteSourcePath))
      throw new Error(`Failed to parse frontmatter in ${displayPath}: ${detail}`)
    }

    const relativeSourcePath = normalizePath(relative(docsDir, absoluteSourcePath))
    const projectSourcePath = normalizePath(relative(rootDir, absoluteSourcePath))
    const id = stripMarkdownExtension(relativeSourcePath)
    const extension = extname(relativeSourcePath) as '.md' | '.mdx'
    const agentPath = options.audience === 'human' && extension === '.md'
      ? await resolveAgentDocPath(docsDir, id)
      : undefined
    const body = parsed.content.trim()

    return {
      id,
      title: typeof parsed.data.title === 'string' && parsed.data.title.trim()
        ? parsed.data.title
        : titleFromContent(body) || humanize(id),
      description: typeof parsed.data.description === 'string' ? parsed.data.description : undefined,
      content: body,
      rawContent,
      frontmatter: parsed.data,
      order: typeof parsed.data.order === 'number' ? parsed.data.order : 999,
      groupId: typeof parsed.data.groupId === 'string' ? parsed.data.groupId : undefined,
      groupTitle: typeof parsed.data.group === 'string' ? parsed.data.group : undefined,
      sourcePath: projectSourcePath,
      relativeSourcePath,
      extension,
      absoluteSourcePath,
      agentSourcePath: agentPath ? normalizePath(relative(rootDir, agentPath)) : undefined,
      relativeAgentSourcePath: agentPath ? normalizePath(relative(docsDir, agentPath)) : undefined,
      absoluteAgentSourcePath: agentPath,
    } satisfies DiscoveredDocument
  }))

  return docs.sort((left, right) =>
    left.order - right.order || left.id.localeCompare(right.id),
  )
}

function inferGroup(doc: ManifestDocInput): ManifestGroup {
  if (doc.groupId || doc.groupTitle) {
    const title = doc.groupTitle || humanize(doc.groupId || 'documentation')
    return {
      id: doc.groupId || slugify(title),
      title,
    }
  }

  if (doc.order <= 10) {
    return { id: 'getting-started', title: 'Getting Started' }
  }

  if (doc.order <= 50) {
    return { id: 'features', title: 'Features' }
  }

  return { id: 'reference', title: 'Reference' }
}

export async function resolveAgentDocPath(docsPath: string, docId: string): Promise<string | undefined> {
  const candidates = [
    join(docsPath, `${docId}.agent.md`),
    join(docsPath, 'agent', `${docId}.agent.md`),
  ]

  for (const candidate of candidates) {
    if (await fileExists(candidate)) {
      return normalizePath(candidate)
    }
  }

  return undefined
}

export function buildDocsManifest(
  projectName: string,
  version: string | undefined,
  tagline: string | undefined,
  docs: ManifestDocInput[],
) {
  const generatedAt = getGeneratedAt()
  const pages = docs.map((doc) => {
    const group = inferGroup(doc)

    return {
      id: doc.id,
      title: doc.title,
      description: doc.description,
      slug: `/docs/${doc.id}`,
      order: doc.order,
      group,
      sourcePath: normalizePath(doc.sourcePath),
      agentSourcePath: doc.agentSourcePath ? normalizePath(doc.agentSourcePath) : undefined,
    }
  })

  const groups = pages.reduce<Array<{
    id: string
    title: string
    items: Array<{
      id: string
      title: string
      description?: string
      slug: string
      order: number
      sourcePath: string
      agentSourcePath?: string
    }>
  }>>((acc, page) => {
    let group = acc.find((entry) => entry.id === page.group.id)

    if (!group) {
      group = {
        id: page.group.id,
        title: page.group.title,
        items: [],
      }
      acc.push(group)
    }

    group.items.push({
      id: page.id,
      title: page.title,
      description: page.description,
      slug: page.slug,
      order: page.order,
      sourcePath: page.sourcePath,
      agentSourcePath: page.agentSourcePath,
    })

    group.items.sort((left, right) => left.order - right.order)

    return acc
  }, [])

  return {
    schemaVersion: DEWEY_SCHEMA_VERSION,
    project: projectName,
    name: projectName,
    version: version || '0.0.0',
    tagline,
    generatedBy: `Dewey ${DEWEY_VERSION}`,
    ...(generatedAt ? { generatedAt } : {}),
    defaultPage: docs[0]?.id || null,
    generators: {
      dewey: {
        owner: 'dewey',
        purpose: 'Generate agent-ready docs metadata and handoff artifacts',
        lifecycle: {
          generate: 'dewey generate',
          audit: 'dewey audit',
          score: 'dewey agent',
        },
        outputs: [
          { path: 'AGENTS.md', purpose: 'Combined context for AI agents' },
          { path: 'llms.txt', purpose: 'LLM-readable project summary' },
          { path: 'docs.json', purpose: 'Structured docs manifest for tooling and sites' },
          { path: 'install.md', purpose: 'Install flow for installmd.org-compatible agents' },
        ],
      },
    },
    groups,
    pages,
    sections: docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      content: doc.content,
    })),
  }
}
