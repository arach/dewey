import { access } from 'fs/promises'
import { join } from 'path'
import { DEWEY_VERSION } from './version.js'

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

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
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
    project: projectName,
    name: projectName,
    version: version || '0.0.0',
    tagline,
    generatedBy: `Dewey ${DEWEY_VERSION}`,
    generatedAt: new Date().toISOString(),
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
