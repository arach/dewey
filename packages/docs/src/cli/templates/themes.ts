// ---------------------------------------------------------------------------
// Theme + template resolution for create/update commands.
// ---------------------------------------------------------------------------

export {
  VALID_THEME_IDS as VALID_THEMES,
  VALID_TEMPLATE_IDS as VALID_TEMPLATES,
  CREATE_THEME_SPECS,
  CREATE_TEMPLATE_SPECS,
  resolveTheme,
  resolveCreateOptions,
  type ThemeId,
  type TemplateId,
} from '../../templates/registry.js'

import type { ThemeId } from '../../templates/registry.js'

/** @deprecated use ThemeId */
export type ThemeName = ThemeId