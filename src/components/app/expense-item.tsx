"use client";

import { useState } from 'react';
import type { DisplayExpense } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreVertical, EyeOff, Trash2 } from "lucide-react";

type ExpenseItemProps = {
  expense: DisplayExpense;
  onToggleComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onDelete: (id: string) => void;
};

export function ExpenseItem({ expense, onToggleComplete, onSkip, onDelete }: ExpenseItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Card className={cn(
          "transition-all duration-300",
          expense.completed ? "bg-secondary/50 border-transparent shadow-sm" : "bg-card shadow-sm hover:shadow-md"
      )}>
        <CardContent className="p-3 flex items-center gap-3">
          <Checkbox
            id={`expense-${expense.id}`}
            checked={expense.completed}
            onCheckedChange={() => onToggleComplete(expense.id)}
            className={cn(
              "h-6 w-6 rounded-full transition-all",
              expense.completed ? "border-primary bg-primary text-primary-foreground" : ""
            )}
            aria-label={`Mark ${expense.name} as ${expense.completed ? 'not completed' : 'completed'}`}
          />
          <div className="flex-1 grid grid-cols-2 items-center gap-2">
            <label 
              htmlFor={`expense-${expense.id}`}
              className={cn(
                "font-medium cursor-pointer transition-all",
                expense.completed ? "line-through text-muted-foreground" : "text-foreground"
              )}
            >
              {expense.name}
            </label>
            <p className={cn(
              "text-right font-semibold transition-all",
              expense.completed ? "line-through text-muted-foreground" : "text-foreground"
            )}>
              {formatCurrency(expense.amount)}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Opsi</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSkip(expense.id)}>
                <EyeOff className="mr-2 h-4 w-4" />
                <span>Lewati bulan ini</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Hapus permanen</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus <strong>{expense.name}</strong> secara permanen. Pengeluaran ini tidak akan muncul lagi di bulan-bulan berikutnya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(expense.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Ya, Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
