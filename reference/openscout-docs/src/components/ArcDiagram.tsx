'use client'

import { useEffect, useState } from 'react'

interface ArcDiagramProps {
  src: string
  height?: number
}

export function ArcDiagram({ src, height = 400 }: ArcDiagramProps) {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/diagrams/${src}.arc.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`/diagrams/${src}.arc.json not found`)
        return r.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
  }, [src])

  if (error) {
    return (
      <div
        style={{
          height,
          borderRadius: '0.75rem',
          border: '1px dashed var(--dewey-border, rgba(0,0,0,0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--dewey-font-mono, ui-monospace, monospace)',
          fontSize: '0.75rem',
          color: 'var(--dewey-muted, #8b8579)',
        }}
      >
        {error}
      </div>
    )
  }

  if (!data) {
    return (
      <div
        style={{
          height,
          borderRadius: '0.75rem',
          border: '1px solid var(--dewey-border, rgba(0,0,0,0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--dewey-font-mono, ui-monospace, monospace)',
          fontSize: '0.75rem',
          color: 'var(--dewey-muted, #8b8579)',
        }}
      >
        Loading diagram…
      </div>
    )
  }

  // When @arach/arc ships, replace this block with:
  //   import dynamic from 'next/dynamic'
  //   const ArcRenderer = dynamic(() => import('@arach/arc').then(m => m.ArcRenderer), { ssr: false })
  //   return <ArcRenderer data={data} height={height} />
  return (
    <div
      style={{
        height,
        borderRadius: '0.75rem',
        border: '1px solid var(--dewey-border, rgba(0,0,0,0.08))',
        background: 'var(--dewey-code-bg, #f4f6f8)',
        padding: '1rem',
        overflow: 'auto',
        fontFamily: 'var(--dewey-font-mono, ui-monospace, monospace)',
        fontSize: '0.75rem',
      }}
    >
      <div style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--dewey-fg, #111110)' }}>
        {src}
      </div>
      <pre style={{ color: 'var(--dewey-muted, #8b8579)', whiteSpace: 'pre-wrap', margin: 0 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

export default ArcDiagram
