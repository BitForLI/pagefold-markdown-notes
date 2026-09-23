import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { SearchResult } from '../../../shared/types'
import { displayLibraryPath } from '../lib/markdown'

interface SearchDialogProps {
  onOpenResult: (result: SearchResult) => void
  onClose: () => void
}

export function SearchDialog({
  onOpenResult,
  onClose
}: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    if (!query.trim()) {
      setResults([])
      setBusy(false)
      return
    }

    setBusy(true)
    let cancelled = false
    const timer = window.setTimeout(() => {
      window.pagefold.search(query)
        .then((nextResults) => {
          if (!cancelled) setResults(nextResults)
        })
        .catch(() => {
          if (!cancelled) setError('Search failed. Try again.')
        })
        .finally(() => {
          if (!cancelled) setBusy(false)
        })
    }, 220)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query])

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
            onChange={(event) => setQuery(event.target.value)}
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
          {error && <p>{error}</p>}
          {busy && <p>Searching…</p>}
          {!busy && !error && query.trim() && results.length === 0 && <p>No matches</p>}
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
