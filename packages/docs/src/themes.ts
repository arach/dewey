export interface ThemeDefinition {
  /** CSS preset published by the package. */
  cssFile: `${string}.css`
  /** Whether `dewey create --theme` can generate a site with this theme. */
  generatedSite: boolean
}

/** Canonical registry for runtime, generated-site, and published CSS themes. */
export const THEME_REGISTRY = {
  neutral: { cssFile: 'neutral.css', generatedSite: true },
  ocean: { cssFile: 'ocean.css', generatedSite: true },
  emerald: { cssFile: 'emerald.css', generatedSite: true },
  purple: { cssFile: 'purple.css', generatedSite: true },
  dusk: { cssFile: 'dusk.css', generatedSite: true },
  rose: { cssFile: 'rose.css', generatedSite: true },
  github: { cssFile: 'github.css', generatedSite: true },
  warm: { cssFile: 'warm.css', generatedSite: true },
  midnight: { cssFile: 'midnight.css', generatedSite: true },
  editorial: { cssFile: 'editorial.css', generatedSite: true },
  mono: { cssFile: 'mono.css', generatedSite: true },
  hudson: { cssFile: 'hudson.css', generatedSite: true },
} as const satisfies Record<string, ThemeDefinition>

export type ThemePreset = keyof typeof THEME_REGISTRY
export type ThemeName = ThemePreset

function themeNames(): ThemePreset[] {
  return Object.keys(THEME_REGISTRY) as ThemePreset[]
}

export const PUBLISHED_CSS_THEMES: readonly ThemePreset[] = Object.freeze(
  themeNames().filter(theme => THEME_REGISTRY[theme].cssFile),
)

export const VALID_THEMES: readonly ThemeName[] = Object.freeze(
  themeNames().filter(theme => THEME_REGISTRY[theme].generatedSite),
)

const VALID_THEME_SET = new Set<string>(VALID_THEMES)

export function isThemeName(theme: string): theme is ThemeName {
  return VALID_THEME_SET.has(theme)
}

export function resolveTheme(theme?: string): ThemeName {
  return theme && isThemeName(theme) ? theme : 'neutral'
}
