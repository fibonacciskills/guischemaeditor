import React, { useCallback, useMemo, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow'
import { toPng } from 'html-to-image'
import 'reactflow/dist/style.css'
import useSchemaStore from '../../store/schemaStore'
import SchemaNode from './nodes/SchemaNode'
import PropertyNode from './nodes/PropertyNode'
import NodeEditor from './NodeEditor'

function FlowchartPanel() {
  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes,
    setEdges,
    updateFromNodes
  } = useSchemaStore()
  const [nodes, setLocalNodes, onNodesChange] = useNodesState(storeNodes)
  const [edges, setLocalEdges, onEdgesChange] = useEdgesState(storeEdges)
  const [editingNode, setEditingNode] = useState(null)
  const [selectedNodes, setSelectedNodes] = useState([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef(null)

  // Update local nodes when store changes
  React.useEffect(() => {
    setLocalNodes(storeNodes)
  }, [storeNodes, setLocalNodes])

  // Update local edges when store changes
  React.useEffect(() => {
    setLocalEdges(storeEdges)
  }, [storeEdges, setLocalEdges])

  // Custom node types
  const nodeTypes = useMemo(
    () => ({
      schemaNode: SchemaNode,
      propertyNode: PropertyNode,
    }),
    []
  )

  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge(params, edges)
      setLocalEdges(newEdges)
      // Sync to store
      setEdges(newEdges)
      // Trigger schema update
      setTimeout(() => updateFromNodes(), 500)
    },
    [edges, setLocalEdges, setEdges, updateFromNodes]
  )

  // Handle node double-click to edit
  const onNodeDoubleClick = useCallback((event, node) => {
    setEditingNode(node)
  }, [])

  // Save edited node
  const handleSaveNode = useCallback((formData) => {
    setLocalNodes((nds) =>
      nds.map((node) => {
        if (node.id === editingNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: formData.label,
              description: formData.description,
              type: formData.type,
              required: formData.required,
              // Update schemaName or propertyName based on node type
              ...(node.type === 'schemaNode' ? { schemaName: formData.label } : {}),
              ...(node.type === 'propertyNode' ? { propertyName: formData.label } : {}),
            },
          }
        }
        return node
      })
    )

    // Sync to store after editing
    setTimeout(() => {
      const updatedNodes = nodes.map((node) => {
        if (node.id === editingNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: formData.label,
              description: formData.description,
              type: formData.type,
              required: formData.required,
              ...(node.type === 'schemaNode' ? { schemaName: formData.label } : {}),
              ...(node.type === 'propertyNode' ? { propertyName: formData.label } : {}),
            },
          }
        }
        return node
      })
      setNodes(updatedNodes)
      // Trigger schema update
      setTimeout(() => updateFromNodes(), 200)
    }, 100)

    setEditingNode(null)
  }, [editingNode, nodes, setLocalNodes, setNodes, updateFromNodes])

  // Delete selected nodes
  const handleDeleteNodes = useCallback(() => {
    if (selectedNodes.length === 0) return

    setLocalNodes((nds) => nds.filter((node) => !selectedNodes.includes(node.id)))
    setLocalEdges((eds) =>
      eds.filter((edge) =>
        !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target)
      )
    )

    // Sync to store
    setTimeout(() => {
      const newNodes = nodes.filter((node) => !selectedNodes.includes(node.id))
      const newEdges = edges.filter((edge) =>
        !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target)
      )
      setNodes(newNodes)
      setEdges(newEdges)
      setSelectedNodes([])
      // Trigger schema update
      setTimeout(() => updateFromNodes(), 200)
    }, 100)
  }, [selectedNodes, nodes, edges, setLocalNodes, setLocalEdges, setNodes, setEdges, updateFromNodes])

  // Add new schema node
  const handleAddSchemaNode = useCallback(() => {
    const newNode = {
      id: `schema-${Date.now()}`,
      type: 'schemaNode',
      position: { x: 100, y: 100 + (nodes.length * 50) },
      data: {
        label: 'NewSchema',
        schemaName: 'NewSchema',
        description: '',
        type: 'object',
        properties: {}
      }
    }
    setLocalNodes((nds) => [...nds, newNode])
    const updatedNodes = [...nodes, newNode]
    setNodes(updatedNodes)
    // Trigger schema update
    setTimeout(() => updateFromNodes(), 200)
  }, [nodes, setLocalNodes, setNodes, updateFromNodes])

  // Add new property node
  const handleAddPropertyNode = useCallback(() => {
    const newNode = {
      id: `prop-${Date.now()}`,
      type: 'propertyNode',
      position: { x: 400, y: 100 + (nodes.length * 50) },
      data: {
        label: 'newProperty',
        propertyName: 'newProperty',
        type: 'string',
        required: false,
        description: ''
      }
    }
    setLocalNodes((nds) => [...nds, newNode])
    const updatedNodes = [...nodes, newNode]
    setNodes(updatedNodes)
    // Trigger schema update
    setTimeout(() => updateFromNodes(), 200)
  }, [nodes, setLocalNodes, setNodes, updateFromNodes])

  // Handle selection change
  const onSelectionChange = useCallback((params) => {
    setSelectedNodes(params.nodes.map(n => n.id))
  }, [])

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete key or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodes.length > 0) {
        e.preventDefault()
        handleDeleteNodes()
      }
      // Escape exits fullscreen
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodes, handleDeleteNodes, isFullscreen])

  // Export flowchart as PNG
  const handleExportPng = useCallback(() => {
    const viewport = containerRef.current?.querySelector('.react-flow__viewport')
    if (!viewport) return

    toPng(viewport, {
      backgroundColor: '#f9fafb',
      pixelRatio: 2,
    }).then((dataUrl) => {
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'schema-mapping.png'
      a.click()
    }).catch((err) => {
      console.error('Failed to export PNG:', err)
    })
  }, [])

  const toolbar = (
    <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={handleAddSchemaNode}
          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded shadow hover:bg-blue-600 transition-colors"
          title="Add Schema Node"
        >
          + Schema
        </button>
        <button
          onClick={handleAddPropertyNode}
          className="px-3 py-1.5 bg-green-500 text-white text-sm rounded shadow hover:bg-green-600 transition-colors"
          title="Add Property Node"
        >
          + Property
        </button>
        {selectedNodes.length > 0 && (
          <button
            onClick={handleDeleteNodes}
            className="px-3 py-1.5 bg-red-500 text-white text-sm rounded shadow hover:bg-red-600 transition-colors"
            title="Delete Selected (Del/Backspace)"
          >
            Delete ({selectedNodes.length})
          </button>
        )}
        <button
          onClick={() => setIsFullscreen((f) => !f)}
          className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded shadow hover:bg-gray-800 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen'}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
        <button
          onClick={handleExportPng}
          className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded shadow hover:bg-purple-600 transition-colors"
          title="Export as PNG"
        >
          Export PNG
        </button>
      </div>
      {!isFullscreen && (
        <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg max-w-xs">
          <div className="font-semibold mb-1">Quick Guide:</div>
          <div>• Double-click nodes to edit</div>
          <div>• Drag to connect nodes</div>
          <div>• Select & press Del to delete</div>
          <div>• Changes sync to schema</div>
        </div>
      )}
    </div>
  )

  const flowContent = (
    <div ref={containerRef} className="w-full h-full bg-gray-50 relative">
      {toolbar}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        deleteKeyCode={null}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'schemaNode') return '#93C5FD'
            return '#86EFAC'
          }}
          className="bg-gray-100"
        />
      </ReactFlow>

      {editingNode && (
        <NodeEditor
          node={editingNode}
          onSave={handleSaveNode}
          onClose={() => setEditingNode(null)}
        />
      )}
    </div>
  )

  if (isFullscreen) {
    return (
      <>
        {/* Keep a placeholder in the layout */}
        <div className="w-full h-full bg-gray-50" />
        {createPortal(
          <div className="fixed inset-0 z-50">
            <ReactFlowProvider>
              {flowContent}
            </ReactFlowProvider>
          </div>,
          document.body
        )}
      </>
    )
  }

  return flowContent
}

export default FlowchartPanel
