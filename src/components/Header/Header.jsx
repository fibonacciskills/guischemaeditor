import React, { useRef } from 'react'
import useSchemaStore from '../../store/schemaStore'
import yaml from 'js-yaml'

function Header() {
  const { schemaYaml, loadSchema } = useSchemaStore()
  const fileInputRef = useRef(null)

  const handleLoadSchema = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      let content = e.target?.result
      if (typeof content === 'string') {
        // If it's JSON/jschema, convert to YAML for the editor
        if (file.name.endsWith('.json') || file.name.endsWith('.jschema')) {
          try {
            const jsonObj = JSON.parse(content)
            content = yaml.dump(jsonObj)
          } catch (error) {
            console.error('Error parsing JSON:', error)
          }
        }
        loadSchema(content)
      }
    }
    reader.readAsText(file)
  }

  const handleExport = () => {
    // Export current schema as YAML file
    const blob = new Blob([schemaYaml], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'schema.yaml'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-800">Schema Editor</h1>
      <div className="flex gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".yaml,.yml,.json,.jschema"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={handleLoadSchema}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Load Schema
        </button>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Export
        </button>
      </div>
    </header>
  )
}

export default Header
