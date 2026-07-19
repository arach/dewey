import { isThemeName, resolveTheme, type ThemeName } from '../themes.js'

export function resolveCliTheme(
  input: string | undefined,
  warn: (message: string) => void = console.warn,
): ThemeName {
  if (input && !isThemeName(input)) {
    warn(`Unknown theme "${input}"; using "neutral".`)
  }
  return resolveTheme(input)
}
