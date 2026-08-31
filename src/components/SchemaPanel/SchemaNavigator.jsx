import React, { useState, useMemo } from 'react'
import yaml from 'js-yaml'

function SchemaNavigator({ schemaYaml, onSelectSchema }) {
  const [currentPage, setCurrentPage] = useState(0)
  const [search, setSearch] = useState('')
  const PAGE_SIZE = 20

  const schemas = useMemo(() => {
    try {
      const parsed = yaml.load(schemaYaml)
      if (!parsed?.components?.schemas) return []
      return Object.keys(parsed.components.schemas).sort()
    } catch {
      return []
    }
  }, [schemaYaml])

  const filtered = useMemo(() => {
    if (!search) return schemas
    return schemas.filter(name => name.toLowerCase().includes(search.toLowerCase()))
  }, [schemas, search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)

  const handleSelectSchema = (name) => {
    onSelectSchema(name)
  }

  const handlePrevPage = () => {
    setCurrentPage(p => Math.max(0, p - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(p => Math.min(totalPages - 1, p + 1))
  }

  return (
    <div className="bg-gray-50 border-b border-gray-300 px-3 py-2">
      <div className="flex items-center justify-between gap-2 mb-2">
        <input
          type="text"
          placeholder="Search classes…"
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setCurrentPage(0)
          }}
          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="text-xs text-gray-600 whitespace-nowrap">
          {filtered.length} class{filtered.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {filtered.length > 0 && (
        <>
          <div className="grid grid-cols-4 gap-1 mb-2 max-h-24 overflow-y-auto">
            {paged.map(name => (
              <button
                key={name}
                onClick={() => handleSelectSchema(name)}
                className="text-left px-2 py-1 text-[11px] bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 truncate"
                title={name}
              >
                {name}
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                ← Prev
              </button>
              <span className="text-xs text-gray-600">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SchemaNavigator
