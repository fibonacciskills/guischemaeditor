import React, { useState, useEffect } from 'react'

const API_BASE = 'https://simpledemoserver.onrender.com'

function SampleFileBrowser({ onFileSelect, selectedFile }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    fetchFileList()
  }, [])

  const fetchFileList = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/v1/sample-data/`)
      const data = await response.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error('Error fetching file list:', error)
    }
    setLoading(false)
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(filter.toLowerCase())
  )

  // Group files by category
  const groupedFiles = filteredFiles.reduce((acc, file) => {
    if (file.name.startsWith('skillsapi/')) {
      acc.skillsapi = acc.skillsapi || []
      acc.skillsapi.push(file)
    } else if (file.name.includes('job')) {
      acc.jobs = acc.jobs || []
      acc.jobs.push(file)
    } else if (file.name.includes('worker') || file.name.includes('person')) {
      acc.people = acc.people || []
      acc.people.push(file)
    } else {
      acc.other = acc.other || []
      acc.other.push(file)
    }
    return acc
  }, {})

  const handleFileClick = async (file) => {
    try {
      const response = await fetch(`${API_BASE}${file.url}`)
      const data = await response.json()
      onFileSelect(file, data)
      setShowDropdown(false)
    } catch (error) {
      console.error('Error loading file:', error)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-left flex items-center justify-between hover:bg-gray-50"
      >
        <span className="text-sm truncate">
          {selectedFile ? selectedFile.name : 'Select a sample file...'}
        </span>
        <span className="text-gray-400">{showDropdown ? '▲' : '▼'}</span>
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search files..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <div className="text-xs text-gray-500 mt-1">
              {filteredFiles.length} of {files.length} files
            </div>
          </div>

          {/* File List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading files...</div>
            ) : (
              <>
                {/* Skills API Files */}
                {groupedFiles.skillsapi && (
                  <div>
                    <div className="px-3 py-2 bg-blue-50 text-xs font-semibold text-blue-900 sticky top-0">
                      Skills API ({groupedFiles.skillsapi.length})
                    </div>
                    {groupedFiles.skillsapi.map((file, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleFileClick(file)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 border-b border-gray-100 truncate"
                      >
                        {file.name.replace('skillsapi/', '')}
                      </button>
                    ))}
                  </div>
                )}

                {/* Job Files */}
                {groupedFiles.jobs && (
                  <div>
                    <div className="px-3 py-2 bg-green-50 text-xs font-semibold text-green-900 sticky top-0">
                      Jobs ({groupedFiles.jobs.length})
                    </div>
                    {groupedFiles.jobs.slice(0, 20).map((file, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleFileClick(file)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-green-50 border-b border-gray-100 truncate"
                      >
                        {file.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* People/Worker Files */}
                {groupedFiles.people && (
                  <div>
                    <div className="px-3 py-2 bg-purple-50 text-xs font-semibold text-purple-900 sticky top-0">
                      People/Workers ({groupedFiles.people.length})
                    </div>
                    {groupedFiles.people.slice(0, 20).map((file, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleFileClick(file)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 border-b border-gray-100 truncate"
                      >
                        {file.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Other Files */}
                {groupedFiles.other && (
                  <div>
                    <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-900 sticky top-0">
                      Other ({groupedFiles.other.length})
                    </div>
                    {groupedFiles.other.map((file, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleFileClick(file)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100 truncate"
                      >
                        {file.name}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SampleFileBrowser
