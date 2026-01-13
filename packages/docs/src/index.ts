// Components
export { default as DocsLayout } from './components/DocsLayout'
export { default as MarkdownContent } from './components/MarkdownContent'
export { default as CodeBlock } from './components/CodeBlock'
export { default as HeadingLink } from './components/HeadingLink'

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
