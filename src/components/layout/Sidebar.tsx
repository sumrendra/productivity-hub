import { motion, AnimatePresence } from 'motion/react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Link2,
  Wallet,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
} from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'Notes', path: '/notes' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Link2, label: 'Links', path: '/links' },
  { icon: Wallet, label: 'Finance', path: '/finance' },
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, toggleAIChat } = useUIStore()
  const location = useLocation()
  const expanded = sidebarOpen

  return (
    <motion.nav
      className="fs-sidebar"
      animate={{ width: expanded ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed)' }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Main navigation"
    >
      <div className="fs-sidebar-nav">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
          const active =
            location.pathname === path ||
            (path === '/dashboard' && location.pathname === '/')

          return (
            <NavLink
              key={path}
              to={path}
              title={!expanded ? label : undefined}
              className={cn('fs-nav-item', active && 'fs-nav-item--active')}
              style={{ justifyContent: expanded ? 'flex-start' : 'center' }}
            >
              <Icon size={17} strokeWidth={active ? 2.25 : 1.75} />
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          )
        })}

        <div className="fs-nav-divider" />

        <button
          type="button"
          onClick={toggleAIChat}
          title={!expanded ? 'AI assistant' : undefined}
          className="fs-nav-item fs-nav-item--ai"
          style={{ justifyContent: expanded ? 'flex-start' : 'center', width: '100%' }}
        >
          <Sparkles size={17} className="fs-nav-icon-ai" />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                Assistant
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <NavLink
          to="/settings"
          title={!expanded ? 'Settings' : undefined}
          className={cn(
            'fs-nav-item',
            location.pathname === '/settings' && 'fs-nav-item--active',
          )}
          style={{ justifyContent: expanded ? 'flex-start' : 'center' }}
        >
          <Settings size={17} />
          <AnimatePresence>
            {expanded && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
      </div>

      <div className="fs-sidebar-footer">
        <button
          type="button"
          onClick={toggleSidebar}
          className="fs-nav-item fs-btn--ghost"
          style={{ width: '100%', justifyContent: 'center' }}
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
        </button>
      </div>
    </motion.nav>
  )
}
