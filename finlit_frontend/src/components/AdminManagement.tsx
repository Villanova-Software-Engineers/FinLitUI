/**
 * Admin Management Component
 * Allows organization admins to add/remove other admins
 * Super admin (first admin) cannot be deleted
 */

import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Trash2,
  Shield,
  ShieldAlert,
  Mail,
  Clock,
  AlertCircle,
  Check,
  X,
  Loader2,
  Copy,
} from 'lucide-react';
import {
  getOrganizationAdmins,
  addOrganizationAdmin,
  removeOrganizationAdmin,
  isOrganizationSuperAdmin,
} from '../firebase/firestore.service';
import type { OrganizationAdmin } from '../auth/types/auth.types';

interface AdminManagementProps {
  organizationId: string;
  currentUserId: string;
  organizationName: string;
}

const AdminManagement: React.FC<AdminManagementProps> = ({
  organizationId,
  currentUserId,
  organizationName,
}) => {
  const [admins, setAdmins] = useState<OrganizationAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    loadAdmins();
    checkSuperAdminStatus();
  }, [organizationId, currentUserId]);

  const checkSuperAdminStatus = async () => {
    const superAdmin = await isOrganizationSuperAdmin(currentUserId, organizationId);
    setIsSuperAdmin(superAdmin);
  };

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const adminList = await getOrganizationAdmins(organizationId);
      setAdmins(adminList);
    } catch (err) {
      console.error('Error loading admins:', err);
      setError('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setGeneratedPassword(null);

    if (!newAdminEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdminEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsAdding(true);
      const result = await addOrganizationAdmin(
        organizationId,
        newAdminEmail.trim(),
        currentUserId
      );

      setSuccess(`Admin added successfully! Email: ${result.admin.email}`);
      setGeneratedPassword(result.password);
      setNewAdminEmail('');
      setShowAddModal(false);
      await loadAdmins();
    } catch (err: any) {
      setError(err.message || 'Failed to add admin');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveAdmin = async (adminUserId: string, adminEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${adminEmail} as an admin?`)) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await removeOrganizationAdmin(organizationId, adminUserId, currentUserId);
      setSuccess(`Successfully removed ${adminEmail}`);
      await loadAdmins();
    } catch (err: any) {
      setError(err.message || 'Failed to remove admin');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Management</h1>
        <p className="text-gray-600">
          Manage administrators for <span className="font-semibold">{organizationName}</span>
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800">Success</h3>
            <p className="text-sm text-green-700 mt-1">{success}</p>
            {generatedPassword && (
              <div className="mt-3 bg-white border border-green-300 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Generated Password (share this with the new admin):
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-50 px-3 py-2 rounded border text-sm font-mono">
                    {generatedPassword}
                  </code>
                  <button
                    onClick={() => copyToClipboard(generatedPassword)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  The admin can change this password after their first login.
                </p>
              </div>
            )}
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Add Admin Button - Only visible to super admin */}
      {isSuperAdmin ? (
        <div className="mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <UserPlus className="h-5 w-5" />
            Add New Admin
          </button>
        </div>
      ) : (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">View Only Access</p>
              <p className="text-yellow-700">
                You can view the admin list, but only the organization super admin can add or remove admins.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Admin</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewAdminEmail('');
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddAdmin}>
              <div className="mb-4">
                <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email
                </label>
                <input
                  id="adminEmail"
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isAdding}
                />
                <p className="text-xs text-gray-500 mt-2">
                  A temporary password will be generated and displayed after creation.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewAdminEmail('');
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isAdding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Add Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admins List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Organization Admins ({admins.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {admins.map((admin) => (
            <div
              key={admin.userId}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {admin.isSuperAdmin ? (
                        <Shield className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <ShieldAlert className="h-5 w-5 text-blue-600" />
                      )}
                      <span className="font-medium text-gray-900">
                        {admin.displayName || 'Admin'}
                      </span>
                    </div>
                    {admin.isSuperAdmin && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Super Admin
                      </span>
                    )}
                    {admin.userId === currentUserId && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        You
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{admin.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Added {formatDate(admin.addedAt)}</span>
                    </div>
                  </div>

                  {admin.isSuperAdmin && (
                    <p className="text-xs text-gray-500 mt-2">
                      First admin created for this organization. Cannot be removed.
                    </p>
                  )}
                </div>

                {/* Remove Button - Only visible to super admin */}
                {!admin.isSuperAdmin && isSuperAdmin && (
                  <button
                    onClick={() => handleRemoveAdmin(admin.userId, admin.email)}
                    className="ml-4 text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Remove admin"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {admins.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            <ShieldAlert className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No admins found</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Admin Permissions:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Only the organization super admin can add or remove admins</li>
              <li>The super admin (first admin) cannot be removed</li>
              <li>All admins have full access to manage students, classes, and content</li>
              <li>Regular admins can view the admin list but cannot modify it</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
