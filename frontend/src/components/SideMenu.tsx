import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  LogOut, 
  Settings, 
  HelpCircle, 
  X, 
  QrCode, 
  Moon, 
  Sun,
  Home,
  Plus,
  Handshake,
  ReceiptText
} from 'lucide-react';
import { User } from '../types';

export type Tab = 'home' | 'activity' | 'add' | 'settle' | 'settings';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onScanQRClick?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  darkMode?: boolean;
  toggleDarkMode?: () => void;
  user?: User;
  users?: User[];
  onSwitchUser?: (user: User) => void;
  activeTab: Tab;
  onChangeTab: (tab: Tab) => void;
  onLogout?: () => void;
}

export function SideMenu({ 
  isOpen, 
  onClose, 
  onScanQRClick, 
  onProfileClick, 
  onSettingsClick, 
  darkMode, 
  toggleDarkMode, 
  user, 
  users, 
  onSwitchUser,
  activeTab,
  onChangeTab,
  onLogout
}: SideMenuProps) {
  
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'activity', icon: ReceiptText, label: 'Activity Feed' },
    { id: 'add', icon: Plus, label: 'Add Expense' },
    { id: 'settle', icon: Handshake, label: 'Settle Up' },
    { id: 'settings', icon: Settings, label: 'App Settings' },
  ] as const;

  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowConfirm(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-50 flex">
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Slide-out Menu */}
          <motion.div
            key="panel"
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 h-full w-3/4 max-w-[280px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col transition-colors overflow-y-auto"
          >
            {/* Header User Profile Card */}
            <div className="p-5 pt-12 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white shadow-inner ${user?.avatar || 'bg-emerald-500'}`}>
                  {user?.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[130px]">{user?.name || 'You'}</h2>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">Active User</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 p-4 flex flex-col gap-5">
              {/* Primary Navigation Section */}
              <div className="flex flex-col gap-1">
                <span className="px-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  Dorm Navigation
                </span>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onChangeTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive 
                          ? 'bg-emerald-50 dark:bg-emerald-950/35 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100/50 dark:border-emerald-950/50' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 border border-transparent'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Secondary Actions & Utils */}
              <div className="flex flex-col gap-1 border-t border-gray-150/40 dark:border-gray-800/45 pt-4">
                <span className="px-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  Utilities & Prefs
                </span>

                <button 
                  onClick={() => { if (onProfileClick) onProfileClick(); onClose(); }} 
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-all"
                >
                  <UserIcon size={16} className="text-gray-450 dark:text-gray-500" />
                  <span>Profile Settings</span>
                </button>

                <button 
                  onClick={() => { if (onScanQRClick) onScanQRClick(); onClose(); }} 
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-all"
                >
                  <QrCode size={16} className="text-gray-450 dark:text-gray-500" />
                  <span>Scan QR Code</span>
                </button>

                <button 
                  onClick={toggleDarkMode} 
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-all"
                >
                  {darkMode ? (
                    <>
                      <Sun size={16} className="text-gray-450 dark:text-gray-500" />
                      <span>Light Mode Theme</span>
                    </>
                  ) : (
                    <>
                      <Moon size={16} className="text-gray-450 dark:text-gray-500" />
                      <span>Dark Mode Theme</span>
                    </>
                  )}
                </button>

                <button 
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-all"
                >
                  <HelpCircle size={16} className="text-gray-450 dark:text-gray-500" />
                  <span>Help & Support</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions & User Swapper */}
            <div className="p-4 bg-gray-50/50 dark:bg-gray-950/20 border-t border-gray-100 dark:border-gray-800/80">
              {users && users.length > 1 && onSwitchUser && (
                <div className="flex flex-col gap-2 mb-4">
                  <span className="px-2 text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Switch View (Prototype)
                  </span>
                  <div className="flex flex-col gap-1">
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u);
                          onClose();
                        }}
                        className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          u.id === user?.id 
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20' 
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/30'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-xs ${u.avatar}`}>
                          {u.name.charAt(0)}
                        </div>
                        <span className="truncate max-w-[130px]">{u.name}</span>
                        {u.id === user?.id && <span className="text-[8px] font-bold text-emerald-500 shrink-0 ml-auto">(Active)</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {showConfirm ? (
                <div className="flex flex-col gap-2 p-3 bg-rose-50/50 dark:bg-rose-950/10 rounded-2xl border border-rose-100/50 dark:border-rose-950/40">
                  <p className="text-[11px] font-bold text-rose-800 dark:text-rose-400 text-center leading-normal">
                    Are you sure? You will lose local mock roommate details.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 py-1.5 px-3 bg-gray-250/70 hover:bg-gray-200 dark:bg-gray-850 dark:hover:bg-gray-800 rounded-xl text-[10px] font-bold text-gray-700 dark:text-gray-300 transition-all text-center"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (onLogout) onLogout();
                        onClose();
                      }}
                      className="flex-1 py-1.5 px-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-bold transition-all text-center"
                    >
                      Yes, Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setShowConfirm(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                >
                  <LogOut size={16} />
                  <span>Logout Session</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
