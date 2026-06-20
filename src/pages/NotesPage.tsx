import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import NoteEditor from '@/components/notes/NoteEditor'
import NoteMindMap from '@/components/notes/NoteMindMap'
import { AnimatePresence, motion } from 'motion/react'
import {
  AlignLeft,
  Bold,
  Bot,
  Check,
  CheckSquare,
  ChevronRight,
  Code,
  FileText,
  Heading1,
  Heading2,
  Highlighter,
  Italic,
  Layers3,
  List,
  ListOrdered,
  MoreHorizontal,
  PanelRight,
  Pin,
  Plus,
  Quote,
  Search,
  Sparkles,
  Trash2,
  UnderlineIcon,
  Wand2,
} from 'lucide-react'
import { format } from 'date-fns'
import { aiApi, notesApi } from '@/services/api'
import { useAutoSave } from '@/hooks/useAutoSave'
import type { Note } from '@/types'

const CATEGORIES = ['All', 'Personal', 'Work', 'Ideas', 'Study', 'Projects']
const COLOR_MAP: Record<string, string> = {
  default: 'oklch(52% 0.06 265)',
  blue: 'var(--accent-blue)',
  purple: 'var(--accent-purple)',
  green: 'var(--accent-green)',
  amber: 'var(--accent-amber)',
  red: 'var(--accent-red)',
}

type AIAction = 'summarize' | 'expand' | 'grammar'

function stripHtml(html = '') {
  if (!html) return ''
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getWordCount(text: string) {
  if (!text.trim()) return 0
  return text.trim().split(/\s+/).length
}

function getCategoryCounts(notes: Note[]) {
  return CATEGORIES.reduce<Record<string, number>>((acc, category) => {
    acc[category] = category === 'All' ? notes.length : notes.filter((note) => note.category === category).length
    return acc
  }, {})
}

function formatDate(value?: string) {
  if (!value) return 'No date'
  return format(new Date(value), 'dd MMM yyyy')
}

function NoteButton({
  active,
  children,
  title,
  onClick,
}: {
  active?: boolean
  children: ReactNode
  title: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="notes-icon-button"
      style={{
        background: active ? 'var(--bg-hover)' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
      }}
    >
      {children}
    </button>
  )
}

export default function NotesPage() {
  const queryClient = useQueryClient()
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [inspectorOpen, setInspectorOpen] = useState(true)
  const [aiLoading, setAiLoading] = useState<AIAction | null>(null)
  const [viewMode, setViewMode] = useState<'editor' | 'mindmap'>('editor')

  const { data: notes = [], isPending } = useQuery({
    queryKey: ['notes'],
    queryFn: notesApi.getAll,
  })

  const selectedNote = notes.find((note) => note.id === selectedId) ?? null
  const categoryCounts = useMemo(() => getCategoryCounts(notes), [notes])

  const filteredNotes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return notes
      .filter((note) => {
        const body = stripHtml(note.content).toLowerCase()
        const title = note.title.toLowerCase()
        const tags = (note.tags ?? []).join(' ').toLowerCase()
        const matchesSearch = !normalizedSearch || title.includes(normalizedSearch) || body.includes(normalizedSearch) || tags.includes(normalizedSearch)
        const matchesCategory = category === 'All' || note.category === category
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
        return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
      })
  }, [category, notes, search])

  useEffect(() => {
    if (!notes.length) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !notes.some((note) => note.id === selectedId)) {
      setSelectedId(filteredNotes[0]?.id ?? notes[0].id)
    }
  }, [filteredNotes, notes, selectedId])

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Note> }) => notesApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Note>) => notesApi.create(data),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      setSelectedId(note.id)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      setSelectedId(null)
    },
  })

  const saveContent = useCallback(
    async (content: string) => {
      if (!selectedId) return
      await updateMutation.mutateAsync({ id: selectedId, data: { content } })
    },
    [selectedId, updateMutation]
  )

  const { debouncedSave, status: saveStatus } = useAutoSave(saveContent, 1800)

  const plainText = stripHtml(selectedNote?.content || '')
  const wordCount = getWordCount(plainText)

  const createNote = () => {
    createMutation.mutate({
      title: 'Untitled note',
      content: '',
      category: category === 'All' ? 'Personal' : category,
      tags: [],
      color: 'default',
    })
  }

  const updateSelectedNote = (data: Partial<Note>) => {
    if (!selectedNote) return
    updateMutation.mutate({ id: selectedNote.id, data: { ...selectedNote, ...data } })
  }

  const handleAiAction = async (action: AIAction) => {
    if (!selectedNote) return
    setAiLoading(action)

    try {
      if (action === 'summarize') {
        const { summary } = await aiApi.summarizeNote(selectedNote.id)
        const newHtml = (selectedNote.content || '') + `<p><strong>AI Summary:</strong> ${summary}</p>`
        await saveContent(newHtml)
      }
    } catch (error) {
      console.error('AI action failed:', error)
    } finally {
      setAiLoading(null)
    }
  }

  const groupedNotes = {
    pinned: filteredNotes.filter((note) => note.is_pinned),
    recent: filteredNotes.filter((note) => !note.is_pinned),
  }

  return (
    <motion.div
      className="notes-workspace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
    >
      <aside className="notes-category-rail">
        <div className="notes-rail-head">
          <div className="notes-product-mark">
            <Layers3 size={16} />
          </div>
          <div>
            <div className="notes-rail-title">Library</div>
            <div className="notes-rail-subtitle">{notes.length} notes</div>
          </div>
        </div>

        <nav className="notes-category-list" aria-label="Note categories">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              className="notes-category-button"
              data-active={category === item}
              onClick={() => setCategory(item)}
            >
              <span>{item}</span>
              <span>{categoryCounts[item] ?? 0}</span>
            </button>
          ))}
        </nav>

        <button type="button" className="notes-new-button" onClick={createNote}>
          <Plus size={16} />
          New note
        </button>
      </aside>

      <aside className="notes-list-pane">
        <div className="notes-list-header">
          <div>
            <h1>Notes</h1>
            <p>{category === 'All' ? 'Everything in your workspace' : `${category} notes`}</p>
          </div>
          <button type="button" className="notes-compact-icon" onClick={createNote} title="Create note">
            <Plus size={16} />
          </button>
        </div>

        <label className="notes-search">
          <Search size={15} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search titles, tags, content" />
        </label>

        <div className="notes-list-scroll">
          {isPending ? (
            <div className="notes-loading">
              <div />
              <div />
              <div />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="notes-empty-list">
              <FileText size={24} />
              <strong>No matching notes</strong>
              <span>Clear the search or create a note in this category.</span>
            </div>
          ) : (
            <>
              {groupedNotes.pinned.length > 0 && <SectionLabel label="Pinned" />}
              {groupedNotes.pinned.map((note) => (
                <NoteListItem key={note.id} note={note} active={note.id === selectedId} onSelect={() => setSelectedId(note.id)} />
              ))}
              {groupedNotes.recent.length > 0 && <SectionLabel label={groupedNotes.pinned.length ? 'Recent' : 'Recent notes'} />}
              {groupedNotes.recent.map((note) => (
                <NoteListItem key={note.id} note={note} active={note.id === selectedId} onSelect={() => setSelectedId(note.id)} />
              ))}
            </>
          )}
        </div>
      </aside>

      <main className="notes-editor-pane">
        {!selectedNote ? (
          <div className="notes-empty-editor">
            <div className="notes-empty-icon">
              <FileText size={28} />
            </div>
            <h2>Select a note</h2>
            <p>Choose something from the list or start a new note.</p>
            <button type="button" className="notes-primary-button" onClick={createNote}>
              <Plus size={16} />
              New note
            </button>
          </div>
        ) : (
          <>
            <div className="notes-editor-chrome">
              <div className="notes-breadcrumb">
                <span>{selectedNote.category || 'Unsorted'}</span>
                <ChevronRight size={14} />
                <span>{selectedNote.title || 'Untitled note'}</span>
              </div>

              <div className="notes-toolbar" aria-label="Editor toolbar">
                <div style={{ display: 'flex', gap: 4, background: 'var(--bg-elevated)', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
                  <button
                    onClick={() => setViewMode('editor')}
                    style={{
                      padding: '4px 12px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                      background: viewMode === 'editor' ? 'var(--accent-blue)' : 'transparent',
                      color: viewMode === 'editor' ? 'white' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Editor
                  </button>
                  <button
                    onClick={() => setViewMode('mindmap')}
                    style={{
                      padding: '4px 12px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                      background: viewMode === 'mindmap' ? 'var(--accent-purple)' : 'transparent',
                      color: viewMode === 'mindmap' ? 'white' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Mind Map
                  </button>
                </div>
                <div className="notes-toolbar-spacer" />
                <span className="notes-save-status" data-state={saveStatus}>
                  {saveStatus === 'saving' ? 'Saving' : saveStatus === 'saved' ? 'Saved' : 'Ready'}
                </span>
                <button type="button" className="notes-compact-icon" title="Toggle inspector" onClick={() => setInspectorOpen((value) => !value)}>
                  <PanelRight size={16} />
                </button>
              </div>
            </div>

            <div ref={editorContainerRef} className="notes-editor-scroll">
              <article className="notes-document">
                <input
                  key={selectedNote.id}
                  className="notes-title-input"
                  defaultValue={selectedNote.title}
                  placeholder="Untitled note"
                  onBlur={(event) => {
                    const title = event.target.value.trim() || 'Untitled note'
                    if (title !== selectedNote.title) updateSelectedNote({ title })
                  }}
                />

                <div className="notes-document-meta">
                  <span>
                    <Highlighter size={14} />
                    {selectedNote.category || 'Personal'}
                  </span>
                  <span>
                    <AlignLeft size={14} />
                    {wordCount} words
                  </span>
                  <span>Edited {formatDate(selectedNote.updated_at || selectedNote.created_at)}</span>
                </div>

                <div style={{ marginTop: 24 }}>
                  {viewMode === 'editor' ? (
                    <NoteEditor 
                      key={selectedNote.id} 
                      initialHtml={selectedNote.content} 
                      onChange={debouncedSave} 
                    />
                  ) : (
                    <NoteMindMap 
                      key={selectedNote.id}
                      html={selectedNote.content} 
                      title={selectedNote.title} 
                    />
                  )}
                </div>
              </article>
            </div>
          </>
        )}
      </main>

      <AnimatePresence initial={false}>
        {selectedNote && inspectorOpen && (
          <motion.aside
            className="notes-inspector"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="notes-inspector-inner">
              <div className="notes-inspector-header">
                <span>Details</span>
                <button type="button" className="notes-compact-icon" title="More">
                  <MoreHorizontal size={16} />
                </button>
              </div>

              <div className="notes-property-group">
                <label>
                  Category
                  <select value={selectedNote.category || 'Personal'} onChange={(event) => updateSelectedNote({ category: event.target.value })}>
                    {CATEGORIES.filter((item) => item !== 'All').map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Tags
                  <input
                    key={`${selectedNote.id}-tags`}
                    defaultValue={(selectedNote.tags ?? []).join(', ')}
                    placeholder="planning, ideas"
                    onBlur={(event) =>
                      updateSelectedNote({
                        tags: event.target.value
                          .split(',')
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </label>
              </div>

              <div className="notes-property-group">
                <div className="notes-property-label">Color</div>
                <div className="notes-swatch-row">
                  {Object.entries(COLOR_MAP).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      aria-label={`Set ${key} color`}
                      className="notes-swatch"
                      data-active={(selectedNote.color || 'default') === key}
                      onClick={() => updateSelectedNote({ color: key })}
                      style={{ background: value }}
                    />
                  ))}
                </div>
              </div>

              <div className="notes-property-group">
                <button type="button" className="notes-secondary-action" onClick={() => updateSelectedNote({ is_pinned: !selectedNote.is_pinned })}>
                  <Pin size={15} />
                  {selectedNote.is_pinned ? 'Unpin note' : 'Pin note'}
                </button>
                <button type="button" className="notes-ai-action" onClick={() => handleAiAction('summarize')}>
                  <Bot size={15} />
                  Summarize with AI
                </button>
                <button type="button" className="notes-danger-action" onClick={() => deleteMutation.mutate(selectedNote.id)}>
                  <Trash2 size={15} />
                  Delete note
                </button>
              </div>

              <div className="notes-stat-box">
                <div>
                  <span>{wordCount}</span>
                  <small>Words</small>
                </div>
                <div>
                  <span>{plainText.length}</span>
                  <small>Chars</small>
                </div>
              </div>

              <div className="notes-date-stack">
                <div>
                  <span>Created</span>
                  <strong>{formatDate(selectedNote.created_at)}</strong>
                </div>
                <div>
                  <span>Updated</span>
                  <strong>{formatDate(selectedNote.updated_at || selectedNote.created_at)}</strong>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <style>{`
        .notes-workspace {
          display: grid;
          grid-template-columns: 176px 328px minmax(0, 1fr) auto;
          height: calc(100vh - var(--topbar-height) - 48px);
          margin: -24px;
          overflow: hidden;
          background: var(--bg-base);
        }

        .notes-category-rail,
        .notes-list-pane,
        .notes-inspector {
          background: var(--bg-sidebar);
          border-color: var(--border);
        }

        .notes-category-rail {
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 16px 12px;
          gap: 18px;
          min-width: 0;
        }

        .notes-rail-head {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 38px;
        }

        .notes-product-mark {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: var(--accent);
          color: oklch(98% 0.01 258);
          flex: 0 0 auto;
        }

        .notes-rail-title {
          color: var(--text-primary);
          font-size: 15px;
          font-weight: 650;
        }

        .notes-rail-subtitle {
          color: var(--text-muted);
          font-size: 13px;
          margin-top: 2px;
        }

        .notes-category-list {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .notes-category-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid transparent;
          border-radius: 8px;
          background: transparent;
          color: var(--text-secondary);
          padding: 8px 10px;
          font: 500 14px var(--font-sans);
          cursor: pointer;
          transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
        }

        .notes-category-button:hover,
        .notes-category-button[data-active="true"] {
          background: var(--bg-elevated);
          border-color: var(--border);
          color: var(--text-primary);
        }

        .notes-category-button span:last-child {
          color: var(--text-muted);
          font-size: 11px;
        }

        .notes-new-button,
        .notes-primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 0;
          border-radius: 9px;
          background: var(--accent-blue);
          color: oklch(98% 0.006 265);
          font: 650 13px var(--font-sans);
          cursor: pointer;
          transition: transform var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
        }

        .notes-new-button {
          margin-top: auto;
          padding: 10px 12px;
        }

        .notes-primary-button {
          padding: 10px 14px;
        }

        .notes-new-button:hover,
        .notes-primary-button:hover {
          transform: translateY(-1px);
          background: oklch(67% 0.22 255);
        }

        .notes-list-pane {
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .notes-list-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 18px 16px 12px;
          gap: 16px;
        }

        .notes-list-header h1 {
          margin: 0;
          color: var(--text-primary);
          font-size: 20px;
          line-height: 1.1;
          letter-spacing: 0;
        }

        .notes-list-header p {
          margin: 5px 0 0;
          color: var(--text-muted);
          font-size: 12px;
        }

        .notes-compact-icon,
        .notes-icon-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
          color: var(--text-secondary);
          background: transparent;
          cursor: pointer;
          transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
        }

        .notes-compact-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
        }

        .notes-icon-button {
          width: 30px;
          height: 30px;
          border-radius: 7px;
        }

        .notes-compact-icon:hover,
        .notes-icon-button:hover {
          background: var(--bg-hover);
          border-color: var(--border);
          color: var(--text-primary);
        }

        .notes-search {
          margin: 0 14px 12px;
          min-height: 36px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--bg-elevated);
          padding: 0 10px;
          color: var(--text-muted);
        }

        .notes-search input {
          min-width: 0;
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--text-primary);
          font: 400 13px var(--font-sans);
        }

        .notes-list-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 2px 10px 14px;
        }

        .notes-section-label {
          padding: 12px 7px 7px;
          color: var(--text-muted);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .notes-list-item {
          width: 100%;
          border: 1px solid transparent;
          border-radius: 11px;
          background: transparent;
          padding: 11px;
          color: var(--text-secondary);
          text-align: left;
          cursor: pointer;
          transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
        }

        .notes-list-item + .notes-list-item {
          margin-top: 3px;
        }

        .notes-list-item:hover,
        .notes-list-item[data-active="true"] {
          background: var(--bg-elevated);
          border-color: var(--border);
        }

        .notes-list-item[data-active="true"] {
          box-shadow: inset 0 0 0 1px oklch(63% 0.22 255 / 0.14);
        }

        .notes-list-item-top {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .notes-color-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          flex: 0 0 auto;
          box-shadow: 0 0 0 3px oklch(100% 0 0 / 0.04);
        }

        .notes-list-title {
          flex: 1;
          min-width: 0;
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 650;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .notes-list-preview {
          margin: 7px 0 9px;
          color: var(--text-muted);
          font-size: 12px;
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .notes-list-meta {
          display: flex;
          align-items: center;
          gap: 7px;
          color: var(--text-muted);
          font-size: 10.5px;
        }

        .notes-list-tag {
          max-width: 88px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 2px 7px;
          color: var(--text-secondary);
        }

        .notes-editor-pane {
          min-width: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: oklch(8.5% 0.014 265);
        }

        .notes-editor-chrome {
          border-bottom: 1px solid var(--border);
          background: oklch(10.5% 0.017 265 / 0.92);
        }

        .notes-breadcrumb {
          display: flex;
          align-items: center;
          gap: 5px;
          height: 34px;
          padding: 0 24px;
          color: var(--text-muted);
          font-size: 11.5px;
          border-bottom: 1px solid oklch(28% 0.035 265 / 0.35);
        }

        .notes-breadcrumb span:last-child {
          color: var(--text-secondary);
        }

        .notes-toolbar {
          min-height: 44px;
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 6px 18px;
          overflow-x: auto;
        }

        .notes-toolbar-separator {
          width: 1px;
          height: 20px;
          background: var(--border);
          margin: 0 5px;
          flex: 0 0 auto;
        }

        .notes-toolbar-spacer {
          flex: 1;
        }

        .notes-save-status {
          color: var(--text-muted);
          font-size: 11.5px;
          min-width: 48px;
          text-align: right;
        }

        .notes-save-status[data-state="saved"] {
          color: var(--accent-green);
        }

        .notes-editor-scroll {
          position: relative;
          flex: 1;
          overflow-y: auto;
        }

        .notes-document {
          max-width: 820px;
          margin: 0 auto;
          padding: 42px 48px 88px;
        }

        .notes-title-input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--text-primary);
          font: 760 34px/1.15 var(--font-sans);
          letter-spacing: 0;
          margin: 0 0 12px;
        }

        .notes-title-input::placeholder {
          color: var(--text-muted);
        }

        .notes-document-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 24px;
          color: var(--text-muted);
          font-size: 12px;
        }

        .notes-document-meta span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .notes-ai-toolbar {
          position: absolute;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          gap: 3px;
          padding: 5px;
          border: 1px solid var(--border-strong);
          border-radius: 10px;
          background: var(--bg-elevated);
          box-shadow: 0 14px 36px oklch(2% 0.01 265 / 0.45);
        }

        .notes-ai-mini-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 28px;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: var(--text-secondary);
          padding: 0 9px;
          font: 600 11.5px var(--font-sans);
          cursor: pointer;
        }

        .notes-ai-mini-button:hover,
        .notes-ai-mini-button[data-loading="true"] {
          background: var(--gradient-ai);
          color: oklch(98% 0.006 265);
        }

        .flowspace-editor {
          outline: none;
          color: var(--text-primary);
          font: 400 15px/1.78 var(--font-sans);
          letter-spacing: 0;
        }

        .flowspace-editor p {
          margin: 0 0 0.9em;
        }

        .flowspace-editor h1,
        .flowspace-editor h2,
        .flowspace-editor h3 {
          color: var(--text-primary);
          letter-spacing: 0;
        }

        .flowspace-editor h1 {
          font-size: 26px;
          line-height: 1.22;
          font-weight: 760;
          margin: 1.35em 0 0.48em;
        }

        .flowspace-editor h2 {
          font-size: 20px;
          line-height: 1.28;
          font-weight: 700;
          margin: 1.2em 0 0.45em;
        }

        .flowspace-editor h3 {
          font-size: 16px;
          line-height: 1.35;
          font-weight: 680;
          margin: 1em 0 0.35em;
        }

        .flowspace-editor ul,
        .flowspace-editor ol {
          padding-left: 1.35rem;
          margin: 0.55em 0 0.95em;
        }

        .flowspace-editor li {
          margin: 0.24em 0;
          padding-left: 0.1rem;
        }

        .flowspace-editor code {
          background: oklch(17% 0.022 265);
          border: 1px solid oklch(28% 0.035 265 / 0.5);
          border-radius: 5px;
          color: var(--accent-cyan);
          font-family: var(--font-mono);
          font-size: 0.92em;
          padding: 1px 5px;
        }

        .flowspace-editor pre {
          background: oklch(6% 0.012 265);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text-primary);
          padding: 14px 16px;
          overflow-x: auto;
          margin: 1em 0;
        }

        .flowspace-editor pre code {
          background: transparent;
          border: 0;
          padding: 0;
        }

        .flowspace-editor blockquote {
          margin: 1.05em 0;
          padding: 12px 14px;
          border: 1px solid oklch(63% 0.22 255 / 0.25);
          border-radius: 12px;
          background: oklch(63% 0.22 255 / 0.08);
          color: var(--text-secondary);
        }

        .flowspace-editor a {
          color: var(--accent-blue);
          text-decoration: none;
        }

        .flowspace-editor a:hover {
          text-decoration: underline;
        }

        .flowspace-editor ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
        }

        .flowspace-editor ul[data-type="taskList"] li {
          display: flex;
          gap: 9px;
          align-items: flex-start;
        }

        .flowspace-editor ul[data-type="taskList"] li > label {
          margin-top: 3px;
        }

        .flowspace-editor ul[data-type="taskList"] input {
          accent-color: var(--accent-blue);
        }

        .flowspace-editor p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: var(--text-muted);
          float: left;
          height: 0;
          pointer-events: none;
        }

        .notes-inspector {
          border-left: 1px solid var(--border);
          overflow: hidden;
        }

        .notes-inspector-inner {
          width: 260px;
          height: 100%;
          overflow-y: auto;
          padding: 16px;
        }

        .notes-inspector-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--text-primary);
          font-weight: 700;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .notes-property-group {
          border-top: 1px solid var(--border);
          padding: 14px 0;
        }

        .notes-property-group label,
        .notes-property-label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 650;
        }

        .notes-property-group label + label {
          margin-top: 12px;
        }

        .notes-property-group input,
        .notes-property-group select {
          width: 100%;
          min-height: 34px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg-elevated);
          color: var(--text-primary);
          padding: 0 10px;
          font: 500 12px var(--font-sans);
          outline: 0;
        }

        .notes-swatch-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }

        .notes-swatch {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          border: 1px solid oklch(90% 0.01 265 / 0.18);
          cursor: pointer;
          transition: transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
        }

        .notes-swatch[data-active="true"] {
          box-shadow: 0 0 0 3px oklch(94% 0.008 265 / 0.16);
          transform: scale(1.04);
        }

        .notes-secondary-action,
        .notes-ai-action,
        .notes-danger-action {
          width: 100%;
          min-height: 34px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--border);
          border-radius: 9px;
          background: transparent;
          color: var(--text-secondary);
          padding: 0 10px;
          font: 600 12px var(--font-sans);
          cursor: pointer;
          margin-bottom: 8px;
        }

        .notes-secondary-action:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .notes-ai-action {
          background: oklch(63% 0.22 255 / 0.1);
          border-color: oklch(63% 0.22 255 / 0.25);
          color: var(--text-primary);
        }

        .notes-danger-action:hover {
          background: var(--tint-red);
          border-color: oklch(58% 0.23 22 / 0.28);
          color: var(--accent-red);
        }

        .notes-stat-box {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          border-top: 1px solid var(--border);
          padding-top: 14px;
        }

        .notes-stat-box div {
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--bg-elevated);
          padding: 10px;
        }

        .notes-stat-box span {
          display: block;
          color: var(--text-primary);
          font-size: 18px;
          font-weight: 760;
        }

        .notes-stat-box small {
          color: var(--text-muted);
          font-size: 10px;
        }

        .notes-date-stack {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .notes-date-stack div {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: var(--text-muted);
          font-size: 11px;
        }

        .notes-date-stack strong {
          color: var(--text-secondary);
          font-weight: 600;
          text-align: right;
        }

        .notes-empty-editor,
        .notes-empty-list {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--text-muted);
          padding: 24px;
        }

        .notes-empty-editor h2,
        .notes-empty-list strong {
          color: var(--text-primary);
          margin: 12px 0 4px;
        }

        .notes-empty-editor p,
        .notes-empty-list span {
          margin: 0 0 16px;
          font-size: 13px;
          max-width: 260px;
          line-height: 1.5;
        }

        .notes-empty-icon {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          color: var(--text-secondary);
        }

        .notes-loading {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 8px 2px;
        }

        .notes-loading div {
          height: 72px;
          border-radius: 11px;
          background: linear-gradient(90deg, var(--bg-elevated), var(--bg-hover), var(--bg-elevated));
          background-size: 220% 100%;
          animation: notes-shimmer 1.25s ease-in-out infinite;
        }

        @keyframes notes-shimmer {
          from { background-position: 120% 0; }
          to { background-position: -120% 0; }
        }

        @media (max-width: 1160px) {
          .notes-workspace {
            grid-template-columns: 148px 300px minmax(0, 1fr);
          }

          .notes-inspector {
            display: none;
          }
        }

        @media (max-width: 860px) {
          .notes-workspace {
            grid-template-columns: 1fr;
            height: auto;
            min-height: calc(100vh - var(--topbar-height));
            margin: -16px;
            overflow: visible;
          }

          .notes-category-rail,
          .notes-list-pane {
            border-right: 0;
            border-bottom: 1px solid var(--border);
          }

          .notes-category-rail {
            padding: 12px;
          }

          .notes-category-list {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }

          .notes-new-button {
            margin-top: 0;
          }

          .notes-list-pane {
            max-height: 360px;
          }

          .notes-document {
            padding: 28px 20px 64px;
          }

          .notes-title-input {
            font-size: 28px;
          }
        }
      `}</style>
    </motion.div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return <div className="notes-section-label">{label}</div>
}

function NoteListItem({ note, active, onSelect }: { note: Note; active: boolean; onSelect: () => void }) {
  const preview = stripHtml(note.content) || 'Empty note'
  const firstTag = note.tags?.[0]

  return (
    <button type="button" className="notes-list-item" data-active={active} onClick={onSelect}>
      <div className="notes-list-item-top">
        <span className="notes-color-dot" style={{ background: COLOR_MAP[note.color || 'default'] ?? COLOR_MAP.default }} />
        <span className="notes-list-title">{note.title || 'Untitled note'}</span>
        {note.is_pinned && <Pin size={12} color="var(--accent-amber)" />}
      </div>
      <div className="notes-list-preview">{preview}</div>
      <div className="notes-list-meta">
        <span>{note.category || 'Personal'}</span>
        <span>•</span>
        <span>{format(new Date(note.updated_at || note.created_at), 'dd MMM')}</span>
        {firstTag && <span className="notes-list-tag">{firstTag}</span>}
      </div>
    </button>
  )
}
