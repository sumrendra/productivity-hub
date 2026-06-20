import express from 'express'

export default function createNotesRouter(pool) {
  const router = express.Router()

  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM notes WHERE workspace_id = $1 ORDER BY is_pinned DESC, updated_at DESC',
        [req.workspaceId],
      )
      res.json(rows)
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.get('/:id', async (req, res) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM notes WHERE id = $1 AND workspace_id = $2',
        [req.params.id, req.workspaceId],
      )
      if (!rows[0]) return res.status(404).json({ error: 'Not found' })
      res.json(rows[0])
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.post('/', async (req, res) => {
    const { title, content = '', category = 'Personal', tags = [], color = 'default' } = req.body
    try {
      const { rows } = await pool.query(
        `INSERT INTO notes (title, content, category, tags, color, workspace_id, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
        [title, content, category, tags, color, req.workspaceId],
      )
      res.status(201).json(rows[0])
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.put('/:id', async (req, res) => {
    const { title, content, category, tags, is_pinned, color } = req.body
    try {
      const { rows } = await pool.query(
        `UPDATE notes SET title=$1, content=$2, category=$3, tags=$4,
         is_pinned=$5, color=$6, updated_at=NOW()
         WHERE id=$7 AND workspace_id=$8 RETURNING *`,
        [title, content, category, tags, is_pinned, color, req.params.id, req.workspaceId],
      )
      if (!rows[0]) return res.status(404).json({ error: 'Not found' })
      res.json(rows[0])
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query(
        'DELETE FROM notes WHERE id = $1 AND workspace_id = $2',
        [req.params.id, req.workspaceId],
      )
      if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
      res.status(204).end()
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  return router
}
