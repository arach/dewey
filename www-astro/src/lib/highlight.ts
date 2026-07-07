import { createHighlighter, type Highlighter } from 'shiki'

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-light', 'github-dark-dimmed', 'vitesse-dark'],
      langs: ['typescript', 'bash', 'json'],
    })
  }
  return highlighterPromise
}

export async function highlight(code: string, lang: string, theme?: string): Promise<string> {
  const highlighter = await getHighlighter()

  // Single-theme mode (e.g. vitesse-dark for Hudson)
  if (theme) {
    return highlighter.codeToHtml(code, { lang, theme })
  }

  return highlighter.codeToHtml(code, {
    lang,
    themes: {
      light: 'github-light',
      dark: 'github-dark-dimmed',
    },
  })
}
