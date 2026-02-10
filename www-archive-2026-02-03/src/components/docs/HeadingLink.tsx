import { Link as LinkIcon } from 'lucide-react'

interface HeadingLinkProps {
  id: string
  size?: 'sm' | 'md' | 'lg'
}

export function HeadingLink({ id, size = 'md' }: HeadingLinkProps) {
  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }[size]

  return (
    <a
      href={`#${id}`}
      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2"
      style={{ color: '#9ca3af' }}
      title="Link to this section"
    >
      <LinkIcon className={iconSize} />
    </a>
  )
}

export default HeadingLink
