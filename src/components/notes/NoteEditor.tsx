import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/shadcn'
import '@blocknote/shadcn/style.css'
import { useEffect, useState } from 'react'

export default function NoteEditor({ 
  initialHtml, 
  onChange,
}: { 
  initialHtml: string, 
  onChange: (html: string) => void,
}) {
  const [ready, setReady] = useState(false)
  const editor = useCreateBlockNote()

  useEffect(() => {
    async function load() {
      if (initialHtml) {
        try {
          const blocks = await editor.tryParseHTMLToBlocks(initialHtml)
          editor.replaceBlocks(editor.document, blocks)
        } catch (e) {
          console.error("Failed to parse initial HTML for BlockNote:", e)
        }
      }
      setReady(true)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Mount only

  if (!ready) {
    return (
      <div style={{ padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
        Loading editor...
      </div>
    )
  }

  return (
    <div className="flowspace-blocknote-wrapper" style={{ padding: '0 10px', minHeight: '60vh' }}>
      <BlockNoteView 
        editor={editor} 
        theme="dark"
        onChange={async () => {
          const html = await editor.blocksToHTMLLossy(editor.document)
          onChange(html)
        }} 
      />
    </div>
  )
}
