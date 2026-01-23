import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface GuideStep {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  route?: string | null;
}

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: GuideStep[];
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose, steps }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">How to Play</h2>
            <p className="text-blue-100 mt-1">Learn how to master Financial Literacy</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 hover:border-blue-300 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br ${step.color} text-white`}>
                      <Icon size={24} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 mb-1">
                      {index + 1}. {step.title}
                    </h3>
                    <p className="text-gray-700">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Tips Section */}
          <div className="mt-8 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <h3 className="font-bold text-amber-900 mb-2">💡 Pro Tips:</h3>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Log in daily to maintain your learning streak</li>
              <li>• Complete modules sequentially for better understanding</li>
              <li>• Check the roadmap to track your progress</li>
              <li>• Use financial tools to apply what you learn</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-shadow font-semibold"
          >
            Got it!
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default HowToPlayModal;
