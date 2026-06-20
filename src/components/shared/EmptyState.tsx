import { type LucideProps } from 'lucide-react'

interface EmptyStateProps {
  icon: React.ComponentType<LucideProps>
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="fs-empty">
      <Icon size={28} strokeWidth={1.5} color="var(--text-faint)" />
      <h3 className="fs-empty-title">{title}</h3>
      <p className="fs-empty-desc">{description}</p>
      {action && (
        <button type="button" className="fs-btn fs-btn--primary" onClick={action.onClick} style={{ marginTop: 8 }}>
          {action.label}
        </button>
      )}
    </div>
  )
}
