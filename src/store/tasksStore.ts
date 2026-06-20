import type { Task } from '@/types'
import { create } from 'zustand'

interface TasksState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  setTasks: (tasks: Task[]) => void
  setLoading: (v: boolean) => void
  setError: (e: string | null) => void
  addTask: (task: Task) => void
  updateTask: (task: Task) => void
  removeTask: (id: number) => void
}

export const useTasksStore = create<TasksState>()((set) => ({
  tasks: [],
  isLoading: false,
  error: null,
  setTasks: (tasks) => set({ tasks }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  updateTask: (task) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === task.id ? task : t)) })),
  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
}))
