import { useState, useEffect } from 'react'

/**
 * Hook for managing dark mode state
 * Persists to localStorage and syncs with system preference
 */
export function useDarkMode(defaultValue = false) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return defaultValue

    const stored = localStorage.getItem('dewey-dark-mode')
    if (stored !== null) return stored === 'true'

    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    localStorage.setItem('dewey-dark-mode', String(isDark))

    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem('dewey-dark-mode')
      if (stored === null) {
        setIsDark(e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return [isDark, setIsDark] as const
}

export default useDarkMode
