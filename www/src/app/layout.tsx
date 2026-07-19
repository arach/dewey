import type { Metadata } from 'next'
import Script from 'next/script'
import '@/styles/tokens.css'
import '@/styles/markdown.css'
import '@/styles/docs-layout.css'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Dewey — Agent-ready documentation',
  description: 'Documentation toolkit that audits, scores, and generates agent-ready docs.',
  generator: 'Dewey',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+Display:wght@100..600&family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var s=localStorage.getItem('theme')}catch(e){}
var t=s||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
document.documentElement.setAttribute('data-theme',t)})();`}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}