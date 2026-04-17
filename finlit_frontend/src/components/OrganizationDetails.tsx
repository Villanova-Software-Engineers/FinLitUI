/**
 * Organization Details Component
 * Allows website super admins (owners) to view and manage admins for any organization
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Users,
  Calendar,
  Shield,
  ShieldAlert,
  UserPlus,
  Trash2,
  Mail,
  Clock,
  Copy,
  Check,
  X,
  Loader2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { useAuthContext } from '../auth/context/AuthContext';
import {
  getOrganization,
  addOrganizationAdmin,
  removeOrganizationAdmin,
} from '../firebase/firestore.service';
import type { Organization, OrganizationAdmin } from '../auth/types/auth.types';
import ModuleLockManager from './ModuleLockManager';

const OrganizationDetails: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'admins' | 'locks'>('admins');

  // Redirect if not owner
  if (!user || user.role !== 'owner') {
    navigate('/dashboard');
    return null;
  }

  useEffect(() => {
    if (orgId) {
      loadOrganization();
    }
  }, [orgId]);

  const loadOrganization = async () => {
    if (!orgId) return;

    try {
      setLoading(true);
      const org = await getOrganization(orgId);
      if (!org) {
        setError('Organization not found');
        return;
      }
      setOrganization(org);
    } catch (err) {
      console.error('Error loading organization:', err);
      setError('Failed to load organization');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setGeneratedPassword(null);

    if (!orgId || !organization || !user) return;

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
        orgId,
        newAdminEmail.trim(),
        user.id
      );

      setSuccess(`Admin added successfully! Email: ${result.admin.email}`);
      setGeneratedPassword(result.password);
      setNewAdminEmail('');
      setShowAddModal(false);
      await loadOrganization();
    } catch (err: any) {
      setError(err.message || 'Failed to add admin');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveAdmin = async (adminUserId: string, adminEmail: string, isSuperAdmin: boolean) => {
    if (isSuperAdmin) {
      setError('Cannot remove the organization super admin');
      return;
    }

    if (!confirm(`Are you sure you want to remove ${adminEmail} as an admin?`)) {
      return;
    }

    if (!orgId || !user) return;

    try {
      setError(null);
      setSuccess(null);
      await removeOrganizationAdmin(orgId, adminUserId, user.id);
      setSuccess(`Successfully removed ${adminEmail}`);
      await loadOrganization();
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Organization Not Found</h2>
            <p className="text-red-700 mb-4">The organization you're looking for could not be found.</p>
            <button
              onClick={() => navigate('/admin-setup')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Admin Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin-setup')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Setup
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
              <p className="text-gray-600">{organization.contactEmail}</p>
            </div>
          </div>
        </div>

        {/* Organization Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Total Admins</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{organization.admins.length}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Super Admin</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {organization.admins.find(a => a.isSuperAdmin)?.email || 'N/A'}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Created</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(organization.createdAt)}
              </p>
            </div>
          </div>
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
                </div>
              )}
            </div>
            <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                activeTab === 'admins'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Admins ({organization.admins.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('locks')}
              className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                activeTab === 'locks'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Module Access Control
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'admins' && (
          <>
            {/* Add Admin Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <UserPlus className="h-5 w-5" />
                Add New Admin
              </button>
            </div>
          </>
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

        {/* Admins Tab Content */}
        {activeTab === 'admins' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Organization Admins ({organization.admins.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {organization.admins.map((admin) => (
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

                    {/* Remove Button */}
                    {!admin.isSuperAdmin && (
                      <button
                        onClick={() => handleRemoveAdmin(admin.userId, admin.email, admin.isSuperAdmin)}
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
          </div>
        )}

        {/* Module Locks Tab Content */}
        {activeTab === 'locks' && user && (
          <ModuleLockManager
            organizationId={orgId!}
            organizationName={organization.name}
            userId={user.id}
            isSuperAdmin={true}
          />
        )}
      </div>
    </div>
  );
};

export default OrganizationDetails;
