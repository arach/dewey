// ---------------------------------------------------------------------------
// Shared theme definitions
// Used by templates, create, and update commands.
// ---------------------------------------------------------------------------

export const VALID_THEMES = ['neutral', 'ocean', 'emerald', 'purple', 'dusk', 'rose', 'github', 'warm', 'hudson'] as const
export type ThemeName = typeof VALID_THEMES[number]

export function resolveTheme(theme?: string): ThemeName {
  if (!theme) return 'neutral'
  if (VALID_THEMES.includes(theme as ThemeName)) return theme as ThemeName
  return 'neutral'
}
