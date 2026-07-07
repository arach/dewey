import 'server-only'

import { createHighlighter, type Highlighter } from 'shiki'
import type { Element } from 'hast'

const LANGS = [
  'bash',
  'typescript',
  'javascript',
  'json',
  'yaml',
  'plaintext',
  'markdown',
  'tsx',
  'python',
  'rust',
  'go',
  'css',
  'html',
] as const

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-light', 'github-dark-dimmed'],
      langs: [...LANGS],
    })
  }
  return highlighterPromise
}

function normalizeLanguage(language: string): string {
  if (language === 'text' || language === 'txt') return 'plaintext'
  if (language === 'sh' || language === 'shell') return 'bash'
  if (language === 'ts') return 'typescript'
  if (language === 'js') return 'javascript'
  if (language === 'yml') return 'yaml'
  if (language === 'py') return 'python'
  return language
}

const THEMES = {
  light: 'github-light',
  dark: 'github-dark-dimmed',
} as const

function appendPreClass(pre: Element, className: string) {
  const props = pre.properties ?? {}
  const raw = props.className ?? props.class
  const list = Array.isArray(raw)
    ? raw.map(String)
    : raw
      ? String(raw).split(/\s+/)
      : []
  if (!list.includes(className)) list.push(className)
  const { class: _dropClass, className: _dropClassName, ...rest } = props
  pre.properties = {
    ...rest,
    className: list,
  }
}

async function highlightToPre(code: string, language: string): Promise<Element> {
  const trimmed = code.trim()
  const lang = normalizeLanguage(language)
  const highlighter = await getHighlighter()

  try {
    const root = await highlighter.codeToHast(trimmed, { lang, themes: THEMES })
    const pre = root.children[0]
    if (pre?.type === 'element' && pre.tagName === 'pre') {
      if (lang === 'plaintext') appendPreClass(pre, 'doc-pre-plaintext')
      return pre
    }
  } catch {
    // fall through to plaintext
  }

  const root = await highlighter.codeToHast(trimmed, { lang: 'plaintext', themes: THEMES })
  const pre = root.children[0]
  if (pre?.type === 'element' && pre.tagName === 'pre') {
    appendPreClass(pre, 'doc-pre-plaintext')
    return pre
  }
  throw new Error('Shiki failed to highlight code block')
}

export async function highlightToPreElement(code: string, language = 'text'): Promise<Element> {
  return highlightToPre(code, language)
}