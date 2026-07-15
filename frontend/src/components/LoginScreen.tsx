import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface LoginScreenProps {
  onLogin: (user: any) => void;
  onNext?: (email: string) => void;
}

export default function LoginScreen({ onLogin, onNext }: LoginScreenProps) {
  const [showForm, setShowForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowForm(true);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
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

    setLoading(true);

    try {
      const check = await api.checkUser('email', email);

      if (isSignUp) {
        // Sign Up Mode: Check if user already exists
        if (check.exists) {
          setError('An account with this email already exists.');
          setLoading(false);
          return;
        }

        // Proceed to onboarding/profile setup
        localStorage.setItem('userEmail', email);
        if (onNext) {
          onNext(email);
        }
      } else {
        // Sign In Mode: Check if user exists
        if (!check.exists) {
          setError('No account found with this email. We have switched you to "Create Account" so you can sign up.');
          setIsSignUp(true);
          setLoading(false);
          return;
        }

        // If exists, log in and redirect to dashboard immediately
        const loginRes = await api.login('email', email);
        if (loginRes.token && loginRes.user) {
          onLogin(loginRes.user);
        } else {
          setError('Login failed. Please try again.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#F3EFE7] dark:from-[#252B2F] dark:via-[#222123] dark:to-[#2F2427] relative flex flex-col items-center justify-center overflow-hidden">
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
          className="relative flex flex-col items-center justify-center p-4 mb-4 w-full max-w-2xl border-x border-transparent"
        >
          <motion.h1
            initial="hidden"
            animate="visible"
            className="text-7xl md:text-8xl tracking-tighter text-[#13463B] dark:text-white select-none pointer-events-none pb-2 text-center flex items-center justify-center w-full"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, letterSpacing: "-0.04em" }}
          >
            {/* The "border" the title must not go past - overflow-hidden creates this hard line effect */}
            <div className="flex items-baseline justify-center overflow-hidden px-20 pt-6 pb-2 w-full">
              {[
                { char: 'L', ml: '-0.06em' },
                { char: 'I', greenDot: true, ml: '0.04em', scale: true },
                { char: 'S', ml: '0.04em' },
                { char: 'T', ml: '0.02em' },
                { char: 'A', ml: '-0.1em' }
              ].map((item, index) => (
                <motion.div 
                  key={index} 
                  className="relative inline-flex items-baseline justify-center"
                  initial={{ y: '100%', scale: 1.2 }}
                  style={{ marginLeft: item.ml }}
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
                        className="absolute bottom-[0.60em] left-[62%] -translate-x-1/2 w-[0.2em] h-[0.2em] bg-[#10C86E] rounded-full"
                      ></motion.span>
                    )}
                    <span className="leading-none" style={item.scale ? { fontSize: '0.65em' } : {}}>
                      {item.char}
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
        <div className="absolute inset-x-6 -bottom-5 top-10 bg-[#13463B] dark:bg-[#1C2125] rounded-3xl shadow-md z-0" />
        <div className="absolute inset-x-6 -bottom-2.5 top-10 bg-[#E5E1D3] dark:bg-[#252B2F] rounded-3xl shadow-md z-0" />
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-[#C8DACF] dark:border-slate-800 relative z-10">
          {/* Notebook decorative binder rings detail */}
          <div className="absolute -top-3 left-0 right-0 flex justify-center gap-8 z-20">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative w-4 h-7 bg-[#13463B] dark:bg-slate-500 rounded-full shadow-md border border-[#0D3028] dark:border-slate-700">
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 bg-black/20 dark:bg-black/40 rounded-full shadow-inner" />
              </div>
            ))}
          </div>

          <div className="text-center mb-6 mt-2">
            <h2 className="text-4xl font-black text-[#13463B] dark:text-white font-sans tracking-tight">
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
              <label className="block text-base font-bold text-[#1B5648] dark:text-slate-200 mb-1.5">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-950 text-[#13463B] dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all font-sans font-medium ${error && !email.includes('@') ? 'border-red-400 focus:border-red-500' : 'border-[#C8DACF] dark:border-slate-700 focus:border-slate-850 dark:focus:border-slate-300'}`}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-base font-bold text-[#1B5648] dark:text-slate-200 mb-1.5">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-950 text-[#13463B] dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all font-sans ${error && password.length < 6 ? 'border-red-400 focus:border-red-500' : 'border-[#C8DACF] dark:border-slate-700 focus:border-slate-850 dark:focus:border-slate-300'}`}
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
                className="text-sm text-[#1B5648] dark:text-slate-300 hover:text-[#13463B] dark:hover:text-white font-medium transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Create Account'}
              </button>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#13463B] hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
      </motion.div>
    </div>
  );
}
