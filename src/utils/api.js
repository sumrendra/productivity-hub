// API Service - Centralized data management
class ApiService {
    constructor() {
        this.baseUrl = window.location.origin + '/api';
        this.notes = [];
        this.links = [];
        this.tasks = [];
        this.expenses = [];
    }

    // Generic API methods
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Notes API
    async loadNotes() {
        try {
            this.notes = await this.request('/notes');
            this.notes = this.notes.map(note => ({
                ...note,
                createdAt: note.created_at
            }));
            return this.notes;
        } catch (error) {
            console.error('Error loading notes:', error);
            return [];
        }
    }

    async createNote(noteData) {
        try {
            const newNote = await this.request('/notes', {
                method: 'POST',
                body: JSON.stringify(noteData)
            });
            newNote.createdAt = newNote.created_at;
            this.notes.unshift(newNote);
            return newNote;
        } catch (error) {
            console.error('Error creating note:', error);
            throw error;
        }
    }

    async updateNote(id, noteData) {
        try {
            const updatedNote = await this.request(`/notes/${id}`, {
                method: 'PUT',
                body: JSON.stringify(noteData)
            });
            updatedNote.createdAt = updatedNote.created_at;
            const index = this.notes.findIndex(note => note.id === id);
            if (index !== -1) {
                this.notes[index] = updatedNote;
            }
            return updatedNote;
        } catch (error) {
            console.error('Error updating note:', error);
            throw error;
        }
    }

    async deleteNote(id) {
        try {
            await this.request(`/notes/${id}`, { method: 'DELETE' });
            this.notes = this.notes.filter(note => note.id !== id);
        } catch (error) {
            console.error('Error deleting note:', error);
            throw error;
        }
    }

    // Links API
    async loadLinks() {
        try {
            this.links = await this.request('/links');
            return this.links;
        } catch (error) {
            console.error('Error loading links:', error);
            return [];
        }
    }

    async createLink(linkData) {
        try {
            const newLink = await this.request('/links', {
                method: 'POST',
                body: JSON.stringify(linkData)
            });
            this.links.unshift(newLink);
            return newLink;
        } catch (error) {
            console.error('Error creating link:', error);
            throw error;
        }
    }

    async updateLink(id, linkData) {
        try {
            const updatedLink = await this.request(`/links/${id}`, {
                method: 'PUT',
                body: JSON.stringify(linkData)
            });
            const index = this.links.findIndex(link => link.id === id);
            if (index !== -1) {
                this.links[index] = updatedLink;
            }
            return updatedLink;
        } catch (error) {
            console.error('Error updating link:', error);
            throw error;
        }
    }

    async deleteLink(id) {
        try {
            await this.request(`/links/${id}`, { method: 'DELETE' });
            this.links = this.links.filter(link => link.id !== id);
        } catch (error) {
            console.error('Error deleting link:', error);
            throw error;
        }
    }

    // Tasks API
    async loadTasks() {
        try {
            this.tasks = await this.request('/tasks');
            this.tasks = this.tasks.map(task => ({
                ...task,
                dueDate: task.due_date
            }));
            return this.tasks;
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    async createTask(taskData) {
        try {
            const newTask = await this.request('/tasks', {
                method: 'POST',
                body: JSON.stringify({
                    ...taskData,
                    due_date: taskData.dueDate
                })
            });
            newTask.dueDate = newTask.due_date;
            this.tasks.push(newTask);
            return newTask;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    }

    async updateTask(id, taskData) {
        try {
            const updatedTask = await this.request(`/tasks/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...taskData,
                    due_date: taskData.dueDate
                })
            });
            updatedTask.dueDate = updatedTask.due_date;
            const index = this.tasks.findIndex(task => task.id === id);
            if (index !== -1) {
                this.tasks[index] = updatedTask;
            }
            return updatedTask;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }

    async deleteTask(id) {
        try {
            await this.request(`/tasks/${id}`, { method: 'DELETE' });
            this.tasks = this.tasks.filter(task => task.id !== id);
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }

    // Expenses API
    async loadExpenses() {
        try {
            this.expenses = await this.request('/expenses');
            return this.expenses;
        } catch (error) {
            console.error('Error loading expenses:', error);
            return [];
        }
    }

    async createExpense(expenseData) {
        try {
            const newExpense = await this.request('/expenses', {
                method: 'POST',
                body: JSON.stringify(expenseData)
            });
            this.expenses.unshift(newExpense);
            return newExpense;
        } catch (error) {
            console.error('Error creating expense:', error);
            throw error;
        }
    }

    async updateExpense(id, expenseData) {
        try {
            const updatedExpense = await this.request(`/expenses/${id}`, {
                method: 'PUT',
                body: JSON.stringify(expenseData)
            });
            const index = this.expenses.findIndex(expense => expense.id === id);
            if (index !== -1) {
                this.expenses[index] = updatedExpense;
            }
            return updatedExpense;
        } catch (error) {
            console.error('Error updating expense:', error);
            throw error;
        }
    }

    async deleteExpense(id) {
        try {
            await this.request(`/expenses/${id}`, { method: 'DELETE' });
            this.expenses = this.expenses.filter(expense => expense.id !== id);
        } catch (error) {
            console.error('Error deleting expense:', error);
            throw error;
        }
    }

    async loadAllData() {
        try {
            await Promise.all([
                this.loadNotes(),
                this.loadLinks(),
                this.loadTasks(),
                this.loadExpenses()
            ]);
        } catch (error) {
            console.error('Error loading all data:', error);
        }
    }
}

// Export for global use
window.ApiService = ApiService;
