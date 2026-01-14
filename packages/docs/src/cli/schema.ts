import { z } from 'zod'

/**
 * Project types that Dewey supports
 */
export const ProjectType = z.enum([
  'macos-app',
  'npm-package',
  'cli-tool',
  'react-library',
  'monorepo',
  'generic',
])
export type ProjectType = z.infer<typeof ProjectType>

/**
 * Agent-specific rule for contextual navigation
 */
export const AgentRule = z.object({
  /** Keyword pattern to match */
  pattern: z.string(),
  /** Instruction to show when pattern matches */
  instruction: z.string(),
})
export type AgentRule = z.infer<typeof AgentRule>

/**
 * Project configuration
 */
export const ProjectConfig = z.object({
  /** Project name */
  name: z.string(),
  /** Short tagline */
  tagline: z.string().optional(),
  /** Project type (affects templates) */
  type: ProjectType.default('generic'),
  /** Project version */
  version: z.string().optional(),
})

/**
 * Agent documentation configuration
 */
export const AgentConfig = z.object({
  /** Critical context agents MUST know */
  criticalContext: z.array(z.string()).default([]),
  /** Key entry points in the codebase */
  entryPoints: z.record(z.string(), z.string()).default({}),
  /** Pattern-based navigation rules */
  rules: z.array(AgentRule).default([]),
  /** Which doc sections to include in AGENTS.md */
  sections: z.array(z.string()).default(['overview', 'quickstart']),
})

/**
 * Documentation paths configuration
 */
export const DocsConfig = z.object({
  /** Path to docs directory (relative to project root) */
  path: z.string().default('./docs'),
  /** Output directory for generated files */
  output: z.string().default('./'),
  /** Required doc sections */
  required: z.array(z.string()).default(['overview', 'quickstart']),
})

/**
 * Full Dewey configuration schema
 */
export const DeweyConfig = z.object({
  project: ProjectConfig,
  agent: AgentConfig.default({}),
  docs: DocsConfig.default({}),
})
export type DeweyConfig = z.infer<typeof DeweyConfig>

/**
 * Helper to create a typed config
 */
export function defineConfig(config: z.input<typeof DeweyConfig>): DeweyConfig {
  return DeweyConfig.parse(config)
}
