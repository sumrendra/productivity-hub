import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node'
import { pool } from '../db/index.js'
import { bootstrapDatabase } from '../db/bootstrap.js'
import { auth } from './auth.js'
import { requireAuth, getUserWorkspaces, type AuthedRequest } from './middleware/auth.js'

import notesRouter from '../routes/notes.js'
import tasksRouter from '../routes/tasks.js'
import linksRouter from '../routes/links.js'
import financeRouter from '../routes/finance.js'
import aiRouter from '../routes/ai.js'
import settingsRouter from '../routes/settings.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3070
const appURL = process.env.APP_URL || 'http://localhost:5173'

app.use(
  cors({
    origin: [appURL, process.env.BETTER_AUTH_URL || `http://localhost:${PORT}`],
    credentials: true,
  }),
)

// Better Auth must be mounted before express.json()
app.all('/api/auth/*', toNodeHandler(auth))

app.use(express.json())

// Public health check
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Database unavailable',
      timestamp: new Date().toISOString(),
    })
  }
})

// Session + workspace info for the client
app.get('/api/me', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })
    const workspaces = await getUserWorkspaces(req.userId!)
    res.json({
      user: session?.user ?? null,
      workspaceId: req.workspaceId,
      workspaces,
    })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to load session' })
  }
})

// Protected API routes
app.use('/api/notes', requireAuth, notesRouter(pool))
app.use('/api/tasks', requireAuth, tasksRouter(pool))
app.use('/api/links', requireAuth, linksRouter(pool))
app.use('/api/expenses', requireAuth, financeRouter(pool))
app.use('/api/ai', requireAuth, aiRouter(pool))
app.use('/api/settings', requireAuth, settingsRouter(pool))

app.get('/api/dashboard/summary', requireAuth, async (req: AuthedRequest, res) => {
  const workspaceId = req.workspaceId!
  try {
    const [notes, tasks, expenses, links] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM notes WHERE workspace_id = $1', [workspaceId]),
      pool.query("SELECT COUNT(*) FROM tasks WHERE workspace_id = $1 AND status != 'done'", [workspaceId]),
      pool.query('SELECT type, SUM(amount) as total FROM expenses WHERE workspace_id = $1 GROUP BY type', [workspaceId]),
      pool.query('SELECT COUNT(*) FROM links WHERE workspace_id = $1', [workspaceId]),
    ])
    const income = expenses.rows.find((r) => r.type === 'income')?.total || 0
    const expense = expenses.rows.find((r) => r.type === 'expense')?.total || 0
    res.json({
      notes_count: parseInt(notes.rows[0].count, 10),
      active_tasks_count: parseInt(tasks.rows[0].count, 10),
      net_balance: parseFloat(income) - parseFloat(expense),
      links_count: parseInt(links.rows[0].count, 10),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Request failed'
    res.status(500).json({ error: message })
  }
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'))
  })
}

bootstrapDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`FlowSpace running on :${PORT}`)
      console.log(`Auth: ${process.env.BETTER_AUTH_URL || `http://localhost:${PORT}`}/api/auth`)
      console.log(`Signup: ${process.env.ENABLE_SIGNUP !== 'false' ? 'enabled' : 'disabled'}`)
    })
  })
  .catch((err) => {
    console.error('DB bootstrap failed:', err)
    process.exit(1)
  })
