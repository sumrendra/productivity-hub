import express from 'express'
import * as cheerio from 'cheerio'

export default function createLinksRouter(pool) {
  const router = express.Router()

  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM links WHERE workspace_id = $1 ORDER BY created_at DESC',
        [req.workspaceId],
      )
      res.json(rows)
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.post('/', async (req, res) => {
    const { title, url, description = '', category = '', tags = [], collection = '', favicon = '', og_image = '' } = req.body
    try {
      const { rows } = await pool.query(
        `INSERT INTO links (title, url, description, category, tags, collection, favicon, og_image, visit_count, workspace_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9, NOW()) RETURNING *`,
        [title, url, description, category, tags, collection, favicon, og_image, req.workspaceId],
      )
      res.status(201).json(rows[0])
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.put('/:id', async (req, res) => {
    const { title, url, description, category, tags, collection, favicon, og_image } = req.body
    try {
      const { rows } = await pool.query(
        `UPDATE links SET title=$1, url=$2, description=$3, category=$4, tags=$5, collection=$6, favicon=$7, og_image=$8
         WHERE id=$9 AND workspace_id=$10 RETURNING *`,
        [title, url, description, category, tags, collection, favicon, og_image, req.params.id, req.workspaceId],
      )
      if (!rows[0]) return res.status(404).json({ error: 'Not found' })
      res.json(rows[0])
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.patch('/:id/visit', async (req, res) => {
    try {
      const { rows } = await pool.query(
        `UPDATE links SET visit_count = visit_count + 1 WHERE id=$1 AND workspace_id=$2 RETURNING *`,
        [req.params.id, req.workspaceId],
      )
      if (!rows[0]) return res.status(404).json({ error: 'Not found' })
      res.json(rows[0])
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query(
        'DELETE FROM links WHERE id = $1 AND workspace_id = $2',
        [req.params.id, req.workspaceId],
      )
      if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' })
      res.status(204).end()
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.post('/fetch-metadata', async (req, res) => {
    const { url } = req.body
    if (!url) return res.status(400).json({ error: 'URL required' })
    try {
      const { default: fetch } = await import('node-fetch')
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FlowSpace/1.0)' },
        signal: AbortSignal.timeout(8000),
      })
      const html = await response.text()
      const $ = cheerio.load(html)
      const meta = {
        title: $('meta[property="og:title"]').attr('content') || $('title').text() || url,
        description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '',
        og_image: $('meta[property="og:image"]').attr('content') || null,
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`,
      }
      res.json(meta)
    } catch {
      res.json({ title: url, description: '', og_image: null, favicon: null })
    }
  })

  return router
}
