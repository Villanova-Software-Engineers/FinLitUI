import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthPage, DevAuthPage } from './auth'
import FinLitApp from './pages/Home'
import FinancialRoadmap from './pages/Roadmap'
function Dashboard() {
  return <FinLitApp />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/fin" element={<FinancialRoadmap />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
