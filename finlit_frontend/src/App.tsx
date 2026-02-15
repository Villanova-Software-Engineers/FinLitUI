import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthPage, AuthProvider, ProtectedRoute } from "./auth";
import FinLitApp from "./pages/Home";
import FinancialRoadmap from "./pages/Roadmap";
import BudgetingBasics from "./50-30-20/BudgetingBasics";
import CalculatorPage from "./50-30-20/calculator";
import NeedsWants from "./needs-wants/nwModule";
import TrueFalseCard from "./TrueFalse/TrueFalseCard";
import CreditScoreModule from "./components/CreditScoreModule";
import EmergencyFundModule from "./components/EmergencyFundModule";
import StockMarketModule from "./components/StockMarketModule";
import InsuranceModule from "./components/InsuranceModule";
import DebtManagementModule from "./components/DebtManagementModule";
import InvestmentBankingModule from "./components/InvestmentBankingModule";
import CryptoModule from "./components/CryptoModule";
import RetirementAccountsModule from "./components/RetirementAccountsModule";
import BondsPage from "./pages/Bonds";
import TaxBasics from "./components/TaxBasics";
import AdminSetup from "./components/AdminSetup";
import AdminDashboard from "./components/AdminDashboard";
import QuizQuestionsAdmin from "./components/QuizQuestionsAdmin";
import DailyChallengeAdmin from "./components/DailyChallengeAdmin";
import CaseStudyAdmin from "./components/CaseStudyAdmin";
import CaseStudyPage from "./pages/CaseStudy";
import EconomicNewsQuiz from "./components/EconomicNewsQuiz";
import Certificate from "./components/Certificate";
import FinancialTools from "./components/FinancialTools";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Games from "./pages/Games";
import GamesHorizon from "./pages/GamesHorizon";
import FinancialToolsHorizon from "./pages/FinancialToolsHorizon";
import StockSimulation from "./components/StockSimulation";
import MoneyPersonality from "./components/MoneyPersonality";
import ModuleAccessControl from "./components/ModuleAccessControl";
import BigMoneyDecisions from "./pages/BigMoneyDecisions";
import HomeImmersion from "./pages/big-money/HomeImmersion";
import CarImmersion from "./pages/big-money/CarImmersion";
import CollegeImmersion from "./pages/big-money/CollegeImmersion";
import BugReportForm from "./components/BugReportForm";
import BugReportAdmin from "./components/BugReportAdmin";
import { MODULES } from "./hooks/useModuleScore";

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

          {/* Protected Budgeting Basics Module - Single Unified Route */}
          <Route
            path="/50-30-20"
            element={
              <ProtectedRoute>
                <ModuleAccessControl moduleId={MODULES.BUDGETING_50_30_20.id} moduleName="Budgeting Basics">
                  <BudgetingBasics />
                </ModuleAccessControl>
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
                <ModuleAccessControl moduleId={MODULES.NEEDS_WANTS.id} moduleName="Needs vs Wants">
                  <NeedsWants />
                </ModuleAccessControl>
              </ProtectedRoute>
            }
          />
          <Route
            path="/need"
            element={
              <ProtectedRoute>
                <ModuleAccessControl moduleId={MODULES.NEEDS_WANTS.id} moduleName="Needs vs Wants">
                  <NeedsWants />
                </ModuleAccessControl>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investment-quiz"
            element={
              <ProtectedRoute>
                <ModuleAccessControl moduleId={MODULES.INVESTMENT_BANKING.id} moduleName="Investment Banking">
                  <InvestmentBankingModule />
                </ModuleAccessControl>
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
                <ModuleAccessControl moduleId={MODULES.CREDIT_SCORE.id} moduleName="Credit Score">
                  <CreditScoreModule />
                </ModuleAccessControl>
              </ProtectedRoute>
            }
          />
          <Route
            path="/emergency-fund"
            element={
              <ProtectedRoute>
                <ModuleAccessControl moduleId={MODULES.EMERGENCY_FUND.id} moduleName="Emergency Fund">
                  <EmergencyFundModule />
                </ModuleAccessControl>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bonds"
            element={
              <ProtectedRoute>
                <ModuleAccessControl moduleId={MODULES.BONDS.id} moduleName="Bonds">
                  <BondsPage />
                </ModuleAccessControl>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock-market"
            element={
              <ProtectedRoute>
                <ModuleAccessControl moduleId={MODULES.STOCK_MARKET.id} moduleName="Stock Market">
                  <StockMarketModule />
                </ModuleAccessControl>
              </ProtectedRoute>
            }
          />
          <Route
            path="/insurance"
            element={
              <ProtectedRoute>
                <ModuleAccessControl moduleId={MODULES.INSURANCE.id} moduleName="Insurance">
                  <InsuranceModule />
                </ModuleAccessControl>
              </ProtectedRoute>
            }
          />
          <Route
            path="/debt-management"
            element={
              <ProtectedRoute>
                <ModuleAccessControl moduleId={MODULES.DEBT_MANAGEMENT.id} moduleName="Debt Management">
                  <DebtManagementModule />
                </ModuleAccessControl>
              </ProtectedRoute>
            }
          />
          <Route
            path="/retirement-accounts"
            element={
              <ProtectedRoute>
                <ModuleAccessControl moduleId={MODULES.RETIREMENT_ACCOUNTS.id} moduleName="Retirement Accounts">
                  <RetirementAccountsModule />
                </ModuleAccessControl>
              </ProtectedRoute>
            }
          />
          <Route
            path="/crypto"
            element={
              <ProtectedRoute>
                <ModuleAccessControl moduleId={MODULES.CRYPTO.id} moduleName="Cryptocurrency">
                  <CryptoModule />
                </ModuleAccessControl>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tax-basics"
            element={
              <ProtectedRoute>
                <ModuleAccessControl moduleId={MODULES.TAX_BASICS.id} moduleName="Tax Basics">
                  <TaxBasics />
                </ModuleAccessControl>
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
            path="/admin/quiz-questions"
            element={
              <ProtectedRoute requiredRole="owner">
                <QuizQuestionsAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daily-challenge-admin"
            element={
              <ProtectedRoute>
                <DailyChallengeAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/case-study-admin"
            element={
              <ProtectedRoute requiredRole="owner">
                <CaseStudyAdmin />
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
          <Route
            path="/admin/bug-reports"
            element={
              <ProtectedRoute requiredRole="owner">
                <BugReportAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bug-report"
            element={
              <ProtectedRoute>
                <BugReportForm />
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

          {/* Financial Tools Route - Horizon UI (New Default) */}
          <Route
            path="/financial-tools"
            element={
              <ProtectedRoute>
                <FinancialToolsHorizon />
              </ProtectedRoute>
            }
          />

          {/* Financial Tools Route - Original (Backup) */}
          <Route
            path="/financial-tools-original"
            element={
              <ProtectedRoute>
                <FinancialTools />
              </ProtectedRoute>
            }
          />

          {/* Games Route - Horizon UI (New Default) */}
          <Route
            path="/games"
            element={
              <ProtectedRoute>
                <GamesHorizon />
              </ProtectedRoute>
            }
          />

          {/* Games Route - Original (Backup) */}
          <Route
            path="/games-original"
            element={
              <ProtectedRoute>
                <Games />
              </ProtectedRoute>
            }
          />

          {/* Stock Simulation Route */}
          <Route
            path="/stock-simulation"
            element={
              <ProtectedRoute>
                <StockSimulation />
              </ProtectedRoute>
            }
          />

          {/* Case Study Route */}
          <Route
            path="/case-study"
            element={
              <ProtectedRoute>
                <CaseStudyPage />
              </ProtectedRoute>
            }
          />

          {/* Money Personality Route */}
          <Route
            path="/money-personality"
            element={
              <ProtectedRoute>
                <MoneyPersonality />
              </ProtectedRoute>
            }
          />

          {/* Big Money Decisions Routes */}
          <Route
            path="/big-money-decisions"
            element={
              <ProtectedRoute>
                <BigMoneyDecisions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/big-money-decisions/home"
            element={
              <ProtectedRoute>
                <HomeImmersion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/big-money-decisions/car"
            element={
              <ProtectedRoute>
                <CarImmersion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/big-money-decisions/college"
            element={
              <ProtectedRoute>
                <CollegeImmersion />
              </ProtectedRoute>
            }
          />

          {/* Public Legal Pages */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Catch all route - redirect to dashboard if authenticated, otherwise to auth */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
