// Navigation Module - Handles all navigation logic with URL routing
class NavigationManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        this.bindEvents();
        this.handleInitialRoute();
        this.bindPopStateEvent();
    }

    bindEvents() {
        const navItems = document.querySelectorAll('.nav-item');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');

        navItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const targetPage = item.dataset.page;
                this.navigateTo(targetPage);
            });
        });

        // Sidebar toggle
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                sidebar.classList.toggle('open');
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (sidebar && !sidebar.contains(e.target) && !sidebarToggle?.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    bindPopStateEvent() {
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || this.getPageFromUrl();
            this.showPage(page);
        });
    }

    handleInitialRoute() {
        const page = this.getPageFromUrl();
        this.showPage(page);
    }

    getPageFromUrl() {
        const hash = window.location.hash.substring(1); // Remove #
        const validPages = ['dashboard', 'notes', 'links', 'projects', 'finance'];
        return validPages.includes(hash) ? hash : 'dashboard';
    }

    navigateTo(page) {
        // Update URL without triggering page reload
        window.history.pushState({ page }, '', `#${page}`);
        this.showPage(page);
    }

    showPage(page) {
        const navItems = document.querySelectorAll('.nav-item');
        const pages = document.querySelectorAll('.page');
        const sidebar = document.getElementById('sidebar');

        // Update active nav item
        navItems.forEach(nav => nav.classList.remove('active'));
        const targetNavItem = document.querySelector(`[data-page="${page}"]`);
        if (targetNavItem) {
            targetNavItem.classList.add('active');
        }

        // Show target page
        pages.forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        this.currentPage = page;

        // Close sidebar on mobile
        if (sidebar) {
            sidebar.classList.remove('open');
        }

        // Initialize page module
        this.initializePageModule(page);
    }

    initializePageModule(page) {
        switch (page) {
            case 'dashboard':
                if (window.DashboardModule) {
                    window.DashboardModule.init();
                }
                break;
            case 'notes':
                if (window.NotesModule) {
                    window.NotesModule.init();
                }
                break;
            case 'links':
                if (window.LinksModule) {
                    window.LinksModule.init();
                }
                break;
            case 'projects':
                if (window.ProjectsModule) {
                    window.ProjectsModule.init();
                }
                break;
            case 'finance':
                if (window.FinanceModule) {
                    window.FinanceModule.init();
                }
                break;
        }
    }

    renderCurrentPage() {
        this.showPage(this.currentPage);
    }
}

window.NavigationManager = NavigationManager;
