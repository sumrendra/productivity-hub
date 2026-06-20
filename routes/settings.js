import express from 'express'

export default function createSettingsRouter(pool) {
  const router = express.Router()

  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query(
        'SELECT key, value FROM settings WHERE workspace_id = $1',
        [req.workspaceId],
      )
      const settings = rows.reduce((acc, row) => {
        acc[row.key] = row.value
        return acc
      }, {})
      res.json(settings)
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.put('/:key', async (req, res) => {
    const { value } = req.body
    const workspaceId = req.workspaceId
    const key = req.params.key
    try {
      const existing = await pool.query(
        'SELECT id FROM settings WHERE workspace_id = $1 AND key = $2',
        [workspaceId, key],
      )

      let rows
      if (existing.rows[0]) {
        const result = await pool.query(
          `UPDATE settings SET value = $1, updated_at = NOW()
           WHERE workspace_id = $2 AND key = $3 RETURNING *`,
          [JSON.stringify(value), workspaceId, key],
        )
        rows = result.rows
      } else {
        const result = await pool.query(
          `INSERT INTO settings (key, value, workspace_id, updated_at)
           VALUES ($1, $2, $3, NOW()) RETURNING *`,
          [key, JSON.stringify(value), workspaceId],
        )
        rows = result.rows
      }

      res.json({ [rows[0].key]: rows[0].value })
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  return router
}
