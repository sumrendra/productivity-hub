// Links Module
class LinksModule {
    constructor(apiService) {
        this.apiService = apiService;
    }

    async init() {
        await this.loadLinks();
        this.bindEvents();
        this.render();
    }

    async loadLinks() {
        if (this.apiService.links.length === 0) {
            await this.apiService.loadLinks();
        }
    }

    bindEvents() {
        const searchInput = document.getElementById('links-search');
        const categoryFilter = document.getElementById('links-category-filter');

        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.render();
            }, 300));
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.render();
            });
        }
    }

    render() {
        this.renderLinksGrid();
    }

    renderLinksGrid() {
        const linksGrid = document.getElementById('links-grid');
        if (!linksGrid) return;

        const searchTerm = document.getElementById('links-search')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('links-category-filter')?.value || '';

        let filteredLinks = this.apiService.links;

        if (searchTerm) {
            filteredLinks = filteredLinks.filter(link =>
                link.title.toLowerCase().includes(searchTerm) ||
                link.description.toLowerCase().includes(searchTerm) ||
                (link.tags && link.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }

        if (categoryFilter) {
            filteredLinks = filteredLinks.filter(link => link.category === categoryFilter);
        }

        if (filteredLinks.length === 0) {
            linksGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-link"></i>
                    <h3>No links found</h3>
                    <p>Add your first link to get started</p>
                </div>
            `;
            return;
        }

        linksGrid.innerHTML = filteredLinks.map(link => `
            <div class="link-card">
                <div class="link-header">
                    <a href="${link.url}" target="_blank" class="link-title">${link.title}</a>
                    <div class="note-actions">
                        <button class="note-action" onclick="window.LinksModule.editLink(${link.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="note-action" onclick="window.LinksModule.deleteLink(${link.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="link-url">${link.url}</div>
                <div class="link-description">${link.description}</div>
                <div class="note-tags">
                    ${(link.tags || []).map(tag => `<span class="note-tag">${tag}</span>`).join('')}
                </div>
                <div class="link-meta">
                    <span class="link-category">${link.category}</span>
                    <a href="${link.url}" target="_blank" class="btn btn--sm btn--primary">
                        <i class="fas fa-external-link-alt"></i> Visit
                    </a>
                </div>
            </div>
        `).join('');
    }

    editLink(id) {
        const link = this.apiService.links.find(l => l.id === id);
        if (!link) return;

        window.UIUtils.openModal('link-modal', {
            title: 'Edit Link',
            data: link,
            onSave: async (linkData) => {
                try {
                    await this.apiService.updateLink(id, linkData);
                    this.render();
                    window.UIUtils.showToast('Link updated successfully');
                } catch (error) {
                    console.error('Error updating link:', error);
                }
            }
        });
    }

    async deleteLink(id) {
        window.UIUtils.showConfirmDialog('Are you sure you want to delete this link?', async () => {
            try {
                await this.apiService.deleteLink(id);
                this.render();
                window.UIUtils.showToast('Link deleted successfully');
            } catch (error) {
                console.error('Error deleting link:', error);
            }
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

window.LinksModule = LinksModule;
