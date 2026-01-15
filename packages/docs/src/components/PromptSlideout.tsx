import { useState, useEffect, useCallback, useMemo } from 'react'
import { X, Copy, Check, Sparkles, Bot, Play } from 'lucide-react'

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
 * PromptSlideout - Prompt editor/playground panel
 *
 * Features:
 * - System context rendered as markdown-like display
 * - Editable prompt with {VARIABLE} syntax highlighting
 * - Live variable substitution
 * - Code editor aesthetic
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

  // Initialize variable values with examples
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

  // Parse prompt into messages if it's a string
  const messages: PromptMessage[] = typeof prompt === 'string'
    ? [{ role: 'user', content: prompt }]
    : prompt

  // Get system message and user message separately
  const systemMessage = messages.find(m => m.role === 'system')
  const userMessage = messages.find(m => m.role === 'user')

  // Substitute variables in content
  const substituteVariables = useCallback((content: string) => {
    let result = content
    Object.entries(variableValues).forEach(([name, value]) => {
      if (value) {
        result = result.replace(new RegExp(`\\{${name}\\}`, 'g'), value)
        // Also handle [NAME] format for backwards compatibility
        result = result.replace(new RegExp(`\\[${name}\\]`, 'g'), value)
      }
    })
    return result
  }, [variableValues])

  // Get the final prompt for copying
  const getFinalPrompt = useCallback(() => {
    let result = ''
    if (systemMessage) {
      result += `[System Context]\n${systemMessage.content}\n\n`
    }
    if (userMessage) {
      result += substituteVariables(userMessage.content)
    }
    return result.trim()
  }, [systemMessage, userMessage, substituteVariables])

  // Check if all required variables are filled
  const allVariablesFilled = useMemo(() => {
    return variables.every(v => {
      const value = variableValues[v.name]
      return value && value.trim().length > 0
    })
  }, [variables, variableValues])

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

  // Render content with variable highlighting
  const renderWithVariables = (content: string) => {
    // Match both {VAR} and [VAR] patterns
    const parts = content.split(/(\{[A-Z_]+\}|\[[A-Z_]+\])/g)
    return parts.map((part, i) => {
      const match = part.match(/^\{([A-Z_]+)\}$/) || part.match(/^\[([A-Z_]+)\]$/)
      if (match) {
        const varName = match[1]
        const value = variableValues[varName]
        const hasValue = value && value.trim().length > 0

        return (
          <span
            key={i}
            style={{
              background: hasValue
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(240, 124, 79, 0.15)',
              color: hasValue
                ? 'rgb(16, 185, 129)'
                : 'var(--color-dw-primary, #f07c4f)',
              padding: '0.125rem 0.5rem',
              borderRadius: '0.25rem',
              fontWeight: 500,
            }}
          >
            {hasValue ? value : `{${varName}}`}
          </span>
        )
      }
      return part
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
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
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
          maxWidth: '720px',
          background: '#1a1a1a',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          color: '#e5e5e5',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: '#141414',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2rem',
                height: '2rem',
                borderRadius: '0.5rem',
                background: 'rgba(240, 124, 79, 0.15)',
                color: '#f07c4f',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
                {title}
              </h2>
              {description && (
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#888' }}>
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
              color: '#888',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>

          {/* System Context */}
          {systemMessage && (
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <Bot size={14} style={{ color: '#888' }} />
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>
                  System Context
                </span>
              </div>
              <div
                style={{
                  padding: '1rem 1.5rem',
                  fontSize: '0.8125rem',
                  lineHeight: 1.7,
                  color: '#aaa',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                  whiteSpace: 'pre-wrap',
                  background: 'rgba(0, 0, 0, 0.2)',
                }}
              >
                {systemMessage.content}
              </div>
            </div>
          )}

          {/* Prompt Editor */}
          {userMessage && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <Play size={14} style={{ color: '#f07c4f' }} />
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f07c4f' }}>
                  Prompt
                </span>
              </div>
              <div
                style={{
                  flex: 1,
                  padding: '1.25rem 1.5rem',
                  fontSize: '0.9375rem',
                  lineHeight: 1.8,
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                  whiteSpace: 'pre-wrap',
                  color: '#e5e5e5',
                  minHeight: '200px',
                }}
              >
                {renderWithVariables(userMessage.content)}
              </div>
            </div>
          )}

          {/* Variables Panel */}
          {variables.length > 0 && (
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                background: '#141414',
              }}
            >
              <div
                style={{
                  padding: '0.75rem 1.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>
                  Variables
                </span>
              </div>
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {variables.map((variable) => (
                  <div key={variable.name}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      <code
                        style={{
                          fontSize: '0.75rem',
                          color: '#f07c4f',
                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                        }}
                      >
                        {`{${variable.name}}`}
                      </code>
                      <span style={{ fontSize: '0.75rem', color: '#666' }}>
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
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: '#e5e5e5',
                        fontSize: '0.875rem',
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                        outline: 'none',
                        transition: 'border-color 150ms, background 150ms',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(240, 124, 79, 0.5)'
                        e.target.style.background = 'rgba(0, 0, 0, 0.5)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                        e.target.style.background = 'rgba(0, 0, 0, 0.3)'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: '#141414',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>
            {allVariablesFilled || variables.length === 0
              ? 'Ready to copy — paste into your AI assistant'
              : 'Fill in variables above to complete the prompt'}
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
