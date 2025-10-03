// Components Bundle - All components converted to React.createElement format
// This file contains all the main components for the ProductivePro application

const {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Container,
    Paper,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    Tab,
    Tabs,
    ThemeProvider,
    createTheme,
    CssBaseline
} = MaterialUI;

// Links Component
function Links({ apiService }) {
    const [links, setLinks] = React.useState([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('');
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editing, setEditing] = React.useState(null);
    const [formData, setFormData] = React.useState({ title: '', url: '', category: 'Personal', description: '', tags: '' });

    React.useEffect(() => { fetchLinks(); }, []);

    const fetchLinks = async () => {
        try { setLinks(await apiService.loadLinks()); }
        catch (error) { showSnackbar('Failed to load links', 'error'); }
    };

    const showSnackbar = (message, severity) => { setSnackbarMessage(message); setSnackbarSeverity(severity); setSnackbarOpen(true); };
    const handleSnackbarClose = (_, reason) => { if (reason !== 'clickaway') setSnackbarOpen(false); };

    const openCreate = () => { setEditing(null); setFormData({ title: '', url: '', category: 'Personal', description: '', tags: '' }); setDialogOpen(true); };
    const openEdit = (link) => { setEditing(link); setFormData({ title: link.title||'', url: link.url||'', category: link.category||'Personal', description: link.description||'', tags: (link.tags||[]).join(', ') }); setDialogOpen(true); };
    const handleDialogClose = () => setDialogOpen(false);

    const handleSave = async () => {
        const payload = {
            title: formData.title.trim(),
            url: formData.url.trim(),
            category: formData.category,
            description: formData.description.trim(),
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        };
        try {
            if (editing) { await apiService.updateLink(editing.id, payload); showSnackbar('Link updated', 'success'); }
            else { await apiService.createLink(payload); showSnackbar('Link created', 'success'); }
            setDialogOpen(false); fetchLinks();
        } catch (e) { showSnackbar('Failed to save link', 'error'); }
    };

    const deleteLink = async (id) => {
        if (!window.confirm('Delete this link?')) return;
        try { await apiService.deleteLink(id); setLinks(prev => prev.filter(l => l.id !== id)); showSnackbar('Link deleted', 'success'); }
        catch (e) { showSnackbar('Failed to delete', 'error'); }
    };

    const filteredLinks = links.filter(link => {
        const q = searchTerm.toLowerCase();
        const matchesSearch = !q || link.title.toLowerCase().includes(q) || (link.description||'').toLowerCase().includes(q) || (link.url||'').toLowerCase().includes(q) || (link.tags||[]).some(t => t.toLowerCase().includes(q));
        const matchesCategory = !categoryFilter || link.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return React.createElement(Container, { maxWidth: 'lg' },
        React.createElement(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 } },
            React.createElement(Box, null,
                React.createElement(Typography, { variant: 'h4', sx: { mb: 1 } }, 'Links'),
                React.createElement(Typography, { variant: 'body2', color: 'text.secondary' }, 'Manage your useful URLs and resources')
            ),
            React.createElement(Box, { sx: { display: 'flex', gap: 1 } },
                React.createElement(Button, { variant: 'contained', startIcon: React.createElement('i', { className: 'material-icons' }, 'add'), onClick: openCreate }, 'Add Link')
            )
        ),
        React.createElement(Box, { sx: { display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' } },
            React.createElement(TextField, { size: 'small', placeholder: 'Search links...', value: searchTerm, onChange: e => setSearchTerm(e.target.value), sx: { minWidth: 280 }, InputProps: { startAdornment: React.createElement('i', { className: 'material-icons', style: { marginRight: 8, color: '#666' } }, 'search') } }),
            React.createElement(FormControl, { size: 'small', sx: { minWidth: 200 } },
                React.createElement(InputLabel, null, 'Category'),
                React.createElement(Select, { value: categoryFilter, label: 'Category', onChange: e => setCategoryFilter(e.target.value) },
                    React.createElement(MenuItem, { value: '' }, 'All Categories'),
                    React.createElement(MenuItem, { value: 'Development' }, 'Development'),
                    React.createElement(MenuItem, { value: 'Design' }, 'Design'),
                    React.createElement(MenuItem, { value: 'Business' }, 'Business'),
                    React.createElement(MenuItem, { value: 'Personal' }, 'Personal')
                )
            )
        ),
        React.createElement(Grid, { container: true, spacing: 2 },
            filteredLinks.length === 0 ?
                React.createElement(Grid, { item: true, xs: 12 },
                    React.createElement(Box, { sx: { textAlign: 'center', p: 4 } },
                        React.createElement('i', { className: 'material-icons', style: { fontSize: 48, opacity: .5, marginBottom: 16 } }, 'link'),
                        React.createElement(Typography, { variant: 'h6', sx: { mb: 1 } }, 'No links found'),
                        React.createElement(Typography, { variant: 'body2', color: 'text.secondary', sx: { mb: 2 } }, 'Add your first link to get started'),
                        React.createElement(Button, { variant: 'contained', startIcon: React.createElement('i', { className: 'material-icons' }, 'add'), onClick: openCreate }, 'Add Link')
                    )
                )
            :
                filteredLinks.map(link => React.createElement(Grid, { key: link.id, item: true, xs: 12, sm: 6, md: 4 },
                    React.createElement(Card, { elevation: 1 },
                        React.createElement(CardContent, null,
                            React.createElement(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 } },
                                React.createElement(Typography, { variant: 'h6', sx: { fontWeight: 600, flex: 1, mr: 1 } }, link.title),
                                React.createElement(Box, { sx: { display: 'flex', gap: .5 } },
                                    React.createElement(IconButton, { size: 'small', onClick: () => openEdit(link), title: 'Edit' }, React.createElement('i', { className: 'material-icons' }, 'edit')),
                                    React.createElement(IconButton, { size: 'small', color: 'error', onClick: () => deleteLink(link.id), title: 'Delete' }, React.createElement('i', { className: 'material-icons' }, 'delete'))
                                )
                            ),
                            React.createElement(Typography, { variant: 'body2', color: 'text.secondary', sx: { mb: 1, wordBreak: 'break-all' } }, link.url),
                            link.description && React.createElement(Typography, { variant: 'body2', sx: { mb: 1 } }, link.description),
                            React.createElement(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                                React.createElement(Box, { sx: { display: 'flex', gap: .5, flexWrap: 'wrap' } }, (link.tags||[]).slice(0, 3).map((t, i) => React.createElement(Chip, { key: i, label: t, size: 'small' }))),
                                React.createElement(Button, { variant: 'outlined', size: 'small', href: link.url, target: '_blank', rel: 'noopener noreferrer', startIcon: React.createElement('i', { className: 'material-icons' }, 'open_in_new') }, 'Visit')
                            )
                        )
                    )
                ))
        ),
        React.createElement(Dialog, { open: dialogOpen, onClose: handleDialogClose, maxWidth: 'sm', fullWidth: true },
            React.createElement(DialogTitle, null, editing ? 'Edit Link' : 'Create New Link'),
            React.createElement(DialogContent, null,
                React.createElement(TextField, { autoFocus: true, margin: 'dense', label: 'Title', fullWidth: true, value: formData.title, onChange: e => setFormData({ ...formData, title: e.target.value }) }),
                React.createElement(TextField, { margin: 'dense', label: 'URL', fullWidth: true, value: formData.url, onChange: e => setFormData({ ...formData, url: e.target.value }), type: 'url' }),
                React.createElement(FormControl, { fullWidth: true, margin: 'dense' },
                    React.createElement(InputLabel, null, 'Category'),
                    React.createElement(Select, { value: formData.category, label: 'Category', onChange: e => setFormData({ ...formData, category: e.target.value }) },
                        React.createElement(MenuItem, { value: 'Development' }, 'Development'),
                        React.createElement(MenuItem, { value: 'Design' }, 'Design'),
                        React.createElement(MenuItem, { value: 'Business' }, 'Business'),
                        React.createElement(MenuItem, { value: 'Personal' }, 'Personal')
                    )
                ),
                React.createElement(TextField, { margin: 'dense', label: 'Description', fullWidth: true, multiline: true, rows: 3, value: formData.description, onChange: e => setFormData({ ...formData, description: e.target.value }) }),
                React.createElement(TextField, { margin: 'dense', label: 'Tags (comma-separated)', fullWidth: true, value: formData.tags, onChange: e => setFormData({ ...formData, tags: e.target.value }) })
            ),
            React.createElement(DialogActions, null,
                React.createElement(Button, { onClick: handleDialogClose }, 'Cancel'),
                React.createElement(Button, { variant: 'contained', onClick: handleSave }, editing ? 'Update' : 'Create')
            )
        ),
        React.createElement(Snackbar, { open: snackbarOpen, autoHideDuration: 4000, onClose: handleSnackbarClose }, React.createElement(Alert, { onClose: handleSnackbarClose, severity: snackbarSeverity, sx: { width: '100%' } }, snackbarMessage))
    );
}

// Notes Component
function Notes({ apiService }) {
    const {
        Box, Paper, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel,
        IconButton, Chip, Snackbar, Alert, List, ListItem, ListItemButton, ListItemText
    } = MaterialUI;

    const [notes, setNotes] = React.useState([]);
    const [currentNote, setCurrentNote] = React.useState(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('');
    const [sortOption, setSortOption] = React.useState('newest');
    const [saveStatus, setSaveStatus] = React.useState('idle'); // idle | saving | saved | error
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');
    const [wordCount, setWordCount] = React.useState(0);

    const quillRef = React.useRef(null);
    const editorContainerRef = React.useRef(null);
    const autoSaveRef = React.useRef(null);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try { const list = await apiService.loadNotes(); if (mounted) setNotes(list); }
            catch (e) { showSnackbar('Failed to load notes', 'error'); }
        })();
        return () => { mounted = false; if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
    }, []);

    React.useEffect(() => {
        // Initialize Quill once
        if (!quillRef.current && editorContainerRef.current && window.Quill) {
            const q = new window.Quill(editorContainerRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: '#quill-toolbar',
                    history: { delay: 500, maxStack: 200, userOnly: true }
                }
            });
            q.on('text-change', () => { updateWordCount(q); scheduleAutoSave(); });
            quillRef.current = q;
        }
    }, [editorContainerRef.current]);

    React.useEffect(() => {
        // Load selected note content into editor
        if (currentNote && quillRef.current) {
            quillRef.current.setContents([]); // clear delta
            quillRef.current.clipboard.dangerouslyPasteHTML(currentNote.content || '');
            setTimeout(() => updateWordCount(quillRef.current), 0);
            setSaveStatus('saved');
        }
    }, [currentNote]);

    React.useEffect(() => {
        const onKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                saveCurrent(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [currentNote]);

    const showSnackbar = (message, severity) => { setSnackbarMessage(message); setSnackbarSeverity(severity); setSnackbarOpen(true); };
    const handleSnackbarClose = (_, reason) => { if (reason !== 'clickaway') setSnackbarOpen(false); };

    const scheduleAutoSave = () => {
        if (!currentNote) return;
        setSaveStatus('saving');
        if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
        autoSaveRef.current = setTimeout(() => saveCurrent(true), 1200);
    };

    const getEditorHtml = () => {
        if (quillRef.current) return quillRef.current.root.innerHTML;
        // Fallback if Quill not loaded
        return editorContainerRef.current ? editorContainerRef.current.innerHTML : '';
    };

    const updateWordCount = (q) => {
        const text = (q || quillRef.current)?.getText() || '';
        const count = text.trim().split(/\s+/).filter(Boolean).length;
        setWordCount(count);
    };

    const createNewNote = async () => {
        try {
            const n = await apiService.createNote({ title: 'Untitled', content: '', category: 'Personal', tags: [] });
            setNotes(prev => [n, ...prev]);
            setCurrentNote(n);
            if (quillRef.current) { quillRef.current.setContents([]); }
            setSaveStatus('saved');
            showSnackbar('Note created', 'success');
        } catch (e) { showSnackbar('Failed to create note', 'error'); }
    };

    const openNote = (note) => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); setCurrentNote(note); };

    const saveCurrent = async (isAuto = false) => {
        if (!currentNote) return;
        const title = (currentNote.title || 'Untitled').trim() || 'Untitled';
        const content = getEditorHtml();
        const category = currentNote.category || 'Personal';
        const tags = currentNote.tags || [];
        try {
            await apiService.updateNote(currentNote.id, { title, content, category, tags });
            setSaveStatus('saved');
            setNotes(prev => prev.map(n => n.id === currentNote.id ? { ...n, title, content, category, tags } : n));
        } catch (e) {
            setSaveStatus('error');
            if (!isAuto) showSnackbar('Failed to save note', 'error');
        }
    };

    const deleteCurrent = async () => {
        if (!currentNote) return;
        if (!window.confirm('Delete this note?')) return;
        try { await apiService.deleteNote(currentNote.id); setNotes(p => p.filter(n => n.id !== currentNote.id)); setCurrentNote(null); showSnackbar('Note deleted', 'success'); }
        catch (e) { showSnackbar('Failed to delete note', 'error'); }
    };

    const duplicateCurrent = async () => {
        if (!currentNote) return;
        try {
            const payload = { title: `Copy of ${currentNote.title || 'Untitled'}`, content: currentNote.content || getEditorHtml(), category: currentNote.category || 'Personal', tags: currentNote.tags || [] };
            const copy = await apiService.createNote(payload);
            setNotes(prev => [copy, ...prev]);
            setCurrentNote(copy);
            showSnackbar('Note duplicated', 'success');
        } catch (e) { showSnackbar('Failed to duplicate', 'error'); }
    };

    const exportCurrent = () => {
        if (!currentNote && !quillRef.current) return;
        const title = (currentNote?.title || 'note').replace(/\s+/g, '_');
        const content = getEditorHtml();
        const blob = new Blob([`<html lang="en"><head><meta charset=\"utf-8\"><title>${title}</title></head><body>${content}</body></html>`], { type: 'text/html' });
        const a = document.createElement('a');
        a.download = `${title}.html`;
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a); a.click(); a.remove();
        showSnackbar('Exported note', 'success');
    };

    const toggleFullscreen = () => {
        const el = document.getElementById('notes-editor-shell');
        if (!el) return;
        if (!document.fullscreenElement) el.requestFullscreen?.(); else document.exitFullscreen?.();
    };

    const handleTagInput = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            const newTag = e.target.value.trim();
            if (currentNote && !(currentNote.tags || []).includes(newTag)) {
                const updated = { ...currentNote, tags: [...(currentNote.tags || []), newTag] };
                setCurrentNote(updated);
                setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
                e.target.value = '';
                scheduleAutoSave();
            }
        }
    };

    const removeTag = (tag) => {
        if (!currentNote) return;
        const updated = { ...currentNote, tags: (currentNote.tags || []).filter(t => t !== tag) };
        setCurrentNote(updated);
        setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
        scheduleAutoSave();
    };

    const stripHtml = (html) => (html || '').replace(/<[^>]+>/g, '');
    const formatDate = (d) => !d ? '' : new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const filtered = notes.filter(n => {
        const q = searchTerm.toLowerCase();
        const okQ = !q || (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q) || (n.tags || []).some(t => (t || '').toLowerCase().includes(q));
        const okC = !categoryFilter || n.category === categoryFilter;
        return okQ && okC;
    }).sort((a, b) => {
        if (sortOption === 'oldest') return new Date(a.createdAt || a.created_at || 0) - new Date(b.createdAt || b.created_at || 0);
        if (sortOption === 'title') return (a.title || 'Untitled').localeCompare(b.title || 'Untitled');
        if (sortOption === 'updated') return new Date(b.updated_at || b.createdAt || 0) - new Date(a.updated_at || a.createdAt || 0);
        return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
    });

    return React.createElement(Box, { sx: { height: 'calc(100vh - 100px)', display: 'flex' } },
        // Sidebar
        React.createElement(Paper, { elevation: 1, sx: { width: 340, display: 'flex', flexDirection: 'column' } },
            React.createElement(Box, { sx: { p: 2, borderBottom: '1px solid #e0e0e0' } },
                React.createElement(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 } },
                    React.createElement(Typography, { variant: 'h6', sx: { display: 'flex', alignItems: 'center', gap: 1 } },
                        React.createElement('i', { className: 'material-icons' }, 'note'), 'Notes'
                    ),
                    React.createElement(Button, { variant: 'contained', size: 'small', startIcon: React.createElement('i', { className: 'material-icons' }, 'add'), onClick: createNewNote }, 'New Note')
                ),
                React.createElement(TextField, {
                    fullWidth: true, size: 'small', placeholder: 'Search notes...', value: searchTerm,
                    onChange: e => setSearchTerm(e.target.value), sx: { mb: 2 },
                    InputProps: { startAdornment: React.createElement('i', { className: 'material-icons', style: { marginRight: 8, color: '#666' } }, 'search') }
                }),
                React.createElement(Box, { sx: { display: 'flex', gap: 1, mb: 1 } },
                    React.createElement(FormControl, { size: 'small', sx: { flex: 1 } },
                        React.createElement(InputLabel, null, 'Category'),
                        React.createElement(Select, { value: categoryFilter, label: 'Category', onChange: e => setCategoryFilter(e.target.value) },
                            React.createElement(MenuItem, { value: '' }, 'All'),
                            React.createElement(MenuItem, { value: 'Work' }, 'Work'),
                            React.createElement(MenuItem, { value: 'Personal' }, 'Personal'),
                            React.createElement(MenuItem, { value: 'Development' }, 'Development'),
                            React.createElement(MenuItem, { value: 'Ideas' }, 'Ideas'),
                            React.createElement(MenuItem, { value: 'Meeting' }, 'Meeting')
                        )
                    ),
                    React.createElement(FormControl, { size: 'small', sx: { flex: 1 } },
                        React.createElement(InputLabel, null, 'Sort'),
                        React.createElement(Select, { value: sortOption, label: 'Sort', onChange: e => setSortOption(e.target.value) },
                            React.createElement(MenuItem, { value: 'newest' }, 'Newest'),
                            React.createElement(MenuItem, { value: 'oldest' }, 'Oldest'),
                            React.createElement(MenuItem, { value: 'title' }, 'Title A-Z'),
                            React.createElement(MenuItem, { value: 'updated' }, 'Recently Updated')
                        )
                    )
                )
            ),
            React.createElement(Box, { sx: { flex: 1, overflow: 'auto' } },
                filtered.length === 0 ?
                    React.createElement(Box, { sx: { textAlign: 'center', p: 4 } },
                        React.createElement('i', { className: 'material-icons', style: { fontSize: 48, opacity: .5, marginBottom: 16 } }, 'note'),
                        React.createElement(Typography, { variant: 'h6', sx: { mb: 1 } }, 'No notes yet'),
                        React.createElement(Typography, { variant: 'body2', color: 'text.secondary', sx: { mb: 2 } }, 'Create your first note to get started'),
                        React.createElement(Button, { variant: 'contained', startIcon: React.createElement('i', { className: 'material-icons' }, 'add'), onClick: createNewNote }, 'Create Note')
                    )
                :
                    React.createElement(List, { dense: true },
                        filtered.map(n => React.createElement(ListItem, { key: n.id, disablePadding: true },
                            React.createElement(ListItemButton, {
                                selected: currentNote && currentNote.id === n.id,
                                onClick: () => openNote(n), sx: { alignItems: 'flex-start', py: 1.25 }
                            },
                                React.createElement(ListItemText, {
                                    primary: React.createElement(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 } },
                                        React.createElement(Typography, { variant: 'subtitle1', sx: { fontWeight: 600, flex: 1, pr: 1 } }, n.title || 'Untitled'),
                                        React.createElement(Chip, { label: n.category || 'Uncategorized', size: 'small', variant: 'outlined' })
                                    ),
                                    secondary: React.createElement(Box, { sx: { display: 'flex', justifyContent: 'space-between', gap: 1 } },
                                        React.createElement(Typography, { variant: 'body2', color: 'text.secondary', sx: { pr: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, stripHtml(n.content || '').slice(0, 90)),
                                        React.createElement(Typography, { variant: 'caption', color: 'text.secondary' }, formatDate(n.createdAt || n.created_at))
                                    )
                                })
                            )
                        ))
                    )
            )
        ),

        // Editor area
        React.createElement(Box, { sx: { flex: 1, display: 'flex', flexDirection: 'column' } },
            !currentNote ?
                React.createElement(Paper, { elevation: 0, sx: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' } },
                    React.createElement(Box, null,
                        React.createElement('i', { className: 'material-icons', style: { fontSize: 64, opacity: .5, marginBottom: 16 } }, 'note'),
                        React.createElement(Typography, { variant: 'h4', sx: { mb: 1 } }, 'Welcome to Notes'),
                        React.createElement(Typography, { variant: 'body1', color: 'text.secondary' }, 'Select a note from the sidebar or create a new one')
                    )
                )
            :
                React.createElement(Paper, { id: 'notes-editor-shell', elevation: 0, sx: { flex: 1, display: 'flex', flexDirection: 'column' } },
                    // Header
                    React.createElement(Box, { sx: { p: 2, borderBottom: '1px solid #e0e0e0' } },
                        React.createElement(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 } },
                            React.createElement(Box, { sx: { flex: 1 } },
                                React.createElement(TextField, {
                                    id: 'note-title-input', placeholder: 'Untitled', variant: 'standard', fullWidth: true,
                                    value: currentNote.title || '', onChange: e => { setCurrentNote(prev => ({ ...prev, title: e.target.value })); scheduleAutoSave(); },
                                    InputProps: { style: { fontSize: '1.6rem', fontWeight: 700 } }
                                }),
                                React.createElement(Box, { sx: { display: 'flex', gap: 2, alignItems: 'center', mt: .5, color: 'text.secondary', fontSize: '.85rem' } },
                                    React.createElement('span', null, `Created ${formatDate(currentNote.createdAt || currentNote.created_at)}`),
                                    React.createElement('span', null, `${wordCount} words`),
                                    saveStatus === 'saving' && React.createElement(Chip, { size: 'small', color: 'warning', label: 'Saving…' }),
                                    saveStatus === 'saved' && React.createElement(Chip, { size: 'small', color: 'success', label: 'Saved' }),
                                    saveStatus === 'error' && React.createElement(Chip, { size: 'small', color: 'error', label: 'Error' })
                                )
                            ),
                            React.createElement(Box, { sx: { display: 'flex', gap: 1, alignItems: 'center' } },
                                React.createElement(FormControl, { size: 'small', sx: { minWidth: 140 } },
                                    React.createElement(InputLabel, null, 'Category'),
                                    React.createElement(Select, {
                                        id: 'note-category-select', value: currentNote.category || 'Personal', label: 'Category',
                                        onChange: e => { setCurrentNote(prev => ({ ...prev, category: e.target.value })); scheduleAutoSave(); }
                                    },
                                        React.createElement(MenuItem, { value: 'Work' }, 'Work'),
                                        React.createElement(MenuItem, { value: 'Personal' }, 'Personal'),
                                        React.createElement(MenuItem, { value: 'Development' }, 'Development'),
                                        React.createElement(MenuItem, { value: 'Ideas' }, 'Ideas'),
                                        React.createElement(MenuItem, { value: 'Meeting' }, 'Meeting')
                                    )
                                ),
                                React.createElement(IconButton, { size: 'small', title: 'Save', onClick: () => saveCurrent(false) }, React.createElement('i', { className: 'material-icons' }, 'save')),
                                React.createElement(IconButton, { size: 'small', title: 'Fullscreen', onClick: toggleFullscreen }, React.createElement('i', { className: 'material-icons' }, 'fullscreen')),
                                React.createElement(IconButton, { size: 'small', title: 'Export', onClick: exportCurrent }, React.createElement('i', { className: 'material-icons' }, 'download')),
                                React.createElement(IconButton, { size: 'small', title: 'Duplicate', onClick: duplicateCurrent }, React.createElement('i', { className: 'material-icons' }, 'content_copy')),
                                React.createElement(IconButton, { size: 'small', title: 'Delete', color: 'error', onClick: deleteCurrent }, React.createElement('i', { className: 'material-icons' }, 'delete'))
                            )
                        )
                    ),

                    // Quill Toolbar
                    React.createElement(Box, { sx: { px: 2, py: 1, borderBottom: '1px solid #e0e0e0', backgroundColor: 'background.paper' } },
                        React.createElement('div', { id: 'quill-toolbar' },
                            React.createElement('span', { className: 'ql-formats' },
                                React.createElement('select', { className: 'ql-header' },
                                    React.createElement('option', { value: '1' }),
                                    React.createElement('option', { value: '2' }),
                                    React.createElement('option', { value: '3' }),
                                    React.createElement('option', { value: '' })
                                ),
                                React.createElement('select', { className: 'ql-font' }),
                                React.createElement('select', { className: 'ql-size' })
                            ),
                            React.createElement('span', { className: 'ql-formats' },
                                React.createElement('button', { className: 'ql-bold' }),
                                React.createElement('button', { className: 'ql-italic' }),
                                React.createElement('button', { className: 'ql-underline' }),
                                React.createElement('button', { className: 'ql-strike' })
                            ),
                            React.createElement('span', { className: 'ql-formats' },
                                React.createElement('select', { className: 'ql-color' }),
                                React.createElement('select', { className: 'ql-background' })
                            ),
                            React.createElement('span', { className: 'ql-formats' },
                                React.createElement('button', { className: 'ql-blockquote' }),
                                React.createElement('button', { className: 'ql-code-block' })
                            ),
                            React.createElement('span', { className: 'ql-formats' },
                                React.createElement('button', { className: 'ql-list', value: 'ordered' }),
                                React.createElement('button', { className: 'ql-list', value: 'bullet' }),
                                React.createElement('select', { className: 'ql-align' })
                            ),
                            React.createElement('span', { className: 'ql-formats' },
                                React.createElement('button', { className: 'ql-link' }),
                                React.createElement('button', { className: 'ql-image' })
                            ),
                            React.createElement('span', { className: 'ql-formats' },
                                React.createElement('button', { className: 'ql-clean' })
                            )
                        )
                    ),

                    // Editor
                    React.createElement(Box, { sx: { flex: 1, p: 2, overflow: 'auto' } },
                        React.createElement('div', { ref: editorContainerRef, style: { minHeight: 520 } })
                    ),

                    // Tags
                    React.createElement(Box, { sx: { p: 2, borderTop: '1px solid #e0e0e0', bgcolor: 'background.default' } },
                        React.createElement(Box, { sx: { display: 'flex', alignItems: 'center', mb: 1 } },
                            React.createElement('i', { className: 'material-icons', style: { fontSize: 18, marginRight: 8 } }, 'local_offer'),
                            React.createElement(Typography, { variant: 'body2' }, 'Tags:')
                        ),
                        React.createElement(Box, { sx: { display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' } },
                            (currentNote.tags || []).map(tag => React.createElement(Chip, { key: tag, label: tag, onDelete: () => removeTag(tag), size: 'small', sx: { bgcolor: 'primary.light', color: 'primary.main' } })),
                            React.createElement(TextField, { id: 'tag-input', variant: 'standard', size: 'small', placeholder: 'Add a tag…', onKeyDown: handleTagInput, sx: { minWidth: 160 } })
                        )
                    )
                )
        ),

        React.createElement(Snackbar, { open: snackbarOpen, autoHideDuration: 4000, onClose: handleSnackbarClose },
            React.createElement(Alert, { onClose: handleSnackbarClose, severity: snackbarSeverity, sx: { width: '100%' } }, snackbarMessage)
        )
    );
}

// Projects Component
function Projects({ apiService }) {
    const [tasks, setTasks] = React.useState([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');
    const [draggedTaskId, setDraggedTaskId] = React.useState(null);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editing, setEditing] = React.useState(null);
    const [formData, setFormData] = React.useState({ title: '', status: 'todo', assignee: '', description: '', dueDate: '' });

    React.useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => { try { setTasks(await apiService.loadTasks()); } catch (e) { showSnackbar('Failed to load tasks','error'); } };
    const showSnackbar = (m,s)=>{ setSnackbarMessage(m); setSnackbarSeverity(s); setSnackbarOpen(true); };
    const handleSnackbarClose = (_,r)=>{ if(r!=='clickaway') setSnackbarOpen(false); };

    const openCreate = () => { setEditing(null); setFormData({ title: '', status: 'todo', assignee: '', description: '', dueDate: new Date().toISOString().slice(0,10) }); setDialogOpen(true); };
    const openEdit = (task) => { setEditing(task); setFormData({ title: task.title||'', status: task.status||'todo', assignee: task.assignee||'', description: task.description||'', dueDate: task.dueDate || task.due_date || '' }); setDialogOpen(true); };
    const closeDialog = () => setDialogOpen(false);
    const saveTask = async () => {
        try {
            if (editing) { await apiService.updateTask(editing.id, formData); showSnackbar('Task updated','success'); }
            else { await apiService.createTask(formData); showSnackbar('Task created','success'); }
            setDialogOpen(false); fetchTasks();
        } catch(e){ showSnackbar('Failed to save task','error'); }
    };

    const deleteTask = async (id) => { if(!window.confirm('Delete this task?')) return; try { await apiService.deleteTask(id); setTasks(p=>p.filter(t=>t.id!==id)); showSnackbar('Task deleted','success'); } catch(e){ showSnackbar('Failed to delete','error'); } };

    const moveTask = async (id, newStatus) => {
        const t = tasks.find(x=>x.id===id); if(!t || t.status===newStatus) return;
        try { await apiService.updateTask(id, { ...t, status: newStatus }); showSnackbar('Task moved','success'); fetchTasks(); }
        catch(e){ showSnackbar('Failed to move task','error'); }
    };

    const handleDragStart = (e, id) => { setDraggedTaskId(id); e.dataTransfer.effectAllowed = 'move'; };
    const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
    const handleDrop = (e, status) => { e.preventDefault(); if (draggedTaskId) { moveTask(draggedTaskId, status); setDraggedTaskId(null); } };

    const filtered = tasks.filter(t => {
        const q = searchTerm.toLowerCase();
        return !q || (t.title||'').toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q) || (t.assignee||'').toLowerCase().includes(q);
    });

    const columns = [ { id: 'todo', title: 'To Do', icon: 'list' }, { id: 'in-progress', title: 'In Progress', icon: 'play_circle' }, { id: 'in-review', title: 'In Review', icon: 'visibility' }, { id: 'completed', title: 'Completed', icon: 'check_circle' } ];

    const formatDate = d => !d ? '' : new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });

    return React.createElement(Container, { maxWidth: 'lg' },
        React.createElement(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 } },
            React.createElement(Typography, { variant: 'h4' }, 'Project Board'),
            React.createElement(Button, { variant: 'contained', startIcon: React.createElement('i', { className: 'material-icons' }, 'add'), onClick: openCreate }, 'New Task')
        ),
        React.createElement(TextField, { size: 'small', placeholder: 'Search tasks...', value: searchTerm, onChange: e=>setSearchTerm(e.target.value), sx: { mb: 2, minWidth: 300 }, InputProps: { startAdornment: React.createElement('i', { className: 'material-icons', style: { marginRight: 8, color: '#666' } }, 'search') } }),
        React.createElement(Grid, { container: true, spacing: 2 },
            columns.map(col => React.createElement(Grid, { key: col.id, item: true, xs: 12, sm: 6, md: 3 },
                React.createElement(Paper, { elevation: 1, sx: { height: 520, display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' }, onDragOver: handleDragOver, onDrop: e => handleDrop(e, col.id) },
                    React.createElement(Box, { sx: { p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                        React.createElement(Typography, { variant: 'h6', sx: { display: 'flex', alignItems: 'center', gap: 1 } }, React.createElement('i', { className: 'material-icons' }, col.icon), col.title),
                        React.createElement(Chip, { label: filtered.filter(t => t.status===col.id).length, size: 'small', color: col.id==='completed' ? 'success' : col.id==='in-progress' ? 'info' : col.id==='in-review' ? 'warning' : 'default' })
                    ),
                    React.createElement(Box, { sx: { flex: 1, overflow: 'auto', p: 1 } },
                        filtered.filter(t=>t.status===col.id).length === 0 ?
                            React.createElement(Box, { sx: { textAlign: 'center', p: 3, color: 'text.secondary' } }, React.createElement('i', { className: 'material-icons', style: { fontSize: 48, opacity: .3, marginBottom: 8 } }, col.icon), React.createElement(Typography, { variant: 'body2' }, 'No tasks'))
                        :
                            filtered.filter(t=>t.status===col.id).map(task => React.createElement(Card, { key: task.id, elevation: 2, draggable: true, onDragStart: e=>handleDragStart(e, task.id), sx: { mb: 1, cursor: 'move' } },
                                React.createElement(CardContent, { sx: { p: 2 } },
                                    React.createElement(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 } },
                                        React.createElement(Typography, { variant: 'subtitle2', sx: { fontWeight: 700 } }, task.title),
                                        React.createElement(Box, { sx: { display: 'flex', gap: .5 } },
                                            React.createElement(IconButton, { size: 'small', title: 'Edit', onClick: () => openEdit(task) }, React.createElement('i', { className: 'material-icons' }, 'edit')),
                                            React.createElement(IconButton, { size: 'small', title: 'Delete', color: 'error', onClick: () => deleteTask(task.id) }, React.createElement('i', { className: 'material-icons' }, 'delete'))
                                        )
                                    ),
                                    task.description && React.createElement(Typography, { variant: 'body2', color: 'text.secondary', sx: { mb: 1 } }, task.description),
                                    React.createElement(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                                        React.createElement(Chip, { label: task.assignee || 'Unassigned', size: 'small', variant: 'outlined' }),
                                        task.dueDate && React.createElement(Typography, { variant: 'caption', color: 'text.secondary' }, formatDate(task.dueDate))
                                    )
                                )
                            ))
                    )
                )
            ))
        ),
        React.createElement(Dialog, { open: dialogOpen, onClose: closeDialog, maxWidth: 'sm', fullWidth: true },
            React.createElement(DialogTitle, null, editing ? 'Edit Task' : 'Create New Task'),
            React.createElement(DialogContent, null,
                React.createElement(TextField, { autoFocus: true, margin: 'dense', label: 'Title', fullWidth: true, value: formData.title, onChange: e=>setFormData({ ...formData, title: e.target.value }) }),
                React.createElement(FormControl, { fullWidth: true, margin: 'dense' }, React.createElement(InputLabel, null, 'Status'), React.createElement(Select, { value: formData.status, label: 'Status', onChange: e=>setFormData({ ...formData, status: e.target.value }) }, React.createElement(MenuItem, { value: 'todo' }, 'To Do'), React.createElement(MenuItem, { value: 'in-progress' }, 'In Progress'), React.createElement(MenuItem, { value: 'in-review' }, 'In Review'), React.createElement(MenuItem, { value: 'completed' }, 'Completed'))),
                React.createElement(TextField, { margin: 'dense', label: 'Assignee', fullWidth: true, value: formData.assignee, onChange: e=>setFormData({ ...formData, assignee: e.target.value }) }),
                React.createElement(TextField, { margin: 'dense', label: 'Description', fullWidth: true, multiline: true, rows: 3, value: formData.description, onChange: e=>setFormData({ ...formData, description: e.target.value }) }),
                React.createElement(TextField, { margin: 'dense', label: 'Due Date', fullWidth: true, type: 'date', value: formData.dueDate, onChange: e=>setFormData({ ...formData, dueDate: e.target.value }), InputLabelProps: { shrink: true } })
            ),
            React.createElement(DialogActions, null,
                React.createElement(Button, { onClick: closeDialog }, 'Cancel'),
                React.createElement(Button, { variant: 'contained', onClick: saveTask }, editing ? 'Update' : 'Create')
            )
        ),
        React.createElement(Snackbar, { open: snackbarOpen, autoHideDuration: 4000, onClose: handleSnackbarClose }, React.createElement(Alert, { onClose: handleSnackbarClose, severity: snackbarSeverity, sx: { width: '100%' } }, snackbarMessage))
    );
}

// Finance Component
function Finance({ apiService }) {
    const [expenses, setExpenses] = React.useState([]);
    const [categoryFilter, setCategoryFilter] = React.useState('');
    const [typeFilter, setTypeFilter] = React.useState('');
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editing, setEditing] = React.useState(null);
    const [formData, setFormData] = React.useState({ description: '', amount: '', category: 'Personal', date: new Date().toISOString().slice(0,10), type: 'expense' });

    React.useEffect(() => { fetchExpenses(); }, []);

    const fetchExpenses = async () => { try { setExpenses(await apiService.loadExpenses()); } catch (e) { showSnackbar('Failed to load expenses','error'); } };
    const showSnackbar = (m,s)=>{ setSnackbarMessage(m); setSnackbarSeverity(s); setSnackbarOpen(true); };
    const handleSnackbarClose = (_,r)=>{ if(r!=='clickaway') setSnackbarOpen(false); };

    const openCreate = () => { setEditing(null); setFormData({ description: '', amount: '', category: 'Personal', date: new Date().toISOString().slice(0,10), type: 'expense' }); setDialogOpen(true); };
    const openEdit = (exp) => { setEditing(exp); setFormData({ description: exp.description||'', amount: String(exp.amount||''), category: exp.category||'Personal', date: (exp.date||'').slice(0,10), type: exp.type||'expense' }); setDialogOpen(true); };
    const closeDialog = () => setDialogOpen(false);
    const saveExpense = async () => {
        const payload = { ...formData, amount: parseFloat(formData.amount||0) };
        try { if (editing) { await apiService.updateExpense(editing.id, payload); showSnackbar('Transaction updated','success'); } else { await apiService.createExpense(payload); showSnackbar('Transaction added','success'); } setDialogOpen(false); fetchExpenses(); }
        catch(e){ showSnackbar('Failed to save','error'); }
    };

    const deleteExpense = async (id) => { if(!window.confirm('Delete this transaction?')) return; try { await apiService.deleteExpense(id); setExpenses(p=>p.filter(x=>x.id!==id)); showSnackbar('Deleted','success'); } catch(e){ showSnackbar('Failed to delete','error'); } };

    const filtered = expenses.filter(t => { const catOk = !categoryFilter || t.category===categoryFilter; const typeOk = !typeFilter || t.type===typeFilter; return catOk && typeOk; }).sort((a,b)=> new Date(b.date)-new Date(a.date));
    const currentMonth = new Date().toISOString().slice(0,7);
    const monthly = filtered.filter(e=> (e.date||'').startsWith(currentMonth));
    const totalIncome = monthly.filter(t=>t.type==='income').reduce((s,t)=> s + parseFloat(t.amount||0), 0);
    const totalExpense = monthly.filter(t=>t.type==='expense').reduce((s,t)=> s + parseFloat(t.amount||0), 0);
    const netBalance = totalIncome - totalExpense;
    const fmtCurrency = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);

    return React.createElement(Container, { maxWidth: 'lg' },
        React.createElement(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 } },
            React.createElement(Typography, { variant: 'h4' }, 'Finance Tracker'),
            React.createElement(Button, { variant: 'contained', startIcon: React.createElement('i', { className: 'material-icons' }, 'add'), onClick: openCreate }, 'Add Transaction')
        ),
        React.createElement(Grid, { container: true, spacing: 3, sx: { mb: 3 } },
            React.createElement(Grid, { item: true, xs: 12, md: 4 }, React.createElement(Card, null, React.createElement(CardContent, null, React.createElement(Typography, { variant: 'h6' }, 'Total Income'), React.createElement(Typography, { variant: 'h4', color: 'success.main' }, fmtCurrency(totalIncome))))),
            React.createElement(Grid, { item: true, xs: 12, md: 4 }, React.createElement(Card, null, React.createElement(CardContent, null, React.createElement(Typography, { variant: 'h6' }, 'Total Expenses'), React.createElement(Typography, { variant: 'h4', color: 'error.main' }, fmtCurrency(totalExpense))))),
            React.createElement(Grid, { item: true, xs: 12, md: 4 }, React.createElement(Card, null, React.createElement(CardContent, null, React.createElement(Typography, { variant: 'h6' }, 'Net Balance'), React.createElement(Typography, { variant: 'h4', color: netBalance>=0?'success.main':'error.main' }, fmtCurrency(netBalance)))))
        ),
        React.createElement(Box, { sx: { display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' } },
            React.createElement(FormControl, { size: 'small', sx: { minWidth: 180 } }, React.createElement(InputLabel, null, 'Category'), React.createElement(Select, { value: categoryFilter, label: 'Category', onChange: e=>setCategoryFilter(e.target.value) }, React.createElement(MenuItem, { value: '' }, 'All Categories'), React.createElement(MenuItem, { value: 'Business' }, 'Business'), React.createElement(MenuItem, { value: 'Personal' }, 'Personal'), React.createElement(MenuItem, { value: 'Food' }, 'Food'), React.createElement(MenuItem, { value: 'Transportation' }, 'Transportation'), React.createElement(MenuItem, { value: 'Income' }, 'Income'))),
            React.createElement(FormControl, { size: 'small', sx: { minWidth: 180 } }, React.createElement(InputLabel, null, 'Type'), React.createElement(Select, { value: typeFilter, label: 'Type', onChange: e=>setTypeFilter(e.target.value) }, React.createElement(MenuItem, { value: '' }, 'All Types'), React.createElement(MenuItem, { value: 'expense' }, 'Expenses'), React.createElement(MenuItem, { value: 'income' }, 'Income')))
        ),
        React.createElement(Paper, { elevation: 1 },
            filtered.length === 0 ?
                React.createElement(Box, { sx: { textAlign: 'center', p: 4 } }, React.createElement('i', { className: 'material-icons', style: { fontSize: 48, opacity: .5, marginBottom: 16 } }, 'receipt'), React.createElement(Typography, { variant: 'h6', sx: { mb: 1 } }, 'No transactions found'), React.createElement(Typography, { variant: 'body2', color: 'text.secondary', sx: { mb: 2 } }, 'Add your first transaction to get started'), React.createElement(Button, { variant: 'contained', startIcon: React.createElement('i', { className: 'material-icons' }, 'add'), onClick: openCreate }, 'Add Transaction'))
            :
                filtered.map(t => React.createElement(Box, { key: t.id, sx: { p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                    React.createElement(Box, null,
                        React.createElement(Typography, { variant: 'subtitle1', sx: { fontWeight: 600 } }, t.description),
                        React.createElement(Box, { sx: { display: 'flex', gap: 2, mt: .5 } }, React.createElement(Typography, { variant: 'body2', color: 'text.secondary' }, t.category||'—'), React.createElement(Typography, { variant: 'body2', color: 'text.secondary' }, new Date(t.date).toLocaleDateString()))
                    ),
                    React.createElement(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 } },
                        React.createElement(Typography, { variant: 'body1', sx: { fontWeight: 700, color: t.type==='income' ? 'success.main' : 'error.main' } }, (t.type==='income'?'+':'-') + fmtCurrency(Math.abs(parseFloat(t.amount||0)))),
                        React.createElement(IconButton, { size: 'small', title: 'Edit', onClick: ()=>openEdit(t) }, React.createElement('i', { className: 'material-icons' }, 'edit')),
                        React.createElement(IconButton, { size: 'small', title: 'Delete', color: 'error', onClick: ()=>deleteExpense(t.id) }, React.createElement('i', { className: 'material-icons' }, 'delete'))
                    )
                ))
        ),
        React.createElement(Dialog, { open: dialogOpen, onClose: closeDialog, maxWidth: 'sm', fullWidth: true },
            React.createElement(DialogTitle, null, editing ? 'Edit Transaction' : 'Add Transaction'),
            React.createElement(DialogContent, null,
                React.createElement(TextField, { autoFocus: true, margin: 'dense', label: 'Description', fullWidth: true, value: formData.description, onChange: e=>setFormData({ ...formData, description: e.target.value }) }),
                React.createElement(TextField, { margin: 'dense', label: 'Amount', fullWidth: true, type: 'number', step: '0.01', value: formData.amount, onChange: e=>setFormData({ ...formData, amount: e.target.value }) }),
                React.createElement(FormControl, { fullWidth: true, margin: 'dense' }, React.createElement(InputLabel, null, 'Category'), React.createElement(Select, { value: formData.category, label: 'Category', onChange: e=>setFormData({ ...formData, category: e.target.value }) }, React.createElement(MenuItem, { value: 'Business' }, 'Business'), React.createElement(MenuItem, { value: 'Personal' }, 'Personal'), React.createElement(MenuItem, { value: 'Food' }, 'Food'), React.createElement(MenuItem, { value: 'Transportation' }, 'Transportation'))),
                React.createElement(TextField, { margin: 'dense', label: 'Date', fullWidth: true, type: 'date', value: formData.date, onChange: e=>setFormData({ ...formData, date: e.target.value }), InputLabelProps: { shrink: true } }),
                React.createElement(FormControl, { fullWidth: true, margin: 'dense' }, React.createElement(InputLabel, null, 'Type'), React.createElement(Select, { value: formData.type, label: 'Type', onChange: e=>setFormData({ ...formData, type: e.target.value }) }, React.createElement(MenuItem, { value: 'expense' }, 'Expense'), React.createElement(MenuItem, { value: 'income' }, 'Income')))
            ),
            React.createElement(DialogActions, null, React.createElement(Button, { onClick: closeDialog }, 'Cancel'), React.createElement(Button, { variant: 'contained', onClick: saveExpense }, editing ? 'Update' : 'Add'))
        ),
        React.createElement(Snackbar, { open: snackbarOpen, autoHideDuration: 4000, onClose: handleSnackbarClose }, React.createElement(Alert, { onClose: handleSnackbarClose, severity: snackbarSeverity, sx: { width: '100%' } }, snackbarMessage))
    );
}

// Make components available globally
window.Links = Links;
window.Finance = Finance;
window.Notes = Notes;
window.Projects = Projects;

console.log('Components bundle loaded successfully!');
console.log('Available components:', {
    Links: !!window.Links,
    Finance: !!window.Finance,
    Notes: !!window.Notes,
    Projects: !!window.Projects
});
