import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ASTRO_TEMPLATES } from '../src/cli/templates/astro'
import { NEXTJS_TEMPLATES } from '../src/cli/templates/nextjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../src')
const component = (name: string) => readFileSync(resolve(root, `components/${name}.tsx`), 'utf8')

describe('public shell accessibility contracts', () => {
  test('navigation and mobile menus expose names, state, and current location', () => {
    const sidebar = component('Sidebar')
    const app = component('DocsApp')
    const layout = component('DocsLayout')

    expect(sidebar).toContain('aria-label="Documentation navigation"')
    expect(sidebar).toContain("aria-current={isActive ? 'page' : undefined}")
    expect(sidebar).toContain('aria-expanded={isOpen}')
    expect(sidebar).toContain('aria-label="Close sidebar"')
    expect(sidebar).toContain('<li className="dw-sidebar-group">')
    expect(app).toContain("aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}")
    expect(app).toContain('aria-expanded={sidebarOpen}')
    expect(layout).toContain('aria-label="Documentation navigation"')
    expect(layout).toContain('aria-label="Previous and next pages"')
  })

  test('search and table-of-contents surfaces are programmatically named', () => {
    const index = component('DocsIndex')
    const toc = component('TableOfContents')
    expect(index).toContain('aria-label="Search documentation"')
    expect(toc).toContain('aria-label={title}')
    expect(toc).toContain("aria-current={activeId === item.id ? 'location' : undefined}")
  })

  test('copy and prompt controls announce status and modal behavior', () => {
    const copy = component('CopyButtons')
    const prompt = component('PromptSlideout')
    expect(copy).toContain('aria-haspopup="menu"')
    expect(copy).toContain('role="status"')
    expect(prompt).toContain('role="dialog"')
    expect(prompt).toContain('aria-modal="true"')
    expect(prompt).toContain("event.key !== 'Tab'")
    expect(prompt).toContain("event.key === 'Escape'")
    expect(prompt).toContain('returnFocusRef.current?.focus()')
  })

  test('tabs implement the WAI-ARIA keyboard model', () => {
    const tabs = component('Tabs')
    for (const key of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) {
      expect(tabs).toContain(`event.key === '${key}'`)
    }
    expect(tabs).toContain('role="tablist"')
    expect(tabs).toContain('role="tabpanel"')
    expect(tabs).toContain('aria-selected={isActive}')
  })
})

describe('generated shell accessibility contracts', () => {
  test('Next.js search is a labelled, dismissible dialog that restores focus', () => {
    const search = NEXTJS_TEMPLATES['src/components/Search.tsx']({
      projectName: 'fixture',
      theme: 'neutral',
      defaultPage: 'overview',
    })
    expect(search).toContain('aria-haspopup="dialog"')
    expect(search).toContain('aria-expanded={open}')
    expect(search).toContain('role="dialog"')
    expect(search).toContain('aria-modal="true"')
    expect(search).toContain('aria-label="Close search"')
    expect(search).toContain('triggerRef.current?.focus()')
    expect(search).toContain("event.key !== 'Tab'")
    expect(search).toContain('container.innerHTML = \'\'')
    expect(search).toContain('closeRef.current?.focus()')
    expect(search).not.toContain('loadedRef')

    const layout = NEXTJS_TEMPLATES['src/app/docs/layout.tsx']({
      projectName: 'fixture',
      theme: 'neutral',
      defaultPage: 'overview',
    })
    expect(layout).toContain('aria-label="Open documentation navigation"')
    expect(layout).toContain('{navigationOpen && (')
    expect(layout).toContain('className="docs-mobile-navigation"')
    expect(layout).toContain('isOpen')
    expect(layout).toContain('onClose={() => setNavigationOpen(false)}')
  })

  test('Astro shells label search/theme controls and manage modal focus/state', () => {
    const args = {
      projectName: 'fixture',
      theme: 'neutral',
      defaultPage: 'overview',
    } as const
    const shell = ASTRO_TEMPLATES['src/layouts/BaseLayout.astro'](args)
    const hudsonArgs = { ...args, theme: 'hudson' as const }
    const hudsonShell = ASTRO_TEMPLATES['src/layouts/BaseLayout.astro'](hudsonArgs)
    expect(shell).toContain('aria-label="Search documentation"')
    expect(shell).toContain('aria-haspopup="dialog"')
    expect(shell).toContain('aria-expanded="false"')
    expect(shell).toContain('role="dialog"')
    expect(shell).toContain('aria-modal="true"')
    expect(shell).toContain("btn.setAttribute('aria-expanded', 'true')")
    expect(shell).toContain("event.key === 'Escape'")
    expect(shell).toContain("event.key !== 'Tab'")
    expect(hudsonShell).toContain("event.key !== 'Tab'")
    expect(shell).toContain('searchReturnFocus.focus()')

    const docsLayout = ASTRO_TEMPLATES['src/layouts/DocsLayout.astro'](args)
    const hudsonDocsLayout = ASTRO_TEMPLATES['src/layouts/DocsLayout.astro'](hudsonArgs)
    expect(docsLayout).toContain('data-mobile-navigation')
    expect(hudsonDocsLayout).toContain('data-mobile-navigation')
    expect(docsLayout).toContain('Browse documentation')
    expect(hudsonDocsLayout).toContain('Browse documentation')
  })
})
