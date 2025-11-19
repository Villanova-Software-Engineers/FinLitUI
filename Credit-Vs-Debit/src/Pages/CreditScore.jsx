import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const CreditScore = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      padding: 0,
      minHeight: '100vh',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="container">
        <div className="containter-info-1">
          <h1 className="h1">Credit Score</h1>
          <h2 className="h2">Credit scores are a measure of your creditworthiness.</h2>
          <h2 className="h2">They are used to determine your interest rate and your credit limit.</h2>
        </div>

        <div className="containter-info-2">
          <h2 className="h2">The higher the score, the better your creditworthiness.</h2>
          <h2 className="h2">The score is calculated based on your credit history, credit utilization, and credit age.</h2>
          <h2 className="h2">The score is a number between 300 and 850.</h2>
          

        </div>

        <div className="containter-list-items">
          <h1 className="h1">They are also used to determine your eligibility for:</h1>
          <div>
            <p className="container-list-items">loans and credit cards</p>
            <p className="container-list-items">jobs and housing</p>
            <p className="container-list-items">insurance and retirement</p>
            <p className="container-list-items">government programs</p>
            <p className="container-list-items">scholarships and grants</p>
          </div>
        </div>

        <button className="button" onClick={() => navigate('/')}>end lesson!</button>
      </div>
    </div>
  );
};

export default CreditScore;