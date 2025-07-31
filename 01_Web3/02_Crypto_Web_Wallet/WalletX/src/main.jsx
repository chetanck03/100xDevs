import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Buffer } from 'buffer'

// Make Buffer available globally
window.Buffer = Buffer

// Make global available for crypto libraries
if (typeof global === 'undefined') {
  window.global = globalThis
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
