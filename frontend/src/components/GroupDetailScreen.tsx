import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Handshake, ReceiptText, Camera, FileText, Plus, ArrowLeft, ArrowUpRight, ArrowDownRight, Loader2, CheckCircle2 } from 'lucide-react';
import { ExpenseItem, Split } from '../types';
import QRCode from 'react-qr-code';

interface GroupDetailScreenProps {
  group: { id: string; name: string; members: number; color?: string };
  expenses: ExpenseItem[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
  onBack: () => void;
  userName?: string;
}

export default function GroupDetailScreen({ group, expenses, setExpenses, onBack, userName }: GroupDetailScreenProps) {
  const [showPaLista, setShowPaLista] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [listaDescription, setListaDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('GCash');

  const groupExpenses = useMemo(() => expenses.filter(e => e.groupId === group.id), [expenses, group.id]);

  // Calculate derived values from groupExpenses
  const { totalBalance, youOwe, owedToYou, owedToYouPersons, youOweBills, activeOwes } = useMemo(() => {
    let groupTotal = 0;
    let owed = 0;
    let owe = 0;
    const personsOwing = new Set<string>();
    const billsOwe = new Set<string>();
    const oweList: { id: string, person: string, amount: number, title: string }[] = [];

    groupExpenses.forEach(exp => {
      groupTotal += exp.totalAmount;
      
      const isYouPayer = exp.payer.toLowerCase() === 'you' || exp.payer.toLowerCase() === 'me' || (userName && exp.payer.toLowerCase() === userName.toLowerCase());
      
      exp.splits.forEach(split => {
        const isYouSplit = split.person.toLowerCase() === 'you' || split.person.toLowerCase() === 'me' || (userName && split.person.toLowerCase() === userName.toLowerCase());
        
        if (!split.paid) {
          if (isYouPayer && !isYouSplit) {
            owed += split.amountOwed;
            personsOwing.add(split.person);
          } else if (!isYouPayer && isYouSplit) {
            owe += split.amountOwed;
            billsOwe.add(exp.id);
            oweList.push({ id: exp.id, person: exp.payer, amount: split.amountOwed, title: exp.title });
          }
        }
      });
    });

    return {
      totalBalance: groupTotal,
      youOwe: owe,
      owedToYou: owed,
      owedToYouPersons: personsOwing.size,
      youOweBills: billsOwe.size,
      activeOwes: oweList
    };
  }, [expenses, userName]);

  const handleAddLista = async () => {
    if (!listaDescription.trim()) return;
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/analyze-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description: listaDescription,
          groupMembersCount: group.members,
          userName: userName || 'User'
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to analyze');
      
      const newExpenses = data.expenses.map((expenseData: any, index: number) => ({
        id: Date.now().toString() + '-' + index + '-' + Math.random(),
        groupId: group.id,
        title: expenseData.title,
        totalAmount: expenseData.totalAmount,
        expenseType: expenseData.expenseType,
        payer: expenseData.payer,
        splits: expenseData.splits.map((s: any) => ({ ...s, paid: false })),
        date: 'Just now'
      }));

      setExpenses(prev => [...newExpenses, ...prev]);
      setShowPaLista(false);
      setListaDescription('');
    } catch (err) {
      console.error(err);
      alert('Failed to parse your lista. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSettleAll = () => {
    setExpenses(prev => prev.map(exp => {
      if (exp.groupId !== group.id) return exp;
      // Find splits where "you" owe money and mark them paid
      const newSplits = exp.splits.map(split => {
        const isYouSplit = split.person.toLowerCase() === 'you' || split.person.toLowerCase() === 'me' || (userName && split.person.toLowerCase() === userName.toLowerCase());
        if (isYouSplit && !split.paid) {
          return { ...split, paid: true };
        }
        return split;
      });
      return { ...exp, splits: newSplits };
    }));
    setShowSettle(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-[#F7F5EC] dark:bg-[#121212] z-40 overflow-y-auto pb-24 flex flex-col items-center px-4 pt-6"
    >
      <div className="w-full max-w-2xl flex items-center mb-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#FCECEE] dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-300 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </div>
      
      <h1 className="text-4xl sm:text-5xl font-black text-center text-slate-900 dark:text-white uppercase tracking-wider mb-8 w-full max-w-2xl truncate px-2">{group.name}</h1>

      <div className="bg-[#FCECEE] dark:bg-slate-800 rounded-[2rem] p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-sm border border-leaf-peach/40 dark:border-slate-700 w-full max-w-2xl">
        
        {/* ROW 1: You are owed & You owe */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-leaf-peach/40 dark:border-slate-700 flex flex-col justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-600 dark:text-slate-400">You are owed</span>
            <span className="text-3xl sm:text-4xl font-black text-leaf-green dark:text-leaf-green-dark my-2 tracking-tight leading-none truncate" title={`₱${owedToYou.toFixed(2)}`}>₱{owedToYou.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            <span className="text-[9px] sm:text-[10px] uppercase text-slate-600 dark:text-slate-400 font-bold">From {owedToYouPersons} person{owedToYouPersons !== 1 && 's'}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-leaf-peach/40 dark:border-slate-700 flex flex-col justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-600 dark:text-slate-400">You owe</span>
            <span className="text-3xl sm:text-4xl font-black text-leaf-pink dark:text-leaf-pink-dark my-2 tracking-tight leading-none truncate" title={`₱${youOwe.toFixed(2)}`}>₱{youOwe.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            <span className="text-[9px] sm:text-[10px] uppercase text-slate-600 dark:text-slate-400 font-bold">Across {youOweBills} bill{youOweBills !== 1 && 's'}</span>
          </div>
        </div>
        
        {/* ROW 2: Total Balance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-leaf-peach/40 dark:border-slate-700">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Total Balance</span>
          <div 
            className={`text-4xl sm:text-5xl font-black mt-1 sm:mt-2 tracking-tight truncate ${totalBalance >= 0 ? 'text-leaf-green dark:text-leaf-green-dark' : 'text-leaf-pink dark:text-leaf-pink-dark'}`}
            title={`${totalBalance >= 0 ? '+' : '-'}₱${Math.abs(totalBalance).toFixed(2)}`}
          >
            {totalBalance >= 0 ? '+' : '-'}₱{Math.abs(totalBalance).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
        </div>
        
        {/* ROW 3: Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-leaf-peach/40 dark:border-slate-700 min-h-[160px] sm:min-h-[200px] flex flex-col">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-600 dark:text-slate-400 block mb-4">Activity</span>
          
          <div className="flex-1 flex flex-col">
            {groupExpenses.length === 0 ? (
              <div className="text-slate-400 dark:text-slate-500 text-sm font-medium text-center my-auto py-8">No activities yet.</div>
            ) : (
              <div className="space-y-3">
                {groupExpenses.map((expense) => {
                  const isYouPayer = expense.payer.toLowerCase() === 'you' || expense.payer.toLowerCase() === 'me' || (userName && expense.payer.toLowerCase() === userName.toLowerCase());
                  
                  return (
                  <div key={expense.id} className="flex items-center justify-between border-b border-leaf-peach/30 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isYouPayer ? 'bg-leaf-green/20 text-leaf-green-dark' : 'bg-leaf-yellow/20 text-leaf-yellow-dark'
                      }`}>
                        {isYouPayer ? <ArrowDownRight size={18} /> : <ReceiptText size={18} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white leading-tight text-sm">{expense.title}</h4>
                        <p className="text-[10px] sm:text-xs font-medium mt-0.5 text-slate-600 dark:text-slate-400">
                           Paid by {isYouPayer ? 'You' : expense.payer} • Split among {expense.splits.length + 1} • {expense.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-black text-sm sm:text-base text-slate-800 dark:text-slate-200">
                        ₱{expense.totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>
        
        {/* ROW 4: Action Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button 
            onClick={() => setShowSettle(true)} 
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-leaf-peach/40 dark:border-slate-700 flex flex-col items-center justify-center gap-2 sm:gap-3 hover:bg-leaf-peach/5 dark:hover:bg-slate-800 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-leaf-peach/10 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Handshake size={24} className="text-slate-800 dark:text-slate-300" />
            </div>
            <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white text-xs sm:text-sm">Settle</span>
          </button>
          
          <button 
            onClick={() => setShowPaLista(true)} 
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-leaf-peach/40 dark:border-slate-700 flex flex-col items-center justify-center gap-2 sm:gap-3 hover:bg-leaf-peach/5 dark:hover:bg-slate-800 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-leaf-peach/10 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={24} className="text-slate-800 dark:text-slate-300 stroke-[3]" />
            </div>
            <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white text-xs sm:text-sm">Pa Lista</span>
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-6"
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
              
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">New Lista</h3>
              
              <div className="space-y-4">
                <button 
                  onClick={() => { setShowPaLista(false); setShowScanner(true); }}
                  className="w-full bg-leaf-peach/5 dark:bg-slate-800/50 hover:bg-leaf-peach/20 dark:hover:bg-slate-800 border-2 border-dashed border-leaf-peach/40 dark:border-slate-700 text-slate-800 dark:text-slate-300 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors group"
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
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <FileText size={16} /> Describe your lista
                  </label>
                  <textarea 
                    value={listaDescription}
                    onChange={(e) => setListaDescription(e.target.value)}
                    placeholder="e.g. Dinner with @alex for 850, we split equally"
                    className="w-full px-4 py-4 rounded-2xl border-2 border-leaf-peach/40 dark:border-slate-700 bg-transparent focus:border-slate-900 dark:focus:border-slate-300 outline-none text-slate-900 dark:text-white resize-none min-h-[120px] font-medium leading-relaxed"
                  />
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">Use <span className="text-leaf-green font-bold">@</span> to mention people.</p>
                </div>
                
                <button 
                  onClick={handleAddLista}
                  disabled={!listaDescription.trim() || isAnalyzing}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-500 text-white dark:text-slate-900 py-4 rounded-2xl font-bold transition-all mt-4 flex items-center justify-center gap-2"
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowSettle(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Settle Up</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-6">You currently owe <span className="font-bold text-leaf-pink dark:text-leaf-pink-dark">₱{youOwe.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span> in total.</p>
              
              <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-2">
                {activeOwes.length === 0 ? (
                  <div className="text-slate-400 dark:text-slate-500 text-sm font-medium text-center py-4">No pending debts to settle.</div>
                ) : (
                  activeOwes.map((owe, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-leaf-peach/40 dark:border-slate-800 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{owe.person}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{owe.title}</p>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[100px] text-right" title={`₱${owe.amount.toFixed(2)}`}>₱{owe.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                  ))
                )}
              </div>

              {activeOwes.length > 0 && (
                <div className="mb-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                  <div className="bg-white p-3 rounded-xl shadow-sm mb-3">
                    <QRCode
                      value={`QRPH:${group.id}:${youOwe.toFixed(2)}`}
                      size={120}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={`0 0 120 120`}
                      fgColor="#0f172a"
                    />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm tracking-wide">Scan to Pay via QRPH</span>
                </div>
              )}

              {activeOwes.length > 0 && (
                <button 
                  onClick={handleSettleAll}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 py-4 rounded-2xl font-bold transition-colors mb-3"
                >
                  Settle All (₱{youOwe.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})})
                </button>
              )}
              <button 
                onClick={() => setShowSettle(false)}
                className="w-full bg-slate-100 hover:bg-[#FCECEE] dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white py-4 rounded-2xl font-bold transition-colors"
              >
                {activeOwes.length > 0 ? 'Cancel' : 'Close'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Scanner Mock Modal */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-6"
            onClick={() => setShowScanner(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-black border border-white/10 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="h-72 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center"></div>
                <div className="w-48 h-56 border-2 border-leaf-green/80 rounded-xl relative z-10 flex items-center justify-center">
                  <div className="w-full h-1 bg-leaf-green absolute top-0 shadow-[0_0_15px_rgba(165,192,154,1)] animate-[scan_2s_ease-in-out_infinite_alternate]"></div>
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-leaf-green"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-leaf-green"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-leaf-green"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-leaf-green"></div>
                </div>
              </div>
              <div className="p-8 text-center bg-slate-950">
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Scanning...</h3>
                <p className="text-white/60 mb-8 text-sm font-medium">Extracting items, amounts, and calculating splits automatically.</p>
                <button 
                  onClick={() => setShowScanner(false)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3.5 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
