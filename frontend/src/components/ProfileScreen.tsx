import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Camera, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface ProfileScreenProps {
  onNext: (name: string, color: string) => void;
}

const AVATAR_COLORS = [
  'bg-leaf-pink dark:bg-leaf-pink-dark',
  'bg-leaf-peach dark:bg-leaf-peach-dark',
  'bg-leaf-yellow dark:bg-leaf-yellow-dark',
  'bg-leaf-green dark:bg-leaf-green-dark'
];

export default function ProfileScreen({ onNext }: ProfileScreenProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    onNext(name, selectedColor);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F5EC] via-[#FCECEE] to-[#EFA8B5]/20 dark:from-[#252B2F] dark:via-[#222123] dark:to-[#2F2427] py-12 px-6 flex flex-col items-center justify-center relative">
      {/* Background overlay for soft mood light */}
      <div className="absolute inset-0 bg-gradient-to-tr from-leaf-yellow/5 via-transparent to-leaf-pink/5 pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Layered Paper Stack under the card - explicit lower z-index */}
        <div className="absolute inset-x-8 -bottom-3 h-20 bg-leaf-peach/40 dark:bg-leaf-peach-dark/30 rounded-3xl rotate-2 shadow-lg z-0" />
        <div className="absolute inset-x-6 -bottom-1 h-20 bg-leaf-yellow/50 dark:bg-leaf-yellow-dark/30 rounded-3xl -rotate-1 shadow-md z-0" />
        
        {/* Decorative Tape Sticker holding the "notebook" card - higher z-index */}
        <div className="absolute -top-6 left-12 w-28 h-8 bg-leaf-pink/40 dark:bg-leaf-pink-dark/30 backdrop-blur-sm -rotate-6 border border-white/20 dark:border-slate-800/20 shadow-sm z-20 flex items-center justify-center">
          <div className="w-full h-full border-x-2 border-dashed border-white/40" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border-2 border-leaf-peach/40 dark:border-slate-800 relative overflow-hidden z-10"
        >
          {/* Spiral binder holes at top of page */}
          <div className="absolute top-0 inset-x-0 flex justify-around px-8 -mt-3.5 z-20">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-[#E5E1D3] dark:bg-[#252B2F] border-2 border-leaf-peach/40 dark:border-slate-800 shadow-inner" />
                <div className="w-2.5 h-6 bg-slate-300 dark:bg-slate-600 rounded-full -mt-2 border border-slate-400 shadow-sm" />
              </div>
            ))}
          </div>

          <div className="text-center mb-8 mt-4">
            <h2 className="text-3xl font-black font-sans text-slate-900 dark:text-white mb-2 tracking-tight">Create Profile</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Let's get to know you better.</p>
            <div className="h-0.5 w-16 bg-leaf-peach mx-auto mt-3 rounded-full" />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-start gap-2 text-sm border border-red-200 dark:border-red-800/50 shadow-sm mb-6"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="font-bold leading-tight mt-0.5">{error}</p>
            </motion.div>
          )}

          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              {/* Colored ring behind profile picture to show contrast */}
              <div className="absolute inset-0 -m-1.5 rounded-full bg-gradient-to-r from-leaf-pink via-leaf-yellow to-leaf-green animate-pulse opacity-40 blur-sm" />
              <div className={`w-32 h-32 rounded-full ${selectedColor} flex items-center justify-center text-slate-900 dark:text-slate-100 text-5xl font-black shadow-xl border-4 border-white dark:border-slate-800 transition-all duration-300 relative z-10`}>
                {name.trim().charAt(0).toUpperCase() || <User size={48} className="stroke-[2.5]" />}
              </div>
              <button className="absolute bottom-0 right-0 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 p-3 rounded-full shadow-lg border-2 border-white dark:border-slate-900 hover:scale-110 transition-transform z-20">
                <Camera size={18} className="stroke-[2.5]" />
              </button>
            </div>
            
            <div className="flex gap-3.5 mt-6 relative z-10 bg-white dark:bg-slate-950 p-2 rounded-2xl border border-slate-300/60 dark:border-slate-800/60">
              {AVATAR_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full ${color} flex items-center justify-center transition-all hover:scale-115 active:scale-95 shadow-inner border border-black/10 dark:border-white/10 ${selectedColor === color ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-950 scale-110' : 'opacity-80'}`}
                >
                  {selectedColor === color && <Check size={14} className="text-slate-900 dark:text-slate-900 font-bold stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Your Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-3.5 text-lg rounded-xl border-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all font-sans font-medium ${error ? 'border-red-400 focus:border-red-500' : 'border-leaf-peach/40 dark:border-slate-700 focus:border-slate-800 dark:focus:border-slate-300'}`}
                placeholder="e.g. Alex"
              />
            </div>

            <button 
              onClick={handleNext}
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 text-lg shadow-md hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
