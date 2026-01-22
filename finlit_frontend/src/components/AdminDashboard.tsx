/**
 * Admin Dashboard
 * Professional enterprise-style admin panel for managing students
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  Plus,
  Users,
  Calendar,
  ArrowLeft,
  Copy,
  Check,
  LogOut,
  ChevronRight,
  Loader2,
  XCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Eye,
  LayoutDashboard,
  Building2,
  Download,
  BookOpen,
  Shield,
  MoreHorizontal,
  Search,
  Filter
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
    const exportData = students.map(student => {
      const passedCount = student.progress?.moduleScores?.filter(m => m.passed).length ?? 0;
      const totalModules = student.progress?.moduleScores?.length ?? 0;
      const baseData: Record<string, string | number> = {
        'Name': student.displayName,
        'Email': student.email,
        'Total XP': student.progress?.totalXP ?? 0,
        'Streak': student.progress?.streak ?? 0,
        'Modules Passed': passedCount,
        'Total Attempted': totalModules,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white/95 backdrop-blur-sm shadow-xl border-r border-slate-200/60 p-6 flex flex-col">
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="text-white" size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-lg">FinLit</span>
            <span className="text-xs text-slate-500 font-medium">Admin Portal</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {user.role === 'owner' && (
            <button
              onClick={() => navigate('/admin-setup')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 rounded-xl transition-all duration-200"
            >
              <Building2 size={20} />
              Organizations
            </button>
          )}
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg rounded-xl">
            <Users size={20} />
            Students
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 rounded-xl transition-all duration-200"
          >
            <LayoutDashboard size={20} />
            View App
          </button>
        </nav>

        <div className="border-t border-slate-200/60 pt-6 mt-6">
          <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl mb-3">
            <p className="text-xs text-slate-500 truncate font-medium">{user?.email}</p>
            <p className="text-xs text-slate-400 font-medium">{user.role === 'owner' ? 'Super Admin' : user.organizationName}</p>
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
        <div className="max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Students Dashboard</h1>
              <p className="text-slate-600 mt-2 font-medium">
                {user.role === 'owner'
                  ? (selectedOrg ? `Viewing ${selectedOrg.name}` : 'Select an organization')
                  : user.organizationName}
              </p>
            </div>
            {selectedCode && students.length > 0 && (
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Download size={18} />
                Export Excel
              </button>
            )}
          </div>

          {error && (
            <div className="mb-6 px-5 py-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/60 rounded-xl text-sm text-red-700 flex items-center gap-3 shadow-sm">
              <XCircle size={18} className="text-red-500" />
              <span className="font-medium">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700 font-bold text-lg">×</button>
            </div>
          )}

          {/* Organization Selector for Super Admins */}
          {user.role === 'owner' && (
            <div className="mb-8 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-lg">
              <p className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Building2 size={16} className="text-blue-600" />
                Organization
              </p>
              {loadingOrgs ? (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Loader2 className="animate-spin text-blue-600" size={16} />
                  <span className="font-medium">Loading organizations...</span>
                </div>
              ) : organizations.length === 0 ? (
                <p className="text-sm text-slate-600">
                  No organizations found.{' '}
                  <button onClick={() => navigate('/admin-setup')} className="text-blue-600 hover:text-blue-700 font-semibold underline">
                    Create one
                  </button>
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => handleOrgSelect(org)}
                      className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg ${
                        selectedOrg?.id === org.id
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white transform scale-105'
                          : 'bg-white text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 hover:text-slate-800'
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
            <div className="grid grid-cols-12 gap-6">
              {/* Class Codes Sidebar */}
              <div className="col-span-3">
                <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-xl">
                  <div className="px-5 py-4 border-b border-slate-200/60 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Users size={18} className="text-blue-600" />
                      Classes
                    </h2>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-200 group"
                      title="New class"
                    >
                      <Plus size={18} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
                    </button>
                  </div>

                  {loadingCodes ? (
                    <div className="p-6 text-center">
                      <Loader2 className="animate-spin mx-auto text-blue-600" size={24} />
                      <p className="text-sm text-slate-600 mt-2 font-medium">Loading classes...</p>
                    </div>
                  ) : classCodes.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-600 font-medium">
                      No classes yet
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200/60">
                      {classCodes.map((code) => (
                        <button
                          key={code.id}
                          onClick={() => loadStudents(code)}
                          className={`w-full px-5 py-4 text-left hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-200 ${
                            selectedCode?.id === code.id ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600' : ''
                          }`}
                        >
                          <p className="text-sm font-semibold text-slate-800">{code.name}</p>
                          <p className="text-xs text-slate-500 font-mono mt-1 bg-slate-100 px-2 py-1 rounded-md inline-block">{code.code}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Students Area */}
              <div className="col-span-9">
                {selectedCode ? (
                  <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-xl">
                    {/* Class Header */}
                    <div className="px-6 py-5 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-blue-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Users className="text-white" size={20} />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-slate-800">{selectedCode.name}</h2>
                            <div className="flex items-center gap-3 mt-2">
                              <code className="text-sm font-mono font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg">{selectedCode.code}</code>
                              <button 
                                onClick={() => copyToClipboard(selectedCode.code)}
                                className="p-1 hover:bg-blue-100 rounded-md transition-colors"
                              >
                                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-slate-500" />}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Students</p>
                            <p className="text-2xl font-bold text-slate-800">{totalStudents}</p>
                          </div>
                          <div className="text-center bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg XP</p>
                            <p className="text-2xl font-bold text-slate-800">{avgXP}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {loadingStudents ? (
                      <div className="p-12 text-center">
                        <Loader2 className="animate-spin mx-auto text-blue-600" size={32} />
                        <p className="text-lg font-semibold text-slate-700 mt-3">Loading students...</p>
                      </div>
                    ) : students.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="text-blue-600" size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">No students registered</h3>
                        <p className="text-slate-500 mb-4">
                          Share code <span className="font-mono font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">{selectedCode.code}</span> with students
                        </p>
                      </div>
                    ) : selectedStudent ? (
                      /* Student Detail */
                      <div className="p-5">
                        <button
                          onClick={() => setSelectedStudent(null)}
                          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
                        >
                          <ArrowLeft size={14} />
                          Back to list
                        </button>

                        <div className="flex items-center gap-6 mb-8 pb-6 border-b border-slate-200/60">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                            {selectedStudent.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-slate-800">{selectedStudent.displayName}</h3>
                            <p className="text-slate-600 mt-1">{selectedStudent.email}</p>
                          </div>
                          <div className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 rounded-xl shadow-md border border-orange-200">
                            <div className="flex items-center gap-2 justify-center mb-1">
                              <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">XP</span>
                              </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-800">{selectedStudent.progress?.totalXP ?? 0}</p>
                            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Total XP</p>
                          </div>
                        </div>

                        <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                          <BarChart3 className="text-blue-600" size={20} />
                          Module Progress
                        </h4>
                        {selectedStudent.progress?.moduleScores && selectedStudent.progress.moduleScores.length > 0 ? (
                          <div className="space-y-2">
                            {selectedStudent.progress.moduleScores.map((module) => (
                              <div key={module.moduleId} className="border border-neutral-200 rounded-lg overflow-hidden">
                                <div
                                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-neutral-50"
                                  onClick={() => toggleModuleExpanded(module.moduleId)}
                                >
                                  <div className="flex items-center gap-3">
                                    {module.passed ? (
                                      <CheckCircle className="text-green-500" size={16} />
                                    ) : (
                                      <XCircle className="text-neutral-300" size={16} />
                                    )}
                                    <span className="text-sm font-medium text-neutral-900">{getModuleName(module.moduleId)}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm text-neutral-600">{module.score}/{module.maxScore}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${module.passed ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                                      {module.passed ? 'Passed' : 'Not passed'}
                                    </span>
                                    {expandedModules.has(module.moduleId) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </div>
                                </div>
                                {expandedModules.has(module.moduleId) && module.attemptHistory && (
                                  <div className="bg-neutral-50 px-4 py-3 border-t border-neutral-200">
                                    <p className="text-xs font-medium text-neutral-500 mb-2">Attempt History</p>
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="text-neutral-500">
                                          <th className="text-left pb-2">#</th>
                                          <th className="text-left pb-2">Score</th>
                                          <th className="text-left pb-2">Result</th>
                                          <th className="text-left pb-2">Date</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {module.attemptHistory.map((attempt, idx) => (
                                          <tr key={idx} className="text-neutral-700">
                                            <td className="py-1">{attempt.attemptNumber}</td>
                                            <td>{attempt.score}/{attempt.maxScore}</td>
                                            <td>{attempt.passed ? <span className="text-green-600">Pass</span> : <span className="text-neutral-400">Fail</span>}</td>
                                            <td className="text-neutral-500">{formatDateTime(attempt.completedAt)}</td>
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
                          <p className="text-sm text-neutral-500">No module progress yet</p>
                        )}
                      </div>
                    ) : (
                      /* Student Table */
                      <div className="overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-slate-100/70 to-blue-100/70 border-b border-slate-200/60">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">Student</th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">XP</th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">Progress</th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">Joined</th>
                              <th className="px-6 py-4 text-right text-sm font-bold text-slate-700 uppercase tracking-wide">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/60">
                            {students.map((student) => {
                              const passedCount = student.progress?.moduleScores?.filter(m => m.passed).length ?? 0;
                              const totalModules = student.progress?.moduleScores?.length ?? 0;
                              const progressPercentage = totalModules > 0 ? Math.round((passedCount / totalModules) * 100) : 0;
                              return (
                                <tr key={student.userId} className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/50 transition-all duration-200">
                                  <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg">
                                        {student.displayName.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-slate-800">{student.displayName}</p>
                                        <p className="text-sm text-slate-500">{student.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">XP</span>
                                      </div>
                                      <span className="text-lg font-bold text-slate-800">{student.progress?.totalXP ?? 0}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1">
                                        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                                          <span>{passedCount}/{totalModules} modules</span>
                                          <span>{progressPercentage}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                          <div 
                                            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-300"
                                            style={{width: `${progressPercentage}%`}}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-5 text-sm font-medium text-slate-600">{student.registeredAt.toLocaleDateString()}</td>
                                  <td className="px-6 py-5 text-right">
                                    <button
                                      onClick={() => setSelectedStudent(student)}
                                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 rounded-lg transition-all duration-200 border border-blue-200 hover:border-transparent"
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
                  <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-12 text-center shadow-xl">
                    <div className="w-24 h-24 bg-gradient-to-r from-slate-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="text-slate-400" size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Select a class to view students</h3>
                    <p className="text-slate-500">Choose a class from the sidebar to see student data and analytics</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-12 text-center shadow-xl">
              <div className="w-24 h-24 bg-gradient-to-r from-slate-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="text-slate-400" size={48} />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Select an organization to continue</h3>
              <p className="text-slate-500">Choose an organization from above to access student data</p>
            </div>
          )}
        </div>
      </main>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full border border-slate-200/60">
            <div className="px-6 py-5 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-blue-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                {createdCode ? (
                  <>
                    <CheckCircle className="text-green-600" size={20} />
                    Class Created Successfully
                  </>
                ) : (
                  <>
                    <Plus className="text-blue-600" size={20} />
                    Create New Class
                  </>
                )}
              </h3>
            </div>

            {createdCode ? (
              <div className="p-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 rounded-xl p-5 mb-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <Check className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-800">Class Created!</h4>
                      <p className="text-sm text-green-700">{createdCode.name}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Class Code:</p>
                    <div className="flex items-center gap-3">
                      <code className="text-xl font-mono font-bold text-blue-700 bg-blue-100 px-4 py-2 rounded-lg flex-1 text-center">{createdCode.code}</code>
                      <button 
                        onClick={() => copyToClipboard(createdCode.code)}
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-slate-500" />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-5 text-center">Share this code with your students to let them register for the class.</p>
                <button
                  onClick={closeModalAndReset}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateCode} className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Class Name</label>
                  <input
                    type="text"
                    value={newCodeName}
                    onChange={(e) => setNewCodeName(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50 hover:bg-white transition-colors"
                    placeholder="e.g., Fall 2024 Section A"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModalAndReset}
                    className="flex-1 py-3 text-sm font-semibold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !newCodeName}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
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
