import { useState, useEffect, useCallback, useMemo } from 'react'
import { X, Copy, Check, Sparkles, Info } from 'lucide-react'

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
 * PromptSlideout - Warm, polished prompt editor panel
 *
 * Features:
 * - System context as collapsible reference
 * - Variables section with input fields
 * - Editable prompt textarea with live variable substitution
 * - Quick copy for the final prompt
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
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [editedPrompt, setEditedPrompt] = useState('')
  const [showSystemContext, setShowSystemContext] = useState(false)

  // Parse prompt into messages if it's a string
  const messages: PromptMessage[] = useMemo(() =>
    typeof prompt === 'string'
      ? [{ role: 'user', content: prompt }]
      : prompt
  , [prompt])

  // Get system message and user message separately
  const systemMessage = messages.find(m => m.role === 'system')
  const userMessage = messages.find(m => m.role === 'user')

  // Initialize edited prompt when opening
  useEffect(() => {
    if (isOpen && userMessage) {
      setEditedPrompt(userMessage.content)
    }
  }, [isOpen, userMessage])

  // Initialize variable values
  useEffect(() => {
    const initial: Record<string, string> = {}
    variables.forEach(v => {
      initial[v.name] = variableValues[v.name] || ''
    })
    setVariableValues(initial)
  }, [variables])

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

  // Substitute variables in content
  const substituteVariables = useCallback((content: string) => {
    let result = content
    Object.entries(variableValues).forEach(([name, value]) => {
      if (value) {
        result = result.replace(new RegExp(`\\{${name}\\}`, 'g'), value)
        result = result.replace(new RegExp(`\\[${name}\\]`, 'g'), value)
      }
    })
    return result
  }, [variableValues])

  // Get the final prompt for copying (just the user prompt, substituted)
  const getFinalPrompt = useCallback(() => {
    return substituteVariables(editedPrompt).trim()
  }, [editedPrompt, substituteVariables])

  // Check for unfilled variables in the prompt
  const hasUnfilledVariables = useMemo(() => {
    const varPattern = /\{[A-Z_]+\}/g
    const matches = editedPrompt.match(varPattern) || []
    return matches.some(match => {
      const varName = match.slice(1, -1)
      const value = variableValues[varName]
      return !value || value.trim().length === 0
    })
  }, [editedPrompt, variableValues])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getFinalPrompt())
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
          maxWidth: '560px',
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
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>

          {/* System Context - Collapsible */}
          {systemMessage && (
            <div style={{ marginBottom: '1.5rem' }}>
              <button
                onClick={() => setShowSystemContext(!showSystemContext)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.875rem',
                  width: '100%',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(16, 21, 24, 0.08)',
                  background: 'rgba(16, 21, 24, 0.02)',
                  color: '#5c676c',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 150ms',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 21, 24, 0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16, 21, 24, 0.02)'}
              >
                <Info size={14} />
                <span>System Context</span>
                <span style={{ marginLeft: 'auto', opacity: 0.6 }}>
                  {showSystemContext ? '−' : '+'}
                </span>
              </button>

              {showSystemContext && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(16, 21, 24, 0.03)',
                    border: '1px solid rgba(16, 21, 24, 0.06)',
                    fontSize: '0.8125rem',
                    lineHeight: 1.6,
                    color: '#5c676c',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {systemMessage.content}
                </div>
              )}
            </div>
          )}

          {/* Variables Section */}
          {variables.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                margin: '0 0 0.75rem 0',
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#8b9298'
              }}>
                Variables
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {variables.map((variable) => (
                  <div key={variable.name}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.5rem',
                      marginBottom: '0.375rem'
                    }}>
                      <code
                        style={{
                          fontSize: '0.75rem',
                          color: '#f07c4f',
                          fontWeight: 500,
                        }}
                      >
                        {`{${variable.name}}`}
                      </code>
                      <span style={{ fontSize: '0.75rem', color: '#8b9298' }}>
                        {variable.description}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={variableValues[variable.name] || ''}
                      onChange={(e) => setVariableValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
                      placeholder={variable.example || `Enter ${variable.name.toLowerCase().replace(/_/g, ' ')}`}
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.875rem',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(16, 21, 24, 0.12)',
                        background: 'white',
                        color: '#101518',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'border-color 150ms, box-shadow 150ms',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(240, 124, 79, 0.5)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(240, 124, 79, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(16, 21, 24, 0.12)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editable Prompt */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#8b9298'
              }}>
                Prompt
              </h3>
              {hasUnfilledVariables && (
                <span style={{
                  fontSize: '0.6875rem',
                  color: '#f07c4f',
                  fontWeight: 500,
                }}>
                  Fill variables above
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <textarea
                value={substituteVariables(editedPrompt)}
                onChange={(e) => {
                  // When editing, we need to reverse-substitute to preserve variable syntax
                  // For simplicity, just update the raw prompt
                  setEditedPrompt(e.target.value)
                }}
                style={{
                  width: '100%',
                  minHeight: '240px',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(16, 21, 24, 0.12)',
                  background: 'white',
                  color: '#101518',
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
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

              {/* Copy button inside textarea area */}
              <button
                onClick={handleCopy}
                style={{
                  position: 'absolute',
                  bottom: '0.75rem',
                  right: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 0.875rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: copied ? '#10b981' : '#f07c4f',
                  color: 'white',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 150ms, transform 100ms',
                  boxShadow: '0 2px 8px rgba(240, 124, 79, 0.25)',
                }}
                onMouseEnter={(e) => {
                  if (!copied) e.currentTarget.style.background = '#e86a3a'
                }}
                onMouseLeave={(e) => {
                  if (!copied) e.currentTarget.style.background = '#f07c4f'
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
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
            Edit the prompt above, then copy and paste into your AI assistant
          </p>
        </div>
      </div>
    </>
  )
}

export default PromptSlideout
