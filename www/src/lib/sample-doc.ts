// Back-compat re-exports — prefer @/lib/preview-content for new code.
export {
  sampleTitle,
  sampleDescription,
  sampleMarkdown,
  sampleNav,
  sampleAgentLinks,
  sampleDocs,
  previewDataset,
  previewDocsAppConfig,
  type PreviewNavGroup,
  type PreviewNavItem,
} from './preview-content'

export type SampleNavItem = import('./preview-content').PreviewNavItem
export type SampleNavGroup = import('./preview-content').PreviewNavGroup