import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Task, TaskStatus } from '../types';

interface TasksState {
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;
  filter: TaskStatus | 'all';

  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: number, task: Partial<Task>) => void;
  removeTask: (id: number) => void;
  selectTask: (task: Task | null) => void;
  setFilter: (filter: TaskStatus | 'all') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearTasks: () => void;

  // Computed
  getTasksByStatus: (status: TaskStatus) => Task[];
  getFilteredTasks: () => Task[];
}

export const useTasksStore = create<TasksState>()(
  devtools(
    persist(
      (set, get) => ({
        tasks: [],
        selectedTask: null,
        isLoading: false,
        error: null,
        filter: 'all',

        setTasks: (tasks) => set({ tasks }),

        addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),

        updateTask: (id, updatedTask) =>
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, ...updatedTask } : task
            ),
          })),

        removeTask: (id) =>
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
          })),

        selectTask: (task) => set({ selectedTask: task }),

        setFilter: (filter) => set({ filter }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        clearTasks: () => set({ tasks: [], selectedTask: null }),

        getTasksByStatus: (status) => {
          return get().tasks.filter((task) => task.status === status);
        },

        getFilteredTasks: () => {
          const { tasks, filter } = get();
          if (filter === 'all') return tasks;
          return tasks.filter((task) => task.status === filter);
        },
      }),
      {
        name: 'tasks-storage',
        partialize: (state) => ({ tasks: state.tasks, filter: state.filter }),
      }
    ),
    { name: 'TasksStore' }
  )
);
