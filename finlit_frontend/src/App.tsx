import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthPage, DevAuthPage } from './auth'
import FinLitApp from './pages/Home'
import TrueFalseCard from './TrueFalse/TrueFalseCard'

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
        <Route path="/truefalse" element={<TrueFalseCard/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
