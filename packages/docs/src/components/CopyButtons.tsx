import { useState, useCallback, useEffect, useRef } from 'react'
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
    <div className={`dw-copy-buttons ${className}`}>
      <div className="dw-copy-buttons-row">
        {/* Copy for AI (agent content) */}
        {agentContent && (
          <button
            type="button"
            className="dw-copy-buttons-button"
            onClick={() => handleCopy('agent', agentContent)}
            title="Copy AI-optimized content for LLMs and coding assistants"
          >
            {feedback?.type === 'agent' ? (
              <Check className="dw-copy-buttons-success" aria-hidden="true" />
            ) : (
              <Bot aria-hidden="true" />
            )}
            {showLabels && <span>{feedback?.type === 'agent' ? 'Copied!' : 'Copy for AI'}</span>}
          </button>
        )}

        {/* Copy dropdown */}
        <div ref={menuRef} className="dw-copy-buttons-menu-wrap">
          <button
            type="button"
            className="dw-copy-buttons-button"
            onClick={() => setCopyMenuOpen(!copyMenuOpen)}
            aria-expanded={copyMenuOpen}
            aria-haspopup="menu"
            title="Copy page content"
          >
            {feedback?.type === 'markdown' || feedback?.type === 'plain' ? (
              <Check className="dw-copy-buttons-success" aria-hidden="true" />
            ) : (
              <Copy aria-hidden="true" />
            )}
            {showLabels && (
              <>
                <span>{feedback?.type === 'markdown' || feedback?.type === 'plain' ? 'Copied!' : 'Copy'}</span>
                <ChevronDown className="dw-copy-buttons-chevron" aria-hidden="true" />
              </>
            )}
          </button>

          {/* Dropdown menu */}
          {copyMenuOpen && (
            <div className="dw-copy-buttons-menu" role="menu">
              <button
                type="button"
                className="dw-copy-buttons-menu-item"
                role="menuitem"
                onClick={() => handleCopy('plain', stripMarkdown(markdownContent))}
              >
                Plain text
              </button>
              <button
                type="button"
                className="dw-copy-buttons-menu-item"
                role="menuitem"
                onClick={() => handleCopy('markdown', markdownContent)}
              >
                Markdown
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Tray */}
      {feedback && (
        <div className="dw-copy-buttons-feedback" role="status">
          {/* Tray Header */}
          <div className="dw-copy-buttons-feedback-header">
            <div className="dw-copy-buttons-feedback-heading">
              <Check aria-hidden="true" />
              <span>
                {getFeedbackLabel()}
              </span>
            </div>
            <button
              type="button"
              className="dw-copy-buttons-dismiss"
              onClick={dismissFeedback}
              aria-label="Dismiss copy confirmation"
            >
              <X aria-hidden="true" />
            </button>
          </div>

          {/* Tray Content */}
          <div className="dw-copy-buttons-feedback-body">
            <div className="dw-copy-buttons-preview">
              {feedback.preview}
            </div>
            <div className="dw-copy-buttons-count">
              {feedback.charCount.toLocaleString()} characters copied to clipboard
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CopyButtons
