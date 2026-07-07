import 'server-only'

import type { Element, Parents, Root } from 'hast'
import { visit } from 'unist-util-visit'
import { highlightToPreElement } from '@/lib/shiki'

function textContent(node: Element): string {
  let value = ''
  for (const child of node.children) {
    if (child.type === 'text') value += child.value
    else if (child.type === 'element') value += textContent(child)
  }
  return value
}

function languageFromCode(node: Element): string {
  const className = node.properties?.className
  if (!className) return 'text'
  const token = Array.isArray(className) ? className[0] : className
  return String(token).replace(/^language-/, '')
}

function getClasses(node: Element): string[] {
  const props = node.properties ?? {}
  const raw = props.className ?? props.class
  if (!raw) return []
  return Array.isArray(raw) ? raw.map(String) : String(raw).split(/\s+/)
}

function setClasses(node: Element, classes: string[]) {
  const unique = Array.from(new Set(classes.filter(Boolean)))
  const { class: _dropClass, className: _dropClassName, ...rest } = node.properties ?? {}
  node.properties = {
    ...rest,
    className: unique,
  }
}

function appendClass(node: Element, name: string) {
  const classes = getClasses(node)
  if (!classes.includes(name)) classes.push(name)
  setClasses(node, classes)
}

function markEmptyLines(pre: Element) {
  visit(pre, 'element', (node) => {
    if (node.tagName !== 'span' || !getClasses(node).includes('line')) return
    if (textContent(node).trim() !== '') return
    appendClass(node, 'line-empty')
  })
}

function stripCodeWhitespace(pre: Element) {
  const codeEl = pre.children.find((child) => child.type === 'element' && child.tagName === 'code')
  if (!codeEl || codeEl.type !== 'element') return
  codeEl.children = codeEl.children.filter(
    (child) => !(child.type === 'text' && !child.value.trim()),
  )
}

export function rehypeShiki() {
  return async (tree: Root) => {
    const replacements: Array<{
      parent: Parents
      index: number
      code: string
      language: string
    }> = []

    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'pre' || index == null || !parent) return
      const codeEl = node.children[0]
      if (!codeEl || codeEl.type !== 'element' || codeEl.tagName !== 'code') return

      replacements.push({
        parent,
        index,
        code: textContent(codeEl),
        language: languageFromCode(codeEl),
      })
    })

    await Promise.all(
      replacements.map(async ({ parent, index, code, language }) => {
        const pre = await highlightToPreElement(code, language)
        stripCodeWhitespace(pre)
        markEmptyLines(pre)
        parent.children[index] = pre
      }),
    )
  }
}