// Projects Module - Task management with Kanban board
class ProjectsModule {
    constructor(apiService) {
        this.apiService = apiService;
        this.dragHandlersInitialized = false;
    }

    async init() {
        await this.loadTasks();
        this.bindEvents();
        this.render();
    }

    async loadTasks() {
        if (this.apiService.tasks.length === 0) {
            await this.apiService.loadTasks();
        }
    }

    bindEvents() {
        // Initialize drag and drop for kanban board
        this.initializeDragAndDrop();
    }

    render() {
        this.renderKanbanBoard();
        // Reinitialize drag and drop after rendering
        if (this.dragHandlersInitialized) {
            this.initializeDragAndDrop();
        }
    }

    renderKanbanBoard() {
        const statusColumns = ['todo', 'in-progress', 'in-review', 'completed'];

        statusColumns.forEach(status => {
            const tasksContainer = document.getElementById(`${status}-tasks`);
            const taskCount = document.getElementById(`${status}-count`);

            if (!tasksContainer || !taskCount) return;

            const filteredTasks = this.apiService.tasks.filter(task => task.status === status);
            taskCount.textContent = filteredTasks.length;

            if (filteredTasks.length === 0) {
                tasksContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-tasks"></i>
                        <p>No tasks</p>
                    </div>
                `;
            } else {
                tasksContainer.innerHTML = filteredTasks.map(task => `
                    <div class="task-card" draggable="true" data-task-id="${task.id}">
                        <div class="task-title">${task.title}</div>
                        <div class="task-description">${task.description || ''}</div>
                        <div class="task-meta">
                            <span class="task-assignee">${task.assignee}</span>
                            ${task.dueDate ? `<span class="task-due-date">${this.formatDate(task.dueDate)}</span>` : ''}
                        </div>
                        <div class="task-actions">
                            <button class="note-action" onclick="window.ProjectsModule.editTask(${task.id})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="note-action" onclick="window.ProjectsModule.deleteTask(${task.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        });
    }

    initializeDragAndDrop() {
        // Clear existing timeout to prevent multiple initializations
        if (this.dragInitTimeout) {
            clearTimeout(this.dragInitTimeout);
        }

        // Use a longer timeout to ensure DOM is fully rendered
        this.dragInitTimeout = setTimeout(() => {
            const taskCards = document.querySelectorAll('.task-card');
            const tasksContainers = document.querySelectorAll('.tasks-container');

            // Remove ALL existing event listeners by replacing elements
            taskCards.forEach(card => {
                const newCard = card.cloneNode(true);
                card.parentNode.replaceChild(newCard, card);
            });

            tasksContainers.forEach(container => {
                const newContainer = container.cloneNode(true);
                container.parentNode.replaceChild(newContainer, container);
            });

            // Now add fresh event listeners to the newly cloned elements
            const freshTaskCards = document.querySelectorAll('.task-card');
            const freshContainers = document.querySelectorAll('.tasks-container');

            freshTaskCards.forEach(card => {
                card.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
                    e.target.classList.add('dragging');
                });

                card.addEventListener('dragend', (e) => {
                    e.target.classList.remove('dragging');
                });
            });

            freshContainers.forEach(container => {
                container.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    container.classList.add('drag-over');
                });

                container.addEventListener('dragleave', () => {
                    container.classList.remove('drag-over');
                });

                container.addEventListener('drop', async (e) => {
                    e.preventDefault();
                    container.classList.remove('drag-over');

                    const taskId = parseInt(e.dataTransfer.getData('text/plain'));
                    const newStatus = container.closest('.kanban-column').dataset.status;

                    await this.moveTask(taskId, newStatus);
                });
            });

            this.dragHandlersInitialized = true;
        }, 300);
    }

    async moveTask(taskId, newStatus) {
        const task = this.apiService.tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            const oldStatus = task.status;
            task.status = newStatus;
            try {
                await this.apiService.updateTask(taskId, task);
                this.render();
                window.UIUtils.showToast('Task moved successfully');
            } catch (error) {
                task.status = oldStatus;
                this.render();
                console.error('Error updating task status:', error);
            }
        }
    }

    createNewTask() {
        window.UIUtils.openModal('task-modal', {
            title: 'Create New Task',
            onSave: async (taskData) => {
                try {
                    await this.apiService.createTask({
                        ...taskData,
                        status: 'todo'
                    });
                    this.render();
                    if (window.DashboardModule) {
                        window.DashboardModule.updateStats();
                    }
                    window.UIUtils.showToast('Task created successfully');
                } catch (error) {
                    console.error('Error creating task:', error);
                    window.UIUtils.showToast('Failed to create task', 'error');
                }
            }
        });
    }

    editTask(id) {
        const task = this.apiService.tasks.find(t => t.id === id);
        if (!task) return;

        window.UIUtils.openModal('task-modal', {
            title: 'Edit Task',
            data: task,
            onSave: async (taskData) => {
                try {
                    await this.apiService.updateTask(id, taskData);
                    this.render();
                    window.UIUtils.showToast('Task updated successfully');
                } catch (error) {
                    console.error('Error updating task:', error);
                }
            }
        });
    }

    async deleteTask(id) {
        window.UIUtils.showConfirmDialog('Are you sure you want to delete this task?', async () => {
            try {
                await this.apiService.deleteTask(id);
                this.render();
                window.UIUtils.showToast('Task deleted successfully');
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        });
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

window.ProjectsModule = ProjectsModule;
