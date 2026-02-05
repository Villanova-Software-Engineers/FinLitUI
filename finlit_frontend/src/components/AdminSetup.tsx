/**
 * Super Admin Setup Page
 * Professional enterprise-style admin panel with Horizon UI styling
 */

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Mail,
  Eye,
  EyeOff,
  Copy,
  Check,
  CheckCircle,
  Plus,
  Lock,
  LogOut,
  Users,
  LayoutDashboard,
  Shield,
  MoreHorizontal,
  XCircle,
  Calendar,
  Loader2,
  HelpCircle,
  Flame,
  Search,
  Moon,
  Sun,
  Bell,
  BookOpen
} from 'lucide-react';
import { createOrganizationWithAdmin, getAllOrganizations, checkIsSuperAdmin, getQuizQuestions } from '../firebase/firestore.service';
import { useAuthContext } from '../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Organization, QuizQuestion } from '../auth/types/auth.types';

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
  const [darkMode, setDarkMode] = useState(false);

  // Quiz Questions State (just for display count)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

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
    if (isSuperAdmin) {
      loadOrganizations();
      loadQuizQuestions();
    }
  }, [isSuperAdmin]);

  const loadQuizQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const questions = await getQuizQuestions();
      setQuizQuestions(questions);
    } catch {
      // ignore - just for count display
    } finally {
      setLoadingQuestions(false);
    }
  };

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

  // Theme classes
  const bgClass = darkMode ? 'bg-navy-900' : 'bg-gray-100';
  const cardClass = darkMode ? 'bg-navy-800 border-navy-700' : 'bg-white border-gray-200';
  const textClass = darkMode ? 'text-white' : 'text-navy-700';
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-600';
  const sidebarClass = darkMode ? 'bg-navy-800' : 'bg-white';

  if (authLoading || checkingAccess) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
          <p className={textSecondaryClass}>Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isSuperAdmin) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center p-6`}>
        <div className={`max-w-sm text-center ${cardClass} rounded-2xl p-8 shadow-xl border`}>
          <div className={`w-16 h-16 ${darkMode ? 'bg-navy-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-5`}>
            <Lock className={textSecondaryClass} size={28} />
          </div>
          <h1 className={`text-xl font-bold ${textClass} mb-3`}>Access Denied</h1>
          <p className={`text-sm ${textSecondaryClass} mb-6`}>
            {!isAuthenticated ? 'Please sign in to continue.' : 'Super admin access required.'}
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-3 bg-gradient-to-br from-brand-400 to-brand-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-500/30 hover:from-brand-500 hover:to-brand-600 transition-all"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} font-dm`}>
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-[290px] ${sidebarClass} shadow-2xl flex flex-col z-40`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-8 py-8 mt-2">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="text-white" size={20} />
          </div>
          <div>
            <span className={`font-poppins font-bold text-[26px] ${textClass}`}>
              FinLit <span className="font-medium">Super</span>
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className={`mx-6 h-px ${darkMode ? 'bg-white/20' : 'bg-gray-200'}`} />

        {/* Navigation */}
        <nav className="flex-1 px-4 pt-6 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-gradient-to-br from-brand-400 to-brand-500 shadow-lg shadow-brand-500/40 rounded-xl">
            <Building2 size={20} />
            Organizations
          </button>

          <button
            onClick={() => navigate('/admin/quiz-questions')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${textSecondaryClass} hover:bg-gray-100 ${darkMode ? 'hover:bg-white/10' : ''}`}
          >
            <HelpCircle size={20} />
            Quiz Questions
          </button>

          <button
            onClick={() => navigate('/daily-challenge-admin')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${textSecondaryClass} hover:bg-gray-100 ${darkMode ? 'hover:bg-white/10' : ''}`}
          >
            <Flame size={20} />
            Daily Challenges
          </button>

          <button
            onClick={() => navigate('/case-study-admin')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${textSecondaryClass} hover:bg-gray-100 ${darkMode ? 'hover:bg-white/10' : ''}`}
          >
            <BookOpen size={20} />
            Case Studies
          </button>

          <button
            onClick={() => navigate('/admin')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${textSecondaryClass} hover:bg-gray-100 ${darkMode ? 'hover:bg-white/10' : ''}`}
          >
            <Users size={20} />
            Student Data
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${textSecondaryClass} hover:bg-gray-100 ${darkMode ? 'hover:bg-white/10' : ''}`}
          >
            <LayoutDashboard size={20} />
            View App
          </button>
        </nav>

        {/* User Section */}
        <div className={`mx-4 mb-6 p-4 rounded-2xl ${darkMode ? 'bg-navy-700' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${textClass} truncate`}>{user?.email}</p>
              <p className="text-xs text-brand-500 font-semibold">Super Administrator</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
              darkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'
            }`}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[290px] min-h-screen">
        {/* Navbar */}
        <nav className={`sticky top-4 z-20 mx-6 mt-4 flex items-center justify-between rounded-2xl ${
          darkMode ? 'bg-navy-800/60' : 'bg-white/60'
        } backdrop-blur-xl px-4 py-3 shadow-xl`}>
          <div>
            <p className={`text-sm ${textSecondaryClass}`}>Pages / Organizations</p>
            <h1 className={`text-2xl font-bold ${textClass}`}>Organizations</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full ${
              darkMode ? 'bg-navy-700' : 'bg-gray-100'
            }`}>
              <Search size={16} className={textSecondaryClass} />
              <input
                type="text"
                placeholder="Search..."
                className={`bg-transparent text-sm outline-none w-48 ${textClass}`}
              />
            </div>

            {/* Notifications */}
            <button className={`p-2.5 rounded-full ${darkMode ? 'bg-navy-700' : 'bg-gray-100'}`}>
              <Bell size={18} className={textSecondaryClass} />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-full ${darkMode ? 'bg-navy-700' : 'bg-gray-100'}`}
            >
              {darkMode ? <Sun size={18} className="text-white" /> : <Moon size={18} className={textSecondaryClass} />}
            </button>

            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold cursor-pointer">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="p-6 pt-8">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`${cardClass} rounded-2xl p-6 shadow-xl border`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <Building2 className="text-white" size={26} />
                </div>
              </div>
              <p className={`text-sm font-semibold ${textSecondaryClass} uppercase tracking-wide mb-2`}>Total Organizations</p>
              <p className={`text-4xl font-bold ${textClass}`}>{organizations.length}</p>
            </div>

            <div className={`${cardClass} rounded-2xl p-6 shadow-xl border`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Users className="text-white" size={26} />
                </div>
              </div>
              <p className={`text-sm font-semibold ${textSecondaryClass} uppercase tracking-wide mb-2`}>Active Admins</p>
              <p className={`text-4xl font-bold ${textClass}`}>{organizations.length}</p>
            </div>

            <div className={`${cardClass} rounded-2xl p-6 shadow-xl border`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <CheckCircle className="text-white" size={26} />
                </div>
              </div>
              <p className={`text-sm font-semibold ${textSecondaryClass} uppercase tracking-wide mb-2`}>System Status</p>
              <p className="text-lg font-bold text-green-500 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                All Systems Operational
              </p>
            </div>
          </div>

          {/* Create Organization */}
          <div className={`${cardClass} rounded-2xl shadow-xl border mb-8 overflow-hidden`}>
            <div className={`px-6 py-5 border-b ${darkMode ? 'border-navy-700 bg-navy-700/50' : 'border-gray-100 bg-gray-50'}`}>
              <h2 className={`text-xl font-bold ${textClass} flex items-center gap-3`}>
                <Plus className="text-brand-500" size={24} />
                Add New Organization
              </h2>
              <p className={`${textSecondaryClass} mt-1 text-sm`}>Create a new institution with admin access</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-semibold ${textClass} mb-3 flex items-center gap-2`}>
                    <Building2 size={16} className="text-brand-500" />
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${
                      darkMode
                        ? 'bg-navy-700 border-navy-600 text-white placeholder:text-gray-500'
                        : 'bg-gray-50 border-gray-200 text-navy-700 hover:bg-white'
                    }`}
                    placeholder="Stanford University"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${textClass} mb-3 flex items-center gap-2`}>
                    <Mail size={16} className="text-brand-500" />
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${
                      darkMode
                        ? 'bg-navy-700 border-navy-600 text-white placeholder:text-gray-500'
                        : 'bg-gray-50 border-gray-200 text-navy-700 hover:bg-white'
                    }`}
                    placeholder="admin@stanford.edu"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="mt-6 px-5 py-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500 flex items-center gap-3">
                  <XCircle size={18} />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div className={`mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl ${darkMode ? 'bg-navy-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <Lock size={16} className={textSecondaryClass} />
                  <p className={`text-sm ${textSecondaryClass}`}>A secure password will be auto-generated for the admin</p>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !orgName || !contactEmail}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-br from-brand-400 to-brand-500 text-white text-sm font-semibold rounded-xl hover:from-brand-500 hover:to-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
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
                <div className={`${darkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'} border rounded-xl p-6`}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                      <Check className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-600 text-lg">Organization Created Successfully!</h4>
                      <p className="text-green-600">{createdOrg.organization.name}</p>
                    </div>
                  </div>
                  <div className={`${darkMode ? 'bg-navy-700' : 'bg-white'} rounded-xl p-5 border ${darkMode ? 'border-navy-600' : 'border-green-200'}`}>
                    <div className={`flex items-center justify-between py-3 border-b ${darkMode ? 'border-navy-600' : 'border-green-100'}`}>
                      <span className={`${textClass} font-semibold flex items-center gap-2`}>
                        <Mail size={16} className="text-green-500" />
                        Admin Email
                      </span>
                      <div className="flex items-center gap-3">
                        <code className={`font-mono px-3 py-1 rounded-lg ${darkMode ? 'bg-navy-600 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                          {createdOrg.organization.contactEmail}
                        </code>
                        <button
                          onClick={() => copyToClipboard(createdOrg.organization.contactEmail, 'email')}
                          className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-navy-600' : 'hover:bg-green-100'}`}
                        >
                          {copied === 'email' ? <Check size={16} className="text-green-500" /> : <Copy size={16} className={textSecondaryClass} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className={`${textClass} font-semibold flex items-center gap-2`}>
                        <Lock size={16} className="text-green-500" />
                        Admin Password
                      </span>
                      <div className="flex items-center gap-3">
                        <code className={`font-mono px-3 py-1 rounded-lg min-w-[120px] text-center ${darkMode ? 'bg-navy-600 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                          {showPassword ? createdOrg.password : '••••••••••'}
                        </code>
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-navy-600' : 'hover:bg-green-100'}`}
                        >
                          {showPassword ? <EyeOff size={16} className={textSecondaryClass} /> : <Eye size={16} className={textSecondaryClass} />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(createdOrg.password, 'password')}
                          className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-navy-600' : 'hover:bg-green-100'}`}
                        >
                          {copied === 'password' ? <Check size={16} className="text-green-500" /> : <Copy size={16} className={textSecondaryClass} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Organizations Table */}
          <div className={`${cardClass} rounded-2xl shadow-xl border overflow-hidden mb-8`}>
            <div className={`px-6 py-5 border-b ${darkMode ? 'border-navy-700 bg-navy-700/50' : 'border-gray-100 bg-gray-50'} flex items-center justify-between`}>
              <h2 className={`text-xl font-bold ${textClass} flex items-center gap-3`}>
                <Building2 className="text-brand-500" size={24} />
                All Organizations
              </h2>
              <div className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-navy-600' : 'bg-white'} shadow-lg`}>
                <span className={`text-sm font-bold ${textClass}`}>{organizations.length} total</span>
              </div>
            </div>

            {loadingOrgs ? (
              <div className="p-12 text-center">
                <Loader2 className="w-10 h-10 text-brand-500 animate-spin mx-auto" />
                <p className={`text-lg font-semibold ${textClass} mt-4`}>Loading organizations...</p>
              </div>
            ) : organizations.length === 0 ? (
              <div className="p-12 text-center">
                <div className={`w-24 h-24 ${darkMode ? 'bg-navy-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Building2 className={textSecondaryClass} size={48} />
                </div>
                <h3 className={`text-lg font-bold ${textClass} mb-2`}>No organizations yet</h3>
                <p className={textSecondaryClass}>Create your first organization using the form above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-navy-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-navy-600' : 'border-gray-200'}`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-bold ${textSecondaryClass} uppercase tracking-wide`}>Organization</th>
                      <th className={`px-6 py-4 text-left text-xs font-bold ${textSecondaryClass} uppercase tracking-wide`}>Admin Email</th>
                      <th className={`px-6 py-4 text-left text-xs font-bold ${textSecondaryClass} uppercase tracking-wide`}>Created</th>
                      <th className={`px-6 py-4 text-right text-xs font-bold ${textSecondaryClass} uppercase tracking-wide`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-navy-700' : 'divide-gray-100'}`}>
                    {organizations.map((org) => (
                      <tr key={org.id} className={`${darkMode ? 'hover:bg-navy-700' : 'hover:bg-gray-50'} transition-colors`}>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-500 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-brand-500/20">
                              {org.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${textClass}`}>{org.name}</p>
                              <p className={`text-xs ${textSecondaryClass}`}>Organization</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Mail size={16} className={textSecondaryClass} />
                            <span className={`text-sm ${textClass}`}>{org.contactEmail}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className={textSecondaryClass} />
                            <span className={`text-sm ${textSecondaryClass}`}>{org.createdAt.toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-navy-600' : 'hover:bg-gray-100'}`}>
                            <MoreHorizontal size={18} className={textSecondaryClass} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quiz Questions Quick Link */}
          <div
            onClick={() => navigate('/admin/quiz-questions')}
            className={`${cardClass} rounded-2xl shadow-xl border p-6 cursor-pointer hover:shadow-2xl transition-all group`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform">
                  <HelpCircle className="text-white" size={32} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${textClass}`}>Quiz Questions</h2>
                  <p className={`${textSecondaryClass} text-sm`}>Manage Global Economic News Quiz</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold text-teal-500 bg-teal-500/10 px-4 py-2 rounded-xl">
                  {loadingQuestions ? '...' : quizQuestions.length} questions
                </div>
                <div className={`w-12 h-12 ${darkMode ? 'bg-navy-700' : 'bg-gray-100'} rounded-full flex items-center justify-center group-hover:bg-teal-500/20 transition-colors`}>
                  <Plus className={`${textSecondaryClass} group-hover:text-teal-500`} size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSetup;
