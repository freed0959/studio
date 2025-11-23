export type Recurrence = 
  | { type: 'monthly' }
  | { type: 'specific', months: number[] }; // 1 for Jan, 12 for Dec

export type MasterExpense = {
  id: string;
  name: string;
  amount: number;
  platform: string;
  dueDate: number;
  recurrence: Recurrence;
};

export type MonthlyExpenseState = {
  id: string;
  completed: boolean;
  skipped: boolean;
};

export type DisplayExpense = MasterExpense & MonthlyExpenseState;

export type MonthlyData = {
  month: string;
  expenses: MonthlyExpenseState[];
}

export type ExpenseSummary = {
  total: number;
  completedAmount: number;
  progress: number;
  remaining: number;
}

export type PlatformSummaryData = {
  [platform: string]: number;
}

export type Platform = {
  id: string;
  name: string;
}

export type SortOption = 'dueDate' | 'name' | 'amount';
