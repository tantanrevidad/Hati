import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Camera, ReceiptText, ChevronRight, User, LogOut, Users, ArrowUpRight, ArrowDownRight, FileText, CreditCard, Info, X, WifiOff, Activity, Scan, Sun, Moon } from 'lucide-react';
import GroupDetailScreen from './GroupDetailScreen';
import ActivityScreen from './ActivityScreen';
import { api } from '../services/api';
import { ExpenseItem } from '../types';



interface DashboardScreenProps {
  userName?: string;
  userColor?: string;
  groups: { id: string; name: string; members: number; color?: string }[];
  expenses: ExpenseItem[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
  onCreateGroup?: () => void;
  onLogout?: () => void;
  onAddBillingMethod?: () => void;
  initialMenuOpen?: boolean;
}

export default function DashboardScreen({ groups, expenses, setExpenses, onCreateGroup, onLogout, onAddBillingMethod, userName, userColor, initialMenuOpen = false }: DashboardScreenProps) {
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string; members: number; color?: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(initialMenuOpen);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [ledgers, setLedgers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (groups.length > 0) {
      groups.forEach(async (group) => {
        try {
          const ledger = await api.getLedger(group.id);
          setLedgers(prev => ({ ...prev, [group.id]: ledger }));
        } catch (err) {
          console.error(`Failed to load ledger for group ${group.id}:`, err);
        }
      });
    }
  }, [groups]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  

  


  const reloadLedger = async (groupId: string) => {
    try {
      const ledger = await api.getLedger(groupId);
      setLedgers(prev => ({ ...prev, [groupId]: ledger }));
    } catch (err) {
      console.error(`Failed to load ledger for group ${groupId}:`, err);
    }
  };

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EFE7] dark:bg-[#121212] font-sans pb-28">
      
      
      {/* Header Profile */}
      <header className="bg-white dark:bg-slate-900 border-b border-[#C8DACF] dark:border-slate-800 px-6 py-4 sticky top-0 z-20 flex justify-between items-center">
        <div>
          <h1 className="text-2xl tracking-tight text-[#13463B] dark:text-white flex items-center" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900 }}>
            L<span className="relative inline-flex items-center justify-center">ı<span className="absolute top-[0.1em] left-1/2 -translate-x-1/2 w-[0.25em] h-[0.25em] bg-[#10C86E] rounded-full"></span></span>STA
          </h1>
          <p className="text-sm text-[#316D5F] dark:text-slate-400 font-medium">Welcome{userName ? ', ' + userName.split(' ')[0] : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className={`w-10 h-10 rounded-full ${userColor || 'bg-[#236450]'} border-2 border-[#F3EFE7] dark:border-[#30373C] flex items-center justify-center text-white font-bold shadow-sm hover:opacity-90 transition-opacity`}
          >
            {userName ? userName.charAt(0).toUpperCase() : <User size={18} />}
          </button>
        </div>
      </header>

      {/* Side Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-[#13463B]/60 dark:bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col"
            >
              <div className="px-6 py-6 border-b border-[#C8DACF] dark:border-slate-800 flex justify-between items-center bg-[#F3EFE7] dark:bg-[#121212]">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${userColor || 'bg-[#236450]'} border-2 border-[#F3EFE7] dark:border-[#30373C] flex items-center justify-center text-white font-bold shadow-sm`}>
                    {userName ? userName.charAt(0).toUpperCase() : <User size={22} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#13463B] dark:text-white text-lg leading-tight">{userName || 'My Profile'}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#E5F0E9] dark:bg-slate-800 flex items-center justify-center text-[#236450] dark:text-slate-300 hover:bg-[#C8DACF] dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                
                <button 
                  onClick={() => { setShowActivity(true); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#E5F0E9] dark:hover:bg-slate-800/50 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E5F0E9] dark:bg-slate-800 flex items-center justify-center text-[#1B5648] dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors">
                      <Activity size={16} />
                    </div>
                    <span className="font-semibold text-sm text-[#13463B] dark:text-white">Activity</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
                <button 
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#E5F0E9] dark:hover:bg-slate-800/50 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E5F0E9] dark:bg-slate-800 flex items-center justify-center text-[#1B5648] dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors">
                      {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                    </div>
                    <span className="font-semibold text-sm text-[#13463B] dark:text-white">Theme</span>
                  </div>
                  <span className="text-xs font-bold text-[#316D5F] dark:text-slate-400">{isDarkMode ? 'Dark' : 'Light'}</span>
                </button>

                <button 
                  onClick={onAddBillingMethod}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#E5F0E9] dark:hover:bg-slate-800/50 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E5F0E9] dark:bg-slate-800 flex items-center justify-center text-[#1B5648] dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors">
                      <CreditCard size={16} />
                    </div>
                    <span className="font-semibold text-sm text-[#13463B] dark:text-white">Payment Methods</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
                <button 
                  onClick={() => { setShowAbout(true); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#E5F0E9] dark:hover:bg-slate-800/50 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E5F0E9] dark:bg-slate-800 flex items-center justify-center text-[#1B5648] dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors">
                      <Info size={16} />
                    </div>
                    <span className="font-semibold text-sm text-[#13463B] dark:text-white">About & FAQs</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              </div>

              <div className="p-6 border-t border-[#C8DACF] dark:border-slate-800 shrink-0">
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#EFA8B5]/10 hover:bg-[#EFA8B5]/20 text-[#CD5878] dark:text-[#EFA8B5] transition-colors font-bold"
                >
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="px-6 py-6 max-w-2xl mx-auto">
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#13463B] dark:text-white">Your Listahan</h2>
            <button
              onClick={onCreateGroup}
              className="w-10 h-10 rounded-full bg-[#13463B] dark:bg-white flex items-center justify-center text-white dark:text-[#13463B] hover:opacity-90 transition-opacity shadow-md"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            {groups.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-[#C8DACF] dark:border-slate-800 text-center shadow-sm">
                <div className="w-16 h-16 bg-[#E5F0E9] dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Users size={32} />
                </div>
                <h3 className="font-bold text-[#13463B] dark:text-white text-lg mb-2">No groups yet</h3>
                <p className="text-[#316D5F] dark:text-slate-400 text-sm mb-6">Create a Listahan to start splitting bills with friends.</p>
                <button 
                  onClick={onCreateGroup}
                  className="px-6 py-3 bg-[#13463B] dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-md"
                >
                  Create Listahan
                </button>
              </div>
            ) : (
              groups.map(group => {
                const currentUser = JSON.parse(localStorage.getItem('lista-user') || '{}');
                const groupLedger = ledgers[group.id];
                const netCentavos = groupLedger?.balances?.[currentUser.id] || 0;
                const netBalance = netCentavos / 100;
                const hasPending = groupLedger?.debts && groupLedger.debts.length > 0;
                const initialChar = group.name.charAt(0).toUpperCase();

                return (
                  <button 
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className="w-full bg-white dark:bg-slate-900 rounded-[32px] p-6 text-left transition-transform hover:scale-[1.01] active:scale-[0.99] border border-[#C8DACF] dark:border-slate-700 shadow-sm flex flex-col"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#8FD1AD] flex items-center justify-center text-[#13463B] font-bold text-xl mb-4">
                      {initialChar}
                    </div>

                    <div className="w-full flex items-center justify-between mb-1">
                      <h3 className="font-bold text-[#13463B] dark:text-white text-[22px] tracking-tight">{group.name}</h3>
                      <ChevronRight size={20} className="text-[#316D5F] dark:text-slate-400" />
                    </div>
                    
                    <p className="text-[#577870] dark:text-slate-400 text-sm mb-6">{group.members} people sharing</p>

                    <div className="h-px w-full bg-[#C8DACF] dark:bg-slate-700 mb-5" />

                    <div className="flex justify-between items-end w-full">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#577870] dark:text-slate-400 mb-1 block">Net Balance</span>
                        <div className={`text-[26px] font-black tracking-tighter ${netBalance >= 0 ? 'text-[#066549] dark:text-[#10C86E]' : 'text-leaf-pink dark:text-leaf-pink-dark'}`}>
                          {netBalance >= 0 ? '+' : '-'}₱{Math.abs(netBalance).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
                        </div>
                      </div>
                      
                      <div className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border ${!isOnline ? 'bg-slate-100 text-[#577870] border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' : hasPending ? 'bg-[#FDF6E3] text-[#A67C00] border-[#E8DAB2] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' : 'bg-[#EDF3E8] text-[#066549] border-[#C3D2B5] dark:bg-slate-800 dark:text-[#10C86E] dark:border-slate-700'}`}>
                        {!isOnline ? (
                          <>
                            <WifiOff size={12} strokeWidth={3} />
                            Offline — will sync
                          </>
                        ) : hasPending ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-[#A67C00] dark:bg-slate-500" />
                            Pending Bills
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-[#066549] dark:bg-leaf-green" />
                            Online
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {selectedGroup && (
          <GroupDetailScreen 
            group={selectedGroup}
            expenses={expenses}
            setExpenses={setExpenses}
            onBack={() => {
              if (selectedGroup) {
                reloadLedger(selectedGroup.id);
              }
              setSelectedGroup(null);
            }} 
            userName={userName}
          />
        )}
      </AnimatePresence>
      
      
      {/* Activity Screen */}
      <AnimatePresence>
        {showActivity && (
          <ActivityScreen 
            groups={groups}
            userName={userName}
            onBack={() => { setShowActivity(false); setIsMenuOpen(true); }}
            onSelectGroup={(group) => {
              setSelectedGroup(group);
              setShowActivity(false);
            }}
          />
        )}
      </AnimatePresence>
      
      {/* About & FAQs Modal */}
      <AnimatePresence>
        {showAbout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#13463B]/60 dark:bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end sm:justify-center items-center sm:p-6"
            onClick={() => { setShowAbout(false); setIsMenuOpen(true); }}
          >
            <motion.div
              initial={{ y: '100%', scale: 1 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: '100%', scale: 1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-[#C8DACF] dark:border-slate-800 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-lg text-[#13463B] dark:text-white flex items-center gap-2">
                  <Info size={20} className="text-leaf-green dark:text-leaf-green-dark" />
                  About & FAQs
                </h3>
                <button 
                  onClick={() => { setShowAbout(false); setIsMenuOpen(true); }}
                  className="w-8 h-8 rounded-full bg-[#E5F0E9] dark:bg-slate-800 flex items-center justify-center text-[#316D5F] dark:text-slate-400 hover:bg-leaf-pink/20 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <h4 className="font-bold text-[#13463B] dark:text-white text-sm uppercase tracking-wider mb-2 text-leaf-green dark:text-leaf-green-dark">About Lista</h4>
                  <p className="text-sm text-[#236450] dark:text-slate-300 leading-relaxed">
                    Lista is your go-to companion for tracking group expenses and settling debts seamlessly. 
                    Whether you are dining out with friends or splitting household bills, we make sharing expenses stress-free.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-bold text-[#13463B] dark:text-white text-sm uppercase tracking-wider mb-2 text-leaf-green dark:text-leaf-green-dark">Frequently Asked Questions</h4>
                  
                  <div className="bg-[#E5F0E9] dark:bg-slate-800/50 p-4 rounded-xl">
                    <h5 className="font-bold text-[#13463B] dark:text-white text-sm mb-1">How do I add a new expense?</h5>
                    <p className="text-xs text-[#316D5F] dark:text-slate-400">Head over to your group and click on the "Pa-Lista" button or simply scan your receipt.</p>
                  </div>
                  
                  <div className="bg-[#E5F0E9] dark:bg-slate-800/50 p-4 rounded-xl">
                    <h5 className="font-bold text-[#13463B] dark:text-white text-sm mb-1">How do I settle my debts?</h5>
                    <p className="text-xs text-[#316D5F] dark:text-slate-400">In your group's details, you'll see a quick summary of what you owe. Tap "Settle Up" to instantly clear your debts.</p>
                  </div>

                  <div className="bg-[#E5F0E9] dark:bg-slate-800/50 p-4 rounded-xl">
                    <h5 className="font-bold text-[#13463B] dark:text-white text-sm mb-1">Can I change my payment method?</h5>
                    <p className="text-xs text-[#316D5F] dark:text-slate-400">Yes, you can manage your GCash, Maya, and cash preferences from the menu drawer under "Payment Methods".</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
