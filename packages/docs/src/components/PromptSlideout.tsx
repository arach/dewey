import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, ChevronRight, Copy, GripVertical, Info, Sparkles, X } from 'lucide-react'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'

hljs.registerLanguage('json', json)

export interface PromptParam {
  name: string
  description: string
  example?: string
}

export interface PromptSlideoutProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  info: string
  params?: PromptParam[]
  starterTemplate: string
  examples?: string
  expectedOutput?: string
  className?: string
}

function highlightCode(code: string): string {
  try {
    return hljs.highlight(code.trim(), { language: 'json' }).value
  } catch {
    return code
  }
}

function PromptCodeBlock({ code, filename }: { code: string; filename: string }) {
  return (
    <div className="dw-prompt-code-block">
      <div className="dw-prompt-code-header">
        <span>{filename}</span>
      </div>
      <pre>
        <code dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
      </pre>
    </div>
  )
}

export function PromptSlideout({
  isOpen,
  onClose,
  title = 'AI Prompt',
  description,
  info,
  params = [],
  starterTemplate,
  examples,
  expectedOutput,
  className = '',
}: PromptSlideoutProps) {
  const [copied, setCopied] = useState(false)
  const [userRequest, setUserRequest] = useState(starterTemplate)
  const [contextExpanded, setContextExpanded] = useState(false)
  const [width, setWidth] = useState(720)
  const isResizing = useRef(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()

  useEffect(() => {
    if (!isOpen) return
    setUserRequest(starterTemplate)
    setContextExpanded(false)
    returnFocusRef.current = document.activeElement as HTMLElement | null
    requestAnimationFrame(() => closeRef.current?.focus())
    return () => returnFocusRef.current?.focus()
  }, [isOpen, starterTemplate])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const beginResize = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    isResizing.current = true
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const resize = (event: MouseEvent) => {
      if (!isResizing.current) return
      setWidth(Math.max(480, Math.min(1200, window.innerWidth - event.clientX)))
    }
    const stopResize = () => {
      isResizing.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.addEventListener('mousemove', resize)
    document.addEventListener('mouseup', stopResize)
    return () => {
      document.removeEventListener('mousemove', resize)
      document.removeEventListener('mouseup', stopResize)
      stopResize()
    }
  }, [])

  const adjustWidth = (event: React.KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const direction = event.key === 'ArrowLeft' ? 1 : -1
    setWidth((current) => Math.max(480, Math.min(1200, current + direction * 32)))
  }

  const fullPrompt = useCallback(() => {
    let prompt = userRequest.trim()
    if (examples || expectedOutput) {
      prompt += '\n\n---\n\n'
      if (examples) prompt += `## Reference Examples\n\n\`\`\`json\n${examples.trim()}\n\`\`\`\n\n`
      if (expectedOutput) prompt += `## Expected Output\n\n${expectedOutput}`
    }
    return prompt
  }, [userRequest, examples, expectedOutput])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullPrompt())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (!isOpen) return null
  const hasSystemContext = Boolean(examples || expectedOutput)

  return (
    <div className="dw-prompt-layer">
      <button type="button" className="dw-prompt-backdrop" onClick={onClose} aria-label="Close prompt builder" />
      <div
        ref={panelRef}
        className={`dw-prompt-slideout ${className}`}
        style={{ width: `${width}px` }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div
          className="dw-prompt-resize"
          role="separator"
          aria-label="Resize prompt builder"
          aria-orientation="vertical"
          tabIndex={0}
          onMouseDown={beginResize}
          onKeyDown={adjustWidth}
        >
          <GripVertical aria-hidden="true" />
        </div>

        <header className="dw-prompt-header">
          <div className="dw-prompt-heading">
            <span className="dw-prompt-heading-icon"><Sparkles aria-hidden="true" /></span>
            <div>
              <h2 id={titleId}>{title}</h2>
              {description && <p>{description}</p>}
            </div>
          </div>
          <button ref={closeRef} type="button" className="dw-prompt-close" onClick={onClose} aria-label="Close prompt builder">
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="dw-prompt-content">
          <section className="dw-prompt-info">
            <Info aria-hidden="true" />
            <p>{info}</p>
          </section>

          {params.length > 0 && (
            <section>
              <h3 className="dw-prompt-section-title">Parameters</h3>
              <dl className="dw-prompt-params">
                {params.map((param) => (
                  <div key={param.name} className="dw-prompt-param">
                    <dt><code>{`{${param.name}}`}</code></dt>
                    <dd>
                      {param.description}
                      {param.example && <span> — <em>e.g., “{param.example}”</em></span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section>
            <h3 className="dw-prompt-section-title">Prompt Template</h3>
            {hasSystemContext && !contextExpanded && (
              <p className="dw-prompt-section-hint">Reference context below is included when copied.</p>
            )}
            <textarea
              className="dw-prompt-textarea"
              value={userRequest}
              onChange={(event) => setUserRequest(event.target.value)}
              aria-label="Prompt template"
            />
          </section>

          {hasSystemContext && (
            <section>
              <button
                type="button"
                className="dw-prompt-context-toggle"
                onClick={() => setContextExpanded((expanded) => !expanded)}
                aria-expanded={contextExpanded}
              >
                {contextExpanded ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
                Reference Context
              </button>
              {contextExpanded ? (
                <div className="dw-prompt-context-blocks">
                  {examples && <PromptCodeBlock code={examples} filename="examples.json" />}
                  {expectedOutput && <PromptCodeBlock code={expectedOutput} filename="expected-output.txt" />}
                </div>
              ) : (
                <p className="dw-prompt-context-summary">Examples and validation rules will be appended to the copied prompt.</p>
              )}
            </section>
          )}
        </div>

        <footer className="dw-prompt-footer">
          <p>{hasSystemContext ? 'Prompt and reference context will be copied.' : 'Copy into your AI assistant.'}</p>
          <button type="button" className={`dw-button ${copied ? 'dw-button-success' : 'dw-button-primary'}`} onClick={handleCopy}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            <span aria-live="polite">{copied ? 'Copied!' : 'Copy Prompt'}</span>
          </button>
        </footer>
      </div>
    </div>
  )
}

export default PromptSlideout
