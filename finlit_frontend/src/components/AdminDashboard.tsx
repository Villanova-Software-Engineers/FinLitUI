/**
 * Admin Dashboard
 * Allows admin (professor/contact person) to manage class codes and view registered students
 * Includes detailed progress view with all attempt history
 * Navigate to /admin
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Eye
} from 'lucide-react';
import { useAuthContext } from '../auth/context/AuthContext';
import {
  createClassCode,
  getClassCodesByOrganization,
  getStudentsWithProgress
} from '../firebase/firestore.service';
import type { ClassCode, StudentWithProgress } from '../auth/types/auth.types';
import { MODULES } from '../hooks/useModuleScore';

// Helper function to format date
const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Module name lookup
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

  // Create code modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCodeName, setNewCodeName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdCode, setCreatedCode] = useState<ClassCode | null>(null);

  // Student detail view state
  const [selectedStudent, setSelectedStudent] = useState<StudentWithProgress | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      // Redirect non-admins
      navigate('/auth');
      return;
    }
    loadClassCodes();
  }, [user, navigate]);

  const loadClassCodes = async () => {
    if (!user?.organizationId) return;

    try {
      setLoadingCodes(true);
      const codes = await getClassCodesByOrganization(user.organizationId);
      setClassCodes(codes);
    } catch (err) {
      console.error('Error loading class codes:', err);
      setError('Failed to load class codes');
    } finally {
      setLoadingCodes(false);
    }
  };

  const loadStudents = async (code: ClassCode) => {
    try {
      setLoadingStudents(true);
      setSelectedCode(code);
      setSelectedStudent(null); // Reset selected student when changing class
      const studentList = await getStudentsWithProgress(code.code);
      setStudents(studentList);
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const toggleModuleExpanded = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.organizationId) return;

    try {
      setIsCreating(true);
      setError(null);
      const newCode = await createClassCode(newCodeName, user.organizationId, user.id);
      setCreatedCode(newCode);
      setNewCodeName('');
      loadClassCodes();
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

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">{user.organizationName}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class Codes List */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Class Codes</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"
              >
                <Plus size={16} />
                New Code
              </button>
            </div>

            {loadingCodes ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-gray-400" size={24} />
              </div>
            ) : classCodes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto mb-2 text-gray-300" size={40} />
                <p>No class codes yet</p>
                <p className="text-sm">Create one to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {classCodes.map((code) => (
                  <button
                    key={code.id}
                    onClick={() => loadStudents(code)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedCode?.id === code.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{code.name}</p>
                        <p className="text-xs font-mono text-gray-500">{code.code}</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Students List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            {selectedCode ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => {
                      setSelectedCode(null);
                      setStudents([]);
                    }}
                    className="lg:hidden p-1 hover:bg-gray-100 rounded"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">{selectedCode.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="font-mono">{selectedCode.code}</span>
                      <button
                        onClick={() => copyToClipboard(selectedCode.code)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {loadingStudents ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-gray-400" size={24} />
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="mx-auto mb-2 text-gray-300" size={48} />
                    <p className="text-lg">No students registered yet</p>
                    <p className="text-sm mt-1">
                      Share the code <span className="font-mono font-bold">{selectedCode.code}</span> with your students
                    </p>
                  </div>
                ) : selectedStudent ? (
                  /* Student Detail View */
                  <div>
                    <button
                      onClick={() => setSelectedStudent(null)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
                    >
                      <ArrowLeft size={16} />
                      Back to student list
                    </button>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {selectedStudent.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{selectedStudent.displayName}</h3>
                          <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-sm text-gray-500">Total XP</p>
                          <p className="text-2xl font-bold text-blue-600">{selectedStudent.progress?.totalXP ?? 0}</p>
                        </div>
                      </div>
                    </div>

                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 size={18} />
                      Module Progress & Attempt History
                    </h4>

                    {selectedStudent.progress?.moduleScores && selectedStudent.progress.moduleScores.length > 0 ? (
                      <div className="space-y-3">
                        {selectedStudent.progress.moduleScores.map((module) => (
                          <div key={module.moduleId} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Module Header */}
                            <div
                              className="flex items-center justify-between p-3 bg-white cursor-pointer hover:bg-gray-50"
                              onClick={() => toggleModuleExpanded(module.moduleId)}
                            >
                              <div className="flex items-center gap-3">
                                {module.passed ? (
                                  <CheckCircle className="text-green-500" size={20} />
                                ) : (
                                  <XCircle className="text-red-500" size={20} />
                                )}
                                <div>
                                  <p className="font-medium">{getModuleName(module.moduleId)}</p>
                                  <p className="text-xs text-gray-500">
                                    Best Score: {module.score}/{module.maxScore} • {module.attempts} attempt{module.attempts !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${module.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {module.passed ? 'PASSED' : 'NOT PASSED'}
                                </span>
                                {expandedModules.has(module.moduleId) ? (
                                  <ChevronUp size={18} className="text-gray-400" />
                                ) : (
                                  <ChevronDown size={18} className="text-gray-400" />
                                )}
                              </div>
                            </div>

                            {/* Attempt History (Expanded) */}
                            {expandedModules.has(module.moduleId) && module.attemptHistory && (
                              <div className="bg-gray-50 p-3 border-t border-gray-200">
                                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">Attempt History</p>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-left text-gray-500">
                                      <th className="pb-2">#</th>
                                      <th className="pb-2">Score</th>
                                      <th className="pb-2">Result</th>
                                      <th className="pb-2">Date & Time</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {module.attemptHistory.map((attempt, idx) => (
                                      <tr key={idx} className="border-t border-gray-200">
                                        <td className="py-2">{attempt.attemptNumber}</td>
                                        <td className="py-2">{attempt.score}/{attempt.maxScore}</td>
                                        <td className="py-2">
                                          {attempt.passed ? (
                                            <span className="text-green-600 flex items-center gap-1">
                                              <CheckCircle size={14} /> Passed
                                            </span>
                                          ) : (
                                            <span className="text-red-600 flex items-center gap-1">
                                              <XCircle size={14} /> Failed
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2 text-gray-500">
                                          <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {formatDateTime(attempt.completedAt)}
                                          </span>
                                        </td>
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
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="mx-auto mb-2 text-gray-300" size={40} />
                        <p>No module progress yet</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Students List View */
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Name</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Email</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">XP</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Modules</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Registered</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => {
                          const passedCount = student.progress?.moduleScores?.filter(m => m.passed).length ?? 0;
                          const totalModules = student.progress?.moduleScores?.length ?? 0;

                          return (
                            <tr key={student.userId} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-2 text-gray-900">{student.displayName}</td>
                              <td className="py-3 px-2 text-gray-600 text-sm">{student.email}</td>
                              <td className="py-3 px-2">
                                <span className="font-semibold text-blue-600">{student.progress?.totalXP ?? 0}</span>
                              </td>
                              <td className="py-3 px-2">
                                <span className={`text-sm ${passedCount === totalModules && totalModules > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                  {passedCount}/{totalModules} passed
                                </span>
                              </td>
                              <td className="py-3 px-2 text-gray-500 text-sm">
                                <div className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {student.registeredAt.toLocaleDateString()}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <button
                                  onClick={() => setSelectedStudent(student)}
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  <Eye size={14} />
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <p className="text-sm text-gray-500 mt-4">
                      Total: {students.length} student{students.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <Users className="mx-auto mb-3 text-gray-300" size={56} />
                <p className="text-lg">Select a class code</p>
                <p className="text-sm">to view registered students</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Code Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            {createdCode ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Created!</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Class Name</p>
                  <p className="font-medium text-gray-900">{createdCode.name}</p>

                  <p className="text-sm text-gray-600 mt-3 mb-1">Code for Students</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xl font-bold text-green-700 bg-green-100 px-3 py-1 rounded">
                      {createdCode.code}
                    </code>
                    <button
                      onClick={() => copyToClipboard(createdCode.code)}
                      className="p-2 hover:bg-green-100 rounded"
                    >
                      {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Share this code with your students so they can register for this class.
                </p>
                <button
                  onClick={closeModalAndReset}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Class Code</h3>
                <form onSubmit={handleCreateCode}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class Name
                    </label>
                    <input
                      type="text"
                      value={newCodeName}
                      onChange={(e) => setNewCodeName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Fall 2024 Section A"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      A unique code will be generated automatically
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeModalAndReset}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating || !newCodeName}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                      {isCreating ? 'Creating...' : 'Create Code'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
