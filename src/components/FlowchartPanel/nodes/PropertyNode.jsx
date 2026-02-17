import React from 'react'
import { Handle, Position } from 'reactflow'

function PropertyNode({ data, selected }) {
  return (
    <div className={`bg-green-50 border-2 rounded shadow-sm min-w-[150px] transition-all cursor-pointer hover:shadow-md ${
      selected ? 'border-green-600 ring-2 ring-green-300' : 'border-green-400'
    }`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2" />

      <div className="px-3 py-2">
        <div className="font-semibold text-green-900 text-sm flex items-center justify-between">
          {data.label}
          <span className="text-xs text-gray-400" title="Double-click to edit">✏️</span>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          <span className="bg-green-100 px-2 py-0.5 rounded">{data.type}</span>
          {data.required && (
            <span className="ml-1 text-red-600" title="Required">*</span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2" />
    </div>
  )
}

export default PropertyNode
