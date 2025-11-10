import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div className="flex gap-8 mb-8">
        <a 
          href="https://vite.dev" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:drop-shadow-[0_0_2em_#646cffaa] transition-all duration-300"
        >
          <img 
            src={viteLogo} 
            className="h-24 w-24" 
            alt="Vite logo" 
          />
        </a>
        <a 
          href="https://react.dev" 
          target="_blank"
          rel="noopener noreferrer" 
          className="hover:drop-shadow-[0_0_2em_#61dafbaa] transition-all duration-300 animate-spin-slow"
        >
          <img 
            src={reactLogo} 
            className="h-24 w-24" 
            alt="React logo" 
          />
        </a>
      </div>

      <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
        Vite + React
      </h1>

      <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
        <button 
          onClick={() => setCount((count) => count + 1)}
          className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mb-4"
        >
          count is {count}
        </button>
        <p className="text-gray-400">
          Edit <code className="bg-gray-700 px-2 py-1 rounded text-sm">src/App.jsx</code> and save to test HMR
        </p>
      </div>

      <p className="text-gray-500 mt-8 text-sm">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App