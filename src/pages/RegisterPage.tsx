import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient } from '@/lib/auth-client'
import { AuthLayout, AuthLink } from '@/components/layout/AuthLayout'
import { toast } from 'sonner'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const { error } = await authClient.signUp.email({ name, email, password })
      if (error) {
        toast.error(error.message || 'Registration failed')
        return
      }
      toast.success('Account created')
      navigate('/dashboard')
    } catch {
      toast.error('Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create account"
      description="The first account on this server inherits existing workspace data."
      footer={
        <>
          Already registered? <AuthLink to="/login">Sign in</AuthLink>
        </>
      }
    >
      <form className="fs-auth-form" onSubmit={handleSubmit}>
        <div>
          <label className="fs-label" htmlFor="name">Name</label>
          <input
            id="name"
            className="fs-input"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="fs-btn fs-btn--primary" disabled={loading} style={{ width: '100%', height: 40 }}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}
