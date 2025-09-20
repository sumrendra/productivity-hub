// Modal Components for Material-UI
const {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Box,
    Typography
} = MaterialUI;

// Note Modal Component
function NoteModal({ open, onClose, note = null, onSave }) {
    const [formData, setFormData] = React.useState({
        title: '',
        category: 'Personal',
        tags: '',
        content: ''
    });

    React.useEffect(() => {
        if (note) {
            setFormData({
                title: note.title || '',
                category: note.category || 'Personal',
                tags: (note.tags || []).join(', '),
                content: note.content || ''
            });
        } else {
            setFormData({
                title: '',
                category: 'Personal',
                tags: '',
                content: ''
            });
        }
    }, [note, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        await onSave({ ...formData, tags });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{note ? 'Edit Note' : 'Create New Note'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        fullWidth
                        variant="outlined"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={formData.category}
                            label="Category"
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                            <MenuItem value="Work">Work</MenuItem>
                            <MenuItem value="Personal">Personal</MenuItem>
                            <MenuItem value="Development">Development</MenuItem>
                            <MenuItem value="Ideas">Ideas</MenuItem>
                            <MenuItem value="Meeting">Meeting</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        margin="dense"
                        label="Tags (comma-separated)"
                        fullWidth
                        variant="outlined"
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        placeholder="work, important, urgent"
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        margin="dense"
                        label="Content"
                        fullWidth
                        multiline
                        rows={8}
                        variant="outlined"
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        placeholder="Start writing your note..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained">Save Note</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

// Link Modal Component
function LinkModal({ open, onClose, link = null, onSave }) {
    const [formData, setFormData] = React.useState({
        url: '',
        title: '',
        description: '',
        category: 'Development',
        tags: ''
    });

    React.useEffect(() => {
        if (link) {
            setFormData({
                url: link.url || '',
                title: link.title || '',
                description: link.description || '',
                category: link.category || 'Development',
                tags: (link.tags || []).join(', ')
            });
        } else {
            setFormData({
                url: '',
                title: '',
                description: '',
                category: 'Development',
                tags: ''
            });
        }
    }, [link, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        await onSave({ ...formData, tags });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{link ? 'Edit Link' : 'Add New Link'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="URL"
                        type="url"
                        fullWidth
                        variant="outlined"
                        value={formData.url}
                        onChange={(e) => setFormData({...formData, url: e.target.value})}
                        sx={{ mb: 2 }}
                        required
                    />

                    <TextField
                        margin="dense"
                        label="Title"
                        fullWidth
                        variant="outlined"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        sx={{ mb: 2 }}
                        required
                    />

                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={formData.category}
                            label="Category"
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                            <MenuItem value="Development">Development</MenuItem>
                            <MenuItem value="Design">Design</MenuItem>
                            <MenuItem value="Business">Business</MenuItem>
                            <MenuItem value="Personal">Personal</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        margin="dense"
                        label="Tags (comma-separated)"
                        fullWidth
                        variant="outlined"
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained">Save Link</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

// Task Modal Component
function TaskModal({ open, onClose, task = null, onSave }) {
    const [formData, setFormData] = React.useState({
        title: '',
        description: '',
        assignee: '',
        dueDate: '',
        status: 'todo'
    });

    React.useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                assignee: task.assignee || '',
                dueDate: task.dueDate || '',
                status: task.status || 'todo'
            });
        } else {
            setFormData({
                title: '',
                description: '',
                assignee: '',
                dueDate: '',
                status: 'todo'
            });
        }
    }, [task, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave(formData);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Task Title"
                        fullWidth
                        variant="outlined"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        sx={{ mb: 2 }}
                        required
                    />

                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                        <InputLabel>Assignee</InputLabel>
                        <Select
                            value={formData.assignee}
                            label="Assignee"
                            onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                        >
                            <MenuItem value="John">John</MenuItem>
                            <MenuItem value="Sarah">Sarah</MenuItem>
                            <MenuItem value="Mike">Mike</MenuItem>
                            <MenuItem value="Alex">Alex</MenuItem>
                            <MenuItem value="Emma">Emma</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        margin="dense"
                        label="Due Date"
                        type="date"
                        fullWidth
                        variant="outlined"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                    />

                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={formData.status}
                            label="Status"
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                            <MenuItem value="todo">To Do</MenuItem>
                            <MenuItem value="in-progress">In Progress</MenuItem>
                            <MenuItem value="in-review">In Review</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained">Save Task</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

// Expense Modal Component
function ExpenseModal({ open, onClose, expense = null, onSave }) {
    const [formData, setFormData] = React.useState({
        description: '',
        amount: '',
        category: 'Personal',
        type: 'expense',
        date: new Date().toISOString().split('T')[0]
    });

    React.useEffect(() => {
        if (expense) {
            setFormData({
                description: expense.description || '',
                amount: expense.amount || '',
                category: expense.category || 'Personal',
                type: expense.type || 'expense',
                date: expense.date || new Date().toISOString().split('T')[0]
            });
        } else {
            setFormData({
                description: '',
                amount: '',
                category: 'Personal',
                type: 'expense',
                date: new Date().toISOString().split('T')[0]
            });
        }
    }, [expense, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave({ ...formData, amount: parseFloat(formData.amount) });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{expense ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Description"
                        fullWidth
                        variant="outlined"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        sx={{ mb: 2 }}
                        required
                    />

                    <TextField
                        margin="dense"
                        label="Amount"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        sx={{ mb: 2 }}
                        inputProps={{ step: 0.01 }}
                        required
                    />

                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={formData.category}
                            label="Category"
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                            <MenuItem value="Business">Business</MenuItem>
                            <MenuItem value="Personal">Personal</MenuItem>
                            <MenuItem value="Food">Food</MenuItem>
                            <MenuItem value="Transportation">Transportation</MenuItem>
                            <MenuItem value="Income">Income</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={formData.type}
                            label="Type"
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                        >
                            <MenuItem value="expense">Expense</MenuItem>
                            <MenuItem value="income">Income</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        margin="dense"
                        label="Date"
                        type="date"
                        fullWidth
                        variant="outlined"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained">Save Transaction</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

// Confirmation Dialog Component
function ConfirmDialog({ open, onClose, message, onConfirm }) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm">
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogContent>
                <Typography>{message}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleConfirm} variant="contained" color="error">Confirm</Button>
            </DialogActions>
        </Dialog>
    );
}

// Toast Component
function ToastNotification({ open, message, severity, onClose }) {
    return (
        <Snackbar
            open={open}
            autoHideDuration={5000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );
}

window.NoteModal = NoteModal;
window.LinkModal = LinkModal;
window.TaskModal = TaskModal;
window.ExpenseModal = ExpenseModal;
window.ConfirmDialog = ConfirmDialog;
window.ToastNotification = ToastNotification;
