// Common types
export interface BaseEntity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

// Note types
export interface Note extends BaseEntity {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
}

export interface CreateNoteDto {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
}

export interface UpdateNoteDto extends Partial<CreateNoteDto> {}

// Link types
export interface Link extends BaseEntity {
  title: string;
  url: string;
  category?: string;
  description?: string;
  tags?: string[];
}

export interface CreateLinkDto {
  title: string;
  url: string;
  category?: string;
  description?: string;
  tags?: string[];
}

export interface UpdateLinkDto extends Partial<CreateLinkDto> {}

// Task types
export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'completed';

export interface Task extends BaseEntity {
  title: string;
  status: TaskStatus;
  assignee?: string;
  description?: string;
  dueDate?: string;
}

export interface CreateTaskDto {
  title: string;
  status?: TaskStatus;
  assignee?: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {}

// Finance types
export type TransactionType = 'income' | 'expense';

export interface Expense extends BaseEntity {
  description: string;
  amount: number;
  category?: string;
  date: string;
  type: TransactionType;
}

export interface CreateExpenseDto {
  description: string;
  amount: number;
  category?: string;
  date?: string;
  type?: TransactionType;
}

export interface UpdateExpenseDto extends Partial<CreateExpenseDto> {}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}
