(function(){
  // Enhanced boot script with advanced MUI features
  const M = MaterialUI;
  const {
    ThemeProvider, createTheme, CssBaseline, Box, Button, Typography, Container,
    AppBar, Toolbar, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Card, CardContent, CardActions, CardHeader, Avatar, IconButton, Switch, FormControlLabel,
    Fab, SpeedDial, SpeedDialAction, SpeedDialIcon, Tooltip, Backdrop, CircularProgress,
    LinearProgress, Skeleton, Chip, Badge, Alert, Snackbar, Slide, Zoom, Fade, Grow,
    Paper, Grid, Divider, ButtonGroup, ToggleButton, ToggleButtonGroup, Menu, MenuItem,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Breadcrumbs, Link, Rating, Slider, Stack, useTheme, alpha
  } = M;

  // Enhanced theme with dark mode support
  const createAdvancedTheme = (darkMode) => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#90caf9' : '#1976d2',
        light: darkMode ? '#bbdefb' : '#42a5f5',
        dark: darkMode ? '#1565c0' : '#0d47a1',
      },
      secondary: {
        main: darkMode ? '#f48fb1' : '#dc004e',
      },
      background: {
        default: darkMode ? '#121212' : '#fafafa',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
      success: { main: '#4caf50' },
      warning: { main: '#ff9800' },
      error: { main: '#f44336' },
      info: { main: '#2196f3' },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 600, letterSpacing: '-0.5px' },
      h5: { fontWeight: 500 },
      h6: { fontWeight: 500 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: darkMode
              ? '0 4px 20px rgba(0,0,0,0.3)'
              : '0 4px 20px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: darkMode
                ? '0 8px 30px rgba(0,0,0,0.4)'
                : '0 8px 30px rgba(0,0,0,0.15)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          },
        },
      },
    },
  });

  // ApiService (same methods used by components-bundle)
  class ApiService {
    constructor() {
      this.baseUrl = window.location.origin + '/api';
      this.notes = [];
      this.links = [];
      this.tasks = [];
      this.expenses = [];
    }

    async request(endpoint, options = {}){
      try{
        const response = await fetch(this.baseUrl + endpoint, Object.assign({headers: {'Content-Type': 'application/json'}}, options));
        if(!response.ok) throw new Error('HTTP error ' + response.status);
        return await response.json();
      } catch(e){ console.error('ApiService request error', e); throw e; }
    }

    async loadNotes(){ try{ this.notes = await this.request('/notes'); this.notes = this.notes.map(n=>({ ...n, createdAt: n.created_at })); return this.notes;}catch(e){console.error(e);return []} }
    async createNote(d){ try{ const r = await this.request('/notes', { method:'POST', body: JSON.stringify(d) }); r.createdAt = r.created_at; this.notes.unshift(r); return r;}catch(e){throw e} }
    async updateNote(id,d){ try{ const r = await this.request(`/notes/${id}`, { method:'PUT', body: JSON.stringify(d) }); r.createdAt = r.created_at; const i = this.notes.findIndex(x=>x.id===id); if(i!==-1) this.notes[i]=r; return r;}catch(e){throw e} }
    async deleteNote(id){ try{ await this.request(`/notes/${id}`, { method:'DELETE' }); this.notes = this.notes.filter(x=>x.id!==id);}catch(e){throw e} }

    async loadLinks(){ try{ this.links = await this.request('/links'); return this.links;}catch(e){console.error(e);return []} }
    async createLink(d){ try{ const r = await this.request('/links', { method:'POST', body: JSON.stringify(d) }); this.links.unshift(r); return r;}catch(e){throw e} }
    async updateLink(id,d){ try{ const r = await this.request(`/links/${id}`, { method:'PUT', body: JSON.stringify(d) }); const i = this.links.findIndex(x=>x.id===id); if(i!==-1) this.links[i]=r; return r;}catch(e){throw e} }
    async deleteLink(id){ try{ await this.request(`/links/${id}`, { method:'DELETE' }); this.links = this.links.filter(x=>x.id!==id);}catch(e){throw e} }

    async loadTasks(){ try{ this.tasks = await this.request('/tasks'); this.tasks = this.tasks.map(t=>({ ...t, dueDate: t.due_date })); return this.tasks;}catch(e){console.error(e);return []} }
    async createTask(d){ try{ const post = Object.assign({}, d, { due_date: d.dueDate }); const r = await this.request('/tasks', { method:'POST', body: JSON.stringify(post) }); r.dueDate = r.due_date; this.tasks.push(r); return r;}catch(e){throw e} }
    async updateTask(id,d){ try{ const post = Object.assign({}, d, { due_date: d.dueDate }); const r = await this.request(`/tasks/${id}`, { method:'PUT', body: JSON.stringify(post) }); r.dueDate = r.due_date; const i = this.tasks.findIndex(x=>x.id===id); if(i!==-1) this.tasks[i]=r; return r;}catch(e){throw e} }
    async deleteTask(id){ try{ await this.request(`/tasks/${id}`, { method:'DELETE' }); this.tasks = this.tasks.filter(x=>x.id!==id);}catch(e){throw e} }

    async loadExpenses(){ try{ this.expenses = await this.request('/expenses'); return this.expenses;}catch(e){console.error(e);return []} }
    async createExpense(d){ try{ const r = await this.request('/expenses', { method:'POST', body: JSON.stringify(d) }); this.expenses.unshift(r); return r;}catch(e){throw e} }
    async updateExpense(id,d){ try{ const r = await this.request(`/expenses/${id}`, { method:'PUT', body: JSON.stringify(d) }); const i = this.expenses.findIndex(x=>x.id===id); if(i!==-1) this.expenses[i]=r; return r;}catch(e){throw e} }
    async deleteExpense(id){ try{ await this.request(`/expenses/${id}`, { method:'DELETE' }); this.expenses = this.expenses.filter(x=>x.id!==id);}catch(e){throw e} }

    async loadAllData(){ try{ await Promise.all([this.loadNotes(), this.loadLinks(), this.loadTasks(), this.loadExpenses()]); }catch(e){console.error(e);} }
  }

  // Enhanced Dashboard with advanced MUI components
  function EnhancedDashboard({ apiService, darkMode, toggleDarkMode }) {
    const [loading, setLoading] = React.useState(true);
    const [speedDialOpen, setSpeedDialOpen] = React.useState(false);
    const [selectedMetric, setSelectedMetric] = React.useState('overview');
    const theme = useTheme();

    const containerRef = React.useRef(null);
    const lineRef = React.useRef(null);
    const pieRef = React.useRef(null);
    const barRef = React.useRef(null);
    const chartsRef = React.useRef({ line: null, pie: null, bar: null });

    React.useEffect(() => {
      setTimeout(() => setLoading(false), 1500);
    }, []);

    const buildMonthlyData = (expenses) => {
      const map = {};
      expenses.forEach(e => {
        if (!e.date) return;
        const month = e.date.slice(0,7);
        map[month] = (map[month] || 0) + parseFloat(e.amount || 0);
      });
      const months = Object.keys(map).sort();
      const values = months.map(m => map[m]);
      return { months, values };
    };

    const buildCategoryData = (expenses) => {
      const map = {};
      expenses.forEach(e => {
        const cat = e.category || 'Uncategorized';
        map[cat] = (map[cat] || 0) + parseFloat(e.amount || 0);
      });
      const labels = Object.keys(map);
      const values = labels.map(l => map[l]);
      return { labels, values };
    };

    const buildTaskStatusData = (tasks) => {
      const map = { todo:0, 'in-progress':0, 'in-review':0, completed:0 };
      tasks.forEach(t => {
        const s = t.status || 'todo';
        if (map[s] === undefined) map[s] = 0;
        map[s] += 1;
      });
      const labels = Object.keys(map);
      const values = labels.map(l => map[l]);
      return { labels, values };
    };

    const renderCharts = () => {
      const expenses = apiService.expenses || [];
      const tasks = apiService.tasks || [];

      // Monthly line chart
      const monthly = buildMonthlyData(expenses);
      if (chartsRef.current.line) chartsRef.current.line.destroy();
      const ctxLine = lineRef.current?.getContext('2d');
      if (ctxLine) {
        chartsRef.current.line = new Chart(ctxLine, {
          type: 'line',
          data: {
            labels: monthly.months,
            datasets: [{
              label: 'Monthly Expenses',
              data: monthly.values,
              fill: true,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              borderColor: theme.palette.primary.main,
              borderWidth: 3,
              tension: 0.4,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: { beginAtZero: true, grid: { color: alpha(theme.palette.divider, 0.1) } },
              x: { grid: { color: alpha(theme.palette.divider, 0.1) } }
            }
          }
        });
      }

      // Category pie chart
      const cat = buildCategoryData(expenses);
      if (chartsRef.current.pie) chartsRef.current.pie.destroy();
      const ctxPie = pieRef.current?.getContext('2d');
      if (ctxPie) {
        chartsRef.current.pie = new Chart(ctxPie, {
          type: 'doughnut',
          data: {
            labels: cat.labels,
            datasets: [{
              data: cat.values,
              backgroundColor: [
                theme.palette.primary.main,
                theme.palette.secondary.main,
                theme.palette.warning.main,
                theme.palette.success.main,
                theme.palette.error.main,
                theme.palette.info.main,
              ],
              borderWidth: 0,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
              legend: { position: 'bottom' },
            }
          }
        });
      }

      // Tasks bar chart
      const tdata = buildTaskStatusData(tasks);
      if (chartsRef.current.bar) chartsRef.current.bar.destroy();
      const ctxBar = barRef.current?.getContext('2d');
      if (ctxBar) {
        chartsRef.current.bar = new Chart(ctxBar, {
          type: 'bar',
          data: {
            labels: tdata.labels,
            datasets: [{
              label: 'Tasks',
              data: tdata.values,
              backgroundColor: [
                alpha(theme.palette.warning.main, 0.8),
                alpha(theme.palette.info.main, 0.8),
                alpha(theme.palette.warning.main, 0.6),
                alpha(theme.palette.success.main, 0.8),
              ],
              borderRadius: 8,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, grid: { color: alpha(theme.palette.divider, 0.1) } },
              x: { grid: { display: false } }
            }
          }
        });
      }
    };

    React.useEffect(() => {
      if (!loading) {
        setTimeout(renderCharts, 100);
      }
    }, [loading, darkMode]);

    const stats = {
      notes: apiService.notes.length,
      links: apiService.links.length,
      activeTasks: apiService.tasks.filter(t => t.status !== 'completed').length,
      completedTasks: apiService.tasks.filter(t => t.status === 'completed').length,
    };

    const currentMonth = new Date().toISOString().slice(0,7);
    const monthly = apiService.expenses.filter(e => e.date && e.date.startsWith(currentMonth));
    const income = monthly.filter(e => e.type === 'income').reduce((s,e) => s + parseFloat(e.amount || 0), 0);
    const expense = monthly.filter(e => e.type === 'expense').reduce((s,e) => s + parseFloat(e.amount || 0), 0);
    const balance = income - expense;

    const speedDialActions = [
      { icon: React.createElement('i', { className: 'material-icons' }, 'note_add'), name: 'New Note' },
      { icon: React.createElement('i', { className: 'material-icons' }, 'link'), name: 'Add Link' },
      { icon: React.createElement('i', { className: 'material-icons' }, 'assignment'), name: 'New Task' },
      { icon: React.createElement('i', { className: 'material-icons' }, 'attach_money'), name: 'Add Expense' },
    ];

    if (loading) {
      return React.createElement(Container, { maxWidth: 'lg', sx: { mt: 4, mb: 4 } },
        React.createElement(Box, { sx: { mb: 4 } },
          React.createElement(Skeleton, { variant: 'text', width: 200, height: 60 }),
          React.createElement(Skeleton, { variant: 'rectangular', width: '100%', height: 20, sx: { mt: 2 } })
        ),
        React.createElement(Grid, { container: true, spacing: 3 },
          Array.from({ length: 4 }).map((_, i) =>
            React.createElement(Grid, { key: i, item: true, xs: 12, sm: 6, md: 3 },
              React.createElement(Skeleton, { variant: 'rectangular', height: 140, sx: { borderRadius: 2 } })
            )
          )
        ),
        React.createElement(Box, { sx: { mt: 4 } },
          React.createElement(Grid, { container: true, spacing: 3 },
            Array.from({ length: 3 }).map((_, i) =>
              React.createElement(Grid, { key: i, item: true, xs: 12, md: 4 },
                React.createElement(Skeleton, { variant: 'rectangular', height: 300, sx: { borderRadius: 2 } })
              )
            )
          )
        )
      );
    }

    return React.createElement(Container, { maxWidth: 'lg', sx: { mt: 4, mb: 4 } },
      // Header with breadcrumbs and controls
      React.createElement(Box, { sx: { mb: 4 } },
        React.createElement(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 } },
          React.createElement(Box, null,
            React.createElement(Typography, { variant: 'h4', sx: { mb: 1 } }, 'Dashboard'),
            React.createElement(Breadcrumbs, null,
              React.createElement(Link, { color: 'inherit', href: '#' }, 'Home'),
              React.createElement(Typography, { color: 'text.primary' }, 'Dashboard')
            )
          ),
          React.createElement(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 } },
            React.createElement(FormControlLabel, {
              control: React.createElement(Switch, { checked: darkMode, onChange: toggleDarkMode }),
              label: darkMode ? React.createElement('i', { className: 'material-icons' }, 'dark_mode') : React.createElement('i', { className: 'material-icons' }, 'light_mode')
            }),
            React.createElement(ToggleButtonGroup, {
              value: selectedMetric,
              exclusive: true,
              onChange: (e, value) => value && setSelectedMetric(value),
              size: 'small'
            },
              React.createElement(ToggleButton, { value: 'overview' }, 'Overview'),
              React.createElement(ToggleButton, { value: 'analytics' }, 'Analytics')
            )
          )
        ),
        React.createElement(LinearProgress, {
          variant: 'determinate',
          value: 85,
          sx: { height: 4, borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.1) }
        })
      ),

      // Stats Cards with enhanced design
      React.createElement(Fade, { in: true, timeout: 800 },
        React.createElement(Grid, { container: true, spacing: 3, sx: { mb: 4 } },
          [
            { title: 'Total Notes', value: stats.notes, icon: 'note', color: 'primary', trend: '+12%' },
            { title: 'Active Links', value: stats.links, icon: 'link', color: 'secondary', trend: '+8%' },
            { title: 'Active Tasks', value: stats.activeTasks, icon: 'assignment', color: 'warning', trend: '-3%' },
            { title: 'Monthly Balance', value: `$${balance.toFixed(2)}`, icon: 'attach_money', color: balance >= 0 ? 'success' : 'error', trend: balance >= 0 ? '+15%' : '-5%' }
          ].map((stat, index) =>
            React.createElement(Grid, { key: index, item: true, xs: 12, sm: 6, md: 3 },
              React.createElement(Grow, { in: true, timeout: 500 + index * 200 },
                React.createElement(Card, { elevation: 0, sx: { height: '100%', position: 'relative', overflow: 'visible' } },
                  React.createElement(CardContent, { sx: { pb: 2 } },
                    React.createElement(Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 } },
                      React.createElement(Avatar, {
                        sx: {
                          bgcolor: `${stat.color}.main`,
                          width: 48,
                          height: 48,
                          boxShadow: `0 4px 20px ${alpha(theme.palette[stat.color].main, 0.3)}`
                        }
                      },
                        React.createElement('i', { className: 'material-icons' }, stat.icon)
                      ),
                      React.createElement(Chip, {
                        label: stat.trend,
                        size: 'small',
                        color: stat.trend.startsWith('+') ? 'success' : 'error',
                        variant: 'outlined'
                      })
                    ),
                    React.createElement(Typography, { variant: 'h4', sx: { fontWeight: 700, mb: 0.5 } }, stat.value),
                    React.createElement(Typography, { variant: 'body2', color: 'text.secondary' }, stat.title)
                  )
                )
              )
            )
          )
        )
      ),

      // Charts Section with enhanced styling
      React.createElement(Slide, { direction: 'up', in: true, timeout: 1000 },
        React.createElement(Grid, { container: true, spacing: 3, sx: { mb: 4 } },
          React.createElement(Grid, { item: true, xs: 12, md: 8 },
            React.createElement(Card, { elevation: 0 },
              React.createElement(CardHeader, {
                title: 'Monthly Expense Trend',
                subheader: 'Last 6 months overview',
                action: React.createElement(IconButton, null, React.createElement('i', { className: 'material-icons' }, 'more_vert'))
              }),
              React.createElement(CardContent, null,
                React.createElement(Box, { sx: { height: 300, position: 'relative' } },
                  React.createElement('canvas', { ref: lineRef, style: { width: '100%', height: '100%' } })
                )
              )
            )
          ),
          React.createElement(Grid, { item: true, xs: 12, md: 4 },
            React.createElement(Card, { elevation: 0, sx: { height: '100%' } },
              React.createElement(CardHeader, {
                title: 'Expense Categories',
                subheader: 'Distribution'
              }),
              React.createElement(CardContent, null,
                React.createElement(Box, { sx: { height: 260, position: 'relative' } },
                  React.createElement('canvas', { ref: pieRef, style: { width: '100%', height: '100%' } })
                )
              )
            )
          )
        )
      ),

      // Tasks Chart and Activity
      React.createElement(Grid, { container: true, spacing: 3 },
        React.createElement(Grid, { item: true, xs: 12, md: 6 },
          React.createElement(Card, { elevation: 0 },
            React.createElement(CardHeader, {
              title: 'Task Status Overview',
              subheader: 'Current distribution'
            }),
            React.createElement(CardContent, null,
              React.createElement(Box, { sx: { height: 250, position: 'relative' } },
                React.createElement('canvas', { ref: barRef, style: { width: '100%', height: '100%' } })
              )
            )
          )
        ),
        React.createElement(Grid, { item: true, xs: 12, md: 6 },
          React.createElement(Card, { elevation: 0 },
            React.createElement(CardHeader, {
              title: 'Recent Activity',
              subheader: 'Latest updates'
            }),
            React.createElement(CardContent, null,
              React.createElement(List, { dense: true },
                React.createElement(ListItem, null,
                  React.createElement(ListItemIcon, null, React.createElement('i', { className: 'material-icons' }, 'note_add')),
                  React.createElement(ListItemText, { primary: 'New note created', secondary: '2 hours ago' })
                ),
                React.createElement(Divider, null),
                React.createElement(ListItem, null,
                  React.createElement(ListItemIcon, null, React.createElement('i', { className: 'material-icons' }, 'check_circle')),
                  React.createElement(ListItemText, { primary: 'Task completed', secondary: '4 hours ago' })
                ),
                React.createElement(Divider, null),
                React.createElement(ListItem, null,
                  React.createElement(ListItemIcon, null, React.createElement('i', { className: 'material-icons' }, 'link')),
                  React.createElement(ListItemText, { primary: 'Link added', secondary: '6 hours ago' })
                )
              )
            )
          )
        )
      ),

      // Speed Dial for quick actions
      React.createElement(SpeedDial, {
        ariaLabel: 'Quick Actions',
        sx: { position: 'fixed', bottom: 24, right: 24 },
        icon: React.createElement(SpeedDialIcon, null),
        open: speedDialOpen,
        onClose: () => setSpeedDialOpen(false),
        onOpen: () => setSpeedDialOpen(true)
      },
        speedDialActions.map((action) =>
          React.createElement(SpeedDialAction, {
            key: action.name,
            icon: action.icon,
            tooltipTitle: action.name,
            onClick: () => setSpeedDialOpen(false)
          })
        )
      )
    );
  }

  function mountAppWhenReady(){
    const apiService = new ApiService();

    function AppContainer(){
      const [view, setView] = React.useState('dashboard');
      const [loading, setLoading] = React.useState(true);
      const [darkMode, setDarkMode] = React.useState(false);
      const [drawerOpen, setDrawerOpen] = React.useState(true);
      const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'info' });

      const theme = React.useMemo(() => createAdvancedTheme(darkMode), [darkMode]);

      React.useEffect(() => {
        let mounted = true;
        (async () => {
          try {
            await apiService.loadAllData();
            if (mounted) setSnackbar({ open: true, message: 'Data loaded successfully!', severity: 'success' });
          } catch(e) {
            console.error(e);
            if (mounted) setSnackbar({ open: true, message: 'Failed to load data', severity: 'error' });
          } finally {
            if (mounted) setLoading(false);
          }
        })();
        return () => { mounted = false; };
      }, []);

      const toggleDarkMode = () => setDarkMode(!darkMode);
      const toggleDrawer = () => setDrawerOpen(!drawerOpen);

      const renderView = () => {
        if (loading) {
          return React.createElement(Box, {
            sx: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              flexDirection: 'column',
              gap: 2
            }
          },
            React.createElement(CircularProgress, { size: 60, thickness: 4 }),
            React.createElement(Typography, { variant: 'h6', color: 'text.secondary' }, 'Loading ProductivePro...'),
            React.createElement(LinearProgress, { sx: { width: 200, mt: 2 } })
          );
        }

        if (view === 'dashboard') {
          return React.createElement(EnhancedDashboard, { apiService, darkMode, toggleDarkMode });
        }

        // Use components from bundle when available
        if (view === 'links' && window.Links) return React.createElement(window.Links, { apiService });
        if (view === 'notes' && window.Notes) return React.createElement(window.Notes, { apiService });
        if (view === 'projects' && window.Projects) return React.createElement(window.Projects, { apiService });
        if (view === 'finance' && window.Finance) return React.createElement(window.Finance, { apiService });

        return React.createElement(Container, { maxWidth: 'lg', sx: { mt: 4, mb: 4 } },
          React.createElement(Alert, { severity: 'info' }, 'Component not available yet')
        );
      };

      const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', color: 'primary' },
        { id: 'notes', label: 'Notes', icon: 'note', color: 'secondary' },
        { id: 'links', label: 'Links', icon: 'link', color: 'info' },
        { id: 'projects', label: 'Projects', icon: 'assignment', color: 'warning' },
        { id: 'finance', label: 'Finance', icon: 'attach_money', color: 'success' },
      ];

      const dashboardCount = React.useMemo(() => {
        const activeTasks = apiService.tasks.filter(t => t.status !== 'completed').length;
        return apiService.notes.length + apiService.links.length + activeTasks;
      }, [apiService.notes, apiService.links, apiService.tasks]);

      return React.createElement(ThemeProvider, { theme },
        React.createElement(CssBaseline, null),
        React.createElement(Box, { sx: { display: 'flex', minHeight: '100vh' } },
          // Enhanced Navigation Drawer
          React.createElement(Drawer, {
            variant: 'permanent',
            open: drawerOpen,
            sx: {
              width: drawerOpen ? 280 : 64,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerOpen ? 280 : 64,
                boxSizing: 'border-box',
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
                overflowX: 'hidden',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: 'white',
              },
            }
          },
            React.createElement(Box, { sx: { p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 64 } },
              drawerOpen && React.createElement(Typography, { variant: 'h6', sx: { fontWeight: 700, color: 'white' } }, 'ProductivePro'),
              React.createElement(IconButton, { onClick: toggleDrawer, sx: { color: 'white' } },
                React.createElement('i', { className: 'material-icons' }, drawerOpen ? 'chevron_left' : 'chevron_right')
              )
            ),
            React.createElement(Divider, { sx: { borderColor: 'rgba(255,255,255,0.12)' } }),
            React.createElement(List, { sx: { px: 1, pt: 2 } },
              menuItems.map((item, index) =>
                React.createElement(Grow, { key: item.id, in: true, timeout: 500 + index * 100 },
                  React.createElement(Tooltip, { title: !drawerOpen ? item.label : '', placement: 'right' },
                    React.createElement(ListItem, { disablePadding: true, sx: { mb: 1 } },
                      React.createElement(ListItemButton, {
                        selected: view === item.id,
                        onClick: () => setView(item.id),
                        sx: {
                          borderRadius: 2,
                          minHeight: 48,
                          justifyContent: drawerOpen ? 'initial' : 'center',
                          px: 2,
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                          },
                          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                        }
                      },
                        React.createElement(ListItemIcon, {
                          sx: {
                            minWidth: 0,
                            mr: drawerOpen ? 3 : 'auto',
                            justifyContent: 'center',
                            color: 'white'
                          }
                        },
                          React.createElement(Badge, {
                            badgeContent: item.id === 'dashboard' ? dashboardCount : 0,
                            color: 'error',
                            invisible: item.id !== 'dashboard' || dashboardCount === 0
                          },
                            React.createElement('i', { className: 'material-icons' }, item.icon)
                          )
                        ),
                        drawerOpen && React.createElement(ListItemText, {
                          primary: item.label,
                          sx: { '& .MuiListItemText-primary': { color: 'white', fontWeight: 500 } }
                        })
                      )
                    )
                  )
                )
              )
            )
          ),

          // Main Content with enhanced header
          React.createElement(Box, { component: 'main', sx: { flexGrow: 1, bgcolor: 'background.default' } },
            React.createElement(AppBar, {
              position: 'sticky',
              elevation: 0,
              sx: {
                bgcolor: 'background.paper',
                borderBottom: `1px solid ${theme.palette.divider}`,
                color: 'text.primary'
              }
            },
              React.createElement(Toolbar, { sx: { justifyContent: 'space-between' } },
                React.createElement(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 } },
                  React.createElement(Typography, { variant: 'h6', sx: { fontWeight: 600 } },
                    menuItems.find(item => item.id === view)?.label || 'Dashboard'
                  ),
                  React.createElement(Chip, {
                    label: 'Pro',
                    size: 'small',
                    color: 'primary',
                    sx: { fontSize: '0.7rem', height: 20 }
                  })
                ),
                React.createElement(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 } },
                  React.createElement(IconButton, null, React.createElement('i', { className: 'material-icons' }, 'notifications')),
                  React.createElement(IconButton, null, React.createElement('i', { className: 'material-icons' }, 'search')),
                  React.createElement(Avatar, { sx: { width: 32, height: 32, bgcolor: 'primary.main' } }, 'U')
                )
              )
            ),
            renderView()
          )
        ),

        // Enhanced Snackbar
        React.createElement(Snackbar, {
          open: snackbar.open,
          autoHideDuration: 4000,
          onClose: () => setSnackbar({ ...snackbar, open: false }),
          TransitionComponent: Slide
        },
          React.createElement(Alert, {
            onClose: () => setSnackbar({ ...snackbar, open: false }),
            severity: snackbar.severity,
            variant: 'filled',
            sx: { width: '100%' }
          }, snackbar.message)
        )
      );
    }

    const root = ReactDOM.createRoot(document.getElementById('app-root'));
    root.render(React.createElement(AppContainer));
  }

  // Load components-bundle and then mount
  (function(){
    const bundlePath = '/src/components/components-bundle.js';
    const existing = document.querySelector(`script[src^="${bundlePath}"]`);
    if(existing && window.Links && window.Notes) {
      mountAppWhenReady();
      return;
    }

    const s = document.createElement('script');
    // Cache-bust to ensure latest bundle loads
    s.src = bundlePath + '?v=' + Date.now();
    s.async = true;
    s.onload = () => {
      console.log('components-bundle loaded from boot');
      mountAppWhenReady();
    };
    s.onerror = (e) => {
      console.error('Failed to load components-bundle', e);
      mountAppWhenReady();
    };
    document.body.appendChild(s);
  })();
})();
