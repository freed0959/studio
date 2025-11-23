"use client";

import { Button } from "@/components/ui/button";
import { Plus, Repeat, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

type AppHeaderProps = {
  onAdd: () => void;
  currentMonth: string;
  onNavigate: (direction: 'prev' | 'next') => void;
};

export function AppHeader({ onAdd, currentMonth, onNavigate }: AppHeaderProps) {
  const formattedDate = currentMonth 
    ? format(new Date(currentMonth + '-15'), "MMMM yyyy", { locale: id })
    : 'Bulan Ini';
    
  const isCurrentMonth = currentMonth === new Date().toISOString().slice(0, 7);

  return (
    <header className="flex items-center justify-between py-4 mb-2">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <Repeat className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-headline text-foreground tracking-tight">
            Rutin Tracker
          </h1>
          <div className="flex items-center gap-1">
             <Button onClick={() => onNavigate('prev')} variant="ghost" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-5 w-5" />
             </Button>
             <p className="text-sm sm:text-base text-muted-foreground capitalize w-32 text-center">{formattedDate}</p>
             <Button onClick={() => onNavigate('next')} variant="ghost" size="icon" className="h-7 w-7" disabled={isCurrentMonth}>
                <ChevronRight className="h-5 w-5" />
             </Button>
          </div>
        </div>
      </div>
      <Button onClick={onAdd} variant="default" className="shadow-sm">
        <Plus className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Tambah</span>
      </Button>
    </header>
  );
}
