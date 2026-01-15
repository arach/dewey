import React from 'react'
import { ArrowLeft, Sun, Moon } from 'lucide-react'
import { useDewey, useLink } from './DeweyProvider'

export interface HeaderProps {
  /** Project/site name */
  projectName?: string
  /** URL to navigate to when clicking brand */
  homeUrl?: string
  /** URL to navigate back to */
  backUrl?: string
  /** Back link label */
  backLabel?: string
  /** Right-side label (e.g., "DOCS") */
  label?: string
  /** Show theme toggle */
  showThemeToggle?: boolean
  /** Additional actions/buttons */
  actions?: React.ReactNode
}

export function Header({
  projectName = 'Docs',
  homeUrl = '/docs',
  backUrl = '/',
  backLabel = 'Home',
  label = 'DOCS',
  showThemeToggle = true,
  actions,
}: HeaderProps) {
  const { isDark, toggleDark } = useDewey()
  const Link = useLink()

  return (
    <header className="dw-header">
      <div className="dw-header-inner">
        {/* Left side: Brand + Back */}
        <div className="dw-header-left">
          <Link href={homeUrl} className="dw-header-brand">
            <span className="dw-header-brand-dot" />
            <span className="dw-header-brand-name">{projectName}</span>
          </Link>

          <span className="dw-header-divider" />

          <Link href={backUrl} className="dw-header-back">
            <ArrowLeft className="dw-header-back-icon" />
            <span>{backLabel}</span>
          </Link>
        </div>

        {/* Right side: Actions + Theme + Label */}
        <div className="dw-header-right">
          {actions}

          {showThemeToggle && (
            <button
              onClick={toggleDark}
              className="dw-header-theme-toggle"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {label && (
            <span className="dw-header-label">{label}</span>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
