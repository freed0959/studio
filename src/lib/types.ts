export type MasterExpense = {
  id: string;
  name: string;
  amount: number;
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
