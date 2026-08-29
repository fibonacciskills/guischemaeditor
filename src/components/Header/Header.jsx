import React, { useRef, useState, useEffect } from 'react'
import useSchemaStore from '../../store/schemaStore'
import yaml from 'js-yaml'

// EDUcore standards — sourced from the EDUcore knowledge graph (educore.org)
// Each entry with a local `url` is immediately loadable; others show as coming soon.
const EDUCORE_SCHEMAS = [
  {
    name: 'CASE 1.1',
    description: 'Competencies and Academic Standards Exchange — 1EdTech',
    url: '/case-1.1.yaml',
    source: 'CASE',
  },
  {
    name: 'CLR 2.0',
    description: 'Comprehensive Learner Record Standard — 1EdTech',
    url: null,
    source: 'CLR',
  },
  {
    name: 'Open Badges 3.0',
    description: 'OpenAPI schema for Open Badges — 1EdTech',
    url: null,
    source: 'OpenBadges',
  },
  {
    name: 'Edu-API 1.0',
    description: 'Education API standard — 1EdTech',
    url: null,
    source: 'EduAPI',
  },
  {
    name: 'Ed-Fi Data Standard',
    description: '201 entities, 1450 fields — Ed-Fi Alliance',
    url: null,
    source: 'EdFi',
  },
  {
    name: 'CEDS 14.0',
    description: 'Common Education Data Standards — CEDS',
    url: null,
    source: 'CEDS',
  },
  {
    name: 'SIF 1.0',
    description: 'SIF Implementation Specification — 159 objects, 15620 fields',
    url: null,
    source: 'SIF',
  },
  {
    name: 'CTDL',
    description: 'Credential Transparency Description Language — Credential Engine',
    url: null,
    source: 'CTDL',
  },
  {
    name: 'LIF 2.0',
    description: 'Machine-Readable Schema for LIF — 1EdTech',
    url: null,
    source: 'LIF',
  },
  {
    name: 'PESC 1.0',
    description: 'XML Schema — Postsecondary Electronic Standards Council',
    url: null,
    source: 'PESC',
  },
  {
    name: 'JEDx 1.0',
    description: 'JEDx Data Model — 5 entities, 139 fields',
    url: null,
    source: 'JEDx',
  },
  {
    name: 'SEDM 1.0',
    description: 'Special Education Data Model — IDEA compliance over CEDS',
    url: null,
    source: 'SEDM',
  },
  {
    name: 'MedBiquitous',
    description: 'Health Professions Education and Credentialing Standards',
    url: null,
    source: 'MedBiquitous',
  },
  // ── Local ──────────────────────────────────────────────────────────────────
  {
    name: 'Skills Proficiency API',
    description: 'Skillmore — skill assertions with proficiency scale',
    url: '/openapi.yaml',
    source: 'local',
  },
]

function Header() {
  const { schemaYaml, loadSchema } = useSchemaStore()
  const fileInputRef = useRef(null)
  const dropdownRef = useRef(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelectSchema = async (schema) => {
    if (!schema.url) return
    setDropdownOpen(false)
    setLoading(true)
    try {
      const res = await fetch(schema.url)
      if (!res.ok) throw new Error(`Failed to fetch ${schema.name}`)
      let text = await res.text()
      if (schema.url.endsWith('.json')) {
        const obj = JSON.parse(text)
        text = yaml.dump(obj)
      }
      loadSchema(text)
    } catch (err) {
      console.error('Error loading EDUcore schema:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddYourOwn = () => {
    setDropdownOpen(false)
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      let content = e.target?.result
      if (typeof content === 'string') {
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
    event.target.value = ''
  }

  const handleExport = () => {
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
      <div className="flex gap-3 items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".yaml,.yml,.json,.jschema"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* EDUcore schema dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Load Schema'}
            <svg
              className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">EDUcore Schemas</p>
              </div>
              <ul className="py-1 max-h-72 overflow-y-auto">
                {EDUCORE_SCHEMAS.map((schema, i) => (
                  <li key={i}>
                    <button
                      onClick={() => handleSelectSchema(schema)}
                      disabled={!schema.url}
                      className={`w-full text-left px-4 py-2.5 transition-colors flex items-start justify-between gap-2 ${
                        schema.url
                          ? 'hover:bg-blue-50 cursor-pointer'
                          : 'opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <span>
                        <p className="text-sm font-medium text-gray-800 leading-tight">{schema.name}</p>
                        {schema.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{schema.description}</p>
                        )}
                      </span>
                      {!schema.url && (
                        <span className="text-[10px] text-gray-400 mt-0.5 shrink-0">soon</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200">
                <button
                  onClick={handleAddYourOwn}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm text-blue-600 font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add your own…
                </button>
              </div>
            </div>
          )}
        </div>

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
