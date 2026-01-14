import React from 'react'
import { Info, AlertTriangle, Lightbulb, AlertCircle, type LucideIcon } from 'lucide-react'

export type CalloutType = 'info' | 'warning' | 'tip' | 'danger'

export interface CalloutProps {
  type?: CalloutType
  title?: string
  children: React.ReactNode
}

const calloutStyles: Record<CalloutType, {
  icon: LucideIcon
  bg: string
  border: string
  iconColor: string
  titleColor: string
}> = {
  info: {
    icon: Info,
    bg: 'rgba(59, 130, 246, 0.08)',
    border: 'rgba(59, 130, 246, 0.3)',
    iconColor: '#3b82f6',
    titleColor: '#2563eb',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.3)',
    iconColor: '#f59e0b',
    titleColor: '#d97706',
  },
  tip: {
    icon: Lightbulb,
    bg: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.3)',
    iconColor: '#10b981',
    titleColor: '#059669',
  },
  danger: {
    icon: AlertCircle,
    bg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.3)',
    iconColor: '#ef4444',
    titleColor: '#dc2626',
  },
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
      className="rounded-xl my-5 overflow-hidden"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
      }}
    >
      <div className="px-4 py-3 flex gap-3">
        <Icon
          className="w-5 h-5 flex-shrink-0 mt-0.5"
          style={{ color: style.iconColor }}
        />
        <div className="flex-1 min-w-0">
          {displayTitle && (
            <div
              className="font-semibold text-[14px] mb-1"
              style={{ color: style.titleColor }}
            >
              {displayTitle}
            </div>
          )}
          <div className="text-[14px] leading-relaxed" style={{ color: '#374151' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Callout
