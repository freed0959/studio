"use client";

import { Button } from "@/components/ui/button";
import { Plus, Repeat } from "lucide-react";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

type AppHeaderProps = {
  onAdd: () => void;
  currentMonth: string;
};

export function AppHeader({ onAdd, currentMonth }: AppHeaderProps) {
  const formattedDate = currentMonth 
    ? format(new Date(currentMonth + '-02'), "MMMM yyyy", { locale: id })
    : 'Bulan Ini';

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
          <p className="text-sm sm:text-base text-muted-foreground capitalize">{formattedDate}</p>
        </div>
      </div>
      <Button onClick={onAdd} variant="default" className="shadow-sm">
        <Plus className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Tambah</span>
      </Button>
    </header>
  );
}
