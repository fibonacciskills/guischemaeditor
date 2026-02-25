import React, { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import useSchemaStore from '../../store/schemaStore'

function SchemaPanel() {
  const { schemaYaml, loadSchema } = useSchemaStore()
  const [localValue, setLocalValue] = useState('')
  const debounceTimer = useRef(null)

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

    // Debounce the sync to store (wait 1 second after user stops typing)
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      loadSchema(newValue)
    }, 1000)
  }

  return (
    <div className="w-full h-full bg-white">
      <Editor
        height="100%"
        defaultLanguage="yaml"
        value={localValue}
        onChange={handleEditorChange}
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
  )
}

export default SchemaPanel
