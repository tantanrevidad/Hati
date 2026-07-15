import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Handshake, ReceiptText, Camera, FileText, Plus, ArrowLeft, ArrowUpRight, ArrowDownRight, Loader2, CheckCircle2, AlertCircle, Wifi, Upload, X, ImageIcon, Copy, Share2 } from 'lucide-react';
import { ExpenseItem } from '../types';
import { api } from '../services/api';
import QRCode from 'react-qr-code';

interface GroupDetailScreenProps {
  group: { id: string; name: string; members: number; color?: string };
  expenses: ExpenseItem[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
  onBack: () => void;
  userName?: string;
}

export default function GroupDetailScreen({ group, onBack, userName }: GroupDetailScreenProps) {
  const [showPaLista, setShowPaLista] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [listaDescription, setListaDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'qrph' | 'cash' | 'stellar'>('qrph');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [joinUrl, setJoinUrl] = useState('');
  const [showShareToast, setShowShareToast] = useState(false);

  // Receipt Scanner States
  const [capturedImage, setCapturedImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const [scanDescription, setScanDescription] = useState('');
  const [isScanAnalyzing, setIsScanAnalyzing] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  // Backend States
  const [members, setMembers] = useState<any[]>([]);
  const [backendExpenses, setBackendExpenses] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any>(null);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nudgeLoading, setNudgeLoading] = useState<Record<string, boolean>>({});
  const [nudgeStatus, setNudgeStatus] = useState<Record<string, string>>({});

  // QR PH states
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [selectedOweUser, setSelectedOweUser] = useState<any | null>(null);

  const currentUser = useMemo(() => JSON.parse(localStorage.getItem('lista-user') || '{}'), []);

  const loadData = async () => {
    try {
      const [mList, eList, lData] = await Promise.all([
        api.getGroupMembers(group.id),
        api.getExpenses(group.id),
        api.getLedger(group.id)
      ]);
      
      // Load settlements
      const sList = await api.getSettlements(group.id).catch(() => []);

      setMembers(mList);
      setBackendExpenses(eList);
      setLedger(lData);
      setSettlements(sList);

      // Load join link
      try {
        const linkData = await api.getJoinLink(group.id);
        const localJoinUrl = `${window.location.origin}/join/${linkData.slug}`;
        setJoinUrl(localJoinUrl);
      } catch (linkErr) {
        console.error('Failed to load join link:', linkErr);
        setJoinUrl(`${window.location.origin}/join/${group.id}`);
      }
    } catch (err) {
      console.error('Failed to load group details from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [group.id]);

  // Derived values from backend
  const { totalBalance, youOwe, owedToYou, owedToYouPersons, youOweBills, activeOwes } = useMemo(() => {
    if (!ledger || !currentUser.id) {
      return { totalBalance: 0, youOwe: 0, owedToYou: 0, owedToYouPersons: 0, youOweBills: 0, activeOwes: [] };
    }

    const total = backendExpenses.reduce((sum, e) => sum + e.amount, 0) / 100;
    const userBalance = ledger.balances[currentUser.id] || 0;
    const owe = userBalance < 0 ? Math.abs(userBalance) / 100 : 0;
    const owed = userBalance > 0 ? userBalance / 100 : 0;

    const owedToYouCount = Object.entries(ledger.balances).filter(
      ([uId, val]) => uId !== currentUser.id && (val as number) < 0
    ).length;

    const activeOweList = ledger.debts
      ? ledger.debts
          .filter((d: any) => d.fromUserId === currentUser.id)
          .map((d: any) => {
            const creditor = members.find(m => m.id === d.toUserId);
            return {
              userId: d.toUserId,
              person: creditor?.displayName || 'Roommate',
              amount: d.amount / 100,
              title: 'Simplified Balance'
            };
          })
      : [];

    return {
      totalBalance: total,
      youOwe: owe,
      owedToYou: owed,
      owedToYouPersons: owedToYouCount,
      youOweBills: activeOweList.length,
      activeOwes: activeOweList
    };
  }, [ledger, backendExpenses, members, currentUser.id]);

  const CHART_COLORS = ['#A5C09A', '#EFA8B5', '#F5C4A1', '#88B04B', '#92A8D1', '#F7CAC9'];

  const chartData = useMemo(() => {
    if (!ledger || !members.length) return [];
    
    // Find all users who are owed money (balance > 0)
    const creditors = Object.entries(ledger.balances)
      .map(([userId, balanceCentavos]) => {
        const member = members.find(m => m.id === userId);
        return {
          name: member?.displayName || 'Roommate',
          amount: (balanceCentavos as number) / 100
        };
      })
      .filter(c => c.amount > 0);

    const totalOwed = creditors.reduce((sum, c) => sum + c.amount, 0);
    if (totalOwed === 0) return [];

    let accumulatedPercentage = 0;
    return creditors.map(c => {
      const percentage = (c.amount / totalOwed) * 100;
      const startPercentage = accumulatedPercentage;
      accumulatedPercentage += percentage;
      return {
        ...c,
        percentage,
        startPercentage
      };
    });
  }, [ledger, members]);

  // Find member ID by name lookup (matching parsed Gemini names)
  const findMemberId = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName === 'you' || lowerName === 'me' || lowerName === userName?.toLowerCase()) {
      return currentUser.id;
    }
    const match = members.find(m => m.displayName.toLowerCase().includes(lowerName));
    return match ? match.id : currentUser.id;
  };

  const handleAddLista = async () => {
    if (!listaDescription.trim()) return;
    setIsAnalyzing(true);
    try {
      const data = await api.analyzeReceiptText(
        listaDescription,
        members.length || group.members,
        userName || 'User'
      );
      
      // Save expenses to backend sequentially
      for (const expenseData of data.expenses) {
        const paidBy = findMemberId(expenseData.payer);
        
        const totalBillCentavos = Math.round(expenseData.totalAmount * 100);
        let totalOwedCentavos = 0;
        const shares: Record<string, number> = {};
        
        expenseData.splits.forEach((s: any) => {
          const mId = findMemberId(s.person);
          const owedCentavos = Math.round(s.amountOwed * 100);
          shares[mId] = (shares[mId] || 0) + owedCentavos;
          totalOwedCentavos += owedCentavos;
        });
        
        // Payer's share is the remaining amount of the bill
        const payerShareCentavos = Math.max(0, totalBillCentavos - totalOwedCentavos);
        if (payerShareCentavos > 0) {
          shares[paidBy] = (shares[paidBy] || 0) + payerShareCentavos;
        }

        await api.createExpense(group.id, {
          description: expenseData.title,
          amount: expenseData.totalAmount,
          category: expenseData.expenseType,
          paidBy,
          splitType: 'custom',
          splitDetails: { shares }
        });
      }

      await loadData();
      setShowPaLista(false);
      setListaDescription('');
    } catch (err) {
      console.error(err);
      alert('Failed to parse and save your expense. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadQrCode = async (toUserId: string, amount: number) => {
    setQrLoading(true);
    setQrError(null);
    setQrCodeUrl(null);
    try {
      const amountCentavos = Math.round(amount * 100);
      const res = await api.generateQrPh(group.id, currentUser.id, toUserId, amountCentavos);
      setQrCodeUrl(res.qrDataUrl);
    } catch (err: any) {
      setQrError(err.message || 'Recipient must link a phone or GCash/Maya wallet first.');
    } finally {
      setQrLoading(false);
    }
  };

  const handleSettleDebt = async (debt: any) => {
    try {
      await api.settleDebt(
        group.id,
        currentUser.id,
        debt.amount,
        selectedPaymentMethod,
        [debt.userId]
      );
      alert('Settlement initiated successfully!');
      await loadData();
      setShowSettle(false);
      setSelectedOweUser(null);
      setQrCodeUrl(null);
    } catch (err: any) {
      alert(err.message || 'Failed to initiate settlement.');
    }
  };

  const handleConfirmPayment = async (settlementId: string) => {
    try {
      await api.confirmSettlement(settlementId);
      alert('Cash payment confirmed!');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm settlement.');
    }
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanError(null);

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setScanError('Please select an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setScanError('Image must be under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      setCapturedImage({
        base64,
        mimeType: file.type,
        preview: dataUrl
      });
    };
    reader.readAsDataURL(file);
  };

  const handleScanSubmit = async () => {
    if (!capturedImage) return;
    setIsScanAnalyzing(true);
    setScanError(null);

    try {
      // Send to backend scan endpoint
      const scanData = await api.scanReceipt(
        group.id,
        capturedImage.base64,
        capturedImage.mimeType
      );

      // Create the expense from the scanned data
      const paidBy = currentUser.id;
      const participantIds = members.map(m => m.id);

      // Use scan description for additional context or default to scanned description
      const description = scanDescription.trim()
        ? `${scanData.description} — ${scanDescription.trim()}`
        : scanData.description;

      await api.createExpense(group.id, {
        description,
        amount: scanData.totalAmountCentavos / 100,
        category: scanData.category,
        paidBy,
        splitType: 'equal',
        participantIds
      });

      await loadData();
      setShowScanner(false);
      setCapturedImage(null);
      setScanDescription('');
    } catch (err: any) {
      console.error('Scan error:', err);
      setScanError(err.message || 'Failed to analyze receipt. Please try again.');
    } finally {
      setIsScanAnalyzing(false);
    }
  };

  const handleNudge = async (toUserId: string) => {
    setNudgeLoading(prev => ({ ...prev, [toUserId]: true }));
    setNudgeStatus(prev => ({ ...prev, [toUserId]: '' }));
    try {
      await api.nudgeRoommate(group.id, toUserId);
      setNudgeStatus(prev => ({ ...prev, [toUserId]: 'Nudged! 🔔' }));
    } catch (err: any) {
      setNudgeStatus(prev => ({ ...prev, [toUserId]: err.message || 'Failed' }));
    } finally {
      setNudgeLoading(prev => ({ ...prev, [toUserId]: false }));
    }
  };

  // Settlements waiting for the current user to confirm cash receipt
  const pendingConfirmations = useMemo(() => {
    return settlements.filter(s => 
      s.method === 'cash' && 
      s.status === 'awaiting_confirmation' && 
      s.confirmations?.some((c: any) => c.toUserId === currentUser.id && c.confirmedAt === null)
    );
  }, [settlements, currentUser.id]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#F3EFE7] dark:bg-[#121212] z-40 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#1B5648] dark:text-white" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-[#F3EFE7] dark:bg-[#121212] z-40 overflow-y-auto pb-24 flex flex-col items-center px-4 pt-6"
    >
      <div className="w-full max-w-2xl flex items-center justify-between mb-8 pb-4 border-b border-[#C8DACF] dark:border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#FCECEE] dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-[#1B5648] dark:text-slate-300 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-[#13463B] dark:text-white uppercase tracking-wider truncate" title={group.name}>
            {group.name}
          </h1>
        </div>

        {/* Profiles Stack & Plus Button */}
        <div className="flex items-center -space-x-1.5 flex-shrink-0 ml-4">
          {members.slice(0, 3).map((m) => {
            const initials = m.displayName
              .split(' ')
              .map((n: any) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);
            
            const colors = ['bg-[#7C5CFC]', 'bg-[#00D2A0]', 'bg-[#FF5C7A]', 'bg-[#FFB347]', 'bg-[#4FC3F7]', 'bg-[#CE93D8]'];
            const colorIndex = parseInt(m.id.replace(/\D/g, '') || '0', 10) % colors.length;
            const bgClass = colors[isNaN(colorIndex) ? 0 : colorIndex];

            return (
              <div 
                key={m.id}
                className={`w-8 h-8 rounded-full border-2 border-[#F3EFE7] dark:border-[#121212] flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${bgClass}`}
                title={m.displayName}
              >
                {initials}
              </div>
            );
          })}
          {members.length > 3 && (
            <div className="w-8 h-8 rounded-full border-2 border-[#F3EFE7] dark:border-[#121212] bg-[#C8DACF] dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-[#13463B] dark:text-white shadow-sm">
              +{members.length - 3}
            </div>
          )}
          <button 
            onClick={() => setShowInviteModal(true)}
            className="w-8 h-8 rounded-full border-2 border-dashed border-[#13463B] dark:border-slate-500 bg-transparent flex items-center justify-center text-[#13463B] dark:text-slate-350 ml-2 cursor-pointer hover:bg-[#E5F0E9] dark:hover:bg-slate-800 transition-colors shadow-sm"
            title="Invite Roommates"
          >
            <Plus size={16} className="stroke-[3]" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-2xl space-y-4 mb-6">
        {/* Pending Cash Confirmations Banner */}
        {pendingConfirmations.map((s) => {
          const debtor = members.find(m => m.id === s.fromUserId)?.displayName || 'Roommate';
          return (
            <div key={s.id} className="bg-leaf-yellow/20 dark:bg-leaf-yellow-dark/20 border-2 border-leaf-yellow rounded-2xl p-4 flex justify-between items-center text-[#13463B] dark:text-white">
              <div>
                <h4 className="font-bold text-sm">{debtor} paid you cash</h4>
                <p className="text-xs opacity-85">Amount: ₱{(s.amount / 100).toFixed(2)}. Did you receive it?</p>
              </div>
              <button 
                onClick={() => handleConfirmPayment(s.id)}
                className="bg-[#13463B] text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold shadow"
              >
                Confirm Cash
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-[#FCECEE] dark:bg-slate-800 rounded-[2rem] p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-sm border border-[#C8DACF] dark:border-slate-700 w-full max-w-2xl">
        
        {/* ROW 1: You are owed & You owe */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-[#C8DACF] dark:border-slate-700 flex flex-col justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase text-[#316D5F] dark:text-slate-400">You are owed</span>
            <span className="text-3xl sm:text-4xl font-black text-leaf-green dark:text-leaf-green-dark my-2 tracking-tight leading-none truncate" title={`₱${owedToYou.toFixed(2)}`}>₱{owedToYou.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            <span className="text-[9px] sm:text-[10px] uppercase text-[#316D5F] dark:text-slate-400 font-bold">From {owedToYouPersons} person{owedToYouPersons !== 1 && 's'}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-[#C8DACF] dark:border-slate-700 flex flex-col justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase text-[#316D5F] dark:text-slate-400">You owe</span>
            <span className="text-3xl sm:text-4xl font-black text-leaf-pink dark:text-leaf-pink-dark my-2 tracking-tight leading-none truncate" title={`₱${youOwe.toFixed(2)}`}>₱{youOwe.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            <span className="text-[9px] sm:text-[10px] uppercase text-[#316D5F] dark:text-slate-400 font-bold">Across {youOweBills} bill{youOweBills !== 1 && 's'}</span>
          </div>
        </div>
        
        {/* ROW 2: Total Balance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-[#C8DACF] dark:border-slate-700">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-[#316D5F] dark:text-slate-400">Total Balance</span>
          <div 
            className={`text-4xl sm:text-5xl font-black mt-1 sm:mt-2 tracking-tight truncate ${totalBalance >= 0 ? 'text-leaf-green dark:text-leaf-green-dark' : 'text-leaf-pink dark:text-leaf-pink-dark'}`}
            title={`${totalBalance >= 0 ? '+' : '-'}₱${Math.abs(totalBalance).toFixed(2)}`}
          >
            ₱{totalBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
        </div>

        {/* ROW 2.5: Pie Chart of Owed Balances */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-[#C8DACF] dark:border-slate-700">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-[#316D5F] dark:text-slate-400 block mb-4">Owed Distribution</span>
          {chartData.length === 0 ? (
            <div className="text-slate-400 dark:text-slate-500 text-sm font-medium text-center py-6">
              🎉 All settled up! No outstanding balances.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                  <circle
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke="#F1EFE7"
                    strokeWidth="5"
                  />
                  {chartData.map((slice, idx) => (
                    <circle
                      key={idx}
                      cx="21"
                      cy="21"
                      r="15.91549430918954"
                      fill="transparent"
                      stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                      strokeWidth="5"
                      strokeDasharray={`${slice.percentage} ${100 - slice.percentage}`}
                      strokeDashoffset={100 - slice.startPercentage + 25}
                      className="transition-all duration-500 ease-out"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-bold uppercase text-slate-400">Total Owed</span>
                  <span className="text-xs font-black text-[#13463B] dark:text-white leading-none">
                    ₱{chartData.reduce((sum, c) => sum + c.amount, 0).toFixed(0)}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                {chartData.map((slice, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                    />
                    <div className="truncate font-medium text-[#316D5F] dark:text-slate-300">
                      <span className="font-bold text-[#13463B] dark:text-white">{slice.name}</span>: ₱{slice.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* ROW 3: Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-[#C8DACF] dark:border-slate-700 min-h-[160px] sm:min-h-[200px] flex flex-col">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-[#316D5F] dark:text-slate-400 block mb-4">Activity</span>
          
          <div className="flex-1 flex flex-col">
            {backendExpenses.length === 0 ? (
              <div className="text-slate-400 dark:text-slate-500 text-sm font-medium text-center my-auto py-8">No activities yet.</div>
            ) : (
              <div className="space-y-3">
                {backendExpenses.map((expense) => {
                  const payerName = members.find(m => m.id === expense.paidBy)?.displayName || 'Roommate';
                  const isYouPayer = expense.paidBy === currentUser.id;
                  
                  return (
                    <div key={expense.id} className="flex items-center justify-between border-b border-[#C8DACF] dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isYouPayer ? 'bg-leaf-green/20 text-leaf-green-dark' : 'bg-leaf-yellow/20 text-leaf-yellow-dark'
                        }`}>
                          {isYouPayer ? <ArrowDownRight size={18} /> : <ReceiptText size={18} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#13463B] dark:text-white leading-tight text-sm">{expense.description}</h4>
                          <p className="text-[10px] sm:text-xs font-medium mt-0.5 text-[#316D5F] dark:text-slate-400">
                            Paid by {isYouPayer ? 'You' : payerName} • {new Date(expense.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block font-black text-sm sm:text-base text-[#1B5648] dark:text-slate-200">
                          ₱{(expense.amount / 100).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Nudge list for debtors */}
        {owedToYou > 0 && ledger?.debts && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-[#C8DACF] dark:border-slate-700">
            <span className="text-[10px] sm:text-xs font-bold uppercase text-[#316D5F] dark:text-slate-400 block mb-3">Owed to you</span>
            <div className="space-y-3">
              {ledger.debts.filter((d: any) => d.toUserId === currentUser.id).map((debt: any) => {
                const debtor = members.find(m => m.id === debt.fromUserId);
                if (!debtor) return null;
                const status = nudgeStatus[debtor.id];
                return (
                  <div key={debtor.id} className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                    <div>
                      <span className="font-bold text-[#13463B] dark:text-white">{debtor.displayName}</span>
                      <span className="text-xs text-[#316D5F] dark:text-slate-400 ml-2">owes you ₱{(debt.amount / 100).toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => handleNudge(debtor.id)}
                      disabled={nudgeLoading[debtor.id] || status?.startsWith('Nudged')}
                      className="px-3 py-1.5 bg-leaf-pink/15 dark:bg-leaf-pink-dark/10 hover:bg-leaf-pink/30 text-leaf-pink-dark dark:text-leaf-pink text-xs font-bold rounded-lg transition"
                    >
                      {nudgeLoading[debtor.id] ? 'Sending...' : status || 'Nudge'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Debts I owe list */}
        {youOwe > 0 && ledger?.debts && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-[#C8DACF] dark:border-slate-700">
            <span className="text-[10px] sm:text-xs font-bold uppercase text-leaf-pink dark:text-leaf-pink-dark block mb-3">You owe</span>
            <div className="space-y-3">
              {ledger.debts.filter((d: any) => d.fromUserId === currentUser.id).map((debt: any) => {
                const creditor = members.find(m => m.id === debt.toUserId);
                if (!creditor) return null;
                return (
                  <div key={creditor.id} className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                    <div>
                      <span className="font-bold text-[#13463B] dark:text-white">{creditor.displayName}</span>
                      <span className="text-xs text-leaf-pink dark:text-leaf-pink-dark ml-2">you owe them ₱{(debt.amount / 100).toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedOweUser({
                          userId: creditor.id,
                          person: creditor.displayName,
                          amount: debt.amount / 100,
                          title: 'Simplified Balance'
                        });
                        setShowSettle(true);
                      }}
                      className="px-3 py-1.5 bg-[#13463B] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition shadow-sm"
                    >
                      Settle Up
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* ROW 4: Action Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button 
            onClick={() => setShowSettle(true)} 
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-[#C8DACF] dark:border-slate-700 flex flex-col items-center justify-center gap-2 sm:gap-3 hover:bg-[#E5F0E9] dark:hover:bg-slate-800 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-[#E5F0E9] dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Handshake size={24} className="text-[#1B5648] dark:text-slate-300" />
            </div>
            <span className="font-bold uppercase tracking-wider text-[#13463B] dark:text-white text-xs sm:text-sm">Settle</span>
          </button>
          
          <button 
            onClick={() => setShowPaLista(true)} 
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-[#C8DACF] dark:border-slate-700 flex flex-col items-center justify-center gap-2 sm:gap-3 hover:bg-[#E5F0E9] dark:hover:bg-slate-800 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-[#E5F0E9] dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={24} className="text-[#1B5648] dark:text-slate-300 stroke-[3]" />
            </div>
            <span className="font-bold uppercase tracking-wider text-[#13463B] dark:text-white text-xs sm:text-sm">Pa Lista</span>
          </button>
        </div>
      </div>

      {/* Pa Lista Modal */}
      <AnimatePresence>
        {showPaLista && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#13463B]/60 dark:bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-6"
            onClick={() => setShowPaLista(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[2rem] sm:rounded-3xl p-6 shadow-2xl pb-10 sm:pb-6 relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-[#FCECEE] dark:bg-slate-800 rounded-full mx-auto mb-6 sm:hidden"></div>
              
              <h3 className="text-2xl font-black text-[#13463B] dark:text-white mb-6">New Lista</h3>
              
              <div className="space-y-4">
                <button 
                  onClick={() => { setShowPaLista(false); setShowScanner(true); }}
                  className="w-full bg-[#E5F0E9] dark:bg-slate-800/50 hover:bg-leaf-peach/20 dark:hover:bg-slate-800 border-2 border-dashed border-[#C8DACF] dark:border-slate-700 text-[#1B5648] dark:text-slate-300 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-leaf-green/20 dark:bg-leaf-green-dark/20 text-leaf-green dark:text-leaf-green-dark flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera size={20} />
                  </div>
                  Scan Receipt
                </button>

                <div className="flex items-center gap-4 py-2">
                  <div className="h-px bg-[#FCECEE] dark:bg-slate-800 flex-1"></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">or</span>
                  <div className="h-px bg-[#FCECEE] dark:bg-slate-800 flex-1"></div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1B5648] dark:text-slate-300 mb-2 flex items-center gap-2">
                    <FileText size={16} /> Describe your lista
                  </label>
                  <textarea 
                    value={listaDescription}
                    onChange={(e) => setListaDescription(e.target.value)}
                    placeholder="e.g. Dinner with @alex for 850, we split equally"
                    className="w-full px-4 py-4 rounded-2xl border-2 border-[#C8DACF] dark:border-slate-700 bg-transparent focus:border-slate-900 dark:focus:border-slate-300 outline-none text-[#13463B] dark:text-white resize-none min-h-[120px] font-medium leading-relaxed"
                  />
                  <p className="text-xs text-[#316D5F] dark:text-slate-400 mt-2 font-medium">Use <span className="text-leaf-green font-bold">@</span> to mention people.</p>
                </div>
                
                <button 
                  onClick={handleAddLista}
                  disabled={!listaDescription.trim() || isAnalyzing}
                  className="w-full bg-[#13463B] hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-[#577870] dark:disabled:text-[#577870] text-white dark:text-slate-900 py-4 rounded-2xl font-bold transition-all mt-4 flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />} 
                  {isAnalyzing ? 'Analyzing...' : 'Add to Listahan'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settle Modal */}
      <AnimatePresence>
        {showSettle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#13463B]/60 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => { setShowSettle(false); setSelectedOweUser(null); setQrCodeUrl(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-2xl font-black text-[#13463B] dark:text-white mb-2">Settle Up</h3>
              <p className="text-[#316D5F] dark:text-slate-400 text-sm font-medium mb-6">You currently owe <span className="font-bold text-leaf-pink dark:text-leaf-pink-dark">₱{youOwe.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span> in total.</p>
              
              <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-2">
                {activeOwes.length === 0 ? (
                  <div className="text-slate-400 dark:text-slate-500 text-sm font-medium text-center py-4">No pending debts to settle.</div>
                ) : (
                  activeOwes.map((owe, i) => (
                    <button 
                      key={i} 
                      onClick={() => {
                        setSelectedOweUser(owe);
                        if (selectedPaymentMethod === 'qrph') {
                          loadQrCode(owe.userId, owe.amount);
                        }
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center ${selectedOweUser?.userId === owe.userId ? 'border-slate-800 bg-slate-50 dark:border-white dark:bg-slate-800' : 'border-[#C8DACF] dark:border-slate-800 hover:border-slate-500 bg-white dark:bg-slate-900'}`}
                    >
                      <div>
                        <h4 className="font-bold text-[#13463B] dark:text-white">{owe.person}</h4>
                        <p className="text-xs text-[#316D5F] dark:text-slate-400 truncate max-w-[120px]">{owe.title}</p>
                      </div>
                      <span className="font-bold text-[#13463B] dark:text-white truncate max-w-[100px] text-right" title={`₱${owe.amount.toFixed(2)}`}>₱{owe.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </button>
                  ))
                )}
              </div>

              {selectedOweUser && (
                <div className="mb-6 space-y-4">
                  {/* Payment Method Selector */}
                  <div className="flex gap-2 p-1 bg-[#F3EFE7] dark:bg-slate-800 rounded-xl">
                    {(['qrph', 'cash', 'stellar'] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => {
                          setSelectedPaymentMethod(method);
                          if (method === 'qrph') {
                            loadQrCode(selectedOweUser.userId, selectedOweUser.amount);
                          } else {
                            setQrCodeUrl(null);
                          }
                        }}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition ${selectedPaymentMethod === method ? 'bg-[#13463B] text-white' : 'text-[#316D5F] dark:text-slate-400'}`}
                      >
                        {method === 'stellar' ? 'Stellar' : method}
                      </button>
                    ))}
                  </div>

                  {/* QRPH Render */}
                  {selectedPaymentMethod === 'qrph' && (
                    <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                      {qrLoading ? (
                        <div className="h-28 flex items-center justify-center">
                          <Loader2 className="animate-spin text-slate-400" size={24} />
                        </div>
                      ) : qrError ? (
                        <div className="text-center p-3 text-red-500 font-bold text-xs">
                          <AlertCircle className="mx-auto mb-1" size={16} />
                          {qrError}
                        </div>
                      ) : qrCodeUrl ? (
                        <>
                          <div className="bg-white p-3 rounded-xl shadow-sm mb-3">
                            <img src={qrCodeUrl} alt="QR PH" className="w-28 h-28 object-contain" />
                          </div>
                          <span className="font-bold text-[#13463B] dark:text-white text-xs tracking-wide">Scan with GCash/Maya to Pay</span>
                        </>
                      ) : null}
                    </div>
                  )}

                  {/* Stellar USD stablecoin information */}
                  {selectedPaymentMethod === 'stellar' && (
                    <div className="bg-leaf-green/10 p-4 rounded-2xl border border-leaf-green/30 text-[#13463B] dark:text-white text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-leaf-green-dark dark:text-leaf-green">
                        <Wifi size={14} /> Sponsor Fee-Bumping Enabled
                      </div>
                      <p className="opacity-90 leading-relaxed">Payments submitted on the Stellar network utilize circle-issued USDC stablecoins. Transaction network fees are fully sponsored and zero-cost to you.</p>
                    </div>
                  )}

                  {/* Cash settlement information */}
                  {selectedPaymentMethod === 'cash' && (
                    <div className="bg-leaf-pink/10 p-4 rounded-2xl border border-leaf-pink/30 text-leaf-pink-dark dark:text-leaf-pink text-xs space-y-1.5">
                      <p className="font-bold">Awaiting Multi-Party Confirmation</p>
                      <p className="opacity-90">Cash settlements will remain in a pending state until your creditor confirms they received the physical cash.</p>
                    </div>
                  )}

                  <button 
                    onClick={() => handleSettleDebt(selectedOweUser)}
                    className="w-full bg-[#13463B] hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 py-4 rounded-2xl font-bold transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Settle ₱{selectedOweUser.amount.toFixed(2)}</span>
                  </button>
                </div>
              )}

              <button 
                onClick={() => { setShowSettle(false); setSelectedOweUser(null); setQrCodeUrl(null); }}
                className="w-full bg-slate-100 hover:bg-[#FCECEE] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#13463B] dark:text-white py-4 rounded-2xl font-bold transition-colors"
              >
                {selectedOweUser ? 'Go Back' : 'Close'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#13463B]/60 dark:bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-6"
            onClick={() => { setShowScanner(false); setCapturedImage(null); setScanDescription(''); setScanError(null); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[2rem] sm:rounded-3xl p-6 shadow-2xl pb-10 sm:pb-6 relative overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-[#FCECEE] dark:bg-slate-800 rounded-full mx-auto mb-6 sm:hidden"></div>

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-[#13463B] dark:text-white">Scan Receipt</h3>
                <button
                  onClick={() => { setShowScanner(false); setCapturedImage(null); setScanDescription(''); setScanError(null); }}
                  className="w-8 h-8 rounded-full bg-[#E5F0E9] dark:bg-slate-800 flex items-center justify-center text-[#316D5F] dark:text-slate-400 hover:bg-leaf-pink/20 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageCapture}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageCapture}
              />

              <div className="space-y-4">
                {!capturedImage ? (
                  /* Step 1: Capture or upload */
                  <>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="w-full bg-[#13463B] dark:bg-white hover:opacity-90 text-white dark:text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors group shadow-md"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/20 dark:bg-slate-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera size={20} />
                      </div>
                      Take Photo
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-[#E5F0E9] dark:bg-slate-800/50 hover:bg-leaf-peach/20 dark:hover:bg-slate-800 border-2 border-dashed border-[#C8DACF] dark:border-slate-700 text-[#1B5648] dark:text-slate-300 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-leaf-green/20 dark:bg-leaf-green-dark/20 text-leaf-green dark:text-leaf-green-dark flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload size={20} />
                      </div>
                      Upload from Gallery
                    </button>

                    <div className="bg-[#E5F0E9] dark:bg-slate-800/50 p-4 rounded-xl">
                      <p className="text-xs text-[#316D5F] dark:text-slate-400 leading-relaxed">
                        <span className="font-bold text-[#13463B] dark:text-white">💡 Tip:</span> Take a clear photo of your receipt. Our AI will extract the merchant, total amount, and category automatically. The expense will be split equally among all group members.
                      </p>
                    </div>
                  </>
                ) : (
                  /* Step 2: Preview + optional description + submit */
                  <>
                    {/* Image preview */}
                    <div className="relative rounded-2xl overflow-hidden border-2 border-[#C8DACF] dark:border-slate-700">
                      <img
                        src={capturedImage.preview}
                        alt="Receipt preview"
                        className="w-full max-h-64 object-contain bg-slate-50 dark:bg-slate-800"
                      />
                      <button
                        onClick={() => { setCapturedImage(null); setScanError(null); }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Optional description */}
                    <div>
                      <label className="block text-sm font-bold text-[#1B5648] dark:text-slate-300 mb-2 flex items-center gap-2">
                        <FileText size={16} /> Add notes <span className="text-xs font-normal text-[#577870] dark:text-slate-500">(optional)</span>
                      </label>
                      <textarea
                        value={scanDescription}
                        onChange={(e) => setScanDescription(e.target.value)}
                        placeholder="e.g. Split with @alex only, not the whole group"
                        className="w-full px-4 py-3 rounded-2xl border-2 border-[#C8DACF] dark:border-slate-700 bg-transparent focus:border-slate-900 dark:focus:border-slate-300 outline-none text-[#13463B] dark:text-white resize-none min-h-[80px] font-medium leading-relaxed text-sm"
                      />
                    </div>

                    {/* Error display */}
                    {scanError && (
                      <div className="bg-leaf-pink/10 border border-leaf-pink/30 p-4 rounded-2xl flex items-start gap-3">
                        <AlertCircle size={18} className="text-leaf-pink-dark dark:text-leaf-pink shrink-0 mt-0.5" />
                        <p className="text-xs text-leaf-pink-dark dark:text-leaf-pink font-medium">{scanError}</p>
                      </div>
                    )}

                    {/* Submit button */}
                    <button
                      onClick={handleScanSubmit}
                      disabled={isScanAnalyzing}
                      className="w-full bg-[#13463B] hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-[#577870] dark:disabled:text-[#577870] text-white dark:text-slate-900 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      {isScanAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <ReceiptText size={20} />}
                      {isScanAnalyzing ? 'Analyzing Receipt...' : 'Analyze & Add'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#13463B]/60 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-black text-[#13463B] dark:text-white">Invite Friends</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="w-8 h-8 rounded-full bg-[#E5F0E9] dark:bg-slate-800 flex items-center justify-center text-[#316D5F] dark:text-slate-400 hover:bg-leaf-pink/20 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-[#316D5F] dark:text-slate-400 text-sm font-medium mb-6">
                Have them scan this QR code or share the link below to join "{group.name}".
              </p>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 mb-6">
                <div className="bg-white p-3 rounded-xl shadow-sm mb-3">
                  <QRCode
                    value={joinUrl}
                    size={140}
                    fgColor="#0f172a"
                    bgColor="#ffffff"
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                </div>
              </div>

              {/* Link display & copy button */}
              <div className="flex gap-2 mb-6">
                <div className="flex-1 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-850 rounded-xl px-4 py-3 text-sm text-[#1B5648] dark:text-slate-350 font-bold truncate text-left">
                  {joinUrl}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(joinUrl);
                    setShowShareToast(true);
                    setTimeout(() => setShowShareToast(false), 2000);
                  }}
                  className="bg-slate-100 hover:bg-[#FCECEE] dark:bg-slate-800 dark:hover:bg-slate-750 text-[#1B5648] dark:text-slate-300 px-4 rounded-xl transition-colors flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 shadow-sm active:scale-95"
                  title="Copy Link"
                >
                  <Copy size={18} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  className="w-full bg-[#13463B] hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                  onClick={async () => {
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: `Join ${group.name} on Lista`,
                          text: `Hey! Use this link to join our Listahan "${group.name}" on Lista:`,
                          url: joinUrl,
                        });
                      } catch (err) {
                        console.log(err);
                      }
                    } else {
                      navigator.clipboard.writeText(joinUrl);
                      setShowShareToast(true);
                      setTimeout(() => setShowShareToast(false), 2000);
                    }
                  }}
                >
                  <Share2 size={18} className="stroke-[2.5]" /> Share Link
                </button>
                <button 
                  className="w-full bg-slate-100 hover:bg-[#FCECEE] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#13463B] dark:text-white py-3 rounded-xl font-bold transition-colors"
                  onClick={() => setShowInviteModal(false)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#13463B] dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full font-bold shadow-lg text-sm z-50 animate-bounce">
          🔗 Invite Link Copied!
        </div>
      )}
    </motion.div>
  );
}
