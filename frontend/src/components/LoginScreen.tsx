import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [showForm, setShowForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowForm(true);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (email && password) {
      localStorage.setItem('userEmail', email);
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F5EC] via-[#FCECEE] to-[#EFA8B5]/20 dark:from-[#252B2F] dark:via-[#222123] dark:to-[#2F2427] relative flex flex-col items-center justify-center overflow-hidden">
      {/* Background paper shadows/effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/10 pointer-events-none" />

      <motion.div
        initial={{ y: 160 }}
        animate={{ y: showForm ? -10 : 160 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="z-20 flex flex-col items-center justify-center w-full"
      >
        {/* Elegant Sweet Apricot cursive title container - flows with document */}
        <motion.div
          initial={{ scale: 1.6 }}
          animate={{ scale: showForm ? 1.0 : 1.6 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="relative flex flex-col items-center justify-center p-4 mb-4 w-full max-w-sm border-x border-transparent"
        >
          <motion.h1
            initial="hidden"
            animate="visible"
            className="text-7xl md:text-8xl tracking-tight text-slate-900 dark:text-white select-none pointer-events-none pb-2 text-center flex items-center justify-center w-full"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900 }}
          >
            {/* The "border" the title must not go past - overflow-hidden creates this hard line effect */}
            <div className="flex items-baseline justify-center overflow-hidden px-4 pt-6 pb-2">
              {[
                { char: 'L' },
                { char: 'i', greenDot: true },
                { char: 'S' },
                { char: 'T' },
                { char: 'A' }
              ].map((item, index) => (
                <motion.div 
                  key={index} 
                  className="relative inline-flex items-baseline justify-center"
                  initial={{ y: '100%', scale: 1.2 }}
                  animate={{ y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.7, 
                    ease: [0.16, 1, 0.3, 1], 
                    delay: 0.1 + index * 0.08 
                  }}
                >
                  <div className="relative flex items-baseline justify-center">
                    {item.greenDot && (
                      <motion.span 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, type: "spring", delay: 0.1 + index * 0.08 + 0.4 }}
                        className="absolute bottom-[0.72em] left-1/2 -translate-x-1/2 w-[0.2em] h-[0.2em] bg-[#10C86E] rounded-full"
                      ></motion.span>
                    )}
                    <span className="leading-none">
                      {item.char === 'i' ? 'ı' : item.char}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.h1>
        </motion.div>

        {/* Login Card with enhanced tactile layered depth */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: showForm ? 1 : 0, y: showForm ? 0 : 60, scale: showForm ? 1 : 0.95 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className={`w-full max-w-sm px-6 relative z-10 ${showForm ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
        {/* Layered Paper Stack Effect under the main card */}
        <div className="absolute inset-x-9 -bottom-2 h-8 bg-leaf-pink/30 dark:bg-leaf-pink-dark/20 rounded-2xl -rotate-2 shadow-md transform translate-y-1 transition-transform" />
        <div className="absolute inset-x-8 -bottom-1 h-8 bg-leaf-yellow/40 dark:bg-leaf-yellow-dark/25 rounded-2xl rotate-1 shadow-md transform translate-y-0.5 transition-transform" />

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border-2 border-leaf-peach/40 dark:border-slate-800 relative overflow-hidden">
          {/* Notebook decorative binder rings detail */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 flex gap-4 -mt-3">
            <div className="w-3 h-6 bg-slate-300 dark:bg-slate-600 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] border border-slate-400" />
            <div className="w-3 h-6 bg-slate-300 dark:bg-slate-600 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] border border-slate-400" />
            <div className="w-3 h-6 bg-slate-300 dark:bg-slate-600 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] border border-slate-400" />
          </div>

          <div className="text-center mb-6 mt-2">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-start gap-2 text-sm border border-red-200 dark:border-red-800/50"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="font-medium leading-tight">{error}</p>
              </motion.div>
            )}
            <div>
              <label className="block text-base font-bold text-slate-800 dark:text-slate-200 mb-1.5">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all font-sans font-medium ${error && !email.includes('@') ? 'border-red-400 focus:border-red-500' : 'border-leaf-peach/40 dark:border-slate-700 focus:border-slate-850 dark:focus:border-slate-300'}`}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-slate-800 dark:text-slate-200 mb-1.5">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all font-sans ${error && password.length < 6 ? 'border-red-400 focus:border-red-500' : 'border-leaf-peach/40 dark:border-slate-700 focus:border-slate-850 dark:focus:border-slate-300'}`}
                placeholder="••••••••"
              />
            </div>
            
            <div className="flex justify-start">
              <button 
                type="button" 
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-sm text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Create Account'}
              </button>
            </div>

            <button 
              type="submit"
              className="w-full mt-6 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
      </motion.div>
    </div>
  );
}
