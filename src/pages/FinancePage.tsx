import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { Plus, Trash2, ArrowDownLeft, ArrowUpRight, Sparkles, Wallet } from 'lucide-react'
import { format, subDays, subMonths, isAfter } from 'date-fns'
import { motion, AnimatePresence } from 'motion/react'
import { expensesApi, aiApi } from '@/services/api'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Expense } from '@/types'

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Utilities', 'Salary', 'Freelance', 'Other']
const CAT_COLORS: Record<string, string> = {
  Food: 'oklch(65% 0.20 150)',
  Transport: 'oklch(63% 0.22 255)',
  Shopping: 'oklch(55% 0.26 295)',
  Entertainment: 'oklch(72% 0.18 200)',
  Health: 'oklch(65% 0.16 150)',
  Utilities: 'oklch(78% 0.18 85)',
  Salary: 'oklch(65% 0.20 150)',
  Freelance: 'oklch(63% 0.22 255)',
  Other: 'oklch(48% 0.03 265)',
}

type DateFilter = '7d' | '30d' | '90d' | 'all'
type SortField = 'date' | 'amount' | 'description'
type SortDir = 'asc' | 'desc'

const fmt = (n: number) => `₹${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

const filterByDate = (expenses: Expense[], filter: DateFilter) => {
  if (filter === 'all') return expenses
  const cutoff = filter === '7d' ? subDays(new Date(), 7)
    : filter === '30d' ? subDays(new Date(), 30)
    : subMonths(new Date(), 3)
  return expenses.filter(e => isAfter(new Date(e.date), cutoff))
}

const inputStyle: React.CSSProperties = {
  flex: 1, minWidth: 140, padding: '8px 10px',
  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 8, color: 'var(--text-primary)', fontSize: 13,
  fontFamily: 'var(--font-sans)', outline: 'none',
}
const selectStyle: React.CSSProperties = {
  padding: '8px 10px', background: 'var(--bg-elevated)',
  border: '1px solid var(--border)', borderRadius: 8,
  color: 'var(--text-primary)', fontSize: 13,
  fontFamily: 'var(--font-sans)', outline: 'none', cursor: 'pointer',
}

export default function FinancePage() {
  const qc = useQueryClient()
  const [dateFilter, setDateFilter] = useState<DateFilter>('30d')
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: 'date', dir: 'desc' })
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    description: '', amount: '', category: 'Food',
    type: 'expense' as 'income' | 'expense',
    date: format(new Date(), 'yyyy-MM-dd'),
  })

  const { data: allExpenses = [], isPending } = useQuery({
    queryKey: ['expenses'],
    queryFn: expensesApi.getAll,
  })

  const { data: aiInsight, isPending: insightPending } = useQuery({
    queryKey: ['finance-insight'],
    queryFn: aiApi.financeInsight,
    staleTime: 1000 * 60 * 60,
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Expense>) => expensesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['finance-insight'] })
      setForm({ description: '', amount: '', category: 'Food', type: 'expense', date: format(new Date(), 'yyyy-MM-dd') })
      setShowAdd(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => expensesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })

  const filtered = useMemo(() => filterByDate(allExpenses, dateFilter), [allExpenses, dateFilter])

  const stats = useMemo(() => {
    const income = allExpenses.filter(e => e.type === 'income').reduce((s, e) => s + Number(e.amount), 0)
    const expense = allExpenses.filter(e => e.type === 'expense').reduce((s, e) => s + Number(e.amount), 0)
    const net = income - expense
    const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0
    return { income, expense, net, savingsRate }
  }, [allExpenses])

  const monthlyData = useMemo(() => {
    const byMonth: Record<string, { month: string; income: number; expense: number }> = {}
    allExpenses.forEach(e => {
      const key = format(new Date(e.date), 'yyyy-MM')
      if (!byMonth[key]) byMonth[key] = { month: format(new Date(e.date), 'MMM'), income: 0, expense: 0 }
      if (e.type === 'income') byMonth[key].income += Number(e.amount)
      else byMonth[key].expense += Number(e.amount)
    })
    return Object.values(byMonth).slice(-6)
  }, [allExpenses])

  const categoryData = useMemo(() => {
    const byCat: Record<string, number> = {}
    filtered.filter(e => e.type === 'expense').forEach(e => {
      byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount)
    })
    return Object.entries(byCat).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [filtered])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0
      if (sort.field === 'date') cmp = new Date(a.date).getTime() - new Date(b.date).getTime()
      else if (sort.field === 'amount') cmp = Number(a.amount) - Number(b.amount)
      else cmp = a.description.localeCompare(b.description)
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sort])

  const toggleSort = (field: SortField) => {
    setSort(s => s.field === field ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'desc' })
  }

  const handleAdd = () => {
    if (!form.description || !form.amount) return
    createMutation.mutate({ ...form, amount: parseFloat(form.amount) } as Partial<Expense>)
  }

  const tooltipStyle = {
    background: 'oklch(17% 0.022 265)',
    border: '1px solid oklch(28% 0.035 265 / 0.6)',
    borderRadius: 8, color: 'oklch(94% 0.008 265)', fontSize: 12,
  }

  const FILTER_OPTS: { label: string; value: DateFilter }[] = [
    { label: '7d', value: '7d' }, { label: '30d', value: '30d' },
    { label: '3mo', value: '90d' }, { label: 'All', value: 'all' },
  ]

  return (
    <div className="fs-page">
      <PageHeader
        title="Finance"
        subtitle="Income, spending, and where the month is heading."
        action={
          <button type="button" className="fs-btn fs-btn--primary" onClick={() => setShowAdd((v) => !v)}>
            <Plus size={15} /> Add entry
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <StatCard
          label="Net balance"
          value={`${stats.net < 0 ? '−' : ''}${fmt(stats.net)}`}
          sublabel="all time"
          tint={stats.net >= 0 ? 'green' : 'red'}
          emphasis="large"
        />
        <StatCard label="Income" value={fmt(stats.income)} tint="green" />
        <StatCard label="Expenses" value={fmt(stats.expense)} tint="red" />
        <StatCard
          label="Savings rate"
          value={`${stats.savingsRate}%`}
          sublabel={stats.savingsRate > 20 ? 'healthy' : 'watch spending'}
          tint={stats.savingsRate > 20 ? 'green' : 'amber'}
        />
      </div>

      {/* Quick add */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                {(['expense', 'income'] as const).map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{
                    padding: '7px 14px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    background: form.type === t ? (t === 'expense' ? 'var(--accent-red)' : 'var(--accent-green)') : 'var(--bg-elevated)',
                    color: form.type === t ? 'white' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-sans)', transition: 'background var(--dur-fast)', textTransform: 'capitalize',
                  }}>{t}</button>
                ))}
              </div>
              <input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={inputStyle} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
              <input type="number" placeholder="Amount" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={{ ...inputStyle, minWidth: 120, flex: 'none' }} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={selectStyle}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ ...inputStyle, minWidth: 0, flex: 'none', width: 140 }} />
              <button onClick={handleAdd} disabled={createMutation.isPending || !form.description || !form.amount} style={{
                padding: '8px 16px', background: 'var(--accent-blue)', color: 'white',
                border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                fontFamily: 'var(--font-sans)', opacity: createMutation.isPending ? 0.6 : 1,
              }}>{createMutation.isPending ? 'Saving...' : 'Add'}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charts */}
      {monthlyData.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12, marginBottom: 16 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Income vs Expenses — 6 months</div>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={monthlyData} barGap={4}>
                <XAxis dataKey="month" tick={{ fill: 'oklch(58% 0.04 265)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'oklch(58% 0.04 265)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${Number(v) >= 1000 ? (Number(v)/1000).toFixed(0)+'k' : v}`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmt(Number(v))]} />
                <Bar dataKey="income" fill="oklch(65% 0.20 150)" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="oklch(58% 0.23 22)" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>By Category</div>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={2}>
                      {categoryData.map((entry, i) => <Cell key={i} fill={CAT_COLORS[entry.name] || 'oklch(48% 0.03 265)'} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmt(Number(v))]} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
                  {categoryData.slice(0, 4).map(entry => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLORS[entry.name] || 'oklch(48% 0.03 265)', flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{entry.name}</span>
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{fmt(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>No expenses to chart</div>
            )}
          </div>
        </div>
      )}

      {/* AI Insight */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-ai)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={15} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Insight</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            {insightPending ? 'Analyzing your finances...' : aiInsight?.insight ?? 'Add transactions to see your AI-powered monthly insight.'}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            Transactions <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({sorted.length})</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {FILTER_OPTS.map(opt => (
              <button key={opt.value} onClick={() => setDateFilter(opt.value)} style={{
                padding: '4px 10px', borderRadius: 6, border: 'none', fontSize: 12, cursor: 'pointer',
                background: dateFilter === opt.value ? 'var(--bg-elevated)' : 'transparent',
                color: dateFilter === opt.value ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'var(--font-sans)', transition: 'background var(--dur-fast)',
              }}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 110px 100px 36px', padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
          {(['Description', 'Category', 'Date', 'Amount', ''] as const).map((label, i) => (
            <div key={i} onClick={() => {
              const fields: (SortField | null)[] = ['description', null, 'date', 'amount', null]
              const field = fields[i]
              if (field) toggleSort(field)
            }} style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: ['description', 'date', 'amount'].includes(label.toLowerCase()) ? 'pointer' : 'default', userSelect: 'none' }}>
              {label}
            </div>
          ))}
        </div>

        {isPending ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading transactions...</div>
        ) : sorted.length === 0 ? (
          <EmptyState icon={Wallet} title="No transactions" description="Add your first income or expense entry to start tracking." action={{ label: 'Add Entry', onClick: () => setShowAdd(true) }} />
        ) : (
          sorted.map((expense, i) => (
            <div key={expense.id} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 110px 100px 36px', padding: '11px 16px', alignItems: 'center', borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background var(--dur-fast)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: expense.type === 'income' ? 'var(--tint-green)' : 'var(--tint-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {expense.type === 'income' ? <ArrowUpRight size={13} color="oklch(65% 0.20 150)" /> : <ArrowDownLeft size={13} color="oklch(58% 0.23 22)" />}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{expense.description}</span>
              </div>
              <div><span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{expense.category}</span></div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(expense.date), 'dd MMM yyyy')}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: expense.type === 'income' ? 'oklch(65% 0.20 150)' : 'oklch(58% 0.23 22)', fontVariantNumeric: 'tabular-nums' }}>
                {expense.type === 'income' ? '+' : '-'}{fmt(Number(expense.amount))}
              </div>
              <button onClick={() => deleteMutation.mutate(expense.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', transition: 'background var(--dur-fast), color var(--dur-fast)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--tint-red)'; e.currentTarget.style.color = 'oklch(58% 0.23 22)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
