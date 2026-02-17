import React from 'react'

function JsonViewer({ data }) {
  const jsonString = JSON.stringify(data, null, 2)

  // Simple syntax highlighting for JSON
  const syntaxHighlight = (json) => {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'text-orange-600' // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-blue-700 font-semibold' // key
          } else {
            cls = 'text-green-600' // string
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-purple-600' // boolean
        } else if (/null/.test(match)) {
          cls = 'text-gray-500' // null
        }
        return `<span class="${cls}">${match}</span>`
      }
    )
  }

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 p-4">
      <pre className="text-sm font-mono">
        <code dangerouslySetInnerHTML={{ __html: syntaxHighlight(jsonString) }} />
      </pre>
    </div>
  )
}

export default JsonViewer
