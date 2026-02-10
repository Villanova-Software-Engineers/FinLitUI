/**
 * Bug Report Admin Dashboard
 * Super admin interface for managing bug reports
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bug,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Save,
} from 'lucide-react';
import { useAuthContext } from '../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getAllBugReports,
  updateBugReportStatus,
  getBugReportStats,
  type BugReportSubmission,
} from '../firebase/bugReport.service';

const BugReportAdmin: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [bugReports, setBugReports] = useState<BugReportSubmission[]>([]);
  const [filteredReports, setFilteredReports] = useState<BugReportSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user?.role !== 'owner') {
      navigate('/dashboard');
      return;
    }

    loadBugReports();
    loadStats();
  }, [user, navigate]);

  useEffect(() => {
    filterReports();
  }, [bugReports, searchTerm, statusFilter, severityFilter]);

  const loadBugReports = async () => {
    setLoading(true);
    try {
      const reports = await getAllBugReports();
      setBugReports(reports);
    } catch (error) {
      console.error('Error loading bug reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statistics = await getBugReportStats();
      setStats(statistics);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filterReports = () => {
    let filtered = [...bugReports];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Filter by severity
    if (severityFilter !== 'all') {
      filtered = filtered.filter(report => report.severity === severityFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        report =>
          report.title.toLowerCase().includes(term) ||
          report.description.toLowerCase().includes(term) ||
          report.userEmail.toLowerCase().includes(term) ||
          report.userName.toLowerCase().includes(term)
      );
    }

    setFilteredReports(filtered);
  };

  const handleStatusUpdate = async (reportId: string, newStatus: BugReportSubmission['status']) => {
    setUpdatingStatus(reportId);
    try {
      await updateBugReportStatus(reportId, newStatus, undefined, user!.id);
      await loadBugReports();
      await loadStats();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleNotesUpdate = async (reportId: string) => {
    setUpdatingStatus(reportId);
    try {
      const report = bugReports.find(r => r.id === reportId);
      if (report) {
        await updateBugReportStatus(reportId, report.status, notes, user!.id);
        await loadBugReports();
      }
      setEditingNotes(null);
      setNotes('');
    } catch (error) {
      console.error('Error updating notes:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const toggleExpanded = (reportId: string) => {
    setExpandedReport(expandedReport === reportId ? null : reportId);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="text-blue-500" size={20} />;
      case 'in-progress':
        return <Clock className="text-yellow-500" size={20} />;
      case 'resolved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'wont-fix':
        return <XCircle className="text-gray-500" size={20} />;
      default:
        return <Bug size={20} />;
    }
  };

  if (!user || user.role !== 'owner') return null;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 font-dm">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-500/40">
              <Bug className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy-700">Bug Report Dashboard</h1>
              <p className="text-gray-600">Manage and track all user-reported bugs</p>
            </div>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase">Total</p>
                <p className="text-2xl font-bold text-navy-700">{stats.total}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 shadow-sm">
                <p className="text-xs font-semibold text-blue-600 uppercase">New</p>
                <p className="text-2xl font-bold text-blue-700">{stats.new}</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 shadow-sm">
                <p className="text-xs font-semibold text-yellow-600 uppercase">In Progress</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.inProgress}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200 shadow-sm">
                <p className="text-xs font-semibold text-green-600 uppercase">Resolved</p>
                <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm">
                <p className="text-xs font-semibold text-gray-600 uppercase">Won't Fix</p>
                <p className="text-2xl font-bold text-gray-700">{stats.wontFix}</p>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search bugs..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="wont-fix">Won't Fix</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bug Reports List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <Loader2 className="animate-spin mx-auto text-brand-500 mb-4" size={48} />
            <p className="text-gray-600">Loading bug reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <Bug className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No bug reports found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
              >
                {/* Report Header */}
                <div
                  onClick={() => toggleExpanded(report.id)}
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">{getStatusIcon(report.status)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-navy-700 mb-2">{report.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">{report.userName}</span>
                            <span className="text-gray-400">•</span>
                            <span>{report.userEmail}</span>
                          </span>
                          <span className={`px-3 py-1 rounded-full border font-semibold text-xs ${getSeverityColor(report.severity)}`}>
                            {report.severity.toUpperCase()}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-600 font-semibold text-xs">
                            {report.category.toUpperCase()}
                          </span>
                          <span className="text-gray-400">{report.submittedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedReport === report.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedReport === report.id && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Description */}
                      <div>
                        <h4 className="text-sm font-bold text-navy-700 mb-2">Description</h4>
                        <p className="text-gray-700 whitespace-pre-wrap bg-white p-4 rounded-xl border border-gray-200">
                          {report.description}
                        </p>
                      </div>

                      {/* Steps to Reproduce */}
                      {report.stepsToReproduce && (
                        <div>
                          <h4 className="text-sm font-bold text-navy-700 mb-2">Steps to Reproduce</h4>
                          <p className="text-gray-700 whitespace-pre-wrap bg-white p-4 rounded-xl border border-gray-200">
                            {report.stepsToReproduce}
                          </p>
                        </div>
                      )}

                      {/* Expected Behavior */}
                      {report.expectedBehavior && (
                        <div>
                          <h4 className="text-sm font-bold text-navy-700 mb-2">Expected Behavior</h4>
                          <p className="text-gray-700 whitespace-pre-wrap bg-white p-4 rounded-xl border border-gray-200">
                            {report.expectedBehavior}
                          </p>
                        </div>
                      )}

                      {/* Actual Behavior */}
                      {report.actualBehavior && (
                        <div>
                          <h4 className="text-sm font-bold text-navy-700 mb-2">Actual Behavior</h4>
                          <p className="text-gray-700 whitespace-pre-wrap bg-white p-4 rounded-xl border border-gray-200">
                            {report.actualBehavior}
                          </p>
                        </div>
                      )}

                      {/* Device Info */}
                      <div>
                        <h4 className="text-sm font-bold text-navy-700 mb-2">Device Info</h4>
                        <p className="text-gray-700 text-sm bg-white p-4 rounded-xl border border-gray-200 font-mono">
                          {report.deviceInfo}
                        </p>
                      </div>

                      {/* Browser Info */}
                      <div>
                        <h4 className="text-sm font-bold text-navy-700 mb-2">Browser Info</h4>
                        <p className="text-gray-700 text-sm bg-white p-4 rounded-xl border border-gray-200 font-mono break-all">
                          {report.browserInfo}
                        </p>
                      </div>
                    </div>

                    {/* Screenshots */}
                    {report.imageUrls.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-navy-700 mb-3">Screenshots</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {report.imageUrls.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative"
                            >
                              <img
                                src={url}
                                alt={`Screenshot ${index + 1}`}
                                className="w-full h-48 object-cover rounded-xl border border-gray-200"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                <ExternalLink className="text-white" size={32} />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Admin Notes */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-navy-700 flex items-center gap-2">
                          <MessageSquare size={16} />
                          Admin Notes
                        </h4>
                        {editingNotes !== report.id && (
                          <button
                            onClick={() => {
                              setEditingNotes(report.id);
                              setNotes(report.adminNotes || '');
                            }}
                            className="text-sm text-brand-500 hover:text-brand-600 font-semibold"
                          >
                            {report.adminNotes ? 'Edit' : 'Add Note'}
                          </button>
                        )}
                      </div>
                      {editingNotes === report.id ? (
                        <div>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[100px] resize-y mb-2"
                            placeholder="Add your notes here..."
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleNotesUpdate(report.id)}
                              disabled={updatingStatus === report.id}
                              className="px-4 py-2 bg-gradient-to-br from-brand-400 to-brand-600 text-white rounded-xl font-semibold hover:from-brand-500 hover:to-brand-700 transition-all flex items-center gap-2"
                            >
                              <Save size={16} />
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingNotes(null);
                                setNotes('');
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 whitespace-pre-wrap bg-white p-4 rounded-xl border border-gray-200">
                          {report.adminNotes || 'No notes added yet'}
                        </p>
                      )}
                    </div>

                    {/* Status Actions */}
                    <div>
                      <h4 className="text-sm font-bold text-navy-700 mb-3">Update Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {['new', 'in-progress', 'resolved', 'wont-fix'].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(report.id, status as BugReportSubmission['status'])}
                            disabled={updatingStatus === report.id || report.status === status}
                            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                              report.status === status
                                ? 'bg-brand-500 text-white'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {updatingStatus === report.id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              status.replace('-', ' ').toUpperCase()
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BugReportAdmin;
