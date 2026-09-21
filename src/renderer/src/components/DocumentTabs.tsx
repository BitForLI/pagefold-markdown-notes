import { Check, X } from 'lucide-react'

interface DocumentTab {
  path: string
  name: string
  content: string
  savedContent: string
}

interface DocumentTabsProps {
  tabs: DocumentTab[]
  activePath: string | null
  onActivate: (path: string) => void
  onClose: (path: string) => void
}

export function DocumentTabs({ tabs, activePath, onActivate, onClose }: DocumentTabsProps) {
  if (!tabs.length) return null

  return (
    <div className="tab-strip">
      {tabs.map((tab) => (
        <button
          key={tab.path}
          data-path={tab.path}
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData('text/pagefold-path', tab.path)
            event.dataTransfer.effectAllowed = 'copy'
          }}
          className={tab.path === activePath ? 'active' : ''}
          onClick={() => onActivate(tab.path)}
        >
          <span className="tab-file-icon">§</span>
          <span>{tab.name.replace(/\.md$/i, '')}</span>
          {tab.content !== tab.savedContent && <i />}
          <b
            role="button"
            tabIndex={0}
            aria-label={`Close ${tab.name}`}
            onClick={(event) => {
              event.stopPropagation()
              onClose(tab.path)
            }}
          >
            <X size={13} />
          </b>
        </button>
      ))}
    </div>
  )
}

export function SaveStatus({ status, text }: { status: 'saved' | 'saving' | 'error'; text: string }) {
  return (
    <footer className="status-bar">
      <span>{text}</span>
      <span className={`save-state ${status}`}>
        <Check size={12} />
        {status === 'saving' ? 'Saving' : status === 'error' ? 'Save failed' : 'Saved locally'}
      </span>
    </footer>
  )
}
