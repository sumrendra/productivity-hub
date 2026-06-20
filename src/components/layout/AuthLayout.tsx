import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  title: string
  description: string
  footer: React.ReactNode
  children: React.ReactNode
}

export function AuthLayout({ title, description, footer, children }: AuthLayoutProps) {
  return (
    <div className="fs-auth">
      <aside className="fs-auth-brand">
        <div className="fs-auth-brand-mark">
          <div className="fs-auth-brand-icon" aria-hidden>F</div>
          <span className="fs-auth-brand-name">FlowSpace</span>
        </div>
        <p className="fs-auth-quote">
          One calm place for notes, tasks, links, and money. Built for long evenings at the desk.
        </p>
        <p className="fs-page-subtitle">Self-hosted. Yours.</p>
      </aside>
      <main className="fs-auth-form-side">
        <div className="fs-auth-card">
          <h1 className="fs-auth-title">{title}</h1>
          <p className="fs-auth-desc">{description}</p>
          {children}
          <p className="fs-auth-footer">{footer}</p>
        </div>
      </main>
    </div>
  )
}

export function AuthLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="fs-auth-link">
      {children}
    </Link>
  )
}
