import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authClient, useSession } from '@/lib/auth-client'
import { api } from '@/services/api'
import { PageHeader } from '@/components/shared/PageHeader'
import { toast } from 'sonner'

export default function SettingsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get<Record<string, unknown>>('/settings'),
  })

  useEffect(() => {
    const saved = settings?.theme as 'dark' | 'light' | undefined
    if (saved) {
      setTheme(saved)
      document.documentElement.dataset.theme = saved
    }
  }, [settings])

  const saveMutation = useMutation({
    mutationFn: (value: unknown) => api.put('/settings/theme', { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Saved')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleThemeChange = (next: 'dark' | 'light') => {
    setTheme(next)
    document.documentElement.dataset.theme = next
    saveMutation.mutate(next)
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    queryClient.clear()
    navigate('/login')
    toast.success('Signed out')
  }

  return (
    <div className="fs-page">
      <PageHeader title="Settings" subtitle="Account and how FlowSpace looks on this device." />

      <div className="fs-settings-stack">
        <section className="fs-panel fs-panel-pad">
          <h2 className="fs-page-title" style={{ fontSize: 'var(--text-md)', marginBottom: 12 }}>Account</h2>
          <dl style={{ display: 'grid', gap: 10, fontSize: 'var(--text-sm)' }}>
            <div className="fs-settings-row">
              <dt style={{ color: 'var(--text-muted)' }}>Name</dt>
              <dd>{session?.user.name}</dd>
            </div>
            <div className="fs-settings-row">
              <dt style={{ color: 'var(--text-muted)' }}>Email</dt>
              <dd>{session?.user.email}</dd>
            </div>
          </dl>
        </section>

        <section className="fs-panel fs-panel-pad">
          <div className="fs-settings-row">
            <div>
              <h2 className="fs-page-title" style={{ fontSize: 'var(--text-md)' }}>Appearance</h2>
              <p className="fs-page-subtitle" style={{ marginTop: 4 }}>Light theme expands in a later pass.</p>
            </div>
            <div className="fs-segmented" role="group" aria-label="Theme">
              {(['dark', 'light'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  data-active={theme === option}
                  onClick={() => handleThemeChange(option)}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="fs-panel fs-panel-pad">
          <button type="button" className="fs-btn fs-btn--danger-ghost" onClick={handleSignOut}>
            <LogOut size={15} />
            Sign out
          </button>
        </section>
      </div>
    </div>
  )
}
