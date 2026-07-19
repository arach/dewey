import { useId, useState } from 'react'
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
  const contentId = useId()

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
    <div className={`dw-agent-context ${className}`}>
      {/* Header */}
      <button
        type="button"
        className="dw-agent-context-toggle"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={contentId}
      >
        <div className="dw-agent-context-heading">
          <Bot className="dw-agent-context-icon" aria-hidden="true" />
          <span className="dw-agent-context-title">{title}</span>
          <span className="dw-agent-context-hint">
            Copy this into your AI assistant
          </span>
        </div>
        {expanded ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div id={contentId} className="dw-agent-context-content">
          {/* Copy button */}
          <div className="dw-agent-context-actions">
            <button
              type="button"
              className="dw-agent-context-copy"
              onClick={handleCopy}
            >
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              <span aria-live="polite">{copied ? 'Copied!' : 'Copy All'}</span>
            </button>
          </div>

          {/* Content */}
          <pre className="dw-agent-context-pre">
            {content}
          </pre>
        </div>
      )}
    </div>
  )
}

export default AgentContext
