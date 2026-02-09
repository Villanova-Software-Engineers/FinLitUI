import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BudgetComparison = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen p-6 relative overflow-hidden font-sans"
      style={{
        background: 'linear-gradient(120deg, #e0f7fa 0%, #e8f5e9 50%, #e3f2fd 100%)',
      }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-10 max-w-6xl mx-auto sticky top-0 z-50 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button
          className="px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50 font-medium transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/game')}
        >
          ← Back to Learning Path
        </motion.button>
      </motion.div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
            Budget Method Comparison
          </h1>
          <p className="text-xl text-gray-600">
            Traditional 50/30/20 vs. Dave Ramsey's Modern Approach
          </p>
        </motion.div>

        {/* Intro Banner */}
        <motion.div
          className="mb-8 p-6 bg-gradient-to-r from-blue-100 to-green-100 rounded-xl border-2 border-green-400 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-center text-gray-800 text-lg">
            <span className="text-2xl mr-2">📊</span>
            <span className="font-bold">Compare Budget Methods:</span> The 50/30/20 rule is a great starting point,
            but <span className="font-bold text-green-700">Dave Ramsey's modern approach</span> offers more detailed guidance
            with specific percentages for each spending category—giving you better control over your finances.
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <motion.div
          className="grid md:grid-cols-2 gap-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Traditional 50/30/20 */}
          <motion.div
            className="space-y-3 opacity-90 rounded-2xl shadow-lg p-8 bg-white"
            whileHover={{ scale: 1.02 }}
          >
            <h4 className="text-2xl font-bold text-blue-600 mb-6 text-center">Traditional 50/30/20</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#10b98122' }}>
                <span className="font-semibold text-gray-700 text-lg">Needs</span>
                <span className="font-bold text-green-600 text-xl">50%</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#3b82f622' }}>
                <span className="font-semibold text-gray-700 text-lg">Wants</span>
                <span className="font-bold text-blue-600 text-xl">30%</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#8b5cf622' }}>
                <span className="font-semibold text-gray-700 text-lg">Savings & Debt</span>
                <span className="font-bold text-purple-600 text-xl">20%</span>
              </div>
            </div>
            <div className="mt-6 p-5 bg-gray-50 rounded-lg border-l-4 border-gray-400">
              <p className="text-gray-600">
                <span className="font-semibold">Basic framework</span> - Simple three-category approach,
                but lacks the detailed breakdown needed for intentional budgeting
              </p>
            </div>
          </motion.div>

          {/* Dave Ramsey's Modern Recommended */}
          <motion.div
            className="space-y-3 ring-4 ring-green-400 rounded-2xl p-8 bg-white shadow-2xl relative"
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
              ⭐ RECOMMENDED
            </div>
            <h4 className="text-2xl font-bold text-green-600 mb-6 text-center mt-2">Dave Ramsey's Modern Approach</h4>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-gray-50">
                <span className="font-semibold text-gray-700">Giving</span>
                <span className="font-bold text-green-700">10%</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-gray-50">
                <span className="font-semibold text-gray-700">Saving</span>
                <span className="font-bold text-green-700">10%</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-gray-50">
                <span className="font-semibold text-gray-700">Food</span>
                <span className="font-bold text-green-700">10-15%</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-gray-50">
                <span className="font-semibold text-gray-700">Utilities</span>
                <span className="font-bold text-green-700">5-10%</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-gray-50">
                <span className="font-semibold text-gray-700">Housing</span>
                <span className="font-bold text-green-700">25%</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-gray-50">
                <span className="font-semibold text-gray-700">Transportation</span>
                <span className="font-bold text-green-700">10%</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-gray-50">
                <span className="font-semibold text-gray-700">Health</span>
                <span className="font-bold text-green-700">5-10%</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-gray-50">
                <span className="font-semibold text-gray-700">Insurance</span>
                <span className="font-bold text-green-700">10-25%</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-gray-50">
                <span className="font-semibold text-gray-700">Recreation</span>
                <span className="font-bold text-green-700">5-10%</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-gray-50">
                <span className="font-semibold text-gray-700">Personal</span>
                <span className="font-bold text-green-700">5-10%</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-gray-50">
                <span className="font-semibold text-gray-700">Miscellaneous</span>
                <span className="font-bold text-green-700">5-10%</span>
              </div>
            </div>
            <div className="mt-6 p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-l-4 border-green-500">
              <p className="text-gray-700">
                <span className="font-semibold text-green-700">✨ Modern & intentional</span> - More granular
                control with 11 specific categories, includes giving, and provides realistic percentage
                ranges for each area of spending. This helps you build a truly balanced budget.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Why Dave Ramsey's Method Works Better */}
        <motion.div
          className="mb-8 p-6 bg-gradient-to-r from-green-50 via-blue-50 to-green-50 rounded-xl border-2 border-green-300 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-center text-gray-800">
            <span className="text-3xl mr-2">🎯</span>
            <span className="font-bold text-green-700 text-xl">Why Dave Ramsey's Method Works Better:</span>
            <span className="text-base block mt-3 max-w-4xl mx-auto">
              While the 50/30/20 rule is easy to remember, it lumps too many expenses together. Dave Ramsey's
              approach breaks down your budget into specific categories with proven percentages—helping you
              see exactly where your money goes and make intentional decisions. It's the modern way to budget
              with precision and purpose.
            </span>
          </p>
        </motion.div>

        {/* Ways to Save More Section */}
        <motion.div
          className="mb-8 rounded-2xl shadow-lg p-8 bg-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            💰 Ways to Save More per Paycheck
          </h3>

          <p className="text-gray-600 mb-8 text-center text-lg">
            How do you actually hit your savings goal? It might feel impossible right now—especially
            if you're living paycheck to paycheck. But there are things you can do to find extra money!
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Get on a Budget */}
            <motion.div
              className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 shadow-md"
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-4xl">📝</span>
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Get on a Budget</h4>
                  <p className="text-sm text-gray-700">
                    A budget is the key to breaking the paycheck-to-paycheck cycle. It's just a plan
                    for your money—plain and simple. Tell your paycheck where to go every month,
                    including the dollars you want to save. Otherwise, it'll disappear before you know it.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Cut Expenses */}
            <motion.div
              className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 shadow-md"
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-4xl">✂️</span>
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Cut Expenses</h4>
                  <p className="text-sm text-gray-700">
                    Increase your savings by decreasing your spending. Go through your budget line by
                    line. Is all your money going to UberEats? Start meal planning. Cancel unused
                    streaming services. Temporarily delete shopping apps to slow your spending.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Ditch Your Debt */}
            <motion.div
              className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 shadow-md"
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-4xl">🚫</span>
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Ditch Your Debt</h4>
                  <p className="text-sm text-gray-700">
                    Debt steals your income. Use the <span className="font-semibold">debt snowball method</span>:
                    List debts smallest to largest, make minimum payments on all except the smallest—attack
                    that one with everything extra. Once it's gone, roll that payment to the next debt!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Increase Your Income */}
            <motion.div
              className="p-6 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-md"
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-4xl">📈</span>
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Increase Your Income</h4>
                  <p className="text-sm text-gray-700">
                    Get to work! Side hustles, part-time jobs, or career switches can boost savings.
                    Try Uber, DoorDash, or offer services like babysitting, lawn care, or house cleaning.
                    Imagine putting an entire extra paycheck straight into savings!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Adjust Tax Withholdings */}
            <motion.div
              className="p-6 rounded-xl bg-gradient-to-br from-red-50 to-red-100 md:col-span-2 shadow-md"
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-4xl">🧾</span>
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Adjust Your Tax Withholdings</h4>
                  <p className="text-sm text-gray-700">
                    Large tax refunds mean you overpaid—you let the government borrow your money
                    interest-free! Calculate your withholdings better to keep more income monthly.
                    That's your money—take it back and put the extra toward savings.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="mt-8 p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl text-center shadow-md"
            whileHover={{ scale: 1.02 }}
          >
            <h4 className="text-xl font-bold text-gray-800 mb-2">🎯 Start Saving With a Budget!</h4>
            <p className="text-gray-700">
              You can figure out how much you should save, but if you don't have a plan for your money,
              you won't get far. Use a budgeting app to find extra margin every month and make real
              money progress, really fast. Take control of your financial future today!
            </p>
          </motion.div>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <motion.button
            onClick={() => navigate('/calculator')}
            className="px-8 py-4 rounded-2xl border-2 border-blue-400 bg-white text-blue-600 hover:bg-blue-50 transition font-semibold text-lg shadow-lg"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Budget Calculator
          </motion.button>
          <motion.button
            onClick={() => navigate('/savings', { state: { showQuiz: true } })}
            className="px-8 py-4 rounded-2xl bg-green-500 text-white hover:bg-green-600 transition font-semibold text-lg shadow-lg"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Take Quiz →
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default BudgetComparison;
