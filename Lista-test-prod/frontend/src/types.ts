export interface Split {
  person: string;
  amountOwed: number;
  paid: boolean;
}

export interface ExpenseItem {
  id: string;
  groupId: string;
  title: string;
  totalAmount: number;
  expenseType: string;
  payer: string;
  splits: Split[];
  date: string;
}
