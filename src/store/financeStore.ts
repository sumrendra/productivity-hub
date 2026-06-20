import type { Expense } from '@/types'
import { create } from 'zustand'

interface FinanceState {
  expenses: Expense[]
  isLoading: boolean
  error: string | null
  setExpenses: (expenses: Expense[]) => void
  setLoading: (v: boolean) => void
  setError: (e: string | null) => void
  addExpense: (expense: Expense) => void
  updateExpense: (expense: Expense) => void
  removeExpense: (id: number) => void
  getBalance: () => number
}

export const useFinanceStore = create<FinanceState>()((set, get) => ({
  expenses: [],
  isLoading: false,
  error: null,
  setExpenses: (expenses) => set({ expenses }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  addExpense: (expense) => set((s) => ({ expenses: [expense, ...s.expenses] })),
  updateExpense: (expense) =>
    set((s) => ({ expenses: s.expenses.map((e) => (e.id === expense.id ? expense : e)) })),
  removeExpense: (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),
  getBalance: () => {
    const { expenses } = get()
    return expenses.reduce((sum, e) => {
      return sum + (e.type === 'income' ? Number(e.amount) : -Number(e.amount))
    }, 0)
  },
}))
