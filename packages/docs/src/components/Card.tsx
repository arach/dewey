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
    <>
      {Icon && (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
          style={{ background: 'rgba(240, 124, 79, 0.1)' }}
        >
          <Icon className="w-5 h-5" style={{ color: '#f07c4f' }} />
        </div>
      )}
      <h3
        className="font-semibold text-[15px] mb-1"
        style={{ color: '#101518' }}
      >
        {title}
        {href && (
          <ArrowRight
            className="w-4 h-4 inline-block ml-1 transition-transform group-hover:translate-x-0.5"
            style={{ color: '#9ca3af' }}
          />
        )}
      </h3>
      {description && (
        <p className="text-[13px] leading-relaxed" style={{ color: '#5c676c' }}>
          {description}
        </p>
      )}
      {children && (
        <div className="text-[13px] leading-relaxed mt-2" style={{ color: '#5c676c' }}>
          {children}
        </div>
      )}
    </>
  )

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    border: '1px solid rgba(16, 21, 24, 0.1)',
    backdropFilter: 'blur(8px)',
  }

  if (href) {
    return (
      <a
        href={href}
        className="block rounded-xl p-5 transition-all hover:shadow-md hover:border-orange-200 group"
        style={cardStyle}
      >
        {content}
      </a>
    )
  }

  return (
    <div className="rounded-xl p-5" style={cardStyle}>
      {content}
    </div>
  )
}

export function CardGrid({ columns = 2, children }: CardGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4 my-5`}>
      {children}
    </div>
  )
}

export default Card
