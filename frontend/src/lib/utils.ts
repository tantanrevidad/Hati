import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Expense, Settlement, User } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateSettlements(expenses: Expense[], users: User[]): Settlement[] {
  const balances: Record<string, number> = {};
  users.forEach((u) => (balances[u.id] = 0));

  expenses.forEach((exp) => {
    if (exp.settledAt) return; // Skip settled expenses

    // The person who paid gets a positive balance for the amount they paid
    if (balances[exp.paidBy] !== undefined) {
      balances[exp.paidBy] += exp.amount;
    }
    
    // Everyone involved in the split gets a negative balance for their share
    const splitAmount = exp.amount / exp.splitAmong.length;
    exp.splitAmong.forEach((uid) => {
      if (balances[uid] !== undefined) {
        balances[uid] -= splitAmount;
      }
    });
  });

  const debtors = Object.keys(balances)
    .filter((k) => balances[k] < -0.01)
    .map((k) => ({ id: k, amount: -balances[k] }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = Object.keys(balances)
    .filter((k) => balances[k] > 0.01)
    .map((k) => ({ id: k, amount: balances[k] }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    settlements.push({ from: debtor.id, to: creditor.id, amount });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
}

export const CATEGORY_COLORS: Record<string, string> = {
  Rent: '#FF6B6B',
  Groceries: '#4ECDC4',
  Utilities: '#FFE66D',
  Internet: '#8A2BE2',
  Others: '#A8B8D0',
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};
