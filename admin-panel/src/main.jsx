import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AdminAuthProvider } from './context/adminAuth'
import { ToastProvider } from './context/ToastContext'
import { ToastStack } from './components/admin/ToastStack'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <ToastStack />
            <App />
          </BrowserRouter>
        </AdminAuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)
