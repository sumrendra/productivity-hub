import { useCallback, useRef, useState } from 'react'

type SaveStatus = 'idle' | 'saving' | 'saved'

export function useAutoSave(saveFn: (content: string) => Promise<void>, delay = 2000) {
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const [status, setStatus] = useState<SaveStatus>('idle')

  const debouncedSave = useCallback(
    (content: string) => {
      setStatus('saving')
      clearTimeout(timer.current)
      timer.current = setTimeout(async () => {
        try {
          await saveFn(content)
          setStatus('saved')
          setTimeout(() => setStatus('idle'), 2000)
        } catch {
          setStatus('idle')
        }
      }, delay)
    },
    [saveFn, delay]
  )

  return { debouncedSave, status }
}
