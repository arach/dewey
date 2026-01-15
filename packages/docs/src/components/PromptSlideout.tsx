import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Copy, Check, Sparkles, ChevronDown, ChevronRight, Info, GripVertical } from 'lucide-react'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'

// Register JSON for syntax highlighting
hljs.registerLanguage('json', json)

export interface PromptParam {
  /** Variable name (displayed with squiggles like {NAME}) */
  name: string
  /** Description of what this parameter is for */
  description: string
  /** Example value */
  example?: string
}

export interface PromptSlideoutProps {
  /** Whether the slideout is open */
  isOpen: boolean
  /** Called when the slideout should close */
  onClose: () => void
  /** Title for the prompt */
  title?: string
  /** Description of what this prompt does */
  description?: string
  /** TLDR/grounding info for the user - displayed prominently at top */
  info: string
  /** Parameters in man-page style */
  params?: PromptParam[]
  /** Starter template with {VARIABLE} placeholders */
  starterTemplate: string
  /** In-context learning examples (code blocks with good/bad examples) */
  examples?: string
  /** Expected output format description */
  expectedOutput?: string
  /** Additional CSS classes */
  className?: string
}

// Syntax highlight code
function highlightCode(code: string): string {
  try {
    return hljs.highlight(code.trim(), { language: 'json' }).value
  } catch {
    return code
  }
}

// Highlighted textarea that colors {VARIABLES}
function HighlightedTextarea({
  value,
  onChange
}: {
  value: string
  onChange: (value: string) => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  // Sync scroll between textarea and highlight overlay
  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  // Highlight {VARIABLES} in the text
  const highlightedHtml = value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{([A-Z_]+)\}/g, '<span style="color: #c45a2c; font-weight: 600;">{$1}</span>')
    .replace(/\n/g, '<br>')

  return (
    <div style={{ position: 'relative' }}>
      {/* Highlight overlay */}
      <div
        ref={highlightRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: '1rem',
          pointerEvents: 'none',
          overflow: 'hidden',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
          fontSize: '0.8125rem',
          fontWeight: 400,
          lineHeight: 1.5,
          color: '#2e3538',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
      {/* Actual textarea (transparent text) */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        style={{
          width: '100%',
          minHeight: '220px',
          padding: '1rem',
          borderRadius: '0.625rem',
          border: '1px solid rgba(16, 21, 24, 0.12)',
          background: 'white',
          color: 'transparent',
          caretColor: '#2e3538',
          fontSize: '0.8125rem',
          fontWeight: 400,
          lineHeight: 1.5,
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
          transition: 'border-color 150ms, box-shadow 150ms',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'rgba(240, 124, 79, 0.4)'
          e.target.style.boxShadow = '0 0 0 3px rgba(240, 124, 79, 0.08)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(16, 21, 24, 0.12)'
          e.target.style.boxShadow = 'none'
        }}
      />
    </div>
  )
}

// Code block component with traffic light header - warm theme
function CodeBlock({ code, filename }: { code: string; filename: string }) {
  return (
    <div
      style={{
        borderRadius: '0.75rem',
        overflow: 'hidden',
        background: '#fefdfb',
        border: '1px solid rgba(16, 21, 24, 0.1)',
      }}
    >
      {/* Header with traffic lights */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.625rem 1rem',
          background: 'rgba(240, 124, 79, 0.06)',
          borderBottom: '1px solid rgba(16, 21, 24, 0.08)',
        }}
      >
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27ca40' }} />
        </div>
        <span style={{ fontSize: '0.6875rem', color: '#8b9298', fontWeight: 500 }}>{filename}</span>
      </div>
      {/* Code content */}
      <pre style={{
        margin: 0,
        padding: '1rem',
        overflow: 'auto',
        maxHeight: '280px',
      }}>
        <code
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
            fontSize: '0.8125rem',
            lineHeight: 1.5,
            color: '#2e3538',
          }}
          dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
        />
      </pre>
    </div>
  )
}

/**
 * PromptSlideout - Agent briefing panel
 *
 * Structure:
 * 1. Info box - grounding TLDR
 * 2. Parameters - man-page style variable definitions
 * 3. User request - editable textarea with starter template
 * 4. System context - collapsible examples + expected output
 */
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
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [userRequest, setUserRequest] = useState('')
  const [contextExpanded, setContextExpanded] = useState(false)
  const [width, setWidth] = useState(720)
  const isResizing = useRef(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Initialize with starter template when opening
  useEffect(() => {
    if (isOpen) {
      setUserRequest(starterTemplate)
      setContextExpanded(false)
    }
  }, [isOpen, starterTemplate])

  // Handle open/close animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      })
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Resize handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isResizing.current = true
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      const newWidth = window.innerWidth - e.clientX
      setWidth(Math.max(480, Math.min(1200, newWidth)))
    }

    const handleMouseUp = () => {
      isResizing.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // Build the full prompt for copying
  const getFullPrompt = useCallback(() => {
    let prompt = userRequest.trim()

    // Add system context if expanded sections exist
    if (examples || expectedOutput) {
      prompt += '\n\n---\n\n'
      if (examples) {
        prompt += '## Reference Examples\n\n```json\n' + examples.trim() + '\n```\n\n'
      }
      if (expectedOutput) {
        prompt += '## Expected Output\n\n' + expectedOutput
      }
    }

    return prompt
  }, [userRequest, examples, expectedOutput])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getFullPrompt())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isVisible) return null

  const hasSystemContext = examples || expectedOutput

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(16, 21, 24, 0.4)',
          backdropFilter: 'blur(8px)',
          zIndex: 999,
          opacity: isAnimating ? 1 : 0,
          transition: 'opacity 300ms ease-out',
        }}
      />

      {/* Slideout Panel */}
      <div
        ref={panelRef}
        className={`dw-prompt-slideout ${className}`}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: `${width}px`,
          maxWidth: '90vw',
          background: '#faf9f7',
          boxShadow: '-4px 0 24px rgba(16, 21, 24, 0.12)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
          transition: isResizing.current ? 'none' : 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Resize Handle */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '12px',
            cursor: 'ew-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            transition: 'background 150ms',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 21, 24, 0.04)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <GripVertical size={12} style={{ color: '#8b9298', opacity: 0.6 }} />
        </div>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem 1.25rem 2rem',
            borderBottom: '1px solid rgba(16, 21, 24, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '0.625rem',
                background: 'linear-gradient(135deg, rgba(240, 124, 79, 0.12) 0%, rgba(240, 124, 79, 0.06) 100%)',
                color: '#f07c4f',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '1.0625rem',
                fontWeight: 600,
                color: '#101518',
                fontFamily: "'Fraunces', serif",
              }}>
                {title}
              </h2>
              {description && (
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#5c676c', marginTop: '0.125rem' }}>
                  {description}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2rem',
              height: '2rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'transparent',
              color: '#5c676c',
              cursor: 'pointer',
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 21, 24, 0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem 1.5rem 1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Info Box - Grounding TLDR */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              padding: '1rem 1.25rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, rgba(240, 124, 79, 0.08) 0%, rgba(240, 124, 79, 0.03) 100%)',
              border: '1px solid rgba(240, 124, 79, 0.15)',
            }}
          >
            <Info size={18} style={{ color: '#f07c4f', flexShrink: 0, marginTop: '2px' }} />
            <p style={{
              margin: 0,
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              color: '#2e3538',
            }}>
              {info}
            </p>
          </div>

          {/* Parameters - Clean grid layout */}
          {params.length > 0 && (
            <div>
              <h3 style={{
                margin: '0 0 0.75rem 0',
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#8b9298',
              }}>
                Parameters
              </h3>
              <div
                style={{
                  display: 'grid',
                  gap: '0.625rem',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.625rem',
                  background: 'rgba(16, 21, 24, 0.02)',
                  border: '1px solid rgba(16, 21, 24, 0.08)',
                }}
              >
                {params.map((param, i) => (
                  <div key={i} style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: '0.75rem',
                    alignItems: 'start',
                  }}>
                    <code style={{
                      padding: '0.25rem 0.625rem',
                      borderRadius: '0.375rem',
                      background: 'rgba(240, 124, 79, 0.1)',
                      color: '#c45a2c',
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                      whiteSpace: 'nowrap',
                    }}>
                      {'{' + param.name + '}'}
                    </code>
                    <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                      <span style={{ color: '#2e3538' }}>{param.description}</span>
                      {param.example && (
                        <span style={{ color: '#8b9298', marginLeft: '0.5rem' }}>
                          — <em>e.g., "{param.example}"</em>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Template - Editable with starter template */}
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <h3 style={{
                margin: 0,
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#8b9298',
              }}>
                Prompt Template
              </h3>
              {hasSystemContext && !contextExpanded && (
                <p style={{
                  margin: '0.375rem 0 0 0',
                  fontSize: '0.75rem',
                  color: '#8b9298',
                }}>
                  Reference context below will be included when you copy
                </p>
              )}
            </div>
            <HighlightedTextarea
              value={userRequest}
              onChange={setUserRequest}
            />
          </div>

          {/* System Context - Collapsible */}
          {hasSystemContext && (
            <div>
              <button
                onClick={() => setContextExpanded(!contextExpanded)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                {contextExpanded ? (
                  <ChevronDown size={14} style={{ color: '#5c676c' }} />
                ) : (
                  <ChevronRight size={14} style={{ color: '#5c676c' }} />
                )}
                <h3 style={{
                  margin: 0,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#8b9298',
                }}>
                  Reference Context {contextExpanded ? '' : '(click to expand)'}
                </h3>
              </button>

              {/* Collapsed state - helpful info */}
              {!contextExpanded && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.625rem',
                    background: 'rgba(16, 21, 24, 0.02)',
                    border: '1px solid rgba(16, 21, 24, 0.06)',
                  }}
                >
                  <p style={{
                    margin: 0,
                    fontSize: '0.8125rem',
                    lineHeight: 1.5,
                    color: '#5c676c',
                  }}>
                    We'll automatically include examples and validation rules to help your AI understand Arc's config format and produce valid output.
                  </p>
                </div>
              )}

              {contextExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
                  {/* In-context examples */}
                  {examples && <CodeBlock code={examples} filename="examples.json" />}

                  {/* Expected output */}
                  {expectedOutput && <CodeBlock code={expectedOutput} filename="expected-output.txt" />}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem 1rem 2rem',
            borderTop: '1px solid rgba(16, 21, 24, 0.08)',
            background: 'rgba(16, 21, 24, 0.02)',
          }}
        >
          <p style={{
            margin: 0,
            fontSize: '0.75rem',
            color: '#8b9298',
          }}>
            {hasSystemContext && !contextExpanded
              ? 'Prompt + reference context will be copied'
              : 'Copy to paste into your AI assistant'
            }
          </p>
          <button
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: copied ? '#10b981' : '#f07c4f',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => {
              if (!copied) e.currentTarget.style.background = '#e86a3a'
            }}
            onMouseLeave={(e) => {
              if (!copied) e.currentTarget.style.background = '#f07c4f'
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Prompt'}
          </button>
        </div>
      </div>
    </>
  )
}

export default PromptSlideout
