import { Navigate, Route, Routes } from 'react-router-dom'
import { PortfolioPage } from './pages/PortfolioPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PortfolioPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
