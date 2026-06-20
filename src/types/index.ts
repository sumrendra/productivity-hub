export interface Note {
  id: number
  title: string
  content: string
  category: string
  tags: string[]
  is_pinned: boolean
  color: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: number
  title: string
  status: 'todo' | 'in_progress' | 'done'
  description?: string
  priority: 'p0' | 'p1' | 'p2' | 'p3'
  project?: string
  due_date?: string
  assignee?: string
  subtasks: SubTask[]
  created_at: string
  updated_at: string
}

export interface SubTask {
  id: string
  title: string
  done: boolean
}

export interface Link {
  id: number
  title: string
  url: string
  description?: string
  category?: string
  tags: string[]
  collection?: string
  favicon?: string
  og_image?: string
  visit_count: number
  created_at: string
}

export interface Expense {
  id: number
  description: string
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
  notes?: string
  created_at: string
}

export interface AIMessage {
  role: 'user' | 'model'
  content: string
  created_at?: string
}

export interface DashboardSummary {
  notes_count: number
  active_tasks_count: number
  net_balance: number
  links_count: number
  recent_activity?: ActivityItem[]
}

export interface ActivityItem {
  type: 'note' | 'task' | 'link' | 'expense'
  action: 'created' | 'updated' | 'deleted'
  title: string
  timestamp: string
}
