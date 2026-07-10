import { Expense, User } from '../types';
import { formatCurrency, calculateSettlements } from '../lib/utils';
import { useMemo, useState } from 'react';
import { ArrowRight, Network, List, Plus } from 'lucide-react';
import { motion } from 'motion/react';

export function DebtSummaryCard({ expenses, users, currentUser, onAddMember }: { expenses: Expense[], users: User[], currentUser: User, onAddMember?: () => void }) {
  const [showGraph, setShowGraph] = useState(false);

  const { totalOwedToYou, totalYouOwe, netBalance, settlements } = useMemo(() => {
    const settlements = calculateSettlements(expenses, users);
    let owedToYou = 0;
    let youOwe = 0;
    
    settlements.forEach(s => {
      if (s.to === currentUser.id) owedToYou += s.amount;
      if (s.from === currentUser.id) youOwe += s.amount;
    });

    return {
      totalOwedToYou: owedToYou,
      totalYouOwe: youOwe,
      netBalance: owedToYou - youOwe,
      settlements
    };
  }, [expenses, users, currentUser]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-5 transition-colors">
      
      {/* Member avatars list */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-900 dark:text-white">Roommates</h3>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {users.map(u => (
              <div key={u.id} className={`w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-bold text-white shadow-sm ${u.avatar}`}>
                {u.name.charAt(0)}
              </div>
            ))}
          </div>
          {onAddMember && (
            <button 
              onClick={onAddMember}
              className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Balance</span>
        <span className={`text-4xl font-bold ${
          netBalance > 0 ? 'text-emerald-500 dark:text-emerald-400' : 
          netBalance < 0 ? 'text-rose-500 dark:text-rose-400' : 'text-gray-900 dark:text-white'
        }`}>
          {netBalance > 0 ? '+' : ''}{formatCurrency(netBalance)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-950/50 rounded-xl p-3 flex flex-col">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">You are owed</span>
          <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(totalOwedToYou)}</span>
        </div>
        <div className="bg-rose-50 dark:bg-rose-950/50 rounded-xl p-3 flex flex-col">
          <span className="text-xs font-medium text-rose-600 dark:text-rose-400 mb-1">You owe</span>
          <span className="text-lg font-bold text-rose-700 dark:text-rose-300">{formatCurrency(totalYouOwe)}</span>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Debt Simplification</span>
          <button 
            onClick={() => setShowGraph(!showGraph)}
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
          >
            {showGraph ? <><List size={14} /> List View</> : <><Network size={14} /> Graph View</>}
          </button>
        </div>

        {showGraph ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 flex flex-col gap-6 relative">
             {/* Visual Debt Graph Mockup */}
             {settlements.length === 0 ? (
               <div className="text-center text-sm text-gray-400 dark:text-gray-500">All settled up</div>
             ) : (
               <div className="relative flex flex-col gap-6 items-center">
                 {settlements.map((s, i) => {
                   const fromUser = users.find(u => u.id === s.from);
                   const toUser = users.find(u => u.id === s.to);
                   return (
                     <div key={i} className="flex items-center gap-2 w-full justify-center relative">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white z-10 ${fromUser?.avatar}`}>
                         {fromUser?.name.charAt(0)}
                       </div>
                       <div className="flex-1 max-w-[120px] relative flex flex-col items-center">
                          <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="absolute top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-2 text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded-full shadow-sm">
                            {formatCurrency(s.amount)}
                          </div>
                          <ArrowRight size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 translate-x-1/2 bg-white dark:bg-gray-900" />
                       </div>
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white z-10 ${toUser?.avatar}`}>
                         {toUser?.name.charAt(0)}
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
            {settlements.length === 0 ? (
              <div className="text-center text-sm text-gray-400 dark:text-gray-500 py-2">No active debts</div>
            ) : (
               settlements.map((s, i) => {
                 const fromUser = users.find(u => u.id === s.from)?.name;
                 const toUser = users.find(u => u.id === s.to)?.name;
                 const isYouPaying = s.from === currentUser.id;
                 return (
                   <div key={i} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                     <span className="text-gray-600 dark:text-gray-400">
                       <strong className="text-gray-900 dark:text-gray-100 font-medium">{fromUser}</strong> owes <strong className="text-gray-900 dark:text-gray-100 font-medium">{toUser}</strong>
                     </span>
                     <span className={`font-semibold ${isYouPaying ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                       {formatCurrency(s.amount)}
                     </span>
                   </div>
                 )
               })
            )}
          </motion.div>
        )}
      </div>

    </div>
  );
}
