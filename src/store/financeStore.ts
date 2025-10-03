import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Expense, TransactionType } from '../types';

interface FinanceState {
  expenses: Expense[];
  selectedExpense: Expense | null;
  isLoading: boolean;
  error: string | null;
  filterType: TransactionType | 'all';
  dateRange: { start: string | null; end: string | null };

  // Actions
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: number, expense: Partial<Expense>) => void;
  removeExpense: (id: number) => void;
  selectExpense: (expense: Expense | null) => void;
  setFilterType: (filterType: TransactionType | 'all') => void;
  setDateRange: (start: string | null, end: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearExpenses: () => void;

  // Computed
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
  getFilteredExpenses: () => Expense[];
}

export const useFinanceStore = create<FinanceState>()(
  devtools(
    persist(
      (set, get) => ({
        expenses: [],
        selectedExpense: null,
        isLoading: false,
        error: null,
        filterType: 'all',
        dateRange: { start: null, end: null },

        setExpenses: (expenses) => set({ expenses }),

        addExpense: (expense) =>
          set((state) => ({ expenses: [expense, ...state.expenses] })),

        updateExpense: (id, updatedExpense) =>
          set((state) => ({
            expenses: state.expenses.map((expense) =>
              expense.id === id ? { ...expense, ...updatedExpense } : expense
            ),
          })),

        removeExpense: (id) =>
          set((state) => ({
            expenses: state.expenses.filter((expense) => expense.id !== id),
          })),

        selectExpense: (expense) => set({ selectedExpense: expense }),

        setFilterType: (filterType) => set({ filterType }),

        setDateRange: (start, end) => set({ dateRange: { start, end } }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        clearExpenses: () => set({ expenses: [], selectedExpense: null }),

        getTotalIncome: () => {
          return get()
            .expenses.filter((e) => e.type === 'income')
            .reduce((sum, e) => sum + e.amount, 0);
        },

        getTotalExpenses: () => {
          return get()
            .expenses.filter((e) => e.type === 'expense')
            .reduce((sum, e) => sum + e.amount, 0);
        },

        getBalance: () => {
          const { getTotalIncome, getTotalExpenses } = get();
          return getTotalIncome() - getTotalExpenses();
        },

        getFilteredExpenses: () => {
          const { expenses, filterType, dateRange } = get();
          let filtered = expenses;

          // Filter by type
          if (filterType !== 'all') {
            filtered = filtered.filter((e) => e.type === filterType);
          }

          // Filter by date range
          if (dateRange.start || dateRange.end) {
            filtered = filtered.filter((e) => {
              const expenseDate = new Date(e.date);
              const start = dateRange.start ? new Date(dateRange.start) : null;
              const end = dateRange.end ? new Date(dateRange.end) : null;

              if (start && expenseDate < start) return false;
              if (end && expenseDate > end) return false;
              return true;
            });
          }

          return filtered;
        },
      }),
      {
        name: 'finance-storage',
        partialize: (state) => ({
          expenses: state.expenses,
          filterType: state.filterType,
        }),
      }
    ),
    { name: 'FinanceStore' }
  )
);
