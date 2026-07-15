import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { User, Camera, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface ProfileScreenProps {
  onNext: (name: string, color: string, avatar: string | null) => void;
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
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 256;
            const MAX_HEIGHT = 256;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setAvatar(dataUrl);
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please select an image file (e.g. JPG, PNG, WEBP).');
      }
    }
  };

  const handleNext = () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    onNext(name, selectedColor, avatar);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3EFE7] via-[#FCECEE] to-[#EFA8B5]/20 dark:from-[#252B2F] dark:via-[#222123] dark:to-[#2F2427] py-12 px-6 flex flex-col items-center justify-center relative">
      {/* Background overlay for soft mood light */}
      <div className="absolute inset-0 bg-gradient-to-tr from-leaf-yellow/5 via-transparent to-leaf-pink/5 pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Layered Paper Stack under the card - explicit lower z-index */}
        <div className="absolute inset-x-0 -bottom-5 top-10 bg-[#13463B] dark:bg-[#1C2125] rounded-3xl shadow-md z-0" />
        <div className="absolute inset-x-0 -bottom-2.5 top-10 bg-[#E5E1D3] dark:bg-[#252B2F] rounded-3xl shadow-md z-0" />
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border-2 border-[#C8DACF] dark:border-slate-800 relative z-10">
          {/* Notebook decorative binder rings detail */}
          <div className="absolute -top-3 left-0 right-0 flex justify-center gap-8 z-20">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative w-4 h-7 bg-[#13463B] dark:bg-slate-500 rounded-full shadow-md border border-[#0D3028] dark:border-slate-700">
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 bg-black/20 dark:bg-black/40 rounded-full shadow-inner" />
              </div>
            ))}
          </div>
          <div className="text-center mb-8 mt-4">
            <h2 className="text-4xl font-black text-[#13463B] dark:text-white font-sans tracking-tight">Create Profile</h2>
            <p className="text-[#316D5F] dark:text-slate-400 font-medium mt-1">Let's get to know you better.</p>
            <div className="h-0.5 w-16 bg-leaf-peach mx-auto mt-4 rounded-full" />
          </div>

          <div className="flex flex-col items-center mb-8 relative">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className={`w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center overflow-hidden transition-all duration-300 ${avatar ? 'bg-white' : selectedColor}`}>
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-[#13463B]/60 dark:text-white/60" />
                )}
                <div className="absolute inset-0 bg-black/10 dark:bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="text-white drop-shadow-md" size={32} />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button 
                type="button"
                className="absolute bottom-0 right-0 bg-[#13463B] hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 p-3 rounded-full shadow-lg border-2 border-white dark:border-slate-900 hover:scale-110 transition-transform z-20"
              >
                <Camera size={18} className="stroke-[2.5]" />
              </button>
            </div>
            
            {/* NEW LOCATION FOR COLORS: below the profile photo! */}
            <div className="flex justify-center gap-4 mt-6">
              {AVATAR_COLORS.map((colorClass) => (
                <button
                  key={colorClass}
                  type="button"
                  onClick={() => setSelectedColor(colorClass)}
                  className={`w-10 h-10 rounded-full ${colorClass} ${
                    selectedColor === colorClass 
                      ? 'ring-4 ring-offset-2 ring-slate-800 dark:ring-slate-200 dark:ring-offset-slate-900 scale-110 shadow-md' 
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  } transition-all duration-200`}
                >
                  {selectedColor === colorClass && (
                    <Check size={16} className="text-white mx-auto stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-start gap-2 text-sm border border-red-200 dark:border-red-800/50 shadow-sm"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="font-bold leading-tight">{error}</p>
              </motion.div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-bold text-[#13463B] dark:text-slate-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950 text-[#13463B] dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-800 dark:focus:border-slate-400 transition-colors font-medium"
                placeholder="How should we call you?"
                maxLength={30}
              />
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-[#13463B] hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md border-2 border-slate-900 dark:border-white hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              <span>Continue</span>
              <ArrowRight size={20} className="stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}