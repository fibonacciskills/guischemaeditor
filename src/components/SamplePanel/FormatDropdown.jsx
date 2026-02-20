import React from 'react'

function FormatDropdown({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors border border-gray-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400"
    >
      <option value="json">JSON</option>
      <option value="json-ld">JSON-LD</option>
      <option value="turtle">Turtle (TTL)</option>
    </select>
  )
}

export default FormatDropdown
