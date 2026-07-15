import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ReceiptText, ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { ExpenseItem } from '../types';

interface ActivityItem {
  id: string;
  type: 'pending' | 'paid' | 'debt' | 'settled';
  title: string;
  groupName: string;
  amount: number;
  person: string;
  date: string;
}

interface ActivityScreenProps {
  expenses: ExpenseItem[];
  groups: { id: string; name: string }[];
  userName?: string;
  onBack: () => void;
}

export default function ActivityScreen({ expenses, groups, userName, onBack }: ActivityScreenProps) {
  const activities = React.useMemo(() => {
    const list: ActivityItem[] = [];

    // Group completion checks
    groups.forEach(group => {
      const groupExpenses = expenses.filter(e => e.groupId === group.id);
      if (groupExpenses.length > 0) {
        const allSettled = groupExpenses.every(exp => exp.splits.every(s => s.paid));
        if (allSettled) {
          // Find the most recent date from the expenses
          const latestDateStr = groupExpenses.reduce((latest, current) => {
            if (current.date === 'Just now') return 'Just now';
            if (latest === 'Just now') return 'Just now';
            const curTime = new Date(current.date).getTime();
            const latestTime = new Date(latest).getTime();
            return curTime > latestTime ? current.date : latest;
          }, groupExpenses[0].date);

          list.push({
            id: `settled-${group.id}`,
            type: 'settled',
            title: 'LISTAHAN SETTLED',
            groupName: group.name,
            amount: 0,
            person: '',
            date: latestDateStr
          });
        }
      }
    });

    expenses.forEach(exp => {
      const groupName = groups.find(g => g.id === exp.groupId)?.name || 'Unknown Group';
      const isYouPayer = exp.payer.toLowerCase() === 'you' || exp.payer.toLowerCase() === 'me' || (userName && exp.payer.toLowerCase() === userName.toLowerCase());
      
      exp.splits.forEach(split => {
        const isYouSplit = split.person.toLowerCase() === 'you' || split.person.toLowerCase() === 'me' || (userName && split.person.toLowerCase() === userName.toLowerCase());
        
        if (isYouPayer && !isYouSplit) {
          list.push({
            id: exp.id + '-' + split.person,
            type: split.paid ? 'paid' : 'pending',
            title: exp.title,
            groupName: groupName,
            amount: split.amountOwed,
            person: split.person,
            date: exp.date
          });
        } else if (!isYouPayer && isYouSplit) {
          list.push({
            id: exp.id + '-' + split.person,
            type: split.paid ? 'paid' : 'debt',
            title: exp.title,
            groupName: groupName,
            amount: split.amountOwed,
            person: exp.payer,
            date: exp.date
          });
        }
      });
    });

    return list.sort((a, b) => { 
      const timeA = a.date === 'Just now' ? Number.MAX_SAFE_INTEGER : new Date(a.date).getTime(); 
      const timeB = b.date === 'Just now' ? Number.MAX_SAFE_INTEGER : new Date(b.date).getTime(); 
      return timeB - timeA; 
    });
  }, [expenses, userName, groups]);

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-[#F3EFE7] dark:bg-[#121212] z-50 flex flex-col"
    >
      <header className="bg-white dark:bg-slate-900 border-b border-[#C8DACF] dark:border-slate-800 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shrink-0">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#FCECEE] dark:bg-slate-800 flex items-center justify-center text-[#236450] dark:text-slate-300 hover:bg-leaf-pink/20 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#13463B] dark:text-white leading-tight">Activity</h1>
          <p className="text-xs text-[#577870] dark:text-slate-400">All your transactions</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {activities.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-[#C8DACF] dark:border-slate-800 text-center shadow-sm flex flex-col items-center justify-center h-64">
            <div className="w-16 h-16 bg-[#FCECEE] dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <ReceiptText size={32} />
            </div>
            <h3 className="font-bold text-[#13463B] dark:text-white text-lg mb-2">No activity yet</h3>
            <p className="text-[#316D5F] dark:text-slate-400 text-sm">Create a Listahan to start tracking expenses.</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto pb-12">
            {activities.map(activity => (
              <div key={activity.id} className="bg-white dark:bg-slate-900 p-4 rounded-[24px] shadow-sm border border-[#C8DACF] dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 ${
                    activity.type === 'pending' ? 'bg-leaf-yellow/20 text-leaf-yellow-dark' :
                    activity.type === 'paid' ? 'bg-leaf-green/20 text-leaf-green-dark' :
                    activity.type === 'settled' ? 'bg-slate-100 text-[#316D5F] dark:bg-slate-800 dark:text-slate-300' :
                    'bg-leaf-pink/20 text-leaf-pink-dark'
                  }`}>
                    {activity.type === 'pending' && <ReceiptText size={20} />}
                    {activity.type === 'paid' && <ArrowDownRight size={20} />}
                    {activity.type === 'debt' && <ArrowUpRight size={20} />}
                    {activity.type === 'settled' && <CheckCircle2 size={20} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#13463B] dark:text-white leading-tight uppercase tracking-wide">
                      {activity.type === 'settled' ? 'LISTAHAN SETTLED' : activity.title}
                    </h4>
                    <p className="text-xs font-medium mt-1 text-[#316D5F] dark:text-slate-400 uppercase">
                      <span className="text-[#1B5648] dark:text-slate-200 font-bold">{activity.groupName}</span>
                      {activity.type !== 'settled' && ` | ${activity.person}`}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col justify-between items-end h-12">
                  <span className={`block text-[10px] font-bold uppercase tracking-wider ${
                    activity.type === 'pending' ? 'text-leaf-yellow-dark' :
                    activity.type === 'paid' ? 'text-leaf-green-dark' :
                    activity.type === 'settled' ? 'text-[#577870]' :
                    'text-leaf-pink-dark'
                  }`}>
                    {activity.type === 'pending' ? 'Owes You' :
                     activity.type === 'paid' ? 'Settled' :
                     activity.type === 'settled' ? 'Completed' :
                     'You Owe'}
                  </span>
                  
                  {activity.type !== 'settled' ? (
                    <span className={`block font-black text-lg leading-none ${
                      activity.type === 'pending' ? 'text-[#13463B] dark:text-white' :
                      activity.type === 'paid' ? 'text-slate-400 dark:text-slate-500' :
                      'text-leaf-pink dark:text-leaf-pink-dark'
                    }`}>
                      ₱{activity.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                  ) : (
                    <span className="block font-medium text-xs text-slate-400 mt-1">
                      {activity.date}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
