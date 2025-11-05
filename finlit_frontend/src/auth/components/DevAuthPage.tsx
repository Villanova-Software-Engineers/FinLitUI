import React from 'react';
import { useNavigate } from 'react-router-dom';

export const DevAuthPage: React.FC = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#eff6ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '28rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            margin: '0 auto 1.5rem',
            width: '4rem',
            height: '4rem',
            backgroundColor: '#2563eb',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontSize: '2rem' }}>📚</span>
          </div>
          
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Welcome to FinLit
          </h1>
          
          <p style={{
            color: '#6b7280',
            marginBottom: '2rem'
          }}>
            Development Mode - Click continue to access the dashboard
          </p>
          
          <button
            onClick={handleContinue}
            style={{
              width: '100%',
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.75rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            Continue to Dashboard →
          </button>
          
          <div style={{
            marginTop: '1.5rem',
            fontSize: '0.75rem',
            color: '#9ca3af'
          }}>
            This is a development bypass. In production, proper authentication will be required.
          </div>
        </div>
      </div>
    </div>
  );
};