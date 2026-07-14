import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Camera, ReceiptText, ChevronRight, User, LogOut, Users, ArrowUpRight, ArrowDownRight, FileText, Moon, Sun, CreditCard, Info, X } from 'lucide-react';
import GroupDetailScreen from './GroupDetailScreen';
import { ExpenseItem } from '../types';

interface ActivityItem {
  id: string;
  type: 'pending' | 'paid' | 'debt';
  title: string;
  amount: number;
  person: string;
  date: string;
}

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

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const activities = useMemo(() => {
    const list: ActivityItem[] = [];
    expenses.forEach(exp => {
      const isYouPayer = exp.payer.toLowerCase() === 'you' || exp.payer.toLowerCase() === 'me' || (userName && exp.payer.toLowerCase() === userName.toLowerCase());
      
      exp.splits.forEach(split => {
        const isYouSplit = split.person.toLowerCase() === 'you' || split.person.toLowerCase() === 'me' || (userName && split.person.toLowerCase() === userName.toLowerCase());
        
        if (isYouPayer && !isYouSplit) {
          list.push({
            id: exp.id + '-' + split.person,
            type: split.paid ? 'paid' : 'pending',
            title: exp.title,
            amount: split.amountOwed,
            person: split.person,
            date: exp.date
          });
        } else if (!isYouPayer && isYouSplit) {
          list.push({
            id: exp.id + '-' + split.person,
            type: split.paid ? 'paid' : 'debt',
            title: exp.title,
            amount: split.amountOwed,
            person: exp.payer,
            date: exp.date
          });
        }
      });
    });
    return list.sort((a, b) => { const timeA = a.date === 'Just now' ? Number.MAX_SAFE_INTEGER : new Date(a.date).getTime(); const timeB = b.date === 'Just now' ? Number.MAX_SAFE_INTEGER : new Date(b.date).getTime(); return timeB - timeA; });
  }, [expenses, userName]);

  return (
    <div className="min-h-screen bg-[#F7F5EC] dark:bg-[#121212] font-sans pb-28">
      {/* Header Profile */}
      <header className="bg-white dark:bg-slate-900 border-b border-leaf-peach/40 dark:border-slate-800 px-6 py-4 sticky top-0 z-20 flex justify-between items-center">
        <div>
          <h1 className="text-2xl tracking-tight text-slate-900 dark:text-white flex items-center" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900 }}>
            L<span className="relative inline-flex items-center justify-center">ı<span className="absolute top-[0.1em] left-1/2 -translate-x-1/2 w-[0.25em] h-[0.25em] bg-[#10C86E] rounded-full"></span></span>STA
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Welcome back{userName ? ', ' + userName.split(' ')[0] : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          
          <button 
            onClick={() => setIsMenuOpen(true)}
            className={`w-10 h-10 rounded-full ${userColor || 'bg-leaf-peach'} border-2 border-[#F7F5EC] dark:border-[#30373C] flex items-center justify-center text-white font-bold shadow-sm hover:opacity-90 transition-opacity`}
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col"
            >
              <div className="px-6 py-6 border-b border-leaf-peach/40 dark:border-slate-800 flex justify-between items-center bg-[#F7F5EC] dark:bg-[#121212]">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${userColor || 'bg-leaf-peach'} border-2 border-[#F7F5EC] dark:border-[#30373C] flex items-center justify-center text-white font-bold shadow-sm`}>
                    {userName ? userName.charAt(0).toUpperCase() : <User size={22} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{userName || 'My Profile'}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#FCECEE] dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-leaf-pink/20 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                

                <button 
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-leaf-peach/5 dark:hover:bg-slate-800/50 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-leaf-peach/10 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors">
                      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">Theme</span>
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{isDarkMode ? 'Dark' : 'Light'}</span>
                </button>
                <button 
                  onClick={onAddBillingMethod}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-leaf-peach/5 dark:hover:bg-slate-800/50 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-leaf-peach/10 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors">
                      <CreditCard size={18} />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">Payment Methods</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>

                <button 
                  onClick={() => { setShowAbout(true); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-leaf-peach/5 dark:hover:bg-slate-800/50 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-leaf-peach/10 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors">
                      <Info size={18} />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">About & FAQs</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
              </div>

              <div className="p-6 border-t border-leaf-peach/40 dark:border-slate-800">
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-leaf-pink/10 hover:bg-leaf-pink/20 text-leaf-pink-dark dark:text-leaf-pink transition-colors font-bold"
                >
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="px-6 py-6 max-w-2xl mx-auto space-y-8">
        
        {/* Your Listahan Section */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Listahan</h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar -mx-6 px-6">
            
            {/* Add New Group Card */}
            <button 
              onClick={onCreateGroup}
              className="snap-start shrink-0 w-36 h-40 rounded-3xl border-2 border-dashed border-leaf-peach/40 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:bg-leaf-peach/20 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-leaf-peach/10 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-sm transition-colors">
                <Plus size={24} className="group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-bold text-slate-600 dark:text-slate-400 text-sm">Add Listahan</span>
            </button>

            {/* Existing Groups */}
            {groups.map(group => (
              <button 
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className="snap-start shrink-0 w-48 h-36 rounded-[1.25rem] p-2 flex flex-col text-left transition-transform hover:scale-[1.02] active:scale-[0.98] bg-[#FCECEE] dark:bg-slate-800 shadow-sm border border-leaf-peach/40 dark:border-slate-700"
              >
                <div className="px-3 pt-1.5 pb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight truncate">{group.name}</h3>
                </div>
                <div className="flex-1 w-full bg-white dark:bg-slate-900 rounded-xl p-3 flex flex-col justify-between border border-leaf-peach/40 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-leaf-peach/10 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                    <Users size={16} />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">{group.members} Members</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Activity Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Activity</h2>
            {activities.length > 0 && <span className="text-sm text-leaf-green dark:text-leaf-green-dark font-bold cursor-pointer">View all</span>}
          </div>

          {activities.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-leaf-peach/30 dark:border-slate-800 p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
                <ReceiptText size={32} />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No activity yet</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-[250px]">Add your first lista manually or scan a receipt to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <motion.div 
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-leaf-peach/30 dark:border-slate-800 flex items-center justify-between group cursor-pointer hover:border-leaf-peach/30 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      activity.type === 'pending' ? 'bg-leaf-yellow/20 text-leaf-yellow-dark' :
                      activity.type === 'paid' ? 'bg-leaf-green/20 text-leaf-green-dark' :
                      'bg-leaf-pink/20 text-leaf-pink-dark'
                    }`}>
                      {activity.type === 'pending' && <ReceiptText size={24} />}
                      {activity.type === 'paid' && <ArrowDownRight size={24} />}
                      {activity.type === 'debt' && <ArrowUpRight size={24} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{activity.title}</h4>
                      <p className="text-xs font-medium mt-0.5 text-slate-600 dark:text-slate-400">
                        {activity.type === 'pending' ? `${activity.person} owes you` :
                         activity.type === 'paid' ? `You paid ${activity.person}` :
                         `You owe ${activity.person}`} • {activity.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`block font-black ${
                      activity.type === 'pending' ? 'text-leaf-green dark:text-leaf-green-dark' :
                      activity.type === 'paid' ? 'text-slate-800 dark:text-slate-200' :
                      'text-leaf-pink dark:text-leaf-pink-dark'
                    }`}>
                      {activity.type !== 'paid' && activity.type !== 'pending' ? '-' : ''}
                      ₱{activity.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {selectedGroup && (
          <GroupDetailScreen 
            group={selectedGroup}
            expenses={expenses}
            setExpenses={setExpenses}
            onBack={() => setSelectedGroup(null)} 
            userName={userName}
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col justify-end sm:justify-center items-center sm:p-6"
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
              <div className="px-6 py-4 border-b border-leaf-peach/30 dark:border-slate-800 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Info size={20} className="text-leaf-green dark:text-leaf-green-dark" />
                  About & FAQs
                </h3>
                <button 
                  onClick={() => { setShowAbout(false); setIsMenuOpen(true); }}
                  className="w-8 h-8 rounded-full bg-leaf-peach/10 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-leaf-pink/20 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-2 text-leaf-green dark:text-leaf-green-dark">About Lista</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    Lista is your go-to companion for tracking group expenses and settling debts seamlessly. 
                    Whether you are dining out with friends or splitting household bills, we make sharing expenses stress-free.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-2 text-leaf-green dark:text-leaf-green-dark">Frequently Asked Questions</h4>
                  
                  <div className="bg-leaf-peach/5 dark:bg-slate-800/50 p-4 rounded-xl">
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-1">How do I add a new expense?</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Head over to your group and click on the "Pa-Lista" button or simply scan your receipt.</p>
                  </div>
                  
                  <div className="bg-leaf-peach/5 dark:bg-slate-800/50 p-4 rounded-xl">
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-1">How do I settle my debts?</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400">In your group's details, you'll see a quick summary of what you owe. Tap "Settle Up" to instantly clear your debts.</p>
                  </div>

                  <div className="bg-leaf-peach/5 dark:bg-slate-800/50 p-4 rounded-xl">
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Can I change my payment method?</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Yes, you can manage your GCash, Maya, and cash preferences from the menu drawer under "Payment Methods".</p>
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

