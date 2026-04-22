/**
 * Admin Management Component
 * Styled exactly like What is Money module - colorful boxes, white backgrounds, same design
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  Sparkles,
  Award,
  Users,
  ArrowLeft,
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
  const navigate = useNavigate();
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
      <div className="min-h-screen flex justify-center items-center" style={{ background: 'linear-gradient(120deg, #e0f7fa 0%, #e8f5e9 50%, #e3f2fd 100%)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold tracking-wide">Loading Admins...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden pb-12" style={{ background: 'linear-gradient(120deg, #e0f7fa 0%, #e8f5e9 50%, #e3f2fd 100%)' }}>
      <div className="max-w-5xl mx-auto pt-16 px-6">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        {/* Header Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg">
              <Users className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-gray-800">Admin Management</h1>
          <p className="text-xl text-gray-600">
            Manage administrators for <span className="font-bold text-blue-600">{organizationName}</span>
          </p>
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

        {/* Super Admin or View Only Info Box */}
        {isSuperAdmin ? (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-10 py-4 rounded-2xl bg-blue-500 text-white font-bold text-lg shadow-xl hover:bg-blue-600 transition flex items-center gap-3"
            >
              <UserPlus className="h-6 w-6" />
              Add New Admin
            </button>
          </div>
        ) : (
          <motion.div
            className="p-8 rounded-3xl shadow-xl bg-white mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">View Only Access</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  You can view the admin list, but only the <span className="font-bold text-amber-600">organization super admin</span> can add or remove admins.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Admin Cards - Same style as What is Money boxes */}
        <div className="space-y-6 mb-12">
          {admins.map((admin, index) => (
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
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {admin.displayName || 'Admin'}
                    </h3>
                    {admin.isSuperAdmin && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <Award className="h-3 w-3 mr-1" />
                        Super Admin
                      </span>
                    )}
                    {admin.userId === currentUserId && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        You
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
                {!admin.isSuperAdmin && isSuperAdmin && (
                  <button
                    onClick={() => handleRemoveAdmin(admin.userId, admin.email)}
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

          {admins.length === 0 && (
            <motion.div
              className="p-12 rounded-3xl shadow-xl bg-white text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ShieldAlert className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 text-lg">No admins found</p>
            </motion.div>
          )}
        </div>

        {/* Info Box - Same style as What is Money */}
        <motion.div
          className="p-8 rounded-3xl shadow-xl bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Admin Permissions</h3>
              <div className="space-y-3">
                {[
                  "Only the organization super admin can add or remove admins",
                  "The super admin (first admin) cannot be removed",
                  "All admins have full access to manage students, classes, and content",
                  "Regular admins can view the admin list but cannot modify it"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-green-600 font-bold text-2xl">✓</span>
                    <p className="text-gray-700 text-lg">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
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

export default AdminManagement;
