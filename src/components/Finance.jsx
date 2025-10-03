import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Grid, Paper, Snackbar, Alert, IconButton, Container } from '@mui/material';
import Modals from './Modals.jsx';

const Finance = ({ apiService }) => {
    const [expenses, setExpenses] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [modalOpen, setModalOpen] = useState(false);
    const [editExpense, setEditExpense] = useState(null);

    useEffect(() => {
        if (apiService) {
            fetchExpenses();
        }
    }, [apiService]);

    const fetchExpenses = async () => {
        try {
            const fetchedExpenses = await apiService.loadExpenses();
            setExpenses(fetchedExpenses);
        } catch (error) {
            showSnackbar('Failed to load expenses', 'error');
            console.error('Error fetching expenses:', error);
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

    const createNewExpense = () => {
        setEditExpense(null);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setEditExpense(null);
    };

    const handleSaveExpense = async (expenseData) => {
        try {
            if (editExpense) {
                await apiService.updateExpense(editExpense.id, expenseData);
                showSnackbar('Expense updated successfully', 'success');
            } else {
                await apiService.createExpense(expenseData);
                showSnackbar('Expense created successfully', 'success');
            }
            fetchExpenses();
        } catch (error) {
            showSnackbar('Failed to save expense', 'error');
        }
        handleModalClose();
    };

    const deleteExpense = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await apiService.deleteExpense(id);
                fetchExpenses();
                showSnackbar('Expense deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting expense:', error);
                showSnackbar('Failed to delete expense', 'error');
            }
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const filteredExpenses = expenses.filter(expense => {
        const matchesCategory = categoryFilter === '' || expense.category === categoryFilter;
        const matchesType = typeFilter === '' || expense.type === typeFilter;
        return matchesCategory && matchesType;
    });

    const totalExpenses = filteredExpenses
        .filter(expense => expense.type === 'expense')
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    const totalIncome = filteredExpenses
        .filter(expense => expense.type === 'income')
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    return (
        <>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4">Finance Tracker</Typography>
                    <Button
                        variant="contained"
                        startIcon={<i className="material-icons">add</i>}
                        onClick={createNewExpense}
                    >
                        Add Expense
                    </Button>
                </Box>

                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Total Income</Typography>
                                <Typography variant="h4" color="success.main">
                                    {formatCurrency(totalIncome)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Total Expenses</Typography>
                                <Typography variant="h4" color="error.main">
                                    {formatCurrency(totalExpenses)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Net Balance</Typography>
                                <Typography variant="h4" color={totalIncome - totalExpenses >= 0 ? 'success.main' : 'error.main'}>
                                    {formatCurrency(totalIncome - totalExpenses)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={categoryFilter}
                            label="Category"
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            variant="outlined"
                        >
                            <MenuItem value="">All Categories</MenuItem>
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
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={typeFilter}
                            label="Type"
                            onChange={(e) => setTypeFilter(e.target.value)}
                            variant="outlined"
                        >
                            <MenuItem value="">All Types</MenuItem>
                            <MenuItem value="expense">Expenses</MenuItem>
                            <MenuItem value="income">Income</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* Expenses List */}
                <Grid container spacing={2}>
                    {filteredExpenses.length === 0 ? (
                        <Grid item xs={12}>
                            <Box className="empty-state" sx={{ textAlign: 'center', p: 4 }}>
                                <i className="material-icons" style={{ fontSize: '48px', opacity: 0.5, marginBottom: '16px' }}>attach_money</i>
                                <Typography variant="h6" sx={{ mb: 1 }}>No transactions found</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Add your first expense or income to get started
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<i className="material-icons">add</i>}
                                    onClick={createNewExpense}
                                >
                                    Add Transaction
                                </Button>
                            </Box>
                        </Grid>
                    ) : (
                        filteredExpenses.map(expense => (
                            <Grid item xs={12} sm={6} md={4} key={expense.id}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                            <Typography variant="h6">{expense.description}</Typography>
                                            <Box>
                                                <IconButton size="small" onClick={() => { setEditExpense(expense); setModalOpen(true); }} title="Edit">
                                                    <i className="material-icons">edit</i>
                                                </IconButton>
                                                <IconButton size="small" onClick={() => deleteExpense(expense.id)} title="Delete" color="error">
                                                    <i className="material-icons">delete</i>
                                                </IconButton>
                                            </Box>
                                        </Box>
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                color: expense.type === 'income' ? 'success.main' : 'error.main',
                                                mb: 1
                                            }}
                                        >
                                            {expense.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(expense.amount))}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {expense.category}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(expense.date).toLocaleDateString()}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>

                <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Container>
            <Modals.ExpenseModal open={modalOpen} onClose={handleModalClose} expense={editExpense} onSave={handleSaveExpense} />
        </>
    );
};

export default Finance;
