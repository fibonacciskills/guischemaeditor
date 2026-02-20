import React from 'react'

function TurtleViewer({ text }) {
  const syntaxHighlight = (ttl) => {
    // HTML-escape first
    ttl = ttl.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    // @prefix declarations
    ttl = ttl.replace(
      /^(@prefix\s+\S+\s+&lt;[^&]*&gt;\s*\.)/gm,
      '<span class="text-blue-700 font-semibold">$1</span>'
    )

    // URIs in angle brackets: &lt;...&gt;
    ttl = ttl.replace(
      /(&lt;https?:\/\/[^&]*&gt;)/g,
      '<span class="text-green-600">$1</span>'
    )

    // Prefixed names (e.g. schema:name, hr:proficiencyLevel)
    ttl = ttl.replace(
      /\b([a-zA-Z_][a-zA-Z0-9_]*:[a-zA-Z_][a-zA-Z0-9_]*)\b/g,
      '<span class="text-blue-600">$1</span>'
    )

    // String literals "..."
    ttl = ttl.replace(
      /"([^"\\]|\\.)*"/g,
      '<span class="text-orange-600">$&</span>'
    )

    // Keywords: 'a' (as rdf:type shorthand), true, false
    ttl = ttl.replace(
      /\b(true|false)\b/g,
      '<span class="text-purple-600">$1</span>'
    )
    ttl = ttl.replace(
      /(\s)(a)(\s)/g,
      '$1<span class="text-purple-600 font-semibold">$2</span>$3'
    )

    return ttl
  }

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 p-4">
      <pre className="text-sm font-mono whitespace-pre-wrap">
        <code dangerouslySetInnerHTML={{ __html: syntaxHighlight(text) }} />
      </pre>
    </div>
  )
}

export default TurtleViewer
