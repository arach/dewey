'use client'

import { useState } from 'react'

export interface StateFlowProps {
  /** Ordered list of state names */
  states: string[]
  /** States that represent terminal/end states (displayed with reduced opacity) */
  terminal?: string[]
  /** Custom color overrides per state name */
  colors?: Record<string, { bg: string; text: string; border: string }>
}

const DEFAULT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  open:      { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  pending:   { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  answered:  { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  active:    { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  working:   { bg: '#fefce8', text: '#a16207', border: '#fde68a' },
  running:   { bg: '#fefce8', text: '#a16207', border: '#fde68a' },
  waiting:   { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  blocked:   { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  review:    { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
  done:      { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  complete:  { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  closed:    { bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb' },
  declined:  { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  error:     { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  failed:    { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  cancelled: { bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb' },
}

const FALLBACK_COLOR = { bg: '#f9fafb', text: '#374151', border: '#e5e7eb' }

export function StateFlow({ states, terminal = [], colors }: StateFlowProps) {
  const [active, setActive] = useState<string | null>(null)
  const palette = { ...DEFAULT_COLORS, ...colors }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.375rem', margin: '1rem 0' }}>
      {states.map((state, i) => {
        const key = state.toLowerCase()
        const isTerminal = terminal.some((t) => t.toLowerCase() === key)
        const c = palette[key] || FALLBACK_COLOR
        const isActive = active === state

        return (
          <span key={state} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <button
              type="button"
              onMouseEnter={() => setActive(state)}
              onMouseLeave={() => setActive(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '9999px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 500,
                fontFamily: 'var(--dewey-font-mono, ui-monospace, monospace)',
                background: c.bg,
                color: c.text,
                border: `1px solid ${c.border}`,
                opacity: isTerminal ? 0.75 : 1,
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 150ms',
                cursor: 'default',
                lineHeight: 1,
              }}
            >
              {state}
            </button>
            {i < states.length - 1 && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c4c0b8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            )}
          </span>
        )
      })}
    </div>
  )
}
