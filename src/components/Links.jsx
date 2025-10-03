import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Link as MuiLink, Chip, Snackbar, Alert, Grid } from '@mui/material';
import Modals from './Modals.jsx';

const Links = ({ apiService }) => {
    const [links, setLinks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [modalOpen, setModalOpen] = useState(false);
    const [editLink, setEditLink] = useState(null);

    useEffect(() => {
        if (apiService) {
            fetchLinks();
        }
    }, [apiService]);

    useEffect(() => {
        // Re-render links grid when filters/search term change or links data updates
        // The actual filtering and rendering happens directly in JSX based on these states
    }, [searchTerm, categoryFilter, links]);

    const fetchLinks = async () => {
        try {
            const fetchedLinks = await apiService.loadLinks();
            setLinks(fetchedLinks);
        } catch (error) {
            showSnackbar('Failed to load links', 'error');
            console.error('Error fetching links:', error);
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

    const createNewLink = () => {
        setEditLink(null);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setEditLink(null);
    };

    const handleSaveLink = async (linkData) => {
        try {
            if (editLink) {
                await apiService.updateLink(editLink.id, linkData);
                showSnackbar('Link updated successfully', 'success');
            } else {
                await apiService.createLink(linkData);
                showSnackbar('Link created successfully', 'success');
            }
            fetchLinks();
        } catch (error) {
            showSnackbar('Failed to save link', 'error');
        }
        handleModalClose();
    };

    const deleteLink = async (id) => {
        if (window.confirm('Are you sure you want to delete this link?')) {
            try {
                await apiService.deleteLink(id);
                setLinks(prevLinks => prevLinks.filter(l => l.id !== id));
                showSnackbar('Link deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting link:', error);
                showSnackbar('Failed to delete link', 'error');
            }
        }
    };

    const filteredLinks = links
        .filter(link => {
            const matchesSearch = searchTerm === '' ||
                link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (link.description && link.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (link.tags && link.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
            const matchesCategory = categoryFilter === '' || link.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

    return (
        <>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4">Links Directory</Typography>
                    <Button
                        variant="contained"
                        startIcon={<i className="material-icons">add</i>}
                        onClick={createNewLink}
                    >
                        Add Link
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <TextField
                        fullWidth
                        placeholder="Search links..."
                        size="small"
                        sx={{ flex: 1, minWidth: 250 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <i className="material-icons" style={{ marginRight: '8px' }}>search</i>
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={categoryFilter}
                            label="Category"
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            variant="outlined"
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            <MenuItem value="Development">Development</MenuItem>
                            <MenuItem value="Design">Design</MenuItem>
                            <MenuItem value="Business">Business</MenuItem>
                            <MenuItem value="Personal">Personal</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Grid container spacing={2} id="links-grid">
                    {filteredLinks.length === 0 ? (
                        <Grid item xs={12}>
                            <Box className="empty-state" sx={{ textAlign: 'center', p: 4 }}>
                                <i className="material-icons" style={{ fontSize: '48px', opacity: 0.5, marginBottom: '16px' }}>link</i>
                                <Typography variant="h6" sx={{ mb: 1 }}>No links found</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Add your first link to get started
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<i className="material-icons">add</i>}
                                    onClick={createNewLink}
                                >
                                    Add Link
                                </Button>
                            </Box>
                        </Grid>
                    ) : (
                        filteredLinks.map(link => (
                            <Grid item xs={12} sm={6} md={4} key={link.id}>
                                <Card elevation={2} className="link-card">
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <MuiLink href={link.url} target="_blank" rel="noopener noreferrer" variant="h6" sx={{ textDecoration: 'none' }}>
                                                {link.title}
                                            </MuiLink>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <IconButton size="small" onClick={() => { setEditLink(link); setModalOpen(true); }} title="Edit">
                                                    <i className="material-icons">edit</i>
                                                </IconButton>
                                                <IconButton size="small" onClick={() => deleteLink(link.id)} title="Delete" color="error">
                                                    <i className="material-icons">delete</i>
                                                </IconButton>
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {link.url}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            {link.description}
                                        </Typography>
                                        <Box sx={{ mb: 1 }}>
                                            {(link.tags || []).map(tag => (
                                                <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                                            ))}
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Chip label={link.category || 'Uncategorized'} size="small" color="primary" />
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                startIcon={<i className="material-icons">open_in_new</i>}
                                            >
                                                Visit
                                            </Button>
                                        </Box>
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
            <Modals.LinkModal open={modalOpen} onClose={handleModalClose} link={editLink} onSave={handleSaveLink} />
        </>
    );
};

export default Links;
