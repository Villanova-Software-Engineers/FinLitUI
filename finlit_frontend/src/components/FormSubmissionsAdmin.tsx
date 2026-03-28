/**
 * Form Submissions Admin Dashboard
 * Super admin interface for managing contact and organization inquiry submissions
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Building2,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Save,
  Download,
  ArrowLeft,
} from 'lucide-react';
import { useAuthContext } from '../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import * as XLSX from 'xlsx';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  userId: string | null;
  submittedAt: Timestamp;
  status: 'new' | 'in-progress' | 'resolved';
  adminNotes?: string;
}

interface OrganizationInquiry {
  id: string;
  organizationName: string;
  organizationType: string;
  location: string;
  participantCount: string;
  duration: string;
  requirements: string;
  otherDetails: string;
  contactEmail: string;
  contactName: string;
  submittedAt: Timestamp;
  status: 'new' | 'in-progress' | 'resolved';
  adminNotes?: string;
}

const FormSubmissionsAdmin: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [orgInquiries, setOrgInquiries] = useState<OrganizationInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contact' | 'organizations'>('contact');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'owner') {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load contact submissions
      const contactQuery = query(
        collection(db, 'contactSubmissions'),
        orderBy('submittedAt', 'desc')
      );
      const contactSnapshot = await getDocs(contactQuery);
      const contactData = contactSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContactSubmission[];
      setContactSubmissions(contactData);

      // Load organization inquiries
      const orgQuery = query(
        collection(db, 'organizationInquiries'),
        orderBy('submittedAt', 'desc')
      );
      const orgSnapshot = await getDocs(orgQuery);
      const orgData = orgSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as OrganizationInquiry[];
      setOrgInquiries(orgData);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    id: string,
    newStatus: 'new' | 'in-progress' | 'resolved',
    collectionName: 'contactSubmissions' | 'organizationInquiries'
  ) => {
    setUpdatingStatus(id);
    try {
      await updateDoc(doc(db, collectionName, id), {
        status: newStatus
      });
      await loadData();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const saveNotes = async (
    id: string,
    notes: string,
    collectionName: 'contactSubmissions' | 'organizationInquiries'
  ) => {
    try {
      await updateDoc(doc(db, collectionName, id), {
        adminNotes: notes
      });
      setEditingNotes(null);
      await loadData();
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const exportToExcel = () => {
    const data = activeTab === 'contact' ? contactSubmissions : orgInquiries;
    const worksheet = XLSX.utils.json_to_sheet(
      data.map(item => {
        const baseData: any = {
          Status: item.status,
          'Submitted At': item.submittedAt?.toDate?.()?.toLocaleString() || 'N/A',
        };

        if (activeTab === 'contact') {
          const contact = item as ContactSubmission;
          return {
            ...baseData,
            Name: contact.name,
            Email: contact.email,
            Subject: contact.subject,
            Message: contact.message,
            'Admin Notes': contact.adminNotes || '',
          };
        } else {
          const org = item as OrganizationInquiry;
          return {
            ...baseData,
            'Organization Name': org.organizationName,
            'Organization Type': org.organizationType,
            Location: org.location,
            'Participant Count': org.participantCount,
            Duration: org.duration,
            'Contact Name': org.contactName,
            'Contact Email': org.contactEmail,
            Requirements: org.requirements,
            'Other Details': org.otherDetails,
            'Admin Notes': org.adminNotes || '',
          };
        }
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      activeTab === 'contact' ? 'Contact Submissions' : 'Organization Inquiries'
    );
    XLSX.writeFile(
      workbook,
      `${activeTab}-submissions-${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  const getFilteredData = () => {
    const data = activeTab === 'contact' ? contactSubmissions : orgInquiries;
    return data.filter(item => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesSearch = searchTerm === '' ||
        (activeTab === 'contact'
          ? (item as ContactSubmission).name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item as ContactSubmission).email.toLowerCase().includes(searchTerm.toLowerCase())
          : (item as OrganizationInquiry).organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item as OrganizationInquiry).contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
        );
      return matchesStatus && matchesSearch;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-blue-100 text-blue-700 border-blue-200',
      'in-progress': 'bg-amber-100 text-amber-700 border-amber-200',
      resolved: 'bg-green-100 text-green-700 border-green-200',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const stats = {
    contact: {
      total: contactSubmissions.length,
      new: contactSubmissions.filter(s => s.status === 'new').length,
      inProgress: contactSubmissions.filter(s => s.status === 'in-progress').length,
      resolved: contactSubmissions.filter(s => s.status === 'resolved').length,
    },
    org: {
      total: orgInquiries.length,
      new: orgInquiries.filter(s => s.status === 'new').length,
      inProgress: orgInquiries.filter(s => s.status === 'in-progress').length,
      resolved: orgInquiries.filter(s => s.status === 'resolved').length,
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  const filteredData = getFilteredData();
  const currentStats = activeTab === 'contact' ? stats.contact : stats.org;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50/30 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-navy-700 hover:text-brand-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Admin Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-navy-800">Form Submissions</h1>
              <p className="text-slate-600 mt-1">Manage contact and organization inquiries</p>
            </div>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export to Excel
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
                activeTab === 'contact'
                  ? 'text-brand-600 border-b-2 border-brand-600'
                  : 'text-slate-600 hover:text-navy-800'
              }`}
            >
              <Mail className="w-4 h-4" />
              Contact Submissions ({stats.contact.total})
            </button>
            <button
              onClick={() => setActiveTab('organizations')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
                activeTab === 'organizations'
                  ? 'text-brand-600 border-b-2 border-brand-600'
                  : 'text-slate-600 hover:text-navy-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Organization Inquiries ({stats.org.total})
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-sm text-slate-600 mb-1">Total</div>
            <div className="text-2xl font-bold text-navy-800">{currentStats.total}</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="text-sm text-blue-600 mb-1">New</div>
            <div className="text-2xl font-bold text-blue-700">{currentStats.new}</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <div className="text-sm text-amber-600 mb-1">In Progress</div>
            <div className="text-2xl font-bold text-amber-700">{currentStats.inProgress}</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="text-sm text-green-600 mb-1">Resolved</div>
            <div className="text-2xl font-bold text-green-700">{currentStats.resolved}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No submissions found</p>
            </div>
          ) : (
            filteredData.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {activeTab === 'contact' ? (
                          <>
                            <h3 className="text-lg font-bold text-navy-800">
                              {(item as ContactSubmission).name}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(item.status)}`}>
                              {item.status}
                            </span>
                          </>
                        ) : (
                          <>
                            <h3 className="text-lg font-bold text-navy-800">
                              {(item as OrganizationInquiry).organizationName}
                            </h3>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold border border-purple-200">
                              {(item as OrganizationInquiry).organizationType}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(item.status)}`}>
                              {item.status}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {activeTab === 'contact'
                            ? (item as ContactSubmission).email
                            : (item as OrganizationInquiry).contactEmail
                          }
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {item.submittedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {expandedItem === item.id ? (
                        <ChevronUp className="w-5 h-5 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-600" />
                      )}
                    </button>
                  </div>

                  {expandedItem === item.id && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      {activeTab === 'contact' ? (
                        <>
                          <div>
                            <label className="text-sm font-semibold text-slate-700">Subject</label>
                            <p className="text-slate-600 mt-1">{(item as ContactSubmission).subject}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-slate-700">Message</label>
                            <p className="text-slate-600 mt-1 whitespace-pre-wrap">
                              {(item as ContactSubmission).message}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-semibold text-slate-700">Contact Name</label>
                              <p className="text-slate-600 mt-1">{(item as OrganizationInquiry).contactName}</p>
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-slate-700">Location</label>
                              <p className="text-slate-600 mt-1">{(item as OrganizationInquiry).location}</p>
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-slate-700">Participant Count</label>
                              <p className="text-slate-600 mt-1">{(item as OrganizationInquiry).participantCount}</p>
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-slate-700">Duration</label>
                              <p className="text-slate-600 mt-1">{(item as OrganizationInquiry).duration}</p>
                            </div>
                          </div>
                          {(item as OrganizationInquiry).requirements && (
                            <div>
                              <label className="text-sm font-semibold text-slate-700">Requirements</label>
                              <p className="text-slate-600 mt-1 whitespace-pre-wrap">
                                {(item as OrganizationInquiry).requirements}
                              </p>
                            </div>
                          )}
                          {(item as OrganizationInquiry).otherDetails && (
                            <div>
                              <label className="text-sm font-semibold text-slate-700">Other Details</label>
                              <p className="text-slate-600 mt-1 whitespace-pre-wrap">
                                {(item as OrganizationInquiry).otherDetails}
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      {/* Admin Notes */}
                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Admin Notes</label>
                        {editingNotes === item.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                              rows={3}
                              placeholder="Add internal notes..."
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveNotes(item.id, notes, activeTab === 'contact' ? 'contactSubmissions' : 'organizationInquiries')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm"
                              >
                                <Save className="w-4 h-4" />
                                Save
                              </button>
                              <button
                                onClick={() => setEditingNotes(null)}
                                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingNotes(item.id);
                              setNotes(item.adminNotes || '');
                            }}
                            className="cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            {item.adminNotes || (
                              <span className="text-slate-400 text-sm">Click to add notes...</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Status Actions */}
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => updateStatus(item.id, 'new', activeTab === 'contact' ? 'contactSubmissions' : 'organizationInquiries')}
                          disabled={updatingStatus === item.id || item.status === 'new'}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          Mark as New
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, 'in-progress', activeTab === 'contact' ? 'contactSubmissions' : 'organizationInquiries')}
                          disabled={updatingStatus === item.id || item.status === 'in-progress'}
                          className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          Mark as In Progress
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, 'resolved', activeTab === 'contact' ? 'contactSubmissions' : 'organizationInquiries')}
                          disabled={updatingStatus === item.id || item.status === 'resolved'}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          Mark as Resolved
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FormSubmissionsAdmin;
