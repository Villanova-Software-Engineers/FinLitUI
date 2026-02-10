/**
 * Admin Dashboard
 * Professional enterprise-style admin panel with Horizon UI styling
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  Plus,
  Users,
  ArrowLeft,
  Copy,
  Check,
  LogOut,
  Loader2,
  XCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Eye,
  LayoutDashboard,
  Building2,
  Download,
  BookOpen,
  Menu,
  X,
  Flame,
  HelpCircle,
  Search,
  Moon,
  Sun,
  Bell,
  Bug,
} from 'lucide-react';
import { useAuthContext } from '../auth/context/AuthContext';
import {
  createClassCode,
  getClassCodesByOrganization,
  getStudentsWithProgress,
  getAllOrganizations
} from '../firebase/firestore.service';
import type { ClassCode, StudentWithProgress, Organization } from '../auth/types/auth.types';
import { MODULES } from '../hooks/useModuleScore';

const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getModuleName = (moduleId: string): string => {
  const module = Object.values(MODULES).find(m => m.id === moduleId);
  return module?.name || moduleId;
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();

  const [classCodes, setClassCodes] = useState<ClassCode[]>([]);
  const [selectedCode, setSelectedCode] = useState<ClassCode | null>(null);
  const [students, setStudents] = useState<StudentWithProgress[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCodeName, setNewCodeName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdCode, setCreatedCode] = useState<ClassCode | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithProgress | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'owner') {
      navigate('/auth');
      return;
    }
    if (user?.role === 'owner') {
      loadOrganizations();
    } else {
      loadClassCodes(user?.organizationId);
    }
  }, [user, navigate]);

  const loadOrganizations = async () => {
    setLoadingOrgs(true);
    try {
      const orgs = await getAllOrganizations();
      setOrganizations(orgs);
      if (orgs.length === 1) {
        setSelectedOrg(orgs[0]);
        loadClassCodes(orgs[0].id);
      }
    } catch {
      setError('Failed to load organizations');
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleOrgSelect = (org: Organization) => {
    setSelectedOrg(org);
    setSelectedCode(null);
    setStudents([]);
    setSelectedStudent(null);
    loadClassCodes(org.id);
  };

  const loadClassCodes = async (organizationId?: string) => {
    if (!organizationId) return;
    setLoadingCodes(true);
    try {
      const codes = await getClassCodesByOrganization(organizationId);
      setClassCodes(codes);
    } catch {
      setError('Failed to load class codes');
    } finally {
      setLoadingCodes(false);
    }
  };

  const loadStudents = async (code: ClassCode) => {
    setLoadingStudents(true);
    setSelectedCode(code);
    setSelectedStudent(null);
    try {
      const studentList = await getStudentsWithProgress(code.code);
      setStudents(studentList);
    } catch {
      setError('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const toggleModuleExpanded = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) newSet.delete(moduleId);
      else newSet.add(moduleId);
      return newSet;
    });
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const orgId = user?.role === 'owner' ? selectedOrg?.id : user?.organizationId;
    if (!orgId) return;
    setIsCreating(true);
    setError(null);
    try {
      const newCode = await createClassCode(newCodeName, orgId, user!.id);
      setCreatedCode(newCode);
      setNewCodeName('');
      loadClassCodes(orgId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create code');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const closeModalAndReset = () => {
    setShowCreateModal(false);
    setCreatedCode(null);
    setNewCodeName('');
  };

  const exportToExcel = () => {
    if (!selectedCode || students.length === 0) return;
    const allSystemModules = Object.values(MODULES).length;
    const exportData = students.map(student => {
      const passedCount = student.progress?.moduleScores?.filter(m => m.passed).length ?? 0;
      const baseData: Record<string, string | number> = {
        'Name': student.displayName,
        'Email': student.email,
        'Total XP': student.progress?.totalXP ?? 0,
        'Streak': student.progress?.streak ?? 0,
        'Modules Passed': passedCount,
        'Total Modules': allSystemModules,
        'Registered': student.registeredAt.toLocaleDateString(),
      };
      student.progress?.moduleScores?.forEach(module => {
        baseData[`${getModuleName(module.moduleId)} Score`] = `${module.score}/${module.maxScore}`;
        baseData[`${getModuleName(module.moduleId)} Passed`] = module.passed ? 'Yes' : 'No';
      });
      return baseData;
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = Object.keys(exportData[0] || {}).map(key => ({ wch: Math.max(key.length, 12) }));
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `${selectedCode.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (!user || (user.role !== 'admin' && user.role !== 'owner')) return null;

  const totalStudents = students.length;
  const avgXP = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.progress?.totalXP ?? 0), 0) / students.length)
    : 0;

  const bgClass = darkMode ? 'bg-navy-900' : 'bg-gray-100';
  const cardClass = darkMode ? 'bg-navy-800 border-navy-700' : 'bg-white border-gray-200';
  const textClass = darkMode ? 'text-white' : 'text-navy-700';
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-600';
  const sidebarClass = darkMode ? 'bg-navy-800' : 'bg-white';

  return (
    <div className={`min-h-screen ${bgClass} font-dm`}>
      {/* Mobile Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-50 ${cardClass} shadow-xl px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 hover:bg-gray-100 ${darkMode ? 'hover:bg-navy-700' : ''} rounded-xl transition-colors`}
            >
              {mobileMenuOpen ? <X size={24} className={textClass} /> : <Menu size={24} className={textClass} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center">
                <BookOpen className="text-white" size={16} />
              </div>
              <span className={`font-bold ${textClass}`}>FinLit</span>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full ${darkMode ? 'bg-navy-700 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 bottom-0 w-[290px] ${sidebarClass} shadow-2xl flex flex-col z-40
        transform transition-all duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-8 py-8 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="text-white" size={20} />
            </div>
            <div>
              <span className={`font-poppins font-bold text-[26px] ${textClass}`}>
                FinLit <span className="font-medium">Admin</span>
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={`mx-6 h-px ${darkMode ? 'bg-white/20' : 'bg-gray-200'}`} />

        {/* Navigation */}
        <nav className="flex-1 px-4 pt-6 space-y-1">
          {user.role === 'owner' && (
            <button
              onClick={() => {
                navigate('/admin-setup');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${textSecondaryClass} hover:bg-gray-100 ${darkMode ? 'hover:bg-white/10' : ''}`}
            >
              <Building2 size={20} />
              Organizations
            </button>
          )}

          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-gradient-to-br from-brand-400 to-brand-500 shadow-lg shadow-brand-500/40 rounded-xl">
            <Users size={20} />
            Students
          </button>

          {user?.role === 'owner' && (
            <button
              onClick={() => {
                navigate('/admin/quiz-questions');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${textSecondaryClass} hover:bg-gray-100 ${darkMode ? 'hover:bg-white/10' : ''}`}
            >
              <HelpCircle size={20} />
              Quiz Questions
            </button>
          )}

          <button
            onClick={() => {
              navigate('/daily-challenge-admin');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${textSecondaryClass} hover:bg-gray-100 ${darkMode ? 'hover:bg-white/10' : ''}`}
          >
            <Flame size={20} />
            Daily Challenges
          </button>

          {user?.role === 'owner' && (
            <button
              onClick={() => {
                navigate('/admin/bug-reports');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${textSecondaryClass} hover:bg-gray-100 ${darkMode ? 'hover:bg-white/10' : ''}`}
            >
              <Bug size={20} />
              Bug Reports
            </button>
          )}

          <button
            onClick={() => {
              navigate('/dashboard');
              setMobileMenuOpen(false);
            }}
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
              <p className={`text-xs ${textSecondaryClass}`}>
                {user.role === 'owner' ? 'Super Admin' : user.organizationName}
              </p>
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

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-[290px] min-h-screen">
        {/* Navbar */}
        <nav className={`sticky top-4 z-20 mx-4 lg:mx-6 mt-4 flex items-center justify-between rounded-2xl ${
          darkMode ? 'bg-navy-800/60' : 'bg-white/60'
        } backdrop-blur-xl px-4 py-3 shadow-xl ${darkMode ? 'shadow-shadow-500' : ''}`}>
          <div className="hidden lg:block">
            <p className={`text-sm ${textSecondaryClass}`}>Pages / Students</p>
            <h1 className={`text-2xl font-bold ${textClass}`}>Students Dashboard</h1>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {/* Search */}
            <div className={`hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full ${
              darkMode ? 'bg-navy-700' : 'bg-gray-100'
            }`}>
              <Search size={16} className={textSecondaryClass} />
              <input
                type="text"
                placeholder="Search..."
                className={`bg-transparent text-sm outline-none w-32 lg:w-48 ${textClass} placeholder:${textSecondaryClass}`}
              />
            </div>

            {/* Notifications */}
            <button className={`p-2.5 rounded-full ${darkMode ? 'bg-navy-700' : 'bg-gray-100'}`}>
              <Bell size={18} className={textSecondaryClass} />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`hidden lg:flex p-2.5 rounded-full ${darkMode ? 'bg-navy-700' : 'bg-gray-100'}`}
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
        <div className="p-4 lg:p-6 pt-6 lg:pt-8">
          {/* Error Banner */}
          {error && (
            <div className="mb-6 px-5 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-500 flex items-center gap-3">
              <XCircle size={18} />
              <span className="font-medium">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto hover:text-red-700 font-bold">×</button>
            </div>
          )}

          {/* Organization Selector for Super Admins */}
          {user.role === 'owner' && (
            <div className={`mb-6 ${cardClass} rounded-2xl p-5 shadow-xl border`}>
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={18} className="text-brand-500" />
                <p className={`text-sm font-bold ${textClass} uppercase tracking-wide`}>Select Organization</p>
              </div>
              {loadingOrgs ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin text-brand-500" size={18} />
                  <span className={`text-sm ${textSecondaryClass}`}>Loading organizations...</span>
                </div>
              ) : organizations.length === 0 ? (
                <p className={`text-sm ${textSecondaryClass}`}>
                  No organizations found.{' '}
                  <button onClick={() => navigate('/admin-setup')} className="text-brand-500 hover:underline font-semibold">
                    Create one
                  </button>
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => handleOrgSelect(org)}
                      className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                        selectedOrg?.id === org.id
                          ? 'bg-gradient-to-br from-brand-400 to-brand-500 text-white shadow-lg shadow-brand-500/30'
                          : `${darkMode ? 'bg-navy-700 text-white hover:bg-navy-600' : 'bg-gray-100 text-navy-700 hover:bg-gray-200'}`
                      }`}
                    >
                      {org.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Main Grid */}
          {(user.role === 'admin' || selectedOrg) ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Class Codes Panel */}
              <div className="xl:col-span-3">
                <div className={`${cardClass} rounded-2xl shadow-xl border overflow-hidden`}>
                  <div className={`px-5 py-4 border-b ${darkMode ? 'border-navy-700' : 'border-gray-100'} flex items-center justify-between`}>
                    <h2 className={`text-lg font-bold ${textClass} flex items-center gap-2`}>
                      <Users size={18} className="text-brand-500" />
                      Classes
                    </h2>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="p-2 hover:bg-brand-500/10 rounded-xl transition-all duration-200 group"
                    >
                      <Plus size={18} className="text-brand-500" />
                    </button>
                  </div>

                  {loadingCodes ? (
                    <div className="p-6 text-center">
                      <Loader2 className="animate-spin mx-auto text-brand-500" size={28} />
                      <p className={`text-sm ${textSecondaryClass} mt-3`}>Loading classes...</p>
                    </div>
                  ) : classCodes.length === 0 ? (
                    <div className={`p-6 text-center text-sm ${textSecondaryClass}`}>
                      No classes yet. Create one to get started.
                    </div>
                  ) : (
                    <div className={`divide-y ${darkMode ? 'divide-navy-700' : 'divide-gray-100'} max-h-[500px] overflow-y-auto`}>
                      {classCodes.map((code) => (
                        <button
                          key={code.id}
                          onClick={() => loadStudents(code)}
                          className={`w-full px-5 py-4 text-left transition-all duration-200 ${
                            selectedCode?.id === code.id
                              ? `${darkMode ? 'bg-brand-500/20' : 'bg-brand-50'} border-l-4 border-brand-500`
                              : `hover:${darkMode ? 'bg-navy-700' : 'bg-gray-50'}`
                          }`}
                        >
                          <p className={`text-sm font-semibold ${textClass}`}>{code.name}</p>
                          <p className={`text-xs font-mono mt-1 px-2 py-1 rounded-lg inline-block ${
                            darkMode ? 'bg-navy-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>{code.code}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Students Area */}
              <div className="xl:col-span-9">
                {selectedCode ? (
                  <div className={`${cardClass} rounded-2xl shadow-xl border overflow-hidden`}>
                    {/* Class Header */}
                    <div className={`px-6 py-5 border-b ${darkMode ? 'border-navy-700 bg-navy-700/50' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30">
                            <Users className="text-white" size={24} />
                          </div>
                          <div>
                            <h2 className={`text-xl font-bold ${textClass}`}>{selectedCode.name}</h2>
                            <div className="flex items-center gap-3 mt-2">
                              <code className={`text-sm font-mono font-bold px-3 py-1 rounded-lg ${
                                darkMode ? 'bg-navy-600 text-brand-300' : 'bg-brand-50 text-brand-600'
                              }`}>{selectedCode.code}</code>
                              <button
                                onClick={() => copyToClipboard(selectedCode.code)}
                                className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-navy-600' : 'hover:bg-gray-100'}`}
                              >
                                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className={textSecondaryClass} />}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`text-center px-5 py-3 rounded-2xl ${darkMode ? 'bg-navy-600' : 'bg-white'} shadow-lg`}>
                            <p className={`text-xs font-semibold ${textSecondaryClass} uppercase tracking-wide`}>Students</p>
                            <p className={`text-2xl font-bold ${textClass}`}>{totalStudents}</p>
                          </div>
                          <div className={`text-center px-5 py-3 rounded-2xl ${darkMode ? 'bg-navy-600' : 'bg-white'} shadow-lg`}>
                            <p className={`text-xs font-semibold ${textSecondaryClass} uppercase tracking-wide`}>Avg XP</p>
                            <p className={`text-2xl font-bold ${textClass}`}>{avgXP}</p>
                          </div>
                          {students.length > 0 && (
                            <button
                              onClick={exportToExcel}
                              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl shadow-lg shadow-green-500/30 transition-all duration-200"
                            >
                              <Download size={18} />
                              Export
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {loadingStudents ? (
                      <div className="p-12 text-center">
                        <Loader2 className="animate-spin mx-auto text-brand-500" size={36} />
                        <p className={`text-lg font-semibold ${textClass} mt-4`}>Loading students...</p>
                      </div>
                    ) : students.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className={`w-24 h-24 ${darkMode ? 'bg-navy-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                          <Users className={textSecondaryClass} size={48} />
                        </div>
                        <h3 className={`text-lg font-bold ${textClass} mb-2`}>No students registered</h3>
                        <p className={textSecondaryClass}>
                          Share code <span className={`font-mono font-bold px-2 py-1 rounded ${darkMode ? 'bg-navy-700 text-brand-300' : 'bg-brand-50 text-brand-600'}`}>{selectedCode.code}</span> with students
                        </p>
                      </div>
                    ) : selectedStudent ? (
                      /* Student Detail View */
                      <div className="p-6">
                        <button
                          onClick={() => setSelectedStudent(null)}
                          className={`flex items-center gap-2 text-sm ${textSecondaryClass} hover:${darkMode ? 'text-white' : 'text-navy-700'} mb-6 transition-colors`}
                        >
                          <ArrowLeft size={16} />
                          Back to list
                        </button>

                        <div className={`flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-8 pb-6 border-b ${darkMode ? 'border-navy-700' : 'border-gray-200'}`}>
                          <div className="w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-500 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-brand-500/30">
                            {selectedStudent.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className={`text-2xl font-bold ${textClass}`}>{selectedStudent.displayName}</h3>
                            <p className={`${textSecondaryClass} mt-1`}>{selectedStudent.email}</p>
                          </div>
                          <div className={`text-center px-8 py-5 rounded-2xl ${darkMode ? 'bg-navy-700' : 'bg-gradient-to-br from-amber-50 to-orange-50'} border ${darkMode ? 'border-navy-600' : 'border-amber-200'}`}>
                            <div className="flex items-center gap-2 justify-center mb-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">XP</span>
                              </div>
                            </div>
                            <p className={`text-4xl font-bold ${textClass}`}>{selectedStudent.progress?.totalXP ?? 0}</p>
                            <p className={`text-xs font-semibold ${darkMode ? 'text-amber-400' : 'text-amber-600'} uppercase tracking-wide mt-1`}>Total XP</p>
                          </div>
                        </div>

                        <h4 className={`text-lg font-bold ${textClass} mb-6 flex items-center gap-2`}>
                          <BarChart3 className="text-brand-500" size={20} />
                          Module Progress
                        </h4>
                        {selectedStudent.progress?.moduleScores && selectedStudent.progress.moduleScores.length > 0 ? (
                          <div className="space-y-3">
                            {selectedStudent.progress.moduleScores.map((module) => (
                              <div key={module.moduleId} className={`border ${darkMode ? 'border-navy-700' : 'border-gray-200'} rounded-xl overflow-hidden`}>
                                <div
                                  className={`flex items-center justify-between px-4 py-3 cursor-pointer ${darkMode ? 'hover:bg-navy-700' : 'hover:bg-gray-50'} transition-colors`}
                                  onClick={() => toggleModuleExpanded(module.moduleId)}
                                >
                                  <div className="flex items-center gap-3">
                                    {module.passed ? (
                                      <CheckCircle className="text-green-500" size={18} />
                                    ) : (
                                      <XCircle className={textSecondaryClass} size={18} />
                                    )}
                                    <span className={`text-sm font-semibold ${textClass}`}>{getModuleName(module.moduleId)}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className={`text-sm ${textSecondaryClass}`}>{module.score}/{module.maxScore}</span>
                                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                      module.passed
                                        ? 'bg-green-500/10 text-green-500'
                                        : `${darkMode ? 'bg-navy-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`
                                    }`}>
                                      {module.passed ? 'Passed' : 'Not passed'}
                                    </span>
                                    {expandedModules.has(module.moduleId) ? <ChevronUp size={16} className={textSecondaryClass} /> : <ChevronDown size={16} className={textSecondaryClass} />}
                                  </div>
                                </div>
                                {expandedModules.has(module.moduleId) && module.attemptHistory && (
                                  <div className={`${darkMode ? 'bg-navy-700' : 'bg-gray-50'} px-4 py-4 border-t ${darkMode ? 'border-navy-600' : 'border-gray-200'}`}>
                                    <p className={`text-xs font-semibold ${textSecondaryClass} mb-3 uppercase tracking-wide`}>Attempt History</p>
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className={textSecondaryClass}>
                                          <th className="text-left pb-2 font-semibold">#</th>
                                          <th className="text-left pb-2 font-semibold">Score</th>
                                          <th className="text-left pb-2 font-semibold">Result</th>
                                          <th className="text-left pb-2 font-semibold">Date</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {module.attemptHistory.map((attempt, idx) => (
                                          <tr key={idx} className={textClass}>
                                            <td className="py-1.5">{attempt.attemptNumber}</td>
                                            <td>{attempt.score}/{attempt.maxScore}</td>
                                            <td>{attempt.passed ? <span className="text-green-500 font-semibold">Pass</span> : <span className={textSecondaryClass}>Fail</span>}</td>
                                            <td className={textSecondaryClass}>{formatDateTime(attempt.completedAt)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className={`text-sm ${textSecondaryClass}`}>No module progress yet</p>
                        )}
                      </div>
                    ) : (
                      /* Student Table */
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className={`${darkMode ? 'bg-navy-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-navy-600' : 'border-gray-200'}`}>
                            <tr>
                              <th className={`px-6 py-4 text-left text-xs font-bold ${textSecondaryClass} uppercase tracking-wide`}>Student</th>
                              <th className={`px-6 py-4 text-left text-xs font-bold ${textSecondaryClass} uppercase tracking-wide`}>XP</th>
                              <th className={`px-6 py-4 text-left text-xs font-bold ${textSecondaryClass} uppercase tracking-wide`}>Progress</th>
                              <th className={`px-6 py-4 text-left text-xs font-bold ${textSecondaryClass} uppercase tracking-wide`}>Joined</th>
                              <th className={`px-6 py-4 text-right text-xs font-bold ${textSecondaryClass} uppercase tracking-wide`}>Actions</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${darkMode ? 'divide-navy-700' : 'divide-gray-100'}`}>
                            {students.map((student) => {
                              const passedCount = student.progress?.moduleScores?.filter(m => m.passed).length ?? 0;
                              const allSystemModules = Object.values(MODULES).length;
                              const progressPercentage = Math.round((passedCount / allSystemModules) * 100);
                              return (
                                <tr key={student.userId} className={`${darkMode ? 'hover:bg-navy-700' : 'hover:bg-gray-50'} transition-colors`}>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                      <div className="w-11 h-11 bg-gradient-to-br from-brand-400 to-brand-500 rounded-full flex items-center justify-center text-base font-bold text-white shadow-lg shadow-brand-500/20">
                                        {student.displayName.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className={`text-sm font-semibold ${textClass}`}>{student.displayName}</p>
                                        <p className={`text-xs ${textSecondaryClass}`}>{student.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">XP</span>
                                      </div>
                                      <span className={`text-base font-bold ${textClass}`}>{student.progress?.totalXP ?? 0}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="w-40">
                                      <div className={`flex justify-between text-xs font-medium ${textSecondaryClass} mb-1.5`}>
                                        <span>{passedCount}/{allSystemModules} modules</span>
                                        <span>{progressPercentage}%</span>
                                      </div>
                                      <div className={`w-full ${darkMode ? 'bg-navy-600' : 'bg-gray-200'} rounded-full h-2`}>
                                        <div
                                          className="bg-gradient-to-r from-brand-400 to-brand-500 h-2 rounded-full transition-all duration-300"
                                          style={{width: `${progressPercentage}%`}}
                                        ></div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className={`px-6 py-4 text-sm ${textSecondaryClass}`}>{student.registeredAt.toLocaleDateString()}</td>
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      onClick={() => setSelectedStudent(student)}
                                      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                                        darkMode
                                          ? 'text-brand-400 hover:bg-brand-500/20'
                                          : 'text-brand-500 hover:bg-brand-50'
                                      }`}
                                    >
                                      <Eye size={16} />
                                      View
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`${cardClass} rounded-2xl p-12 text-center shadow-xl border`}>
                    <div className={`w-24 h-24 ${darkMode ? 'bg-navy-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                      <Users className={textSecondaryClass} size={48} />
                    </div>
                    <h3 className={`text-xl font-bold ${textClass} mb-2`}>Select a class to view students</h3>
                    <p className={textSecondaryClass}>Choose a class from the sidebar to see student data and analytics</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`${cardClass} rounded-2xl p-12 text-center shadow-xl border`}>
              <div className={`w-24 h-24 ${darkMode ? 'bg-navy-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <Building2 className={textSecondaryClass} size={48} />
              </div>
              <h3 className={`text-xl font-bold ${textClass} mb-2`}>Select an organization to continue</h3>
              <p className={textSecondaryClass}>Choose an organization from above to access student data</p>
            </div>
          )}
        </div>
      </main>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} rounded-2xl shadow-2xl max-w-md w-full border`}>
            <div className={`px-6 py-5 border-b ${darkMode ? 'border-navy-700 bg-navy-700' : 'border-gray-100 bg-gray-50'} rounded-t-2xl`}>
              <h3 className={`text-lg font-bold ${textClass} flex items-center gap-3`}>
                {createdCode ? (
                  <>
                    <CheckCircle className="text-green-500" size={22} />
                    Class Created Successfully
                  </>
                ) : (
                  <>
                    <Plus className="text-brand-500" size={22} />
                    Create New Class
                  </>
                )}
              </h3>
            </div>

            {createdCode ? (
              <div className="p-6">
                <div className={`${darkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'} border rounded-xl p-5 mb-5`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                      <Check className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-600">Class Created!</h4>
                      <p className="text-sm text-green-600">{createdCode.name}</p>
                    </div>
                  </div>
                  <div className={`${darkMode ? 'bg-navy-700' : 'bg-white'} rounded-xl p-4 border ${darkMode ? 'border-navy-600' : 'border-green-200'}`}>
                    <p className={`text-sm font-semibold ${textClass} mb-2`}>Class Code:</p>
                    <div className="flex items-center gap-3">
                      <code className={`text-xl font-mono font-bold flex-1 text-center py-2 rounded-lg ${darkMode ? 'bg-navy-600 text-brand-300' : 'bg-brand-50 text-brand-600'}`}>{createdCode.code}</code>
                      <button
                        onClick={() => copyToClipboard(createdCode.code)}
                        className={`p-2.5 rounded-xl transition-colors ${darkMode ? 'hover:bg-navy-600' : 'hover:bg-green-100'}`}
                      >
                        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className={textSecondaryClass} />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className={`text-sm ${textSecondaryClass} mb-5 text-center`}>Share this code with your students to let them register for the class.</p>
                <button
                  onClick={closeModalAndReset}
                  className="w-full py-3 bg-gradient-to-br from-brand-400 to-brand-500 text-white text-sm font-semibold rounded-xl hover:from-brand-500 hover:to-brand-600 transition-all duration-200 shadow-lg shadow-brand-500/30"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateCode} className="p-6">
                <div className="mb-6">
                  <label className={`block text-sm font-semibold ${textClass} mb-3`}>Class Name</label>
                  <input
                    type="text"
                    value={newCodeName}
                    onChange={(e) => setNewCodeName(e.target.value)}
                    className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${
                      darkMode
                        ? 'bg-navy-700 border-navy-600 text-white placeholder:text-gray-500'
                        : 'bg-gray-50 border-gray-200 text-navy-700 hover:bg-white'
                    }`}
                    placeholder="e.g., Fall 2024 Section A"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModalAndReset}
                    className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-colors ${
                      darkMode
                        ? 'text-gray-400 border border-navy-600 hover:bg-navy-700'
                        : 'text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !newCodeName}
                    className="flex-1 py-3 bg-gradient-to-br from-brand-400 to-brand-500 text-white text-sm font-semibold rounded-xl hover:from-brand-500 hover:to-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Create Class
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
