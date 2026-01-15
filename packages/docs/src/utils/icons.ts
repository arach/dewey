import type { ComponentType } from 'react'
import * as LucideIcons from 'lucide-react'

// Type for Lucide icon components
type LucideIcon = ComponentType<{ className?: string }>

/**
 * Resolves a Lucide icon name string to its component
 *
 * @example
 * resolveIcon('BookOpen') // returns BookOpen component
 * resolveIcon('Code') // returns Code component
 */
export function resolveIcon(name: string): LucideIcon | null {
  // Type assertion to access lucide icons by string key
  const icons = LucideIcons as unknown as Record<string, LucideIcon>

  // Direct lookup
  if (icons[name]) {
    return icons[name]
  }

  // Try PascalCase conversion (e.g., 'book-open' -> 'BookOpen')
  const pascalCase = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')

  if (icons[pascalCase]) {
    return icons[pascalCase]
  }

  // Not found
  console.warn(`[Dewey] Unknown icon: "${name}". Available icons: https://lucide.dev/icons`)
  return null
}

/**
 * Common icon names for documentation
 */
export const commonIcons = {
  docs: 'BookOpen',
  api: 'Code',
  guide: 'GraduationCap',
  quickstart: 'Zap',
  settings: 'Settings',
  config: 'SlidersHorizontal',
  overview: 'LayoutDashboard',
  install: 'Download',
  examples: 'Lightbulb',
  reference: 'FileText',
  faq: 'HelpCircle',
  changelog: 'History',
  community: 'Users',
  support: 'LifeBuoy',
  security: 'Shield',
  performance: 'Gauge',
  testing: 'TestTube2',
  deployment: 'Rocket',
  troubleshoot: 'Wrench',
} as const

export type CommonIconName = keyof typeof commonIcons
