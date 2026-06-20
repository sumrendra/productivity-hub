import { Outlet } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import AIChatSidebar from '@/components/ai/AIChatSidebar'
import { cn } from '@/lib/utils'

export default function AppShell() {
  const { aiChatOpen } = useUIStore()

  return (
    <div className="fs-app">
      <TopBar />
      <div className="fs-app-body">
        <Sidebar />
        <main className={cn('fs-main', aiChatOpen && 'fs-main--ai-open')}>
          <div className="fs-main-inner">
            <Outlet />
          </div>
        </main>
        <AIChatSidebar />
      </div>
    </div>
  )
}
