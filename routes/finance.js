import express from 'express'

export default function createFinanceRouter(pool) {
  const router = express.Router()

  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM expenses WHERE workspace_id = $1 ORDER BY date DESC, created_at DESC',
        [req.workspaceId],
      )
      res.json(rows)
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.get('/summary', async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT 
          date_trunc('month', date) as month,
          type,
          SUM(amount) as total
        FROM expenses 
        WHERE workspace_id = $1
        GROUP BY month, type 
        ORDER BY month DESC`,
        [req.workspaceId],
      )
      res.json(rows)
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.post('/', async (req, res) => {
    const { description, amount, category, type = 'expense', date, notes = '' } = req.body
    try {
      const { rows } = await pool.query(
        `INSERT INTO expenses (description, amount, category, type, date, notes, workspace_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
        [description, amount, category, type, date, notes, req.workspaceId],
      )
      res.status(201).json(rows[0])
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.put('/:id', async (req, res) => {
    const { description, amount, category, type, date, notes } = req.body
    try {
      const { rows } = await pool.query(
        `UPDATE expenses SET description=$1, amount=$2, category=$3, type=$4, date=$5, notes=$6
         WHERE id=$7 AND workspace_id=$8 RETURNING *`,
        [description, amount, category, type, date, notes, req.params.id, req.workspaceId],
      )
      if (!rows[0]) return res.status(404).json({ error: 'Not found' })
      res.json(rows[0])
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query(
        'DELETE FROM expenses WHERE id = $1 AND workspace_id = $2',
        [req.params.id, req.workspaceId],
      )
      if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
      res.status(204).end()
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  return router
}
