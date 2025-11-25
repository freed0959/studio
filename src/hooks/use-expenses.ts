"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { addMonths, subMonths, format, getMonth, startOfToday } from 'date-fns';
import { MasterExpense, MonthlyData, DisplayExpense, ExpenseSummary, MonthlyExpenseState, PlatformSummaryData, Recurrence, SortOption } from '@/lib/types';
import { useToast } from './use-toast';
import { getCycleDateRange } from '@/lib/utils';

const MASTER_KEY = 'rutin-tracker-master';
const MONTHLY_KEY_PREFIX = 'rutin-tracker-monthly-';

const initialMasterData: MasterExpense[] = [
  { id: '1', name: 'Listrik & Air', amount: 300000, platform: 'BCA', dueDate: 20, recurrence: { type: 'monthly' } },
  { id: '2', name: 'Internet & TV Kabel', amount: 350000, platform: 'Bank Jago', dueDate: 5, recurrence: { type: 'monthly' } },
  { id: '3', name: 'Uang Kost / Kontrakan', amount: 1500000, platform: 'BCA', dueDate: 1, recurrence: { type: 'monthly' } },
  { id: '4', name: 'Langganan Streaming', amount: 150000, platform: 'Gopay', dueDate: 15, recurrence: { type: 'monthly' } },
];

const getCurrentCycleMonth = () => {
    // We use local date parts to avoid timezone issues with `new Date()` and `toISOString()`
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed
    const day = today.getDate();

    // If today is before the 25th, we are in the cycle of the current month name.
    // e.g. Oct 25 to Nov 24 is the "November" cycle (Month 11).
    // If it's Nov 1-24, cycle is '2023-11'.
    // If it's Oct 25-31, cycle is also '2023-11'.
    const dateForCycle = day < 25 ? new Date(year, month) : addMonths(new Date(year, month), 1);
    return format(dateForCycle, 'yyyy-MM');
};


export const useExpenses = () => {
  const [masterExpenses, setMasterExpenses] = useState<MasterExpense[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentCycleMonth);
  const [sortOption, setSortOption] = useState<SortOption>('dueDate');
  const { toast } = useToast();

  const { end: cycleEndDate } = useMemo(() => getCycleDateRange(currentMonth), [currentMonth]);
  const currentCycleMonthNumber = useMemo(() => getMonth(cycleEndDate) + 1, [cycleEndDate]);


  const migrateMasterData = (data: any[]): MasterExpense[] => {
    return data.map(exp => {
      if (!exp.recurrence) {
        return { ...exp, recurrence: { type: 'monthly' } };
      }
      return exp;
    });
  };

  useEffect(() => {
    setLoading(true);
    try {
      const storedMaster = localStorage.getItem(MASTER_KEY);
      const rawMaster = storedMaster ? JSON.parse(storedMaster) : initialMasterData;
      const initialMaster = migrateMasterData(rawMaster);
      setMasterExpenses(initialMaster);

      const monthKey = `${MONTHLY_KEY_PREFIX}${currentMonth}`;
      const storedMonthly = localStorage.getItem(monthKey);
      
      const monthlyForMonth: MonthlyData | null = storedMonthly ? JSON.parse(storedMonthly) : null;

      if (monthlyForMonth) {
        setMonthlyData(monthlyForMonth);
      } else {
        const newMonthlyData: MonthlyData = {
          month: currentMonth,
          expenses: initialMaster.map((exp: MasterExpense) => ({
            id: exp.id,
            completed: false,
            skipped: false,
          })),
        };
        setMonthlyData(newMonthlyData);
        localStorage.setItem(monthKey, JSON.stringify(newMonthlyData));
      }
      
      if (!storedMaster) {
        localStorage.setItem(MASTER_KEY, JSON.stringify(initialMaster));
      }

    } catch (error) {
      console.error("Failed to access localStorage:", error);
      const initialMaster = migrateMasterData(initialMasterData);
      setMasterExpenses(initialMaster);
      setMonthlyData({
          month: currentMonth,
          expenses: initialMaster.map(exp => ({ id: exp.id, completed: false, skipped: false }))
      });
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  const updateMasterAndSave = useCallback((newMaster: MasterExpense[]) => {
    setMasterExpenses(newMaster);
    try {
      localStorage.setItem(MASTER_KEY, JSON.stringify(newMaster));
    } catch (error) {
      console.error("Failed to save master data to localStorage:", error);
    }
  }, []);

  const updateMonthlyAndSave = useCallback((newMonthly: MonthlyData) => {
    setMonthlyData(newMonthly);
    try {
      const monthKey = `${MONTHLY_KEY_PREFIX}${newMonthly.month}`;
      localStorage.setItem(monthKey, JSON.stringify(newMonthly));
    } catch (error) {
      console.error("Failed to save monthly data to localStorage:", error);
    }
  }, []);
  
  const navigateMonth = useCallback((direction: 'next' | 'prev') => {
    setCurrentMonth(prevMonth => {
      const date = new Date(`${prevMonth}-15`); // Use mid-month to avoid timezone issues
      const newDate = direction === 'next' ? addMonths(date, 1) : subMonths(date, 1);
      return format(newDate, 'yyyy-MM');
    });
  }, []);

  const addExpense = useCallback((name: string, amount: number, platform: string, dueDate: number, recurrence: Recurrence) => {
    const newExpense: MasterExpense = { id: Date.now().toString(), name, amount, platform, dueDate, recurrence };
    const newMaster = [...masterExpenses, newExpense];
    updateMasterAndSave(newMaster);

    const shouldAppearThisMonth = recurrence.type === 'monthly' || (recurrence.type === 'specific' && recurrence.months.includes(currentCycleMonthNumber));

    if (monthlyData && shouldAppearThisMonth) {
      const newMonthlyState: MonthlyExpenseState = { id: newExpense.id, completed: false, skipped: false };
      const newMonthlyData: MonthlyData = {
        ...monthlyData,
        expenses: [...monthlyData.expenses, newMonthlyState],
      };
      updateMonthlyAndSave(newMonthlyData);
    }
    toast({
        title: "Sukses!",
        description: `Pengeluaran "${name}" telah ditambahkan.`,
    });
  }, [masterExpenses, monthlyData, updateMasterAndSave, updateMonthlyAndSave, toast, currentCycleMonthNumber]);

  const updateExpense = useCallback((id: string, updatedData: Partial<Omit<MasterExpense, 'id'>>) => {
    let updatedName = '';
    const newMaster = masterExpenses.map(exp => {
        if (exp.id === id) {
            const updated = { ...exp, ...updatedData };
            updatedName = updated.name;
            return updated;
        }
        return exp;
    });
    updateMasterAndSave(newMaster);
    toast({
        title: "Sukses!",
        description: `Pengeluaran "${updatedName}" telah diperbarui.`,
    });
  }, [masterExpenses, updateMasterAndSave, toast]);

  const toggleComplete = useCallback((id: string) => {
    if (!monthlyData) return;
    const newMonthlyData = {
      ...monthlyData,
      expenses: monthlyData.expenses.map(e => e.id === id ? { ...e, completed: !e.completed } : e),
    };
    updateMonthlyAndSave(newMonthlyData);
  }, [monthlyData, updateMonthlyAndSave]);

  const skipForMonth = useCallback((id: string) => {
    if (!monthlyData) return;
    const newMonthlyData = {
      ...monthlyData,
      expenses: monthlyData.expenses.map(e => e.id === id ? { ...e, skipped: true } : e),
    };
    updateMonthlyAndSave(newMonthlyData);
    const expense = masterExpenses.find(e => e.id === id);
    toast({
        title: "Pengeluaran Dilewati",
        description: `"${expense?.name}" tidak akan ditampilkan untuk periode ini.`,
        variant: "default",
    });
  }, [monthlyData, masterExpenses, updateMonthlyAndSave, toast]);
  
  const deletePermanently = useCallback((id: string) => {
    const expenseToDelete = masterExpenses.find(e => e.id === id);
    if(!expenseToDelete) return;

    const newMaster = masterExpenses.filter(e => e.id !== id);
    updateMasterAndSave(newMaster);

    if (monthlyData) {
      const newMonthlyData = {
        ...monthlyData,
        expenses: monthlyData.expenses.filter(e => e.id !== id),
      };
      updateMonthlyAndSave(newMonthlyData);
    }
    toast({
        title: "Pengeluaran Dihapus",
        description: `"${expenseToDelete.name}" telah dihapus secara permanen.`,
        variant: "destructive",
    });
  }, [masterExpenses, monthlyData, updateMasterAndSave, updateMonthlyAndSave, toast]);

  // Sync master and monthly data if there is a mismatch
  useEffect(() => {
    if (loading || !monthlyData || !masterExpenses.length) return;

    const masterIds = new Set(masterExpenses.map(e => e.id));
    const monthlyIds = new Set(monthlyData.expenses.map(e => e.id));

    let needsUpdate = false;
    let newMonthlyExpenses = [...monthlyData.expenses];

    // Add new master expenses to monthly for the current month
    for (const masterExp of masterExpenses) {
      if (!monthlyIds.has(masterExp.id)) {
        const { recurrence } = masterExp;
        const shouldAppearThisMonth = recurrence.type === 'monthly' || (recurrence.type === 'specific' && recurrence.months.includes(currentCycleMonthNumber));

        if (shouldAppearThisMonth) {
            newMonthlyExpenses.push({
                id: masterExp.id,
                completed: false,
                skipped: false,
            });
            needsUpdate = true;
        }
      }
    }

    // Remove deleted master expenses from monthly for the current month
    const filteredMonthlyExpenses = newMonthlyExpenses.filter(exp => masterIds.has(exp.id));
    if (filteredMonthlyExpenses.length !== newMonthlyExpenses.length) {
      needsUpdate = true;
    }

    if (needsUpdate) {
      updateMonthlyAndSave({ ...monthlyData, expenses: filteredMonthlyExpenses });
    }

  }, [masterExpenses, monthlyData, loading, updateMonthlyAndSave, currentCycleMonthNumber]);
  
  const sortExpenses = useCallback((option: SortOption) => {
    setSortOption(option);
  }, []);

  const expenses: DisplayExpense[] = useMemo(() => masterExpenses
    .filter(masterExp => {
        const { recurrence } = masterExp;
        if (recurrence.type === 'specific') {
            return recurrence.months.includes(currentCycleMonthNumber);
        }
        return true; // 'monthly' expenses always included
    })
    .map(masterExp => {
      const monthlyState = monthlyData?.expenses.find(m => m.id === masterExp.id);
      return { ...masterExp, ...monthlyState };
    })
    .filter((exp): exp is DisplayExpense => exp.id !== undefined && exp.completed !== undefined && exp.skipped !== undefined)
    .sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'amount':
          return b.amount - a.amount;
        case 'dueDate':
        default:
          const getSortableDate = (date: number) => (date >= 25 ? date - 25 : date + 7);
          return getSortableDate(a.dueDate) - getSortableDate(b.dueDate);
      }
    }), [masterExpenses, monthlyData, currentCycleMonthNumber, sortOption]);

  const summary: ExpenseSummary = expenses.reduce((acc, exp) => {
    if (exp.skipped) return acc;
    acc.total += exp.amount;
    if (exp.completed) {
      acc.completedAmount += exp.amount;
    }
    return acc;
  }, { total: 0, completedAmount: 0, progress: 0, remaining: 0 });

  summary.progress = summary.total > 0 ? (summary.completedAmount / summary.total) * 100 : 0;
  summary.remaining = summary.total - summary.completedAmount;

  const platformSummary: PlatformSummaryData = useMemo(() => {
    const expensesByPlatform: { [key: string]: DisplayExpense[] } = {};

    for (const exp of expenses) {
      if (exp.skipped) continue;
      if (!expensesByPlatform[exp.platform]) {
        expensesByPlatform[exp.platform] = [];
      }
      expensesByPlatform[exp.platform].push(exp);
    }

    const summary: PlatformSummaryData = {};
    for (const platform in expensesByPlatform) {
      const platformExpenses = expensesByPlatform[platform];
      const totalAmount = platformExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const allCompleted = platformExpenses.every(exp => exp.completed);
      summary[platform] = { amount: totalAmount, allCompleted };
    }
    
    return summary;
  }, [expenses]);


  return { expenses, summary, platformSummary, addExpense, updateExpense, toggleComplete, skipForMonth, deletePermanently, loading, currentMonth, navigateMonth, sortExpenses, sortOption };
};
