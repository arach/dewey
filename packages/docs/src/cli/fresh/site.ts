import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Markdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { markdownRehype } from '../../utils/rehype-html.js'
import { dirname, join, posix } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { FreshDocs, SITE_THEMES, type RendererData } from './renderer.js'
import { PREFERENCES, SITE_SCRIPT } from './browser.js'
import { current, human, resolveReference, SKINS, tokens, type Doc, type Model } from './model.js'

export const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
export function markdown(body: string, transform?: (url: string) => string): string {
  return renderToStaticMarkup(createElement(Markdown, { remarkPlugins: [remarkGfm], rehypePlugins: markdownRehype, urlTransform: url => defaultUrlTransform(transform ? transform(url) : url), children: body }))
}
export const attributes = (html: string, name: string): string[] => [...html.matchAll(new RegExp(`\\b${name}="([^"]*)"`, 'g'))].map(match => match[1].replace(/&amp;/g, '&'))
export function relativeUrl(from: string, to: string): string { return posix.relative(posix.dirname(from), to) || posix.basename(to) }
export function renderBody(model: Model, doc: Doc): string {
  return markdown(doc.body, href => {
    const target = resolveReference(doc.path, href)
    if (!target) return href
    const page = model.docs.find(candidate => candidate.path === target.path)
    const route = page && human(page) ? page.route : `assets/${target.path}`
    return relativeUrl(doc.route, route) + (target.fragment ? `#${encodeURIComponent(target.fragment)}` : '')
  })
}

function packageRoot(): string {
  let directory = dirname(fileURLToPath(import.meta.url))
  while (dirname(directory) !== directory) {
    const path = join(directory, 'package.json')
    if (existsSync(path) && JSON.parse(readFileSync(path, 'utf8')).name === '@arach/dewey') return directory
    directory = dirname(directory)
  }
  throw new Error('Cannot locate the Dewey renderer assets')
}
// The site's look on top of the library's base.css: hairlines, mono labels, large tight headings
// and one accent, plus search and theme in the header and the phone layout.
const ADAPTER_CSS = `
:root{--dw-font-serif:var(--dw-font-sans);--dw-header-height:3.5rem;--dw-hair:color-mix(in srgb,var(--dw-foreground) 9%,transparent)}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%;scroll-padding-top:5rem}
body{margin:0;font-family:var(--dw-font-sans);background:var(--dw-background);color:var(--dw-foreground);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;font-feature-settings:"ss01","cv11"}
*{box-sizing:border-box}
::selection{background:color-mix(in srgb,var(--dw-primary) 24%,transparent)}
button,select,input{font:inherit}
.dw-fresh-skip{position:fixed;left:1rem;top:-5rem;z-index:100}
.dw-fresh-skip:focus{top:1rem;background:var(--dw-background);padding:.5rem}

/* Header: a hairline bar, square brand mark, quiet tools. */
.dw-header{background:var(--dw-header-bg);border-bottom:1px solid var(--dw-hair);-webkit-backdrop-filter:saturate(1.4) blur(14px);backdrop-filter:saturate(1.4) blur(14px)}
.dw-header-inner{padding-inline:1.25rem}
.dw-header-brand{gap:.6rem;font-size:.9375rem;font-weight:600;letter-spacing:-.015em;color:var(--dw-foreground);text-decoration:none}
.dw-header-brand-dot{width:.625rem;height:.625rem;border-radius:2px;background:var(--dw-foreground);box-shadow:3px 3px 0 var(--dw-primary)}
.dw-fresh-tools{display:flex;align-items:center;gap:.5rem}
.dw-fresh-tools .dw-cmd-trigger{width:16rem;margin:0;height:2rem;border:1px solid var(--dw-hair);border-radius:.5rem;background:color-mix(in srgb,var(--dw-foreground) 3%,transparent);color:var(--dw-muted-foreground);font-size:.8125rem;transition:border-color .15s,color .15s}
.dw-fresh-tools .dw-cmd-trigger:hover{border-color:color-mix(in srgb,var(--dw-foreground) 22%,transparent);color:var(--dw-foreground)}
.dw-cmd-kbd{font-family:var(--dw-font-mono);font-size:.6875rem;letter-spacing:.02em;border:1px solid var(--dw-hair);border-radius:.3rem;background:none;padding:.05rem .35rem;color:var(--dw-muted-foreground)}
.dw-fresh-theme{height:2rem;padding:0 1.4rem 0 .5rem;border:0;border-radius:.5rem;background:transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none' stroke='%23888' stroke-width='1.5'%3E%3Cpath d='m1 1 4 4 4-4'/%3E%3C/svg%3E") no-repeat right .4rem center;color:var(--dw-muted-foreground);font-family:var(--dw-font-mono);font-size:.6875rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;-webkit-appearance:none;appearance:none;field-sizing:content}
.dw-fresh-theme:hover,.dw-fresh-theme:focus-visible{color:var(--dw-foreground)}
.dw-fresh-theme option{text-transform:none;font-family:var(--dw-font-sans);background:var(--dw-background);color:var(--dw-foreground)}
.dw-header-theme-toggle{color:var(--dw-muted-foreground);border-radius:.5rem}
.dw-header-theme-toggle:hover{color:var(--dw-foreground);background:color-mix(in srgb,var(--dw-foreground) 5%,transparent)}

/* Sidebar: transparent, mono group labels, a hairline rail with the active page marked on it. */
.dw-sidebar{background:transparent;border-right:1px solid var(--dw-hair)}
.dw-sidebar-header{display:flex;align-items:center;justify-content:space-between;gap:.5rem}
.dw-sidebar-nav{padding-inline:1.25rem}
.dw-sidebar-group{margin-top:2rem;padding-top:0;border-top:0}
.dw-sidebar-group:first-child{margin-top:0}
.dw-sidebar-group-title{margin-bottom:.75rem;padding:0;font-family:var(--dw-font-mono);font-size:.6875rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--dw-muted-foreground)}
.dw-sidebar-group-title svg{opacity:.5}
.dw-sidebar-group>.dw-sidebar-list{border-left:1px solid var(--dw-hair);margin-left:.1rem}
.dw-sidebar-item{position:relative;display:block;margin-left:-1px;padding:.32rem .9rem;border-left:1px solid transparent;border-radius:0;font-size:.875rem;line-height:1.45;color:var(--dw-muted-foreground);text-decoration:none;transition:color .15s,border-color .15s}
.dw-sidebar-item:hover{color:var(--dw-foreground);background:none;border-left-color:color-mix(in srgb,var(--dw-foreground) 30%,transparent)}
.dw-sidebar-item.active{background:none;color:var(--dw-foreground);font-weight:550;border-left:2px solid var(--dw-primary);padding-left:calc(.9rem - 1px)}
@media(min-width:1024px){.dw-sidebar-header{display:none}.dw-sidebar-nav{padding-top:3rem}}

/* Page head: a mono eyebrow, then a big tight title and a softer lede. */
.dw-content{--dw-content-top-offset:3rem;max-width:46rem;padding-bottom:6rem}
.dw-breadcrumbs{margin-bottom:1.1rem}
.dw-breadcrumbs-list{display:flex;flex-wrap:wrap;gap:0;list-style:none;margin:0;padding:0;font-family:var(--dw-font-mono);font-size:.6875rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dw-muted-foreground)}
.dw-breadcrumbs-item{display:flex;align-items:center}
.dw-breadcrumbs-item:last-child{display:none}
.dw-breadcrumbs-item:nth-last-child(2) .dw-breadcrumbs-separator{display:none}
.dw-breadcrumbs-separator{margin:0 .6em;font-size:0}
.dw-breadcrumbs-separator::before{content:"·";font-size:.6875rem}
.dw-breadcrumbs-item:first-child .dw-breadcrumbs-label{color:var(--dw-primary)}

.dw-prose{font-size:1rem;line-height:1.72;color:color-mix(in srgb,var(--dw-foreground) 86%,var(--dw-background))}
.dw-prose strong{color:var(--dw-foreground);font-weight:600}
.dw-prose h1,.dw-prose h2,.dw-prose h3,.dw-prose h4{color:var(--dw-foreground);font-family:var(--dw-font-sans)}
.dw-shell-page-title,.dw-prose h1{font-size:clamp(2.1rem,4.2vw,2.85rem);line-height:1.06;font-weight:600;letter-spacing:-.04em;margin:0 0 1.25rem;text-wrap:balance}
.dw-page-path{display:none}
.dw-page-head+.dw-prose>p:first-child{font-size:1.1875rem;line-height:1.6;letter-spacing:-.008em;color:var(--dw-muted-foreground);margin-bottom:2.5rem;text-wrap:pretty}
.dw-page-head+.dw-prose>p:first-child strong,.dw-page-head+.dw-prose>p:first-child a{color:var(--dw-foreground)}
.dw-prose>.dw-prose{counter-reset:dw-section}
.dw-prose h2{flex-wrap:wrap;column-gap:.75rem;margin:3.5rem 0 1rem;padding-top:1.5rem;border-top:1px solid var(--dw-hair);font-size:1.5rem;line-height:1.2;font-weight:600;letter-spacing:-.028em;counter-increment:dw-section}
.dw-prose h2::before{content:"§" counter(dw-section,decimal-leading-zero);flex-basis:100%;margin-bottom:.55rem;font-family:var(--dw-font-mono);font-size:.6875rem;font-weight:500;letter-spacing:.12em;color:var(--dw-muted-foreground)}
.dw-prose h3{margin:2.25rem 0 .6rem;font-size:1.125rem;font-weight:600;letter-spacing:-.018em}
.dw-prose h4{margin:1.75rem 0 .5rem;font-family:var(--dw-font-mono);font-size:.75rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--dw-muted-foreground)}
.dw-heading-link{color:var(--dw-muted-foreground)}
.dw-prose p,.dw-prose ul,.dw-prose ol{margin:0 0 1.15rem}
.dw-prose li{margin:.35rem 0}
.dw-prose li::marker{color:var(--dw-muted-foreground)}
.dw-prose hr{border:0;border-top:1px solid var(--dw-hair);margin:3rem 0}

/* Links: ink with a hairline underline; the accent shows on hover. */
.dw-prose a:not(.dw-heading-link){color:var(--dw-foreground);text-decoration:underline;text-decoration-color:color-mix(in srgb,var(--dw-foreground) 28%,transparent);text-decoration-thickness:1px;text-underline-offset:.22em;transition:color .15s,text-decoration-color .15s}
.dw-prose a:not(.dw-heading-link):hover{color:var(--dw-primary);text-decoration-color:var(--dw-primary)}

/* Code. */
.dw-prose .dw-code-block{margin:1.5rem 0}
.dw-prose .dw-code-block-frame{border:1px solid var(--dw-code-border);border-radius:.65rem;background:var(--dw-code-bg);box-shadow:none}
.dw-prose .dw-code-block-language{top:.7rem;left:1.15rem;font-family:var(--dw-font-mono);font-size:.625rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--dw-muted-foreground);background:none}
.dw-prose .dw-code-block-pre{padding:1rem 3rem 1rem 1.15rem;font-size:.8125rem;line-height:1.7}
.dw-prose .dw-code-block-language~.dw-code-block-pre{padding-top:2.1rem}
.dw-prose .dw-inline-code,.dw-prose :not(pre)>code{padding:.08em .38em;font-family:var(--dw-font-mono);font-size:.84em;font-weight:450;color:var(--dw-foreground);background:color-mix(in srgb,var(--dw-foreground) 4.5%,transparent);border:1px solid var(--dw-hair);border-radius:.3rem}
.dw-prose a .dw-inline-code{color:inherit}

/* Without JavaScript these controls would do nothing, so they are not shown. */
html:not(.js) .dw-fresh-tools,html:not(.js) .dw-header-theme-toggle,html:not(.js) .dw-header-menu-btn{display:none!important}

/* Tables: hairline rules, mono column labels. */
.dw-markdown-table-scroll{margin:1.5rem 0 2rem;border:0;border-top:1px solid var(--dw-foreground);border-radius:0}
.dw-prose .dw-markdown-table-scroll table{margin:0;font-size:.875rem;width:100%}
.dw-prose th,.dw-prose td{border:0;border-bottom:1px solid var(--dw-hair);padding:.7rem 1rem .7rem 0;vertical-align:top;line-height:1.55;text-align:left}
.dw-prose th{background:none;color:var(--dw-muted-foreground);font-family:var(--dw-font-mono);font-size:.6875rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase}
.dw-prose tr:nth-child(even){background:none}

/* On this page. */
.dw-toc{padding-top:3rem}
.dw-toc-title{margin:0 0 .75rem;font-family:var(--dw-font-mono);font-size:.6875rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--dw-muted-foreground)}
.dw-toc-link{font-size:.8125rem;line-height:1.45;color:var(--dw-muted-foreground);text-decoration:none;transition:color .15s}
.dw-toc-link:hover{color:var(--dw-foreground)}
.dw-toc-link.active{color:var(--dw-foreground);border-left-color:var(--dw-primary)}

/* Previous / next. */
.dw-prev-next{margin-top:4.5rem;padding-top:0;border-top:0;gap:1rem}
.dw-prev-next-link{border:1px solid var(--dw-hair);border-radius:.65rem;padding:1rem 1.15rem;background:none;text-decoration:none;transition:border-color .15s}
.dw-prev-next-link:hover{border-color:color-mix(in srgb,var(--dw-foreground) 30%,transparent);background:none}
.dw-prev-next-label{font-family:var(--dw-font-mono);font-size:.625rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--dw-muted-foreground)}
.dw-prev-next-title{font-size:.9375rem;font-weight:600;letter-spacing:-.012em;color:var(--dw-foreground)}

@media(max-width:1000px){.dw-fresh-tools .dw-cmd-trigger{width:11rem}}
@media(max-width:768px){
  .dw-header-inner{padding-inline:.75rem}
  .dw-header-menu-btn{display:flex!important;align-items:center;justify-content:center;width:2.25rem;height:2.25rem;padding:0;background:none;border:0;border-radius:var(--dw-radius);color:var(--dw-foreground);cursor:pointer}
  .dw-header-left{gap:.5rem}
  .dw-header-right{gap:.25rem}
  .dw-fresh-tools{gap:.25rem}
  .dw-fresh-tools .dw-cmd-trigger{width:2.25rem;height:2.25rem;padding:0;justify-content:center;border:0;background:none;color:var(--dw-foreground)}
  .dw-fresh-tools .dw-cmd-trigger-text{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  .dw-fresh-tools .dw-cmd-kbd{display:none}
  .dw-fresh-tools .dw-cmd-trigger-icon{width:1rem;height:1rem}
  .dw-fresh-theme{padding-right:1.2rem;background-position:right .25rem center}
  .dw-sidebar{background:var(--dw-background)}
  .dw-content{padding-top:calc(var(--dw-header-height) + 1.75rem)}
  .dw-page-head+.dw-prose>p:first-child{font-size:1.0625rem}
  .dw-prose h2{margin-top:2.75rem}
}

.dw-cmd-palette{border:1px solid var(--dw-hair);border-radius:.85rem;background:var(--dw-background);box-shadow:0 24px 70px -20px rgba(0,0,0,.45)}
.dw-cmd-result{text-decoration:none}
.dw-cmd-result[aria-selected=true]{background:color-mix(in srgb,var(--dw-foreground) 5%,transparent)}
.dw-cmd-result-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:.15rem}
.dw-cmd-result-body .dw-cmd-result-title{flex:none}
.dw-cmd-result-heading{color:var(--dw-muted-foreground);font-weight:400}
.dw-cmd-result-snippet{font-size:.75rem;line-height:1.4;color:var(--dw-muted-foreground);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dw-cmd-result-snippet mark{background:color-mix(in srgb,var(--dw-primary) 22%,transparent);color:var(--dw-foreground);border-radius:2px;padding:0 1px}
.dw-cmd-result-meta{font-family:var(--dw-font-mono);font-size:.625rem;letter-spacing:.1em;text-transform:uppercase}
/* Raw HTML from READMEs: centered heroes and full-width images. */
.dw-prose [align=center]{text-align:center}
.dw-prose [align=center] img{margin-inline:auto}
.dw-prose [align=center] .dw-markdown-heading{justify-content:center}
.dw-prose [align=center] h1+p,.dw-prose [align=center]+p{margin-inline:auto}
.dw-prose img{max-width:100%;height:auto;border-radius:.75rem}
.dw-prose a:has(> img){display:inline-block;text-decoration:none}
/* GitHub alerts: [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION]. */
.dw-prose .dw-markdown-alert{--dw-alert:var(--dw-primary);margin:1.75rem 0;font-style:normal;color:var(--dw-foreground);border:1px solid var(--dw-hair);border-left:2px solid var(--dw-alert);background:color-mix(in srgb,var(--dw-foreground) 2.5%,transparent);border-radius:0 .5rem .5rem 0;padding:.9rem 1.15rem}
.dw-prose .dw-markdown-alert>p{margin:.25rem 0}
.dw-prose .dw-markdown-alert-title{font-family:var(--dw-font-mono);font-size:.6875rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--dw-alert)}
.dw-prose .dw-markdown-alert-warning{--dw-alert:#d97706}
.dw-prose .dw-markdown-alert-caution{--dw-alert:#dc2626}
.dw-prose blockquote:not(.dw-markdown-alert){border-left:2px solid var(--dw-hair);padding-left:1.15rem;color:var(--dw-muted-foreground);font-style:normal}
`

function runtimeFiles(): Record<string, string> {
  const root = packageRoot()
  const css = existsSync(join(root, 'src/css/base.css')) ? join(root, 'src/css') : join(root, 'dist/css')
  return {
    'site.js': SITE_SCRIPT,
    'style.css': [readFileSync(join(css, 'tokens.css'), 'utf8'), readFileSync(join(css, 'base.css'), 'utf8'), ADAPTER_CSS].join('\n'),
    ...Object.fromEntries(SITE_THEMES.map(theme => [`themes/${theme}.css`, readFileSync(join(css, `colors/${theme}.css`), 'utf8')])),
  }
}
type Skin = typeof SKINS[number]
// What a skin needs besides its stylesheet: its web fonts and the labels of the page's Markdown actions.
// dark: the site opens in dark mode until the reader picks one.
const SKIN_SETUP: Record<Skin, { fonts: string; dark?: boolean; copy?: string; view?: string }> = {
  openscout: { fonts: 'family=Archivo:wght@400;500;600;700', dark: true, copy: 'Copy MD', view: 'View MD' },
  talkie: { fonts: 'family=Cormorant+Garamond:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500' },
  lattices: { fonts: 'family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600' },
  hudsonkit: { fonts: 'family=JetBrains+Mono:wght@400;500;600;700', copy: 'Copy markdown' },
}
function skinFiles(): Record<string, string> {
  const root = packageRoot()
  const css = existsSync(join(root, 'src/css/skins')) ? join(root, 'src/css/skins') : join(root, 'dist/css/skins')
  return Object.fromEntries(SKINS.map(skin => [`skins/${skin}.css`, readFileSync(join(css, `${skin}.css`), 'utf8')]))
}
function stylesheets(prefix: string, skin?: Skin): string {
  if (!skin) return `<link rel="stylesheet" href="${prefix}style.css"><link id="dewey-preset" rel="stylesheet" href="${prefix}themes/ink.css">`
  return `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?${SKIN_SETUP[skin].fonts}&display=swap"><link rel="stylesheet" href="${prefix}style.css"><link rel="stylesheet" href="${prefix}skins/${skin}.css">`
}
const SHELL = new Set(['sh', 'bash', 'shell', 'zsh', 'console'])
// The page head and code-block hooks, added to the rendered page: the article's h1 moves into a
// header with the page's path, its description and Markdown actions, and code blocks carry their
// language. Shell blocks get one span per line so a skin can show prompts. Skins choose what shows.
function decorate(html: string, doc: Doc | undefined, route: string, skin?: Skin): string {
  if (!doc) return html
  const article = '<article class="dw-prose"><div class="dw-prose">'
  const at = html.indexOf(article)
  if (at < 0) return html
  const rest = html.slice(at + article.length)
  const h1 = rest.match(/^\s*(<h1\b[\s\S]*?<\/h1>)/)
  const title = h1 ? h1[1] : `<h1 class="dw-markdown-heading">${escape(doc.title)}</h1>`
  const path = doc.route === 'readme.html' ? '/' : `/${doc.route.replace(/\.html$/, '')}`
  const markdownHref = escape(relativeUrl(route, markdownRoute(doc.route)))
  const setup: { copy?: string; view?: string } = skin ? SKIN_SETUP[skin] : {}
  const actions = [
    setup.copy ? `<button type="button" class="dw-page-action" data-dw-copy-markdown="${markdownHref}">${setup.copy}</button>` : '',
    setup.view ? `<a class="dw-page-action" href="${markdownHref}">${setup.view}</a>` : '',
  ].join('')
  const head = `<header class="dw-page-head"><p class="dw-page-path">${escape(path)}</p><div class="dw-page-title">${title}${actions ? `<div class="dw-page-actions">${actions}</div>` : ''}</div>${doc.description ? `<p class="dw-page-description">${escape(doc.description)}</p>` : ''}</header>`
  const body = (h1 ? rest.slice(h1[0].length) : rest)
    .replace(/<div class="dw-code-block group"><div class="dw-code-block-frame"><div class="dw-code-block-scroll"><span class="dw-code-block-language">([\w+-]+)<\/span>/g, (all, language) => all.replace('class="dw-code-block group"', `class="dw-code-block group" data-language="${language}"`))
    .replace(/(<div class="dw-code-block group" data-language="([\w+-]+)"[\s\S]*?<code class="dw-code-block-code">)([\s\S]*?)(<\/code>)/g, (all, before, language, code, after) => SHELL.has(language) ? before + shellLines(code) + after : all)
  return html.slice(0, at) + article.replace('<div class="dw-prose">', head + '<div class="dw-prose">') + body
}
// One span per line: a command, a comment, or the continuation of a command ending in a backslash.
// Highlighted spans that cross a line break are left as they are.
function shellLines(code: string): string {
  const lines = code.split('\n')
  if (lines.some(line => (line.match(/<span\b/g) ?? []).length !== (line.match(/<\/span>/g) ?? []).length)) return code
  let continued = false
  return lines.map(line => {
    const text = line.replace(/<[^>]+>/g, '')
    const kind = !text.trim() ? 'blank' : continued ? 'continued' : text.trimStart().startsWith('#') ? 'comment' : 'command'
    continued = kind !== 'comment' && /\\\s*$/.test(text)
    return `<span class="dw-code-line" data-line="${kind}">${line}</span>`
  }).join('\n')
}
function rootPrefix(route: string): string { return '../'.repeat(route.split('/').length - 1) || './' }
export const markdownRoute = (route: string) => route.replace(/\.html$/, '.md')
// format 'md' points page links at the .md copies, for agents reading the published site.
// Status lines readers see at the top of a page: proposal, replaced, and what it applies to.
export function notice(model: Model, doc: Doc): string {
  const link = (path: string) => `[${model.docs.find(other => other.path === path)?.title ?? path}](${posix.relative(posix.dirname(doc.path), path)})`
  const lines = [
    ...doc.status === 'proposal' ? ['> **Proposal.** This page describes planned behavior, not what ships today.'] : [],
    ...doc.supersededBy.length ? [`> **Replaced** by ${doc.supersededBy.map(link).join(', ')}.`] : [],
    ...doc.applies.length ? [`> Applies to: ${doc.applies.join(', ')}.`] : [],
  ]
  return lines.length ? `${lines.join('\n>\n')}\n\n` : ''
}
export function rewriteMarkdown(model: Model, doc: Doc, format: 'html' | 'md' = 'html'): string {
  // Rewrite rendered link targets back into Markdown destinations, including reference links.
  // Keep all Markdown intact for the actual MarkdownContent / CodeBlock renderer.
  const source = notice(model, doc) + doc.body
  const urls = new Map<string, string>()
  const html = markdown(source)
  for (const href of [...attributes(html, 'href'), ...attributes(html, 'src')]) {
    const target = resolveReference(doc.path, href)
    if (!target) continue
    const page = model.docs.find(candidate => candidate.path === target.path)
    const route = page && human(page) ? format === 'md' ? markdownRoute(page.route) : page.route : `assets/${target.path}`
    const next = relativeUrl(doc.route, route) + (target.fragment ? `#${encodeURIComponent(target.fragment)}` : '')
    urls.set(href, next)
  }
  // Mask fenced and inline code before rewriting destinations: examples are source, not links.
  const code: string[] = []
  const masked = source.replace(/(^[ \t]*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^[ \t]*\2[ \t]*$)|(`+)[^`]*?\3/gm, value => {
    code.push(value)
    return `\u0000DEWEY_CODE_${code.length - 1}\u0000`
  })
  return masked.replace(/(\]\(<?)([^\s)>]+)(>?)/g, (all, before, href, after) => urls.has(href) ? `${before}${urls.get(href)}${after}` : all)
    .replace(/^(\s*\[[^\]]+\]:\s*<?)([^\s>]+)(>?)/gm, (all, before, href, after) => urls.has(href) ? `${before}${urls.get(href)}${after}` : all)
    // Raw HTML in the Markdown, such as a README's <img src="docs/hero.png">.
    .replace(/(<[a-z][^>]*?\s(?:href|src)=)(["'])([^"']+)\2/gi, (all, before, quote, href) => urls.has(href) ? `${before}${quote}${urls.get(href)}${quote}` : all)
    .replace(/\u0000DEWEY_CODE_(\d+)\u0000/g, (_, index) => code[Number(index)])
}
const size = (text: string) => `${text.trimEnd().split('\n').length} lines, ~${tokens(text)} tokens`
// The site copy of a page for agents: links point at other .md copies.
const pageMarkdown = (model: Model, doc: Doc) => rewriteMarkdown(model, doc, 'md')
// llms-full.txt: every current page; maps, history, proposals and replaced pages excluded. Links are relative to the site root.
export function fullBundle(model: Model): string {
  const pages = model.docs.filter(current)
  return [`# ${model.project.name}`, '', `> ${model.project.purpose}`, '', ...pages.flatMap(doc => ['---', '', `<!-- ${markdownRoute(doc.route)} -->`, '', rewriteMarkdown(model, { ...doc, route: 'index.html' }, 'md').trim(), ''])].join('\n')
}
// The llms.txt index. 'site' links to the .md copies; 'repo' links to the source files from the repo root.
export function llmsIndex(model: Model, target: 'site' | 'repo'): string {
  // Replaced pages stay on the site for old links but leave the index.
  const pages = model.docs.filter(doc => human(doc) && !doc.hidden && !doc.supersededBy.length)
  const entries = pages.map(doc => `- [${doc.title}](${target === 'site' ? markdownRoute(doc.route) : doc.path}): ${doc.status === 'proposal' ? '[proposal] ' : ''}${doc.summary} (${size(target === 'site' ? pageMarkdown(model, doc) : doc.raw)}${doc.applies.length ? `; applies to ${doc.applies.join(', ')}` : ''})`)
  const full = target === 'site' ? ['', '## Everything', '', `- [llms-full.txt](llms-full.txt): every current page in one file (${size(fullBundle(model))}). Load it only when you need all of it.`] : []
  return [`# ${model.project.name}`, '', `> ${model.project.purpose}`, '', '## Documentation', '', ...entries, ...full, ''].join('\n')
}
// Sidebar groups. `group` frontmatter names one; otherwise Start here, Guides or Reference.
// Pages sort by `order`, then by path. Groups appear in the order of their first page.
export function navigationGroups(pages: Doc[]): Array<{ title: string; items: Doc[] }> {
  // Start here needs a quickstart; a README on its own leads Guides instead of a one-page group.
  const quickstart = pages.some(doc => doc.path === 'docs/quickstart.md' && !doc.group)
  const start = (doc: Doc) => quickstart && (doc.path === 'README.md' || doc.path === 'docs/quickstart.md')
  const groupOf = (doc: Doc) => doc.group ?? (start(doc) ? 'Start here' : doc.kind === 'reference' ? 'Reference' : 'Guides')
  const rank = (doc: Doc) => doc.order ?? (doc.path === 'README.md' ? 0 : doc.path === 'docs/quickstart.md' ? 1 : doc.kind === 'reference' ? 200 : 100)
  const sorted = [...pages].sort((a, b) => rank(a) - rank(b) || a.path.localeCompare(b.path))
  const groups: Array<{ title: string; items: Doc[] }> = []
  for (const doc of sorted) {
    const title = groupOf(doc)
    const group = groups.find(entry => entry.title === title) ?? groups[groups.push({ title, items: [] }) - 1]
    group.items.push(doc)
  }
  return groups
}
const plain = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
// search.js: title, route, group, summary, headings and capped text for each listed page.
export function searchIndex(model: Model, groups: Array<{ title: string; items: Doc[] }>): string {
  const entries = groups.flatMap(group => group.items.map(doc => {
    const html = markdown(notice(model, doc) + doc.body)
    const headings = [...html.matchAll(/<h([23]) id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)].map(match => [match[2], plain(match[3])])
    return { t: doc.title, u: doc.route, g: group.title, s: doc.summary, h: headings, x: plain(html).slice(0, 6000) }
  }))
  return `window.DEWEY_SEARCH=${JSON.stringify(entries).replace(/</g, '\\u003c')}\n`
}
export function siteFiles(model: Model): Record<string, string> {
  const pages = model.docs.filter(human)
  const groups = navigationGroups(pages.filter(doc => !doc.hidden))
  const navigation = groups.map(group => ({ title: group.title, items: group.items.map(doc => ({ id: doc.route, title: doc.title })) }))
  const skin = model.project.skin
  const files: Record<string, string> = { ...runtimeFiles(), ...skin ? skinFiles() : {}, 'search.js': searchIndex(model, groups), 'llms.txt': llmsIndex(model, 'site'), 'llms-full.txt': fullBundle(model) }
  for (const doc of pages) files[markdownRoute(doc.route)] = pageMarkdown(model, doc)
  const entry = groups.flatMap(group => group.items).find(doc => doc.path === 'README.md') ?? groups[0]?.items[0] ?? pages[0]
  for (const [route, page] of [['index.html', entry], ...pages.map(doc => [doc.route, doc] as const)] as Array<[string, Doc | undefined]>) {
    // The landing alias needs body-relative links rebased to its own location.
    const content = page ? rewriteMarkdown(model, route === 'index.html' ? { ...page, route } : page) : ''
    const data: RendererData = { name: model.project.name, purpose: model.project.purpose, route, currentPage: page?.route ?? '', rootPrefix: rootPrefix(route), content, navigation, skin }
    const body = decorate(renderToStaticMarkup(createElement(FreshDocs, { data })), page, route, skin)
    const title = route === 'index.html' || !page || page.title === model.project.name ? model.project.name : `${page.title} · ${model.project.name}`
    const description = page?.summary ? `<meta name="description" content="${escape(page.summary)}">` : ''
    const alternate = page ? `<link rel="alternate" type="text/markdown" href="${escape(relativeUrl(route, markdownRoute(page.route)))}">` : ''
    files[route] = `<!doctype html>\n<html lang="en"${skin && SKIN_SETUP[skin].dark ? ' data-dw-default="dark"' : ''}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="dewey-root" content="${data.rootPrefix}"><title>${escape(title)}</title>${description}${alternate}${stylesheets(data.rootPrefix, skin)}<script>${PREFERENCES}</script></head><body><a class="dw-fresh-skip" href="#dewey-root">Skip to documentation</a><div id="dewey-root">${body}</div><script defer src="${data.rootPrefix}site.js"></script></body></html>\n`
  }
  return files
}
