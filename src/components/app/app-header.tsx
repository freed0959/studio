"use client";

import { Button } from "@/components/ui/button";
import { Plus, Home, ChevronLeft, ChevronRight, Settings, Download } from "lucide-react";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { getCycleDateRange } from "@/lib/utils";

type AppHeaderProps = {
  onOpenSettings: () => void;
  currentMonth: string;
  onNavigate: (direction: 'prev' | 'next') => void;
  onExport: () => void;
};

export function AppHeader({ onOpenSettings, currentMonth, onNavigate, onExport }: AppHeaderProps) {
    const { start, end } = getCycleDateRange(currentMonth);
    const formattedDate = `25 ${format(start, 'MMM', { locale: id })} - 24 ${format(end, 'MMM yyyy', { locale: id })}`;

  const isCurrentMonth = currentMonth === new Date().toISOString().slice(0, 7);

  return (
    <header className="flex items-center justify-between py-4 mb-2">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <Home className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-headline text-foreground tracking-tight">
            Biaya RT
          </h1>
          <div className="flex items-center gap-1">
             <Button onClick={() => onNavigate('prev')} variant="ghost" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-5 w-5" />
             </Button>
             <p className="text-xs sm:text-sm text-muted-foreground capitalize w-40 text-center">{formattedDate}</p>
             <Button onClick={() => onNavigate('next')} variant="ghost" size="icon" className="h-7 w-7" disabled={isCurrentMonth}>
                <ChevronRight className="h-5 w-5" />
             </Button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button onClick={onExport} variant="ghost" size="icon" className="shrink-0">
          <Download className="h-5 w-5" />
          <span className="sr-only">Ekspor</span>
        </Button>
        <Button onClick={onOpenSettings} variant="ghost" size="icon" className="shrink-0">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Pengaturan</span>
        </Button>
      </div>
    </header>
  );
}
