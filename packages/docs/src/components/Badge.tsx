
export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'

export interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
}

const variantStyles: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  default: {
    bg: 'rgba(107, 114, 128, 0.1)',
    color: '#4b5563',
    border: 'rgba(107, 114, 128, 0.2)',
  },
  success: {
    bg: 'rgba(16, 185, 129, 0.1)',
    color: '#059669',
    border: 'rgba(16, 185, 129, 0.2)',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.1)',
    color: '#d97706',
    border: 'rgba(245, 158, 11, 0.2)',
  },
  danger: {
    bg: 'rgba(239, 68, 68, 0.1)',
    color: '#dc2626',
    border: 'rgba(239, 68, 68, 0.2)',
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.1)',
    color: '#2563eb',
    border: 'rgba(59, 130, 246, 0.2)',
  },
  purple: {
    bg: 'rgba(139, 92, 246, 0.1)',
    color: '#7c3aed',
    border: 'rgba(139, 92, 246, 0.2)',
  },
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const style = variantStyles[variant]
  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-[11px] px-2 py-1'

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses}`}
      style={{
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    >
      {children}
    </span>
  )
}

export default Badge
