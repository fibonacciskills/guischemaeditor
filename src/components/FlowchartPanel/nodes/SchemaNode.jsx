import React from 'react'
import { Handle, Position } from 'reactflow'

function SchemaNode({ data, selected }) {
  return (
    <div className={`bg-blue-50 border-2 rounded-lg shadow-md min-w-[200px] transition-all cursor-pointer hover:shadow-lg ${
      selected ? 'border-blue-600 ring-2 ring-blue-300' : 'border-blue-400'
    }`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />

      <div className="px-4 py-3">
        <div className="font-bold text-blue-900 text-lg mb-1 flex items-center justify-between">
          {data.label}
          <span className="text-xs text-gray-400 ml-2" title="Double-click to edit">✏️</span>
        </div>
        {data.description && (
          <div className="text-xs text-gray-600 mb-2">{data.description}</div>
        )}
        <div className="text-xs text-gray-500">
          <span className="bg-blue-100 px-2 py-1 rounded">{data.type}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  )
}

export default SchemaNode
