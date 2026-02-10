import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { CodeBlock } from './CodeBlock'
import { HeadingLink } from './HeadingLink'

interface MarkdownContentProps {
  content: string
  isDark?: boolean
}

export function MarkdownContent({ content, isDark = false }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
      components={{
        // Headings with anchor links
        h1: ({ children, id, ...props }) => (
          <h1
            id={id}
            className="group flex items-center text-3xl font-semibold mb-4 mt-8 first:mt-0"
            style={{ color: isDark ? '#f3f4f6' : '#101518' }}
            {...props}
          >
            {children}
            {id && <HeadingLink id={id} size="lg" />}
          </h1>
        ),
        h2: ({ children, id, ...props }) => (
          <h2
            id={id}
            className="group flex items-center text-2xl font-semibold mb-4 mt-12 pt-8 first:mt-0 first:pt-0"
            style={{
              color: isDark ? '#f3f4f6' : '#101518',
              borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
            }}
            {...props}
          >
            {children}
            {id && <HeadingLink id={id} size="lg" />}
          </h2>
        ),
        h3: ({ children, id, ...props }) => (
          <h3
            id={id}
            className="group flex items-center text-xl font-semibold mb-3 mt-8"
            style={{ color: isDark ? '#f3f4f6' : '#101518' }}
            {...props}
          >
            {children}
            {id && <HeadingLink id={id} size="md" />}
          </h3>
        ),
        h4: ({ children, id, ...props }) => (
          <h4
            id={id}
            className="group flex items-center text-lg font-semibold mb-2 mt-6"
            style={{ color: isDark ? '#f3f4f6' : '#101518' }}
            {...props}
          >
            {children}
            {id && <HeadingLink id={id} size="sm" />}
          </h4>
        ),

        // Paragraphs
        p: ({ children, ...props }) => (
          <p
            className="mb-4 leading-relaxed"
            style={{ color: isDark ? '#d1d5db' : '#2e3538' }}
            {...props}
          >
            {children}
          </p>
        ),

        // Lists
        ul: ({ children, ...props }) => (
          <ul className="mb-4 pl-6 space-y-2 list-disc" {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className="mb-4 pl-6 space-y-2 list-decimal" {...props}>
            {children}
          </ol>
        ),
        li: ({ children, ...props }) => (
          <li
            className="leading-relaxed"
            style={{ color: isDark ? '#d1d5db' : '#2e3538' }}
            {...props}
          >
            {children}
          </li>
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
        blockquote: ({ children, ...props }) => (
          <blockquote
            className="border-l-4 pl-4 my-4 italic"
            style={{
              borderColor: '#3b82f6',
              color: isDark ? '#9ca3af' : '#5c676c',
            }}
            {...props}
          >
            {children}
          </blockquote>
        ),

        // Links
        a: ({ href, children, ...props }) => {
          const isExternal = href?.startsWith('http')

          // Convert internal .md links to clean routes
          let processedHref = href
          if (href && !isExternal && href.endsWith('.md')) {
            processedHref = href.replace('.md', '')
          }

          return (
            <a
              href={processedHref}
              className="font-medium no-underline hover:underline"
              style={{ color: '#3b82f6' }}
              {...(isExternal && {
                target: '_blank',
                rel: 'noopener noreferrer'
              })}
              {...props}
            >
              {children}
              {isExternal && <span className="ml-1 text-xs">↗</span>}
            </a>
          )
        },

        // Tables
        table: ({ children, ...props }) => (
          <div className="overflow-x-auto mb-4">
            <table
              className="min-w-full border-collapse text-sm"
              style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}` }}
              {...props}
            >
              {children}
            </table>
          </div>
        ),
        th: ({ children, ...props }) => (
          <th
            className="px-4 py-2 text-left font-semibold text-sm"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
              color: isDark ? '#f3f4f6' : '#101518',
            }}
            {...props}
          >
            {children}
          </th>
        ),
        td: ({ children, ...props }) => (
          <td
            className="px-4 py-2 text-sm"
            style={{
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
              color: isDark ? '#d1d5db' : '#2e3538',
            }}
            {...props}
          >
            {children}
          </td>
        ),

        // Horizontal rule
        hr: () => (
          <hr
            className="my-8"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)' }}
          />
        ),

        // Strong/Bold
        strong: ({ children, ...props }) => (
          <strong
            className="font-semibold"
            style={{ color: isDark ? '#f3f4f6' : '#101518' }}
            {...props}
          >
            {children}
          </strong>
        ),

        // Images
        img: ({ src, alt, ...props }) => (
          <img
            src={src}
            alt={alt}
            className="max-w-full rounded-lg my-4"
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default MarkdownContent
