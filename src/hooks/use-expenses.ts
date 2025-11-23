"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { addMonths, subMonths, format, getMonth } from 'date-fns';
import { MasterExpense, MonthlyData, DisplayExpense, ExpenseSummary, MonthlyExpenseState, PlatformSummaryData, Recurrence } from '@/lib/types';
import { useToast } from './use-toast';

const MASTER_KEY = 'rutin-tracker-master';
const MONTHLY_KEY_PREFIX = 'rutin-tracker-monthly-';

const initialMasterData: MasterExpense[] = [
  { id: '1', name: 'Listrik & Air', amount: 300000, platform: 'BCA', dueDate: 20, recurrence: { type: 'monthly' } },
  { id: '2', name: 'Internet & TV Kabel', amount: 350000, platform: 'Bank Jago', dueDate: 5, recurrence: { type: 'monthly' } },
  { id: '3', name: 'Uang Kost / Kontrakan', amount: 1500000, platform: 'BCA', dueDate: 1, recurrence: { type: 'monthly' } },
  { id: '4', name: 'Langganan Streaming', amount: 150000, platform: 'Gopay', dueDate: 15, recurrence: { type: 'monthly' } },
];

export const useExpenses = () => {
  const [masterExpenses, setMasterExpenses] = useState<MasterExpense[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const { toast } = useToast();

  const currentMonthDate = useMemo(() => new Date(currentMonth + '-15'), [currentMonth]);
  const currentMonthNumber = useMemo(() => getMonth(currentMonthDate) + 1, [currentMonthDate]);


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

    // Only add to current monthly data if it's supposed to appear this month
    const shouldAppearThisMonth = recurrence.type === 'monthly' || (recurrence.type === 'specific' && recurrence.months.includes(currentMonthNumber));

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
  }, [masterExpenses, monthlyData, updateMasterAndSave, updateMonthlyAndSave, toast, currentMonthNumber]);

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
        description: `"${expense?.name}" tidak akan ditampilkan bulan ini.`,
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
        const shouldAppearThisMonth = recurrence.type === 'monthly' || (recurrence.type === 'specific' && recurrence.months.includes(currentMonthNumber));

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

  }, [masterExpenses, monthlyData, loading, updateMonthlyAndSave, currentMonthNumber]);

  const expenses: DisplayExpense[] = masterExpenses
    .filter(masterExp => {
        const { recurrence } = masterExp;
        if (recurrence.type === 'specific') {
            return recurrence.months.includes(currentMonthNumber);
        }
        return true; // 'monthly' expenses always included
    })
    .map(masterExp => {
      const monthlyState = monthlyData?.expenses.find(m => m.id === masterExp.id);
      return { ...masterExp, ...monthlyState };
    })
    .filter((exp): exp is DisplayExpense => exp.id !== undefined && exp.completed !== undefined && exp.skipped !== undefined)
    .sort((a, b) => a.dueDate - b.dueDate);

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

  const platformSummary: PlatformSummaryData = expenses
    .filter(exp => !exp.skipped)
    .reduce((acc, exp) => {
        const platform = exp.platform;
        if (!acc[platform]) {
            acc[platform] = 0;
        }
        acc[platform] += exp.amount;
        return acc;
    }, {} as PlatformSummaryData);


  return { expenses, summary, platformSummary, addExpense, updateExpense, toggleComplete, skipForMonth, deletePermanently, loading, currentMonth, navigateMonth };
};
