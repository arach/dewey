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
        className="px-1.5 py-0.5 rounded text-[13px] font-mono font-medium"
        style={{
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          color: isDark ? '#f3f4f6' : '#101518',
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
    <div className="relative group mb-4">
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: isDark ? '#1e2126' : '#faf8f5',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,21,24,0.1)'}`,
        }}
      >
        {/* Code content */}
        <div className="overflow-x-auto relative">
          {/* Language label */}
          {language !== 'text' && (
            <span
              className="absolute top-2 left-3 text-[10px] font-mono tracking-wider uppercase select-none pointer-events-none"
              style={{
                color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              }}
            >
              {language}
            </span>
          )}
          {/* Copy button - icon only, visible on hover */}
          <button
            onClick={copyToClipboard}
            className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              color: isDark ? '#9ca3af' : '#5c676c',
            }}
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <pre className="m-0 p-4 pt-8">
            <code
              className="font-mono text-[13px] leading-relaxed"
              style={{ color: isDark ? '#abb2bf' : '#383a42' }}
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </pre>
        </div>
      </div>
    </div>
  )
}

export default CodeBlock
