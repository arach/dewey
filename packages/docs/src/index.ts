// Layout Components
export { default as DocsLayout } from './components/DocsLayout'
export { default as MarkdownContent } from './components/MarkdownContent'
export { default as CodeBlock } from './components/CodeBlock'
export { default as HeadingLink } from './components/HeadingLink'

// UI Components
export { Callout } from './components/Callout'
export type { CalloutProps, CalloutType } from './components/Callout'

export { Tabs, Tab } from './components/Tabs'
export type { TabsProps, TabProps } from './components/Tabs'

export { Steps, Step } from './components/Steps'
export type { StepsProps, StepProps } from './components/Steps'

export { Card, CardGrid } from './components/Card'
export type { CardProps, CardGridProps } from './components/Card'

export { FileTree } from './components/FileTree'
export type { FileTreeProps, FileTreeItem } from './components/FileTree'

export { ApiTable } from './components/ApiTable'
export type { ApiTableProps, ApiProperty } from './components/ApiTable'

export { Badge } from './components/Badge'
export type { BadgeProps, BadgeVariant } from './components/Badge'

// Hooks
export { useDarkMode } from './hooks/useDarkMode'
export { useTableOfContents, extractSections } from './hooks/useTableOfContents'

// Types
export type {
  NavItem,
  NavGroup,
  DocSection,
  BadgeColor,
  PageLink,
  DocsConfig,
} from './types'
