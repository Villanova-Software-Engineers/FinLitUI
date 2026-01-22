/**
 * Super Admin Setup Page
 * Professional enterprise-style admin panel
 */

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Mail,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Lock,
  LogOut,
  Users,
  LayoutDashboard,
  Shield,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Calendar,
  Loader2
} from 'lucide-react';
import { createOrganizationWithAdmin, getAllOrganizations, checkIsSuperAdmin } from '../firebase/firestore.service';
import { useAuthContext } from '../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Organization } from '../auth/types/auth.types';

interface CreatedOrg {
  organization: Organization;
  password: string;
}

const AdminSetup: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const navigate = useNavigate();

  const [orgName, setOrgName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdOrg, setCreatedOrg] = useState<CreatedOrg | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;
      if (!isAuthenticated || !user) {
        setCheckingAccess(false);
        setIsSuperAdmin(false);
        return;
      }
      try {
        const isSA = await checkIsSuperAdmin(user.id);
        setIsSuperAdmin(isSA);
      } catch {
        setIsSuperAdmin(false);
      } finally {
        setCheckingAccess(false);
      }
    };
    checkAccess();
  }, [user, isAuthenticated, authLoading]);

  useEffect(() => {
    if (isSuperAdmin) loadOrganizations();
  }, [isSuperAdmin]);

  const loadOrganizations = async () => {
    try {
      const orgs = await getAllOrganizations();
      setOrganizations(orgs);
    } catch {
      // ignore
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setCreatedOrg(null);
    try {
      const result = await createOrganizationWithAdmin(orgName, contactEmail, 'owner');
      setCreatedOrg(result);
      setOrgName('');
      setContactEmail('');
      loadOrganizations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSignOut = async () => {
    const { signOut } = await import('../auth/services/auth.service').then(m => m.AuthService);
    await signOut();
    navigate('/auth');
  };

  if (authLoading || checkingAccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-neutral-400" size={20} />
          </div>
          <h1 className="text-lg font-semibold text-neutral-900 mb-2">Access Denied</h1>
          <p className="text-sm text-neutral-500 mb-6">
            {!isAuthenticated ? 'Please sign in to continue.' : 'Super admin access required.'}
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="text-sm font-medium text-neutral-900 hover:text-neutral-600"
          >
            Go to login →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white/95 backdrop-blur-sm shadow-xl border-r border-slate-200/60 p-6 flex flex-col">
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="text-white" size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-lg">FinLit</span>
            <span className="text-xs text-slate-500 font-medium">Super Admin</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg rounded-xl">
            <Building2 size={20} />
            Organizations
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-gradient-to-r hover:from-slate-50 hover:to-purple-50 rounded-xl transition-all duration-200"
          >
            <Users size={20} />
            Student Data
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-gradient-to-r hover:from-slate-50 hover:to-purple-50 rounded-xl transition-all duration-200"
          >
            <LayoutDashboard size={20} />
            View App
          </button>
        </nav>

        <div className="border-t border-slate-200/60 pt-6 mt-6">
          <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl mb-3">
            <p className="text-xs text-slate-500 truncate font-medium">{user?.email}</p>
            <p className="text-xs text-purple-600 font-semibold mt-0.5">Super Administrator</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-5xl">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-slate-800 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">Organizations</h1>
            <p className="text-lg text-slate-600 font-medium">Manage institutions and their admin accounts</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Building2 className="text-white" size={24} />
                </div>
              </div>
              <p className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">Total Organizations</p>
              <p className="text-3xl font-bold text-slate-800">{organizations.length}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Users className="text-white" size={24} />
                </div>
              </div>
              <p className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">Active Admins</p>
              <p className="text-3xl font-bold text-slate-800">{organizations.length}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="text-white" size={24} />
                </div>
              </div>
              <p className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">System Status</p>
              <p className="text-lg font-bold text-green-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                All Systems Operational
              </p>
            </div>
          </div>

          {/* Create Organization */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-xl mb-8">
            <div className="px-6 py-5 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-purple-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <Plus className="text-purple-600" size={24} />
                Add New Organization
              </h2>
              <p className="text-slate-600 mt-1">Create a new institution with admin access</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Building2 size={16} className="text-purple-600" />
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-slate-50 hover:bg-white transition-all duration-200 font-medium"
                    placeholder="Stanford University"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Mail size={16} className="text-purple-600" />
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-slate-50 hover:bg-white transition-all duration-200 font-medium"
                    placeholder="admin@stanford.edu"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="mt-6 px-5 py-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/60 rounded-xl text-sm text-red-700 flex items-center gap-3 shadow-sm">
                  <XCircle size={18} className="text-red-500" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-slate-50 to-purple-50 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-slate-500" />
                  <p className="text-sm text-slate-600 font-medium">A secure password will be auto-generated for the admin</p>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !orgName || !contactEmail}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Create Organization
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Success */}
            {createdOrg && (
              <div className="px-6 pb-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <Check className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-800 text-lg">Organization Created Successfully!</h4>
                      <p className="text-green-700">{createdOrg.organization.name}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between py-3 border-b border-green-100">
                        <span className="text-slate-700 font-semibold flex items-center gap-2">
                          <Mail size={16} className="text-green-600" />
                          Admin Email
                        </span>
                        <div className="flex items-center gap-3">
                          <code className="text-slate-800 font-mono bg-slate-100 px-3 py-1 rounded-lg">{createdOrg.organization.contactEmail}</code>
                          <button 
                            onClick={() => copyToClipboard(createdOrg.organization.contactEmail, 'email')}
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            {copied === 'email' ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-slate-500" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-slate-700 font-semibold flex items-center gap-2">
                          <Lock size={16} className="text-green-600" />
                          Admin Password
                        </span>
                        <div className="flex items-center gap-3">
                          <code className="text-slate-800 font-mono bg-slate-100 px-3 py-1 rounded-lg min-w-[120px] text-center">
                            {showPassword ? createdOrg.password : '••••••••••'}
                          </code>
                          <button 
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            {showPassword ? <EyeOff size={16} className="text-slate-500" /> : <Eye size={16} className="text-slate-500" />}
                          </button>
                          <button 
                            onClick={() => copyToClipboard(createdOrg.password, 'password')}
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            {copied === 'password' ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-slate-500" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Organizations Table */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-purple-50/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  <Building2 className="text-purple-600" size={24} />
                  All Organizations
                </h2>
                <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200">
                  <span className="text-sm font-bold text-slate-700">{organizations.length} total</span>
                </div>
              </div>
            </div>

            {loadingOrgs ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                <p className="text-lg font-semibold text-slate-700 mt-3">Loading organizations...</p>
              </div>
            ) : organizations.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-slate-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="text-slate-400" size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">No organizations yet</h3>
                <p className="text-slate-500">Create your first organization using the form above.</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-100/70 to-purple-100/70 border-b border-slate-200/60">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">Organization</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">Admin Email</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">Created</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-slate-700 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {organizations.map((org) => (
                      <tr key={org.id} className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-purple-50/50 transition-all duration-200">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-lg">
                              {org.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{org.name}</p>
                              <p className="text-xs text-slate-500">Organization</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Mail size={16} className="text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">{org.contactEmail}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-slate-400" />
                            <span className="text-sm font-medium text-slate-600">{org.createdAt.toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors group">
                            <MoreHorizontal size={18} className="text-slate-400 group-hover:text-slate-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSetup;
