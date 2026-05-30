// frontend/src/pages/LandingPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start pt-32 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-2xl"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
          Next-Gen <span className="text-indigo-600">Lecture Analysis</span>
        </h1>
        
        {/* Adjusted the paragraph to use a line break for better visual balance */}
        <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
          Transform your educational content into actionable insights. <br />
          Professional, fast, and automated summaries at your fingertips.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="bg-indigo-600 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-lg hover:bg-indigo-700 transition-colors"
        >
          Launch Dashboard
        </motion.button>
      </motion.div>
    </div>
  );
}