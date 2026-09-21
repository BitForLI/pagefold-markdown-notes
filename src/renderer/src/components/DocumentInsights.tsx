import { useRef, type Dispatch, type SetStateAction } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ListTree,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react'
import type { BacklinkResult } from '../../../shared/types'
import type { OutgoingDocumentLink } from '../lib/markdown'
import { displayLibraryPath } from '../lib/markdown'

export type InsightLinkMode = 'backlinks' | 'outgoing'
export type InsightPanelMode = 'links' | 'outline'

interface DocumentOption {
  path: string
  name: string
}

interface OutlineEntry {
  line: number
  label: string
  level: number
}

interface InsightControlsProps {
  panelOpen: boolean
  panelMode: InsightPanelMode
  linkMode: InsightLinkMode
  onShowBacklinks: () => void
  onShowOutgoing: () => void
  onShowOutline: () => void
  onToggle: () => void
}

export function InsightControls({
  panelOpen,
  panelMode,
  linkMode,
  onShowBacklinks,
  onShowOutgoing,
  onShowOutline,
  onToggle
}: InsightControlsProps) {
  return (
    <div className="header-actions">
      <button
        className={`icon-button ${panelMode === 'links' && linkMode === 'backlinks' && panelOpen ? 'active' : ''}`}
        onClick={onShowBacklinks}
        title="Show backlinks"
        aria-label="Show backlinks"
      >
        <ArrowDownLeft size={17} />
      </button>
      <button
        className={`icon-button ${panelMode === 'links' && linkMode === 'outgoing' && panelOpen ? 'active' : ''}`}
        onClick={onShowOutgoing}
        title="Show outgoing links"
        aria-label="Show outgoing links"
      >
        <ArrowUpRight size={17} />
      </button>
      <button
        className={`icon-button ${panelMode === 'outline' && panelOpen ? 'active' : ''}`}
        onClick={onShowOutline}
        title="Show outline"
        aria-label="Show outline"
      >
        <ListTree size={17} />
      </button>
      <button
        className="icon-button"
        onClick={onToggle}
        title={panelOpen ? 'Collapse right panel' : 'Expand right panel'}
        aria-label={panelOpen ? 'Collapse right panel' : 'Expand right panel'}
      >
        {panelOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}
      </button>
    </div>
  )
}

interface DocumentInsightsPanelProps {
  width: number
  setWidth: Dispatch<SetStateAction<number>>
  documents: DocumentOption[]
  contextPath: string | null
  panelMode: InsightPanelMode
  linkMode: InsightLinkMode
  backlinks: BacklinkResult[]
  outgoingLinks: OutgoingDocumentLink[]
  outline: OutlineEntry[]
  onContextPathChange: (path: string) => void
  onOpenDocument: (path: string, line: number) => void
  onOpenWiki: (target: string) => void
}

export function DocumentInsightsPanel({
  width,
  setWidth,
  documents,
  contextPath,
  panelMode,
  linkMode,
  backlinks,
  outgoingLinks,
  outline,
  onContextPathChange,
  onOpenDocument,
  onOpenWiki
}: DocumentInsightsPanelProps) {
  const pointer = useRef<number | null>(null)

  function resize(clientX: number): void {
    setWidth(Math.min(420, Math.max(220, window.innerWidth - clientX)))
  }

  const contextDocument = documents.find((document) => document.path === contextPath)

  return (
    <aside className="right-sidebar">
      <div
        className="right-panel-resizer"
        role="separator"
        aria-label="Resize links panel"
        aria-orientation="vertical"
        aria-valuemin={220}
        aria-valuemax={420}
        aria-valuenow={Math.round(width)}
        tabIndex={0}
        title="Drag to resize"
        onPointerDown={(event) => {
          if (event.button !== 0) return
          event.preventDefault()
          pointer.current = event.pointerId
          event.currentTarget.setPointerCapture(event.pointerId)
          resize(event.clientX)
        }}
        onPointerMove={(event) => {
          if (pointer.current === event.pointerId) resize(event.clientX)
        }}
        onPointerUp={(event) => {
          if (pointer.current !== event.pointerId) return
          pointer.current = null
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
        }}
        onPointerCancel={(event) => {
          if (pointer.current !== event.pointerId) return
          pointer.current = null
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') setWidth((current) => Math.min(420, current + 12))
          else if (event.key === 'ArrowRight') setWidth((current) => Math.max(220, current - 12))
          else return
          event.preventDefault()
        }}
      />
      {contextDocument && (
        <div className="right-panel-context">
          <select
            value={contextDocument.path}
            onChange={(event) => onContextPathChange(event.target.value)}
            aria-label="Document for links panel"
          >
            {documents.map((document) => (
              <option key={document.path} value={document.path}>
                {document.name.replace(/\.(md|markdown|txt)$/i, '')}
              </option>
            ))}
          </select>
        </div>
      )}
      {panelMode === 'links' ? (
        <div className="connection-list backlink-list">
          {!contextPath ? null : linkMode === 'backlinks' ? (
            backlinks.map((link, index) => (
              <button
                key={`${link.path}-${link.line}-${index}`}
                onClick={() => onOpenDocument(link.path, link.line)}
              >
                <span><ArrowDownLeft size={13} />{link.name.replace(/\.md$/i, '')}</span>
                <small>{displayLibraryPath(link.path)} · Line {link.line}</small>
              </button>
            ))
          ) : (
            outgoingLinks.map((link) => (
              <button key={`${link.kind}-${link.target}`} onClick={() => onOpenWiki(link.target)}>
                <span><ArrowUpRight size={13} />{link.label}</span>
                <p>{displayLibraryPath(link.target)}</p>
                <small>Line {link.line}</small>
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="outline-list">
          {!contextPath ? null : outline.map((heading) => (
            <button
              key={`${heading.line}-${heading.label}`}
              className={`outline-level-${heading.level}`}
              onClick={() => onOpenDocument(contextPath, heading.line)}
            >
              <span>{heading.label}</span>
              <small>Line {heading.line}</small>
            </button>
          ))}
        </div>
      )}
    </aside>
  )
}
