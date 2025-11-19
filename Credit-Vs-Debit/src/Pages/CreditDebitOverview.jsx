import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import debit from '../images/debit.png';
import credit from '../images/credit.png';

const CreditDebitOverview = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      padding: 0,
      minHeight: '100vh',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="container-overview">
        <div className="overview-title">
          <h1 className="h1">CREDIT VS DEBIT</h1>
        </div>

        <div className="overview-section">
          <h2 className="h2">The Great Card Confusion</h2>
          <h2 className="h2">🤷‍♂️ "But they look the same!"</h2>
        </div>

        <div className="overview-comparison">
          <img src={credit} className="overview-card-image" alt="Credit" />
          <div className="overview-vs-text">VS</div>
          <img src={debit} className="overview-card-image" alt="Debit" />
        </div>

        <div className="overview-info">
          <h2 className="h2">But they are VERY different!</h2>
          <h2 className="h2">In this lesson, we will explore the difference between credit and debit cards, and how they work.</h2>
          <h2 className="h2">We will also explore the different types of cards and how they are used.</h2>
        </div>

        <button className="button" onClick={() => navigate('/debit')}>Next!</button>
      </div>
    </div>
  );
};

export default CreditDebitOverview;