/**
 * Temporary Component for Creating Super Admin
 *
 * IMPORTANT: Remove this component after creating your super admin account!
 *
 * To use:
 * 1. Add this route to your App.tsx: <Route path="/create-super-admin" element={<CreateSuperAdmin />} />
 * 2. Navigate to /create-super-admin
 * 3. Fill in the form and submit
 * 4. Remove the route and this component after use
 */

import React, { useState } from 'react';
import { createSuperAdmin } from '../firebase/createSuperAdmin';

const CreateSuperAdmin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    userId?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setResult({ success: false, message: 'Passwords do not match' });
      return;
    }

    if (password.length < 6) {
      setResult({ success: false, message: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    setResult(null);

    const response = await createSuperAdmin(email, password);

    if (response.success) {
      setResult({
        success: true,
        message: `Super admin created successfully! You are now signed in as ${response.email}`,
        userId: response.userId,
      });
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } else {
      setResult({
        success: false,
        message: response.error || 'Failed to create super admin',
      });
    }

    setLoading(false);
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '50px auto',
      padding: '30px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#333' }}>
        Create Super Admin
      </h1>

      <p style={{
        backgroundColor: '#fff3cd',
        color: '#856404',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '20px',
        fontSize: '14px',
      }}>
        ⚠️ This page should be removed after creating your super admin account!
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creating...' : 'Create Super Admin'}
        </button>
      </form>

      {result && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          borderRadius: '4px',
          backgroundColor: result.success ? '#d4edda' : '#f8d7da',
          color: result.success ? '#155724' : '#721c24',
        }}>
          <p style={{ margin: 0 }}>{result.message}</p>
          {result.userId && (
            <p style={{ margin: '10px 0 0', fontSize: '14px' }}>
              User ID: <code>{result.userId}</code>
            </p>
          )}
          {result.success && (
            <p style={{ margin: '10px 0 0', fontSize: '14px' }}>
              You can now navigate to <a href="/admin-setup" style={{ color: '#155724' }}>/admin-setup</a> to create organizations.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateSuperAdmin;
