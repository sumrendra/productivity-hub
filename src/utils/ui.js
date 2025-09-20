// UI Utilities - Modal management, toasts, and common UI functions
class UIUtils {
    static isModalOpen = false;
    static currentOpenModal = null;

    static showToast(message, type = 'success', title = '') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconMap = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };

        toast.innerHTML = `
            <span class="material-icons">${iconMap[type]}</span>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <span class="material-icons">close</span>
            </button>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.removeToast(toast));

        setTimeout(() => this.removeToast(toast), 5000);
    }

    static removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }

    static openModal(modalId, options = {}) {
        console.log(`Attempting to open modal: ${modalId}`);
        
        // CRITICAL: If a modal is already in the process of opening, block this call
        if (this.isModalOpen) {
            console.log(`Modal opening blocked - another modal is already open: ${this.currentOpenModal}`);
            return;
        }

        // Set the flag immediately to prevent race conditions
        this.isModalOpen = true;
        this.currentOpenModal = modalId;

        // First, close ALL open modals to prevent stacking
        this.closeAllModals();
        
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modal-overlay');
        if (!modal || !overlay) {
            this.isModalOpen = false;
            this.currentOpenModal = null;
            return;
        }

        overlay.classList.remove('hidden');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Set modal title if provided
        if (options.title) {
            const titleEl = modal.querySelector('h3');
            if (titleEl) titleEl.textContent = options.title;
        }

        // Populate form data if provided
        if (options.data) {
            this.populateModalForm(modal, options.data);
        }

        // Set up save handler if provided
        if (options.onSave) {
            const form = modal.querySelector('form');
            if (form) {
                // Remove any existing event listeners
                const newForm = form.cloneNode(true);
                form.parentNode.replaceChild(newForm, form);
                
                newForm.onsubmit = async (e) => {
                    e.preventDefault();
                    const formData = this.getFormData(newForm);
                    await options.onSave(formData);
                    this.closeModal(modalId);
                };
            }
        }

        console.log(`Modal opened successfully: ${modalId}`);
    }

    static closeAllModals() {
        // Close all modals that might be open
        const allModals = document.querySelectorAll('.modern-modal');
        allModals.forEach(modal => {
            modal.classList.add('hidden');
            // Reset any forms in the modal
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                form.onsubmit = null;
            }
        });
        
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
        document.body.style.overflow = 'auto';
        
        // Reset the flags
        this.isModalOpen = false;
        this.currentOpenModal = null;
    }

    static closeModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modal-overlay');
        if (!modal || !overlay) return;

        modal.classList.add('hidden');
        overlay.classList.add('hidden');
        document.body.style.overflow = 'auto';

        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            form.onsubmit = null;
        }

        // Reset the flags
        this.isModalOpen = false;
        this.currentOpenModal = null;
        
        console.log(`Modal closed: ${modalId}`);
    }

    static showConfirmDialog(message, onConfirm) {
        const confirmModal = document.getElementById('confirm-modal');
        if (!confirmModal) return;

        document.getElementById('confirm-message').textContent = message;
        document.getElementById('confirm-btn').onclick = () => {
            onConfirm();
            this.closeModal('confirm-modal');
        };
        this.openModal('confirm-modal');
    }

    static populateModalForm(modal, data) {
        Object.keys(data).forEach(key => {
            const input = modal.querySelector(`#${key}, [name="${key}"]`);
            if (input) {
                input.value = data[key];
            }
        });
    }

    static getFormData(form) {
        const formData = new FormData(form);
        const data = {};

        // Get all form inputs
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.id) {
                data[input.id.replace(/^[^-]*-/, '')] = input.value;
            }
        });

        return data;
    }

    static initializeModalHandlers() {
        // Close modal when clicking overlay
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    const openModal = overlay.querySelector('.modern-modal:not(.hidden)');
                    if (openModal) {
                        this.closeModal(openModal.id);
                    }
                }
            });
        }

        // Initialize expense form handler
        const expenseForm = document.getElementById('expense-form');
        if (expenseForm) {
            expenseForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleExpenseSubmit(e);
            });
        }

        // Set default date for expense modal
        const expenseDate = document.getElementById('expense-date');
        if (expenseDate) {
            expenseDate.value = new Date().toISOString().split('T')[0];
        }
    }

    static async handleExpenseSubmit(e) {
        const formData = this.getFormData(e.target);

        try {
            if (window.ApiService) {
                await window.ApiService.createExpense(formData);
                if (window.FinanceModule) {
                    window.FinanceModule.render();
                }
                this.showToast('Transaction saved successfully!');
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            this.showToast('Failed to save transaction', 'error');
        }

        this.closeModal('expense-modal');
    }
}

// Global modal functions for HTML onclick events
window.closeModal = function(modalId) {
    UIUtils.closeModal(modalId);
};

window.showCreateNote = function() {
    if (window.NotesModule) {
        window.NotesModule.createNewNote();
    }
};

window.showCreateTask = function() {
    if (window.ProjectsModule) {
        window.ProjectsModule.createNewTask();
    }
};

window.showCreateExpense = function() {
    UIUtils.openModal('expense-modal', {
        title: 'Add Transaction'
    });
};

window.clearFinanceFilters = function() {
    const categoryFilter = document.getElementById('expense-category-filter');
    const typeFilter = document.getElementById('expense-type-filter');

    if (categoryFilter) categoryFilter.value = '';
    if (typeFilter) typeFilter.value = '';

    if (window.FinanceModule) {
        window.FinanceModule.render();
    }
};

window.UIUtils = UIUtils;
