import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ReceiptText, ArrowDownRight, ArrowUpRight, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface ActivityItem {
  id: string;
  type: 'paid_by_you' | 'you_owe' | 'settled';
  title: string;
  groupName: string;
  amount: number;
  person: string;
  date: string;
}

interface ActivityScreenProps {
  groups: { id: string; name: string }[];
  userName?: string;
  onBack: () => void;
}

export default function ActivityScreen({ groups, userName, onBack }: ActivityScreenProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = useMemo(() => JSON.parse(localStorage.getItem('lista-user') || '{}'), []);

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      const allActivities: ActivityItem[] = [];

      try {
        for (const group of groups) {
          const [expenses, members, ledger] = await Promise.all([
            api.getExpenses(group.id),
            api.getGroupMembers(group.id),
            api.getLedger(group.id)
          ]);

          const getMemberName = (userId: string) => {
            if (userId === currentUser.id) return 'You';
            const member = members.find((m: any) => m.id === userId);
            return member?.displayName || 'Roommate';
          };

          // Check if group is fully settled (all balances zero)
          if (ledger?.balances && expenses.length > 0) {
            const allZero = Object.values(ledger.balances).every((b: any) => Math.abs(b) < 1);
            if (allZero) {
              const latestDate = expenses.reduce((latest: string, exp: any) => {
                const expTime = new Date(exp.createdAt).getTime();
                const latestTime = new Date(latest).getTime();
                return expTime > latestTime ? exp.createdAt : latest;
              }, expenses[0].createdAt);

              allActivities.push({
                id: `settled-${group.id}`,
                type: 'settled',
                title: 'LISTAHAN SETTLED',
                groupName: group.name,
                amount: 0,
                person: '',
                date: latestDate
              });
            }
          }

          // Process each expense into activity items
          expenses.forEach((exp: any) => {
            const isYouPayer = exp.paidBy === currentUser.id;
            const payerName = getMemberName(exp.paidBy);
            const participants: string[] = exp.splitDetails?.participantIds || [];
            const splitCount = participants.length || 1;
            const perPersonAmount = (exp.amount / 100) / splitCount;

            if (isYouPayer) {
              // You paid — show each other participant as "Paid by You"
              participants.forEach((pId: string) => {
                if (pId === currentUser.id) return;
                allActivities.push({
                  id: `${exp.id}-${pId}`,
                  type: 'paid_by_you',
                  title: exp.description,
                  groupName: group.name,
                  amount: perPersonAmount,
                  person: getMemberName(pId),
                  date: exp.createdAt
                });
              });
            } else if (participants.includes(currentUser.id)) {
              // Someone else paid and you're in the split — you owe
              allActivities.push({
                id: `${exp.id}-${currentUser.id}`,
                type: 'you_owe',
                title: exp.description,
                groupName: group.name,
                amount: perPersonAmount,
                person: payerName,
                date: exp.createdAt
              });
            }
          });
        }

        // Sort by date, newest first
        allActivities.sort((a, b) => {
          const timeA = a.date ? new Date(a.date).getTime() : 0;
          const timeB = b.date ? new Date(b.date).getTime() : 0;
          const validA = isNaN(timeA) ? 0 : timeA;
          const validB = isNaN(timeB) ? 0 : timeB;
          return validB - validA;
        });

        setActivities(allActivities);
      } catch (err) {
        console.error('Failed to load activities:', err);
      } finally {
        setLoading(false);
      }
    };

    if (groups.length > 0) {
      loadActivities();
    } else {
      setLoading(false);
    }
  }, [groups, currentUser.id]);

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
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-[#1B5648] dark:text-white" />
          </div>
        ) : activities.length === 0 ? (
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
                    activity.type === 'paid_by_you' ? 'bg-leaf-green/20 text-leaf-green-dark' :
                    activity.type === 'settled' ? 'bg-slate-100 text-[#316D5F] dark:bg-slate-800 dark:text-slate-300' :
                    'bg-leaf-pink/20 text-leaf-pink-dark'
                  }`}>
                    {activity.type === 'paid_by_you' && <ArrowDownRight size={20} />}
                    {activity.type === 'you_owe' && <ArrowUpRight size={20} />}
                    {activity.type === 'settled' && <CheckCircle2 size={20} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#13463B] dark:text-white leading-tight uppercase tracking-wide">
                      {activity.type === 'settled' ? 'LISTAHAN SETTLED' : activity.title}
                    </h4>
                    <p className="text-xs font-medium mt-1 text-[#316D5F] dark:text-slate-400">
                      <span className="text-[#1B5648] dark:text-slate-200 font-bold">{activity.groupName}</span>
                      {activity.type === 'paid_by_you' && ` · Paid by You`}
                      {activity.type === 'you_owe' && ` · Paid by ${activity.person}`}
                    </p>
                    <p className="text-[10px] text-[#577870] dark:text-slate-500 mt-0.5">
                      {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col justify-center items-end">
                  {activity.type !== 'settled' ? (
                    <>
                      <span className={`block text-[10px] font-bold uppercase tracking-wider ${
                        activity.type === 'paid_by_you' ? 'text-leaf-green-dark' : 'text-leaf-pink-dark'
                      }`}>
                        {activity.type === 'paid_by_you' ? 'Owes You' : 'You Owe'}
                      </span>
                      <span className={`block font-black text-lg leading-none mt-1 ${
                        activity.type === 'paid_by_you' ? 'text-[#13463B] dark:text-white' : 'text-leaf-pink dark:text-leaf-pink-dark'
                      }`}>
                        ₱{activity.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                    </>
                  ) : (
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#577870]">
                      Completed
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
