import type { ProjectType } from './schema.js'

export interface ProjectTypeEvidence {
  requirement: string
  passed: boolean
  document?: string
  excerpt?: string
}

export interface ProjectTypeDocumentationCheck {
  projectType: ProjectType
  label: string
  passed: boolean
  evidence: ProjectTypeEvidence[]
}

export interface ProjectTypeProfile {
  label: string
  focusDocument: string
  requiredDocuments: string[]
  evidence: Array<{
    requirement: string
    patterns: RegExp[]
  }>
}

export const PROJECT_TYPE_PROFILES: Record<ProjectType, ProjectTypeProfile> = {
  generic: {
    label: 'Generic project',
    focusDocument: 'architecture',
    requiredDocuments: ['overview', 'quickstart', 'architecture'],
    evidence: [
      {
        requirement: 'Explains the project architecture or system structure',
        patterns: [/\b(architecture|project structure|system design)\b/i],
      },
      {
        requirement: 'Documents a public interface or integration boundary',
        patterns: [/\b(boundar(?:y|ies)|integrations?)\b/i, /\b(?:interface|type)\s+\w+/i],
      },
    ],
  },
  'npm-package': {
    label: 'npm package',
    focusDocument: 'api',
    requiredDocuments: ['overview', 'quickstart', 'api'],
    evidence: [
      {
        requirement: 'Shows a package-manager installation command',
        patterns: [/\b(?:bun add|npm install|pnpm add|yarn add)\s+[^\s`]+/i],
      },
      {
        requirement: 'Documents a typed public API',
        patterns: [/\b(?:interface|type|class|function)\s+\w+|\w+\([^)]*\)\s*:\s*[\w<{[]/i],
      },
    ],
  },
  'cli-tool': {
    label: 'CLI tool',
    focusDocument: 'commands',
    requiredDocuments: ['overview', 'quickstart', 'commands'],
    evidence: [
      {
        requirement: 'Documents commands, flags, or options',
        patterns: [/\b(commands?|flags?|options?|arguments?)\b/i, /(?:^|\s)--[\w-]+/m],
      },
      {
        requirement: 'Shows executable shell usage',
        patterns: [/```(?:bash|sh|shell)[^\n]*\n[\s\S]*?(?:--help|--version|\s(?:run|build|init|create|generate)\b)/i],
      },
    ],
  },
  'react-library': {
    label: 'React library',
    focusDocument: 'components',
    requiredDocuments: ['overview', 'quickstart', 'components'],
    evidence: [
      {
        requirement: 'Documents components and their props',
        patterns: [/\bcomponents?\b/i, /\bprops?\b/i],
      },
      {
        requirement: 'Shows a JSX or TSX rendering example',
        patterns: [/```(?:tsx|jsx)[^\n]*\n[\s\S]*?<\w+/i],
      },
    ],
  },
  'macos-app': {
    label: 'macOS app',
    focusDocument: 'architecture',
    requiredDocuments: ['overview', 'quickstart', 'architecture'],
    evidence: [
      {
        requirement: 'Documents the macOS platform or app lifecycle',
        patterns: [/\bmacOS\b/i, /\b(app lifecycle|application lifecycle|AppKit|SwiftUI)\b/i],
      },
      {
        requirement: 'Shows Swift, SwiftUI, or Xcode build evidence',
        patterns: [/```swift\b/i, /\b(?:SwiftUI|AppKit|xcodebuild|\.xcodeproj|\.xcworkspace)\b/i],
      },
    ],
  },
  monorepo: {
    label: 'Monorepo',
    focusDocument: 'packages',
    requiredDocuments: ['overview', 'quickstart', 'packages'],
    evidence: [
      {
        requirement: 'Explains workspace or monorepo organization',
        patterns: [/\b(monorepo|workspaces?)\b/i],
      },
      {
        requirement: 'Documents package or application paths',
        patterns: [/(?:`|\b)(?:packages|apps)\//i],
      },
    ],
  },
}

interface EvidenceDocument {
  path: string
  body: string
}

function excerptAroundMatch(content: string, matchIndex: number): string {
  const start = Math.max(0, matchIndex - 45)
  const end = Math.min(content.length, matchIndex + 115)
  return content.slice(start, end).replace(/\s+/g, ' ').trim()
}

export function checkProjectTypeDocumentation(
  projectType: ProjectType,
  documents: EvidenceDocument[],
): ProjectTypeDocumentationCheck {
  const profile = PROJECT_TYPE_PROFILES[projectType]
  const evidence = profile.evidence.map(({ requirement, patterns }) => {
    for (const document of documents) {
      for (const pattern of patterns) {
        pattern.lastIndex = 0
        const match = pattern.exec(document.body)
        if (match) {
          return {
            requirement,
            passed: true,
            document: document.path,
            excerpt: excerptAroundMatch(document.body, match.index),
          }
        }
      }
    }

    return { requirement, passed: false }
  })

  return {
    projectType,
    label: profile.label,
    passed: evidence.every(item => item.passed),
    evidence,
  }
}
