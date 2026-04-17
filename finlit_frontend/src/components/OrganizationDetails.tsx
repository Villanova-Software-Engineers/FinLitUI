/**
 * Organization Details Component
 * Beautiful admin dashboard with slick UI matching Case Study and Module design
 * Features: Indigo/blue color scheme, rounded cards, smooth animations, clean typography
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium tracking-wide">LOADING ORGANIZATION</p>
        </motion.div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md bg-white rounded-3xl p-10 shadow-2xl border border-gray-100"
        >
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-600" size={48} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">Organization Not Found</h1>
          <p className="text-gray-500 mb-8 text-lg">The organization you're looking for could not be found.</p>
          <button
            onClick={() => navigate('/admin-setup')}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Back to Admin Setup
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with gradient */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.button
            onClick={() => navigate('/admin-setup')}
            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium group mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -4 }}
          >
            <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-indigo-50 transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span>All Organizations</span>
          </motion.button>

          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl flex items-center justify-center shadow-xl">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">{organization.name}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="text-lg">{organization.contactEmail}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden lg:block"
            >
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm font-bold text-indigo-900 uppercase tracking-wider">Organization ID</span>
                </div>
                <p className="font-mono text-sm text-gray-600">{orgId}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Admins</p>
                <p className="text-3xl font-black text-slate-900">{organization.admins.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Shield className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Super Admin</p>
                <p className="text-lg font-bold text-slate-900 truncate">
                  {organization.admins.find(a => a.isSuperAdmin)?.email || 'N/A'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Created</p>
                <p className="text-lg font-bold text-slate-900">{formatDate(organization.createdAt)}</p>
              </div>
            </div>
          </motion.div>
        </div>

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
              <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 p-2 hover:bg-red-100 rounded-lg transition-colors">
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
              <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800 p-2 hover:bg-green-100 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 inline-flex gap-2">
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'admins'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Admins ({organization.admins.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('locks')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'locks'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Module Access Control
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'admins' && (
            <motion.div
              key="admins"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Add Admin Button */}
              <div className="mb-6">
                <motion.button
                  onClick={() => setShowAddModal(true)}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-2xl hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-xl shadow-indigo-200 font-bold text-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UserPlus className="h-6 w-6" />
                  Add New Admin
                </motion.button>
              </div>

              {/* Admins List */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border-b border-gray-200">
                  <h2 className="text-2xl font-black text-slate-900">
                    Organization Admins ({organization.admins.length})
                  </h2>
                </div>

                <div className="divide-y divide-gray-100">
                  {organization.admins.map((admin, index) => (
                    <motion.div
                      key={admin.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-8 py-6 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className={`p-3 rounded-xl ${admin.isSuperAdmin ? 'bg-amber-100' : 'bg-indigo-100'}`}>
                              {admin.isSuperAdmin ? (
                                <Shield className="h-6 w-6 text-amber-600" />
                              ) : (
                                <ShieldAlert className="h-6 w-6 text-indigo-600" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-xl text-slate-900">
                                  {admin.displayName || 'Admin'}
                                </span>
                                {admin.isSuperAdmin && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    <Award className="h-3 w-3 mr-1" />
                                    Super Admin
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="ml-16 space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="h-4 w-4" />
                              <span className="font-medium">{admin.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">Added {formatDate(admin.addedAt)}</span>
                            </div>
                          </div>

                          {admin.isSuperAdmin && (
                            <div className="ml-16 mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                              <p className="text-sm text-amber-900 font-medium">
                                First admin created for this organization. Cannot be removed.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Remove Button */}
                        {!admin.isSuperAdmin && (
                          <motion.button
                            onClick={() => handleRemoveAdmin(admin.userId, admin.email, admin.isSuperAdmin)}
                            className="ml-4 text-red-600 hover:text-white hover:bg-red-600 p-3 rounded-xl transition-all border-2 border-red-200 hover:border-red-600"
                            title="Remove admin"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Trash2 className="h-5 w-5" />
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'locks' && user && (
            <motion.div
              key="locks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
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

      {/* Add Admin Modal */}
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
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <UserPlus className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">Add New Admin</h2>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewAdminEmail('');
                    setError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddAdmin} className="space-y-6">
                <div>
                  <label htmlFor="adminEmail" className="block text-sm font-bold text-gray-700 mb-2">
                    Admin Email Address
                  </label>
                  <input
                    id="adminEmail"
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-gray-900"
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
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-bold"
                    disabled={isAdding}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold shadow-lg"
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
