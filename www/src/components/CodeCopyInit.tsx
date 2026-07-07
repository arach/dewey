'use client'

import { useEffect } from 'react'

function attachCopyButton(pre: HTMLPreElement) {
  if (pre.dataset.copyReady) return

  pre.dataset.copyReady = 'true'
  pre.style.position = 'relative'

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'doc-copy-btn'
  btn.title = 'Copy code'
  btn.setAttribute('aria-label', 'Copy code')
  btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`

  const checkSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
  const copySvg = btn.innerHTML

  btn.addEventListener('click', async () => {
    const code = pre.querySelector('code')
    if (!code) return
    try {
      await navigator.clipboard.writeText(code.innerText.trim())
      btn.innerHTML = checkSvg
      btn.classList.add('copied')
      setTimeout(() => {
        btn.innerHTML = copySvg
        btn.classList.remove('copied')
      }, 1500)
    } catch {
      // ignore
    }
  })

  pre.appendChild(btn)
}

export function CodeCopyInit() {
  useEffect(() => {
    document.querySelectorAll('.doc-content pre').forEach((block) => {
      attachCopyButton(block as HTMLPreElement)
    })
  }, [])

  return null
}