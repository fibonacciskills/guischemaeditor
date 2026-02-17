import React from 'react'
import FlowchartPanel from '../FlowchartPanel/FlowchartPanel'
import SchemaPanel from '../SchemaPanel/SchemaPanel'
import SamplePanel from '../SamplePanel/SamplePanel'

function ThreePanelLayout() {
  return (
    <div className="flex-1 grid grid-cols-3 gap-0 overflow-hidden">
      {/* Left Panel - Flowchart Editor */}
      <div className="border-r border-gray-300 flex flex-col">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <h2 className="text-lg font-semibold text-gray-700">Flowchart Editor</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <FlowchartPanel />
        </div>
      </div>

      {/* Middle Panel - OpenAPI Schema */}
      <div className="border-r border-gray-300 flex flex-col">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <h2 className="text-lg font-semibold text-gray-700">openAPI schema</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <SchemaPanel />
        </div>
      </div>

      {/* Right Panel - Sample API Response */}
      <div className="flex flex-col">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <h2 className="text-lg font-semibold text-gray-700">Sample API response</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <SamplePanel />
        </div>
      </div>
    </div>
  )
}

export default ThreePanelLayout
