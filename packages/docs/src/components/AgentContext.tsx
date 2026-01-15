import { useState } from 'react'
import { Bot, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'

export interface AgentContextProps {
  /** The agent-optimized content to display */
  content: string
  /** Title for the block */
  title?: string
  /** Whether to start expanded */
  defaultExpanded?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * AgentContext - Collapsible block for agent-optimized content
 *
 * Displays a condensed, structured version of documentation
 * optimized for AI assistants to consume.
 */
export function AgentContext({
  content,
  title = 'Agent Context',
  defaultExpanded = false,
  className = '',
}: AgentContextProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div
      className={`dw-agent-context ${className}`}
      style={{
        marginTop: '1.5rem',
        marginBottom: '1.5rem',
        borderRadius: '0.75rem',
        border: '1px solid var(--color-dw-border, rgba(16, 21, 24, 0.12))',
        background: 'var(--color-dw-muted, rgba(0,0,0,0.02))',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-dw-foreground, #101518)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bot size={16} style={{ color: 'var(--color-dw-primary, #f07c4f)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{title}</span>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-dw-muted-foreground, #5c676c)',
            }}
          >
            Copy this into your AI assistant
          </span>
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--color-dw-border, rgba(16, 21, 24, 0.12))' }}>
          {/* Copy button */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '0.5rem 1rem',
              background: 'var(--color-dw-card, rgba(255,255,255,0.5))',
            }}
          >
            <button
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.25rem 0.625rem',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--color-dw-muted-foreground, #5c676c)',
                border: '1px solid var(--color-dw-border, rgba(16, 21, 24, 0.12))',
                background: 'var(--color-dw-background, white)',
                cursor: 'pointer',
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy All'}
            </button>
          </div>

          {/* Content */}
          <pre
            style={{
              margin: 0,
              padding: '1rem',
              fontSize: '0.8125rem',
              lineHeight: 1.6,
              overflow: 'auto',
              maxHeight: '400px',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
              color: 'var(--color-dw-foreground, #101518)',
              background: 'var(--color-dw-card, rgba(255,255,255,0.5))',
            }}
          >
            {content}
          </pre>
        </div>
      )}
    </div>
  )
}

export default AgentContext
