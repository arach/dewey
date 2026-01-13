import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import hljs from 'highlight.js/lib/core'

// Import common languages
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import yaml from 'highlight.js/lib/languages/yaml'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import python from 'highlight.js/lib/languages/python'
import swift from 'highlight.js/lib/languages/swift'
import rust from 'highlight.js/lib/languages/rust'
import go from 'highlight.js/lib/languages/go'

// Register languages
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('swift', swift)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('go', go)
hljs.registerLanguage('tsx', typescript)
hljs.registerLanguage('jsx', javascript)

interface CodeBlockProps {
  children: string
  className?: string
  inline?: boolean
  isDark?: boolean
}

export function CodeBlock({ children, className, inline, isDark = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  // Extract language from className (e.g., "language-typescript" -> "typescript")
  const language = className?.replace('language-', '') || 'text'

  const copyToClipboard = async () => {
    try {
      const text = typeof children === 'string' ? children : String(children)
      await navigator.clipboard.writeText(text.trim())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code: ', err)
    }
  }

  // For inline code, use simple styling
  if (inline || !className?.includes('language-')) {
    return (
      <code
        className="px-1.5 py-0.5 rounded text-[13px]"
        style={{
          fontFamily: 'var(--font-mono)',
          background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
          color: isDark ? '#e5e7eb' : 'var(--arc-ink)',
        }}
      >
        {children}
      </code>
    )
  }

  // Highlight the code
  const code = typeof children === 'string' ? children.trim() : String(children).trim()
  let highlighted: string
  try {
    highlighted = hljs.highlight(code, { language }).value
  } catch {
    highlighted = code
  }

  return (
    <div
      className="relative group my-5"
      style={{
        background: isDark ? '#0c1416' : '#1a1d20',
        borderRadius: '12px',
        boxShadow: isDark
          ? '0 12px 28px rgba(0, 0, 0, 0.4)'
          : '0 12px 28px rgba(12, 20, 22, 0.2)',
      }}
    >
      {/* Header with language tag and copy button */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <span
          className="text-[11px] font-medium uppercase tracking-wider"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          {language === 'text' ? '' : language}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-2 py-1 text-[11px] rounded-md transition-all opacity-0 group-hover:opacity-100"
          style={{
            color: 'rgba(255, 255, 255, 0.5)',
            background: copied ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
          }}
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" style={{ color: '#10b981' }} />
              <span style={{ color: '#10b981' }}>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto">
        <pre className="m-0 px-4 py-4">
          <code
            className="text-[13px] leading-relaxed"
            style={{
              fontFamily: 'var(--font-mono)',
              color: '#abb2bf',
            }}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>
    </div>
  )
}

export default CodeBlock
