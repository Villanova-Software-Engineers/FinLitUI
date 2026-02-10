/**
 * Bug Report Form
 * User-facing form with MoneyPersonality theme styling
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, Upload, X, CheckCircle, AlertCircle, Loader2, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../auth/context/AuthContext';
import { submitBugReport } from '../firebase/bugReport.service';

interface BugReport {
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'ui' | 'functionality' | 'performance' | 'security' | 'other';
  deviceInfo: string;
  browserInfo: string;
}

interface BugReportEntry {
  id: string;
  data: BugReport;
}

const BugReportForm: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // Form state
  const [bugReports, setBugReports] = useState<BugReportEntry[]>([{
    id: Date.now().toString(),
    data: {
      title: '',
      description: '',
      stepsToReproduce: '',
      expectedBehavior: '',
      actualBehavior: '',
      severity: 'medium',
      category: 'functionality',
      deviceInfo: '',
      browserInfo: '',
    }
  }]);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-populate device and browser info
  React.useEffect(() => {
    const deviceInfo = `${navigator.platform} - ${window.screen.width}x${window.screen.height}`;
    const browserInfo = navigator.userAgent;

    setBugReports(prev => prev.map(report => ({
      ...report,
      data: {
        ...report.data,
        deviceInfo,
        browserInfo,
      }
    })));
  }, []);

  const addBugReport = () => {
    setBugReports(prev => [...prev, {
      id: Date.now().toString(),
      data: {
        title: '',
        description: '',
        stepsToReproduce: '',
        expectedBehavior: '',
        actualBehavior: '',
        severity: 'medium',
        category: 'functionality',
        deviceInfo: bugReports[0]?.data.deviceInfo || '',
        browserInfo: bugReports[0]?.data.browserInfo || '',
      }
    }]);
  };

  const removeBugReport = (id: string) => {
    if (bugReports.length > 1) {
      setBugReports(prev => prev.filter(report => report.id !== id));
    }
  };

  const updateBugReport = (id: string, field: keyof BugReport, value: string) => {
    setBugReports(prev => prev.map(report =>
      report.id === id
        ? { ...report, data: { ...report.data, [field]: value } }
        : report
    ));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate total number of images
    if (images.length + files.length > 2) {
      setErrorMessage('Maximum 2 images allowed');
      return;
    }

    // Validate total size (5MB)
    const totalSize = [...images, ...files].reduce((sum, file) => sum + file.size, 0);
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes

    if (totalSize > maxSize) {
      setErrorMessage('Total image size must be less than 5MB');
      return;
    }

    // Validate file types
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      setErrorMessage('Only PNG, JPEG, JPG, and WEBP images are allowed');
      return;
    }

    setErrorMessage('');
    setImages(prev => [...prev, ...files]);

    // Generate previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate at least one bug report has required fields
    const hasValidReport = bugReports.some(report =>
      report.data.title.trim() &&
      report.data.description.trim()
    );

    if (!hasValidReport) {
      setErrorMessage('Please fill in at least one bug report with title and description');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Filter out empty reports
      const validReports = bugReports.filter(report =>
        report.data.title.trim() && report.data.description.trim()
      );

      // Submit all valid bug reports
      await submitBugReport(validReports.map(r => r.data), images, user!);

      setSubmitStatus('success');

      // Reset form after 3 seconds
      setTimeout(() => {
        setBugReports([{
          id: Date.now().toString(),
          data: {
            title: '',
            description: '',
            stepsToReproduce: '',
            expectedBehavior: '',
            actualBehavior: '',
            severity: 'medium',
            category: 'functionality',
            deviceInfo: bugReports[0].data.deviceInfo,
            browserInfo: bugReports[0].data.browserInfo,
          }
        }]);
        setImages([]);
        setImagePreview([]);
        setSubmitStatus('idle');
      }, 3000);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit bug report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 font-dm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-navy-700 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Back to Dashboard</span>
        </motion.button>

        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-600 rounded-3xl shadow-2xl shadow-brand-500/40 mb-6"
          >
            <Bug className="text-white" size={40} />
          </motion.div>
          <h1 className="text-4xl font-bold text-navy-700 mb-3">Report a Bug</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Help us improve FinLit by reporting any issues you encounter. The more details you provide, the faster we can fix it!
          </p>
        </div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {submitStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3"
            >
              <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
              <p className="text-green-700 font-semibold">Bug report submitted successfully! Thank you for helping us improve.</p>
            </motion.div>
          )}

          {submitStatus === 'error' && errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3"
            >
              <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
              <p className="text-red-700 font-semibold">{errorMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bug Reports */}
          {bugReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 md:p-8 border border-gray-100"
            >
              {/* Report Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-navy-700 flex items-center gap-2">
                  <Bug className="text-brand-500" size={24} />
                  Bug Report {bugReports.length > 1 ? `#${index + 1}` : ''}
                </h3>
                {bugReports.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBugReport(report.id)}
                    className="p-2 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="text-red-500" size={20} />
                  </button>
                )}
              </div>

              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-navy-700 mb-2">
                    Bug Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={report.data.title}
                    onChange={(e) => updateBugReport(report.id, 'title', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-navy-700"
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>

                {/* Category and Severity Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-bold text-navy-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={report.data.category}
                      onChange={(e) => updateBugReport(report.id, 'category', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-navy-700"
                      required
                    >
                      <option value="ui">UI/Design</option>
                      <option value="functionality">Functionality</option>
                      <option value="performance">Performance</option>
                      <option value="security">Security</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="block text-sm font-bold text-navy-700 mb-2">
                      Severity <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={report.data.severity}
                      onChange={(e) => updateBugReport(report.id, 'severity', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-navy-700"
                      required
                    >
                      <option value="low">Low - Minor inconvenience</option>
                      <option value="medium">Medium - Affects functionality</option>
                      <option value="high">High - Major issue</option>
                      <option value="critical">Critical - App breaking</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-navy-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={report.data.description}
                    onChange={(e) => updateBugReport(report.id, 'description', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-navy-700 min-h-[100px] resize-y"
                    placeholder="Detailed description of the bug"
                    required
                  />
                </div>

                {/* Steps to Reproduce */}
                <div>
                  <label className="block text-sm font-bold text-navy-700 mb-2">
                    Steps to Reproduce
                  </label>
                  <textarea
                    value={report.data.stepsToReproduce}
                    onChange={(e) => updateBugReport(report.id, 'stepsToReproduce', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-navy-700 min-h-[100px] resize-y"
                    placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                  />
                </div>

                {/* Expected vs Actual Behavior */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Expected Behavior */}
                  <div>
                    <label className="block text-sm font-bold text-navy-700 mb-2">
                      Expected Behavior
                    </label>
                    <textarea
                      value={report.data.expectedBehavior}
                      onChange={(e) => updateBugReport(report.id, 'expectedBehavior', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-navy-700 min-h-[80px] resize-y"
                      placeholder="What should happen?"
                    />
                  </div>

                  {/* Actual Behavior */}
                  <div>
                    <label className="block text-sm font-bold text-navy-700 mb-2">
                      Actual Behavior
                    </label>
                    <textarea
                      value={report.data.actualBehavior}
                      onChange={(e) => updateBugReport(report.id, 'actualBehavior', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-navy-700 min-h-[80px] resize-y"
                      placeholder="What actually happens?"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add More Bug Button */}
          {bugReports.length < 5 && (
            <motion.button
              type="button"
              onClick={addBugReport}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-dashed border-purple-300 rounded-2xl text-purple-600 font-semibold hover:from-purple-100 hover:to-purple-200 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Another Bug Report
            </motion.button>
          )}

          {/* Image Upload Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 md:p-8 border border-gray-100"
          >
            <h3 className="text-xl font-bold text-navy-700 mb-4 flex items-center gap-2">
              <Upload className="text-brand-500" size={24} />
              Screenshots (Optional)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload up to 2 images (PNG, JPEG, WEBP). Maximum total size: 5MB
            </p>

            {/* Image Preview */}
            {imagePreview.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-40 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {images.length < 2 && (
              <label className="block">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-dashed border-blue-300 rounded-2xl text-blue-600 font-semibold hover:from-blue-100 hover:to-blue-200 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload size={32} />
                  <span>Click to upload images</span>
                  <span className="text-xs text-gray-500">PNG, JPEG, WEBP (Max 5MB total)</span>
                </motion.div>
              </label>
            )}

            {errorMessage && !submitStatus && (
              <p className="mt-3 text-sm text-red-500 flex items-center gap-2">
                <AlertCircle size={16} />
                {errorMessage}
              </p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-2xl transition-all flex items-center justify-center gap-3 ${
              isSubmitting
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-br from-brand-400 to-brand-600 hover:from-brand-500 hover:to-brand-700 shadow-brand-500/40 text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Submitting...
              </>
            ) : (
              <>
                <Bug size={24} />
                Submit Bug Report{bugReports.length > 1 ? 's' : ''}
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default BugReportForm;
