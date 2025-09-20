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

// Main App Component
function App() {
    const [currentPage, setCurrentPage] = React.useState('dashboard');
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [apiService] = React.useState(() => new ApiService());
    const [dashboardModule] = React.useState(() => new DashboardModule(apiService));
    const [notesModule] = React.useState(() => new NotesModule(apiService));
    const [linksModule] = React.useState(() => new LinksModule(apiService));
    const [projectsModule] = React.useState(() => new ProjectsModule(apiService));
    const [financeModule] = React.useState(() => new FinanceModule(apiService));

    React.useEffect(() => {
        // Initialize data
        apiService.loadAllData().then(() => {
            // Set global references for backwards compatibility
            window.apiService = apiService;
            window.DashboardModule = dashboardModule;
            window.NotesModule = notesModule;
            window.LinksModule = linksModule;
            window.ProjectsModule = projectsModule;
            window.FinanceModule = financeModule;

            // Initialize current page
            handlePageChange(currentPage);
        });
    }, []);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setMobileOpen(false);

        // Initialize page module
        switch (page) {
            case 'dashboard':
                dashboardModule.init();
                break;
            case 'notes':
                notesModule.init();
                break;
            case 'links':
                linksModule.init();
                break;
            case 'projects':
                projectsModule.init();
                break;
            case 'finance':
                financeModule.init();
                break;
        }
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'notes', label: 'Notes', icon: 'note' },
        { id: 'links', label: 'Links', icon: 'link' },
        { id: 'projects', label: 'Projects', icon: 'assignment' },
        { id: 'finance', label: 'Finance', icon: 'account_balance_wallet' },
    ];

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    <i className="fas fa-rocket" style={{ marginRight: '8px' }}></i>
                    ProductivePro
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.id} disablePadding>
                        <ListItemButton
                            selected={currentPage === item.id}
                            onClick={() => handlePageChange(item.id)}
                        >
                            <ListItemIcon>
                                <i className="material-icons">{item.icon}</i>
                            </ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex' }}>
                <AppBar
                    position="fixed"
                    sx={{
                        width: { sm: `calc(100% - 240px)` },
                        ml: { sm: `240px` },
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { sm: 'none' } }}
                        >
                            <i className="material-icons">menu</i>
                        </IconButton>
                        <Typography variant="h6" noWrap component="div">
                            {menuItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Box
                    component="nav"
                    sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}
                >
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true,
                        }}
                        sx={{
                            display: { xs: 'block', sm: 'none' },
                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                        }}
                    >
                        {drawer}
                    </Drawer>
                    <Drawer
                        variant="permanent"
                        sx={{
                            display: { xs: 'none', sm: 'block' },
                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                        }}
                        open
                    >
                        {drawer}
                    </Drawer>
                </Box>

                <Box
                    component="main"
                    sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - 240px)` } }}
                >
                    <Toolbar />
                    <PageContent currentPage={currentPage} />
                </Box>
            </Box>
        </ThemeProvider>
    );
}

// Page Content Component
function PageContent({ currentPage }) {
    switch (currentPage) {
        case 'dashboard':
            return <DashboardPage />;
        case 'notes':
            return <NotesPage />;
        case 'links':
            return <LinksPage />;
        case 'projects':
            return <ProjectsPage />;
        case 'finance':
            return <FinancePage />;
        default:
            return <DashboardPage />;
    }
}

// Dashboard Page Component
function DashboardPage() {
    const [stats, setStats] = React.useState({
        totalNotes: 0,
        totalLinks: 0,
        activeTasks: 0,
        monthlyBalance: 0
    });

    React.useEffect(() => {
        if (window.apiService) {
            setStats({
                totalNotes: window.apiService.notes.length,
                totalLinks: window.apiService.links.length,
                activeTasks: window.apiService.tasks.filter(task => task.status !== 'completed').length,
                monthlyBalance: calculateMonthlyBalance()
            });
        }
    }, []);

    const calculateMonthlyBalance = () => {
        if (!window.apiService) return 0;
        const currentMonth = new Date().toISOString().substring(0, 7);
        const monthlyTransactions = window.apiService.expenses.filter(expense =>
            expense.date.startsWith(currentMonth));
        const income = monthlyTransactions.filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const expenses = monthlyTransactions.filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        return income - expenses;
    };

    const statCards = [
        { title: 'Total Notes', value: stats.totalNotes, icon: 'note', color: 'primary' },
        { title: 'Saved Links', value: stats.totalLinks, icon: 'link', color: 'secondary' },
        { title: 'Active Tasks', value: stats.activeTasks, icon: 'assignment', color: 'success' },
        { title: 'Monthly Balance', value: `$${stats.monthlyBalance.toFixed(2)}`, icon: 'account_balance_wallet', color: 'info' }
    ];

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" sx={{ mb: 4 }}>
                Welcome back! Here's your productivity overview.
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {statCards.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Box
                                        sx={{
                                            bgcolor: `${stat.color}.light`,
                                            color: `${stat.color}.main`,
                                            borderRadius: 1,
                                            p: 1,
                                            mr: 2
                                        }}
                                    >
                                        <i className="material-icons">{stat.icon}</i>
                                    </Box>
                                    <Typography variant="h4" component="div">
                                        {stat.value}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    {stat.title}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<i className="material-icons">add</i>}
                                    onClick={() => showCreateNote()}
                                >
                                    New Note
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<i className="material-icons">add</i>}
                                    onClick={() => showCreateLink()}
                                >
                                    Add Link
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<i className="material-icons">add</i>}
                                    onClick={() => showCreateTask()}
                                >
                                    New Task
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<i className="material-icons">add</i>}
                                    onClick={() => showCreateExpense()}
                                >
                                    Log Expense
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
                        <div id="activity-feed"></div>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

// Notes Page Component
function NotesPage() {
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
                            onClick={() => createNewNote()}
                        >
                            New Note
                        </Button>
                    </Box>

                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search notes..."
                        id="notes-search-input"
                        InputProps={{
                            startAdornment: <i className="material-icons" style={{ marginRight: '8px' }}>search</i>
                        }}
                        sx={{ mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <FormControl size="small" sx={{ flex: 1 }}>
                            <InputLabel>Category</InputLabel>
                            <Select id="notes-category-select" label="Category" defaultValue="">
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
                            <Select id="notes-sort-select" label="Sort" defaultValue="newest">
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
                    <div id="notes-list" className="notes-list"></div>
                    <Box id="notes-empty-state" className="notes-empty-state" sx={{ textAlign: 'center', p: 4 }}>
                        <i className="material-icons" style={{ fontSize: '48px', opacity: 0.5, marginBottom: '16px' }}>note</i>
                        <Typography variant="h6" sx={{ mb: 1 }}>No notes yet</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Create your first note to get started
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<i className="material-icons">add</i>}
                            onClick={() => createNewNote()}
                        >
                            Create Note
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Notes Editor */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Paper id="notes-welcome-screen" elevation={0} sx={{
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
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<i className="material-icons">add</i>}
                            onClick={() => createNewNote()}
                        >
                            Create Your First Note
                        </Button>
                    </Box>
                </Paper>

                <Paper id="notes-editor" className="notes-editor hidden" elevation={0} sx={{
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
                                    sx={{
                                        fontSize: '1.5rem',
                                        fontWeight: 600,
                                        mb: 1
                                    }}
                                    InputProps={{ style: { fontSize: '1.5rem', fontWeight: 600 } }}
                                />
                                <Box sx={{ display: 'flex', gap: 2, fontSize: '0.75rem', color: 'text.secondary' }}>
                                    <span id="note-created-date"></span>
                                    <span id="note-word-count">0 words</span>
                                    <span id="note-save-status">
                                        <i className="material-icons" style={{ fontSize: '14px' }}>check</i> Saved
                                    </span>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel>Category</InputLabel>
                                    <Select id="note-category-select" label="Category" defaultValue="Personal">
                                        <MenuItem value="Work">Work</MenuItem>
                                        <MenuItem value="Personal">Personal</MenuItem>
                                        <MenuItem value="Development">Development</MenuItem>
                                        <MenuItem value="Ideas">Ideas</MenuItem>
                                        <MenuItem value="Meeting">Meeting</MenuItem>
                                    </Select>
                                </FormControl>

                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <IconButton size="small" onClick={() => saveCurrentNoteManually()} title="Save Note">
                                        <i className="material-icons">save</i>
                                    </IconButton>
                                    <IconButton size="small" onClick={() => toggleFullscreen()} title="Fullscreen">
                                        <i className="material-icons">fullscreen</i>
                                    </IconButton>
                                    <IconButton size="small" onClick={() => exportNote()} title="Export">
                                        <i className="material-icons">download</i>
                                    </IconButton>
                                    <IconButton size="small" onClick={() => duplicateNote()} title="Duplicate">
                                        <i className="material-icons">content_copy</i>
                                    </IconButton>
                                    <IconButton size="small" onClick={() => deleteCurrentNote()} title="Delete" color="error">
                                        <i className="material-icons">delete</i>
                                    </IconButton>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {/* Rich Text Editor Toolbar */}
                    <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0', display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <IconButton size="small" onClick={() => formatDocument('undo')} title="Undo">
                            <i className="material-icons">undo</i>
                        </IconButton>
                        <IconButton size="small" onClick={() => formatDocument('redo')} title="Redo">
                            <i className="material-icons">redo</i>
                        </IconButton>

                        <Divider orientation="vertical" flexItem />

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select defaultValue="" onChange={(e) => formatDocument('formatBlock', e.target.value)}>
                                <MenuItem value="">Paragraph</MenuItem>
                                <MenuItem value="h1">Heading 1</MenuItem>
                                <MenuItem value="h2">Heading 2</MenuItem>
                                <MenuItem value="h3">Heading 3</MenuItem>
                                <MenuItem value="h4">Heading 4</MenuItem>
                                <MenuItem value="pre">Code Block</MenuItem>
                                <MenuItem value="blockquote">Quote</MenuItem>
                            </Select>
                        </FormControl>

                        <Divider orientation="vertical" flexItem />

                        <IconButton size="small" onClick={() => formatDocument('bold')} title="Bold">
                            <i className="material-icons">format_bold</i>
                        </IconButton>
                        <IconButton size="small" onClick={() => formatDocument('italic')} title="Italic">
                            <i className="material-icons">format_italic</i>
                        </IconButton>
                        <IconButton size="small" onClick={() => formatDocument('underline')} title="Underline">
                            <i className="material-icons">format_underlined</i>
                        </IconButton>

                        <Divider orientation="vertical" flexItem />

                        <IconButton size="small" onClick={() => formatDocument('insertOrderedList')} title="Numbered List">
                            <i className="material-icons">format_list_numbered</i>
                        </IconButton>
                        <IconButton size="small" onClick={() => formatDocument('insertUnorderedList')} title="Bullet List">
                            <i className="material-icons">format_list_bulleted</i>
                        </IconButton>

                        <Divider orientation="vertical" flexItem />

                        <IconButton size="small" onClick={() => insertLink()} title="Insert Link">
                            <i className="material-icons">link</i>
                        </IconButton>
                        <IconButton size="small" onClick={() => insertImage()} title="Insert Image">
                            <i className="material-icons">image</i>
                        </IconButton>
                        <IconButton size="small" onClick={() => insertTable()} title="Insert Table">
                            <i className="material-icons">table_chart</i>
                        </IconButton>
                        <IconButton size="small" onClick={() => insertCodeBlock()} title="Code Block">
                            <i className="material-icons">code</i>
                        </IconButton>
                    </Box>

                    {/* Editor Content */}
                    <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
                        <div
                            id="note-content-editor"
                            className="note-content-editor"
                            contentEditable="true"
                            spellCheck="true"
                            style={{
                                minHeight: '500px',
                                border: 'none',
                                outline: 'none',
                                fontSize: '1rem',
                                lineHeight: 1.6,
                                fontFamily: 'Roboto, Arial, sans-serif'
                            }}
                        ></div>
                    </Box>

                    {/* Tags Section */}
                    <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <i className="material-icons" style={{ fontSize: '18px', marginRight: '8px' }}>local_offer</i>
                            <Typography variant="body2">Tags:</Typography>
                        </Box>
                        <Box id="note-tags-container" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                            <TextField
                                id="tag-input"
                                placeholder="Add a tag..."
                                variant="standard"
                                size="small"
                                onKeyDown={(e) => handleTagInput(e)}
                                sx={{ minWidth: 150 }}
                            />
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}

// Links Page Component
function LinksPage() {
    return (
        <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Links Directory</Typography>
                <Button
                    variant="contained"
                    startIcon={<i className="material-icons">add</i>}
                    onClick={() => showCreateLink()}
                >
                    Add Link
                </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    id="links-search"
                    placeholder="Search links..."
                    size="small"
                    sx={{ flex: 1, minWidth: 250 }}
                    InputProps={{
                        startAdornment: <i className="material-icons" style={{ marginRight: '8px' }}>search</i>
                    }}
                />
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Category</InputLabel>
                    <Select id="links-category-filter" label="Category" defaultValue="">
                        <MenuItem value="">All Categories</MenuItem>
                        <MenuItem value="Development">Development</MenuItem>
                        <MenuItem value="Design">Design</MenuItem>
                        <MenuItem value="Business">Business</MenuItem>
                        <MenuItem value="Personal">Personal</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <div id="links-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                {/* Links will be populated by JavaScript */}
            </div>
        </Container>
    );
}

// Projects Page Component
function ProjectsPage() {
    return (
        <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Project Board</Typography>
                <Button
                    variant="contained"
                    startIcon={<i className="material-icons">add</i>}
                    onClick={() => showCreateTask()}
                >
                    New Task
                </Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, height: 'calc(100vh - 200px)' }}>
                {['todo', 'in-progress', 'in-review', 'completed'].map((status) => (
                    <Paper key={status} elevation={1} className="kanban-column" data-status={status} sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <i className="material-icons">
                                    {status === 'todo' ? 'list' :
                                     status === 'in-progress' ? 'play_circle' :
                                     status === 'in-review' ? 'visibility' : 'check_circle'}
                                </i>
                                {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Typography>
                            <Chip
                                id={`${status}-count`}
                                label="0"
                                size="small"
                                color="primary"
                            />
                        </Box>
                        <Box
                            id={`${status}-tasks`}
                            className="tasks-container"
                            sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, overflow: 'auto', minHeight: 200 }}
                        >
                            {/* Tasks will be populated by JavaScript */}
                        </Box>
                    </Paper>
                ))}
            </Box>
        </Container>
    );
}

// Finance Page Component
function FinancePage() {
    return (
        <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Finance Tracker</Typography>
                <Button
                    variant="contained"
                    startIcon={<i className="material-icons">add</i>}
                    onClick={() => showCreateExpense()}
                >
                    Add Transaction
                </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Card elevation={2} className="balance-card income">
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ bgcolor: 'success.light', color: 'success.main', borderRadius: 1, p: 1 }}>
                                    <i className="material-icons">trending_up</i>
                                </Box>
                                <Box>
                                    <Typography variant="h4" id="total-income">$0</Typography>
                                    <Typography variant="body2" color="text.secondary">Total Income</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card elevation={2} className="balance-card expense">
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ bgcolor: 'error.light', color: 'error.main', borderRadius: 1, p: 1 }}>
                                    <i className="material-icons">trending_down</i>
                                </Box>
                                <Box>
                                    <Typography variant="h4" id="total-expense">$0</Typography>
                                    <Typography variant="body2" color="text.secondary">Total Expenses</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card elevation={2} className="balance-card balance">
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ bgcolor: 'primary.light', color: 'primary.main', borderRadius: 1, p: 1 }}>
                                    <i className="material-icons">account_balance_wallet</i>
                                </Box>
                                <Box>
                                    <Typography variant="h4" id="net-balance">$0</Typography>
                                    <Typography variant="body2" color="text.secondary">Net Balance</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Category</InputLabel>
                    <Select id="expense-category-filter" label="Category" defaultValue="">
                        <MenuItem value="">All Categories</MenuItem>
                        <MenuItem value="Business">Business</MenuItem>
                        <MenuItem value="Personal">Personal</MenuItem>
                        <MenuItem value="Food">Food</MenuItem>
                        <MenuItem value="Transportation">Transportation</MenuItem>
                        <MenuItem value="Income">Income</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Type</InputLabel>
                    <Select id="expense-type-filter" label="Type" defaultValue="">
                        <MenuItem value="">All Types</MenuItem>
                        <MenuItem value="income">Income</MenuItem>
                        <MenuItem value="expense">Expense</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Paper elevation={1} id="transactions-list" sx={{ overflow: 'hidden' }}>
                {/* Transactions will be populated by JavaScript */}
            </Paper>
        </Container>
    );
}

// Render the app
ReactDOM.render(<App />, document.getElementById('app-root'));
