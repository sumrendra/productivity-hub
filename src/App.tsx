import { Toaster } from 'sonner'
import AppRoutes from './routes'
import CommandPalette from './components/shared/CommandPalette'

export default function App() {
  return (
    <>
      <AppRoutes />
      <CommandPalette />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          },
        }}
      />
    </>
  )
}
