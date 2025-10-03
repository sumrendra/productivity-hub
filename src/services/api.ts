import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  Note,
  CreateNoteDto,
  UpdateNoteDto,
  Link,
  CreateLinkDto,
  UpdateLinkDto,
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  Expense,
  CreateExpenseDto,
  UpdateExpenseDto,
} from '@types/index';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Notes API
export const notesApi = {
  getAll: async (): Promise<Note[]> => {
    const { data } = await api.get<Note[]>('/notes');
    return data.map((note) => ({
      ...note,
      createdAt: note.created_at as unknown as string,
    }));
  },

  getById: async (id: number): Promise<Note> => {
    const { data } = await api.get<Note>(`/notes/${id}`);
    return {
      ...data,
      createdAt: data.created_at as unknown as string,
    };
  },

  create: async (noteData: CreateNoteDto): Promise<Note> => {
    const { data } = await api.post<Note>('/notes', noteData);
    return {
      ...data,
      createdAt: data.created_at as unknown as string,
    };
  },

  update: async (id: number, noteData: UpdateNoteDto): Promise<Note> => {
    const { data } = await api.put<Note>(`/notes/${id}`, noteData);
    return {
      ...data,
      createdAt: data.created_at as unknown as string,
    };
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },
};

// Links API
export const linksApi = {
  getAll: async (): Promise<Link[]> => {
    const { data } = await api.get<Link[]>('/links');
    return data;
  },

  create: async (linkData: CreateLinkDto): Promise<Link> => {
    const { data } = await api.post<Link>('/links', linkData);
    return data;
  },

  update: async (id: number, linkData: UpdateLinkDto): Promise<Link> => {
    const { data } = await api.put<Link>(`/links/${id}`, linkData);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/links/${id}`);
  },
};

// Tasks API
export const tasksApi = {
  getAll: async (): Promise<Task[]> => {
    const { data } = await api.get<Task[]>('/tasks');
    return data.map((task) => ({
      ...task,
      dueDate: task.due_date as unknown as string,
    }));
  },

  create: async (taskData: CreateTaskDto): Promise<Task> => {
    const { data } = await api.post<Task>('/tasks', {
      ...taskData,
      due_date: taskData.dueDate,
    });
    return {
      ...data,
      dueDate: data.due_date as unknown as string,
    };
  },

  update: async (id: number, taskData: UpdateTaskDto): Promise<Task> => {
    const { data } = await api.put<Task>(`/tasks/${id}`, {
      ...taskData,
      due_date: taskData.dueDate,
    });
    return {
      ...data,
      dueDate: data.due_date as unknown as string,
    };
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

// Expenses API
export const expensesApi = {
  getAll: async (): Promise<Expense[]> => {
    const { data } = await api.get<Expense[]>('/expenses');
    return data;
  },

  create: async (expenseData: CreateExpenseDto): Promise<Expense> => {
    const { data } = await api.post<Expense>('/expenses', expenseData);
    return data;
  },

  update: async (id: number, expenseData: UpdateExpenseDto): Promise<Expense> => {
    const { data } = await api.put<Expense>(`/expenses/${id}`, expenseData);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
};

export default api;
