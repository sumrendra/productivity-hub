import express from 'express'
import { GoogleGenAI } from '@google/genai'

export default function createAiRouter(pool) {
  const router = express.Router()
  const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null
  const ws = (req) => req.workspaceId

  async function getModel() {
    return 'gemini-2.0-flash'
  }

  async function generate(prompt, systemInstruction = '') {
    if (!ai) throw new Error('AI is not configured. Add GEMINI_API_KEY to your environment.')
    try {
      const model = await getModel()
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        ...(systemInstruction && { config: { systemInstruction } }),
      })
      return response.text
    } catch (e) {
      throw new Error(`AI unavailable: ${e.message}`)
    }
  }

  router.post('/daily-brief', async (req, res) => {
    try {
      const workspaceId = ws(req)
      const [tasks, notes, expenses] = await Promise.all([
        pool.query(
          "SELECT title, status, due_date FROM tasks WHERE workspace_id = $1 AND status != 'done' ORDER BY due_date ASC LIMIT 10",
          [workspaceId],
        ),
        pool.query(
          'SELECT title FROM notes WHERE workspace_id = $1 ORDER BY updated_at DESC LIMIT 5',
          [workspaceId],
        ),
        pool.query(
          "SELECT SUM(CASE WHEN type='income' THEN amount ELSE -amount END) as net FROM expenses WHERE workspace_id = $1 AND date >= NOW() - INTERVAL '30 days'",
          [workspaceId],
        ),
      ])
      const prompt = `
You are a personal assistant for a productivity app. Write a friendly 3-4 sentence daily brief.
Active tasks: ${JSON.stringify(tasks.rows)}
Recent notes: ${notes.rows.map((n) => n.title).join(', ')}
Net balance (30 days): ${expenses.rows[0]?.net || 0}
Be concise, motivating, and mention what needs attention today.`
      const brief = await generate(prompt)
      res.json({ brief })
    } catch (e) { res.status(500).json({ error: e.message, brief: null }) }
  })

  router.post('/summarize-note', async (req, res) => {
    const { noteId } = req.body
    try {
      const { rows } = await pool.query(
        'SELECT content FROM notes WHERE id = $1 AND workspace_id = $2',
        [noteId, ws(req)],
      )
      if (!rows[0]) return res.status(404).json({ error: 'Note not found' })
      const summary = await generate(`Summarize this note in 2-3 sentences:\n\n${rows[0].content}`)
      res.json({ summary })
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.post('/expand-note', async (req, res) => {
    const { content, prompt } = req.body
    try {
      const expanded = await generate(`${prompt || 'Expand this text with more detail'}:\n\n${content}`)
      res.json({ expanded })
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.post('/breakdown-task', async (req, res) => {
    const { taskTitle } = req.body
    try {
      const result = await generate(
        `Break down this task into 3-5 specific subtasks. Return ONLY a JSON array of objects with a "title" field. No explanation.\nTask: "${taskTitle}"`,
      )
      const subtasks = JSON.parse(result.replace(/```json\n?|\n?```/g, '').trim())
      res.json({ subtasks })
    } catch (e) { res.status(500).json({ error: e.message, subtasks: [] }) }
  })

  router.post('/finance-insight', async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT category, type, SUM(amount) as total
        FROM expenses
        WHERE workspace_id = $1 AND date >= date_trunc('month', NOW())
        GROUP BY category, type ORDER BY total DESC`,
        [ws(req)],
      )
      const insight = await generate(
        `Write a 2-3 sentence financial insight based on this month's data: ${JSON.stringify(rows)}. Mention the top expense category and whether spending is on track.`,
      )
      res.json({ insight })
    } catch (e) { res.status(500).json({ error: e.message }) }
  })

  router.post('/chat', async (req, res) => {
    const { message, history = [], sessionId } = req.body
    const workspaceId = ws(req)
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    try {
      if (!ai) throw new Error('AI is not configured. Add GEMINI_API_KEY to your environment.')

      if (sessionId) {
        await pool.query(
          'INSERT INTO ai_conversations (session_id, role, content, workspace_id) VALUES ($1, $2, $3, $4)',
          [sessionId, 'user', message, workspaceId],
        )
      }

      const model = await getModel()
      const contents = [
        ...history.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
        { role: 'user', parts: [{ text: message }] },
      ]

      const stream = await ai.models.generateContentStream({ model, contents })
      let fullResponse = ''

      for await (const chunk of stream) {
        const text = chunk.text
        if (text) {
          fullResponse += text
          res.write(`data: ${JSON.stringify({ text })}\n\n`)
        }
      }

      if (sessionId) {
        await pool.query(
          'INSERT INTO ai_conversations (session_id, role, content, workspace_id) VALUES ($1, $2, $3, $4)',
          [sessionId, 'model', fullResponse, workspaceId],
        )
      }

      res.write('data: [DONE]\n\n')
      res.end()
    } catch (e) {
      res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`)
      res.end()
    }
  })

  return router
}
