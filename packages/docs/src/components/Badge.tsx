
export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'

export interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
}

const variantTokens: Record<BadgeVariant, string> = {
  default: 'default',
  success: 'success',
  warning: 'warning',
  danger: 'error',
  info: 'info',
  purple: 'primary',
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span className={`dw-badge dw-badge-${variantTokens[variant]} dw-badge-${size}`}>
      {children}
    </span>
  )
}

export default Badge
