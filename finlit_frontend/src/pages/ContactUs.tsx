import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageSquare, Send, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../auth/context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const ContactUs: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MESSAGE_MAX_LENGTH = 500;
  const MAX_WORDS = 100;

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  const validateSubject = (subject: string): string | undefined => {
    if (!subject) return 'Please select a subject';
    return undefined;
  };

  const validateMessage = (message: string): string | undefined => {
    if (!message.trim()) return 'Message is required';
    if (message.trim().length < 10) return 'Message must be at least 10 characters';
    if (message.length > MESSAGE_MAX_LENGTH) return `Message must be under ${MESSAGE_MAX_LENGTH} characters`;
    const wordCount = countWords(message);
    if (wordCount > MAX_WORDS) return `Message must be ${MAX_WORDS} words or less (currently ${wordCount} words)`;
    return undefined;
  };

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name': return validateName(value);
      case 'email': return validateEmail(value);
      case 'subject': return validateSubject(value);
      case 'message': return validateMessage(value);
      default: return undefined;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouchedFields(prev => new Set(prev).add(name));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (touchedFields.has(name)) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      subject: validateSubject(formData.subject),
      message: validateMessage(formData.message)
    };

    // Remove undefined errors
    Object.keys(newErrors).forEach(key => {
      if (newErrors[key as keyof FormErrors] === undefined) {
        delete newErrors[key as keyof FormErrors];
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouchedFields(new Set(['name', 'email', 'subject', 'message']));
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to Firebase
      await addDoc(collection(db, 'contactSubmissions'), {
        ...formData,
        userId: user?.uid || null,
        submittedAt: serverTimestamp(),
        status: 'new'
      });

      setIsSubmitted(true);

      // Reset form after 4 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: user?.displayName || '',
          email: user?.email || '',
          subject: '',
          message: ''
        });
        setErrors({});
        setTouchedFields(new Set());
      }, 4000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setErrors({ message: 'Failed to submit. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageCharCount = formData.message.length;
  const messageWordCount = countWords(formData.message);
  const messageCharCountColor = messageCharCount > MESSAGE_MAX_LENGTH
    ? 'text-red-600'
    : messageCharCount > MESSAGE_MAX_LENGTH * 0.9
    ? 'text-amber-600'
    : 'text-gray-500';
  const messageWordCountColor = messageWordCount > MAX_WORDS
    ? 'text-red-600'
    : messageWordCount > MAX_WORDS * 0.9
    ? 'text-amber-600'
    : 'text-gray-500';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50/30">
      {/* Header with Back Button */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-navy-700 hover:text-brand-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 text-center max-w-2xl mx-auto"
              role="alert"
              aria-live="polite"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <CheckCircle className="text-white" size={48} />
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Message Sent Successfully!</h2>
              <p className="text-gray-600 text-lg mb-2">
                Thank you for reaching out. We'll get back to you as soon as possible.
              </p>
              <p className="text-sm text-gray-500">
                Typically within 24-48 hours during business days
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Mail className="text-white" size={32} />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Contact Us</h1>
                  <p className="text-base sm:text-lg text-gray-600 mt-1">We'd love to hear from you</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Contact Info */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">General Inquiries</h3>
                        <p className="text-gray-600">
                          Have questions about FinLit? We'd love to hear from you.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="text-green-600" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Support</h3>
                        <p className="text-gray-600">
                          Need help with your account or have technical issues? Let us know.
                        </p>
                      </div>
                    </div>

                    <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                      <p className="text-blue-900 font-medium">
                        <strong className="text-lg">Response Time</strong>
                      </p>
                      <p className="text-blue-800 mt-2">
                        We typically respond within 24-48 hours during business days.
                      </p>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-500 leading-relaxed">
                        Your information will be kept confidential and used only to respond to your inquiry.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Contact Form */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>

                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {/* Name Field */}
                    <div>
                      <label htmlFor="name" className="block text-base font-semibold text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        aria-invalid={touchedFields.has('name') && !!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        className={`w-full px-4 py-3.5 text-base border ${
                          touchedFields.has('name') && errors.name
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-xl transition-all duration-150 focus:ring-2 focus:outline-none`}
                        placeholder="Your full name"
                      />
                      <AnimatePresence>
                        {touchedFields.has('name') && errors.name && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            id="name-error"
                            className="mt-2 text-sm text-red-600 flex items-center gap-1.5 font-medium"
                            role="alert"
                          >
                            <AlertCircle size={16} />
                            {errors.name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-base font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        aria-invalid={touchedFields.has('email') && !!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className={`w-full px-4 py-3.5 text-base border ${
                          touchedFields.has('email') && errors.email
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-xl transition-all duration-150 focus:ring-2 focus:outline-none`}
                        placeholder="your@email.com"
                      />
                      <AnimatePresence>
                        {touchedFields.has('email') && errors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            id="email-error"
                            className="mt-2 text-sm text-red-600 flex items-center gap-1.5 font-medium"
                            role="alert"
                          >
                            <AlertCircle size={16} />
                            {errors.email}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Subject Field */}
                    <div>
                      <label htmlFor="subject" className="block text-base font-semibold text-gray-700 mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        aria-invalid={touchedFields.has('subject') && !!errors.subject}
                        aria-describedby={errors.subject ? 'subject-error' : undefined}
                        className={`w-full px-4 py-3.5 text-base border ${
                          touchedFields.has('subject') && errors.subject
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-xl transition-all duration-150 focus:ring-2 focus:outline-none cursor-pointer`}
                      >
                        <option value="">Select a topic</option>
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="feedback">Feedback</option>
                        <option value="partnership">Partnership</option>
                        <option value="other">Other</option>
                      </select>
                      <AnimatePresence>
                        {touchedFields.has('subject') && errors.subject && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            id="subject-error"
                            className="mt-2 text-sm text-red-600 flex items-center gap-1.5 font-medium"
                            role="alert"
                          >
                            <AlertCircle size={16} />
                            {errors.subject}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Message Field */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label htmlFor="message" className="block text-base font-semibold text-gray-700">
                          Message <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-3 text-sm">
                          <span className={`font-medium ${messageWordCountColor} transition-colors duration-150`}>
                            {messageWordCount}/{MAX_WORDS} words
                          </span>
                          <span className={`font-medium ${messageCharCountColor} transition-colors duration-150`}>
                            {messageCharCount}/{MESSAGE_MAX_LENGTH} chars
                          </span>
                        </div>
                      </div>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        rows={5}
                        maxLength={MESSAGE_MAX_LENGTH}
                        aria-invalid={touchedFields.has('message') && !!errors.message}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                        className={`w-full px-4 py-3.5 text-base border ${
                          touchedFields.has('message') && errors.message
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-xl transition-all duration-150 focus:ring-2 focus:outline-none resize-none`}
                        placeholder="How can we help you? Please provide as much detail as possible..."
                      />
                      <AnimatePresence>
                        {touchedFields.has('message') && errors.message && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            id="message-error"
                            className="mt-2 text-sm text-red-600 flex items-center gap-1.5 font-medium"
                            role="alert"
                          >
                            <AlertCircle size={16} />
                            {errors.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Send Message
                        </>
                      )}
                    </button>

                    <p className="text-sm text-gray-500 text-center">
                      All fields marked with <span className="text-red-500 font-semibold">*</span> are required
                    </p>
                  </form>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm">
            © 2026 FinLit. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;
