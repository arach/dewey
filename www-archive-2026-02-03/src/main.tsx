import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

// Handle GitHub Pages SPA redirect
// The 404.html redirects to /?p=/original/path
const params = new URLSearchParams(window.location.search)
const redirectPath = params.get('p')
if (redirectPath) {
  // Replace the URL without the query param, preserving the intended path
  window.history.replaceState(null, '', decodeURIComponent(redirectPath))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
