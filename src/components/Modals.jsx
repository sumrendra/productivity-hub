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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained">
                        {note ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

// Link Modal Component
function LinkModal({ open, onClose, link = null, onSave }) {
    const [formData, setFormData] = React.useState({
        title: '',
        url: '',
        category: 'Personal',
        description: '',
        tags: ''
    });

    React.useEffect(() => {
        if (link) {
            setFormData({
                title: link.title || '',
                url: link.url || '',
                category: link.category || 'Personal',
                description: link.description || '',
                tags: (link.tags || []).join(', ')
            });
        } else {
            setFormData({
                title: '',
                url: '',
                category: 'Personal',
                description: '',
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
            <DialogTitle>{link ? 'Edit Link' : 'Create New Link'}</DialogTitle>
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
                        required
                    />

                    <TextField
                        margin="dense"
                        label="URL"
                        fullWidth
                        variant="outlined"
                        value={formData.url}
                        onChange={(e) => setFormData({...formData, url: e.target.value})}
                        sx={{ mb: 2 }}
                        required
                        type="url"
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
                            <MenuItem value="Learning">Learning</MenuItem>
                        </Select>
                    </FormControl>

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

                    <TextField
                        margin="dense"
                        label="Tags (comma-separated)"
                        fullWidth
                        variant="outlined"
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        placeholder="react, javascript, tutorial"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained">
                        {link ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

// Task Modal Component
function TaskModal({ open, onClose, task = null, onSave }) {
    const [formData, setFormData] = React.useState({
        title: '',
        status: 'todo',
        assignee: '',
        description: '',
        dueDate: ''
    });

    React.useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                status: task.status || 'todo',
                assignee: task.assignee || '',
                description: task.description || '',
                dueDate: task.dueDate || task.due_date || ''
            });
        } else {
            setFormData({
                title: '',
                status: 'todo',
                assignee: '',
                description: '',
                dueDate: ''
            });
        }
    }, [task, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave(formData);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
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
                        required
                    />

                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
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

                    <TextField
                        margin="dense"
                        label="Assignee"
                        fullWidth
                        variant="outlined"
                        value={formData.assignee}
                        onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        margin="dense"
                        label="Due Date"
                        fullWidth
                        variant="outlined"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained">
                        {task ? 'Update' : 'Create'}
                    </Button>
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
        date: new Date().toISOString().split('T')[0],
        type: 'expense'
    });

    React.useEffect(() => {
        if (expense) {
            setFormData({
                description: expense.description || '',
                amount: expense.amount || '',
                category: expense.category || 'Personal',
                date: expense.date || new Date().toISOString().split('T')[0],
                type: expense.type || 'expense'
            });
        } else {
            setFormData({
                description: '',
                amount: '',
                category: 'Personal',
                date: new Date().toISOString().split('T')[0],
                type: 'expense'
            });
        }
    }, [expense, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const expenseData = {
            ...formData,
            amount: parseFloat(formData.amount)
        };
        await onSave(expenseData);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{expense ? 'Edit Expense' : 'Create New Expense'}</DialogTitle>
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
                        fullWidth
                        variant="outlined"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        sx={{ mb: 2 }}
                        required
                        InputProps={{
                            startAdornment: <span style={{ marginRight: '8px' }}>$</span>
                        }}
                    />

                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={formData.category}
                            label="Category"
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                            <MenuItem value="Food">Food</MenuItem>
                            <MenuItem value="Transportation">Transportation</MenuItem>
                            <MenuItem value="Entertainment">Entertainment</MenuItem>
                            <MenuItem value="Health">Health</MenuItem>
                            <MenuItem value="Shopping">Shopping</MenuItem>
                            <MenuItem value="Bills">Bills</MenuItem>
                            <MenuItem value="Personal">Personal</MenuItem>
                            <MenuItem value="Business">Business</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        margin="dense"
                        label="Date"
                        fullWidth
                        variant="outlined"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        sx={{ mb: 2 }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />

                    <FormControl fullWidth variant="outlined">
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained">
                        {expense ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

// Export all modals as a single object
const Modals = {
    NoteModal,
    LinkModal,
    TaskModal,
    ExpenseModal
};

// For backwards compatibility with existing code
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Modals;
} else if (typeof window !== 'undefined') {
    window.Modals = Modals;
}
