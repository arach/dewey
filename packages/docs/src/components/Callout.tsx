import React from 'react'
import { Info, AlertTriangle, Lightbulb, AlertCircle, type LucideIcon } from 'lucide-react'

export type CalloutType = 'info' | 'warning' | 'tip' | 'danger'

export interface CalloutProps {
  type?: CalloutType
  title?: string
  children: React.ReactNode
}

const calloutStyles: Record<CalloutType, { icon: LucideIcon; token: string }> = {
  info: { icon: Info, token: 'info' },
  warning: { icon: AlertTriangle, token: 'warning' },
  tip: { icon: Lightbulb, token: 'success' },
  danger: { icon: AlertCircle, token: 'error' },
}

const defaultTitles: Record<CalloutType, string> = {
  info: 'Note',
  warning: 'Warning',
  tip: 'Tip',
  danger: 'Danger',
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const style = calloutStyles[type]
  const Icon = style.icon
  const displayTitle = title ?? defaultTitles[type]

  return (
    <div
      className={`dw-callout dw-callout-${style.token}`}
    >
      <div className="dw-callout-inner">
        <Icon className="dw-callout-icon" aria-hidden="true" />
        <div className="dw-callout-content">
          {displayTitle && (
            <div className="dw-callout-title">
              {displayTitle}
            </div>
          )}
          <div className="dw-callout-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Callout
