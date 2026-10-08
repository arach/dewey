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
import { current, human, resolveReference, SKINS, tokens, type Doc, type Model, type SiteConfig } from './model.js'
import { THEME_REGISTRY, type ThemeName } from '../../themes.js'

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
.dw-agent-paths{margin-top:2rem}
.dw-agent-paths-title{margin:0 0 .75rem;font-family:var(--dw-font-mono);font-size:.6875rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--dw-muted-foreground)}
.dw-agent-paths-list{list-style:none;margin:0 0 0 .1rem;padding:0;border-left:1px solid var(--dw-hair)}
.dw-agent-path{display:block;margin-left:-1px;padding:.28rem .9rem;border-left:1px solid transparent;font-family:var(--dw-font-mono);font-size:.78rem;color:var(--dw-muted-foreground);text-decoration:none}
.dw-agent-path:hover{color:var(--dw-foreground);border-left-color:color-mix(in srgb,var(--dw-foreground) 30%,transparent)}
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

/* The project's logo and header links. */
.dw-header-logo{display:block;height:1.5rem;width:auto;max-width:8rem;object-fit:contain}
.dw-site-links{display:flex;align-items:center;gap:1rem;margin-right:.5rem}
.dw-site-link{font-size:.8125rem;color:var(--dw-muted-foreground);text-decoration:none;white-space:nowrap;transition:color .15s}
.dw-site-link:hover{color:var(--dw-foreground)}
@media(max-width:768px){.dw-site-link:not(.dw-site-link-home){display:none}}

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

function runtimeFiles(chosen?: string): Record<string, string> {
  const root = packageRoot()
  const css = existsSync(join(root, 'src/css/base.css')) ? join(root, 'src/css') : join(root, 'dist/css')
  const themes = new Set<string>(SITE_THEMES)
  if (chosen) themes.add(chosen)
  return {
    'site.js': SITE_SCRIPT,
    'style.css': [readFileSync(join(css, 'tokens.css'), 'utf8'), readFileSync(join(css, 'base.css'), 'utf8'), ADAPTER_CSS].join('\n'),
    ...Object.fromEntries([...themes].map(theme => [`themes/${theme}.css`, readFileSync(join(css, `colors/${THEME_REGISTRY[theme as ThemeName].cssFile}`), 'utf8')])),
  }
}
// The skin a project's site uses: its own choice, else the deweydocs.com look. 'ink' is no skin, with color themes.
type Skin = Exclude<typeof SKINS[number], 'ink'>
// A site.theme is a color theme for the ink look, so it implies 'ink'.
export const siteSkin = (project: Model['project']): Skin | undefined => { const skin = project.skin ?? (project.site?.theme ? 'ink' : 'dewey'); return skin === 'ink' ? undefined : skin }
// What a skin needs besides its stylesheet: its web fonts and the labels of the page's Markdown actions.
// dark: the site opens in dark mode until the reader picks one.
// prompt: a button that copies the page as a prompt for an agent. agentPaths: the sidebar block of agent files.
// house: deweydocs.com's chrome — a Docs / page bar, search in the sidebar, a Copy page menu, a card index
// as the site's front page and a footer line.
const SKIN_SETUP: Record<Skin, { fonts: string; dark?: boolean; copy?: string; view?: string; prompt?: string; agentPaths?: boolean; house?: boolean }> = {
  dewey: { fonts: 'family=Noto+Serif+Display:wght@100..600&family=Geist:wght@100..900&family=Geist+Mono:wght@100..900', agentPaths: true, house: true },
  openscout: { fonts: 'family=Archivo:wght@400;500;600;700', dark: true, copy: 'Copy MD', view: 'View MD', prompt: 'Prompt', agentPaths: true },
  talkie: { fonts: 'family=Cormorant+Garamond:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500' },
  lattices: { fonts: 'family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600' },
  hudsonkit: { fonts: 'family=JetBrains+Mono:wght@400;500;600;700', copy: 'Copy markdown' },
}
function skinFiles(): Record<string, string> {
  const root = packageRoot()
  const css = existsSync(join(root, 'src/css/skins')) ? join(root, 'src/css/skins') : join(root, 'dist/css/skins')
  return Object.fromEntries(SKINS.filter(skin => skin !== 'ink').map(skin => [`skins/${skin}.css`, readFileSync(join(css, `${skin}.css`), 'utf8')]))
}
function stylesheets(prefix: string, skin: Skin | undefined, site: SiteConfig = {}): string {
  // A chosen theme is a plain link: without the dewey-preset id, a visitor's saved theme cannot replace it.
  const base = !skin ? `<link rel="stylesheet" href="${prefix}style.css">${site.theme ? `<link rel="stylesheet" href="${prefix}themes/${site.theme}.css">` : `<link id="dewey-preset" rel="stylesheet" href="${prefix}themes/ink.css">`}`
    : `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?${SKIN_SETUP[skin].fonts}&display=swap"><link rel="stylesheet" href="${prefix}style.css"><link rel="stylesheet" href="${prefix}skins/${skin}.css">`
  const fonts = site.fonts?.stylesheet ? `<link rel="stylesheet" href="${escape(site.fonts.stylesheet)}">` : ''
  const own = siteCss(site)
  const custom = site.css ? `<link rel="stylesheet" href="${escape(`${prefix}assets/${site.css}`)}">` : ''
  return base + fonts + (own ? `<style>${own}</style>` : '') + custom
}
// The project's accent and fonts, over any theme or skin: :root:root:root outranks a skin's :root:has(...).
function siteCss(site: SiteConfig): string {
  const accent = typeof site.accent === 'string' ? { light: site.accent, dark: site.accent } : site.accent
  const fonts = site.fonts ?? {}
  const light = [
    ...accent ? [`--dw-primary:${accent.light}`, `--dw-ring:${accent.light}`, `--dd-accent:${accent.light}`] : [],
    ...fonts.sans ? [`--dw-font-sans:${fonts.sans}`] : [],
    ...fonts.heading ?? fonts.sans ? [`--dw-font-serif:${fonts.heading ?? fonts.sans}`] : [],
    ...fonts.mono ? [`--dw-font-mono:${fonts.mono}`] : [],
  ]
  const dark = accent ? [`--dw-primary:${accent.dark}`, `--dw-ring:${accent.dark}`, `--dd-accent:${accent.dark}`] : []
  return (light.length ? `:root:root:root{${light.join(';')}}` : '') + (dark.length ? `:root:root:root.dark{${dark.join(';')}}` : '')
}
// The project's logo in place of the header's brand mark.
function brandLogo(html: string, route: string, logo?: string): string {
  if (!logo) return html
  return html.replace('<span class="dw-header-brand-dot" aria-hidden="true"></span>', `<img class="dw-header-logo" src="${escape(relativeUrl(route, `assets/${logo}`))}" alt="">`)
}
const SHELL = new Set(['sh', 'bash', 'shell', 'zsh', 'console'])
// The page head and code-block hooks, added to the rendered page: the article's h1 moves into a
// header with the page's path, its description and Markdown actions, and code blocks carry their
// language. Shell blocks get one span per line so a skin can show prompts. Skins choose what shows.
// Links an agent can start from, at the foot of the sidebar: the indexes, nav.json and this page's Markdown.
function agentPaths(html: string, route: string, doc: Doc | undefined, title = 'Agent paths'): string {
  const links = [['llms.txt', 'llms.txt'], ['llms-full.txt', 'llms-full.txt'], ['nav.json', 'nav.json'], ...doc ? [[markdownRoute(doc.route), 'this page.md']] : []]
  const block = `<div class="dw-agent-paths"><p class="dw-agent-paths-title">${title}</p><ul class="dw-agent-paths-list">${links.map(([target, label]) => `<li><a class="dw-agent-path" href="${escape(relativeUrl(route, target))}">${label}</a></li>`).join('')}</ul></div>`
  return html.replace('</ul></nav></aside>', `</ul>${block}</nav></aside>`)
}
function decorate(html: string, doc: Doc | undefined, route: string, project: Model['project'], groups: Array<{ title: string; items: Doc[] }>): string {
  const skin = siteSkin(project)
  const house = skin ? SKIN_SETUP[skin].house : false
  if (!skin || SKIN_SETUP[skin].agentPaths) html = agentPaths(html, route, doc, house ? 'Agent files' : undefined)
  if (house) html = houseChrome(html, route === 'index.html' ? undefined : doc, route, project, groups)
  if (!doc) return html
  const article = '<article class="dw-prose"><div class="dw-prose">'
  const at = html.indexOf(article)
  if (at < 0) return html
  const rest = html.slice(at + article.length)
  const h1 = rest.match(/^\s*(<h1\b[\s\S]*?<\/h1>)/)
  const title = h1 ? h1[1] : `<h1 class="dw-markdown-heading">${escape(doc.title)}</h1>`
  const path = doc.route === 'readme.html' ? '/' : `/${doc.route.replace(/\.html$/, '')}`
  const markdownHref = escape(relativeUrl(route, markdownRoute(doc.route)))
  const setup: { copy?: string; view?: string; prompt?: string; house?: boolean } = skin ? SKIN_SETUP[skin] : {}
  // The prompt's opening lines; site.js adds the Markdown's address and the Markdown itself.
  const promptHead = [`You are working with ${project.name} documentation.`, '', `Page: ${doc.title}`, ...doc.summary ? [`Summary: ${doc.summary}`] : []].join('\n')
  const actions = setup.house ? pageMenu(markdownHref, escape(promptHead), escape(relativeUrl(route, 'llms.txt'))) : [
    setup.copy ? `<button type="button" class="dw-page-action" data-dw-copy-markdown="${markdownHref}">${setup.copy}</button>` : '',
    setup.view ? `<a class="dw-page-action" href="${markdownHref}">${setup.view}</a>` : '',
    setup.prompt ? `<button type="button" class="dw-page-action" data-dw-copy-prompt="${markdownHref}" data-dw-prompt-head="${escape(promptHead)}" title="Copy a prompt for an agent with this page">${setup.prompt}</button>` : '',
  ].join('')
  const head = `<header class="dw-page-head"><p class="dw-page-path">${escape(path)}</p><div class="dw-page-title">${title}${actions ? `<div class="dw-page-actions">${actions}</div>` : ''}</div>${doc.description ? `<p class="dw-page-description">${escape(doc.description)}</p>` : ''}</header>`
  const body = (h1 ? rest.slice(h1[0].length) : rest)
    .replace(/<div class="dw-code-block group"><div class="dw-code-block-frame"><div class="dw-code-block-scroll"><span class="dw-code-block-language">([\w+-]+)<\/span>/g, (all, language) => all.replace('class="dw-code-block group"', `class="dw-code-block group" data-language="${language}"`))
    .replace(/(<div class="dw-code-block group" data-language="([\w+-]+)"[\s\S]*?<code class="dw-code-block-code">)([\s\S]*?)(<\/code>)/g, (all, before, language, code, after) => SHELL.has(language) ? before + shellLines(code) + after : all)
  return html.slice(0, at) + article.replace('<div class="dw-prose">', head + '<div class="dw-prose">') + body
}
const svg = (paths: string) => `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`
const COPY_ICON = svg('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>')
const FILE_ICON = svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>')
const AGENT_ICON = svg('<path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/>')
const LIST_ICON = svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>')
const ARROW = '<svg class="dw-ctx-out" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>'
const logo = (d: string) => `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" aria-hidden="true"><path d="${d}"/></svg>`
// The assistants the menu can open with this page, each with its one-colour logo. site.js fills in each
// link with the page's address.
const CHATS = [
  ['chatgpt', 'Open in ChatGPT', logo('M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z')],
  ['claude', 'Open in Claude', logo('m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z')],
]
const CHEVRON = svg('<polyline points="6 9 12 15 18 9"/>')
// deweydocs.com's Copy page split button. The menu is a <details>, so View as Markdown and llms.txt
// work without JavaScript; the copy and chat items need it.
const item = (label: string, desc: string) => `<span class="dw-ctx-text"><span class="dw-action-label">${label}</span><span class="dw-ctx-desc">${desc}</span></span>`
function pageMenu(markdownHref: string, promptHead: string, llmsHref: string): string {
  return `<div class="dw-ctx"><button type="button" class="dw-action-btn dw-ctx-primary" data-dw-copy-markdown="${markdownHref}">${COPY_ICON}<span class="dw-action-label">Copy page</span></button>`
    + `<details class="dw-ctx-more"><summary class="dw-action-btn dw-ctx-toggle" aria-label="More page actions">${CHEVRON}</summary><div class="dw-ctx-menu">`
    + `<button type="button" class="dw-ctx-item" data-dw-copy-prompt="${markdownHref}" data-dw-prompt-head="${promptHead}">${AGENT_ICON}${item('Copy page for agent', 'Prompt plus this page’s Markdown')}</button>`
    + `<button type="button" class="dw-ctx-item" data-dw-copy-markdown="${markdownHref}">${FILE_ICON}${item('Copy as Markdown', 'This page as Markdown')}</button>`
    + `<div class="dw-ctx-sep"></div><a class="dw-ctx-item" href="${markdownHref}">${FILE_ICON}${item('View as Markdown', 'Open this page as plain text')}</a>`
    + `<a class="dw-ctx-item" href="${llmsHref}">${LIST_ICON}${item('llms.txt', 'Index of every page')}</a>`
    + `<div class="dw-ctx-sep dw-ctx-chat"></div>${CHATS.map(([target, label, icon]) => `<a class="dw-ctx-item dw-ctx-chat" data-dw-open="${target}" data-dw-markdown="${markdownHref}" href="#" target="_blank" rel="noopener noreferrer">${icon}${item(label, 'Ask questions about this page')}${ARROW}</a>`).join('')}`
    + `</div></details><span class="dw-ctx-status" role="status" aria-live="polite"></span></div>`
}
// The Dewey ticket from deweydocs.com/brand, redrawn for footer size: one rule on whole pixels, and the
// outlined Theano Didot wordmark on a whole-pixel baseline, set a pixel low so it looks centered. dewey.css
// thickens its hairlines on low-density screens.
const DEWEY_TICKET = '<svg class="dw-powered-ticket" viewBox="0 0 57 22" width="57" height="22" aria-hidden="true" focusable="false">'
  + '<path d="M4.5 .5H52.5A4 4 0 0 0 56.5 4.5V17.5A4 4 0 0 0 52.5 21.5H4.5A4 4 0 0 0 .5 17.5V4.5A4 4 0 0 0 4.5 .5Z" fill="none" stroke="currentColor"/>'
  + '<path class="dw-powered-word" fill="currentColor" stroke="currentColor" stroke-linejoin="round" transform="translate(8.46 14.15) scale(.0072 -.0072)" d="M284 850Q365 900 465 900Q646 900 752 720L766 722V1448H560V1496H930V48H1072V0H766V162L752 164Q646 -16 465 -16Q365 -16 284 34Q195 89 145.5 194.0Q96 299 96.0 442.0Q96 585 145.5 690.0Q195 795 284 850ZM520 44Q616 44 691.0 155.5Q766 267 766.0 442.0Q766 617 691.0 728.5Q616 840 520 840Q436 840 380.5 784.5Q325 729 302.5 643.0Q280 557 280.0 442.0Q280 327 302.5 241.0Q325 155 380.5 99.5Q436 44 520 44ZM1236 430Q1236 561 1288.0 667.5Q1340 774 1439.5 837.0Q1539 900 1669 900Q1749 900 1816.0 868.0Q1883 836 1924.0 786.0Q1965 736 1987.5 677.0Q2010 618 2010 560Q2010 517 1995.0 498.5Q1980 480 1936 480H1420Q1420 48 1696 48Q1804 48 1871.0 118.0Q1938 188 1952 298H2004Q2000 241 1979.0 187.5Q1958 134 1918.5 87.5Q1879 41 1813.5 12.5Q1748 -16 1666 -16Q1480 -16 1358.0 108.0Q1236 232 1236 430ZM1421 528H1771Q1813 528 1825.5 551.0Q1838 574 1838 625Q1838 718 1791.5 785.0Q1745 852 1648 852Q1600 852 1561.5 832.5Q1523 813 1498.0 781.5Q1473 750 1456.0 706.5Q1439 663 1431.0 619.5Q1423 576 1421 528ZM2142 836V884H2578V836H2436L2655 226L2852 727L2813 836H2696V884H3132V836H2990L3206 240L3411 836H3282V884H3564V836H3462L3167 -18H3123L2876 662L2609 -18H2565L2259 836ZM3616 430Q3616 561 3668.0 667.5Q3720 774 3819.5 837.0Q3919 900 4049 900Q4129 900 4196.0 868.0Q4263 836 4304.0 786.0Q4345 736 4367.5 677.0Q4390 618 4390 560Q4390 517 4375.0 498.5Q4360 480 4316 480H3800Q3800 48 4076 48Q4184 48 4251.0 118.0Q4318 188 4332 298H4384Q4380 241 4359.0 187.5Q4338 134 4298.5 87.5Q4259 41 4193.5 12.5Q4128 -16 4046 -16Q3860 -16 3738.0 108.0Q3616 232 3616 430ZM3801 528H4151Q4193 528 4205.5 551.0Q4218 574 4218 625Q4218 718 4171.5 785.0Q4125 852 4028 852Q3980 852 3941.5 832.5Q3903 813 3878.0 781.5Q3853 750 3836.0 706.5Q3819 663 3811.0 619.5Q3803 576 3801 528ZM4476 -465Q4476 -416 4504.5 -385.0Q4533 -354 4582 -354Q4617 -354 4637.5 -374.5Q4658 -395 4658 -422Q4658 -441 4650 -473Q4642 -503 4642 -525Q4642 -574 4710 -574Q4761 -574 4795.0 -528.0Q4829 -482 4855 -405L4988 -19L4640 836H4522V884H4980V836H4818L5070 216L5284 836H5161V884H5470V836H5341L4909 -408Q4896 -446 4885.5 -470.5Q4875 -495 4855.0 -528.5Q4835 -562 4812.0 -581.5Q4789 -601 4752.5 -615.5Q4716 -630 4672 -630Q4588 -630 4532.0 -587.5Q4476 -545 4476 -465Z"/></svg>'
// deweydocs.com's frame around the generated layout: a Docs / page bar in the header, the search box at
// the top of the sidebar, a Powered by Dewey badge at its foot, a footer line, and on the front page a card for every listed page.
function houseChrome(html: string, doc: Doc | undefined, route: string, project: Model['project'], groups: Array<{ title: string; items: Doc[] }>): string {
  const home = escape(relativeUrl(route, 'index.html'))
  const crumbs = `<nav class="dw-topbar-crumbs" aria-label="Breadcrumb"><a class="dw-topbar-crumb" href="${home}">Docs</a>${doc ? `<span class="dw-topbar-sep">/</span><span class="dw-topbar-current">${escape(doc.title)}</span>` : ''}</nav>`
  html = html.replace('<div class="dw-header-right">', `${crumbs}<div class="dw-header-right">`)
  const search = html.match(/<button type="button" class="dw-cmd-trigger">[\s\S]*?<\/button>/)
  // The sidebar holds the search box; the header keeps its copy for phones, where the sidebar is a drawer.
  if (search) html = html.replace('<nav class="dw-sidebar-nav">', `<nav class="dw-sidebar-nav"><div class="dw-sidebar-search">${search[0]}</div>`)
  const foot = `<footer class="dw-site-foot"><p class="dw-site-foot-line"><a href="${home}">${escape(project.name)}</a> — ${escape(project.purpose)}</p></footer>`
  html = html.replace(/<\/div><\/main>/, `${foot}</div></main>`)
  // The Powered by Dewey badge sits pinned at the foot of the sidebar.
  const sidebar = html.indexOf('<aside class="dw-sidebar')
  const sidebarEnd = sidebar < 0 ? -1 : html.indexOf('</aside>', sidebar)
  if (sidebarEnd > 0) html = html.slice(0, sidebarEnd) + `<div class="dw-sidebar-foot"><a class="dw-powered" href="https://deweydocs.com" target="_blank" rel="noopener noreferrer" aria-label="Powered by Dewey">Powered by ${DEWEY_TICKET}</a></div>` + html.slice(sidebarEnd)
  if (doc) return html
  // The front page: the project's name and purpose, then each sidebar group as a grid of cards.
  const cards = groups.map(group => `<section class="dw-home-group"><h2 class="dw-home-group-title">${escape(group.title)}</h2><div class="dw-home-grid">${group.items.map(item => `<a class="dw-home-card" href="${escape(relativeUrl(route, item.route))}"><div><h3 class="dw-home-card-title">${escape(item.title)}</h3>${item.summary ? `<p class="dw-home-card-desc">${escape(item.summary)}</p>` : ''}</div><p class="dw-home-card-cta">Read page ${svg('<path d="M5 12h14M12 5l7 7-7 7"/>')}</p></a>`).join('')}</div></section>`).join('')
  const head = `<header class="dw-page-head"><div class="dw-page-title"><h1 class="dw-markdown-heading">${escape(project.name)}</h1></div><p class="dw-page-description">${escape(project.purpose)}</p></header>`
  const start = html.indexOf('<article class="dw-prose">'), end = html.lastIndexOf('</article>')
  if (start >= 0 && end > start) html = html.slice(0, start) + `<article class="dw-home">${head}${cards}</article>` + html.slice(end + '</article>'.length)
  return html.replace(/<nav class="dw-breadcrumbs"[\s\S]*?<\/nav>/, '').replace(/<nav class="dw-prev-next"[\s\S]*?<\/nav>/, '').replace(/<aside class="dw-toc[\s\S]*?<\/aside>/, '')
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
// nav.json: the sidebar as data, for agents and tools. Paths are relative to the site root.
export function navJson(model: Model, groups: Array<{ title: string; items: Doc[] }>): string {
  return `${JSON.stringify({
    name: model.project.name,
    purpose: model.project.purpose,
    entrypoints: { llms: 'llms.txt', llmsFull: 'llms-full.txt', nav: 'nav.json' },
    groups: groups.map(group => ({ title: group.title, items: group.items.map(doc => ({ title: doc.title, summary: doc.summary, url: doc.route, markdown: markdownRoute(doc.route), source: doc.path })) })),
  }, null, 2)}\n`
}
export function siteFiles(model: Model): Record<string, string> {
  const pages = model.docs.filter(human)
  const groups = navigationGroups(pages.filter(doc => !doc.hidden))
  const navigation = groups.map(group => ({ title: group.title, items: group.items.map(doc => ({ id: doc.route, title: doc.title })) }))
  const skin = siteSkin(model.project)
  const site = model.project.site ?? {}
  // The product home leads the header links; it opens on the product site, not the docs.
  const links = [...site.home ? [{ label: site.home.label ?? model.project.name, href: site.home.href, home: true }] : [], ...site.links ?? []]
  const files: Record<string, string> = { ...runtimeFiles(site.theme), ...skin ? skinFiles() : {}, 'search.js': searchIndex(model, groups), 'llms.txt': llmsIndex(model, 'site'), 'llms-full.txt': fullBundle(model), 'nav.json': navJson(model, groups) }
  for (const doc of pages) files[markdownRoute(doc.route)] = pageMarkdown(model, doc)
  const entry = groups.flatMap(group => group.items).find(doc => doc.path === 'README.md') ?? groups[0]?.items[0] ?? pages[0]
  for (const [route, page] of [['index.html', entry], ...pages.map(doc => [doc.route, doc] as const)] as Array<[string, Doc | undefined]>) {
    // The landing alias needs body-relative links rebased to its own location.
    const content = page ? rewriteMarkdown(model, route === 'index.html' ? { ...page, route } : page) : ''
    const data: RendererData = { name: model.project.name, purpose: model.project.purpose, route, currentPage: page?.route ?? '', rootPrefix: rootPrefix(route), content, navigation, skin, theme: site.theme, links }
    const body = brandLogo(decorate(renderToStaticMarkup(createElement(FreshDocs, { data })), page, route, model.project, groups), route, site.logo)
    const title = route === 'index.html' || !page || page.title === model.project.name ? model.project.name : `${page.title} · ${model.project.name}`
    const description = page?.summary ? `<meta name="description" content="${escape(page.summary)}">` : ''
    const alternate = page ? `<link rel="alternate" type="text/markdown" href="${escape(relativeUrl(route, markdownRoute(page.route)))}">` : ''
    files[route] = `<!doctype html>\n<html lang="en"${skin && SKIN_SETUP[skin].dark ? ' data-dw-default="dark"' : ''}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="dewey-root" content="${data.rootPrefix}"><title>${escape(title)}</title>${description}${alternate}${stylesheets(data.rootPrefix, skin, site)}<script>${PREFERENCES}</script></head><body><a class="dw-fresh-skip" href="#dewey-root">Skip to documentation</a><div id="dewey-root">${body}</div><script defer src="${data.rootPrefix}site.js"></script></body></html>\n`
  }
  return files
}
