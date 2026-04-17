/**
 * Organization Details Component
 * Styled exactly like What is Money module - colorful boxes, white backgrounds, same design
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
  Sparkles,
  Award,
} from 'lucide-react';
import { useAuthContext } from '../auth/context/AuthContext';
import {
  getOrganization,
  addOrganizationAdmin,
  removeOrganizationAdmin,
} from '../firebase/firestore.service';
import type { Organization } from '../auth/types/auth.types';
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
      <div className="min-h-screen flex justify-center items-center" style={{ background: 'linear-gradient(120deg, #e0f7fa 0%, #e8f5e9 50%, #e3f2fd 100%)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold tracking-wide">Loading Organization...</p>
        </motion.div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(120deg, #e0f7fa 0%, #e8f5e9 50%, #e3f2fd 100%)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md bg-white rounded-3xl p-10 shadow-xl border border-gray-100"
        >
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertCircle className="text-red-600 h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Organization Not Found</h1>
          <p className="text-gray-600 mb-8 text-lg">The organization you're looking for could not be found.</p>
          <button
            onClick={() => navigate('/admin-setup')}
            className="px-10 py-4 rounded-2xl bg-blue-500 text-white font-bold text-lg shadow-xl hover:bg-blue-600 transition"
          >
            Back to Admin Setup
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'linear-gradient(120deg, #e0f7fa 0%, #e8f5e9 50%, #e3f2fd 100%)' }}>
      {/* Back Button */}
      <button
        className="absolute top-4 left-4 px-4 py-2 rounded-lg text-blue-600 hover:bg-white/50 backdrop-blur-sm font-medium transition z-50 shadow-sm border border-blue-100"
        onClick={() => navigate('/admin-setup')}
      >
        ← Back to Organizations
      </button>

      <div className="max-w-5xl mx-auto pt-16 px-6">
        {/* Header Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg">
              <Building2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-gray-800">{organization.name}</h1>
          <p className="text-xl text-gray-600">{organization.contactEmail}</p>
        </motion.div>

        {/* Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex items-start gap-4"
            >
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-green-50 border-2 border-green-200 rounded-2xl p-6 flex items-start gap-4"
            >
              <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900">Success</h3>
                <p className="text-green-700 mt-1">{success}</p>
                {generatedPassword && (
                  <div className="mt-4 bg-white border-2 border-green-300 rounded-xl p-4">
                    <p className="text-sm font-bold text-gray-900 mb-3">
                      Generated Password (share this with the new admin):
                    </p>
                    <div className="flex items-center gap-3">
                      <code className="flex-1 bg-gray-50 px-4 py-3 rounded-lg border-2 border-gray-200 text-base font-mono font-semibold text-slate-900">
                        {generatedPassword}
                      </code>
                      <button
                        onClick={() => copyToClipboard(generatedPassword)}
                        className="px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 font-bold shadow-lg"
                      >
                        {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards - Same style as What is Money intro boxes */}
        <div className="space-y-6 mb-12">
          <motion.div
            className="p-8 rounded-3xl shadow-xl bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Total Admins</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  This organization has <span className="font-bold text-blue-600">{organization.admins.length}</span> administrator{organization.admins.length !== 1 ? 's' : ''} managing access and permissions.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="p-8 rounded-3xl shadow-xl bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Super Admin</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  The primary administrator is <span className="font-bold text-green-600">{organization.admins.find(a => a.isSuperAdmin)?.email || 'N/A'}</span>
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="p-8 rounded-3xl shadow-xl bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Organization Created</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Established on <span className="font-bold text-purple-600">{formatDate(organization.createdAt)}</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs - Styled like What is Money gradient boxes */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition ${
              activeTab === 'admins'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                : 'bg-white text-gray-700 hover:shadow-2xl'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Manage Admins
            </div>
          </button>
          <button
            onClick={() => setActiveTab('locks')}
            className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition ${
              activeTab === 'locks'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                : 'bg-white text-gray-700 hover:shadow-2xl'
            }`}
          >
            <div className="flex items-center gap-2">
              <Lock className="h-6 w-6" />
              Module Access
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'admins' && (
            <motion.div
              key="admins"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 mb-12"
            >
              {/* Add Admin Button */}
              <div className="flex justify-center mb-8">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-10 py-4 rounded-2xl bg-blue-500 text-white font-bold text-lg shadow-xl hover:bg-blue-600 transition flex items-center gap-3"
                >
                  <UserPlus className="h-6 w-6" />
                  Add New Admin
                </button>
              </div>

              {/* Admin Cards - Same style as What is Money boxes */}
              {organization.admins.map((admin, index) => (
                <motion.div
                  key={admin.userId}
                  className="p-8 rounded-3xl shadow-xl bg-white"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                      admin.isSuperAdmin ? 'bg-amber-500' : 'bg-blue-500'
                    }`}>
                      {admin.isSuperAdmin ? (
                        <Shield className="h-8 w-8 text-white" />
                      ) : (
                        <ShieldAlert className="h-8 w-8 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl font-bold text-gray-800">
                          {admin.displayName || 'Admin'}
                        </h3>
                        {admin.isSuperAdmin && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Award className="h-3 w-3 mr-1" />
                            Super Admin
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="h-5 w-5 text-gray-500" />
                          <span className="text-lg font-medium">{admin.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-5 w-5 text-gray-500" />
                          <span>Added {formatDate(admin.addedAt)}</span>
                        </div>
                      </div>
                      {admin.isSuperAdmin && (
                        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
                          <p className="text-sm text-amber-900 font-medium">
                            ⭐ First admin created for this organization. Cannot be removed.
                          </p>
                        </div>
                      )}
                    </div>
                    {!admin.isSuperAdmin && (
                      <button
                        onClick={() => handleRemoveAdmin(admin.userId, admin.email, admin.isSuperAdmin)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all border-2 border-red-200 font-bold flex items-center gap-2"
                        title="Remove admin"
                      >
                        <Trash2 className="h-5 w-5" />
                        Remove
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'locks' && user && (
            <motion.div
              key="locks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12"
            >
              <ModuleLockManager
                organizationId={orgId!}
                organizationName={organization.name}
                userId={user.id}
                isSuperAdmin={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Admin Modal - Styled like What is Money */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowAddModal(false);
              setNewAdminEmail('');
              setError(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
                    <UserPlus className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Add New Admin</h2>
                </div>
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

              <form onSubmit={handleAddAdmin} className="space-y-6">
                <div>
                  <label htmlFor="adminEmail" className="block text-gray-700 font-semibold mb-2">
                    Admin Email Address
                  </label>
                  <input
                    id="adminEmail"
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-medium"
                    disabled={isAdding}
                  />
                  <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
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
                    className="flex-1 px-6 py-3 border-2 border-blue-400 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold text-lg"
                    disabled={isAdding}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-lg shadow-lg"
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5" />
                        Add Admin
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizationDetails;
