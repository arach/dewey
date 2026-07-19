import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface DocData {
  slug: string
  title: string
  description?: string
  content: string
  rawMarkdown: string
  agentContent?: string
  order: number
  isPrompt: boolean
}

const docsDirectory = path.join(process.cwd(), 'docs')

const EXCLUDED_SLUGS = new Set(['AGENTS'])

function titleFromSlug(slug: string): string {
  const fileName = slug.split('/').pop() ?? slug
  return fileName
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function isPublishableDoc(relativePath: string): boolean {
  if (!relativePath.endsWith('.md')) return false
  if (relativePath.endsWith('.agent.md')) return false
  if (relativePath.startsWith('agent/')) return false
  if (relativePath === 'AGENTS.md') return false
  return true
}

function resolveAgentContent(slug: string): string | undefined {
  const base = path.basename(slug)
  const candidates = [
    path.join(docsDirectory, `${slug}.agent.md`),
    path.join(docsDirectory, 'agent', `${base}.agent.md`),
  ]

  for (const agentPath of candidates) {
    try {
      const agentFile = fs.readFileSync(agentPath, 'utf-8')
      const { content: agentBody } = matter(agentFile)
      if (agentBody.trim()) return agentBody.trim()
    } catch {
      // try next candidate
    }
  }

  return undefined
}

export function getDocBySlug(slug: string): DocData | null {
  if (EXCLUDED_SLUGS.has(slug)) return null

  try {
    const fullPath = path.join(docsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf-8')
    const { data, content } = matter(fileContents)

    return {
      slug,
      title: (data.title as string) || titleFromSlug(slug),
      description: data.description as string | undefined,
      content: content.trim(),
      rawMarkdown: fileContents,
      agentContent: resolveAgentContent(slug),
      order: (data.order as number) || 999,
      isPrompt: slug.startsWith('prompts/'),
    }
  } catch {
    return null
  }
}

function walkDir(dir: string, base: string = ''): string[] {
  const results: string[] = []
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const rel = base ? `${base}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        results.push(...walkDir(path.join(dir, entry.name), rel))
      } else {
        results.push(rel)
      }
    }
  } catch {
    // directory doesn't exist
  }
  return results
}

export function getAllDocSlugs(): string[] {
  const files = walkDir(docsDirectory)
  return files
    .filter(isPublishableDoc)
    .map((file) => file.replace(/\.md$/, ''))
}