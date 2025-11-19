import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreditDebitOverview from './Pages/CreditDebitOverview';
import DebitPage from './Pages/DebitPage';
import CreditPage from './Pages/CreditPage';
import CreditScore from './Pages/CreditScore';
import Navbar from './components/Navbar';



function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<CreditDebitOverview />} />
        <Route path="/debit" element={<DebitPage />} />
        <Route path="/credit" element={<CreditPage />} />
        <Route path="/credit-score" element={<CreditScore />} />
      </Routes>
    </Router>
  );
}

export default App;