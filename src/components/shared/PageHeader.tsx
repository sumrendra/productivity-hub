import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <header className={cn('fs-page-header', className)}>
      <div className="fs-page-toolbar">
        <div>
          <h1 className="fs-page-title">{title}</h1>
          {subtitle && <p className="fs-page-subtitle">{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  )
}

export function GreetingHeader({ name }: { name?: string }) {
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="fs-dash-greeting">
      <p className="fs-page-subtitle">{format(new Date(), 'EEEE, d MMMM')}</p>
      <h1>
        {greeting}
        {name ? `, ${name.split(' ')[0]}` : ''}
      </h1>
    </div>
  )
}
