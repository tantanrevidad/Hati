import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, Users, ArrowRight, UserPlus, AlertCircle, Link as LinkIcon, X, Search, ArrowLeft } from 'lucide-react';
import QRScanner from './QRScanner';

interface GroupSetupScreenProps {
  onNext: (groupName: string) => void;
  onBack?: () => void;
}

type JoinMethod = 'scan' | 'link' | null;

export default function GroupSetupScreen({ onNext, onBack }: GroupSetupScreenProps) {
  const [groupNameInput, setGroupNameInput] = useState('');
  const [error, setError] = useState('');
  const [joinMethod, setJoinMethod] = useState<JoinMethod>(null);
  const [linkInput, setLinkInput] = useState('');
  const [isHoveringLink, setIsHoveringLink] = useState(false);

  const handleCreateGroup = () => {
    setError('');
    if (!groupNameInput.trim()) {
      setError('Please provide a group name to proceed.');
      return;
    }
    onNext(groupNameInput);
  };

  const handleJoinByLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    if (!linkInput.trim()) {
      setError('Please enter a valid invite link.');
      return;
    }
    
    // Simulate group validation
    if (!linkInput.includes('lista.app/join/')) {
      setError('No such group. Please check the link and try again.');
      return;
    }

    onNext('Joined Group');
  };

  const handleScan = (data: string) => {
    if (!data.includes('lista.app/join/')) {
      setError('Invalid QR code. No such group found.');
      setJoinMethod(null);
      return;
    }
    onNext('Joined Group');
  };

  const handleScanError = (err: string) => {
    setError(err);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F5EC] via-[#FCECEE] to-[#EFA8B5]/20 dark:from-[#252B2F] dark:via-[#222123] dark:to-[#2F2427] py-12 px-6 flex flex-col items-center justify-start overflow-y-auto relative">
      {/* Background soft lighting */}
      <div className="absolute inset-0 bg-gradient-to-br from-leaf-green/5 via-transparent to-leaf-yellow/5 pointer-events-none" />

      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 w-10 h-10 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-full flex items-center justify-center text-slate-800 dark:text-slate-300 shadow-sm backdrop-blur-sm transition-all z-20"
        >
          <ArrowLeft size={20} className="stroke-[2.5]" />
        </button>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black font-sans text-slate-900 dark:text-white mb-2 tracking-tight">Team up!</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Create a new group or join an existing one.</p>
          <div className="h-0.5 w-16 bg-leaf-yellow mx-auto mt-3 rounded-full" />
        </div>

        <div className="space-y-6 font-sans relative">
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10, height: 0 }} 
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-start gap-2 text-sm border border-red-200 dark:border-red-800/50 shadow-sm"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-bold leading-tight mt-0.5">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Create New Group Option with Layered Card Effect */}
          <div className={`relative z-10 transition-all duration-300 ${joinMethod ? 'opacity-50 scale-95 pointer-events-none' : ''}`}>
            {/* ... */}
            {/* Paper stack shadows */}
            <div className="absolute inset-x-6 -bottom-2 h-16 bg-leaf-pink/30 dark:bg-leaf-pink-dark/20 rounded-3xl rotate-1 shadow-md z-0" />
            <div className="absolute inset-x-4 -bottom-1 h-16 bg-leaf-green/20 dark:bg-leaf-green-dark/15 rounded-3xl -rotate-1 shadow-md z-0" />

            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border-2 border-leaf-peach/40 dark:border-slate-800 relative overflow-hidden group z-10">
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-3.5 flex flex-col gap-6 z-20">
                <div className="w-6 h-3 bg-slate-300 dark:bg-slate-600 rounded-full shadow-[inset_2px_0_4px_rgba(0,0,0,0.2)] border border-slate-400 rotate-90" />
                <div className="w-6 h-3 bg-slate-300 dark:bg-slate-600 rounded-full shadow-[inset_2px_0_4px_rgba(0,0,0,0.2)] border border-slate-400 rotate-90" />
              </div>

              <div className="absolute top-0 right-0 w-32 h-32 bg-leaf-yellow/20 dark:bg-leaf-yellow-dark/15 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
              
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#F7F5EC] dark:bg-slate-950 flex items-center justify-center text-slate-800 dark:text-slate-100 border-2 border-leaf-peach/40 dark:border-slate-800 shadow-sm">
                  <Users size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Create New Group</h3>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Start fresh with your friends</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <input 
                  type="text"
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  placeholder="Group Name (e.g. Bali Trip)"
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-leaf-peach/40 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-slate-850 dark:focus:border-slate-300 focus:outline-none transition-all font-medium font-sans"
                />
                <button 
                  onClick={handleCreateGroup}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 border-2 border-slate-900 dark:border-white shadow-md hover:translate-y-[-1px] active:translate-y-[1px]"
                >
                  <span>Create Group</span>
                  <ArrowRight size={20} className="stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          <div className={`flex items-center justify-center gap-4 text-slate-400 dark:text-slate-500 py-1 transition-opacity ${joinMethod ? 'opacity-50' : ''}`}>
            <div className="h-px bg-slate-300 dark:bg-slate-700 flex-1"></div>
            <span className="font-roboto font-bold -2xl font-black text-slate-600 dark:text-slate-400">Join Existing</span>
            <div className="h-px bg-slate-300 dark:bg-slate-700 flex-1"></div>
          </div>

          <div className="relative">
            <div 
              className={`grid grid-cols-2 gap-4 transition-all duration-300 ${joinMethod === 'link' ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}
            >
              <button 
                onClick={() => { setJoinMethod('scan'); setError(''); }}
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 border-2 border-leaf-peach/40 dark:border-slate-800 hover:border-slate-900 dark:hover:border-white transition-all flex flex-col items-center justify-center gap-3 group relative overflow-hidden hover:translate-y-[-2px] active:translate-y-[1px]"
              >
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-leaf-yellow/60" />
                <div className="w-12 h-12 rounded-full bg-[#F7F5EC] dark:bg-slate-950 border-2 border-leaf-peach/40 dark:border-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-300 group-hover:bg-leaf-yellow/30 dark:group-hover:bg-leaf-yellow-dark/20 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  <QrCode size={22} className="stroke-[2.5]" />
                </div>
                <span className="font-black text-slate-800 dark:text-slate-200 text-base tracking-tight">Scan QR</span>
              </button>

              <button 
                onClick={() => { setJoinMethod('link'); setError(''); }}
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 border-2 border-leaf-peach/40 dark:border-slate-800 hover:border-slate-900 dark:hover:border-white transition-all flex flex-col items-center justify-center gap-3 group relative overflow-hidden hover:translate-y-[-2px] active:translate-y-[1px]"
              >
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-leaf-pink/60" />
                <div className="w-12 h-12 rounded-full bg-[#F7F5EC] dark:bg-slate-950 border-2 border-leaf-peach/40 dark:border-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-300 group-hover:bg-leaf-pink/30 dark:group-hover:bg-leaf-pink-dark/20 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  <UserPlus size={22} className="stroke-[2.5]" />
                </div>
                <span className="font-black text-slate-800 dark:text-slate-200 text-base tracking-tight">Join Link</span>
              </button>
            </div>

            <AnimatePresence>
              {joinMethod === 'link' && (
                <motion.div 
                  key="link"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 flex items-center justify-center z-20"
                >
                  <div className="w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-2 pl-4 border-2 border-slate-800 dark:border-slate-300 flex items-center gap-2 relative z-20">
                    <Search size={20} className="text-slate-400 flex-shrink-0" />
                    <form onSubmit={handleJoinByLink} className="flex-1 flex items-center">
                      <input 
                        type="text"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        placeholder="Paste invite link..."
                        className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium font-sans"
                        autoFocus
                      />
                      <button 
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-2.5 px-4 rounded-xl transition-all shadow-md ml-2"
                      >
                        Join
                      </button>
                    </form>
                    <button 
                      onClick={() => setJoinMethod(null)} 
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* QR Scanner Full Screen Modal Overlay */}
      <AnimatePresence>
        {joinMethod === 'scan' && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6"
          >
            <button onClick={() => setJoinMethod(null)} className="absolute top-8 right-8 text-white/50 hover:text-white bg-white/10 rounded-full p-2 backdrop-blur-sm z-50 transition-colors">
              <X size={24} />
            </button>
            <div className="text-center mb-8 relative z-10">
              <div className="w-16 h-16 rounded-full bg-leaf-yellow/20 flex items-center justify-center text-leaf-yellow mx-auto mb-4">
                <QrCode size={32} />
              </div>
              <h3 className="font-black text-3xl mb-2 text-white mt-2 tracking-tight">Scan QR Code</h3>
              <p className="text-sm text-center text-white/60">Position the group QR code within the frame.</p>
            </div>
            
            <div className="w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 relative z-10 bg-black">
              <QRScanner onScan={handleScan} onError={handleScanError} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
