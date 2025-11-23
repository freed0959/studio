"use client";

import { Button } from "@/components/ui/button";
import { Plus, Repeat } from "lucide-react";

type AppHeaderProps = {
  onAdd: () => void;
};

export function AppHeader({ onAdd }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between py-4 mb-2">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <Repeat className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-headline text-foreground tracking-tight">
          Rutin Tracker
        </h1>
      </div>
      <Button onClick={onAdd} variant="default" className="shadow-sm">
        <Plus className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Tambah</span>
      </Button>
    </header>
  );
}
