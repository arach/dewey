import { useState, useEffect, useCallback } from 'react'
import { X, Copy, Check, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export interface PromptMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface PromptVariable {
  name: string
  description: string
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
  /** The prompt content - can be a string or structured messages */
  prompt: string | PromptMessage[]
  /** Optional variables that can be filled in */
  variables?: PromptVariable[]
  /** Additional CSS classes */
  className?: string
}

/**
 * PromptSlideout - Polished prompt reference panel
 *
 * Features:
 * - System context rendered as beautiful markdown
 * - Variables documented (not editable - just reference)
 * - Prompt with syntax highlighting for {VARIABLE} tokens
 * - Quick copy for the prompt
 */
export function PromptSlideout({
  isOpen,
  onClose,
  title = 'AI Prompt',
  description,
  prompt,
  variables = [],
  className = '',
}: PromptSlideoutProps) {
  const [copied, setCopied] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Parse prompt into messages if it's a string
  const messages: PromptMessage[] = typeof prompt === 'string'
    ? [{ role: 'user', content: prompt }]
    : prompt

  // Get system message and user message separately
  const systemMessage = messages.find(m => m.role === 'system')
  const userMessage = messages.find(m => m.role === 'user')

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

  // Get the raw prompt for copying
  const getPromptForCopy = useCallback(() => {
    return userMessage?.content.trim() || ''
  }, [userMessage])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getPromptForCopy())
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

  // Render prompt with syntax highlighting for {VARIABLE} tokens
  const renderPromptWithHighlighting = (content: string) => {
    // Split on variable patterns
    const parts = content.split(/(\{[A-Z_]+\})/g)

    return parts.map((part, i) => {
      const match = part.match(/^\{([A-Z_]+)\}$/)
      if (match) {
        return (
          <span
            key={i}
            style={{
              color: '#f07c4f',
              fontWeight: 600,
            }}
          >
            {part}
          </span>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

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
        className={`dw-prompt-slideout ${className}`}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '600px',
          background: '#faf9f7',
          boxShadow: '-4px 0 24px rgba(16, 21, 24, 0.12)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
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
        <div style={{ flex: 1, overflow: 'auto' }}>

          {/* System Context - Rendered Markdown */}
          {systemMessage && (
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid rgba(16, 21, 24, 0.08)',
                background: 'rgba(16, 21, 24, 0.02)',
              }}
            >
              <h3 style={{
                margin: '0 0 1rem 0',
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#8b9298',
              }}>
                Context
              </h3>
              <div
                className="dw-prompt-context"
                style={{
                  fontSize: '0.875rem',
                  lineHeight: 1.65,
                  color: '#2e3538',
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Compact styling for the slideout
                    h1: ({ children }) => (
                      <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#101518' }}>
                        {children}
                      </h4>
                    ),
                    h2: ({ children }) => (
                      <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#101518' }}>
                        {children}
                      </h4>
                    ),
                    h3: ({ children }) => (
                      <h5 style={{ margin: '0.75rem 0 0.375rem', fontSize: '0.8125rem', fontWeight: 600, color: '#101518' }}>
                        {children}
                      </h5>
                    ),
                    p: ({ children }) => (
                      <p style={{ margin: '0 0 0.75rem', color: '#2e3538' }}>{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', listStyleType: 'disc' }}>{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li style={{ margin: '0.25rem 0', color: '#2e3538' }}>{children}</li>
                    ),
                    code: ({ children, className }) => {
                      const isBlock = className?.includes('language-')
                      if (isBlock) {
                        return (
                          <pre style={{
                            margin: '0.75rem 0',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            background: 'rgba(16, 21, 24, 0.04)',
                            border: '1px solid rgba(16, 21, 24, 0.08)',
                            overflow: 'auto',
                            fontSize: '0.8125rem',
                            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                          }}>
                            <code style={{ color: '#101518' }}>{children}</code>
                          </pre>
                        )
                      }
                      return (
                        <code style={{
                          padding: '0.125rem 0.375rem',
                          borderRadius: '0.25rem',
                          background: 'rgba(16, 21, 24, 0.06)',
                          fontSize: '0.8125rem',
                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                          color: '#101518',
                        }}>
                          {children}
                        </code>
                      )
                    },
                    pre: ({ children }) => <>{children}</>,
                    strong: ({ children }) => (
                      <strong style={{ fontWeight: 600, color: '#101518' }}>{children}</strong>
                    ),
                    table: ({ children }) => (
                      <table style={{
                        width: '100%',
                        margin: '0.75rem 0',
                        borderCollapse: 'collapse',
                        fontSize: '0.8125rem',
                      }}>
                        {children}
                      </table>
                    ),
                    th: ({ children }) => (
                      <th style={{
                        padding: '0.5rem 0.75rem',
                        textAlign: 'left',
                        fontWeight: 600,
                        borderBottom: '1px solid rgba(16, 21, 24, 0.12)',
                        color: '#101518',
                      }}>
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td style={{
                        padding: '0.5rem 0.75rem',
                        borderBottom: '1px solid rgba(16, 21, 24, 0.06)',
                        color: '#2e3538',
                      }}>
                        {children}
                      </td>
                    ),
                  }}
                >
                  {systemMessage.content}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Variables Documentation */}
          {variables.length > 0 && (
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid rgba(16, 21, 24, 0.08)',
              }}
            >
              <h3 style={{
                margin: '0 0 1rem 0',
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#8b9298',
              }}>
                Variables
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {variables.map((variable) => (
                  <div
                    key={variable.name}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.75rem',
                    }}
                  >
                    <code
                      style={{
                        flexShrink: 0,
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        background: 'rgba(240, 124, 79, 0.1)',
                        color: '#f07c4f',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                      }}
                    >
                      {`{${variable.name}}`}
                    </code>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.8125rem', color: '#2e3538' }}>
                        {variable.description}
                      </span>
                      {variable.example && (
                        <span style={{ fontSize: '0.75rem', color: '#8b9298', marginLeft: '0.5rem' }}>
                          e.g., {variable.example}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt with Syntax Highlighting */}
          {userMessage && (
            <div style={{ padding: '1.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}>
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
                <button
                  onClick={handleCopy}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    background: copied ? '#10b981' : '#f07c4f',
                    color: 'white',
                    fontSize: '0.75rem',
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
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '0.625rem',
                  background: 'white',
                  border: '1px solid rgba(16, 21, 24, 0.1)',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                  fontSize: '0.8125rem',
                  lineHeight: 1.7,
                  color: '#2e3538',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {renderPromptWithHighlighting(userMessage.content)}
              </div>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(16, 21, 24, 0.06)',
            background: 'rgba(16, 21, 24, 0.02)',
          }}
        >
          <p style={{
            margin: 0,
            fontSize: '0.75rem',
            color: '#8b9298',
            textAlign: 'center',
          }}>
            Copy this prompt, fill in the variables, and paste into your AI assistant
          </p>
        </div>
      </div>
    </>
  )
}

export default PromptSlideout
