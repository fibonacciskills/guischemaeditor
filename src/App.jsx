import React from 'react'
import Header from './components/Header/Header'
import ThreePanelLayout from './components/Layout/ThreePanelLayout'

function App() {
  return (
    <div className="w-full h-full flex flex-col bg-gray-100">
      <Header />
      <ThreePanelLayout />
    </div>
  )
}

export default App
