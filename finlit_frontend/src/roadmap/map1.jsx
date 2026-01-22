import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';


// In component

const FinancialRoadmap = () => {
    const { scrollYProgress } = useScroll();
const pathDrawProgress = useTransform(scrollYProgress, [0, 2], [0.4, 2]); 

  const [visibleModules, setVisibleModules] = useState(3);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  // All modules in one continuous journey
  const allModules = [
    {
      id: 1,
      title: "Budgeting Basics",
      subtitle: "Starter World",
      status: "Completed",
      icon: "💰",
      color: "#e8f5e9",
      position: "left",
      description: "Master the fundamentals of creating and maintaining a personal budget."
    },
    {
      id: 2,
      title: "Savings & Emergency Fund",
      subtitle: "Forest",
      status: "In Progress",
      icon: "🏦",
      color: "#e3f2fd",
      position: "right",
      description: "Learn how to build a safety net for unexpected expenses."
    },
    {
      id: 3,
      title: "Credit Score",
      subtitle: "Carnival",
      status: "Completed",
      icon: "📊",
      color: "#e8f5e9",
      position: "left",
      description: "Understand what affects your credit score and how to improve it."
    },
    {
      id: 4,
      title: "Investment",
      subtitle: "Island",
      status: "Next Up",
      icon: "📈",
      color: "#e3f2fd",
      position: "right",
      description: "Discover the basics of investing and growing your wealth."
    },
    {
      id: 5,
      title: "Insurance Protection",
      subtitle: "Plains",
      status: "Completed",
      icon: "🛡️", 
      color: "#e8f5e9",
      position: "left",
      description: "Learn about different types of insurance and how to protect your assets."
    },
    {
      id: 6,
      title: "Debt Management",
      subtitle: "Kingdom",
      status: "Locked",
      icon: "🔓",
      color: "#f5f5f5",
      position: "right",
      description: "Strategies for managing and eliminating debt effectively."
    },
    {
      id: 7,
      title: "Retirement Planning",
      subtitle: "Mountain",
      status: "Locked",
      icon: "🏔️",
      color: "#f5f5f5",
      position: "left",
      description: "Prepare for your future with smart retirement planning strategies."
    },
    {
      id: 8,
      title: "Tax Strategy",
      subtitle: "Castle",
      status: "Locked",
      icon: "📝",
      color: "#f5f5f5",
      position: "right",
      description: "Understand tax basics and learn how to optimize your tax situation."
    },
    {
      id: 9,
      title: "Real Estate",
      subtitle: "Empire",
      status: "Locked",
      icon: "🏠",
      color: "#f5f5f5",
      position: "left",
      description: "Learn about home buying, mortgages, and real estate investments."
    },
    {
      id: 10,
      title: "Advanced Wealth",
      subtitle: "Summit",
      status: "Locked",
      icon: "👑",
      color: "#f5f5f5",
      position: "right",
      description: "Master advanced strategies for building and preserving wealth."
    }
  ];

  // Handle scroll to reveal more modules
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      
      // Calculate how far down the page the user has scrolled (as a percentage)
      const scrollPercentage = (scrollPosition / (docHeight - windowHeight)) * 100;
      
      // Determine how many modules to show based on scroll percentage
      // We have 10 modules total, so we'll show more as the user scrolls down
      const newVisibleModules = Math.min(
        Math.max(3, Math.floor(3 + (scrollPercentage / 15))),
        allModules.length
      );
      
      setVisibleModules(newVisibleModules);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [activeModule, setActiveModule] = useState(null);

  const handleModuleClick = (moduleId) => {
    setActiveModule(activeModule === moduleId ? null : moduleId);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Completed": return "text-green-500";
      case "In Progress": return "text-blue-500";
      case "Next Up": return "text-purple-500";
      case "Locked": return "text-gray-400";
      default: return "text-gray-600";
    }
  };

  const getStatusBgColor = (status) => {
    switch(status) {
      case "Completed": return "bg-green-100";
      case "In Progress": return "bg-blue-100";
      case "Next Up": return "bg-purple-100";
      case "Locked": return "bg-gray-100";
      default: return "bg-gray-100";
    }
  };

  // Background animation elements
  const bgElements = [
    { emoji: "💰", size: "text-lg", delay: 0 },
    { emoji: "💳", size: "text-xl", delay: 2 },
    { emoji: "📊", size: "text-2xl", delay: 4 },
    { emoji: "📈", size: "text-lg", delay: 6 },
    { emoji: "🏦", size: "text-xl", delay: 8 },
    { emoji: "🛡️", size: "text-lg", delay: 10 },
    { emoji: "🏠", size: "text-2xl", delay: 12 },
    { emoji: "📝", size: "text-lg", delay: 14 },
  ];

  return (
    <div 
      className="min-h-screen p-6 font-sans relative overflow-hidden"
      style={{
        background: "linear-gradient(120deg, #e0f7fa 0%, #e8f5e9 50%, #e3f2fd 100%)",
      }}
      ref={scrollRef}
    >
      {/* Animated background elements */}
      {bgElements.map((el, index) => (
        <motion.div
          key={index}
          className={`absolute opacity-10 ${el.size} z-0`}
          initial={{ 
            x: Math.random() * 100 - 50, 
            y: -20,
          }}
          animate={{ 
            y: [null, window.innerHeight + 50],
            x: [null, Math.random() * 100 - 50 + (index % 2 === 0 ? 100 : -100)],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 15 + Math.random() * 10,
            delay: el.delay,
            ease: "linear"
          }}
          style={{
            left: `${(index * 12) % 100}%`,
          }}
        >
          {el.emoji}
        </motion.div>
      ))}

      {/* Header with profile and streak */}
      <div className="flex items-center justify-between mb-10 sticky top-0 z-50 bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg shadow-md">
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center border-2 border-gray-200">
              <img src="av.jpg" alt="User avatar" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 text-xs bg-white rounded-full h-5 w-5 shadow flex items-center justify-center border border-gray-200">
              <span className="text-xs">pwc</span>
            </div>
          </div>
          <div className="ml-3">
            <h1 className="text-2xl font-bold text-gray-800">Cornell Staeger</h1>
          </div>
        </motion.div>
        
        {/* Daily Streak */}
        <motion.div 
          className="bg-white p-2 rounded-xl shadow-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center">
            <span className="text-orange-500 text-xl mr-2">🔥</span>
            <div>
              <div className="text-xs font-semibold text-gray-600">Daily Streak</div>
              <div className="text-2xl font-bold text-orange-500">7 days</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Title */}
      <motion.h2 
        className="text-3xl font-bold mb-12 text-center text-gray-800 relative z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Financial Education Journey
      </motion.h2>
      
      {/* Road Map with Curved Path */}
      <div className="max-w-4xl mx-auto relative mb-16 pb-40">
        {/* Path visual - Creating a curved, winding path */}
        <svg
  className="absolute top-0 left-0 w-full"
  height="1000"
  viewBox="0 0 100 200"
  preserveAspectRatio="none"
>
<motion.path
  d="M50,0 Q60,20 40,40 Q20,60 60,80 Q100,100 50,120 Q0,140 50,160 Q100,180 50,200"
  stroke="#3182ce"
  strokeWidth="3"
  fill="none"
  style={{ pathLength: pathDrawProgress }}
/>

</svg>

        {/* Modules1 */}  
        <div className="relative z-10">
          {allModules.slice(0, visibleModules).map((module, index) => (
            <motion.div 
              key={module.id} 
              className={`flex ${module.position === 'left' ? 'justify-start pr-8 ml-6' : 'justify-end pl-8 mr-6'} mb-24 relative`}
              initial={{ opacity: 0, x: module.position === 'left' ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index % 3) }}
              whileHover={{ scale: 1.03 }}
            >
              {/* Curved connector from path to module */}
              <svg className={`absolute ${module.position === 'left' ? 'right-0' : 'left-0'} top-1/2 -mt-3 ${module.position === 'left' ? '-translate-y-6' : '-translate-y-3'} z-0`} width="60" height="40" viewBox="0 0 60 40">
                <path 
                  d={module.position === 'left' ? "M0,20 C30,20 30,0 60,0" : "M60,20 C30,20 30,0 0,0"} 
                  stroke="#4299e1" 
                  strokeWidth="2" 
                  fill="none" 
                  className="opacity-70"
                />
            <motion.path
  d="M50,0 Q60,20 40,40 Q20,60 60,80 Q100,100 50,120 Q0,140 50,160 Q100,180 50,200"
  stroke="#3182ce"
  strokeWidth="3"
  fill="none"
  style={{ pathLength: pathDrawProgress }}
/>

              </svg>
              
              {/* Module card */}
              <div 
                className={`w-full max-w-xs rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 border border-gray-200 ${activeModule === module.id ? 'ring-4 ring-blue-300' : ''}`}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.9)',
                  transform: module.position === 'left' ? 'rotate(-2deg)' : 'rotate(2deg)'
                }}
                onClick={() => handleModuleClick(module.id)}
              >
                {/* Card header */}
                <div className="p-4">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full mr-4 ${getStatusBgColor(module.status)}`}>
                      <span className="text-2xl">{module.icon}</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-gray-800">{module.title}</h3>
                      <p className={`${getStatusColor(module.status)} font-medium text-sm`}>
                        {module.status}
                      </p>
                    </div>
                    {module.status !== 'Locked' && (
                      <div className="text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Card details (expandable) */}
                {activeModule === module.id && (
                  <motion.div 
                    className="px-4 pb-4 border-t border-gray-100"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="py-3 text-gray-600 text-sm">{module.description}</p>
                    {module.status !== 'Locked' && (
  <button 
    className="mt-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors w-full font-medium text-sm"
    onClick={() => {
      if (module.title === "Budgeting Basics" && module.status === "Completed") {
        navigate('/bud'); // assuming the route is /bud and linked to bud.jsx
      }
    }}
  >
    {module.status === 'Completed' ? 'Review Module' : 
     module.status === 'In Progress' ? 'Continue Learning' : 'Start Module'}
  </button>
)}

                  </motion.div>
                )}
              </div>
              
              {/* Node on the path */}
              <div 
                className={`absolute top-1/2 -mt-3 ${module.position === 'left' ? 'right-4' : 'left-4'} w-6 h-6 rounded-full z-10 flex items-center justify-center ${module.status === 'Locked' ? 'bg-gray-300' : 'bg-blue-500'}`} 
              >
                {module.status === 'Completed' && (
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 text-white" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </motion.svg>
                )}
                {module.status === 'In Progress' && (
                  <motion.div
                    className="h-2 w-2 rounded-full bg-white"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
                {module.status === 'Next Up' && (
                  <motion.div
                    className="h-2 w-2 rounded-full bg-white"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll indicator if more modules can be revealed */}
      {visibleModules < allModules.length && (
        <motion.div 
          className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <p className="text-blue-600 font-medium mb-2">Scroll down to see more</p>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      )}

      {/* Completion indicator when all modules visible */}
      {visibleModules >= allModules.length && (
        <motion.div 
          className="text-center mt-10 mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
            🎉 You've reached the end of your financial journey map!
          </div>
        </motion.div>
      )}
      
      {/* Extra space to allow scrolling */}
      <div className="h-screen"></div>
    </div>
  );
};

export default FinancialRoadmap;