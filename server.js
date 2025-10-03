const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection with better error handling
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
});

// Test database connection
pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Database connection error:', err);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files only in production mode
if (process.env.NODE_ENV === 'production') {
    // Configure MIME types for JSX files
    app.use((req, res, next) => {
        if (req.url.endsWith('.jsx')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
        next();
    });
    
    app.use(express.static(path.join(__dirname, 'dist')));
}

// Database initialization
async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notes (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                category VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                tags TEXT[]
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS links (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                url TEXT NOT NULL,
                category VARCHAR(100),
                description TEXT,
                tags TEXT[]
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'todo',
                assignee VARCHAR(100),
                description TEXT,
                due_date DATE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS expenses (
                id SERIAL PRIMARY KEY,
                description VARCHAR(255) NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                category VARCHAR(100),
                date DATE DEFAULT CURRENT_DATE,
                type VARCHAR(20) DEFAULT 'expense'
            )
        `);

        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

// Routes

// Notes API
app.get('/api/notes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notes ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

app.post('/api/notes', async (req, res) => {
    try {
        const { title, content, category, tags } = req.body;
        const result = await pool.query(
            'INSERT INTO notes (title, content, category, tags) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, content, category, tags]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
});

app.put('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category, tags } = req.body;
        const result = await pool.query(
            'UPDATE notes SET title = $1, content = $2, category = $3, tags = $4 WHERE id = $5 RETURNING *',
            [title, content, category, tags, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

app.delete('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM notes WHERE id = $1', [id]);
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

// Links API
app.get('/api/links', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM links ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching links:', error);
        res.status(500).json({ error: 'Failed to fetch links' });
    }
});

app.post('/api/links', async (req, res) => {
    try {
        const { title, url, category, description, tags } = req.body;
        const result = await pool.query(
            'INSERT INTO links (title, url, category, description, tags) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, url, category, description, tags]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating link:', error);
        res.status(500).json({ error: 'Failed to create link' });
    }
});

app.put('/api/links/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, url, category, description, tags } = req.body;
        const result = await pool.query(
            'UPDATE links SET title = $1, url = $2, category = $3, description = $4, tags = $5 WHERE id = $6 RETURNING *',
            [title, url, category, description, tags, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating link:', error);
        res.status(500).json({ error: 'Failed to update link' });
    }
});

app.delete('/api/links/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM links WHERE id = $1', [id]);
        res.json({ message: 'Link deleted successfully' });
    } catch (error) {
        console.error('Error deleting link:', error);
        res.status(500).json({ error: 'Failed to delete link' });
    }
});

// Tasks API
app.get('/api/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY due_date ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

app.post('/api/tasks', async (req, res) => {
    try {
        const { title, status, assignee, description, due_date } = req.body;
        const result = await pool.query(
            'INSERT INTO tasks (title, status, assignee, description, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, status, assignee, description, due_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

app.put('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, status, assignee, description, due_date } = req.body;
        const result = await pool.query(
            'UPDATE tasks SET title = $1, status = $2, assignee = $3, description = $4, due_date = $5 WHERE id = $6 RETURNING *',
            [title, status, assignee, description, due_date, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Expenses API
app.get('/api/expenses', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM expenses ORDER BY date DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

app.post('/api/expenses', async (req, res) => {
    try {
        const { description, amount, category, date, type } = req.body;
        const result = await pool.query(
            'INSERT INTO expenses (description, amount, category, date, type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [description, amount, category, date, type]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

app.put('/api/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { description, amount, category, date, type } = req.body;
        const result = await pool.query(
            'UPDATE expenses SET description = $1, amount = $2, category = $3, date = $4, type = $5 WHERE id = $6 RETURNING *',
            [description, amount, category, date, type, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Failed to update expense' });
    }
});

app.delete('/api/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files in production only
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
} else {
    // In development, just show API status
    app.get('/', (req, res) => {
        res.json({ 
            message: 'ProductivePro API Server',
            status: 'running',
            environment: 'development',
            frontend: 'http://localhost:3001',
            apiEndpoints: [
                'GET /api/health',
                'GET /api/notes',
                'GET /api/links',
                'GET /api/tasks',
                'GET /api/expenses'
            ]
        });
    });
}

// Start server
async function startServer() {
    try {
        await initDatabase();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Database tables initialized and server ready`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
