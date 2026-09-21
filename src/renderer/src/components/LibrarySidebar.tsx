import { useState } from 'react'
import {
  FilePlus2,
  FolderPlus,
  Layers3,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings
} from 'lucide-react'
import type { EntryType, TreeEntry } from '../../../shared/types'
import { FileTree } from './FileTree'

interface LibrarySidebarProps {
  open: boolean
  tree: TreeEntry[]
  activePath: string | null
  selectedPath: string
  defaultCreateParent: string
  onOpenChange: (open: boolean) => void
  onSelect: (entry: TreeEntry) => void
  onOpen: (path: string) => void
  onCreate: (parent: string, type: EntryType) => void
  onQuickNote: () => void
  onRename: (entry: TreeEntry) => void
  onDelete: (entry: TreeEntry) => void
  onMove: (source: string, target: string) => void
  onImport: (files: File[], target: string) => void
  onSearch: () => void
  onSettings: () => void
  onClearSelection: () => void
}

export function LibrarySidebar({
  open,
  tree,
  activePath,
  selectedPath,
  defaultCreateParent,
  onOpenChange,
  onSelect,
  onOpen,
  onCreate,
  onQuickNote,
  onRename,
  onDelete,
  onMove,
  onImport,
  onSearch,
  onSettings,
  onClearSelection
}: LibrarySidebarProps) {
  const [rootDropActive, setRootDropActive] = useState(false)

  return (
    <>
      <aside className="left-sidebar">
        <div className="section-heading">
          <button
            className="sidebar-toggle"
            onClick={() => onOpenChange(false)}
            title="Collapse library"
            aria-label="Collapse library"
          >
            <PanelLeftClose size={17} />
          </button>
          <div className="library-create-buttons">
            <button onClick={onQuickNote} title="New note" aria-label="New note"><FilePlus2 size={14} /></button>
            <button onClick={() => onCreate(defaultCreateParent, 'folder')} title="New folder" aria-label="New folder"><FolderPlus size={14} /></button>
            <button onClick={() => onCreate('', 'section')} title="New section" aria-label="New section"><Layers3 size={14} /></button>
            <button onClick={onSearch} title="Search (Ctrl+P)" aria-label="Search library"><Search size={14} /></button>
            <button onClick={onSettings} title="Settings (Ctrl+,)" aria-label="Settings"><Settings size={14} /></button>
          </div>
        </div>
        <div
          className={`tree-scroll ${rootDropActive ? 'is-drop-target' : ''}`}
          onClick={(event) => {
            const target = event.target instanceof Element ? event.target : null
            if (!target?.closest('[role="treeitem"]')) onClearSelection()
          }}
          onDragOver={(event) => {
            event.preventDefault()
            event.dataTransfer.dropEffect = event.dataTransfer.types.includes('Files') ? 'copy' : 'move'
            if (event.target === event.currentTarget) setRootDropActive(true)
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) setRootDropActive(false)
          }}
          onDrop={(event) => {
            setRootDropActive(false)
            if (event.target !== event.currentTarget) return
            const source = event.dataTransfer.getData('text/pagefold-path')
            if (source) onMove(source, '')
            else onImport(Array.from(event.dataTransfer.files), '')
          }}
        >
          <FileTree
            tree={tree}
            activePath={activePath}
            selectedPath={selectedPath}
            onSelect={onSelect}
            onOpen={onOpen}
            onCreate={onCreate}
            onRename={onRename}
            onDelete={onDelete}
            onMove={onMove}
            onImport={onImport}
          />
        </div>
      </aside>
      {!open && (
        <button
          className="sidebar-reveal icon-button"
          onClick={() => onOpenChange(true)}
          title="Expand library"
          aria-label="Expand library"
        >
          <PanelLeftOpen size={17} />
        </button>
      )}
    </>
  )
}
