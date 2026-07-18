import { createContext, useContext, useEffect, useState, type ReactNode, type ComponentType, type AnchorHTMLAttributes, type ImgHTMLAttributes } from 'react'
import type { ThemePreset } from '../themes'

export type { ThemePreset } from '../themes'

// ============================================
// Types
// ============================================

export interface ThemeConfig {
  preset?: ThemePreset
  colors?: {
    primary?: string
    background?: string
    foreground?: string
    accent?: string
  }
  fonts?: {
    sans?: string
    mono?: string
  }
}

export const CUSTOM_THEME_CSS_PROPERTIES = {
  colors: {
    primary: '--dw-primary',
    background: '--dw-background',
    foreground: '--dw-foreground',
    accent: '--dw-accent',
  },
  fonts: {
    sans: '--dw-font-sans',
    mono: '--dw-font-mono',
  },
} as const

interface ThemeStyleDeclaration {
  getPropertyPriority(property: string): string
  getPropertyValue(property: string): string
  removeProperty(property: string): string
  setProperty(property: string, value: string, priority?: string): void
}

/** Apply a custom theme and return a cleanup that restores prior inline values. */
export function applyCustomThemeProperties(
  style: ThemeStyleDeclaration,
  theme: ThemeConfig,
): () => void {
  const previousProperties = new Map<string, { value: string; priority: string }>()

  const applyProperties = (
    values: Record<string, string | undefined> | undefined,
    properties: Record<string, string>,
  ) => {
    if (!values) return

    for (const [name, value] of Object.entries(values)) {
      const property = properties[name]
      if (!property || !value) continue

      previousProperties.set(property, {
        value: style.getPropertyValue(property),
        priority: style.getPropertyPriority(property),
      })
      style.setProperty(property, value)
    }
  }

  applyProperties(theme.colors, CUSTOM_THEME_CSS_PROPERTIES.colors)
  applyProperties(theme.fonts, CUSTOM_THEME_CSS_PROPERTIES.fonts)

  return () => {
    for (const [property, previous] of previousProperties) {
      if (previous.value) {
        style.setProperty(property, previous.value, previous.priority)
      } else {
        style.removeProperty(property)
      }
    }
  }
}

export interface FrameworkComponents {
  /**
   * Custom Link component (e.g., Next.js Link, React Router Link)
   */
  Link?: ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>
  /**
   * Custom Image component (e.g., Next.js Image)
   */
  Image?: ComponentType<ImgHTMLAttributes<HTMLImageElement>>
}

export interface DeweyContextValue {
  isDark: boolean
  setIsDark: (dark: boolean) => void
  toggleDark: () => void
  theme: ThemePreset | ThemeConfig
  components: FrameworkComponents
}

export interface DeweyProviderProps {
  children: ReactNode
  /**
   * Framework-specific components (Link, Image)
   */
  components?: FrameworkComponents
  /**
   * Theme preset name or custom theme config
   */
  theme?: ThemePreset | ThemeConfig
  /**
   * Initial dark mode state (defaults to system preference)
   */
  defaultDark?: boolean
  /**
   * Storage key for persisting dark mode preference
   */
  storageKey?: string
}

// ============================================
// Context
// ============================================

const DeweyContext = createContext<DeweyContextValue | null>(null)

// ============================================
// Default Link Component
// ============================================

const DefaultLink: ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }> = ({
  href,
  children,
  ...props
}) => (
  <a href={href} {...props}>
    {children}
  </a>
)

// ============================================
// Provider Component
// ============================================

export function DeweyProvider({
  children,
  components = {},
  theme = 'neutral',
  defaultDark,
  storageKey = 'dewey-dark-mode',
}: DeweyProviderProps) {
  // Initialize dark mode from storage, prop, or system preference
  const [isDark, setIsDarkState] = useState<boolean>(() => {
    // Server-side: use default or false
    if (typeof window === 'undefined') {
      return defaultDark ?? false
    }

    // Check localStorage first
    const stored = localStorage.getItem(storageKey)
    if (stored !== null) {
      return stored === 'true'
    }

    // Use prop if provided
    if (defaultDark !== undefined) {
      return defaultDark
    }

    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Persist dark mode changes
  const setIsDark = (dark: boolean) => {
    setIsDarkState(dark)
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, String(dark))
    }
  }

  const toggleDark = () => setIsDark(!isDark)

  // Apply dark class to document
  useEffect(() => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  // Apply custom theme colors if provided
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (typeof theme === 'string') return // Preset themes use CSS files

    return applyCustomThemeProperties(document.documentElement.style, theme)
  }, [theme])

  // Merge default components with user-provided ones
  const resolvedComponents: FrameworkComponents = {
    Link: components.Link ?? DefaultLink,
    Image: components.Image,
  }

  const value: DeweyContextValue = {
    isDark,
    setIsDark,
    toggleDark,
    theme,
    components: resolvedComponents,
  }

  return (
    <DeweyContext.Provider value={value}>
      {children}
    </DeweyContext.Provider>
  )
}

// ============================================
// Hooks
// ============================================

/**
 * Access the Dewey context (theme, dark mode, components)
 */
export function useDewey(): DeweyContextValue {
  const context = useContext(DeweyContext)
  if (!context) {
    throw new Error('useDewey must be used within a DeweyProvider')
  }
  return context
}

/**
 * Access just the dark mode state and toggle
 */
export function useTheme() {
  const { isDark, setIsDark, toggleDark, theme } = useDewey()
  return { isDark, setIsDark, toggleDark, theme }
}

/**
 * Access framework components (Link, Image)
 */
export function useComponents() {
  const { components } = useDewey()
  return components
}

/**
 * Get the Link component from context
 */
export function useLink() {
  const { components } = useDewey()
  return components.Link ?? DefaultLink
}

export default DeweyProvider
