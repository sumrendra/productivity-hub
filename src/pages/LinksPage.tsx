import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, ExternalLink, Trash2, Link2, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { linksApi } from '@/services/api'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Link } from '@/types'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 8, color: 'var(--text-primary)', fontSize: 13,
  fontFamily: 'var(--font-sans)', outline: 'none',
}

export default function LinksPage() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [activeCollection, setActiveCollection] = useState<string | null>(null)
  const [url, setUrl] = useState('')
  const [fetching, setFetching] = useState(false)
  const [form, setForm] = useState<Partial<Link>>({})
  const [searchQuery, setSearchQuery] = useState('')

  const { data: links = [], isPending } = useQuery({
    queryKey: ['links'],
    queryFn: linksApi.getAll,
  })

  const collections = useMemo(() => {
    const cols = links.map(l => l.collection).filter(Boolean) as string[]
    return [...new Set(cols)]
  }, [links])

  const filtered = useMemo(() => {
    let result = links
    if (activeCollection) {
      result = result.filter(l => l.collection === activeCollection)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(l => 
        (l.title && l.title.toLowerCase().includes(q)) ||
        (l.url && l.url.toLowerCase().includes(q)) ||
        (l.description && l.description.toLowerCase().includes(q)) ||
        (l.collection && l.collection.toLowerCase().includes(q))
      )
    }
    return result
  }, [links, activeCollection, searchQuery])

  const createMutation = useMutation({
    mutationFn: (data: Partial<Link>) => linksApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['links'] })
      setShowAdd(false)
      setUrl('')
      setForm({})
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => linksApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['links'] }),
  })

  const handleFetchMetadata = async () => {
    if (!url.trim()) return
    setFetching(true)
    try {
      const meta = await linksApi.fetchMetadata(url.trim())
      setForm({ url: url.trim(), title: meta.title, description: meta.description, favicon: meta.favicon, og_image: meta.og_image })
    } catch {
      setForm({ url: url.trim(), title: url.trim() })
    } finally {
      setFetching(false)
    }
  }

  const handleSave = () => {
    if (!form.url || !form.title) return
    createMutation.mutate(form)
  }

  const handleLinkClick = (link: Link) => {
    window.open(link.url, '_blank', 'noopener,noreferrer')
    linksApi.trackVisit(link.id).catch(() => {})
  }

  return (
    <div className="fs-page">
      <PageHeader
        title="Links"
        subtitle="Save URLs with titles and previews pulled automatically."
        action={
          <button type="button" className="fs-btn fs-btn--primary" onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Add link
          </button>
        }
      />

      {/* Search & Collections filter */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          placeholder="Search links..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ ...inputStyle, width: 220, borderRadius: 20, padding: '7px 14px' }}
        />
        {collections.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => setActiveCollection(null)} style={{
            padding: '5px 12px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'background var(--dur-fast)',
            background: !activeCollection ? 'var(--accent-blue)' : 'var(--bg-elevated)',
            color: !activeCollection ? 'white' : 'var(--text-secondary)',
          }}>All</button>
          {collections.map(col => (
            <button key={col} onClick={() => setActiveCollection(col === activeCollection ? null : col)} style={{
              padding: '5px 12px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'background var(--dur-fast)',
              background: activeCollection === col ? 'var(--accent-purple)' : 'var(--bg-elevated)',
              color: activeCollection === col ? 'white' : 'var(--text-secondary)',
            }}>{col}</button>
          ))}
          </div>
        )}
      </div>

      {/* Add Link Modal */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              onClick={() => { setShowAdd(false); setUrl(''); setForm({}) }}
              style={{ position: 'fixed', inset: 0, background: 'oklch(5% 0.01 265 / 0.7)', backdropFilter: 'blur(4px)', zIndex: 200 }} />
            <motion.div initial={{ opacity: 0, scale: 0.97, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'fixed', top: '20vh', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 14, zIndex: 201, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Add Link</div>
                <button onClick={() => { setShowAdd(false); setUrl(''); setForm({}) }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={15} />
                </button>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* URL input + fetch */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    placeholder="Paste URL..."
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleFetchMetadata()}
                    style={inputStyle}
                    autoFocus
                  />
                  <button onClick={handleFetchMetadata} disabled={fetching || !url.trim()} style={{
                    padding: '9px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 8, color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
                    opacity: fetching || !url.trim() ? 0.5 : 1,
                  }}>
                    {fetching ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                    {fetching ? 'Fetching...' : 'Fetch'}
                  </button>
                </div>

                {/* Auto-populated fields */}
                {form.url && (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {/* Preview */}
                      {(form.favicon || form.title) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                          {form.favicon && <img src={form.favicon} width={20} height={20} style={{ borderRadius: 4 }} onError={e => { e.currentTarget.style.display = 'none' }} />}
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.title}</div>
                        </div>
                      )}
                      <input placeholder="Title" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
                      <input placeholder="Description (optional)" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={inputStyle} />
                      <input placeholder="Collection (optional)" value={form.collection || ''} onChange={e => setForm(f => ({ ...f, collection: e.target.value }))} style={inputStyle} />
                      <button onClick={handleSave} disabled={createMutation.isPending} style={{
                        padding: '9px', background: 'var(--accent-blue)', color: 'white', border: 'none',
                        borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                        opacity: createMutation.isPending ? 0.6 : 1,
                      }}>{createMutation.isPending ? 'Saving...' : 'Save Link'}</button>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cards grid */}
      {isPending ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, height: 140, opacity: 0.5 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Link2} title="No links yet" description="Add your first bookmark. Paste a URL and we'll auto-fetch the title, description, and favicon." action={{ label: 'Add Link', onClick: () => setShowAdd(true) }} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {filtered.map(link => (
            <div
              key={link.id}
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                transition: 'border-color var(--dur-fast), transform var(--dur-fast)',
                display: 'flex', flexDirection: 'column',
              }}
              onClick={() => handleLinkClick(link)}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-strong)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* OG Image */}
              {link.og_image && (
                <div style={{ height: 120, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                  <img src={link.og_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.parentElement!.style.display = 'none' }} />
                </div>
              )}
              <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {/* Title + favicon */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    {link.favicon ? (
                      <img src={link.favicon} width={16} height={16} style={{ borderRadius: 3, flexShrink: 0 }} onError={e => { e.currentTarget.style.display = 'none' }} />
                    ) : (
                      <Link2 size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {link.title || link.url}
                    </span>
                  </div>
                  <ExternalLink size={13} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 1 }} />
                </div>

                {/* Description */}
                {link.description && (
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {link.description}
                  </p>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {link.collection && (
                      <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: 'var(--tint-purple)', color: 'var(--accent-purple)' }}>
                        {link.collection}
                      </span>
                    )}
                    {(link.visit_count ?? 0) > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{link.visit_count} visits</span>
                    )}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteMutation.mutate(link.id) }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 26, height: 26, borderRadius: 6, border: 'none',
                      background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)',
                      transition: 'background var(--dur-fast), color var(--dur-fast)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--tint-red)'; e.currentTarget.style.color = 'oklch(58% 0.23 22)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
