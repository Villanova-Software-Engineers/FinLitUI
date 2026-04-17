/**
 * Admin Management Wrapper
 * Wraps AdminManagement component with user context
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../auth/context/AuthContext';
import AdminManagement from './AdminManagement';

const AdminManagementWrapper: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // Redirect if not an admin
  if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
    navigate('/dashboard');
    return null;
  }

  // Owner (super admin) cannot manage organization admins
  if (user.role === 'owner') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">Not Available for Super Admins</h2>
          <p className="text-yellow-700">
            This page is for organization admins to manage other admins within their organization.
            As a website super admin (owner), you can create and manage organizations from the Admin Setup page.
          </p>
          <button
            onClick={() => navigate('/admin-setup')}
            className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Go to Admin Setup
          </button>
        </div>
      </div>
    );
  }

  // Regular admin - show the management interface
  if (!user.organizationId || !user.organizationName) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-700">
            Your account is missing organization information. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminManagement
      organizationId={user.organizationId}
      currentUserId={user.id}
      organizationName={user.organizationName}
    />
  );
};

export default AdminManagementWrapper;
