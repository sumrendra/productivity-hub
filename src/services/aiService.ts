// AI service — streaming chat and one-shot AI calls
// Full implementation in Phase 4

export async function* streamChat(
  message: string,
  history: { role: string; content: string }[],
  sessionId: string
): AsyncGenerator<string> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, sessionId }),
  })

  if (!response.body) throw new Error('No response body')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') return
        try {
          const parsed = JSON.parse(data)
          if (parsed.text) yield parsed.text
          if (parsed.error) throw new Error(parsed.error)
        } catch {
          // skip malformed chunks
        }
      }
    }
  }
}
