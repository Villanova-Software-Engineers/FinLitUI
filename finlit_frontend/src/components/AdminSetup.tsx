/**
 * Owner Admin Setup Page
 * Allows owner to create organizations with admin accounts
 * Navigate to /admin-setup
 */

import React, { useState, useEffect } from 'react';
import { Building2, Mail, Eye, EyeOff, Copy, Check, Plus } from 'lucide-react';
import { createOrganizationWithAdmin, getAllOrganizations } from '../firebase/firestore.service';
import type { Organization } from '../auth/types/auth.types';

interface CreatedOrg {
  organization: Organization;
  password: string;
}

const AdminSetup: React.FC = () => {
  const [orgName, setOrgName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdOrg, setCreatedOrg] = useState<CreatedOrg | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const orgs = await getAllOrganizations();
      setOrganizations(orgs);
    } catch (err) {
      console.error('Error loading organizations:', err);
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
      const result = await createOrganizationWithAdmin(
        orgName,
        contactEmail,
        'owner'
      );
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Owner Admin Panel</h1>
        <p className="text-gray-600 mb-8">Create organizations and admin accounts for colleges/institutions</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Organization Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus size={20} />
              Create New Organization
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Stanford University"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Contact Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="professor@university.edu"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This person will receive login credentials to manage class codes
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !orgName || !contactEmail}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {isLoading ? 'Creating...' : 'Create Organization'}
              </button>
            </form>

            {/* Success Result */}
            {createdOrg && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-3">Organization Created!</h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Organization:</p>
                    <p className="font-medium">{createdOrg.organization.name}</p>
                  </div>

                  <div>
                    <p className="text-gray-600">Admin Email:</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono bg-white px-2 py-1 rounded border">
                        {createdOrg.organization.contactEmail}
                      </p>
                      <button
                        onClick={() => copyToClipboard(createdOrg.organization.contactEmail, 'email')}
                        className="p-1 hover:bg-green-100 rounded"
                      >
                        {copied === 'email' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600">Generated Password:</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono bg-white px-2 py-1 rounded border">
                        {showPassword ? createdOrg.password : '************'}
                      </p>
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 hover:bg-green-100 rounded"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(createdOrg.password, 'password')}
                        className="p-1 hover:bg-green-100 rounded"
                      >
                        {copied === 'password' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-800">
                  <strong>Important:</strong> Share these credentials with the admin. They can log in at <code className="bg-yellow-100 px-1 rounded">/admin</code> to create class codes.
                </div>
              </div>
            )}
          </div>

          {/* Existing Organizations */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Existing Organizations
            </h2>

            {loadingOrgs ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : organizations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No organizations yet. Create one to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {organizations.map((org) => (
                  <div
                    key={org.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <h3 className="font-medium text-gray-900">{org.name}</h3>
                    <p className="text-sm text-gray-500">{org.contactEmail}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Created: {org.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
