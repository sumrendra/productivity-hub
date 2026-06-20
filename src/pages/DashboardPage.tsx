import { useQueries } from '@tanstack/react-query'
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { FileText, CheckSquare, Link2, Sparkles, TrendingUp } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { dashboardApi, aiApi, expensesApi, tasksApi } from '@/services/api'
import { GreetingHeader } from '@/components/shared/PageHeader'
import { useSession } from '@/lib/auth-client'
import type { Expense, Task } from '@/types'

const STATUS_COLORS: Record<Task['status'], string> = {
  todo: 'oklch(48% 0.02 258)',
  in_progress: 'oklch(78% 0.14 78)',
  done: 'oklch(68% 0.16 152)',
}

const tooltipStyle = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text-primary)',
  fontSize: 12,
  fontFamily: 'var(--font-sans)',
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const results = useQueries({
    queries: [
      { queryKey: ['dashboard'], queryFn: dashboardApi.getSummary },
      { queryKey: ['ai-brief'], queryFn: aiApi.dailyBrief, staleTime: 1000 * 60 * 60 },
      { queryKey: ['expenses'], queryFn: expensesApi.getAll, staleTime: 1000 * 60 * 5 },
      { queryKey: ['tasks'], queryFn: tasksApi.getAll, staleTime: 1000 * 60 * 5 },
    ],
  })

  const [summaryQ, briefQ, expensesQ, tasksQ] = results
  const summary = summaryQ.data
  const brief = briefQ.data?.brief
  const expenses: Expense[] = expensesQ.data ?? []
  const tasks: Task[] = tasksQ.data ?? []

  const sparklineData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayExpenses = expenses.filter((e) => e.date?.startsWith(dateStr))
    const income = dayExpenses.filter((e) => e.type === 'income').reduce((s, e) => s + Number(e.amount), 0)
    const expense = dayExpenses.filter((e) => e.type === 'expense').reduce((s, e) => s + Number(e.amount), 0)
    return { date: format(date, 'dd MMM'), income, expense }
  })

  const taskCounts = {
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }
  const taskDonutData = [
    { name: 'Todo', value: taskCounts.todo, status: 'todo' as Task['status'] },
    { name: 'In progress', value: taskCounts.in_progress, status: 'in_progress' as Task['status'] },
    { name: 'Done', value: taskCounts.done, status: 'done' as Task['status'] },
  ].filter((d) => d.value > 0)

  const fmt = (n: number) => `₹${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  const net = summary?.net_balance ?? 0

  return (
    <div className="fs-page">
      <GreetingHeader name={session?.user.name} />

      <div className="fs-dash-metrics">
        <div className={net >= 0 ? 'fs-metric fs-metric--span-5 fs-metric--success' : 'fs-metric fs-metric--span-5 fs-metric--danger'}>
          <div className="fs-metric-label">Net balance</div>
          <div className="fs-metric-value fs-metric-value--hero">
            {summary ? `${net < 0 ? '−' : ''}${fmt(net)}` : '—'}
          </div>
          <div className="fs-metric-hint">Income minus expenses, all time</div>
        </div>

        <div className="fs-metric fs-metric--span-3 fs-metric--warning">
          <div className="fs-metric-label">Open tasks</div>
          <div className="fs-metric-value">{summary?.active_tasks_count ?? '—'}</div>
          <div className="fs-metric-hint">Not marked done</div>
        </div>

        <div className="fs-metric fs-metric--span-2">
          <div className="fs-metric-label">Notes</div>
          <div className="fs-metric-value">{summary?.notes_count ?? '—'}</div>
        </div>

        <div className="fs-metric fs-metric--span-2">
          <div className="fs-metric-label">Links</div>
          <div className="fs-metric-value">{summary?.links_count ?? '—'}</div>
        </div>
      </div>

      <section className="fs-ai-brief" aria-label="Daily brief">
        <div className="fs-ai-brief-icon">
          <Sparkles size={18} />
        </div>
        <div>
          <div className="fs-ai-brief-label">Brief</div>
          <p className="fs-ai-brief-text">
            {briefQ.isPending
              ? 'Pulling together what needs attention…'
              : brief ?? 'Add notes, tasks, and transactions to get a personalized brief.'}
          </p>
        </div>
      </section>

      <div className="fs-dash-grid">
        <div className="fs-panel">
          <div className="fs-panel-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={15} color="var(--text-muted)" />
            Cash flow · 30 days
          </div>
          <div className="fs-panel-pad">
            <ResponsiveContainer width="100%" height={168}>
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--danger)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="income" stroke="var(--success)" strokeWidth={1.5} fill="url(#incomeGrad)" name="Income" />
                <Area type="monotone" dataKey="expense" stroke="var(--danger)" strokeWidth={1.5} fill="url(#expenseGrad)" name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="fs-panel">
          <div className="fs-panel-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckSquare size={15} color="var(--text-muted)" />
            Tasks
          </div>
          <div className="fs-panel-pad">
            {tasks.length === 0 ? (
              <p className="fs-empty-desc" style={{ textAlign: 'left' }}>No tasks yet</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={taskDonutData} cx="50%" cy="50%" innerRadius={36} outerRadius={52} dataKey="value" paddingAngle={2}>
                      {taskDonutData.map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.status]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {(['todo', 'in_progress', 'done'] as Task['status'][]).map((s) => (
                    <div key={s} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {s === 'in_progress' ? 'In progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </span>
                      <span style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{taskCounts[s]}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {summary?.recent_activity && summary.recent_activity.length > 0 && (
        <div className="fs-panel" style={{ marginTop: 12 }}>
          <div className="fs-panel-header">Recent</div>
          {summary.recent_activity.slice(0, 8).map((item, i) => {
            const icons = { note: FileText, task: CheckSquare, link: Link2, expense: TrendingUp }
            const Icon = icons[item.type] || FileText
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 20px',
                  borderBottom: i < Math.min((summary.recent_activity ?? []).length, 8) - 1 ? '1px solid var(--border)' : 'none',
                  fontSize: 'var(--text-sm)',
                }}
              >
                <Icon size={14} color="var(--text-faint)" />
                <span style={{ flex: 1, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-faint)', textTransform: 'capitalize' }}>{item.action}</span>{' '}
                  <span style={{ color: 'var(--text-primary)' }}>{item.title}</span>
                </span>
                <span style={{ color: 'var(--text-faint)', fontSize: 'var(--text-xs)' }}>
                  {format(new Date(item.timestamp), 'dd MMM HH:mm')}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
