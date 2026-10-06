import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import matter from 'gray-matter'
import { useMemo } from 'react'
import { CodeBlock } from './CodeBlock'
import { HeadingLink } from './HeadingLink'
import { rehypeDwSplit } from '../utils/rehype-split'

export interface MarkdownContentProps {
  content: string
  isDark?: boolean
  /** Lift fenced code blocks into a right-hand rail per section */
  split?: boolean
}

export function normalizeMarkdownHref(href: string | undefined): string | undefined {
  if (!href || /^https?:\/\//.test(href)) return href
  return href.replace(/\.md$/, '')
}

export function MarkdownContent({ content, isDark = false, split = false }: MarkdownContentProps) {
  // Strip frontmatter if present
  const body = useMemo(() => {
    // Only process if content might have frontmatter (starts with ---)
    if (content.trimStart().startsWith('---')) {
      const { content: parsed } = matter(content)
      return parsed
    }
    return content
  }, [content])
  return (
    <div className={`dw-prose${isDark ? ' dark' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={split ? [rehypeSlug, rehypeDwSplit] : [rehypeSlug]}
        components={{
        // Headings with anchor links
        h1: ({ children, id, node: _node, ...props }) => (
          <h1 id={id} className="dw-markdown-heading group" {...props}>
            {children}
            {id && <HeadingLink id={id} size="lg" />}
          </h1>
        ),
        h2: ({ children, id, node: _node, ...props }) => (
          <h2 id={id} className="dw-markdown-heading group" {...props}>
            {children}
            {id && <HeadingLink id={id} size="lg" />}
          </h2>
        ),
        h3: ({ children, id, node: _node, ...props }) => (
          <h3 id={id} className="dw-markdown-heading group" {...props}>
            {children}
            {id && <HeadingLink id={id} size="md" />}
          </h3>
        ),
        h4: ({ children, id, node: _node, ...props }) => (
          <h4 id={id} className="dw-markdown-heading group" {...props}>
            {children}
            {id && <HeadingLink id={id} size="sm" />}
          </h4>
        ),

        // Code blocks
        pre: ({ children }) => {
          // The pre tag wraps code, so we pass through
          return <>{children}</>
        },
        code: ({ className, children }) => {
          const isInline = !className?.includes('language-')
          const code = String(children).replace(/\n$/, '')

          return (
            <CodeBlock
              className={className}
              inline={isInline}
              isDark={isDark}
            >
              {code}
            </CodeBlock>
          )
        },

        // Blockquotes
        blockquote: ({ children, node: _node, ...props }) => (
          <blockquote className="dw-markdown-blockquote" {...props}>
            {children}
          </blockquote>
        ),

        // Links
        a: ({ href, children, node: _node, ...props }) => {
          const isExternal = href?.startsWith('http')

          // Convert internal .md links to clean routes
          const processedHref = normalizeMarkdownHref(href)

          return (
            <a
              href={processedHref}
              className="dw-markdown-link"
              {...(isExternal && {
                target: '_blank',
                rel: 'noopener noreferrer'
              })}
              {...props}
            >
              {children}
              {isExternal && <span className="dw-markdown-external" aria-hidden="true">↗</span>}
            </a>
          )
        },

        // Tables
        table: ({ children, node: _node, ...props }) => (
          <div className="dw-markdown-table-scroll">
            <table {...props}>
              {children}
            </table>
          </div>
        ),

        // Images
        img: ({ src, alt, node: _node, ...props }) => (
          <img
            src={src}
            alt={alt}
            className="dw-markdown-image"
            {...props}
          />
        ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownContent
