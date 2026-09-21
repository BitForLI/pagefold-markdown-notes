import { Search, X } from 'lucide-react'
import type { SearchResult } from '../../../shared/types'
import { displayLibraryPath } from '../lib/markdown'

interface SearchDialogProps {
  query: string
  results: SearchResult[]
  busy: boolean
  onQueryChange: (query: string) => void
  onOpenResult: (result: SearchResult) => void
  onClose: () => void
}

export function SearchDialog({
  query,
  results,
  busy,
  onQueryChange,
  onOpenResult,
  onClose
}: SearchDialogProps) {
  return (
    <div className="modal-backdrop search-dialog-backdrop" onMouseDown={onClose}>
      <section
        className="search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Search library"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="search-dialog-input">
          <Search size={16} />
          <input
            autoFocus
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') onClose()
            }}
            placeholder="Search every note"
          />
          <button className="icon-button" onClick={onClose} aria-label="Close search">
            <X size={16} />
          </button>
        </div>
        <div className="search-dialog-results">
          {busy && <p>Searching…</p>}
          {!busy && query.trim() && results.length === 0 && <p>No matches</p>}
          {!busy && !query.trim() && <p>Type to search note contents</p>}
          {results.map((result) => (
            <button key={`${result.path}-${result.line}`} onClick={() => onOpenResult(result)}>
              <strong>{result.name.replace(/\.(md|markdown|txt)$/i, '')}</strong>
              <small>{displayLibraryPath(result.path)} · Line {result.line}</small>
              <span>{result.excerpt}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
