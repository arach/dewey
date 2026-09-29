import type { AgentManifest, MarkdownArtifact, MarkdownArtifactKind } from './agent-artifacts.js'

export interface ArcDiagramLayout {
  width: number
  height: number
}

export interface ArcNodePosition {
  x: number
  y: number
  size: 'xs' | 's' | 'm' | 'l'
}

export interface ArcNodeData {
  icon: string
  name: string
  subtitle?: string
  description?: string
  color: string
}

export interface ArcConnector {
  from: string
  to: string
  fromAnchor: string
  toAnchor: string
  style: string
}

export interface ArcConnectorStyle {
  color: string
  strokeWidth: number
  label?: string
  dashed?: boolean
}

export interface ArcDiagramData {
  layout: ArcDiagramLayout
  nodes: Record<string, ArcNodePosition>
  nodeData: Record<string, ArcNodeData>
  connectors: ArcConnector[]
  connectorStyles: Record<string, ArcConnectorStyle>
}

const KIND_ICONS: Record<MarkdownArtifactKind | 'project', string> = {
  doc: 'FileCode',
  agent: 'Cpu',
  prompt: 'Terminal',
  reference: 'Layers',
  proposal: 'MessageSquare',
  project: 'Package',
}

const KIND_COLORS: Record<MarkdownArtifactKind | 'project', string> = {
  doc: 'blue',
  agent: 'emerald',
  prompt: 'amber',
  reference: 'violet',
  proposal: 'rose',
  project: 'orange',
}

const MAX_NODES = 40
const COLUMNS = 4
const COLUMN_WIDTH = 280
const ROW_HEIGHT = 150
const MARGIN_X = 60
const MARGIN_Y = 70

function nodeIdForSlug(slug: string): string {
  const id = slug.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return id || 'doc'
}

/**
 * Build a valid ArcDiagramData scaffold from the doc manifest.
 *
 * Nodes are one per document, ordered by recommendedReadOrder then the
 * manifest's own ordering, laid out in a snake pattern so consecutive
 * read-order edges stay short. The project's root node leads the chain.
 * Arc's auto_layout can re-space it; the arcDiagramGenerator skill can
 * re-shape it into a true architecture diagram.
 */
export function buildArcDiagramArtifact(
  manifest: AgentManifest,
  docs: MarkdownArtifact[],
): ArcDiagramData {
  const readOrder = new Set(manifest.recommendedReadOrder)
  const ordered = [...docs].sort((a, b) => {
    const ra = readOrder.has(a.slug) ? manifest.recommendedReadOrder.indexOf(a.slug) : Number.MAX_SAFE_INTEGER
    const rb = readOrder.has(b.slug) ? manifest.recommendedReadOrder.indexOf(b.slug) : Number.MAX_SAFE_INTEGER
    return ra === rb ? a.slug.localeCompare(b.slug) : ra - rb
  })

  const entries: Array<{ id: string; name: string; subtitle?: string; description?: string; kind: MarkdownArtifactKind | 'project' }> = [
    {
      id: 'project',
      name: manifest.project.name,
      subtitle: manifest.project.tagline || 'docs root',
      kind: 'project',
    },
    ...ordered.slice(0, MAX_NODES - 1).map((doc) => ({
      id: nodeIdForSlug(doc.slug),
      name: doc.title,
      subtitle: doc.slug,
      description: doc.description ? doc.description.slice(0, 80) : undefined,
      kind: doc.kind,
    })),
  ]

  const nodes: Record<string, ArcNodePosition> = {}
  const nodeData: Record<string, ArcNodeData> = {}
  const connectors: ArcConnector[] = []

  entries.forEach((entry, index) => {
    const row = Math.floor(index / COLUMNS)
    const reversed = row % 2 === 1
    const col = reversed ? COLUMNS - 1 - (index % COLUMNS) : index % COLUMNS

    nodes[entry.id] = {
      x: MARGIN_X + col * COLUMN_WIDTH,
      y: MARGIN_Y + row * ROW_HEIGHT,
      size: entry.kind === 'project' ? 'l' : 'm',
    }
    nodeData[entry.id] = {
      icon: KIND_ICONS[entry.kind],
      name: entry.name,
      subtitle: entry.subtitle,
      description: entry.description,
      color: KIND_COLORS[entry.kind],
    }

    if (index > 0) {
      const previous = entries[index - 1]
      const wraps = index % COLUMNS === 0
      connectors.push({
        from: previous.id,
        to: entry.id,
        fromAnchor: wraps ? 'bottom' : reversed ? 'left' : 'right',
        toAnchor: wraps ? 'top' : reversed ? 'right' : 'left',
        style: 'reads',
      })
    }
  })

  const rows = Math.ceil(entries.length / COLUMNS)

  return {
    layout: {
      width: MARGIN_X * 2 + COLUMNS * COLUMN_WIDTH,
      height: MARGIN_Y * 2 + rows * ROW_HEIGHT,
    },
    nodes,
    nodeData,
    connectors,
    connectorStyles: {
      reads: { color: 'zinc', strokeWidth: 1.5, label: 'reads' },
    },
  }
}
