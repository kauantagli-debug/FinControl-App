export type TransactionType = 'income' | 'expense' | 'credit';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
  
  // Logic: 
  // For 'expense'/'income': date is when it happened.
  // For 'credit': date is the purchase date.
  date: string; 
  
  // Logic:
  // The 'bucket' month this transaction affects the balance.
  // For 'credit', this is the Invoice Month (Fatura).
  // For others, usually same as date's month.
  targetMonth: string; // Format: YYYY-MM
  
  isFixed?: boolean; // For fixed monthly expenses
  isPaid?: boolean; // For expenses (Paid vs Pending)
}

export interface MonthSummary {
  income: number;
  fixedExpenses: number;
  variableExpenses: number;
  creditCardBill: number;
  totalExpenses: number;
  balance: number;
}
