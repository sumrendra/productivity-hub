// Global Functions - Functions that need to be accessible from HTML onclick handlers

function getNotesInstance() {
    return window.NotesModule || window.productivePro?.modules?.notes || null;
}

function createNewNote() {
    const inst = getNotesInstance();
    if (inst && typeof inst.createNewNote === 'function') {
        inst.createNewNote();
    }
}

function openNoteInEditor(noteId) {
    const inst = getNotesInstance();
    if (inst && typeof inst.openNoteInEditor === 'function') {
        inst.openNoteInEditor(noteId);
    }
}

function saveCurrentNoteManually() {
    const inst = getNotesInstance();
    if (inst && typeof inst.saveCurrentNoteManually === 'function') {
        inst.saveCurrentNoteManually();
    }
}

function formatDocument(command, value = null) {
    const inst = getNotesInstance();
    if (inst && typeof inst.formatDocument === 'function') {
        inst.formatDocument(command, value);
        return;
    }
    // fallback to execCommand and schedule save
    document.execCommand(command, false, value);
    if (inst && typeof inst.setSaveStatus === 'function') {
        inst.setSaveStatus('saving');
        inst.scheduleAutoSave();
    }
}

function insertLink() {
    const inst = getNotesInstance();
    if (inst && typeof inst.insertLink === 'function') {
        inst.insertLink();
    }
}

function insertImage() {
    const inst = getNotesInstance();
    if (inst && typeof inst.insertImage === 'function') {
        inst.insertImage();
    }
}

function insertTable() {
    const inst = getNotesInstance();
    if (inst && typeof inst.insertTable === 'function') {
        inst.insertTable();
    }
}

function insertCodeBlock() {
    const inst = getNotesInstance();
    if (inst && typeof inst.insertCodeBlock === 'function') {
        inst.insertCodeBlock();
    }
}

function handleTagInput(event) {
    const inst = getNotesInstance();
    if (inst && typeof inst.handleTagInput === 'function') {
        inst.handleTagInput(event);
    } else {
        // fallback: call global handler if present
        if (typeof window.handleTagInput === 'function') {
            window.handleTagInput(event);
        }
    }
}

function toggleFullscreen() {
    const inst = getNotesInstance();
    if (inst && typeof inst.toggleFullscreen === 'function') {
        inst.toggleFullscreen();
    }
}

function exportNote() {
    const inst = getNotesInstance();
    if (inst && typeof inst.exportNote === 'function') {
        inst.exportNote();
    }
}

function duplicateNote() {
    const inst = getNotesInstance();
    if (inst && typeof inst.duplicateNote === 'function') {
        inst.duplicateNote();
    }
}

function deleteCurrentNote() {
    const inst = getNotesInstance();
    if (inst && typeof inst.deleteCurrentNote === 'function') {
        inst.deleteCurrentNote();
    }
}

function removeNoteTag(tag) {
    const inst = getNotesInstance();
    if (inst && typeof inst.removeNoteTag === 'function') {
        inst.removeNoteTag(tag);
    }
}

// Modal functions
function showCreateNote() {
    console.log('showCreateNote called');

    // CRITICAL: Check if any modal is already open
    if (window.UIUtils && window.UIUtils.isModalOpen) {
        console.log('showCreateNote blocked - modal already open');
        return;
    }

    // Additional DOM-based check as backup
    if (document.querySelector('.modern-modal:not(.hidden)')) {
        console.log('showCreateNote blocked - DOM check found open modal');
        return;
    }

    window.UIUtils.openModal('note-modal', {
        title: 'Create New Note',
        onSave: async (noteData) => {
            try {
                const tags = noteData.tags ? noteData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
                await window.apiService.createNote({...noteData, tags});
                if (window.DashboardModule) {
                    window.DashboardModule.updateStats();
                }
                window.UIUtils.showToast('Note created successfully');
            } catch (error) {
                console.error('Error creating note:', error);
            }
        }
    });
}

function showCreateLink() {
    console.log('showCreateLink called');

    // CRITICAL: Check if any modal is already open
    if (window.UIUtils && window.UIUtils.isModalOpen) {
        console.log('showCreateLink blocked - modal already open');
        return;
    }

    // Additional DOM-based check as backup
    if (document.querySelector('.modern-modal:not(.hidden)')) {
        console.log('showCreateLink blocked - DOM check found open modal');
        return;
    }

    window.UIUtils.openModal('link-modal', {
        title: 'Add New Link',
        onSave: async (linkData) => {
            try {
                const tags = linkData.tags ? linkData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
                await window.apiService.createLink({...linkData, tags});
                if (window.LinksModule) {
                    window.LinksModule.render();
                }
                if (window.DashboardModule) {
                    window.DashboardModule.updateStats();
                }
                window.UIUtils.showToast('Link created successfully');
            } catch (error) {
                console.error('Error creating link:', error);
                window.UIUtils.showToast('Failed to create link', 'error');
            }
        }
    });
}

function showCreateTask() {
    console.log('showCreateTask called');

    // CRITICAL: Check if any modal is already open
    if (window.UIUtils && window.UIUtils.isModalOpen) {
        console.log('showCreateTask blocked - modal already open');
        return;
    }

    // Additional DOM-based check as backup
    if (document.querySelector('.modern-modal:not(.hidden)')) {
        console.log('showCreateTask blocked - DOM check found open modal');
        return;
    }

    window.UIUtils.openModal('task-modal', {
        title: 'Create New Task',
        onSave: async (taskData) => {
            try {
                const newTask = {
                    ...taskData,
                    status: 'todo', // Default status for new tasks
                    createdAt: new Date().toISOString()
                };
                await window.apiService.createTask(newTask);
                if (window.ProjectsModule) {
                    window.ProjectsModule.render();
                }
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

function showCreateExpense() {
    console.log('showCreateExpense called');

    // CRITICAL: Check if any modal is already open
    if (window.UIUtils && window.UIUtils.isModalOpen) {
        console.log('showCreateExpense blocked - modal already open');
        return;
    }

    // Additional DOM-based check as backup
    if (document.querySelector('.modern-modal:not(.hidden)')) {
        console.log('showCreateExpense blocked - DOM check found open modal');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    window.UIUtils.openModal('expense-modal', {
        title: 'Add Transaction',
        data: { date: today },
        onSave: async (expenseData) => {
            try {
                await window.apiService.createExpense(expenseData);
                if (window.DashboardModule) {
                    window.DashboardModule.updateStats();
                }
                if (window.FinanceModule) {
                    window.FinanceModule.render();
                }
                window.UIUtils.showToast('Transaction created successfully');
            } catch (error) {
                console.error('Error creating expense:', error);
                window.UIUtils.showToast('Failed to create transaction', 'error');
            }
        }
    });
}

function closeModal(modalId) {
    window.UIUtils.closeModal(modalId);
}

function formatText(command) {
    document.execCommand(command, false, null);
    const noteContent = document.getElementById('note-content');
    if (noteContent) {
        noteContent.focus();
    }
}

// expose for HTML if needed (they already call global functions by name)
window.openNoteInEditor = openNoteInEditor;
window.createNewNote = createNewNote;
window.saveCurrentNoteManually = saveCurrentNoteManually;
window.formatDocument = formatDocument;
window.handleTagInput = handleTagInput;
window.toggleFullscreen = toggleFullscreen;
window.exportNote = exportNote;
window.duplicateNote = duplicateNote;
window.deleteCurrentNote = deleteCurrentNote;
window.removeNoteTag = removeNoteTag;

// Explicitly export modal helpers so inline onclick handlers always call the right functions
window.showCreateNote = showCreateNote;
window.showCreateLink = showCreateLink;
window.showCreateTask = showCreateTask;
window.showCreateExpense = showCreateExpense;
