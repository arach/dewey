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
import { current, human, resolveReference, tokens, type Doc, type Model } from './model.js'

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
// Site-specific polish on top of the library's base.css: sans headings, a quiet sidebar,
// search and theme in the header, and the phone layout.
const ADAPTER_CSS = `
:root{--dw-font-serif:var(--dw-font-sans)}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;font-family:var(--dw-font-sans);background:var(--dw-background);color:var(--dw-foreground);-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
button,select,input{font:inherit}
.dw-fresh-skip{position:fixed;left:1rem;top:-5rem;z-index:100}
.dw-fresh-skip:focus{top:1rem;background:var(--dw-background);padding:.5rem}

.dw-header-brand{font-weight:650;letter-spacing:-.01em}
.dw-shell-page-title,.dw-prose h1{font-weight:700;letter-spacing:-.025em}
.dw-prose h2{font-weight:650;letter-spacing:-.015em}
.dw-prose h3,.dw-prose h4{font-weight:600;letter-spacing:-.01em}

.dw-fresh-tools{display:flex;align-items:center;gap:.5rem}
.dw-fresh-tools .dw-cmd-trigger{width:15rem;margin:0;height:2rem}
.dw-fresh-theme{height:2rem;padding:0 1.6rem 0 .6rem;border:1px solid var(--dw-border);border-radius:.5rem;background:var(--dw-background) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none' stroke='%23888' stroke-width='1.5'%3E%3Cpath d='m1 1 4 4 4-4'/%3E%3C/svg%3E") no-repeat right .55rem center;color:var(--dw-muted-foreground);font-size:.8125rem;cursor:pointer;-webkit-appearance:none;appearance:none}
.dw-fresh-theme:hover,.dw-fresh-theme:focus-visible{color:var(--dw-foreground);border-color:var(--dw-muted-foreground)}

.dw-sidebar-header{display:flex;align-items:center;justify-content:space-between;gap:.5rem}
.dw-sidebar-group{margin-top:1.5rem;padding-top:0;border-top:0}
.dw-sidebar-group-title{margin-bottom:.35rem}
.dw-sidebar-item{padding:.4rem .75rem;border-radius:.5rem}
.dw-sidebar-item.active{background:color-mix(in srgb,var(--dw-primary) 11%,transparent);color:var(--dw-primary);font-weight:600}
@media(min-width:1024px){.dw-sidebar-header{display:none}.dw-sidebar-nav{padding-top:1.5rem}}

@media(max-width:1000px){.dw-fresh-tools .dw-cmd-trigger{width:11rem}}
@media(max-width:768px){
  .dw-header-menu-btn{display:flex!important;align-items:center;justify-content:center;width:2.25rem;height:2.25rem;padding:0;background:none;border:0;border-radius:var(--dw-radius);color:var(--dw-foreground);cursor:pointer}
  .dw-header-left{gap:.5rem}
  .dw-header-right{gap:.25rem}
  .dw-fresh-tools{gap:.25rem}
  .dw-fresh-tools .dw-cmd-trigger{width:2.25rem;height:2.25rem;padding:0;justify-content:center;border:0;background:none;color:var(--dw-foreground)}
  .dw-fresh-tools .dw-cmd-trigger-text{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  .dw-fresh-tools .dw-cmd-kbd{display:none}
  .dw-fresh-tools .dw-cmd-trigger-icon{width:1rem;height:1rem}
  .dw-fresh-theme{border:0;background-color:transparent;padding-right:1.3rem;background-position:right .3rem center}
}

.dw-prose .dw-code-block-pre{padding:.9rem 3rem .9rem 1rem}
.dw-prose .dw-code-block-language~.dw-code-block-pre{padding-top:1.9rem}
.dw-prose .dw-inline-code,.dw-prose :not(pre)>code{padding:.1em .35em;font-size:.85em;font-weight:450;background:color-mix(in srgb,var(--dw-foreground) 7%,transparent);border-radius:.3rem}

/* Without JavaScript these controls would do nothing, so they are not shown. */
html:not(.js) .dw-fresh-tools,html:not(.js) .dw-header-theme-toggle,html:not(.js) .dw-header-menu-btn{display:none!important}

.dw-markdown-table-scroll{margin:1.25rem 0 1.5rem;border:1px solid var(--dw-border);border-radius:.6rem}
.dw-prose .dw-markdown-table-scroll table{margin:0;font-size:.875rem}
.dw-prose th,.dw-prose td{border:0;border-bottom:1px solid var(--dw-border);padding:.55rem .9rem;vertical-align:top;line-height:1.5}
.dw-prose th{background:var(--dw-muted);color:var(--dw-muted-foreground);font-size:.75rem;font-weight:600;letter-spacing:.02em}
.dw-prose tr:nth-child(even){background:none}
.dw-prose tbody tr:last-child td{border-bottom:0}

.dw-cmd-result{text-decoration:none}
.dw-cmd-result[aria-selected=true]{background:var(--dw-muted)}
.dw-cmd-result-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:.15rem}
.dw-cmd-result-body .dw-cmd-result-title{flex:none}
.dw-cmd-result-heading{color:var(--dw-muted-foreground);font-weight:400}
.dw-cmd-result-snippet{font-size:.75rem;line-height:1.4;color:var(--dw-muted-foreground);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dw-cmd-result-snippet mark{background:color-mix(in srgb,var(--dw-primary) 22%,transparent);color:var(--dw-foreground);border-radius:2px;padding:0 1px}
/* Raw HTML from READMEs: centered heroes and full-width images. */
.dw-prose [align=center]{text-align:center}
.dw-prose [align=center] img{margin-inline:auto}
.dw-prose [align=center] .dw-markdown-heading{justify-content:center}
.dw-prose img{max-width:100%;height:auto;border-radius:.5rem}
.dw-prose a:has(> img){display:inline-block}
/* GitHub alerts: [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION]. */
.dw-prose .dw-markdown-alert{--dw-alert:var(--dw-primary);font-style:normal;color:var(--dw-foreground);border-left:3px solid var(--dw-alert);background:color-mix(in srgb,var(--dw-alert) 6%,transparent);border-radius:0 .5rem .5rem 0;padding:.75rem 1rem}
.dw-prose .dw-markdown-alert>p{margin:.25rem 0}
.dw-prose .dw-markdown-alert-title{font-size:.75rem;font-weight:650;letter-spacing:.04em;text-transform:uppercase;color:var(--dw-alert)}
.dw-prose .dw-markdown-alert-warning{--dw-alert:#d97706}
.dw-prose .dw-markdown-alert-caution{--dw-alert:#dc2626}
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
  const files: Record<string, string> = { ...runtimeFiles(), 'search.js': searchIndex(model, groups), 'llms.txt': llmsIndex(model, 'site'), 'llms-full.txt': fullBundle(model) }
  for (const doc of pages) files[markdownRoute(doc.route)] = pageMarkdown(model, doc)
  const entry = groups.flatMap(group => group.items).find(doc => doc.path === 'README.md') ?? groups[0]?.items[0] ?? pages[0]
  for (const [route, page] of [['index.html', entry], ...pages.map(doc => [doc.route, doc] as const)] as Array<[string, Doc | undefined]>) {
    // The landing alias needs body-relative links rebased to its own location.
    const content = page ? rewriteMarkdown(model, route === 'index.html' ? { ...page, route } : page) : ''
    const data: RendererData = { name: model.project.name, purpose: model.project.purpose, route, currentPage: page?.route ?? '', rootPrefix: rootPrefix(route), content, navigation }
    const body = renderToStaticMarkup(createElement(FreshDocs, { data }))
    const title = route === 'index.html' || !page || page.title === model.project.name ? model.project.name : `${page.title} · ${model.project.name}`
    const description = page?.summary ? `<meta name="description" content="${escape(page.summary)}">` : ''
    const alternate = page ? `<link rel="alternate" type="text/markdown" href="${escape(relativeUrl(route, markdownRoute(page.route)))}">` : ''
    files[route] = `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="dewey-root" content="${data.rootPrefix}"><title>${escape(title)}</title>${description}${alternate}<link rel="stylesheet" href="${data.rootPrefix}style.css"><link id="dewey-preset" rel="stylesheet" href="${data.rootPrefix}themes/ocean.css"><script>${PREFERENCES}</script></head><body><a class="dw-fresh-skip" href="#dewey-root">Skip to documentation</a><div id="dewey-root">${body}</div><script defer src="${data.rootPrefix}site.js"></script></body></html>\n`
  }
  return files
}
