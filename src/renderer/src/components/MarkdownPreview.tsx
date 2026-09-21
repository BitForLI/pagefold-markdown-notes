import { memo, type DragEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { Braces, X } from 'lucide-react'
import { resolveRelativeNotePath, renderableMarkdown } from '../lib/markdown'

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function openInternalLink(path: string, href: string, onWikiOpen: (target: string) => void): boolean {
  if (href.startsWith('#wiki:')) {
    onWikiOpen(safeDecode(href.slice(6)))
    return true
  }
  if (!/\.(md|markdown|txt)(?:#.*)?$/i.test(href)) return false
  const [linkedPath, fragment] = href.split('#', 2)
  const resolved = resolveRelativeNotePath(path, safeDecode(linkedPath))
  onWikiOpen(fragment ? `${resolved}#${safeDecode(fragment)}` : resolved)
  return true
}

function imageSource(path: string, source: string | undefined): string {
  const resolved = resolveRelativeNotePath(path, source ?? '')
  return /^(data:|blob:|https?:)/i.test(resolved)
    ? resolved
    : `vault:///asset?path=${encodeURIComponent(resolved)}`
}

export function DocumentPreview({
  path,
  content,
  onWikiOpen,
  onDrop,
  onClose
}: {
  path: string
  content: string
  onWikiOpen: (target: string) => void
  onDrop: (event: DragEvent<HTMLElement>) => void
  onClose: () => void
}) {
  return (
    <article
      className="markdown-preview document-preview"
      aria-label={`Preview of ${path}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <button className="document-close" onClick={onClose} title="Remove from preview" aria-label={`Remove ${path} from preview`}>
        <X size={13} />
      </button>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={{
          a: ({ href, children }) => {
            const external = Boolean(href && /^https?:/i.test(href))
            return (
              <a
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                onClick={(event) => {
                  if (!href || external) return
                  if (openInternalLink(path, href, onWikiOpen)) event.preventDefault()
                }}
              >
                {children}
              </a>
            )
          },
          img: ({ src, alt }) => <img src={imageSource(path, src)} alt={alt ?? ''} />
        }}
      >
        {renderableMarkdown(content)}
      </ReactMarkdown>
    </article>
  )
}

export function LocationMarkdown({ source, onDoubleClick }: { source: string; onDoubleClick?: () => void }) {
  return (
    <span onDoubleClick={onDoubleClick}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => <span>{children}</span>,
          h1: ({ children }) => <span>{children}</span>,
          h2: ({ children }) => <span>{children}</span>,
          h3: ({ children }) => <span>{children}</span>,
          h4: ({ children }) => <span>{children}</span>,
          h5: ({ children }) => <span>{children}</span>,
          h6: ({ children }) => <span>{children}</span>,
          ul: ({ children }) => <span>{children}</span>,
          ol: ({ children }) => <span>{children}</span>,
          li: ({ children }) => <span>{children}</span>,
          blockquote: ({ children }) => <span>{children}</span>,
          pre: ({ children }) => <span className="link-location-code">{children}</span>,
          a: ({ children }) => <span>{children}</span>,
          img: ({ alt }) => <span>{alt || 'Image'}</span>
        }}
      >
        {renderableMarkdown(source)}
      </ReactMarkdown>
    </span>
  )
}

export const MarkdownBody = memo(function MarkdownBody({
  path,
  content,
  onWikiOpen,
  onSourceDoubleClick
}: {
  path: string
  content: string
  onWikiOpen: (target: string) => void
  onSourceDoubleClick: (event: React.MouseEvent<HTMLElement>) => void
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
      components={{
        a: ({ href, children }) => (
          href?.startsWith('#pf-style:')
            ? <span className={`pf-${href.slice(10)}`}>{children}</span>
            : (
                <a
                  href={href}
                  target={href && /^https?:/i.test(href) ? '_blank' : undefined}
                  rel={href && /^https?:/i.test(href) ? 'noreferrer' : undefined}
                  onClick={(event) => {
                    if (href && openInternalLink(path, href, onWikiOpen)) event.preventDefault()
                  }}
                >
                  {children}
                </a>
              )
        ),
        h1: ({ node, children }) => <h1 data-source-line={node?.position?.start.line} onDoubleClick={onSourceDoubleClick}>{children}</h1>,
        h2: ({ node, children }) => <h2 data-source-line={node?.position?.start.line} onDoubleClick={onSourceDoubleClick}>{children}</h2>,
        h3: ({ node, children }) => <h3 data-source-line={node?.position?.start.line} onDoubleClick={onSourceDoubleClick}>{children}</h3>,
        h4: ({ node, children }) => <h4 data-source-line={node?.position?.start.line} onDoubleClick={onSourceDoubleClick}>{children}</h4>,
        h5: ({ node, children }) => <h5 data-source-line={node?.position?.start.line} onDoubleClick={onSourceDoubleClick}>{children}</h5>,
        h6: ({ node, children }) => <h6 data-source-line={node?.position?.start.line} onDoubleClick={onSourceDoubleClick}>{children}</h6>,
        p: ({ node, children }) => <p data-source-line={node?.position?.start.line} onDoubleClick={onSourceDoubleClick}>{children}</p>,
        li: ({ node, children }) => <li data-source-line={node?.position?.start.line} onDoubleClick={onSourceDoubleClick}>{children}</li>,
        blockquote: ({ node, children }) => <blockquote data-source-line={node?.position?.start.line} onDoubleClick={onSourceDoubleClick}>{children}</blockquote>,
        pre: ({ node, children }) => <pre data-source-line={node?.position?.start.line} onDoubleClick={onSourceDoubleClick}>{children}</pre>,
        div: ({ node, children }) => <div data-source-line={node?.position?.start.line} onDoubleClick={onSourceDoubleClick}>{children}</div>,
        img: ({ src, alt }) => <img src={imageSource(path, src)} alt={alt ?? ''} />,
        code: ({ children, className }) => <code className={className}><Braces size={12} aria-hidden="true" />{children}</code>
      }}
    >
      {renderableMarkdown(content)}
    </ReactMarkdown>
  )
}, (previous, next) => (
  previous.path === next.path
  && previous.content === next.content
  && previous.onWikiOpen === next.onWikiOpen
))
