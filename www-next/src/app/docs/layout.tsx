import { DocsSidebar } from '@/components/DocsSidebar'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dl">
      <DocsSidebar />
      <div className="dl-main">
        <div className="dl-mobile-header">
          <Link href="/" className="dl-logo" style={{ fontSize: 18 }}>
            dewey <span>/ docs</span>
          </Link>
          <ThemeToggle />
        </div>
        {children}
      </div>
    </div>
  )
}