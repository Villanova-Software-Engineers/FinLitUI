import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Building2, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const SchoolsPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: '',
    location: '',
    participantCount: '',
    duration: '',
    requirements: '',
    otherDetails: '',
    contactEmail: '',
    contactName: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const MAX_WORDS = 100;

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getWordCountColor = (count: number): string => {
    if (count > MAX_WORDS) return 'text-red-600';
    if (count > MAX_WORDS * 0.9) return 'text-amber-600';
    return 'text-slate-500';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // If organization type changes, reset duration field
    if (name === 'organizationType') {
      setFormData({
        ...formData,
        [name]: value,
        duration: '' // Clear duration when org type changes
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validate word count
    const requirementsWordCount = countWords(formData.requirements);
    const otherDetailsWordCount = countWords(formData.otherDetails);

    if (requirementsWordCount > MAX_WORDS || otherDetailsWordCount > MAX_WORDS) {
      setError(`Please ensure all text fields have ${MAX_WORDS} words or less.`);
      setIsSubmitting(false);
      return;
    }

    try {
      // Save to Firebase
      await addDoc(collection(db, 'organizationInquiries'), {
        ...formData,
        submittedAt: serverTimestamp(),
        status: 'new'
      });

      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setFormData({
          organizationName: '',
          organizationType: '',
          location: '',
          participantCount: '',
          duration: '',
          requirements: '',
          otherDetails: '',
          contactEmail: '',
          contactName: ''
        });
      }, 3000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-700 to-navy-900">
      {/* Back Button */}
      <div className="pt-8 px-6 max-w-7xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-navy-200 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </motion.button>
      </div>

      {/* Main Content */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/20 backdrop-blur-sm rounded-full mb-6">
                <Building2 className="w-4 h-4 text-brand-300" />
                <span className="text-brand-200 font-semibold text-sm">For Organizations</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Bring FinLit to Your{' '}
                <span className="bg-gradient-to-r from-brand-300 to-brand-400 bg-clip-text text-transparent">
                  Organization
                </span>
              </h1>
              <p className="text-xl text-navy-200 max-w-2xl mx-auto">
                Transform financial literacy in your organization with our comprehensive curriculum. Get in touch to discuss custom solutions tailored to your needs.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  title: "Customizable Content",
                  description: "Tailored curriculum to meet your specific needs and goals"
                },
                {
                  title: "Full Support",
                  description: "Complete resources and training for facilitators"
                },
                {
                  title: "Progress Tracking",
                  description: "Monitor participant performance and engagement"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                >
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-navy-200 text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl p-8 shadow-2xl"
            >
              {formSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy-800 mb-2">Thank You!</h3>
                  <p className="text-slate-600">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-navy-800 mb-2">Request Information</h2>
                    <p className="text-slate-600">Fill out the form below and we'll contact you shortly.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-navy-800 mb-2">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        name="organizationName"
                        required
                        value={formData.organizationName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none transition-colors"
                        placeholder="Enter organization name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-800 mb-2">
                        Organization Type *
                      </label>
                      <select
                        name="organizationType"
                        required
                        value={formData.organizationType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none transition-colors"
                      >
                        <option value="">Select type</option>
                        <option value="school">School</option>
                        <option value="non-profit">Non-Profit</option>
                        <option value="corporate">Corporate</option>
                        <option value="government">Government</option>
                        <option value="community">Community Organization</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none transition-colors"
                      placeholder="City, State/Country"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-navy-800 mb-2">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        name="contactName"
                        required
                        value={formData.contactName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-800 mb-2">
                        Contact Email *
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        required
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none transition-colors"
                        placeholder="your.email@organization.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-navy-800 mb-2">
                        Number of Participants *
                      </label>
                      <select
                        name="participantCount"
                        required
                        value={formData.participantCount}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none transition-colors"
                      >
                        <option value="">Select range</option>
                        <option value="1-50">1-50 participants</option>
                        <option value="51-200">51-200 participants</option>
                        <option value="201-500">201-500 participants</option>
                        <option value="501-1000">501-1,000 participants</option>
                        <option value="1000+">1,000+ participants</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-800 mb-2">
                        Program Duration *
                      </label>
                      <select
                        name="duration"
                        required
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none transition-colors"
                      >
                        <option value="">Select duration</option>
                        {formData.organizationType === 'school' ? (
                          <>
                            <option value="1-semester">1 Semester</option>
                            <option value="2-semesters">2 Semesters (Full Year)</option>
                            <option value="summer">Summer Program</option>
                            <option value="ongoing">Ongoing Access</option>
                            <option value="custom">Custom Duration</option>
                          </>
                        ) : (
                          <>
                            <option value="3-months">3 Months</option>
                            <option value="6-months">6 Months</option>
                            <option value="1-year">1 Year</option>
                            <option value="ongoing">Ongoing Access</option>
                            <option value="custom">Custom Duration</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-navy-800">
                        Specific Requirements
                      </label>
                      <span className={`text-xs font-medium ${getWordCountColor(countWords(formData.requirements))}`}>
                        {countWords(formData.requirements)}/{MAX_WORDS} words
                      </span>
                    </div>
                    <textarea
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none transition-colors resize-none"
                      placeholder="Any specific curriculum requirements, grade levels, or learning objectives?"
                    />
                    {countWords(formData.requirements) > MAX_WORDS && (
                      <p className="text-xs text-red-600 mt-1">
                        Please reduce to {MAX_WORDS} words or less
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-navy-800">
                        Additional Details
                      </label>
                      <span className={`text-xs font-medium ${getWordCountColor(countWords(formData.otherDetails))}`}>
                        {countWords(formData.otherDetails)}/{MAX_WORDS} words
                      </span>
                    </div>
                    <textarea
                      name="otherDetails"
                      value={formData.otherDetails}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none transition-colors resize-none"
                      placeholder="Tell us more about your goals, budget, timeline, or any questions you have..."
                    />
                    {countWords(formData.otherDetails) > MAX_WORDS && (
                      <p className="text-xs text-red-600 mt-1">
                        Please reduce to {MAX_WORDS} words or less
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    className="w-full px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Request
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </motion.div>

            {/* Additional Info */}
            <div className="mt-12 text-center">
              <p className="text-navy-200 mb-4">
                Have questions? Email us at{' '}
                <a href="mailto:support@smartfinlit.com" className="text-brand-300 hover:text-brand-200 underline">
                  support@smartfinlit.com
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SchoolsPage;
