import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'
import { AnimatePresence, motion } from 'motion/react'
import { Search, LayoutDashboard, FileText, CheckSquare, Link2, Wallet, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'Notes', path: '/notes' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Link2, label: 'Links', path: '/links' },
  { icon: Wallet, label: 'Finance', path: '/finance' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPalette } = useUIStore()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPalette(true)
      }
      if (e.key === 'Escape') setCommandPalette(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [setCommandPalette])

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div
            className="fs-palette-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setCommandPalette(false)}
          />
          <motion.div
            className="fs-palette"
            initial={{ opacity: 0, scale: 0.98, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Command palette"
          >
            <div className="fs-palette-input-row">
              <Search size={16} color="var(--text-faint)" />
              <input
                className="fs-palette-input"
                autoFocus
                placeholder="Where to?"
                aria-label="Search"
              />
              <kbd className="fs-kbd">esc</kbd>
            </div>
            <div className="fs-palette-list">
              <div className="fs-palette-group-label">Go to</div>
              {ITEMS.map(({ icon: Icon, label, path }) => (
                <button
                  key={path}
                  type="button"
                  className="fs-palette-item"
                  onClick={() => {
                    navigate(path)
                    setCommandPalette(false)
                  }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
            <div className="fs-palette-footer">
              <span>↑↓ move</span>
              <span>↵ open</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
