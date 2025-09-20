// Notes Module - Fixed version with proper UI and functionality
class NotesModule {
    constructor(apiService) {
        this.apiService = apiService;
        this.currentNoteId = null;
        this.autoSaveTimeout = null;
        this.isFullscreen = false;
    }

    async init() {
        await this.loadNotes();
        this.bindEvents();
        this.render();
    }

    async loadNotes() {
        if (this.apiService.notes.length === 0) {
            await this.apiService.loadNotes();
        }
    }

    bindEvents() {
        // Search and filters
        const searchInput = document.getElementById('notes-search-input');
        const categorySelect = document.getElementById('notes-category-select');
        const sortSelect = document.getElementById('notes-sort-select');

        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.renderNotesList();
            }, 300));
        }

        if (categorySelect) {
            categorySelect.addEventListener('change', () => {
                this.renderNotesList();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.renderNotesList();
            });
        }

        // Editor events
        this.bindEditorEvents();
    }

    bindEditorEvents() {
        const titleInput = document.getElementById('note-title-input');
        const categorySelect = document.getElementById('note-category-select');
        const contentEditor = document.getElementById('note-content-editor');

        if (titleInput) {
            titleInput.addEventListener('input', () => {
                this.setSaveStatus('saving');
                this.scheduleAutoSave();
            });
        }

        if (categorySelect) {
            categorySelect.addEventListener('change', () => {
                this.setSaveStatus('saving');
                this.scheduleAutoSave();
            });
        }

        if (contentEditor) {
            contentEditor.addEventListener('input', () => {
                this.updateWordCount();
                this.setSaveStatus('saving');
                this.scheduleAutoSave();
            });
        }
    }

    render() {
        this.renderNotesList();
        this.updateEmptyState();
    }

    renderNotesList() {
        const notesList = document.getElementById('notes-list');
        const emptyState = document.getElementById('notes-empty-state');

        if (!notesList || !emptyState) return;

        const searchTerm = document.getElementById('notes-search-input')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('notes-category-select')?.value || '';
        const sortOption = document.getElementById('notes-sort-select')?.value || 'newest';

        let filteredNotes = [...this.apiService.notes];

        // Apply filters
        if (searchTerm) {
            filteredNotes = filteredNotes.filter(note =>
                (note.title && note.title.toLowerCase().includes(searchTerm)) ||
                (note.content && note.content.toLowerCase().includes(searchTerm)) ||
                (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }

        if (categoryFilter) {
            filteredNotes = filteredNotes.filter(note => note.category === categoryFilter);
        }

        // Apply sorting
        filteredNotes.sort((a, b) => {
            switch (sortOption) {
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'title':
                    return (a.title || 'Untitled').localeCompare(b.title || 'Untitled');
                case 'updated':
                    return new Date(b.updated_at || b.createdAt) - new Date(a.updated_at || a.createdAt);
                case 'newest':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        // Show/hide empty state based on ALL notes, not filtered notes
        if (this.apiService.notes.length === 0) {
            notesList.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            notesList.style.display = 'flex';
            emptyState.style.display = 'none';

            if (filteredNotes.length === 0) {
                // Show "no results" message for filtered search
                notesList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>No notes found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                `;
            } else {
                notesList.innerHTML = filteredNotes.map(note => {
                    const preview = this.stripHtml(note.content || '').substring(0, 100) +
                        (note.content && note.content.length > 100 ? '...' : '');
                    return `
                        <div class="note-list-item ${this.currentNoteId === note.id ? 'active' : ''}" data-note-id="${note.id}">
                            <div class="note-list-title">${this.escapeHtml(note.title || 'Untitled Note')}</div>
                            <div class="note-list-preview">${this.escapeHtml(preview)}</div>
                            <div class="note-list-meta">
                                <span class="note-list-category">${note.category || 'Uncategorized'}</span>
                                <span class="note-list-date">${this.formatDate(note.createdAt)}</span>
                            </div>
                        </div>
                    `;
                }).join('');

                // Attach click handlers using instance methods (avoids relying on globals)
                const items = notesList.querySelectorAll('.note-list-item');
                items.forEach(item => {
                    const id = item.getAttribute('data-note-id');
                    item.addEventListener('click', (e) => {
                        this.openNoteInEditor(Number(id));
                    });
                });
            }
        }
    }

    updateEmptyState() {
        const welcomeScreen = document.getElementById('notes-welcome-screen');
        const editor = document.getElementById('notes-editor');

        // Show welcome screen only when no note is currently selected
        // but distinguish between "no notes exist" vs "notes exist but none selected"
        if (!this.currentNoteId) {
            if (welcomeScreen) {
                welcomeScreen.style.display = 'flex';

                // Find the welcome content elements
                const welcomeTitle = welcomeScreen.querySelector('h2');
                const welcomeMessage = welcomeScreen.querySelector('p');
                const createButton = welcomeScreen.querySelector('button');

                if (this.apiService.notes.length === 0) {
                    // No notes exist - show "create first note" message
                    if (welcomeTitle) welcomeTitle.textContent = 'Welcome to Notes';
                    if (welcomeMessage) welcomeMessage.textContent = 'Create your first note to get started with organizing your thoughts.';
                    if (createButton) {
                        createButton.innerHTML = '<span class="material-icons">add</span> Create Your First Note';
                        createButton.style.display = 'block';
                    }
                } else {
                    // Notes exist but none selected - show "select note" message
                    if (welcomeTitle) welcomeTitle.textContent = 'Welcome to Notes';
                    if (welcomeMessage) welcomeMessage.textContent = 'Select a note from the sidebar to start editing, or create a new note.';
                    if (createButton) {
                        // Hide the big "Create Your First Note" button when notes exist
                        createButton.style.display = 'none';
                    }
                }
            }
            if (editor) editor.classList.add('hidden');
        } else {
            // Note is selected - show editor, hide welcome screen
            if (welcomeScreen) welcomeScreen.style.display = 'none';
            if (editor) editor.classList.remove('hidden');
        }
    }

    async createNewNote() {
        const newNote = {
            title: '',
            content: '',
            category: 'Personal',
            tags: []
        };

        try {
            const createdNote = await this.apiService.createNote(newNote);
            this.currentNoteId = createdNote.id;
            this.renderNotesList();
            this.openNoteInEditor(createdNote.id);

            setTimeout(() => {
                const titleInput = document.getElementById('note-title-input');
                if (titleInput) {
                    titleInput.focus();
                }
            }, 100);
        } catch (error) {
            console.error('Error creating note:', error);
            if (window.UIUtils) {
                window.UIUtils.showToast('Failed to create note', 'error');
            }
        }
    }

    openNoteInEditor(noteId) {
        const note = this.apiService.notes.find(n => n.id === noteId);
        if (!note) return;

        this.currentNoteId = noteId;
        this.updateEmptyState();

        // Populate editor fields
        const titleInput = document.getElementById('note-title-input');
        const categorySelect = document.getElementById('note-category-select');
        const contentEditor = document.getElementById('note-content-editor');
        const createdDate = document.getElementById('note-created-date');

        if (titleInput) titleInput.value = note.title || '';
        if (categorySelect) categorySelect.value = note.category || 'Personal';
        if (contentEditor) contentEditor.innerHTML = note.content || '';
        if (createdDate) createdDate.textContent = `Created ${this.formatDate(note.createdAt)}`;

        this.renderNoteTags(note.tags || []);
        this.updateWordCount();
        this.renderNotesList();
        this.setSaveStatus('saved');
    }

    scheduleAutoSave() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        this.autoSaveTimeout = setTimeout(() => {
            this.saveCurrentNote();
        }, 2000);
    }

    async saveCurrentNote() {
        if (!this.currentNoteId) return;

        const titleInput = document.getElementById('note-title-input');
        const contentEditor = document.getElementById('note-content-editor');
        const categorySelect = document.getElementById('note-category-select');

        const noteData = {
            title: titleInput?.value || 'Untitled Note',
            content: contentEditor?.innerHTML || '',
            category: categorySelect?.value || 'Personal',
            tags: this.getCurrentNoteTags()
        };

        try {
            await this.apiService.updateNote(this.currentNoteId, noteData);
            this.setSaveStatus('saved');
            this.renderNotesList();
            if (window.DashboardModule) {
                window.DashboardModule.updateStats();
            }
        } catch (error) {
            console.error('Error saving note:', error);
            this.setSaveStatus('error');
            if (window.UIUtils) {
                window.UIUtils.showToast('Failed to save note', 'error');
            }
        }
    }

    async saveCurrentNoteManually() {
        if (!this.currentNoteId) {
            if (window.UIUtils) {
                window.UIUtils.showToast('No note selected to save', 'warning');
            }
            return;
        }

        this.setSaveStatus('saving');
        await this.saveCurrentNote();
    }

    setSaveStatus(status) {
        const saveStatusEl = document.getElementById('note-save-status');
        if (!saveStatusEl) return;

        switch (status) {
            case 'saving':
                saveStatusEl.innerHTML = '<span class="material-icons">sync</span> Saving...';
                saveStatusEl.className = 'save-status saving';
                break;
            case 'saved':
                saveStatusEl.innerHTML = '<span class="material-icons">check</span> Saved';
                saveStatusEl.className = 'save-status saved';
                break;
            case 'error':
                saveStatusEl.innerHTML = '<span class="material-icons">error</span> Error';
                saveStatusEl.className = 'save-status error';
                break;
        }
    }

    updateWordCount() {
        const content = document.getElementById('note-content-editor');
        const wordCountEl = document.getElementById('note-word-count');
        if (!content || !wordCountEl) return;

        const text = this.stripHtml(content.innerHTML);
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        wordCountEl.textContent = `${words.length} words`;
    }

    getCurrentNoteTags() {
        const tagsContainer = document.getElementById('note-tags-container');
        if (!tagsContainer) return [];

        const tagElements = tagsContainer.querySelectorAll('.note-tag');
        return Array.from(tagElements).map(el => el.textContent.replace('close', '').trim());
    }

    renderNoteTags(tags) {
        const tagsContainer = document.getElementById('note-tags-container');
        if (!tagsContainer) return;

        const tagInput = tagsContainer.querySelector('.tag-input');

        // Clear existing tags but keep input
        const existingTags = tagsContainer.querySelectorAll('.note-tag');
        existingTags.forEach(tag => tag.remove());

        // Add tags
        tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'note-tag';
            const textSpan = document.createElement('span');
            textSpan.textContent = tag;
            const closeIcon = document.createElement('span');
            closeIcon.className = 'material-icons';
            closeIcon.textContent = 'close';
            closeIcon.style.cursor = 'pointer';
            closeIcon.addEventListener('click', () => this.removeTag(tag));
            tagElement.appendChild(textSpan);
            tagElement.appendChild(closeIcon);
            tagsContainer.insertBefore(tagElement, tagInput);
        });
    }

    removeTag(tagText) {
        const tagsContainer = document.getElementById('note-tags-container');
        if (!tagsContainer) return;

        const tagElements = tagsContainer.querySelectorAll('.note-tag');
        tagElements.forEach(tag => {
            if (tag.textContent.replace('close', '').trim() === tagText) {
                tag.remove();
                this.setSaveStatus('saving');
                this.scheduleAutoSave();
            }
        });
    }

    // Utility methods
    stripHtml(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
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

    formatDate(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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

// Global functions for HTML onclick events
window.createNewNote = function() {
    const inst = window.NotesModule || window.productivePro?.modules?.notes;
    if (inst && typeof inst.createNewNote === 'function') {
        inst.createNewNote();
    }
};

window.saveCurrentNoteManually = function() {
    const inst = window.NotesModule || window.productivePro?.modules?.notes;
    if (inst && typeof inst.saveCurrentNoteManually === 'function') {
        inst.saveCurrentNoteManually();
    }
};

window.formatDocument = function(command) {
    document.execCommand(command, false, null);
    const inst = window.NotesModule || window.productivePro?.modules?.notes;
    if (inst && typeof inst.setSaveStatus === 'function') {
        inst.setSaveStatus('saving');
        inst.scheduleAutoSave();
    }
};

window.handleTagInput = function(event) {
    if (event.key === 'Enter' && event.target.value.trim()) {
        const tagText = event.target.value.trim();
        const tagsContainer = document.getElementById('note-tags-container');

        if (tagsContainer) {
            const tagElement = document.createElement('div');
            tagElement.className = 'note-tag';
            const textSpan = document.createElement('span');
            textSpan.textContent = tagText;
            const closeIcon = document.createElement('span');
            closeIcon.className = 'material-icons';
            closeIcon.textContent = 'close';
            closeIcon.style.cursor = 'pointer';
            closeIcon.addEventListener('click', () => {
                const inst = window.NotesModule || window.productivePro?.modules?.notes;
                if (inst && typeof inst.removeTag === 'function') {
                    inst.removeTag(tagText);
                }
            });
            tagElement.appendChild(textSpan);
            tagElement.appendChild(closeIcon);
            tagsContainer.insertBefore(tagElement, event.target);
            event.target.value = '';
            const inst = window.NotesModule || window.productivePro?.modules?.notes;
            if (inst && typeof inst.setSaveStatus === 'function') {
                inst.setSaveStatus('saving');
                inst.scheduleAutoSave();
            }
        }
    }
};

// Do not export the class to window here (instance is set from app.js or main.js)
