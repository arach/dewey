import React from 'react'
import { ArrowRight, type LucideIcon } from 'lucide-react'

export interface CardProps {
  title: string
  description?: string
  icon?: LucideIcon
  href?: string
  children?: React.ReactNode
}

export interface CardGridProps {
  columns?: 2 | 3 | 4
  children: React.ReactNode
}

export function Card({ title, description, icon: Icon, href, children }: CardProps) {
  const content = (
    <div className="dw-card-content">
      {Icon && (
        <div className="dw-card-icon-box">
          <Icon aria-hidden="true" />
        </div>
      )}
      <h3 className="dw-card-title">
        {title}
      </h3>
      {description && (
        <p className="dw-card-description">
          {description}
        </p>
      )}
      {children && (
        <div className="dw-card-description">
          {children}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <a
        href={href}
        className="dw-card"
      >
        {content}
        <ArrowRight className="dw-card-arrow" aria-hidden="true" />
      </a>
    )
  }

  return (
    <div className="dw-card">
      {content}
    </div>
  )
}

export function CardGrid({ columns = 2, children }: CardGridProps) {
  return (
    <div className="dw-card-grid" data-columns={columns}>
      {children}
    </div>
  )
}

export default Card
