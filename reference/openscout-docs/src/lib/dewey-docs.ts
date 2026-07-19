import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, basename, dirname, resolve } from 'path'
import matter from 'gray-matter'
import docsJson from '../../docs.json'

export type DocMeta = {
  slug: string
  title: string
  description: string
  group: string
  order: number
}

export type DocEntry = DocMeta & {
  content: string
  agentContent?: string
}

export type NavGroup = {
  title: string
  items: { id: string; title: string; description?: string }[]
}

const DOCS_DIR = join(process.cwd(), 'docs')

interface DocsJsonGroup {
  id: string
  title: string
  items: { id: string; title: string; description?: string; order?: number }[]
}

interface DocsJsonData {
  name: string
  groups: DocsJsonGroup[]
}

const docsData = docsJson as DocsJsonData

const CATALOG = new Map<string, { group: string; order: number; title: string; description: string }>()
let orderCounter = 0
for (const group of docsData.groups) {
  for (const item of group.items) {
    CATALOG.set(item.id, {
      group: group.title,
      order: item.order ?? orderCounter,
      title: item.title,
      description: item.description ?? '',
    })
    orderCounter++
  }
}

let docPathIndex: Map<string, string> | undefined

function getDocPathIndex() {
  if (docPathIndex) return docPathIndex
  const index = new Map<string, string>()

  function scan(dir: string) {
    if (!existsSync(dir)) return
    for (const file of readdirSync(dir, { withFileTypes: true })) {
      if (file.isDirectory()) {
        scan(join(dir, file.name))
      } else if (file.name.endsWith('.md') && file.name !== 'README.md') {
        const slug = basename(file.name, '.md')
        if (CATALOG.has(slug)) {
          index.set(resolve(join(dir, file.name)).toLowerCase(), slug)
        }
      }
    }
  }

  scan(DOCS_DIR)
  docPathIndex = index
  return index
}

function normalizeMarkdownTarget(target: string, sourcePath: string): string | null {
  const cleaned = target.trim().replace(/^<|>$/g, '')
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) return null
  if (!/\.md(?:#.*)?$/i.test(cleaned)) return null

  const hashIndex = cleaned.indexOf('#')
  const rawPath = hashIndex === -1 ? cleaned : cleaned.slice(0, hashIndex)
  const hash = hashIndex === -1 ? '' : cleaned.slice(hashIndex)
  const resolvedPath = rawPath.startsWith('/')
    ? resolve(rawPath)
    : resolve(dirname(sourcePath), rawPath)

  const internalSlug = getDocPathIndex().get(resolvedPath.toLowerCase())
  if (internalSlug) return `/docs/${internalSlug}${hash}`

  return null
}

function normalizeMarkdownLinks(content: string, sourcePath: string): string {
  return content.replace(/\[([^\]]+)\]\((<[^>]+>|[^)]+)\)/g, (match, label, target) => {
    const normalized = normalizeMarkdownTarget(target, sourcePath)
    if (!normalized) return match
    return `[${label}](${normalized})`
  })
}

function findDocFile(slug: string): string | null {
  function search(dir: string): string | null {
    if (!existsSync(dir)) return null
    for (const file of readdirSync(dir, { withFileTypes: true })) {
      if (file.isDirectory()) {
        const found = search(join(dir, file.name))
        if (found) return found
      } else if (file.name === `${slug}.md`) {
        return join(dir, file.name)
      }
    }
    return null
  }
  return search(DOCS_DIR)
}

function loadDoc(filePath: string, slug: string): DocEntry | null {
  const def = CATALOG.get(slug)
  if (!def) return null

  const raw = readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const normalizedContent = normalizeMarkdownLinks(content, filePath)

  let agentContent: string | undefined
  const agentPath = filePath.replace(/\.md$/, '.agent.md')
  if (existsSync(agentPath)) {
    const agentRaw = readFileSync(agentPath, 'utf-8')
    const { content: agentBody } = matter(agentRaw)
    agentContent = agentBody.trim() || undefined
  }

  return {
    slug,
    title: (data.title as string) || def.title,
    description: (data.description as string) || def.description,
    group: def.group,
    order: def.order,
    content: normalizedContent,
    agentContent,
  }
}

export function getAllDocs(): DocEntry[] {
  const entries: DocEntry[] = []

  function scan(dir: string) {
    if (!existsSync(dir)) return
    for (const file of readdirSync(dir, { withFileTypes: true })) {
      if (file.isDirectory()) {
        scan(join(dir, file.name))
      } else if (file.name.endsWith('.md') && !file.name.endsWith('.agent.md') && file.name !== 'README.md') {
        const slug = basename(file.name, '.md')
        const doc = loadDoc(join(dir, file.name), slug)
        if (doc) entries.push(doc)
      }
    }
  }

  scan(DOCS_DIR)
  return entries.sort((a, b) => a.order - b.order)
}

export function getDocBySlug(slug: string): DocEntry | undefined {
  const filePath = findDocFile(slug)
  if (!filePath) return undefined
  return loadDoc(filePath, slug) ?? undefined
}

export function getNavigation(): NavGroup[] {
  return docsData.groups.map((group) => ({
    title: group.title,
    items: group.items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
    })),
  }))
}
