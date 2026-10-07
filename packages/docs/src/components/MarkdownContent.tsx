import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import matter from 'gray-matter'
import { Children, isValidElement, useMemo, type ReactNode } from 'react'
import { CodeBlock } from './CodeBlock'
import { HeadingLink } from './HeadingLink'
import { rehypeDwSplit } from '../utils/rehype-split'
import { markdownRehype } from '../utils/rehype-html'

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
        rehypePlugins={split ? [...markdownRehype, rehypeDwSplit] : markdownRehype}
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
        // A fence is always a block, with or without a language; bare `code` is inline.
        pre: ({ children }) => {
          const child = Children.toArray(children)[0]
          const props = (isValidElement(child) ? child.props : {}) as { className?: string, children?: ReactNode }
          return (
            <CodeBlock className={props.className} inline={false} isDark={isDark}>
              {String(props.children ?? '').replace(/\n$/, '')}
            </CodeBlock>
          )
        },
        code: ({ className, children }) => (
          <CodeBlock className={className} inline isDark={isDark}>
            {String(children)}
          </CodeBlock>
        ),

        // Blockquotes
        blockquote: ({ children, className, node: _node, ...props }) => (
          <blockquote className={className ? `dw-markdown-blockquote ${className}` : 'dw-markdown-blockquote'} {...props}>
            {children}
          </blockquote>
        ),

        // Links
        a: ({ href, children, node, ...props }) => {
          // A linked image or badge needs no arrow after it.
          const imageOnly = node?.children.every(child => (child.type === 'element' && child.tagName === 'img') || (child.type === 'text' && !child.value.trim()))
          const isExternal = href?.startsWith('http') && !imageOnly

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
