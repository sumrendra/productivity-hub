// Main Application Entry Point
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize global services
    window.apiService = new ApiService();

    // Initialize modules
    window.DashboardModule = new DashboardModule(window.apiService);
    window.NotesModule = new NotesModule(window.apiService);
    window.LinksModule = new LinksModule(window.apiService);
    window.ProjectsModule = new ProjectsModule(window.apiService);
    window.FinanceModule = new FinanceModule(window.apiService);

    // Initialize navigation
    window.navigationManager = new NavigationManager();

    // Initialize UI utilities
    window.UIUtils.initializeModalHandlers();

    // Load all data
    await window.apiService.loadAllData();

    // Initialize dashboard by default
    window.DashboardModule.init();

    console.log('ProductivePro app initialized successfully!');
});

