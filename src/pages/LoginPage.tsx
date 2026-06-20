import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient } from '@/lib/auth-client'
import { AuthLayout, AuthLink } from '@/components/layout/AuthLayout'
import { toast } from 'sonner'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await authClient.signIn.email({ email, password })
      if (error) {
        toast.error(error.message || 'Sign in failed')
        return
      }
      toast.success('Welcome back')
      navigate('/dashboard')
    } catch {
      toast.error('Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      description="Continue to your workspace."
      footer={
        <>
          No account? <AuthLink to="/register">Create one</AuthLink>
        </>
      }
    >
      <form className="fs-auth-form" onSubmit={handleSubmit}>
        <div>
          <label className="fs-label" htmlFor="email">Email</label>
          <input
            id="email"
            className="fs-input"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="fs-label" htmlFor="password">Password</label>
          <input
            id="password"
            className="fs-input"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="fs-btn fs-btn--primary" disabled={loading} style={{ width: '100%', height: 40 }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}
