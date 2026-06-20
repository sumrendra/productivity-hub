import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { Plus, Trash2, CheckSquare, Sparkles, X, CalendarDays, LayoutList, Columns3 } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'
import { motion, AnimatePresence } from 'motion/react'
import { tasksApi, aiApi } from '@/services/api'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Task } from '@/types'

const COLUMNS: Task['status'][] = ['todo', 'in_progress', 'done']
const COLUMN_LABELS: Record<Task['status'], string> = { todo: 'Todo', in_progress: 'In Progress', done: 'Done' }
const COLUMN_ACCENT: Record<Task['status'], string> = {
  todo: 'var(--text-muted)',
  in_progress: 'var(--accent-amber)',
  done: 'var(--accent-green)',
}

const PRIORITY_LABELS: Record<string, string> = { p0: 'Urgent', p1: 'High', p2: 'Normal', p3: 'Low' }
const PRIORITY_COLORS: Record<string, string> = {
  p0: 'oklch(58% 0.23 22)',
  p1: 'oklch(78% 0.18 85)',
  p2: 'oklch(63% 0.22 255)',
  p3: 'oklch(48% 0.03 265)',
}
const PRIORITY_TINTS: Record<string, string> = {
  p0: 'var(--tint-red)',
  p1: 'var(--tint-amber)',
  p2: 'var(--tint-blue)',
  p3: 'transparent',
}

const PROJECT_COLORS = [
  'oklch(60% 0.15 20)',   // Red
  'oklch(65% 0.15 140)',  // Green
  'oklch(60% 0.15 200)',  // Teal
  'oklch(65% 0.15 280)',  // Purple
  'oklch(60% 0.15 320)',  // Pink
  'oklch(70% 0.18 85)',   // Orange
]

const getProjectColor = (project: string | undefined) => {
  if (!project) return 'var(--text-muted)'
  let hash = 0
  for (let i = 0; i < project.length; i++) hash = project.charCodeAt(i) + ((hash << 5) - hash)
  return PROJECT_COLORS[Math.abs(hash) % PROJECT_COLORS.length]
}


export default function TasksPage() {
  const qc = useQueryClient()
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [quickAddCol, setQuickAddCol] = useState<Task['status'] | null>(null)
  const [quickAddTitle, setQuickAddTitle] = useState('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [breakdownResult, setBreakdownResult] = useState<{ title: string }[]>([])
  const [breakdownLoading, setBreakdownLoading] = useState(false)
  const quickAddRef = useRef<HTMLInputElement>(null)

  const { data: tasks = [], isPending } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Task>) => tasksApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Task['status'] }) => tasksApi.patchStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) => tasksApi.update(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      setSelectedTask(updated)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tasksApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      setSelectedTask(null)
    },
  })

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const newStatus = result.destination.droppableId as Task['status']
    const taskId = parseInt(result.draggableId)
    const task = tasks.find(t => t.id === taskId)
    if (task && task.status !== newStatus) {
      statusMutation.mutate({ id: taskId, status: newStatus })
    }
  }

  const handleQuickAdd = (status: Task['status']) => {
    if (!quickAddTitle.trim()) { setQuickAddCol(null); return }
    createMutation.mutate({ title: quickAddTitle.trim(), status, priority: 'p2', subtasks: [] })
    setQuickAddTitle('')
    setQuickAddCol(null)
  }

  const handleBreakdown = async (task: Task) => {
    setBreakdownLoading(true)
    setBreakdownResult([])
    try {
      const { subtasks } = await aiApi.breakdownTask(task.title)
      setBreakdownResult(subtasks)
    } catch {
      setBreakdownResult([])
    } finally {
      setBreakdownLoading(false)
    }
  }

  const addSubtasks = () => {
    if (!selectedTask || breakdownResult.length === 0) return
    const newSubtasks = [
      ...selectedTask.subtasks,
      ...breakdownResult.map(s => ({ id: Math.random().toString(36).slice(2), title: s.title, done: false })),

    ]
    updateMutation.mutate({ id: selectedTask.id, data: { ...selectedTask, subtasks: newSubtasks } })
    setBreakdownResult([])
  }

  const byStatus = (status: Task['status']) => tasks.filter(t => t.status === status)

  const isDueOverdue = (task: Task) => {
    if (!task.due_date) return false
    const d = new Date(task.due_date)
    return isPast(d) && !isToday(d) && task.status !== 'done'
  }

  return (
    <div className="fs-page" style={{ height: '100%' }}>
      <PageHeader
        title="Tasks"
        subtitle={`${tasks.filter((t) => t.status !== 'done').length} open · ${tasks.filter((t) => t.status === 'done').length} done`}
        action={
          <div className="fs-segmented" role="group" aria-label="View mode">
            {([['kanban', Columns3], ['list', LayoutList]] as const).map(([v, Icon]) => (
              <button
                key={v}
                type="button"
                data-active={view === v}
                onClick={() => setView(v)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Icon size={14} />
                {v === 'kanban' ? 'Board' : 'List'}
              </button>
            ))}
          </div>
        }
      />

      {isPending ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: 32, textAlign: 'center' }}>Loading tasks...</div>
      ) : view === 'kanban' ? (
        /* Kanban Board */
        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, alignItems: 'start' }}>
            {COLUMNS.map(col => (
              <div key={col} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                {/* Column header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLUMN_ACCENT[col] }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{COLUMN_LABELS[col]}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{byStatus(col).length}</span>
                  </div>
                  <button onClick={() => { setQuickAddCol(col); setTimeout(() => quickAddRef.current?.focus(), 50) }} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, borderRadius: 6, border: 'none',
                    background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)',
                    transition: 'background var(--dur-fast), color var(--dur-fast)',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                    <Plus size={14} />
                  </button>
                </div>

                {/* Quick add input */}
                <AnimatePresence>
                  {quickAddCol === col && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }} style={{ overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ padding: '8px 10px' }}>
                        <input
                          ref={quickAddRef}
                          value={quickAddTitle}
                          onChange={e => setQuickAddTitle(e.target.value)}
                          placeholder="Task title..."
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleQuickAdd(col)
                            if (e.key === 'Escape') { setQuickAddCol(null); setQuickAddTitle('') }
                          }}
                          onBlur={() => { if (!quickAddTitle.trim()) setQuickAddCol(null) }}
                          style={{
                            width: '100%', padding: '7px 10px', background: 'var(--bg-elevated)',
                            border: '1px solid var(--accent-blue)', borderRadius: 7,
                            color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none',
                          }}
                        />
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Enter to add · Esc to cancel</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Cards */}
                <Droppable droppableId={col}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        minHeight: 60, padding: '8px 8px',
                        background: snapshot.isDraggingOver ? 'var(--bg-hover)' : 'transparent',
                        transition: 'background var(--dur-fast)',
                      }}
                    >
                      {byStatus(col).length === 0 && !snapshot.isDraggingOver && (
                        <div style={{ padding: '16px 8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                          {col === 'todo' ? 'No tasks yet' : col === 'in_progress' ? 'Nothing in progress' : 'Nothing done yet'}
                        </div>
                      )}
                      {byStatus(col).map((task, index) => (
                        <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedTask(task)}
                              style={{
                                ...provided.draggableProps.style,
                                marginBottom: 6,
                                background: snapshot.isDragging ? 'var(--bg-elevated)' : 'var(--bg-base)',
                                border: `1px solid ${isDueOverdue(task) ? 'oklch(58% 0.23 22 / 0.5)' : 'var(--border)'}`,
                                borderRadius: 9,
                                padding: 12,
                                cursor: 'pointer',
                                boxShadow: snapshot.isDragging ? '0 8px 24px oklch(2% 0.01 265 / 0.6)' : 'none',
                                transition: snapshot.isDragging ? 'none' : 'border-color var(--dur-fast)',
                              }}
                            >
                              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.4 }}>
                                {task.title}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span style={{
                                  fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                                  background: PRIORITY_TINTS[task.priority] || 'var(--bg-elevated)',
                                  color: PRIORITY_COLORS[task.priority] || 'var(--text-muted)',
                                  textTransform: 'uppercase', letterSpacing: '0.04em',
                                }}>
                                  {PRIORITY_LABELS[task.priority]}
                                </span>
                                {task.project && (
                                  <span style={{
                                    fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                                    background: `color-mix(in oklch, ${getProjectColor(task.project)} 15%, transparent)`,
                                    color: getProjectColor(task.project),
                                    textTransform: 'uppercase', letterSpacing: '0.04em',
                                  }}>
                                    {task.project}
                                  </span>
                                )}
                                {task.due_date && (
                                  <span style={{
                                    fontSize: 11, color: isDueOverdue(task) ? 'oklch(58% 0.23 22)' : 'var(--text-muted)',
                                    display: 'flex', alignItems: 'center', gap: 3,
                                  }}>
                                    <CalendarDays size={11} />
                                    {format(new Date(task.due_date), 'dd MMM')}
                                  </span>
                                )}
                                {task.subtasks?.length > 0 && (
                                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                    {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      ) : (
        /* List View */
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 120px 100px 36px', padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
            {['Title', 'Project', 'Priority', 'Status', 'Due Date', ''].map((h, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
            ))}
          </div>
          {tasks.length === 0 ? (
            <EmptyState icon={CheckSquare} title="No tasks yet" description="Create your first task. Click the + in any Kanban column or switch to board view." />
          ) : tasks.map((task, i) => (
            <div key={task.id} onClick={() => setSelectedTask(task)} style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 100px 120px 100px 36px',
              padding: '11px 16px', alignItems: 'center',
              borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none',
              cursor: 'pointer', transition: 'background var(--dur-fast)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{task.title}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: getProjectColor(task.project) }}>{task.project || '-'}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: PRIORITY_COLORS[task.priority] }}>{PRIORITY_LABELS[task.priority]}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{COLUMN_LABELS[task.status]}</span>
              <span style={{ fontSize: 12, color: isDueOverdue(task) ? 'oklch(58% 0.23 22)' : 'var(--text-muted)' }}>
                {task.due_date ? format(new Date(task.due_date), 'dd MMM') : '-'}
              </span>
              <button onClick={e => { e.stopPropagation(); deleteMutation.mutate(task.id) }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', transition: 'background var(--dur-fast)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--tint-red)'; e.currentTarget.style.color = 'oklch(58% 0.23 22)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Task Detail Panel */}
      <AnimatePresence>
        {selectedTask && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setSelectedTask(null); setBreakdownResult([]) }}
              style={{ position: 'fixed', inset: 0, background: 'oklch(5% 0.01 265 / 0.6)', backdropFilter: 'blur(4px)', zIndex: 200 }} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'fixed', right: 0, top: 0, bottom: 0, width: 420,
                background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)',
                zIndex: 201, display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}>
              {/* Panel header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={selectedTask.status} onChange={e => { const s = e.target.value as Task['status']; statusMutation.mutate({ id: selectedTask.id, status: s }); setSelectedTask({ ...selectedTask, status: s }) }}
                    style={{ padding: '5px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-sans)', cursor: 'pointer', outline: 'none' }}>
                    {COLUMNS.map(c => <option key={c} value={c}>{COLUMN_LABELS[c]}</option>)}
                  </select>
                  <select value={selectedTask.priority} onChange={e => { const p = e.target.value as Task['priority']; updateMutation.mutate({ id: selectedTask.id, data: { ...selectedTask, priority: p } }) }}
                    style={{ padding: '5px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 7, color: PRIORITY_COLORS[selectedTask.priority], fontSize: 12, fontFamily: 'var(--font-sans)', cursor: 'pointer', outline: 'none' }}>
                    {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => deleteMutation.mutate(selectedTask.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', transition: 'background var(--dur-fast)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--tint-red)'; e.currentTarget.style.color = 'oklch(58% 0.23 22)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                    <Trash2 size={14} />
                  </button>
                  <button onClick={() => { setSelectedTask(null); setBreakdownResult([]) }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Panel content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Title */}
                <input
                  defaultValue={selectedTask.title}
                  onBlur={e => { if (e.target.value !== selectedTask.title) updateMutation.mutate({ id: selectedTask.id, data: { ...selectedTask, title: e.target.value } }) }}
                  style={{ width: '100%', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-sans)', padding: 0 }}
                />

                {/* Project */}
                <input
                  defaultValue={selectedTask.project || ''}
                  placeholder="Add to project..."
                  onBlur={e => {
                    const val = e.target.value.trim()
                    if (val !== selectedTask.project) updateMutation.mutate({ id: selectedTask.id, data: { ...selectedTask, project: val || undefined } })
                  }}
                  style={{
                    width: '100%', padding: '8px 12px',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8,
                    color: getProjectColor(selectedTask.project), fontSize: 13, fontFamily: 'var(--font-sans)',
                    fontWeight: 500, outline: 'none',
                  }}
                />

                {/* Due date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CalendarDays size={14} color="var(--text-muted)" />
                  <input type="date" defaultValue={selectedTask.due_date || ''} onBlur={e => updateMutation.mutate({ id: selectedTask.id, data: { ...selectedTask, due_date: e.target.value || undefined } })}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none', cursor: 'pointer' }} />
                </div>

                {/* Description */}
                <textarea
                  defaultValue={selectedTask.description || ''}
                  placeholder="Add description..."
                  onBlur={e => updateMutation.mutate({ id: selectedTask.id, data: { ...selectedTask, description: e.target.value } })}
                  style={{
                    width: '100%', minHeight: 80, padding: '10px 12px',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8,
                    color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'var(--font-sans)',
                    resize: 'vertical', outline: 'none', lineHeight: 1.6,
                  }}
                />

                {/* Subtasks */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    Subtasks {selectedTask.subtasks?.length > 0 && `(${selectedTask.subtasks.filter(s => s.done).length}/${selectedTask.subtasks.length})`}
                  </div>
                  {selectedTask.subtasks?.map(sub => (
                    <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                      <input type="checkbox" checked={sub.done} onChange={() => {
                        const updated = selectedTask.subtasks.map(s => s.id === sub.id ? { ...s, done: !s.done } : s)
                        updateMutation.mutate({ id: selectedTask.id, data: { ...selectedTask, subtasks: updated } })
                      }} style={{ cursor: 'pointer', accentColor: 'var(--accent-blue)' }} />
                      <span style={{ fontSize: 13, color: sub.done ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: sub.done ? 'line-through' : 'none' }}>{sub.title}</span>
                    </div>
                  ))}
                </div>

                {/* AI Break Down */}
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: breakdownResult.length > 0 ? 12 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--gradient-ai)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={12} color="white" />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>AI Break Down</span>
                    </div>
                    <button onClick={() => handleBreakdown(selectedTask)} disabled={breakdownLoading} style={{
                      padding: '5px 12px', background: 'var(--gradient-ai)', color: 'white',
                      border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      fontFamily: 'var(--font-sans)', opacity: breakdownLoading ? 0.7 : 1,
                    }}>{breakdownLoading ? 'Breaking down...' : 'Break Down'}</button>
                  </div>
                  {breakdownResult.length > 0 && (
                    <div>
                      {breakdownResult.map((s, i) => (
                        <div key={i} style={{ padding: '6px 0', borderBottom: i < breakdownResult.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 13, color: 'var(--text-secondary)' }}>
                          · {s.title}
                        </div>
                      ))}
                      <button onClick={addSubtasks} style={{
                        marginTop: 10, width: '100%', padding: '7px', background: 'var(--accent-blue)',
                        color: 'white', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                      }}>Add all as subtasks</button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
