import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable component for displaying module completion screen with review option
 *
 * @param {Object} props
 * @param {string} props.emoji - The module emoji
 * @param {string} props.moduleName - Display name of the module
 * @param {string} props.description - Description text for completion
 * @param {string} props.gradientClasses - Tailwind gradient classes for background (e.g., "from-blue-50 via-blue-100 to-blue-200")
 * @param {Function} props.onReviewClick - Callback when "Review Module" is clicked
 */
const ModuleCompletedScreen = ({
  emoji,
  moduleName,
  description,
  gradientClasses = "from-blue-50 via-blue-100 to-blue-200",
  onReviewClick
}) => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradientClasses} p-6 flex items-center justify-center`}>
      <motion.div
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-6xl mb-4"
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {emoji}
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Module Completed!</h2>
        <p className="text-gray-600 mb-6">
          {description || `You've already passed the ${moduleName} module. Great job!`}
        </p>
        <div className="bg-green-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-green-600">
            <span className="text-2xl">✓</span>
            <span className="font-semibold">100% Complete</span>
          </div>
        </div>
        <div className="space-y-3">
          {onReviewClick && (
            <motion.button
              onClick={onReviewClick}
              className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Review Module
            </motion.button>
          )}
          <motion.button
            onClick={() => navigate('/game')}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Learning Path
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ModuleCompletedScreen;
