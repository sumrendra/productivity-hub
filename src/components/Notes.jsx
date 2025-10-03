import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Box, Paper, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, IconButton, Chip, Snackbar, Alert, Divider } from '@mui/material';
import ApiService from '../utils/api.js';
import QuillToolbar from './QuillToolbar';
import { modules, formats } from './quill-toolbar-options';

const Notes = ({ apiService }) => {
    const [notes, setNotes] = useState([]);
    const [currentNote, setCurrentNote] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortOption, setSortOption] = useState('newest');
    const [saveStatus, setSaveStatus] = useState('saved'); // saved, saving, error
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [editorContent, setEditorContent] = useState('');
    const autoSaveTimeoutRef = useRef(null);

    useEffect(() => {
        if (apiService) {
            fetchNotes();
        }
    }, [apiService]);

    useEffect(() => {
        if (currentNote) {
            setEditorContent(currentNote.content);
        }
    }, [currentNote]);

    const fetchNotes = async () => {
        try {
            const fetchedNotes = await apiService.loadNotes();
            setNotes(fetchedNotes);
        } catch (error) {
            showSnackbar('Failed to load notes', 'error');
            console.error('Error fetching notes:', error);
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const debounce = (func, delay) => {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    };

    const scheduleAutoSave = () => {
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }
        setSaveStatus('saving');
        autoSaveTimeoutRef.current = setTimeout(() => {
            saveCurrentNote();
        }, 2000);
    };

    const saveCurrentNote = async () => {
        if (!currentNote) return;

        const noteData = {
            title: currentNote.title,
            content: editorContent,
            category: currentNote.category,
            tags: currentNote.tags
        };

        try {
            await apiService.updateNote(currentNote.id, noteData);
            setSaveStatus('saved');
            showSnackbar('Note saved successfully', 'success');
            fetchNotes(); // Re-fetch notes to update list
            // TODO: Update DashboardModule stats
        } catch (error) {
            console.error('Error saving note:', error);
            setSaveStatus('error');
            showSnackbar('Failed to save note', 'error');
        }
    };

    const createNewNote = async () => {
        const newNoteData = {
            title: '',
            content: '',
            category: 'Personal',
            tags: []
        };
        try {
            const createdNote = await apiService.createNote(newNoteData);
            setNotes(prevNotes => [createdNote, ...prevNotes]);
            setCurrentNote(createdNote);
            showSnackbar('Note created successfully', 'success');
        } catch (error) {
            console.error('Error creating note:', error);
            showSnackbar('Failed to create note', 'error');
        }
    };

    const openNoteInEditor = (noteId) => {
        const note = notes.find(n => n.id === noteId);
        if (note) {
            setCurrentNote(note);
            setEditorContent(note.content || '');
            // Reset save status when opening a new note
            setSaveStatus('saved');
        }
    };

    const deleteCurrentNote = async () => {
        if (!currentNote) return;
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await apiService.deleteNote(currentNote.id);
                setNotes(prevNotes => prevNotes.filter(n => n.id !== currentNote.id));
                setCurrentNote(null);
                showSnackbar('Note deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting note:', error);
                showSnackbar('Failed to delete note', 'error');
            }
        }
    };

    const duplicateNote = async () => {
        if (!currentNote) return;
        const duplicatedNoteData = {
            title: `Copy of ${currentNote.title}`,
            content: currentNote.content,
            category: currentNote.category,
            tags: currentNote.tags,
        };
        try {
            const newNote = await apiService.createNote(duplicatedNoteData);
            setNotes(prevNotes => [newNote, ...prevNotes]);
            setCurrentNote(newNote);
            showSnackbar('Note duplicated successfully', 'success');
        } catch (error) {
            console.error('Error duplicating note:', error);
            showSnackbar('Failed to duplicate note', 'error');
        }
    };

    const exportNote = () => {
        if (!currentNote) return;
        const content = editorContent || '';
        const title = currentNote.title || 'note';
        const blob = new Blob([content], { type: 'text/html' });
        const a = document.createElement('a');
        a.download = `${title}.html`;
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        a.remove();
        showSnackbar('Note exported successfully', 'success');
    };

    const toggleFullscreen = () => {
        const editor = document.getElementById('notes-editor'); // Needs to be a ref
        if (editor) {
            if (!document.fullscreenElement) {
                editor.requestFullscreen();
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const handleTagInput = (event) => {
        if (event.key === 'Enter' && event.target.value.trim()) {
            const newTag = event.target.value.trim();
            if (currentNote && !currentNote.tags.includes(newTag)) {
                const updatedTags = [...currentNote.tags, newTag];
                setCurrentNote(prev => ({ ...prev, tags: updatedTags }));
                event.target.value = '';
                scheduleAutoSave();
            }
        }
    };

    const removeTag = (tagText) => {
        if (currentNote) {
            const updatedTags = currentNote.tags.filter(tag => tag !== tagText);
            setCurrentNote(prev => ({ ...prev, tags: updatedTags }));
            scheduleAutoSave();
        }
    };

    const getCurrentNoteTags = () => {
        // This function needs to get tags from the currentNote state, not DOM
        return currentNote?.tags || [];
    };

    const quillRef = useRef(null);

    const [wordCount, setWordCount] = useState(0);

    const updateWordCount = () => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            const text = editor.getText();
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
            setWordCount(words.length);
        }
    };

    const stripHtml = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    };

    const escapeHtml = (text) => {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredAndSortedNotes = notes
        .filter(note => {
            const matchesSearch = searchTerm === '' ||
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
            const matchesCategory = categoryFilter === '' || note.category === categoryFilter;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
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

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex' }}>
            {/* Notes Sidebar */}
            <Paper elevation={1} sx={{ width: 320, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            <i className="material-icons" style={{ marginRight: '8px', verticalAlign: 'middle' }}>note</i>
                            Notes
                        </Typography>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<i className="material-icons">add</i>}
                            onClick={createNewNote}
                        >
                            New Note
                        </Button>
                    </Box>

                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <i className="material-icons" style={{ marginRight: '8px' }}>search</i>
                        }}
                        sx={{ mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <FormControl size="small" sx={{ flex: 1 }}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={categoryFilter}
                                label="Category"
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <MenuItem value="">All Categories</MenuItem>
                                <MenuItem value="Work">Work</MenuItem>
                                <MenuItem value="Personal">Personal</MenuItem>
                                <MenuItem value="Development">Development</MenuItem>
                                <MenuItem value="Ideas">Ideas</MenuItem>
                                <MenuItem value="Meeting">Meeting</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ flex: 1 }}>
                            <InputLabel>Sort</InputLabel>
                            <Select
                                value={sortOption}
                                label="Sort"
                                onChange={(e) => setSortOption(e.target.value)}
                            >
                                <MenuItem value="newest">Newest First</MenuItem>
                                <MenuItem value="oldest">Oldest First</MenuItem>
                                <MenuItem value="title">Title A-Z</MenuItem>
                                <MenuItem value="updated">Recently Updated</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" className="view-toggle-btn active" data-view="list">
                            <i className="material-icons">view_list</i>
                        </IconButton>
                        <IconButton size="small" className="view-toggle-btn" data-view="grid">
                            <i className="material-icons">view_module</i>
                        </IconButton>
                    </Box>
                </Box>

                <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                    {filteredAndSortedNotes.length === 0 ? (
                        <Box className="notes-empty-state" sx={{ textAlign: 'center', p: 4 }}>
                            <i className="material-icons" style={{ fontSize: '48px', opacity: 0.5, marginBottom: '16px' }}>note</i>
                            <Typography variant="h6" sx={{ mb: 1 }}>No notes yet</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Create your first note to get started
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<i className="material-icons">add</i>}
                                onClick={createNewNote}
                            >
                                Create Note
                            </Button>
                        </Box>
                    ) : (
                        <div className="notes-list">
                            {filteredAndSortedNotes.map(note => (
                                <div
                                    key={note.id}
                                    className={`note-list-item ${currentNote?.id === note.id ? 'active' : ''}`}
                                    onClick={() => openNoteInEditor(note.id)}
                                >
                                    <div className="note-list-title">{escapeHtml(note.title || 'Untitled Note')}</div>
                                    <div className="note-list-preview">{escapeHtml(stripHtml(note.content || '').substring(0, 100))}...</div>
                                    <div className="note-list-meta">
                                        <span className="note-list-category">{note.category || 'Uncategorized'}</span>
                                        <span className="note-list-date">{formatDate(note.createdAt)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Box>
            </Paper>

            {/* Notes Editor */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {!currentNote ? (
                    <Paper elevation={0} sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                    }}>
                        <Box>
                            <i className="material-icons" style={{ fontSize: '64px', opacity: 0.5, marginBottom: '24px' }}>note</i>
                            <Typography variant="h4" sx={{ mb: 2 }}>Welcome to Notes</Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                Select a note from the sidebar to start editing, or create a new note.
                            </Typography>
                            {notes.length === 0 && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<i className="material-icons">add</i>}
                                    onClick={createNewNote}
                                >
                                    Create Your First Note
                                </Button>
                            )}
                        </Box>
                    </Paper>
                ) : (
                    <Paper id="notes-editor" elevation={0} sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Editor Header */}
                        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <TextField
                                        id="note-title-input"
                                        placeholder="Untitled Note"
                                        variant="standard"
                                        fullWidth
                                        value={currentNote.title}
                                        onChange={(e) => {
                                            setCurrentNote(prev => ({ ...prev, title: e.target.value }));
                                            scheduleAutoSave();
                                        }}
                                        sx={{
                                            fontSize: '1.5rem',
                                            fontWeight: 600,
                                            mb: 1
                                        }}
                                        InputProps={{ style: { fontSize: '1.5rem', fontWeight: 600 } }}
                                    />
                                    <Box sx={{ display: 'flex', gap: 2, fontSize: '0.75rem', color: 'text.secondary' }}>
                                        <span id="note-created-date">{`Created ${formatDate(currentNote.createdAt)}`}</span>
                                        <span id="note-word-count">{wordCount} words</span>
                                        <span id="note-save-status">
                                            {saveStatus === 'saved' && <><i className="material-icons" style={{ fontSize: '14px' }}>check</i> Saved</>}
                                            {saveStatus === 'saving' && <><i className="material-icons" style={{ fontSize: '14px' }}>sync</i> Saving...</>}
                                            {saveStatus === 'error' && <><i className="material-icons" style={{ fontSize: '14px' }}>error</i> Error</>}
                                        </span>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            id="note-category-select"
                                            value={currentNote.category}
                                            label="Category"
                                            onChange={(e) => {
                                                setCurrentNote(prev => ({ ...prev, category: e.target.value }));
                                                scheduleAutoSave();
                                            }}
                                        >
                                            <MenuItem value="Work">Work</MenuItem>
                                            <MenuItem value="Personal">Personal</MenuItem>
                                            <MenuItem value="Development">Development</MenuItem>
                                            <MenuItem value="Ideas">Ideas</MenuItem>
                                            <MenuItem value="Meeting">Meeting</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton size="small" onClick={saveCurrentNote} title="Save Note">
                                            <i className="material-icons">save</i>
                                        </IconButton>
                                        <IconButton size="small" onClick={toggleFullscreen} title="Fullscreen">
                                            <i className="material-icons">fullscreen</i>
                                        </IconButton>
                                        <IconButton size="small" onClick={exportNote} title="Export">
                                            <i className="material-icons">download</i>
                                        </IconButton>
                                        <IconButton size="small" onClick={duplicateNote} title="Duplicate">
                                            <i className="material-icons">content_copy</i>
                                        </IconButton>
                                        <IconButton size="small" onClick={deleteCurrentNote} title="Delete" color="error">
                                            <i className="material-icons">delete</i>
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Rich Text Editor Toolbar */}
                        <QuillToolbar />

                        {/* Editor Content */}
                        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={editorContent}
                                onChange={(content, delta, source, editor) => {
                                    setEditorContent(content);
                                    if (source === 'user') {
                                        scheduleAutoSave();
                                    }
                                    updateWordCount();
                                }}
                                modules={modules}
                                formats={formats}
                                style={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            />
                        </Box>

                        {/* Tags Section */}
                        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: 'background.default' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <i className="material-icons" style={{ fontSize: '18px', marginRight: '8px' }}>local_offer</i>
                                <Typography variant="body2">Tags:</Typography>
                            </Box>
                            <Box id="note-tags-container" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                                {currentNote.tags.map(tag => (
                                    <Chip
                                        key={tag}
                                        label={tag}
                                        onDelete={() => removeTag(tag)}
                                        size="small"
                                        sx={{ bgcolor: 'primary.light', color: 'primary.main' }}
                                    />
                                ))}
                                <TextField
                                    id="tag-input"
                                    placeholder="Add a tag..."
                                    variant="standard"
                                    size="small"
                                    onKeyDown={handleTagInput}
                                    sx={{ minWidth: 150 }}
                                />
                            </Box>
                        </Box>
                    </Paper>
                )}
            </Box>
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Notes;