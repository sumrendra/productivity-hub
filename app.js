// Clean, Fixed Application with Proper Navigation and Modular Structure
class ProductivePro {
    constructor() {
        this.apiService = new ApiService();
        this.modules = {};
        this.navigationManager = null;
        this.init();
    }

    async init() {
        // Load all data first
        await this.apiService.loadAllData();

        // Initialize modules
        this.modules.dashboard = new DashboardModule(this.apiService);
        this.modules.notes = new NotesModule(this.apiService);
        this.modules.links = new LinksModule(this.apiService);
        this.modules.projects = new ProjectsModule(this.apiService);
        this.modules.finance = new FinanceModule(this.apiService);

        // Set global references for backwards compatibility and proper access
        window.ApiService = this.apiService;
        window.DashboardModule = this.modules.dashboard;
        window.NotesModule = this.modules.notes; // <-- instance, not class
        window.LinksModule = this.modules.links;
        window.ProjectsModule = this.modules.projects;
        window.FinanceModule = this.modules.finance;
        window.app = this;

        // Debug: expose and show type of NotesModule in console to aid troubleshooting
        try {
            console.log('NotesModule global:', window.NotesModule);
            console.log('openNoteInEditor present:', typeof window.NotesModule?.openNoteInEditor);
        } catch (e) {
            console.warn('NotesModule debug check failed', e);
        }

        // Initialize navigation manager with URL routing
        this.navigationManager = new NavigationManager();

        // Initialize modals if UIUtils exists
        if (window.UIUtils) {
            window.UIUtils.initializeModalHandlers();
        }

        console.log('ProductivePro initialized successfully!');
    }

    // Method to get current module for debugging
    getCurrentModule() {
        return this.modules[this.navigationManager?.currentPage] || null;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productivePro = new ProductivePro();
});
