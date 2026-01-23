import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthPage, AuthProvider, ProtectedRoute } from "./auth";
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
import CryptoModule from "./components/CryptoModule";
import AdminSetup from "./components/AdminSetup";
import AdminDashboard from "./components/AdminDashboard";
import EconomicNewsQuiz from "./components/EconomicNewsQuiz";
import Certificate from "./components/Certificate";
import FinancialTools from "./components/FinancialTools";

// Smart Auth component that redirects authenticated users appropriately
const SmartAuthPage: React.FC = () => {
  return <AuthPage />;
};

function Dashboard() {
  return <FinLitApp />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth" element={<SmartAuthPage />} />
          
          {/* Protected Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/game" 
            element={
              <ProtectedRoute>
                <FinancialRoadmap />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fin" 
            element={
              <ProtectedRoute>
                <FinancialRoadmap />
              </ProtectedRoute>
            } 
          />

          {/* Protected 50-30-20 Budget Rule Routes */}
          <Route 
            path="/50-30-20" 
            element={
              <ProtectedRoute>
                <BudgetRuleChartStep activeCategoryKey="50" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mainpage" 
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/needs" 
            element={
              <ProtectedRoute>
                <NeedsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/wants" 
            element={
              <ProtectedRoute>
                <WantsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/savings" 
            element={
              <ProtectedRoute>
                <SavingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/calculator" 
            element={
              <ProtectedRoute>
                <CalculatorPage />
              </ProtectedRoute>
            } 
          />

          {/* Protected Learning Modules */}
          <Route 
            path="/needs-wants" 
            element={
              <ProtectedRoute>
                <NeedsWants />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/need" 
            element={
              <ProtectedRoute>
                <NeedsWants />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/investment-quiz" 
            element={
              <ProtectedRoute>
                <InvestmentBankingModule />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/truefalse"
            element={
              <ProtectedRoute>
                <TrueFalseCard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/economic-quiz"
            element={
              <ProtectedRoute>
                <EconomicNewsQuiz />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/credit-score" 
            element={
              <ProtectedRoute>
                <CreditScoreModule />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/emergency-fund" 
            element={
              <ProtectedRoute>
                <EmergencyFundModule />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/stock-market" 
            element={
              <ProtectedRoute>
                <StockMarketModule />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/insurance" 
            element={
              <ProtectedRoute>
                <InsuranceModule />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/debt-management"
            element={
              <ProtectedRoute>
                <DebtManagementModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crypto"
            element={
              <ProtectedRoute>
                <CryptoModule />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route 
            path="/admin-setup" 
            element={
              <ProtectedRoute requiredRole="owner">
                <AdminSetup />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Certificate Route */}
          <Route
            path="/certificate"
            element={
              <ProtectedRoute>
                <Certificate />
              </ProtectedRoute>
            }
          />

          {/* Financial Tools Route */}
          <Route
            path="/financial-tools"
            element={
              <ProtectedRoute>
                <FinancialTools />
              </ProtectedRoute>
            }
          />

          {/* Catch all route - redirect to dashboard if authenticated, otherwise to auth */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
