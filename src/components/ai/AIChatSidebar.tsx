import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Sparkles, Send, Trash2 } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

interface Message {
  role: 'user' | 'model'
  content: string
  streaming?: boolean
}

const QUICK_PROMPTS = ["What's overdue?", "Summarize my week", "What should I focus on?"]

const SESSION_ID =
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : '00000000-0000-0000-0000-000000000000'

export default function AIChatSidebar() {
  const { aiChatOpen, toggleAIChat } = useUIStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return
      const userMsg: Message = { role: 'user', content: text.trim() }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setIsStreaming(true)
      setMessages((prev) => [...prev, { role: 'model', content: '', streaming: true }])

      try {
        const history = messages.map((m) => ({ role: m.role, content: m.content }))
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text.trim(), history, sessionId: SESSION_ID }),
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
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                setMessages((prev) => {
                  const next = [...prev]
                  const last = next[next.length - 1]
                  if (last?.role === 'model') {
                    next[next.length - 1] = {
                      ...last,
                      content: last.content + parsed.text,
                      streaming: true,
                    }
                  }
                  return next
                })
              }
              if (parsed.error) throw new Error(parsed.error)
            } catch {
              /* partial chunk */
            }
          }
        }
      } catch {
        setMessages((prev) => {
          const next = [...prev]
          const last = next[next.length - 1]
          if (last?.role === 'model') {
            next[next.length - 1] = {
              ...last,
              content: 'Something went wrong. Try again.',
              streaming: false,
            }
          }
          return next
        })
      } finally {
        setMessages((prev) =>
          prev.map((m, i) => (i === prev.length - 1 ? { ...m, streaming: false } : m)),
        )
        setIsStreaming(false)
        setTimeout(() => textareaRef.current?.focus(), 50)
      }
    },
    [messages, isStreaming],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <AnimatePresence>
      {aiChatOpen && (
        <motion.aside
          className="fs-ai-panel"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          aria-label="AI assistant"
        >
          <div className="fs-ai-panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-ai-muted)',
                  color: 'var(--accent-ai)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Sparkles size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Assistant</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Gemini</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {messages.length > 0 && (
                <button
                  type="button"
                  className="fs-btn fs-btn--ghost fs-btn--icon"
                  onClick={() => setMessages([])}
                  title="Clear chat"
                  aria-label="Clear chat"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button
                type="button"
                className="fs-btn fs-btn--ghost fs-btn--icon"
                onClick={toggleAIChat}
                aria-label="Close assistant"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="fs-ai-messages">
            {messages.length === 0 ? (
              <>
                <p className="fs-ai-bubble fs-ai-bubble--model" style={{ maxWidth: '100%' }}>
                  Ask about your tasks, notes, or spending. I only see what is in this workspace.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="fs-palette-group-label">Suggestions</span>
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className="fs-btn fs-btn--secondary"
                      style={{ justifyContent: 'flex-start', height: 'auto', padding: '8px 12px' }}
                      onClick={() => sendMessage(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={msg.role === 'user' ? 'fs-ai-bubble fs-ai-bubble--user' : 'fs-ai-bubble fs-ai-bubble--model'}
                >
                  {msg.content}
                  {msg.streaming && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 5,
                        height: 12,
                        marginLeft: 4,
                        background: 'var(--accent-ai)',
                        borderRadius: 2,
                        verticalAlign: 'text-bottom',
                        animation: 'fs-blink 1s step-end infinite',
                      }}
                    />
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="fs-ai-composer">
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 8,
                padding: 8,
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                background: 'var(--bg-inset)',
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message…"
                rows={1}
                disabled={isStreaming}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                  resize: 'none',
                  fontFamily: 'var(--font-sans)',
                  lineHeight: 1.5,
                  maxHeight: 120,
                }}
              />
              <button
                type="button"
                className="fs-btn fs-btn--ai fs-btn--icon"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </div>
            <p style={{ fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', marginTop: 8 }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </motion.aside>
      )}
      <style>{`@keyframes fs-blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </AnimatePresence>
  )
}
