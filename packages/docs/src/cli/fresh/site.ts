import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Markdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { posix } from 'node:path'
import { human, resolveReference, type Doc, type Model } from './model.js'

export const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
export function markdown(body: string, transform?: (url: string) => string): string {
  return renderToStaticMarkup(createElement(Markdown, { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug], urlTransform: url => defaultUrlTransform(transform ? transform(url) : url), children: body }))
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
const CSS = `:root{color-scheme:light dark;--dw-background:light-dark(#fff,#15171a);--dw-foreground:light-dark(#202329,#e6e8eb);--dw-muted:light-dark(#58616d,#a8b0bb);--dw-border:light-dark(#dce0e5,#3b414b);--dw-link:light-dark(#1558a6,#8fc2ff);font:16px/1.75 ui-sans-serif,system-ui,sans-serif}*{box-sizing:border-box}body{margin:0;background:var(--dw-background);color:var(--dw-foreground)}a{color:var(--dw-link);text-underline-offset:.2em}a:focus-visible{outline:3px solid currentColor;outline-offset:4px}header{padding:1.2rem 2rem;border-bottom:1px solid var(--dw-border)}header a{color:inherit;font-weight:650}header span{margin-left:1rem;color:var(--dw-muted)}.layout{display:grid;grid-template-columns:16rem minmax(0,80ch);gap:3rem;max-width:1200px;margin:auto;padding:2rem}nav{font-size:.95rem}nav ul{padding:0;list-style:none}nav li{margin:.6rem 0}nav a[aria-current]{font-weight:700;color:var(--dw-foreground)}main{min-width:0}h1{font-size:2.2rem;line-height:1.2;letter-spacing:-.035em}h2{margin-top:2rem;line-height:1.3}pre{padding:1rem;background:light-dark(#f3f5f7,#20242a);overflow:auto;border-radius:.3rem}code{font-family:ui-monospace,monospace;font-size:.9em}table{display:block;max-width:100%;overflow:auto;border-collapse:collapse}th,td{padding:.5rem .8rem;text-align:left;border-bottom:1px solid var(--dw-border)}img{max-width:100%;height:auto}blockquote{margin-left:0;padding-left:1rem;border-left:3px solid var(--dw-border);color:var(--dw-muted)}.skip{position:absolute;left:1rem;top:-5rem}.skip:focus{top:1rem;background:var(--dw-background);padding:.5rem}footer{margin-top:3rem;color:var(--dw-muted);font-size:.9rem}@media(max-width:720px){.layout{grid-template-columns:1fr;gap:1rem;padding:1rem}nav{border-bottom:1px solid var(--dw-border)}header{padding:1rem}header span{display:block;margin:0}h1{font-size:1.8rem}}`
export function shell(model: Model, route: string, title: string, body: string): string {
  const nav = model.docs.filter(doc => human(doc) && !doc.hidden).map(doc => `<li><a href="${escape(relativeUrl(route, doc.route))}"${route === doc.route ? ' aria-current="page"' : ''}>${escape(doc.title)}</a></li>`).join('')
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} · ${escape(model.project.name)}</title><link rel="stylesheet" href="${relativeUrl(route, 'style.css')}"></head><body><a class="skip" href="#content">Skip to content</a><header><a href="${relativeUrl(route, 'index.html')}">${escape(model.project.name)}</a><span>Documentation</span></header><div class="layout"><nav aria-label="Documentation"><ul>${nav}</ul><a href="${relativeUrl(route, 'llms.txt')}">Agent index</a></nav><main id="content">${body}<footer>Documentation from this project’s Markdown.</footer></main></div></body></html>\n`
}
export function siteFiles(model: Model): Record<string, string> {
  const pages = model.docs.filter(human)
  const index = [`# ${model.project.name}`, '', `> ${model.project.purpose}`, '', '## Documentation', '', ...pages.filter(doc => !doc.hidden).map(doc => `- [${doc.title}](${doc.route})`), ''].join('\n')
  const files: Record<string, string> = { 'style.css': CSS, 'llms.txt': index }
  files['index.html'] = shell(model, 'index.html', 'Documentation', `<h1>${escape(model.project.name)}</h1><p>${escape(model.project.purpose)}</p><ul>${pages.filter(doc => !doc.hidden).map(doc => `<li><a href="${escape(doc.route)}">${escape(doc.title)}</a></li>`).join('')}</ul>`)
  for (const doc of pages) files[doc.route] = shell(model, doc.route, doc.title, renderBody(model, doc))
  return files
}
