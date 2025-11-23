"use client";

import { useState } from 'react';
import type { DisplayExpense } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreVertical, EyeOff, Trash2, Pencil, CalendarDays } from "lucide-react";
import { Badge } from '@/components/ui/badge';

type ExpenseItemProps = {
  expense: DisplayExpense;
  onToggleComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (expense: DisplayExpense) => void;
};

export function ExpenseItem({ expense, onToggleComplete, onSkip, onDelete, onEdit }: ExpenseItemProps) {
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
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 items-center gap-x-4 gap-y-1">
            <div className='flex items-center gap-2'>
              <div className={cn("flex items-center justify-center h-8 w-8 rounded-md shrink-0", expense.completed ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}>
                  <div className='flex flex-col items-center leading-none'>
                      <span className='text-[0.6rem] font-medium'>TGL</span>
                      <span className='font-bold text-sm'>{expense.dueDate}</span>
                  </div>
              </div>
              <label 
                htmlFor={`expense-${expense.id}`}
                className={cn(
                  "font-medium cursor-pointer transition-all col-span-1",
                  expense.completed ? "line-through text-muted-foreground" : "text-foreground"
                )}
              >
                {expense.name}
              </label>
            </div>
            <div className="flex items-center gap-2 justify-start sm:justify-end col-span-1">
                <Badge variant="outline" className={cn(
                    "py-0.5 px-1.5 text-xs font-mono",
                    expense.completed && "border-dashed text-muted-foreground"
                )}>{expense.platform}</Badge>
                <p className={cn(
                "font-semibold transition-all w-28 text-right",
                expense.completed ? "line-through text-muted-foreground" : "text-foreground"
                )}>
                {formatCurrency(expense.amount)}
                </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Opsi</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(expense)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Ubah</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSkip(expense.id)}>
                <EyeOff className="mr-2 h-4 w-4" />
                <span>Lewati bulan ini</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
