import React, { useState } from 'react';
import { Expense, User, Category } from '../types';
import { calculateSettlements, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle2, WalletCards, ReceiptText, Camera, ScanLine, QrCode, CloudOff } from 'lucide-react';

export function ExpenseListCard({ expenses, users }: { expenses: Expense[], users: User[] }) {
  const recent = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(dateString));
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col flex-1 transition-colors">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Activity</h3>
      {recent.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
          No recent activity.
        </div>
      ) : (
        <div className="flex flex-col gap-0 overflow-y-auto pr-2 custom-scrollbar -mx-2">
          {recent.map((exp, index) => {
            const payer = users.find(u => u.id === exp.paidBy)?.name || 'Unknown';
            const isLast = index === recent.length - 1;
            return (
              <div key={exp.id} className={`p-3 flex justify-between items-center ${!isLast ? 'border-b border-gray-50 dark:border-gray-800' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${exp.settledAt ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'} flex items-center justify-center`}>
                    {exp.settledAt ? <CheckCircle2 size={18} /> : <ReceiptText size={18} />}
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${exp.settledAt ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                      {payer} added {exp.description} - {formatCurrency(exp.amount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatDateTime(exp.date)}
                    </p>
                    {exp.settledAt && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                        Settled {formatDateTime(exp.settledAt)}
                      </p>
                    )}
                  </div>
                </div>
                {exp.syncState === 'pending' && (
                  <div className="flex flex-col items-end">
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                      <CloudOff size={12} /> Pending
                    </span>
                  </div>
                )}
                {exp.syncState === 'confirmed' && (
                  <div className="flex flex-col items-end">
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                      <CheckCircle2 size={12} /> Confirmed
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AddExpenseForm({ users, currentUser, onAdd }: { users: User[], currentUser: User, onAdd: (e: Expense) => void }) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Groceries');
  const [paidBy, setPaidBy] = useState(currentUser.id);
  const [splitAmong, setSplitAmong] = useState<string[]>(users.map(u => u.id));
  const [splitType, setSplitType] = useState<'equal' | 'exact' | 'percentage'>('equal');
  const [scanning, setScanning] = useState(false);

  const handleScanReceipt = () => {
    setScanning(true);
    setTimeout(() => {
      setDesc('SM Supermarket');
      setAmount('3540.50');
      setCategory('Groceries');
      setScanning(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || isNaN(Number(amount)) || splitAmong.length === 0) return;

    onAdd({
      id: crypto.randomUUID(),
      description: desc,
      amount: Number(amount),
      category,
      paidBy,
      splitAmong,
      date: new Date().toISOString()
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 w-full flex-1 overflow-y-auto transition-colors"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-xl text-gray-900 dark:text-white">Add Expense</h3>
        <button 
          onClick={handleScanReceipt}
          disabled={scanning}
          className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-3 py-1.5 rounded-full transition-colors"
        >
          {scanning ? <ScanLine size={16} className="animate-pulse" /> : <Camera size={16} />}
          {scanning ? 'Scanning...' : 'Scan Receipt'}
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
          <input 
            type="text" required value={desc} onChange={e => setDesc(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
            placeholder="e.g. Meralco Bill"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount (₱)</label>
            <input 
              type="number" required min="1" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
              placeholder="0.00"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
            <select 
              value={category} onChange={e => setCategory(e.target.value as Category)}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white outline-none transition-all"
            >
              <option value="Rent">Rent</option>
              <option value="Groceries">Groceries</option>
              <option value="Utilities">Utilities</option>
              <option value="Internet">Internet</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Who paid?</label>
          <select 
            value={paidBy} onChange={e => setPaidBy(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white outline-none transition-all"
          >
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Split type</label>
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button 
              type="button" 
              onClick={() => setSplitType('equal')}
              className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors ${splitType === 'equal' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Equal
            </button>
            <button 
              type="button" 
              onClick={() => setSplitType('exact')}
              className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors ${splitType === 'exact' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Exact
            </button>
            <button 
              type="button" 
              onClick={() => setSplitType('percentage')}
              className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors ${splitType === 'percentage' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              %
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Split among</label>
          <div className="flex flex-wrap gap-2">
            {users.map(u => (
              <label key={u.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer border text-sm transition-colors ${splitAmong.includes(u.id) ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                <input 
                  type="checkbox"
                  checked={splitAmong.includes(u.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSplitAmong([...splitAmong, u.id]);
                    else setSplitAmong(splitAmong.filter(id => id !== u.id));
                  }}
                  className="hidden"
                />
                <span className="font-medium">{u.name}</span>
              </label>
            ))}
          </div>
          {users.length <= 1 && (
            <div className="mt-3 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 p-3 rounded-xl text-xs border border-amber-100/30 dark:border-amber-950/45 font-medium leading-relaxed">
              Note: You are currently the only member in this household group. Tap on your avatar or open the side menu to access your join QR code or invite link to add roommates!
            </div>
          )}
        </div>

        <button 
          type="submit"
          className="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98]"
        >
          Save Expense
        </button>
      </form>
    </motion.div>
  );
}

export function SettlementsView({ expenses, users, currentUser, onSettle, onSettleDebt }: { expenses: Expense[], users: User[], currentUser: User, onSettle: () => void, onSettleDebt?: (fromId: string, toId: string, amount: number) => void }) {
  const settlements = calculateSettlements(expenses, users);
  const [settling, setSettling] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState<{from: string, to: string, amount: number} | null | 'all'>(null);

  const handleSettle = () => {
    const paymentTarget = showPaymentSheet;
    setShowPaymentSheet(null);
    setSettling(true);
    setTimeout(() => {
      if (paymentTarget === 'all') {
        onSettle();
      } else if (paymentTarget && paymentTarget !== 'all' && onSettleDebt) {
        onSettleDebt(paymentTarget.from, paymentTarget.to, paymentTarget.amount);
      }
      setSettling(false);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 w-full flex-1 flex flex-col transition-colors"
    >
      <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">Settle Up</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Review balances and settle debts instantly.
      </p>

      {settlements.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mb-1">
            <CheckCircle2 size={32} />
          </div>
          <h4 className="font-medium text-gray-900 dark:text-white">You're all settled up!</h4>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          {settlements.map((s, i) => {
            const fromUser = users.find(u => u.id === s.from)?.name;
            const toUser = users.find(u => u.id === s.to)?.name;
            const isYouPaying = s.from === currentUser.id;
            
            return (
              <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex flex-col gap-4 shadow-sm bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{fromUser}</span>
                    <ArrowRight className="text-gray-300 dark:text-gray-600" size={14} />
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{toUser}</span>
                  </div>
                  <div className={`font-bold text-lg ${isYouPaying ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {formatCurrency(s.amount)}
                  </div>
                </div>
                
                {isYouPaying && (
                  <button 
                    onClick={() => setShowPaymentSheet(s)}
                    disabled={settling}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70"
                  >
                    {settling ? 'Processing...' : 'Settle Now'}
                  </button>
                )}
              </div>
            );
          })}

          <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
             <button 
                onClick={() => setShowPaymentSheet('all')}
                disabled={settling}
                className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {settling ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <WalletCards size={18} />
                    Mark all as settled
                  </>
                )}
              </button>
          </div>
        </div>
      )}

      {/* Payment Method Bottom Sheet Mock */}
      <AnimatePresence>
        {showPaymentSheet && (
          <motion.div key="payment-sheet-wrapper" className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentSheet(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl p-6 shadow-2xl flex flex-col gap-4 border-t border-gray-100 dark:border-gray-800"
            >
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-2"></div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Select Payment Method</h3>
              
              <button onClick={handleSettle} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold">
                  <QrCode size={18} />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">QRPH</span>
              </button>
              
              <button onClick={handleSettle} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">G</div>
                <span className="font-medium text-gray-900 dark:text-white">GCash</span>
              </button>
              
              <button onClick={handleSettle} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center font-bold">M</div>
                <span className="font-medium text-gray-900 dark:text-white">Maya</span>
              </button>
              
              <button onClick={handleSettle} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-bold">B</div>
                <span className="font-medium text-gray-900 dark:text-white">Bank Transfer</span>
              </button>
              
              <button onClick={handleSettle} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center font-bold">$</div>
                <span className="font-medium text-gray-900 dark:text-white">Pay in Cash (Needs Confirmation)</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
