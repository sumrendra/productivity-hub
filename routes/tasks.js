import express from 'express'

export default function createTasksRouter(pool) {
  const router = express.Router()

  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM tasks WHERE workspace_id = $1 ORDER BY created_at DESC',
        [req.workspaceId],
      )
      res.json(rows)
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.get('/:id', async (req, res) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM tasks WHERE id = $1 AND workspace_id = $2',
        [req.params.id, req.workspaceId],
      )
      if (!rows[0]) return res.status(404).json({ error: 'Not found' })
      res.json(rows[0])
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.post('/', async (req, res) => {
    const { title, description = '', status = 'todo', priority = 'p2', due_date, assignee, subtasks = [], project } = req.body
    try {
      const { rows } = await pool.query(
        `INSERT INTO tasks (title, description, status, priority, due_date, assignee, subtasks, project, workspace_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING *`,
        [title, description, status, priority, due_date || null, assignee || null, JSON.stringify(subtasks), project || null, req.workspaceId],
      )
      res.status(201).json(rows[0])
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.put('/:id', async (req, res) => {
    const { title, description, status, priority, due_date, assignee, subtasks, project } = req.body
    try {
      const { rows } = await pool.query(
        `UPDATE tasks SET title=$1, description=$2, status=$3, priority=$4,
         due_date=$5, assignee=$6, subtasks=$7, project=$8, updated_at=NOW()
         WHERE id=$9 AND workspace_id=$10 RETURNING *`,
        [title, description, status, priority, due_date || null, assignee || null, JSON.stringify(subtasks || []), project || null, req.params.id, req.workspaceId],
      )
      if (!rows[0]) return res.status(404).json({ error: 'Not found' })
      res.json(rows[0])
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.patch('/:id/status', async (req, res) => {
    const { status } = req.body
    try {
      const { rows } = await pool.query(
        `UPDATE tasks SET status=$1, updated_at=NOW() WHERE id=$2 AND workspace_id=$3 RETURNING *`,
        [status, req.params.id, req.workspaceId],
      )
      if (!rows[0]) return res.status(404).json({ error: 'Not found' })
      res.json(rows[0])
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query(
        'DELETE FROM tasks WHERE id = $1 AND workspace_id = $2',
        [req.params.id, req.workspaceId],
      )
      if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
      res.status(204).end()
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  return router
}
