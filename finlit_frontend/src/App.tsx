import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthPage, DevAuthPage } from './auth'
import FinLitApp from './pages/Home'
import FinancialRoadmap from './pages/Roadmap'
import NeedsPage from './50-30-20/needs'
import WantsPage from './50-30-20/wants'
import SavingsPage from './50-30-20/savings'
import CalculatorPage from './50-30-20/calculator'
import MainPage from './50-30-20/MainPage'

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
        <Route path="/" element={<MainPage />} />
        <Route path="/needs" element={<NeedsPage />} />
        <Route path="/wants" element={<WantsPage />} />
        <Route path="/savings" element={<SavingsPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
