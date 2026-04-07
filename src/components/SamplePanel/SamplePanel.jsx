import React, { useState, useMemo } from 'react'
import useSchemaStore from '../../store/schemaStore'
import JsonViewer from './JsonViewer'
import TurtleViewer from './TurtleViewer'
import FormatDropdown from './FormatDropdown'
import SampleFileBrowser from './SampleFileBrowser'
import { convertToJsonLd, convertToTurtle } from '../../utils/rdfConverters'
import { generateSampleWithAI } from '../../utils/aiGenerator'

function SamplePanel() {
  const { sampleResponse, openApiSchema, schemaYaml } = useSchemaStore()
  const [mode, setMode] = useState('generated') // 'generated' | 'real' | 'ai'
  const [outputFormat, setOutputFormat] = useState('json') // 'json' | 'json-ld' | 'turtle'
  const [selectedFile, setSelectedFile] = useState(null)
  const [realData, setRealData] = useState(null)
  const [aiData, setAiData] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)

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

  const displayData = useMemo(() => {
    if (mode === 'real' && realData) return realData
    if (mode === 'ai' && aiData) return aiData
    return generatedData
  }, [mode, realData, aiData, generatedData])

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

  const handleAiGenerate = async () => {
    if (!schemaYaml) {
      setAiError('No schema loaded. Please load an OpenAPI schema first.')
      setMode('ai')
      return
    }
    setAiLoading(true)
    setAiError(null)
    setMode('ai')
    try {
      const results = await generateSampleWithAI(schemaYaml, 3)
      // If Claude returned an array of examples, show the first one
      // but store all of them so we can cycle through
      setAiData(results.length === 1 ? results[0] : results)
    } catch (err) {
      setAiError(err.message)
    } finally {
      setAiLoading(false)
    }
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

  const statusLabel = useMemo(() => {
    if (mode === 'real') return selectedFile ? `Viewing: ${selectedFile.name}` : 'Select a file above'
    if (mode === 'ai') return aiLoading ? 'Generating with Claude...' : 'AI-generated examples'
    return 'Auto-generated from schema'
  }, [mode, selectedFile, aiLoading])

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
        <button
          className={`text-xs px-3 py-1.5 rounded transition-colors ${
            mode === 'ai'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setMode('ai')}
        >
          ✦ AI
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
        <span className="text-xs text-gray-500">{statusLabel}</span>
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
          {mode === 'ai' && (
            <button
              className="text-xs px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAiGenerate}
              disabled={aiLoading}
              title="Generate new examples with Claude"
            >
              {aiLoading ? '⟳ Generating...' : '✦ Generate'}
            </button>
          )}
          {!aiLoading && mode !== 'real' && (
            <button
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              onClick={handleCopy}
            >
              {copyLabel}
            </button>
          )}
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
        ) : mode === 'ai' && aiLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-3xl mb-3 animate-pulse">✦</div>
              <div className="text-sm font-medium text-purple-600">Claude is generating examples...</div>
              <div className="text-xs mt-1 text-gray-400">Analyzing schema and creating realistic data</div>
            </div>
          </div>
        ) : mode === 'ai' && aiError ? (
          <div className="flex items-center justify-center h-full px-6">
            <div className="text-center">
              <div className="text-3xl mb-3">⚠️</div>
              <div className="text-sm font-medium text-red-600 mb-2">Generation failed</div>
              <div className="text-xs text-gray-500 bg-red-50 border border-red-200 rounded p-3 text-left max-w-xs">
                {aiError}
              </div>
              <button
                className="mt-3 text-xs px-4 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors"
                onClick={handleAiGenerate}
              >
                ↻ Try again
              </button>
            </div>
          </div>
        ) : mode === 'ai' && !aiData ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-3">✦</div>
              <div className="text-sm font-medium">Generate examples with Claude</div>
              <div className="text-xs mt-1 text-gray-400 mb-4">
                Creates realistic sample data based on your OpenAPI schema
              </div>
              <button
                className="text-sm px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors"
                onClick={handleAiGenerate}
              >
                ✦ Generate Now
              </button>
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
