import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './routes/routes.jsx'
import { Buffer } from 'buffer'

// Make Buffer available globally
window.Buffer = Buffer

// Make global available for crypto libraries
if (typeof global === 'undefined') {
  window.global = globalThis
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
