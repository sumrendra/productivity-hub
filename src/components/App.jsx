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
    ThemeProvider,
    createTheme,
    CssBaseline
} = MaterialUI;

const theme = createTheme({
    palette: {
        primary: {
            main: '#2196f3',
        },
        secondary: {
            main: '#f50057',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
});

// API Service Class
class ApiService {
    constructor() {
        this.baseUrl = window.location.origin + '/api';
        this.notes = [];
        this.links = [];
        this.tasks = [];
        this.expenses = [];
    }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Notes API
    async loadNotes() {
        try {
            this.notes = await this.request('/notes');
            this.notes = this.notes.map(note => ({
                ...note,
                createdAt: note.created_at
            }));
            return this.notes;
        } catch (error) {
            console.error('Error loading notes:', error);
            return [];
        }
    }

    async createNote(noteData) {
        try {
            const newNote = await this.request('/notes', {
                method: 'POST',
                body: JSON.stringify(noteData)
            });
            newNote.createdAt = newNote.created_at;
            this.notes.unshift(newNote);
            return newNote;
        } catch (error) {
            console.error('Error creating note:', error);
            throw error;
        }
    }

    async updateNote(id, noteData) {
        try {
            const updatedNote = await this.request(`/notes/${id}`, {
                method: 'PUT',
                body: JSON.stringify(noteData)
            });
            updatedNote.createdAt = updatedNote.created_at;
            const index = this.notes.findIndex(note => note.id === id);
            if (index !== -1) {
                this.notes[index] = updatedNote;
            }
            return updatedNote;
        } catch (error) {
            console.error('Error updating note:', error);
            throw error;
        }
    }

    async deleteNote(id) {
        try {
            await this.request(`/notes/${id}`, { method: 'DELETE' });
            this.notes = this.notes.filter(note => note.id !== id);
        } catch (error) {
            console.error('Error deleting note:', error);
            throw error;
        }
    }

    // Links API
    async loadLinks() {
        try {
            this.links = await this.request('/links');
            return this.links;
        } catch (error) {
            console.error('Error loading links:', error);
            return [];
        }
    }

    async createLink(linkData) {
        try {
            const newLink = await this.request('/links', {
                method: 'POST',
                body: JSON.stringify(linkData)
            });
            this.links.unshift(newLink);
            return newLink;
        } catch (error) {
            console.error('Error creating link:', error);
            throw error;
        }
    }

    async updateLink(id, linkData) {
        try {
            const updatedLink = await this.request(`/links/${id}`, {
                method: 'PUT',
                body: JSON.stringify(linkData)
            });
            const index = this.links.findIndex(link => link.id === id);
            if (index !== -1) {
                this.links[index] = updatedLink;
            }
            return updatedLink;
        } catch (error) {
            console.error('Error updating link:', error);
            throw error;
        }
    }

    async deleteLink(id) {
        try {
            await this.request(`/links/${id}`, { method: 'DELETE' });
            this.links = this.links.filter(link => link.id !== id);
        } catch (error) {
            console.error('Error deleting link:', error);
            throw error;
        }
    }

    // Tasks API
    async loadTasks() {
        try {
            this.tasks = await this.request('/tasks');
            this.tasks = this.tasks.map(task => ({
                ...task,
                dueDate: task.due_date
            }));
            return this.tasks;
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    async createTask(taskData) {
        try {
            const newTask = await this.request('/tasks', {
                method: 'POST',
                body: JSON.stringify({
                    ...taskData,
                    due_date: taskData.dueDate
                })
            });
            newTask.dueDate = newTask.due_date;
            this.tasks.push(newTask);
            return newTask;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    }

    async updateTask(id, taskData) {
        try {
            const updatedTask = await this.request(`/tasks/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...taskData,
                    due_date: taskData.dueDate
                })
            });
            updatedTask.dueDate = updatedTask.due_date;
            const index = this.tasks.findIndex(task => task.id === id);
            if (index !== -1) {
                this.tasks[index] = updatedTask;
            }
            return updatedTask;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }

    async deleteTask(id) {
        try {
            await this.request(`/tasks/${id}`, { method: 'DELETE' });
            this.tasks = this.tasks.filter(task => task.id !== id);
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }

    // Expenses API
    async loadExpenses() {
        try {
            this.expenses = await this.request('/expenses');
            return this.expenses;
        } catch (error) {
            console.error('Error loading expenses:', error);
            return [];
        }
    }

    async createExpense(expenseData) {
        try {
            const newExpense = await this.request('/expenses', {
                method: 'POST',
                body: JSON.stringify(expenseData)
            });
            this.expenses.unshift(newExpense);
            return newExpense;
        } catch (error) {
            console.error('Error creating expense:', error);
            throw error;
        }
    }

    async updateExpense(id, expenseData) {
        try {
            const updatedExpense = await this.request(`/expenses/${id}`, {
                method: 'PUT',
                body: JSON.stringify(expenseData)
            });
            const index = this.expenses.findIndex(expense => expense.id === id);
            if (index !== -1) {
                this.expenses[index] = updatedExpense;
            }
            return updatedExpense;
        } catch (error) {
            console.error('Error updating expense:', error);
            throw error;
        }
    }

    async deleteExpense(id) {
        try {
            await this.request(`/expenses/${id}`, { method: 'DELETE' });
            this.expenses = this.expenses.filter(expense => expense.id !== id);
        } catch (error) {
            console.error('Error deleting expense:', error);
            throw error;
        }
    }

    async loadAllData() {
        try {
            await Promise.all([
                this.loadNotes(),
                this.loadLinks(),
                this.loadTasks(),
                this.loadExpenses()
            ]);
        } catch (error) {
            console.error('Error loading all data:', error);
        }
    }
}

// Simple Dashboard Component
function Dashboard({ apiService }) {
    const [stats, setStats] = React.useState({
        totalNotes: 0,
        totalLinks: 0,
        activeTasks: 0,
        monthlyBalance: 0
    });

    React.useEffect(() => {
        if (apiService) {
            updateStats();
        }
    }, [apiService]);

    const updateStats = () => {
        const notesCount = apiService.notes ? apiService.notes.length : 0;
        const linksCount = apiService.links ? apiService.links.length : 0;
        const tasksCount = apiService.tasks ? apiService.tasks.filter(t => t.status !== 'completed').length : 0;
        
        const currentMonth = new Date().toISOString().substring(0, 7);
        const monthlyExpenses = apiService.expenses ? apiService.expenses.filter(expense => 
            expense.date && expense.date.startsWith(currentMonth)
        ) : [];
        
        const income = monthlyExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + parseFloat(e.amount), 0);
        const expenses = monthlyExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + parseFloat(e.amount), 0);
        const balance = income - expenses;

        setStats({
            totalNotes: notesCount,
            totalLinks: linksCount,
            activeTasks: tasksCount,
            monthlyBalance: balance
        });
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Dashboard</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6">Notes</Typography>
                    <Typography variant="h3">{stats.totalNotes}</Typography>
                </Paper>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6">Links</Typography>
                    <Typography variant="h3">{stats.totalLinks}</Typography>
                </Paper>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6">Active Tasks</Typography>
                    <Typography variant="h3">{stats.activeTasks}</Typography>
                </Paper>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6">Monthly Balance</Typography>
                    <Typography variant="h3" color={stats.monthlyBalance >= 0 ? 'success.main' : 'error.main'}>
                        ${stats.monthlyBalance.toFixed(2)}
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
}

// Placeholder components for sections that need to be loaded
function Notes({ apiService }) {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Notes</Typography>
            <Typography>Notes component will be loaded here...</Typography>
        </Container>
    );
}

function Links({ apiService }) {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Links</Typography>
            <Typography>Links component will be loaded here...</Typography>
        </Container>
    );
}

function Projects({ apiService }) {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Projects</Typography>
            <Typography>Projects component will be loaded here...</Typography>
        </Container>
    );
}

function Finance({ apiService }) {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Finance</Typography>
            <Typography>Finance component will be loaded here...</Typography>
        </Container>
    );
}

// Main App Component
function App() {
    const [currentView, setCurrentView] = React.useState('dashboard');
    const [apiService] = React.useState(() => new ApiService());
    const [isLoading, setIsLoading] = React.useState(true);
    const [componentsLoaded, setComponentsLoaded] = React.useState(false);

    React.useEffect(() => {
        const initializeApp = async () => {
            try {
                await apiService.loadAllData();
                setIsLoading(false);
            } catch (error) {
                console.error('Error initializing app:', error);
                setIsLoading(false);
            }
        };

        initializeApp();
    }, [apiService]);

    // Dynamically load components bundle that contains full implementations
    React.useEffect(() => {
        if (window.ComponentsBundleLoaded) return; // avoid double-load
        const script = document.createElement('script');
        script.src = '/src/components/components-bundle.js';
        script.async = true;
        script.onload = () => {
            window.ComponentsBundleLoaded = true;
            console.log('components-bundle.js loaded');
            setComponentsLoaded(true);
        };
        script.onerror = (e) => {
            console.error('Failed to load components-bundle.js', e);
        };
        document.body.appendChild(script);
        return () => {
            // keep the bundle loaded across navigation; don't remove
        };
    }, []);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'notes', label: 'Notes', icon: 'note' },
        { id: 'links', label: 'Links', icon: 'link' },
        { id: 'projects', label: 'Projects', icon: 'assignment' },
        { id: 'finance', label: 'Finance', icon: 'attach_money' },
    ];

    const renderCurrentView = () => {
        if (isLoading) {
            return (
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
                    <Typography variant="h5">Loading...</Typography>
                </Container>
            );
        }

        // If we loaded the bundle, prefer those implementations
        const hasBundle = componentsLoaded && !!window && !!window.Links;

        switch (currentView) {
            case 'dashboard':
                return <Dashboard apiService={apiService} />;
            case 'notes':
                return hasBundle && window.Notes ? React.createElement(window.Notes, { apiService }) : <Notes apiService={apiService} />;
            case 'links':
                return hasBundle && window.Links ? React.createElement(window.Links, { apiService }) : <Links apiService={apiService} />;
            case 'projects':
                return hasBundle && window.Projects ? React.createElement(window.Projects, { apiService }) : <Projects apiService={apiService} />;
            case 'finance':
                return hasBundle && window.Finance ? React.createElement(window.Finance, { apiService }) : <Finance apiService={apiService} />;
            default:
                return <Dashboard apiService={apiService} />;
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                {/* Sidebar */}
                <Drawer
                    variant="permanent"
                    sx={{
                        width: 240,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: 240,
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    <Toolbar>
                        <Typography variant="h6" noWrap component="div">
                            ProductivePro
                        </Typography>
                    </Toolbar>
                    <Divider />
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.id} disablePadding>
                                <ListItemButton
                                    selected={currentView === item.id}
                                    onClick={() => setCurrentView(item.id)}
                                >
                                    <ListItemIcon>
                                        <i className="material-icons">{item.icon}</i>
                                    </ListItemIcon>
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Drawer>

                {/* Main content */}
                <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
                    <AppBar position="sticky">
                        <Toolbar>
                            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                                {menuItems.find(item => item.id === currentView)?.label || 'Dashboard'}
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    {renderCurrentView()}
                </Box>
            </Box>
        </ThemeProvider>
    );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(React.createElement(App));
