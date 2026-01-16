import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthPage, AuthProvider } from "./auth";
import FinLitApp from "./pages/Home";
import FinancialRoadmap from "./pages/Roadmap";
import NeedsPage from "./50-30-20/needs";
import WantsPage from "./50-30-20/wants";
import SavingsPage from "./50-30-20/savings";
import CalculatorPage from "./50-30-20/calculator";
import MainPage from "./50-30-20/MainPage";
import BudgetRuleChartStep from "./50-30-20/50-30-20";
import NeedsWants from "./needs-wants/nwModule";
import TrueFalseCard from "./TrueFalse/TrueFalseCard";
import CreditScoreModule from "./components/CreditScoreModule";
import EmergencyFundModule from "./components/EmergencyFundModule";
import StockMarketModule from "./components/StockMarketModule";
import InsuranceModule from "./components/InsuranceModule";
import DebtManagementModule from "./components/DebtManagementModule";
import InvestmentBankingModule from "./components/InvestmentBankingModule";
import AdminSetup from "./components/AdminSetup";
import AdminDashboard from "./components/AdminDashboard";

function Dashboard() {
  return <FinLitApp />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game" element={<FinancialRoadmap />} />
          <Route path="/fin" element={<FinancialRoadmap />} />

          {/* 50-30-20 Budget Rule Routes */}
          <Route path="/50-30-20" element={<BudgetRuleChartStep activeCategoryKey="50" />} />
          <Route path="/mainpage" element={<MainPage />} />
          <Route path="/needs" element={<NeedsPage />} />
          <Route path="/wants" element={<WantsPage />} />
          <Route path="/savings" element={<SavingsPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />

          {/* Learning Modules */}
          <Route path="/needs-wants" element={<NeedsWants />} />
          <Route path="/need" element={<NeedsWants />} />
          <Route path="/investment-quiz" element={<InvestmentBankingModule />} />
          <Route path="/truefalse" element={<TrueFalseCard />} />
          <Route path="/credit-score" element={<CreditScoreModule />} />
          <Route path="/emergency-fund" element={<EmergencyFundModule />} />
          <Route path="/stock-market" element={<StockMarketModule />} />
          <Route path="/insurance" element={<InsuranceModule />} />
          <Route path="/debt-management" element={<DebtManagementModule />} />

          {/* Admin Setup */}
          <Route path="/admin-setup" element={<AdminSetup />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
