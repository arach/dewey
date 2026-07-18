import { describe, expect, test } from 'bun:test'
import {
  applyCustomThemeProperties,
  CUSTOM_THEME_CSS_PROPERTIES,
} from '../src/components/DeweyProvider'

class TestStyleDeclaration {
  readonly properties = new Map<string, { value: string; priority: string }>()

  getPropertyPriority(property: string): string {
    return this.properties.get(property)?.priority ?? ''
  }

  getPropertyValue(property: string): string {
    return this.properties.get(property)?.value ?? ''
  }

  removeProperty(property: string): string {
    const previous = this.getPropertyValue(property)
    this.properties.delete(property)
    return previous
  }

  setProperty(property: string, value: string, priority = ''): void {
    this.properties.set(property, { value, priority })
  }
}

describe('custom theme properties', () => {
  test('maps custom colors and fonts to the variables consumed by components', () => {
    expect(CUSTOM_THEME_CSS_PROPERTIES).toEqual({
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
    })

    const style = new TestStyleDeclaration()
    const cleanup = applyCustomThemeProperties(style, {
      colors: {
        primary: '#f00',
        background: '#fff',
        foreground: '#111',
        accent: '#eee',
      },
      fonts: {
        sans: 'Inter',
        mono: 'Monaco',
      },
    })

    expect(Object.fromEntries(
      [...style.properties].map(([property, entry]) => [property, entry.value]),
    )).toEqual({
      '--dw-primary': '#f00',
      '--dw-background': '#fff',
      '--dw-foreground': '#111',
      '--dw-accent': '#eee',
      '--dw-font-sans': 'Inter',
      '--dw-font-mono': 'Monaco',
    })

    cleanup()
    expect(style.properties.size).toBe(0)
  })

  test('restores pre-existing inline values during cleanup', () => {
    const style = new TestStyleDeclaration()
    style.setProperty('--dw-primary', 'rebeccapurple', 'important')

    const cleanup = applyCustomThemeProperties(style, {
      colors: { primary: 'tomato', accent: 'gold' },
    })

    expect(style.getPropertyValue('--dw-primary')).toBe('tomato')
    expect(style.getPropertyValue('--dw-accent')).toBe('gold')

    cleanup()

    expect(style.getPropertyValue('--dw-primary')).toBe('rebeccapurple')
    expect(style.getPropertyPriority('--dw-primary')).toBe('important')
    expect(style.getPropertyValue('--dw-accent')).toBe('')
  })
})
