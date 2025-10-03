import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, TextField, Chip, Paper, Container, Grid, Card, CardContent, Snackbar, Alert } from '@mui/material';
import ApiService from '../utils/api.js';
import Modals from './Modals.jsx';

const Projects = ({ apiService }) => {
    const [tasks, setTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTask, setEditTask] = useState(null);

    useEffect(() => {
        if (apiService) {
            fetchTasks();
        }
    }, [apiService]);

    const fetchTasks = async () => {
        try {
            const fetchedTasks = await apiService.loadTasks();
            setTasks(fetchedTasks);
        } catch (error) {
            showSnackbar('Failed to load tasks', 'error');
            console.error('Error fetching tasks:', error);
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

    const createNewTask = () => {
        setEditTask(null);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setEditTask(null);
    };

    const handleSaveTask = async (taskData) => {
        try {
            if (editTask) {
                await apiService.updateTask(editTask.id, taskData);
                showSnackbar('Task updated successfully', 'success');
            } else {
                await apiService.createTask(taskData);
                showSnackbar('Task created successfully', 'success');
            }
            fetchTasks();
        } catch (error) {
            showSnackbar('Failed to save task', 'error');
        }
        handleModalClose();
    };

    const deleteTask = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await apiService.deleteTask(id);
                setTasks(prevTasks => prevTasks.filter(t => t.id !== id));
                showSnackbar('Task deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting task:', error);
                showSnackbar('Failed to delete task', 'error');
            }
        }
    };

    const moveTask = async (taskId, newStatus) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            const updatedTaskData = { ...task, status: newStatus };
            try {
                await apiService.updateTask(taskId, updatedTaskData);
                showSnackbar('Task moved successfully', 'success');
                fetchTasks(); // Always re-fetch after move
            } catch (error) {
                showSnackbar('Failed to move task', 'error');
            }
        }
    };

    const handleDragStart = (e, taskId) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.setData('text/plain', taskId.toString());
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, newStatus) => {
        e.preventDefault();
        const taskId = parseInt(e.dataTransfer.getData('text/plain'));
        moveTask(taskId, newStatus);
        setDraggedTaskId(null);
    };

    const getDueDateColor = (dueDateString) => {
        const dueDate = new Date(dueDateString);
        const today = new Date();
        const daysUntilDue = (dueDate - today) / (1000 * 60 * 60 * 24);

        if (daysUntilDue <= 7) return 'error'; // Red for urgent
        if (daysUntilDue <= 14) return 'warning'; // Orange for soon
        return 'success'; // Green for far future or no due date
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const statusColumns = [
        { id: 'todo', label: 'To Do', icon: 'list' },
        { id: 'in-progress', label: 'In Progress', icon: 'play_circle' },
        { id: 'in-review', label: 'In Review', icon: 'visibility' },
        { id: 'completed', label: 'Completed', icon: 'check_circle' },
    ];

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4">Project Board</Typography>
                    <Button
                        variant="contained"
                        startIcon={<i className="material-icons">add</i>}
                        onClick={createNewTask}
                    >
                        New Task
                    </Button>
                </Box>

                <TextField
                    fullWidth
                    placeholder="Search tasks..."
                    size="small"
                    sx={{ mb: 3 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <i className="material-icons" style={{ marginRight: '8px' }}>search</i>
                    }}
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, height: 'calc(100vh - 200px)' }}>
                    {statusColumns.map((column) => (
                        <Paper
                            key={column.id}
                            elevation={1}
                            className="kanban-column"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.id)}
                            sx={{ p: 2, display: 'flex', flexDirection: 'column' }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <i className="material-icons">{column.icon}</i>
                                    {column.label}
                                </Typography>
                                <Chip
                                    label={filteredTasks.filter(task => task.status === column.id).length}
                                    size="small"
                                    color="primary"
                                />
                            </Box>
                            <Box
                                className="tasks-container"
                                sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, overflow: 'auto', minHeight: 200 }}
                            >
                                {filteredTasks.filter(task => task.status === column.id).length === 0 ? (
                                    <Box className="empty-state" sx={{ textAlign: 'center', p: 2, color: 'text.secondary' }}>
                                        <i className="material-icons" style={{ fontSize: '36px', opacity: 0.5 }}>assignment</i>
                                        <Typography variant="body2">No tasks in this column</Typography>
                                    </Box>
                                ) : (
                                    filteredTasks.filter(task => task.status === column.id).map(task => (
                                        <Card
                                            key={task.id}
                                            elevation={2}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task.id)}
                                            sx={{ cursor: 'grab' }}
                                        >
                                            <CardContent className="task-card">
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{task.title}</Typography>
                                                <Typography variant="body2" color="text.secondary">{task.description}</Typography>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                    <Chip label={task.assignee} size="small" color="default" />
                                                    {task.dueDate && (
                                                        <Chip
                                                            label={formatDate(task.dueDate)}
                                                            size="small"
                                                            color={getDueDateColor(task.dueDate)}
                                                        />
                                                    )}
                                                </Box>
                                                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                    <IconButton size="small" onClick={() => { setEditTask(task); setModalOpen(true); }} title="Edit">
                                                        <i className="material-icons">edit</i>
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => deleteTask(task.id)} title="Delete" color="error">
                                                        <i className="material-icons">delete</i>
                                                    </IconButton>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </Box>
                        </Paper>
                    ))}
                </Box>
                <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Container>
            <Modals.TaskModal open={modalOpen} onClose={handleModalClose} task={editTask} onSave={handleSaveTask} />
        </>
    );
};

export default Projects;
