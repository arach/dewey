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
      <code className={`dw-inline-code${isDark ? ' dark' : ''}`}>
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
    <div className={`dw-code-block group${isDark ? ' dark' : ''}`}>
      <div className="dw-code-block-frame">
        {/* Code content */}
        <div className="dw-code-block-scroll">
          {/* Language label */}
          {language !== 'text' && (
            <span className="dw-code-block-language">
              {language}
            </span>
          )}
          {/* Copy button - icon only, visible on hover */}
          <button
            type="button"
            onClick={copyToClipboard}
            className="dw-code-block-copy"
            aria-label={copied ? 'Code copied' : 'Copy code'}
            title="Copy code"
          >
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          </button>
          <pre className="dw-code-block-pre">
            <code
              className="dw-code-block-code"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </pre>
        </div>
      </div>
    </div>
  )
}

export default CodeBlock
