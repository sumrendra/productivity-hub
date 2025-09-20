// Finance Module - Expense and income tracking
class FinanceModule {
    constructor(apiService) {
        this.apiService = apiService;
    }

    async init() {
        await this.loadExpenses();
        this.bindEvents();
        this.render();
    }

    async loadExpenses() {
        if (this.apiService.expenses.length === 0) {
            await this.apiService.loadExpenses();
        }
    }

    bindEvents() {
        const categoryFilter = document.getElementById('expense-category-filter');
        const typeFilter = document.getElementById('expense-type-filter');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.render();
            });
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', () => {
                this.render();
            });
        }
    }

    render() {
        this.updateFinanceOverview();
        this.renderTransactions();
    }

    updateFinanceOverview() {
        const currentMonth = new Date().toISOString().substring(0, 7);
        const monthlyTransactions = this.apiService.expenses.filter(expense =>
            expense.date.startsWith(currentMonth));

        const income = monthlyTransactions.filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const expenses = monthlyTransactions.filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const balance = income - expenses;

        const totalIncomeEl = document.getElementById('total-income');
        const totalExpenseEl = document.getElementById('total-expense');
        const netBalanceEl = document.getElementById('net-balance');

        if (totalIncomeEl) totalIncomeEl.textContent = this.formatCurrency(income);
        if (totalExpenseEl) totalExpenseEl.textContent = this.formatCurrency(expenses);
        if (netBalanceEl) netBalanceEl.textContent = this.formatCurrency(balance);
    }

    renderTransactions() {
        const transactionsList = document.getElementById('transactions-list');
        const transactionsSummary = document.getElementById('transactions-summary');
        if (!transactionsList) return;

        const categoryFilter = document.getElementById('expense-category-filter')?.value || '';
        const typeFilter = document.getElementById('expense-type-filter')?.value || '';

        let filteredTransactions = [...this.apiService.expenses]
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (categoryFilter) {
            filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
        }

        if (typeFilter) {
            filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
        }

        // Update summary
        if (transactionsSummary) {
            const totalAmount = filteredTransactions.length;
            const filterText = categoryFilter || typeFilter ?
                `Showing ${totalAmount} filtered transactions` :
                `Showing ${totalAmount} transactions`;
            transactionsSummary.innerHTML = `<span>${filterText}</span>`;
        }

        if (filteredTransactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons">receipt</span>
                    <h3>No transactions found</h3>
                    <p>Add your first transaction to get started</p>
                </div>
            `;
            return;
        }

        transactionsList.innerHTML = filteredTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-description">${this.escapeHtml(transaction.description)}</div>
                    <div class="transaction-meta">
                        <span>${this.escapeHtml(transaction.category)}</span>
                        <span>${this.formatDate(transaction.date)}</span>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(Math.abs(transaction.amount))}
                </div>
                <div class="transaction-actions">
                    <button class="note-action" onclick="window.FinanceModule.editExpense(${transaction.id})" title="Edit">
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="note-action" onclick="window.FinanceModule.deleteExpense(${transaction.id})" title="Delete">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    editExpense(id) {
        const expense = this.apiService.expenses.find(e => e.id === id);
        if (!expense) return;

        window.UIUtils.openModal('expense-modal', {
            title: 'Edit Transaction',
            data: expense,
            onSave: async (expenseData) => {
                try {
                    await this.apiService.updateExpense(id, expenseData);
                    this.render();
                    window.UIUtils.showToast('Transaction updated successfully');
                } catch (error) {
                    console.error('Error updating expense:', error);
                }
            }
        });
    }

    async deleteExpense(id) {
        window.UIUtils.showConfirmDialog('Are you sure you want to delete this transaction?', async () => {
            try {
                await this.apiService.deleteExpense(id);
                this.render();
                window.UIUtils.showToast('Transaction deleted successfully');
            } catch (error) {
                console.error('Error deleting expense:', error);
            }
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
    }
}

window.FinanceModule = FinanceModule;
