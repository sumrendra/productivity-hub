interface StatCardProps {
  label: string
  value: string
  sublabel?: string
  tint?: 'blue' | 'green' | 'red' | 'amber'
  emphasis?: 'large' | 'normal'
}

const tintClass: Record<NonNullable<StatCardProps['tint']>, string> = {
  blue: 'fs-metric--accent',
  green: 'fs-metric--success',
  red: 'fs-metric--danger',
  amber: 'fs-metric--warning',
}

export function StatCard({ label, value, sublabel, tint, emphasis = 'normal' }: StatCardProps) {
  return (
    <div className={`fs-metric ${tint ? tintClass[tint] : ''}`}>
      <div className="fs-metric-label">{label}</div>
      <div className={emphasis === 'large' ? 'fs-metric-value fs-metric-value--hero' : 'fs-metric-value'}>
        {value}
      </div>
      {sublabel && <div className="fs-metric-hint">{sublabel}</div>}
    </div>
  )
}
