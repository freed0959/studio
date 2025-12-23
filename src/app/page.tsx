"use client";

import { useState } from 'react';
import Papa from 'papaparse';
import { useExpenses } from '@/hooks/use-expenses';
import { usePlatforms } from '@/hooks/use-platforms';
import { AppHeader } from '@/components/app/app-header';
import { ProgressSummary } from '@/components/app/progress-summary';
import { ExpenseList } from '@/components/app/expense-list';
import { ExpenseForm } from '@/components/app/expense-form';
import { PlatformSettings } from '@/components/app/platform-settings';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlatformSummary } from '@/components/app/platform-summary';
import type { DisplayExpense, SortOption, MasterExpense, Platform } from '@/lib/types';
import { getCycleDateRange } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const MASTER_KEY = 'rutin-tracker-master';
const PLATFORMS_KEY = 'rutin-tracker-platforms';

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
    sortExpenses,
    sortOption,
  } = useExpenses();
  
  const { platforms, addPlatform, updatePlatform, deletePlatform, loading: platformsLoading } = usePlatforms();
  
  const [formState, setFormState] = useState<{isOpen: boolean, mode: 'add' | 'edit', expense?: DisplayExpense}>({ isOpen: false, mode: 'add' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();

  const handleOpenAdd = () => {
    setFormState({ isOpen: true, mode: 'add' });
  };

  const handleOpenEdit = (expense: DisplayExpense) => {
    setFormState({ isOpen: true, mode: 'edit', expense });
  };

  const handleCloseForm = () => {
    setFormState({ isOpen: false, mode: 'add' });
  }

  const handleExport = () => {
    const { start } = getCycleDateRange(currentMonth);

    const dataToExport = expenses.map(e => ({
      'Nama Pengeluaran': e.name,
      'Jumlah': e.amount,
      'Platform': e.platform,
      'Tanggal Bayar': e.dueDate,
      'Status': e.completed ? 'Selesai' : (e.skipped ? 'Dilewati' : 'Belum Selesai'),
      'Berulang': e.recurrence.type === 'monthly' ? 'Tiap Bulan' : `Bulan Tertentu (${e.recurrence.months.join(', ')})`,
    }));

    const csv = Papa.unparse(dataToExport, {
      header: true,
      quotes: true,
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Biaya_RT_${format(start, 'yyyy-MM')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleExportSettings = () => {
    try {
      const masterData = localStorage.getItem(MASTER_KEY);
      const platformData = localStorage.getItem(PLATFORMS_KEY);

      if (!masterData || !platformData) {
        toast({
          variant: "destructive",
          title: "Gagal Ekspor",
          description: "Tidak ada data untuk diekspor."
        });
        return;
      }

      const settings = {
        masterExpenses: JSON.parse(masterData),
        platforms: JSON.parse(platformData),
        exportDate: new Date().toISOString(),
      };

      const jsonString = JSON.stringify(settings, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "biaya-rt-settings.json");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Ekspor Berhasil",
        description: "File setelan Anda telah diunduh."
      });

    } catch(error) {
      console.error("Export failed", error);
      toast({
          variant: "destructive",
          title: "Ekspor Gagal",
          description: "Terjadi kesalahan saat mengekspor data."
      });
    }
  }

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File could not be read");

        const settings = JSON.parse(text);

        // Basic validation
        if (!settings.masterExpenses || !settings.platforms) {
          throw new Error("Invalid settings file format.");
        }
        
        // More specific validation could go here (e.g. using zod)
        // For now, we trust the structure.

        localStorage.setItem(MASTER_KEY, JSON.stringify(settings.masterExpenses));
        localStorage.setItem(PLATFORMS_KEY, JSON.stringify(settings.platforms));

        toast({
          title: "Impor Berhasil",
          description: "Setelan Anda telah dipulihkan. Aplikasi akan dimuat ulang.",
        });

        // Reload the page to apply changes
        setTimeout(() => {
            window.location.reload();
        }, 1500);

      } catch (error) {
        console.error("Import failed", error);
        toast({
          variant: "destructive",
          title: "Impor Gagal",
          description: error instanceof Error ? error.message : "File yang dipilih tidak valid.",
        });
      } finally {
        // Reset file input
        if(event.target) {
            event.target.value = '';
        }
      }
    };
    reader.readAsText(file);
  }

  if (loading || platformsLoading) {
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
      <main className="container mx-auto max-w-2xl p-4 sm:p-6 pb-24">
        <AppHeader 
          onOpenSettings={() => setIsSettingsOpen(true)}
          currentMonth={currentMonth} 
          onNavigate={navigateMonth}
          onExport={handleExport}
        />
        
        <ExpenseForm 
          isOpen={formState.isOpen} 
          onOpenChange={handleCloseForm}
          mode={formState.mode}
          expense={formState.expense}
          platforms={platforms}
          onAddExpense={(name, amount, platform, dueDate, recurrence) => {
            addExpense(name, amount, platform, dueDate, recurrence);
            handleCloseForm();
          }}
          onEditExpense={(id, name, amount, platform, dueDate, recurrence) => {
            updateExpense(id, { name, amount, platform, dueDate, recurrence });
            handleCloseForm();
          }}
        />

        <PlatformSettings
          isOpen={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          platforms={platforms}
          onAddPlatform={addPlatform}
          onUpdatePlatform={updatePlatform}
          onDeletePlatform={deletePlatform}
          onExportSettings={handleExportSettings}
          onImportSettings={handleImportSettings}
        />

        {expenses.length > 0 ? (
          <>
            <ProgressSummary summary={summary} />
            <PlatformSummary platformSummary={platformSummary} />
            <ExpenseList 
              expenses={expenses}
              currentMonth={currentMonth}
              sortOption={sortOption}
              onSortChange={sortExpenses}
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
                <p className="text-muted-foreground">Tidak ada data pengeluaran untuk periode ini. Tambahkan yang pertama!</p>
                <Button onClick={handleOpenAdd} variant="default" size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Tambah Pengeluaran
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Button
        onClick={handleOpenAdd}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Tambah Pengeluaran</span>
      </Button>

      <footer className="text-center p-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Biaya RT. Dibuat dengan ❤️.</p>
      </footer>
    </div>
  );
}