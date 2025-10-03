import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Paper, Container } from '@mui/material';
import ApiService from '../utils/api.js';

const Dashboard = ({ apiService }) => {
    const [stats, setStats] = useState({
        totalNotes: 0,
        totalLinks: 0,
        activeTasks: 0,
        monthlyBalance: 0
    });

    useEffect(() => {
        if (apiService) {
            updateStats();
        }
    }, [apiService, apiService.notes, apiService.links, apiService.tasks, apiService.expenses]); // Depend on apiService and its data arrays

    const calculateMonthlyBalance = () => {
        if (!apiService || !apiService.expenses) return 0;
        const currentMonth = new Date().toISOString().substring(0, 7);
        const monthlyTransactions = apiService.expenses.filter(expense =>
            expense.date.startsWith(currentMonth));
        const income = monthlyTransactions.filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const expenses = monthlyTransactions.filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        return income - expenses;
    };

    const updateStats = () => {
        if (!apiService) return;

        setStats({
            totalNotes: apiService.notes.length,
            totalLinks: apiService.links.length,
            activeTasks: apiService.tasks.filter(task => task.status !== 'completed').length,
            monthlyBalance: calculateMonthlyBalance()
        });
    };

    // Placeholder for actual quick action functions - these would likely open modals
    const showCreateNote = () => console.log('Open Create Note Modal');
    const showCreateLink = () => console.log('Open Create Link Modal');
    const showCreateTask = () => console.log('Open Create Task Modal');
    const showCreateExpense = () => console.log('Open Create Expense Modal');

    const statCards = [
        { title: 'Total Notes', value: stats.totalNotes, icon: 'note', color: 'primary' },
        { title: 'Saved Links', value: stats.totalLinks, icon: 'link', color: 'secondary' },
        { title: 'Active Tasks', value: stats.activeTasks, icon: 'assignment', color: 'success' },
        { title: 'Monthly Balance', value: `$${stats.monthlyBalance.toFixed(2)}`, icon: 'account_balance_wallet', color: 'info' }
    ];

    const activities = [
        { icon: 'note', text: 'Created new note', time: '2 hours ago' },
        { icon: 'link', text: 'Added new link', time: '4 hours ago' },
        { icon: 'assignment', text: 'Updated task status', time: '6 hours ago' },
        { icon: 'account_balance_wallet', text: 'Added expense', time: '1 day ago' }
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
                                    onClick={showCreateNote}
                                >
                                    New Note
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<i className="material-icons">add</i>}
                                    onClick={showCreateLink}
                                >
                                    Add Link
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<i className="material-icons">add</i>}
                                    onClick={showCreateTask}
                                >
                                    New Task
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<i className="material-icons">add</i>}
                                    onClick={showCreateExpense}
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
                        <Box id="activity-feed">
                            {activities.map((activity, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Box sx={{ mr: 2, color: 'text.secondary' }}>
                                        <i className="material-icons">{activity.icon}</i>
                                    </Box>
                                    <Box>
                                        <Typography variant="body1">{activity.text}</Typography>
                                        <Typography variant="body2" color="text.secondary">{activity.time}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;
