import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, type Node, type Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEffect } from 'react'

export default function NoteMindMap({ html, title }: { html: string, title: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    
    const rootNode: Node = {
      id: 'root',
      type: 'default',
      data: { label: title || 'Untitled Note' },
      position: { x: 0, y: 0 },
      style: { background: 'var(--accent-purple)', color: 'white', fontWeight: 600, border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 14 }
    }

    let initialNodes: Node[] = [rootNode]
    let initialEdges: Edge[] = []

    let lastIds: Record<number, string | null> = { 0: 'root' }
    
    let yPos = 100
    
    headings.forEach((h, index) => {
      const level = parseInt(h.tagName.substring(1))
      const id = `node-${index}`
      const text = h.textContent || 'Empty Heading'
      
      let parentLevel = level - 1
      while (parentLevel > 0 && !lastIds[parentLevel]) {
        parentLevel--
      }
      const parentId = lastIds[parentLevel] || 'root'
      
      initialNodes.push({
        id,
        type: 'default',
        data: { label: text },
        position: { x: level * 200, y: yPos },
        style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', fontSize: 13, fontFamily: 'var(--font-sans)' }
      })
      
      initialEdges.push({
        id: `e-${parentId}-${id}`,
        source: parentId,
        target: id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'var(--text-muted)' },
      })
      
      lastIds[level] = id
      for (let i = level + 1; i <= 6; i++) {
        lastIds[i] = null
      }
      yPos += 70
    })

    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [html, title, setNodes, setEdges])

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 200px)', minHeight: '600px', background: 'var(--bg-surface)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        colorMode="dark"
        minZoom={0.2}
      >
        <Background gap={24} size={2} color="var(--border)" />
        <Controls showInteractive={false} style={{ fill: 'var(--text-primary)', color: 'var(--text-primary)' }} />
      </ReactFlow>
    </div>
  )
}
