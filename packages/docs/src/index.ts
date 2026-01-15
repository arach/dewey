// ============================================
// Main Entry Point Components
// ============================================

// DocsApp - The main entry point for a complete docs site
export { DocsApp, default as DocsAppDefault } from './components/DocsApp'
export type { DocsAppProps, DocsAppConfig } from './components/DocsApp'

// DocsIndex - Card-based landing page
export { DocsIndex } from './components/DocsIndex'
export type { DocsIndexProps } from './components/DocsIndex'

// ============================================
// Provider & Context
// ============================================

export {
  DeweyProvider,
  useDewey,
  useTheme,
  useComponents,
  useLink,
} from './components/DeweyProvider'
export type {
  DeweyProviderProps,
  DeweyContextValue,
  ThemePreset,
  ThemeConfig,
  FrameworkComponents,
} from './components/DeweyProvider'

// ============================================
// Layout Components
// ============================================

// Header - Sticky header with brand, back link, theme toggle
export { Header } from './components/Header'
export type { HeaderProps } from './components/Header'

export { default as DocsLayout } from './components/DocsLayout'
export { default as MarkdownContent } from './components/MarkdownContent'
export { default as CodeBlock } from './components/CodeBlock'
export { default as HeadingLink } from './components/HeadingLink'

// Sidebar - Left navigation
export { Sidebar } from './components/Sidebar'
export type { SidebarProps } from './components/Sidebar'

// TableOfContents - Right minimap with scroll-spy
export {
  TableOfContents,
  AutoTableOfContents,
  useActiveSection,
  extractTocItems,
  extractTocFromDom,
} from './components/TableOfContents'
export type { TableOfContentsProps, TocItem } from './components/TableOfContents'

// ============================================
// UI Components
// ============================================

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

// ============================================
// Agent-Friendly Components
// ============================================

export { CopyButtons } from './components/CopyButtons'
export type { CopyButtonsProps } from './components/CopyButtons'

export { AgentContext } from './components/AgentContext'
export type { AgentContextProps } from './components/AgentContext'

export { PromptSlideout } from './components/PromptSlideout'
export type { PromptSlideoutProps, PromptParam } from './components/PromptSlideout'

// ============================================
// PromptSlideout Generation
// ============================================

export { promptSlideoutGenerator } from './skills/prompt-slideout-generator'
export type { PromptSlideoutConfig } from './skills/prompt-slideout-generator'

// ============================================
// Docs Review Agent
// ============================================

export { docsReviewAgent } from './skills/docs-review-agent'
export type { DocsReviewResult } from './skills/docs-review-agent'

// ============================================
// Hooks
// ============================================

export { useDarkMode } from './hooks/useDarkMode'
export { useTableOfContents, extractSections } from './hooks/useTableOfContents'

// ============================================
// Utilities
// ============================================

export { cn } from './utils/cn'
export { resolveIcon, commonIcons } from './utils/icons'
export type { CommonIconName } from './utils/icons'

// ============================================
// Types
// ============================================

// Page Tree types
export type {
  PageTree,
  PageNode,
  PageItem,
  PageFolder,
  PageSeparator,
  FlatPage,
  NavigationConfig,
  NavigationGroup,
  NavigationItem,
} from './types/page-tree'

// Legacy types (backward compatibility)
export type {
  NavItem,
  NavGroup,
  DocSection,
  BadgeColor,
  PageLink,
  DocsConfig,
} from './types'
