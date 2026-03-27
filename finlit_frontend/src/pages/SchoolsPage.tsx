import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, School, Send, ArrowLeft, BookOpen } from 'lucide-react';

const SchoolsPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    schoolName: '',
    location: '',
    studentCount: '',
    duration: '',
    requirements: '',
    otherDetails: '',
    contactEmail: '',
    contactName: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would integrate with your backend/email service
    console.log('Form submitted:', formData);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        schoolName: '',
        location: '',
        studentCount: '',
        duration: '',
        requirements: '',
        otherDetails: '',
        contactEmail: '',
        contactName: ''
      });
    }, 3000);
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
                <School className="w-4 h-4 text-brand-300" />
                <span className="text-brand-200 font-semibold text-sm">For Educational Institutions</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Bring FinLit to Your{' '}
                <span className="bg-gradient-to-r from-brand-300 to-brand-400 bg-clip-text text-transparent">
                  School
                </span>
              </h1>
              <p className="text-xl text-navy-200 max-w-2xl mx-auto">
                Transform your students' financial literacy with our comprehensive curriculum. Get in touch to discuss custom solutions tailored to your institution.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  title: "Curriculum Aligned",
                  description: "Meets educational standards and learning objectives"
                },
                {
                  title: "Teacher Support",
                  description: "Complete resources and training for educators"
                },
                {
                  title: "Progress Tracking",
                  description: "Monitor student performance and engagement"
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
                        School Name *
                      </label>
                      <input
                        type="text"
                        name="schoolName"
                        required
                        value={formData.schoolName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none transition-colors"
                        placeholder="Enter school name"
                      />
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
                        placeholder="your.email@school.edu"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-navy-800 mb-2">
                        Number of Students *
                      </label>
                      <select
                        name="studentCount"
                        required
                        value={formData.studentCount}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none transition-colors"
                      >
                        <option value="">Select range</option>
                        <option value="1-50">1-50 students</option>
                        <option value="51-200">51-200 students</option>
                        <option value="201-500">201-500 students</option>
                        <option value="501-1000">501-1,000 students</option>
                        <option value="1000+">1,000+ students</option>
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
                        <option value="1-semester">1 Semester</option>
                        <option value="2-semesters">2 Semesters (Full Year)</option>
                        <option value="summer">Summer Program</option>
                        <option value="ongoing">Ongoing Access</option>
                        <option value="custom">Custom Duration</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-2">
                      Specific Requirements
                    </label>
                    <textarea
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none transition-colors resize-none"
                      placeholder="Any specific curriculum requirements, grade levels, or learning objectives?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-2">
                      Additional Details
                    </label>
                    <textarea
                      name="otherDetails"
                      value={formData.otherDetails}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none transition-colors resize-none"
                      placeholder="Tell us more about your goals, budget, timeline, or any questions you have..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-5 h-5" />
                    Submit Request
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
