/**
 * AgentContent - Structured format for agent-optimized documentation
 *
 * Instead of raw markdown strings, define agent content as structured data
 * that can be rendered to different formats (markdown, JSON, plain text).
 */

// ============================================
// Types
// ============================================

export interface AgentContent {
  /** Identifier (lowercase, hyphenated) */
  id: string
  /** Display title */
  title: string
  /** One-line purpose statement */
  purpose: string
  /** Content sections */
  sections: AgentSection[]
  /** Optional metadata */
  meta?: {
    package?: string
    version?: string
    repo?: string
  }
}

export type AgentSection =
  | TableSection
  | EnumSection
  | CodeSection
  | TextSection
  | ListSection

export interface TableSection {
  type: 'table'
  heading: string
  columns: string[]
  rows: string[][]
}

export interface EnumSection {
  type: 'enums'
  heading: string
  values: Record<string, string[]>
}

export interface CodeSection {
  type: 'code'
  heading: string
  language: string
  code: string
}

export interface TextSection {
  type: 'text'
  heading: string
  content: string
}

export interface ListSection {
  type: 'list'
  heading: string
  items: string[]
}

// ============================================
// Builder
// ============================================

export class AgentContentBuilder {
  private content: AgentContent

  constructor(id: string, title: string, purpose: string) {
    this.content = {
      id,
      title,
      purpose,
      sections: [],
    }
  }

  meta(meta: AgentContent['meta']): this {
    this.content.meta = meta
    return this
  }

  table(heading: string, columns: string[], rows: string[][]): this {
    this.content.sections.push({ type: 'table', heading, columns, rows })
    return this
  }

  enums(heading: string, values: Record<string, string[]>): this {
    this.content.sections.push({ type: 'enums', heading, values })
    return this
  }

  code(heading: string, language: string, code: string): this {
    this.content.sections.push({ type: 'code', heading, language, code })
    return this
  }

  text(heading: string, content: string): this {
    this.content.sections.push({ type: 'text', heading, content })
    return this
  }

  list(heading: string, items: string[]): this {
    this.content.sections.push({ type: 'list', heading, items })
    return this
  }

  build(): AgentContent {
    return this.content
  }
}

// ============================================
// Renderers
// ============================================

/**
 * Render agent content to markdown (for "Copy for Agent")
 */
export function renderAgentMarkdown(content: AgentContent): string {
  const lines: string[] = []

  // Header
  lines.push(`# ${content.title} - Agent Context`)
  lines.push('')

  // Meta
  if (content.meta?.package) {
    lines.push(`## Package`)
    lines.push(content.meta.package)
    lines.push('')
  }

  // Purpose
  lines.push(`## Purpose`)
  lines.push(content.purpose)
  lines.push('')

  // Sections
  for (const section of content.sections) {
    lines.push(`## ${section.heading}`)

    switch (section.type) {
      case 'table':
        lines.push(`| ${section.columns.join(' | ')} |`)
        lines.push(`|${section.columns.map(() => '---').join('|')}|`)
        for (const row of section.rows) {
          lines.push(`| ${row.join(' | ')} |`)
        }
        break

      case 'enums':
        for (const [name, values] of Object.entries(section.values)) {
          lines.push(`${name}: ${values.map(v => `'${v}'`).join(' | ')}`)
        }
        break

      case 'code':
        lines.push('```' + section.language)
        lines.push(section.code)
        lines.push('```')
        break

      case 'text':
        lines.push(section.content)
        break

      case 'list':
        for (const item of section.items) {
          lines.push(`- ${item}`)
        }
        break
    }

    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Render agent content to JSON (for structured consumption)
 */
export function renderAgentJson(content: AgentContent): string {
  return JSON.stringify(content, null, 2)
}

/**
 * Render agent content to plain text (for llms.txt)
 */
export function renderAgentPlainText(content: AgentContent): string {
  const lines: string[] = []

  lines.push(`# ${content.title}`)
  lines.push('')
  lines.push(content.purpose)
  lines.push('')

  for (const section of content.sections) {
    lines.push(`## ${section.heading}`)

    switch (section.type) {
      case 'table':
        for (const row of section.rows) {
          lines.push(`- ${row[0]}: ${row.slice(1).join(', ')}`)
        }
        break

      case 'enums':
        for (const [name, values] of Object.entries(section.values)) {
          lines.push(`${name}: ${values.join(', ')}`)
        }
        break

      case 'code':
        lines.push(section.code)
        break

      case 'text':
        lines.push(section.content)
        break

      case 'list':
        for (const item of section.items) {
          lines.push(`- ${item}`)
        }
        break
    }

    lines.push('')
  }

  return lines.join('\n')
}

// ============================================
// Factory helper
// ============================================

export function agentContent(id: string, title: string, purpose: string): AgentContentBuilder {
  return new AgentContentBuilder(id, title, purpose)
}
