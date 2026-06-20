import { Search, Sparkles } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { useUIStore } from '@/store/uiStore'

export default function TopBar() {
  const { toggleAIChat, setCommandPalette } = useUIStore()
  const { data: session } = useSession()
  const initial = session?.user.name?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <header className="fs-topbar">
      <button
        type="button"
        className="fs-topbar-search"
        onClick={() => setCommandPalette(true)}
        aria-label="Open command palette"
      >
        <Search size={15} />
        <span style={{ flex: 1, textAlign: 'left' }}>Search or jump to…</span>
        <kbd className="fs-kbd">⌘K</kbd>
      </button>

      <div className="fs-topbar-actions">
        <button type="button" className="fs-btn fs-btn--ai" onClick={toggleAIChat}>
          <Sparkles size={15} />
          <span>Ask</span>
        </button>
        <div
          className="fs-btn fs-btn--ghost fs-btn--icon"
          title={session?.user.email ?? 'Account'}
          aria-hidden
          style={{
            borderRadius: '50%',
            background: 'var(--accent-muted)',
            color: 'var(--accent)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: 'default',
          }}
        >
          {initial}
        </div>
      </div>
    </header>
  )
}
