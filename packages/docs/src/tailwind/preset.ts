/**
 * Dewey Tailwind Preset
 *
 * Add this preset to your Tailwind config to use Dewey's CSS variables
 * as Tailwind utilities.
 *
 * @example
 * // tailwind.config.js
 * import { deweyPreset } from '@arach/dewey/tailwind'
 *
 * export default {
 *   presets: [deweyPreset({ colors: 'ocean' })],
 *   // ...
 * }
 */

import type { Config } from 'tailwindcss'

export type ColorPreset = 'neutral' | 'ocean' | 'emerald' | 'purple' | 'dusk' | 'rose' | 'github'

export interface DeweyPresetOptions {
  /**
   * Color preset to use
   * @default 'neutral'
   */
  colors?: ColorPreset
  /**
   * Prefix for Dewey classes
   * @default 'dw'
   */
  prefix?: string
}

/**
 * Dewey Tailwind Preset
 *
 * Provides CSS variable-based colors and utilities for Dewey components.
 */
export function deweyPreset(options: DeweyPresetOptions = {}): Partial<Config> {
  const { prefix = 'dw' } = options

  return {
    theme: {
      extend: {
        colors: {
          // Map CSS variables to Tailwind colors
          [`${prefix}-background`]: 'var(--color-dw-background)',
          [`${prefix}-foreground`]: 'var(--color-dw-foreground)',
          [`${prefix}-primary`]: {
            DEFAULT: 'var(--color-dw-primary)',
            foreground: 'var(--color-dw-primary-foreground)',
          },
          [`${prefix}-secondary`]: {
            DEFAULT: 'var(--color-dw-secondary)',
            foreground: 'var(--color-dw-secondary-foreground)',
          },
          [`${prefix}-muted`]: {
            DEFAULT: 'var(--color-dw-muted)',
            foreground: 'var(--color-dw-muted-foreground)',
          },
          [`${prefix}-accent`]: {
            DEFAULT: 'var(--color-dw-accent)',
            foreground: 'var(--color-dw-accent-foreground)',
          },
          [`${prefix}-border`]: 'var(--color-dw-border)',
          [`${prefix}-ring`]: 'var(--color-dw-ring)',
          [`${prefix}-info`]: {
            DEFAULT: 'var(--color-dw-info)',
            foreground: 'var(--color-dw-info-foreground)',
          },
          [`${prefix}-warning`]: {
            DEFAULT: 'var(--color-dw-warning)',
            foreground: 'var(--color-dw-warning-foreground)',
          },
          [`${prefix}-error`]: {
            DEFAULT: 'var(--color-dw-error)',
            foreground: 'var(--color-dw-error-foreground)',
          },
          [`${prefix}-success`]: {
            DEFAULT: 'var(--color-dw-success)',
            foreground: 'var(--color-dw-success-foreground)',
          },
        },
        fontFamily: {
          [`${prefix}-sans`]: 'var(--font-dw-sans, ui-sans-serif, system-ui, sans-serif)',
          [`${prefix}-mono`]: 'var(--font-dw-mono, ui-monospace, SFMono-Regular, monospace)',
        },
        borderRadius: {
          [`${prefix}`]: 'var(--radius-dw, 0.5rem)',
        },
      },
    },
  }
}

/**
 * Dewey Tailwind Plugin
 *
 * Alternative to the preset - use this if you want to add Dewey as a plugin
 * instead of a preset.
 *
 * @example
 * // tailwind.config.js
 * import { deweyPlugin } from '@arach/dewey/tailwind'
 *
 * export default {
 *   plugins: [deweyPlugin({ colors: 'ocean' })],
 *   // ...
 * }
 */
export function deweyPlugin(options: DeweyPresetOptions = {}) {
  return function(api: { addBase: (styles: Record<string, Record<string, string>>) => void }) {
    const { colors = 'neutral' } = options

    // Add a comment indicating which preset is active
    api.addBase({
      ':root': {
        '--dewey-preset': colors,
      },
    })
  }
}

export default deweyPreset
