"use client";

import { useState } from 'react';
import { useExpenses } from '@/hooks/use-expenses';
import { AppHeader } from '@/components/app/app-header';
import { ProgressSummary } from '@/components/app/progress-summary';
import { ExpenseList } from '@/components/app/expense-list';
import { ExpenseForm } from '@/components/app/expense-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlatformSummary } from '@/components/app/platform-summary';
import type { DisplayExpense } from '@/lib/types';

export default function Home() {
  const { 
    expenses, 
    summary,
    platformSummary,
    addExpense,
    updateExpense,
    toggleComplete, 
    skipForMonth, 
    deletePermanently,
    loading,
    currentMonth,
    navigateMonth,
  } = useExpenses();
  
  const [formState, setFormState] = useState<{isOpen: boolean, mode: 'add' | 'edit', expense?: DisplayExpense}>({ isOpen: false, mode: 'add' });

  const handleOpenAdd = () => {
    setFormState({ isOpen: true, mode: 'add' });
  };

  const handleOpenEdit = (expense: DisplayExpense) => {
    setFormState({ isOpen: true, mode: 'edit', expense });
  };

  const handleCloseForm = () => {
    setFormState({ isOpen: false, mode: 'add' });
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background">
        <main className="container mx-auto max-w-2xl p-4">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-28 w-full mb-6" />
          <Skeleton className="h-40 w-full mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <main className="container mx-auto max-w-2xl p-4 sm:p-6">
        <AppHeader 
          onAdd={handleOpenAdd} 
          currentMonth={currentMonth} 
          onNavigate={navigateMonth} 
        />
        
        <ExpenseForm 
          isOpen={formState.isOpen} 
          onOpenChange={handleCloseForm}
          mode={formState.mode}
          expense={formState.expense}
          onAddExpense={(name, amount, platform) => {
            addExpense(name, amount, platform);
            handleCloseForm();
          }}
          onEditExpense={(id, name, amount, platform) => {
            updateExpense(id, { name, amount, platform });
            handleCloseForm();
          }}
        />

        {expenses.length > 0 ? (
          <>
            <ProgressSummary summary={summary} />
            <PlatformSummary platformSummary={platformSummary} />
            <ExpenseList 
              expenses={expenses}
              onToggleComplete={toggleComplete}
              onSkip={skipForMonth}
              onDelete={deletePermanently}
              onEdit={handleOpenEdit}
            />
          </>
        ) : (
          <Card className="mt-6 border-dashed border-2 hover:border-primary transition-colors">
            <CardContent className="p-10 text-center">
              <div className="flex flex-col items-center gap-4">
                <h3 className="font-headline text-xl font-semibold text-foreground">Mulai Lacak Pengeluaran</h3>
                <p className="text-muted-foreground">Tidak ada data pengeluaran untuk bulan ini. Tambahkan yang pertama!</p>
                <Button onClick={handleOpenAdd} variant="default" size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Tambah Pengeluaran
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Rutin Tracker. Dibuat dengan ❤️.</p>
      </footer>
    </div>
  );
}
