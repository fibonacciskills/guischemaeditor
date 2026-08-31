import React, { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import useSchemaStore from '../../store/schemaStore'
import SchemaNavigator from './SchemaNavigator'

function SchemaPanel() {
  const { schemaYaml, loadSchema } = useSchemaStore()
  const [localValue, setLocalValue] = useState('')
  const debounceTimer = useRef(null)
  const editorRef = useRef(null)

  useEffect(() => {
    // Load default example schema on mount
    fetch('/openapi.yaml')
      .then(res => res.text())
      .then(text => {
        setLocalValue(text)
        loadSchema(text)
      })
      .catch(err => console.error('Error loading example schema:', err))
  }, [loadSchema])

  // Update local value when store changes (from external updates)
  useEffect(() => {
    if (schemaYaml !== localValue) {
      setLocalValue(schemaYaml)
    }
  }, [schemaYaml])

  const handleEditorChange = (value) => {
    const newValue = value || ''
    setLocalValue(newValue)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      loadSchema(newValue)
    }, 1000)
  }

  const handleSelectSchema = (schemaName) => {
    if (!editorRef.current) return
    const model = editorRef.current.getModel()
    if (!model) return

    const text = model.getValue()
    const schemaKeyLine = text.split('\n').findIndex(line => line.includes(`  ${schemaName}:`))

    if (schemaKeyLine >= 0) {
      editorRef.current.revealLineInCenter(schemaKeyLine + 1)
      editorRef.current.setPosition({ lineNumber: schemaKeyLine + 1, column: 1 })
    }
  }

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {localValue && <SchemaNavigator schemaYaml={localValue} onSelectSchema={handleSelectSchema} />}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="yaml"
          value={localValue}
          onChange={handleEditorChange}
          onMount={(editor) => {
            editorRef.current = editor
          }}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  )
}

export default SchemaPanel
