"use client";

import { useState, useEffect, useCallback } from 'react';
import { MasterExpense, MonthlyData, DisplayExpense, ExpenseSummary, MonthlyExpenseState } from '@/lib/types';
import { useToast } from './use-toast';

const MASTER_KEY = 'rutin-tracker-master';
const MONTHLY_KEY = 'rutin-tracker-monthly';

const initialMasterData: MasterExpense[] = [
  { id: '1', name: 'Listrik & Air', amount: 300000 },
  { id: '2', name: 'Internet & TV Kabel', amount: 350000 },
  { id: '3', name: 'Uang Kost / Kontrakan', amount: 1500000 },
  { id: '4', name: 'Langganan Streaming', amount: 150000 },
];

export const useExpenses = () => {
  const [masterExpenses, setMasterExpenses] = useState<MasterExpense[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedMaster = localStorage.getItem(MASTER_KEY);
      const initialMaster = storedMaster ? JSON.parse(storedMaster) : initialMasterData;
      setMasterExpenses(initialMaster);

      const storedMonthly = localStorage.getItem(MONTHLY_KEY);
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const monthly: MonthlyData | null = storedMonthly ? JSON.parse(storedMonthly) : null;

      if (monthly?.month === currentMonth) {
        setMonthlyData(monthly);
      } else {
        // New month or first load
        const newMonthlyData: MonthlyData = {
          month: currentMonth,
          expenses: initialMaster.map((exp: MasterExpense) => ({
            id: exp.id,
            completed: false,
            skipped: false,
          })),
        };
        setMonthlyData(newMonthlyData);
        localStorage.setItem(MONTHLY_KEY, JSON.stringify(newMonthlyData));
      }
      
      if (!storedMaster) {
        localStorage.setItem(MASTER_KEY, JSON.stringify(initialMasterData));
      }

    } catch (error) {
      console.error("Failed to access localStorage:", error);
      // Fallback for SSR or disabled localStorage
      setMasterExpenses(initialMasterData);
      setMonthlyData({
          month: new Date().toISOString().slice(0, 7),
          expenses: initialMasterData.map(exp => ({ id: exp.id, completed: false, skipped: false }))
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMasterAndSave = useCallback((newMaster: MasterExpense[]) => {
    setMasterExpenses(newMaster);
    localStorage.setItem(MASTER_KEY, JSON.stringify(newMaster));
  }, []);

  const updateMonthlyAndSave = useCallback((newMonthly: MonthlyData) => {
    setMonthlyData(newMonthly);
    localStorage.setItem(MONTHLY_KEY, JSON.stringify(newMonthly));
  }, []);

  const addExpense = useCallback((name: string, amount: number) => {
    const newExpense: MasterExpense = { id: Date.now().toString(), name, amount };
    const newMaster = [...masterExpenses, newExpense];
    updateMasterAndSave(newMaster);

    if (monthlyData) {
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
  }, [masterExpenses, monthlyData, updateMasterAndSave, updateMonthlyAndSave, toast]);

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

  const expenses: DisplayExpense[] = masterExpenses
    .map(masterExp => {
      const monthlyState = monthlyData?.expenses.find(m => m.id === masterExp.id);
      return { ...masterExp, ...monthlyState };
    })
    .filter((exp): exp is DisplayExpense => exp.completed !== undefined && exp.skipped !== undefined);

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

  return { expenses, summary, addExpense, toggleComplete, skipForMonth, deletePermanently, loading };
};
