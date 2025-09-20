// Dashboard Module
class DashboardModule {
    constructor(apiService) {
        this.apiService = apiService;
    }

    async init() {
        await this.render();
    }

    async render() {
        this.updateStats();
        this.renderActivityFeed();
    }

    updateStats() {
        if (!this.apiService) return;

        document.getElementById('total-notes').textContent = this.apiService.notes.length;
        document.getElementById('total-links').textContent = this.apiService.links.length;
        document.getElementById('active-tasks').textContent =
            this.apiService.tasks.filter(task => task.status !== 'completed').length;

        const currentMonth = new Date().toISOString().substring(0, 7);
        const monthlyTransactions = this.apiService.expenses.filter(expense =>
            expense.date.startsWith(currentMonth));
        const income = monthlyTransactions.filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const expenses = monthlyTransactions.filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const balance = income - expenses;

        document.getElementById('monthly-balance').textContent =
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(balance);
    }

    renderActivityFeed() {
        const activityFeed = document.getElementById('activity-feed');
        if (!activityFeed) return;

        const activities = [
            { icon: 'fas fa-sticky-note', text: 'Created new note', time: '2 hours ago' },
            { icon: 'fas fa-link', text: 'Added new link', time: '4 hours ago' },
            { icon: 'fas fa-tasks', text: 'Updated task status', time: '6 hours ago' },
            { icon: 'fas fa-dollar-sign', text: 'Added expense', time: '1 day ago' }
        ];

        activityFeed.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.text}</p>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }
}

window.DashboardModule = DashboardModule;
