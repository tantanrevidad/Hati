import { useState, useEffect } from 'react';
import { User, Expense } from './types';
import { SideMenu, Tab } from './components/SideMenu';
import { ProfileModal } from './components/ProfileModal';
import { AddMemberModal } from './components/AddMemberModal';
import { DebtSummaryCard } from './components/DebtSummaryCard';
import { ExpenseListCard, AddExpenseForm, SettlementsView } from './components/Views';
import { SettingsView } from './components/SettingsView';
import { OnboardingView } from './components/OnboardingView';
import { User as UserIcon, QrCode, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'You', avatar: 'bg-rose-400' },
  { id: 'u2', name: 'Alex', avatar: 'bg-blue-400' },
  { id: 'u3', name: 'Sam', avatar: 'bg-green-400' },
];

const INITIAL_EXPENSES: Expense[] = [
  { id: 'e1', description: 'Groceries', amount: 1500, category: 'Groceries', paidBy: 'u1', splitAmong: ['u1', 'u2', 'u3'], date: new Date().toISOString() },
  { id: 'e2', description: 'Internet Bill', amount: 1200, category: 'Internet', paidBy: 'u2', splitAmong: ['u1', 'u2', 'u3'], date: new Date(Date.now() - 86400000).toISOString() },
  { id: 'e3', description: 'Electricity', amount: 2500, category: 'Utilities', paidBy: 'u3', splitAmong: ['u1', 'u2', 'u3'], date: new Date(Date.now() - 172800000).toISOString() },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [currentUserId, setCurrentUserId] = useState<string>('u1');
  
  // LocalStorage state for offline-first support
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('lista_users');
    try {
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch (e) {
      return INITIAL_USERS;
    }
  });

  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  
  useEffect(() => {
    localStorage.setItem('lista_users', JSON.stringify(users));
  }, [users]);

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('lista_expenses');
    try {
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch (e) {
      return INITIAL_EXPENSES;
    }
  });

  useEffect(() => {
    localStorage.setItem('lista_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('lista_theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('lista_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('lista_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const [groupName, setGroupName] = useState(() => {
    return localStorage.getItem('lista_group_name') || 'Dorm 402 Roomies';
  });

  useEffect(() => {
    localStorage.setItem('lista_group_name', groupName);
  }, [groupName]);

  const [groupSetupComplete, setGroupSetupComplete] = useState<boolean>(() => {
    return localStorage.getItem('lista_onboarded') === 'true';
  });

  const handleOnboardingComplete = (setupData: {
    groupName: string;
    currentUser: User;
    initialRoommates?: User[];
  }) => {
    setGroupName(setupData.groupName);
    const newUsers = [setupData.currentUser, ...(setupData.initialRoommates || [])];
    setUsers(newUsers);
    setCurrentUserId(setupData.currentUser.id);
    setExpenses([]); // Start fresh for their custom household
    setGroupSetupComplete(true);
    localStorage.setItem('lista_onboarded', 'true');
  };

  const handleArchiveUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'ARCHIVED' } : u));
  };

  const handleRestoreUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'ACTIVE' } : u));
  };

  const handleClearCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('lista_onboarded');
    localStorage.removeItem('lista_users');
    localStorage.removeItem('lista_expenses');
    localStorage.removeItem('lista_group_name');
    
    setGroupSetupComplete(false);
    setUsers(INITIAL_USERS);
    setCurrentUserId('u1');
    setExpenses(INITIAL_EXPENSES);
    setGroupName('Dorm 402 Roomies');
    setActiveTab('home');
  };

  const [qrOpen, setQrOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanningJoin, setScanningJoin] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const handleSaveProfile = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleAddMember = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const handleAddExpense = (expense: Expense) => {
    setExpenses([{ ...expense, syncState: isOffline ? 'pending' : 'confirmed' }, ...expenses]);
    setActiveTab('home');
  };

  const handleSettleAll = () => {
    // In a real app, this would integrate with Stellar and mark expenses as settled.
    // For now, we'll mark them as settled to show in the activity.
    const now = new Date().toISOString();
    setExpenses(prev => prev.map(exp => exp.settledAt ? exp : { ...exp, settledAt: now }));
  };

  const handleSettleDebt = (fromId: string, toId: string, amount: number) => {
    const paymentExpense: Expense = {
      id: crypto.randomUUID(),
      description: 'Payment',
      amount: amount,
      category: 'Others',
      paidBy: fromId,
      splitAmong: [toId],
      date: new Date().toISOString(),
      syncState: isOffline ? 'pending' : 'confirmed',
    };
    setExpenses(prev => [paymentExpense, ...prev]);
  };

  const handleJoinSimulation = () => {
    setScanningJoin(true);
    setTimeout(() => {
      setScanningJoin(false);
      setScannerOpen(false);
      // Ideally we would add them to the group, but this is a mockup.
      alert('Successfully joined the Household!');
    }, 2000);
  };

  const [isOffline, setIsOffline] = useState(false);

  // Mock offline toggle for demonstration
  useEffect(() => {
    const handleOnline = () => { setIsOffline(false); setExpenses(prev => prev.map(e => e.syncState === "pending" ? { ...e, syncState: "confirmed" } : e)); };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans relative flex justify-center selection:bg-emerald-200 dark:selection:bg-emerald-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Mobile container constraint for desktop viewing */}
      <div className="w-full max-w-md bg-white dark:bg-gray-900 min-h-screen relative flex flex-col shadow-2xl overflow-hidden border-x border-gray-100 dark:border-gray-800 transition-colors">
        
        {!groupSetupComplete ? (
          <OnboardingView onComplete={handleOnboardingComplete} darkMode={darkMode} />
        ) : (
          <>
            {/* Top Header */}
            <header className="flex justify-between items-center px-6 pt-12 pb-4 bg-white dark:bg-gray-900 z-20 shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors relative">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMenuOpen(true)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors ${currentUser.avatar} ring-2 ring-transparent hover:ring-emerald-500/30`}
            >
              {currentUser.name.charAt(0)}
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">lista</h1>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{currentUser.name}'s View</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isOffline ? (
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-full transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Synced
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded-full transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Offline
              </div>
            )}
            <button className="w-9 h-9 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors relative">
              <Bell size={18} strokeWidth={2.5} />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            </button>
            <button 
              onClick={() => setQrOpen(true)}
              className="w-9 h-9 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <QrCode size={18} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        {isOffline && (
          <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium px-4 py-2 flex items-center justify-center border-b border-amber-100 dark:border-amber-800/50">
            You're offline. Changes will sync when reconnected.
          </div>
        )}

        {/* Side Menu Overlay */}
        <SideMenu 
          isOpen={menuOpen} 
          onClose={() => setMenuOpen(false)} 
          onScanQRClick={() => {
            setMenuOpen(false);
            setScannerOpen(true);
          }} 
          onProfileClick={() => {
            setMenuOpen(false);
            setProfileOpen(true);
          }}
          onSettingsClick={() => {
            setActiveTab('settings');
          }}
          user={currentUser}
          users={users}
          onSwitchUser={(u) => setCurrentUserId(u.id)}
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode} 
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onLogout={handleLogout}
        />

        <ProfileModal 
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={currentUser}
          onSave={handleSaveProfile}
        />

        <AddMemberModal
          isOpen={addMemberOpen}
          onClose={() => setAddMemberOpen(false)}
          onAdd={handleAddMember}
        />

        {/* QR Scanner Modal (Join Flow) */}
        <AnimatePresence>
          {scannerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6"
            >
              <button 
                onClick={() => setScannerOpen(false)}
                className="absolute top-12 right-6 p-2 bg-white/10 rounded-full text-white"
              >
                <X size={24} />
              </button>
              
              <h3 className="text-2xl font-bold text-white mb-2">Scan to Join</h3>
              <p className="text-gray-300 text-sm mb-8 text-center">Position the QR code inside the frame</p>
              
              <div className="relative w-64 h-64 mb-8">
                <div className="absolute inset-0 border-2 border-emerald-500 rounded-3xl opacity-50"></div>
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-2xl"></div>
                
                {/* Simulated scanner line */}
                <motion.div 
                  animate={{ y: [0, 240, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.5)]"
                />
              </div>

              <button 
                onClick={handleJoinSimulation}
                disabled={scanningJoin}
                className="bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl disabled:opacity-50"
              >
                {scanningJoin ? 'Joining...' : 'Simulate Scan'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* QR Invite Modal */}
        <AnimatePresence>
          {qrOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm p-6"
              onClick={() => setQrOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-900 rounded-3xl p-8 flex flex-col items-center max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800"
              >
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <QrCode size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Invite Roommates</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">Let them scan this QR to join the dorm expense group.</p>
                
                <div className="bg-gray-100 dark:bg-gray-800 w-48 h-48 rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <span className="text-gray-400 dark:text-gray-500 font-medium text-sm">QR Code<br/>(Visual Mock)</span>
                </div>
                
                <div className="w-full">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Share Link</label>
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      readOnly 
                      value="lista.app/j/d8f2x"
                      className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm font-medium text-gray-700 dark:text-gray-200 flex-1 outline-none"
                    />
                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-4 font-semibold text-sm transition-colors">
                      Copy
                    </button>
                  </div>
                  <button className="w-full py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl transition-colors">
                    Revoke Link
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Wrapper */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-4 pb-6 flex flex-col gap-4 overflow-y-auto relative z-10 transition-colors">
          
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4 h-full"
              >
                <DebtSummaryCard expenses={expenses} users={users} currentUser={currentUser} onAddMember={() => setAddMemberOpen(true)} />
                <ExpenseListCard expenses={expenses} users={users} />
              </motion.div>
            )}
            
            {activeTab === 'activity' && (
              <motion.div 
                key="activity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full flex"
              >
                <ExpenseListCard expenses={expenses} users={users} />
              </motion.div>
            )}

            {activeTab === 'add' && (
              <motion.div 
                key="add" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                transition={{ duration: 0.2 }}
                className="h-full flex"
              >
                <AddExpenseForm users={users} currentUser={currentUser} onAdd={handleAddExpense} />
              </motion.div>
            )}

            {activeTab === 'settle' && (
              <motion.div 
                key="settle" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                transition={{ duration: 0.2 }}
                className="h-full flex"
              >
                <SettlementsView expenses={expenses} users={users} currentUser={currentUser} onSettle={handleSettleAll} onSettleDebt={handleSettleDebt} />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                transition={{ duration: 0.2 }}
                className="h-full flex"
              >
                <SettingsView 
                  expenses={expenses}
                  users={users}
                  currentUser={currentUser}
                  onSaveProfile={handleSaveProfile}
                  onArchiveUser={handleArchiveUser}
                  onRestoreUser={handleRestoreUser}
                  darkMode={darkMode}
                  onToggleDarkMode={toggleDarkMode}
                  groupName={groupName}
                  onSaveGroupName={setGroupName}
                  onClearCache={handleClearCache}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

          </>
        )}
      </div>
    </div>
  );
}

