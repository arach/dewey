import { useState, useCallback, useEffect, useRef, type CSSProperties } from 'react'
import { Copy, Check, Bot, X, ChevronDown } from 'lucide-react'

export interface CopyButtonsProps {
  /** Human-readable markdown content */
  markdownContent: string
  /** Agent-optimized content (dense, structured) */
  agentContent?: string
  /** Show labels on buttons */
  showLabels?: boolean
  /** Callback when content is copied */
  onCopy?: (type: 'markdown' | 'agent' | 'plain') => void
  /** Additional CSS classes */
  className?: string
}

type CopyType = 'markdown' | 'agent' | 'plain' | null

interface CopyFeedback {
  type: CopyType
  preview: string
  charCount: number
}

/** Strip markdown syntax to plain text */
function stripMarkdown(md: string): string {
  return md
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove links, keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove horizontal rules
    .replace(/^---+$/gm, '')
    // Remove list markers
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * CopyButtons - Copy actions for docs pages with feedback tray
 *
 * - Copy for AI: Dense, structured content for AI assistants
 * - Copy: Dropdown with plain text / markdown options
 */
export function CopyButtons({
  markdownContent,
  agentContent,
  showLabels = true,
  onCopy,
  className = '',
}: CopyButtonsProps) {
  const [feedback, setFeedback] = useState<CopyFeedback | null>(null)
  const [copyMenuOpen, setCopyMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleCopy = useCallback(async (type: CopyType, content: string) => {
    if (!content || !type) return

    try {
      await navigator.clipboard.writeText(content)

      // Create preview (first 150 chars, trimmed)
      const preview = content.slice(0, 150).trim() + (content.length > 150 ? '...' : '')

      setFeedback({
        type,
        preview,
        charCount: content.length,
      })

      onCopy?.(type)
      setCopyMenuOpen(false)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [onCopy])

  const dismissFeedback = useCallback(() => {
    setFeedback(null)
  }, [])

  // Auto-dismiss feedback after 4 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  // Close menu when clicking outside
  useEffect(() => {
    if (!copyMenuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setCopyMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [copyMenuOpen])

  const buttonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    transition: 'all 150ms',
    color: 'var(--color-dw-muted-foreground, #5c676c)',
    border: '1px solid var(--color-dw-border, rgba(16, 21, 24, 0.12))',
    background: 'var(--color-dw-card, rgba(255,255,255,0.5))',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }

  const iconSize = 14

  const getFeedbackLabel = () => {
    if (!feedback) return null
    switch (feedback.type) {
      case 'agent': return 'AI content copied'
      case 'markdown': return 'Markdown copied'
      case 'plain': return 'Plain text copied'
      default: return 'Copied'
    }
  }

  return (
    <div className={`dw-copy-buttons ${className}`} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Copy for AI (agent content) */}
        {agentContent && (
          <button
            onClick={() => handleCopy('agent', agentContent)}
            style={buttonStyle}
            title="Copy AI-optimized content for LLMs and coding assistants"
          >
            {feedback?.type === 'agent' ? (
              <Check size={iconSize} style={{ color: 'var(--color-dw-success, #10b981)' }} />
            ) : (
              <Bot size={iconSize} />
            )}
            {showLabels && <span>{feedback?.type === 'agent' ? 'Copied!' : 'Copy for AI'}</span>}
          </button>
        )}

        {/* Copy dropdown */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setCopyMenuOpen(!copyMenuOpen)}
            style={buttonStyle}
            title="Copy page content"
          >
            {feedback?.type === 'markdown' || feedback?.type === 'plain' ? (
              <Check size={iconSize} style={{ color: 'var(--color-dw-success, #10b981)' }} />
            ) : (
              <Copy size={iconSize} />
            )}
            {showLabels && (
              <>
                <span>{feedback?.type === 'markdown' || feedback?.type === 'plain' ? 'Copied!' : 'Copy'}</span>
                <ChevronDown size={12} style={{ marginLeft: '-2px' }} />
              </>
            )}
          </button>

          {/* Dropdown menu */}
          {copyMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                background: 'white',
                border: '1px solid rgba(16, 21, 24, 0.12)',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 12px rgba(16, 21, 24, 0.1)',
                overflow: 'hidden',
                zIndex: 50,
                minWidth: '140px',
              }}
            >
              <button
                onClick={() => handleCopy('plain', stripMarkdown(markdownContent))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#374151',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 21, 24, 0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Plain text
              </button>
              <button
                onClick={() => handleCopy('markdown', markdownContent)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#374151',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 21, 24, 0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Markdown
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Tray */}
      {feedback && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            right: 0,
            width: '320px',
            background: 'white',
            border: '1px solid rgba(16, 21, 24, 0.12)',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 40px rgba(16, 21, 24, 0.15)',
            overflow: 'hidden',
            zIndex: 50,
            animation: 'slideDown 150ms ease-out',
          }}
        >
          {/* Tray Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.625rem 0.875rem',
              background: 'rgba(16, 185, 129, 0.08)',
              borderBottom: '1px solid rgba(16, 185, 129, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Check size={14} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#065f46' }}>
                {getFeedbackLabel()}
              </span>
            </div>
            <button
              onClick={dismissFeedback}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '1.25rem',
                height: '1.25rem',
                border: 'none',
                background: 'transparent',
                color: '#5c676c',
                cursor: 'pointer',
                borderRadius: '0.25rem',
              }}
            >
              <X size={12} />
            </button>
          </div>

          {/* Tray Content */}
          <div style={{ padding: '0.75rem 0.875rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#5c676c',
                lineHeight: 1.5,
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                background: 'rgba(16, 21, 24, 0.03)',
                padding: '0.5rem 0.625rem',
                borderRadius: '0.375rem',
                maxHeight: '4.5rem',
                overflow: 'hidden',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {feedback.preview}
            </div>
            <div
              style={{
                marginTop: '0.5rem',
                fontSize: '0.6875rem',
                color: '#9ca3af',
              }}
            >
              {feedback.charCount.toLocaleString()} characters copied to clipboard
            </div>
          </div>
        </div>
      )}

      {/* Keyframe animation */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default CopyButtons
