import React, { useState, useMemo } from 'react'
import useSchemaStore from '../../store/schemaStore'
import JsonViewer from './JsonViewer'
import TurtleViewer from './TurtleViewer'
import FormatDropdown from './FormatDropdown'
import SampleFileBrowser from './SampleFileBrowser'
import { convertToJsonLd, convertToTurtle } from '../../utils/rdfConverters'

function SamplePanel() {
  const { sampleResponse, openApiSchema } = useSchemaStore()
  const [mode, setMode] = useState('generated') // 'generated' or 'real'
  const [outputFormat, setOutputFormat] = useState('json') // 'json' | 'json-ld' | 'turtle'
  const [selectedFile, setSelectedFile] = useState(null)
  const [realData, setRealData] = useState(null)

  // Default example when no schema loaded
  const defaultSample = {
    identifier: "https://example.com/jobs/SOFTWARE-ENGINEER-001",
    enumType: "job",
    skill: [
      {
        id: "1",
        href: "https://api.hropen.org/skills/1",
        name: "Python Programming",
        description: "Proficiency in Python programming language",
        codeNotation: "GitHub",
        proficiencyLevel: "4",
        proficiencyScale: "https://example.com/proficiency-scales/4-level/"
      },
      {
        id: "2",
        href: "https://api.hropen.org/skills/2",
        name: "UX: JavaScript Management",
        description: "Database design and query optimization",
        codeNotation: "DB",
        proficiencyLevel: "3"
      }
    ]
  }

  const generatedData = Object.keys(sampleResponse).length > 0 ? sampleResponse : defaultSample
  const displayData = mode === 'real' && realData ? realData : generatedData

  const formattedOutput = useMemo(() => {
    if (outputFormat === 'json-ld') {
      return { type: 'json', data: convertToJsonLd(displayData, openApiSchema) }
    }
    if (outputFormat === 'turtle') {
      const jsonLd = convertToJsonLd(displayData, openApiSchema)
      return { type: 'turtle', text: convertToTurtle(jsonLd) }
    }
    return { type: 'json', data: displayData }
  }, [outputFormat, displayData, openApiSchema])

  const handleRegenerate = () => {
    const store = useSchemaStore.getState()
    store.updateFromSchema()
  }

  const handleFileSelect = (file, data) => {
    setSelectedFile(file)
    setRealData(data)
    setMode('real')
  }

  const handleCopy = () => {
    const text = formattedOutput.type === 'turtle'
      ? formattedOutput.text
      : JSON.stringify(formattedOutput.data, null, 2)
    navigator.clipboard.writeText(text)
  }

  const copyLabel = outputFormat === 'turtle'
    ? 'Copy TTL'
    : outputFormat === 'json-ld'
      ? 'Copy JSON-LD'
      : 'Copy JSON'

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Mode Toggle */}
      <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2">
        <button
          className={`text-xs px-3 py-1.5 rounded transition-colors ${
            mode === 'generated'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setMode('generated')}
        >
          Generated
        </button>
        <button
          className={`text-xs px-3 py-1.5 rounded transition-colors ${
            mode === 'real'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setMode('real')}
        >
          Real Data
        </button>
      </div>

      {/* File Browser (when in real mode) */}
      {mode === 'real' && (
        <div className="px-4 py-2 border-b border-gray-200">
          <SampleFileBrowser
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
          />
        </div>
      )}

      {/* Action Bar */}
      <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {mode === 'real'
            ? selectedFile
              ? `Viewing: ${selectedFile.name}`
              : 'Select a file above'
            : 'Auto-generated from schema'}
        </span>
        <div className="flex gap-2 items-center">
          <FormatDropdown value={outputFormat} onChange={setOutputFormat} />
          {mode === 'generated' && (
            <button
              className="text-xs px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
              onClick={handleRegenerate}
              title="Regenerate sample with new random values"
            >
              ↻ Regenerate
            </button>
          )}
          <button
            className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            onClick={handleCopy}
          >
            {copyLabel}
          </button>
        </div>
      </div>

      {/* Display */}
      <div className="flex-1 overflow-hidden">
        {mode === 'real' && !realData ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-3">📁</div>
              <div className="text-sm">Select a sample file to view</div>
              <div className="text-xs mt-1 text-gray-400">223 files available</div>
            </div>
          </div>
        ) : formattedOutput.type === 'turtle' ? (
          <TurtleViewer text={formattedOutput.text} />
        ) : (
          <JsonViewer data={formattedOutput.data} />
        )}
      </div>
    </div>
  )
}

export default SamplePanel
