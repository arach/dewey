import { useState, useCallback, type CSSProperties } from 'react'
import { Copy, Check, Bot, Sparkles } from 'lucide-react'

export interface CopyButtonsProps {
  /** Human-readable markdown content */
  markdownContent: string
  /** Agent-optimized content (dense, structured) */
  agentContent?: string
  /** Pre-written prompt template */
  promptContent?: string
  /** Show labels on buttons */
  showLabels?: boolean
  /** Callback when content is copied */
  onCopy?: (type: 'markdown' | 'agent' | 'prompt') => void
  /** Additional CSS classes */
  className?: string
}

type CopyType = 'markdown' | 'agent' | 'prompt' | null

/**
 * CopyButtons - Three copy actions for docs pages
 *
 * - Copy Markdown: Human-readable content for sharing
 * - Copy for Agent: Dense, structured content for AI assistants
 * - Get Prompt: Pre-written prompt template for common tasks
 */
export function CopyButtons({
  markdownContent,
  agentContent,
  promptContent,
  showLabels = true,
  onCopy,
  className = '',
}: CopyButtonsProps) {
  const [copied, setCopied] = useState<CopyType>(null)

  const handleCopy = useCallback(async (type: CopyType, content: string) => {
    if (!content) return

    try {
      await navigator.clipboard.writeText(content)
      setCopied(type)
      onCopy?.(type as 'markdown' | 'agent' | 'prompt')
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [onCopy])

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
  }

  const iconSize = 14

  return (
    <div className={`dw-copy-buttons flex items-center gap-2 ${className}`}>
      {/* Copy Markdown */}
      <button
        onClick={() => handleCopy('markdown', markdownContent)}
        style={buttonStyle}
        title="Copy markdown for sharing"
      >
        {copied === 'markdown' ? (
          <Check size={iconSize} style={{ color: 'var(--color-dw-success, #10b981)' }} />
        ) : (
          <Copy size={iconSize} />
        )}
        {showLabels && <span>{copied === 'markdown' ? 'Copied' : 'Copy'}</span>}
      </button>

      {/* Copy for Agent */}
      {agentContent && (
        <button
          onClick={() => handleCopy('agent', agentContent)}
          style={buttonStyle}
          title="Copy agent-optimized content for AI assistants"
        >
          {copied === 'agent' ? (
            <Check size={iconSize} style={{ color: 'var(--color-dw-success, #10b981)' }} />
          ) : (
            <Bot size={iconSize} />
          )}
          {showLabels && <span>{copied === 'agent' ? 'Copied' : 'Agent'}</span>}
        </button>
      )}

      {/* Get Prompt */}
      {promptContent && (
        <button
          onClick={() => handleCopy('prompt', promptContent)}
          style={buttonStyle}
          title="Copy prompt template for this topic"
        >
          {copied === 'prompt' ? (
            <Check size={iconSize} style={{ color: 'var(--color-dw-success, #10b981)' }} />
          ) : (
            <Sparkles size={iconSize} />
          )}
          {showLabels && <span>{copied === 'prompt' ? 'Copied' : 'Prompt'}</span>}
        </button>
      )}
    </div>
  )
}

export default CopyButtons
