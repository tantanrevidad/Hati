import React, { useState, useMemo, useRef } from 'react';
import { User, Expense, Category } from '../types';
import { formatCurrency, calculateSettlements } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  UploadCloud, 
  Check, 
  Trash2, 
  QrCode, 
  Bell, 
  Users, 
  Archive, 
  Trash,
  UserMinus, 
  ChevronRight, 
  Globe, 
  Edit3, 
  Save, 
  Download, 
  AlertTriangle, 
  Moon, 
  Sun, 
  Copy, 
  CheckCircle2, 
  Sliders, 
  Database,
  Info
} from 'lucide-react';

interface SettingsViewProps {
  expenses: Expense[];
  users: User[];
  currentUser: User;
  onSaveProfile: (updatedUser: User) => void;
  onArchiveUser: (userId: string) => void;
  onRestoreUser: (userId: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  groupName: string;
  onSaveGroupName: (name: string) => void;
  onClearCache: () => void;
}

export function SettingsView({
  expenses,
  users,
  currentUser,
  onSaveProfile,
  onArchiveUser,
  onRestoreUser,
  darkMode,
  onToggleDarkMode,
  groupName,
  onSaveGroupName,
  onClearCache
}: SettingsViewProps) {
  // --- STATE FOR SECTION 1 (PROFILE) ---
  const [profileName, setProfileName] = useState(currentUser.name);
  const [paymentLink, setPaymentLink] = useState(currentUser.payment_link || '');
  const [qrBase64, setQrBase64] = useState<string | null>(currentUser.payment_qr || null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);

  // --- STATE FOR SECTION 2 (NOTIFICATIONS) ---
  const [notifyNewExpenses, setNotifyNewExpenses] = useState(false);
  const [notifySettlements, setNotifySettlements] = useState(true);
  const [nudgeFrequency, setNudgeFrequency] = useState('1_per_24h');

  // --- STATE FOR SECTION 3 (GROUP MANAGEMENT) ---
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [tempGroupName, setTempGroupName] = useState(groupName);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // --- STATE FOR SECTION 4 (PREFERENCES) ---
  const [splitBehavior, setSplitBehavior] = useState<'equal' | 'exact'>('equal');
  const [csvExportSuccess, setCsvExportSuccess] = useState(false);

  // Calculate outstanding balances for current user
  const { totalOwedToYou, totalYouOwe, netBalance, settlements } = useMemo(() => {
    const activeSettlements = calculateSettlements(expenses, users);
    let owedToYou = 0;
    let youOwe = 0;
    
    activeSettlements.forEach(s => {
      if (s.to === currentUser.id) owedToYou += s.amount;
      if (s.from === currentUser.id) youOwe += s.amount;
    });

    return {
      totalOwedToYou: owedToYou,
      totalYouOwe: youOwe,
      netBalance: owedToYou - youOwe,
      settlements: activeSettlements
    };
  }, [expenses, users, currentUser]);

  const hasOutstandingBalance = totalOwedToYou > 0.01 || totalYouOwe > 0.01;

  // Drag and Drop handlers for Payment QR
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, or SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setQrBase64(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeQr = () => {
    setQrBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveProfileSettings = () => {
    onSaveProfile({
      ...currentUser,
      name: profileName,
      payment_link: paymentLink,
      payment_qr: qrBase64 || undefined
    });
    setProfileSavedSuccess(true);
    setTimeout(() => setProfileSavedSuccess(false), 3000);
  };

  const handleSaveGroupNameClick = () => {
    if (tempGroupName.trim()) {
      onSaveGroupName(tempGroupName.trim());
      setIsEditingGroupName(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('lista.app/j/d8f2x');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // CSV Exporter for Raw Ledger Data
  const handleExportLedgerCSV = () => {
    try {
      const headers = ['Date', 'Description', 'Category', 'Paid By', 'Split Among', 'Total Amount', 'Status'];
      const rows = expenses.map(e => {
        const payerName = users.find(u => u.id === e.paidBy)?.name || 'Unknown';
        const splitNames = e.splitAmong.map(uid => users.find(u => u.id === uid)?.name || 'Unknown').join('; ');
        const status = e.settledAt ? `Settled at ${e.settledAt}` : 'Outstanding';
        
        // Escape commas/quotes
        const descriptionEscaped = `"${e.description.replace(/"/g, '""')}"`;
        const dateFormatted = new Date(e.date).toISOString();

        return [
          dateFormatted,
          descriptionEscaped,
          e.category,
          payerName,
          `"${splitNames}"`,
          e.amount.toFixed(2),
          status
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `lista_dorm_ledger_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setCsvExportSuccess(true);
      setTimeout(() => setCsvExportSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export CSV', err);
      alert('An error occurred while exporting the ledger.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full flex-1 flex flex-col gap-6 overflow-y-auto pb-10"
    >
      <div className="px-1">
        <h2 className="font-bold text-2xl text-gray-950 dark:text-white">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
          Configure roommate status, payment vaults, and preferences.
        </p>
      </div>

      {/* --- SECTION 1: PROFILE & PAYMENT INTEGRATIONS --- */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserIcon size={18} />
          </div>
          <h3 className="font-bold text-sm text-gray-950 dark:text-white uppercase tracking-wider">Profile & Payments</h3>
        </div>

        {/* User Info Row */}
        <div className="flex items-center gap-4 py-2">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-inner ${currentUser.avatar || 'bg-emerald-500'}`}>
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Dorm Display Name</label>
            <input 
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl font-medium outline-none text-gray-950 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Payment QR Vault */}
        <div className="flex flex-col gap-2 mt-1">
          <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
            GCash / Maya QR Vault
          </label>
          
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative min-h-[120px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-950/20'
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {qrBase64 ? (
              <div className="flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <div className="relative w-20 h-20 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
                  <img 
                    src={qrBase64} 
                    alt="Payment QR" 
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <button 
                    onClick={removeQr}
                    className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-md transition-all active:scale-95"
                    title="Remove QR Code"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full mt-1">
                  <CheckCircle2 size={12} />
                  <span>QR Vault Active</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <UploadCloud size={28} className="text-gray-400 dark:text-gray-500 mb-1" />
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  Drag & Drop GCash/Maya QR
                </p>
                <p className="text-[10px] text-gray-400">
                  or click to browse from device
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Default Payment Link */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
            Default Payment Link / Handle
          </label>
          <input 
            type="text"
            placeholder="e.g. GCash 0917XXXXXXX or bank details"
            value={paymentLink}
            onChange={(e) => setPaymentLink(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none text-gray-950 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-gray-400"
          />
        </div>

        <button
          onClick={saveProfileSettings}
          className="w-full py-3 mt-1 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
        >
          {profileSavedSuccess ? (
            <>
              <Check size={16} strokeWidth={3} /> Saved Successfully
            </>
          ) : (
            <>
              <Save size={16} /> Save Profile Details
            </>
          )}
        </button>
      </div>

      {/* --- SECTION 2: NOTIFICATION CONTROLS --- */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Bell size={18} />
          </div>
          <h3 className="font-bold text-sm text-gray-950 dark:text-white uppercase tracking-wider">Notifications</h3>
        </div>

        <div className="flex flex-col gap-4">
          {/* Toggle: New Expenses */}
          <div className="flex items-center justify-between py-1">
            <div className="flex flex-col gap-0.5 max-w-[75%]">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">New Expenses Added</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">Get notified immediately when a roommate files a new expense.</span>
            </div>
            <button 
              onClick={() => setNotifyNewExpenses(!notifyNewExpenses)}
              className={`relative w-11 h-6 rounded-full transition-colors flex items-center p-0.5 outline-none ${
                notifyNewExpenses ? 'bg-emerald-500 justify-end' : 'bg-gray-200 dark:bg-gray-800 justify-start'
              }`}
            >
              <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm" />
            </button>
          </div>

          {/* Toggle: Settlements */}
          <div className="flex items-center justify-between py-1 border-t border-gray-50 dark:border-gray-800/50 pt-3">
            <div className="flex flex-col gap-0.5 max-w-[75%]">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Settlement Confirmations</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">Alert me when roommate debts are marked complete.</span>
            </div>
            <button 
              onClick={() => setNotifySettlements(!notifySettlements)}
              className={`relative w-11 h-6 rounded-full transition-colors flex items-center p-0.5 outline-none ${
                notifySettlements ? 'bg-emerald-500 justify-end' : 'bg-gray-200 dark:bg-gray-800 justify-start'
              }`}
            >
              <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm" />
            </button>
          </div>

          {/* Selector: Friendly Nudges Cap */}
          <div className="flex flex-col gap-1.5 border-t border-gray-50 dark:border-gray-800/50 pt-4">
            <div className="flex flex-col gap-0.5 mb-1">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">"Friendly Nudge" Frequency Cap</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">Limit how often roommates can trigger a nudge request for pending debts.</span>
            </div>
            <select
              value={nudgeFrequency}
              onChange={(e) => setNudgeFrequency(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            >
              <option value="1_per_24h">Max 1 nudge per 24 hours (Recommended)</option>
              <option value="3_per_24h">Max 3 nudges per 24 hours</option>
              <option value="unlimited">No cap (Unlimited nudges)</option>
              <option value="disabled">Mute/Disable all nudge reminders</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- SECTION 3: GROUP & ROOMMATE MANAGEMENT --- */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Users size={18} />
          </div>
          <h3 className="font-bold text-sm text-gray-950 dark:text-white uppercase tracking-wider">Group & Roommates</h3>
        </div>

        {/* Group Name Display */}
        <div className="bg-gray-50 dark:bg-gray-950/50 rounded-2xl p-4 flex items-center justify-between border border-gray-100/80 dark:border-gray-800/40">
          <div className="flex-1 mr-4">
            <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">Dorm Household Name</span>
            {isEditingGroupName ? (
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="text"
                  value={tempGroupName}
                  onChange={(e) => setTempGroupName(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-white focus:border-emerald-500"
                  autoFocus
                />
                <button 
                  onClick={handleSaveGroupNameClick}
                  className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  <Check size={14} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <h4 className="font-bold text-gray-900 dark:text-white text-base">{groupName}</h4>
            )}
          </div>
          {!isEditingGroupName && (
            <button 
              onClick={() => { setTempGroupName(groupName); setIsEditingGroupName(true); }}
              className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-full transition-all"
              title="Edit Group Name"
            >
              <Edit3 size={16} />
            </button>
          )}
        </div>

        {/* Invite Member Trigger Button */}
        <button
          onClick={() => setShowInviteModal(true)}
          className="w-full py-2.5 border border-dashed border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <QrCode size={14} /> Invite Dorm Roommate (QR / Link)
        </button>

        {/* Roommate List with Archive (NOT delete) */}
        <div className="flex flex-col gap-2.5 mt-2">
          <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Roommates List</span>
          
          <div className="flex flex-col gap-2">
            {users.map((u) => {
              const isSelf = u.id === currentUser.id;
              const isArchived = u.status === 'ARCHIVED';

              return (
                <div 
                  key={u.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isArchived 
                      ? 'bg-gray-50/50 dark:bg-gray-950/30 border-gray-100 dark:border-gray-900/60 opacity-60' 
                      : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${u.avatar || 'bg-gray-400'}`}>
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {u.name}
                        </span>
                        {isSelf && (
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                        {isArchived && (
                          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-full">
                            Archived
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {isArchived ? 'No active ledger' : isSelf ? 'Owner' : 'Roommate'}
                      </span>
                    </div>
                  </div>

                  {!isSelf && (
                    <div className="flex items-center">
                      {isArchived ? (
                        <button
                          onClick={() => onRestoreUser(u.id)}
                          className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => onArchiveUser(u.id)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-colors"
                          title="Archive Roommate"
                        >
                          <Archive size={15} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Conditionally Disabled Leave Group Button with Tooltip */}
        <div className="relative mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
          <div 
            className="w-full"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => {
              if (hasOutstandingBalance) {
                setShowTooltip(true);
                // Auto hide after 3 seconds for mobile touch event support
                setTimeout(() => setShowTooltip(false), 3000);
              }
            }}
          >
            <button
              disabled={hasOutstandingBalance}
              onClick={() => {
                if (!hasOutstandingBalance) {
                  const confirmLeave = window.confirm('Are you sure you want to leave this household group? This action is permanent.');
                  if (confirmLeave) {
                    alert('You have left the household group.');
                  }
                }
              }}
              className={`w-full py-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                hasOutstandingBalance 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-200/50 dark:border-gray-800/50' 
                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40'
              }`}
            >
              <UserMinus size={15} />
              Leave Household Group
            </button>
          </div>

          {/* Elegant Floating Tooltip / Banner */}
          <AnimatePresence>
            {showTooltip && hasOutstandingBalance && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-[280px] bg-gray-900 dark:bg-white text-white dark:text-gray-950 text-xs py-2.5 px-3 rounded-xl shadow-xl border border-gray-800 dark:border-gray-200 z-50 flex items-start gap-2 text-center leading-relaxed"
              >
                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <span className="font-semibold text-left">
                  You must settle all debts before leaving the group. (Current: {formatCurrency(Math.abs(netBalance))})
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- SECTION 4: APP PREFERENCES & DATA --- */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sliders size={18} />
          </div>
          <h3 className="font-bold text-sm text-gray-950 dark:text-white uppercase tracking-wider">Preferences & Data</h3>
        </div>

        <div className="flex flex-col gap-4">
          {/* Theme Switcher */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Visual Mode Theme</span>
            <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-950 p-1 rounded-xl border border-gray-100 dark:border-gray-800">
              <button 
                type="button"
                onClick={() => { if (darkMode) onToggleDarkMode(); }}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  !darkMode 
                    ? 'bg-white dark:bg-gray-900 shadow-sm text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Sun size={14} /> Light
              </button>
              <button 
                type="button"
                onClick={() => { if (!darkMode) onToggleDarkMode(); }}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  darkMode 
                    ? 'bg-white dark:bg-gray-900 shadow-sm text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Moon size={14} /> Dark
              </button>
            </div>
          </div>

          {/* Default Split Behavior Toggle */}
          <div className="flex items-center justify-between py-1 border-t border-gray-50 dark:border-gray-800/50 pt-3">
            <div className="flex flex-col gap-0.5 max-w-[70%]">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Default Split Behavior</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">Set preferred mode when adding a new expense.</span>
            </div>
            
            <div className="flex bg-gray-50 dark:bg-gray-950 p-0.5 rounded-lg border border-gray-200 dark:border-gray-800">
              <button 
                type="button"
                onClick={() => setSplitBehavior('equal')}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                  splitBehavior === 'equal' 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Equally
              </button>
              <button 
                type="button"
                onClick={() => setSplitBehavior('exact')}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                  splitBehavior === 'exact' 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Exact
              </button>
            </div>
          </div>

          {/* Export Ledger CSV */}
          <div className="flex flex-col gap-2 border-t border-gray-50 dark:border-gray-800/50 pt-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Export Ledger Data</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">Download the absolute raw ledger containing transactions as CSV (Python/Pandas ready).</span>
            </div>
            <button
              onClick={handleExportLedgerCSV}
              className="w-full mt-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 transition-all active:scale-[0.98]"
            >
              {csvExportSuccess ? (
                <>
                  <Check size={14} className="text-emerald-500" /> Ledger Exported!
                </>
              ) : (
                <>
                  <Download size={14} /> Export to CSV
                </>
              )}
            </button>
          </div>

          {/* Clear Cache Danger Zone */}
          <div className="flex flex-col gap-2 border-t border-gray-50 dark:border-gray-800/50 pt-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Cache & Diagnostics</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">Clears offline data structures stored locally. This is safe, but will reset mocks.</span>
            </div>
            <button
              onClick={() => {
                const confirmClear = window.confirm('Are you sure you want to clear the local cache? This will reset all active settings and demo mock data.');
                if (confirmClear) {
                  onClearCache();
                }
              }}
              className="w-full mt-1 py-2.5 bg-rose-50/50 hover:bg-rose-100/50 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-rose-100 dark:border-rose-950/40 transition-colors"
            >
              <Database size={13} />
              Clear Local Cache
            </button>
          </div>
        </div>
      </div>

      {/* Invite Modal Overlay */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-6 bg-black/40"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 flex flex-col items-center max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <QrCode size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Invite Roommates</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-6 leading-relaxed">
                Allow new roommates to scan this secure group link to join the household instantly.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-950 w-44 h-44 rounded-2xl flex flex-col items-center justify-center mb-6 border border-gray-100 dark:border-gray-800/80 p-4">
                {/* Custom simulated pixel-art QR Code */}
                <div className="grid grid-cols-5 gap-1.5 w-24 h-24 mb-2">
                  {[...Array(25)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`rounded-xs ${
                        (i % 3 === 0 || i % 7 === 1 || i < 5 || i > 20 || i % 5 === 0) 
                          ? 'bg-gray-900 dark:bg-gray-100' 
                          : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">Group ID: HATI-D8F2X</span>
              </div>
              
              <div className="w-full">
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">Share Invite Link</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value="lista.app/j/d8f2x"
                    className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 dark:text-gray-200 flex-1 outline-none"
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-4 font-semibold text-xs transition-colors shrink-0 flex items-center justify-center min-w-[70px]"
                  >
                    {copiedLink ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
