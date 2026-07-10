export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  walletAddress?: string;
  avatar?: string;
  status?: 'ACTIVE' | 'ARCHIVED';
  payment_qr?: string;
  payment_link?: string;
}

export type Category = 'Rent' | 'Groceries' | 'Utilities' | 'Internet' | 'Others';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: Category;
  paidBy: string; // user id
  splitAmong: string[]; // user ids
  date: string; // ISO string
  settledAt?: string; // ISO string for when it was settled
  syncState?: 'pending' | 'confirmed';
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}
