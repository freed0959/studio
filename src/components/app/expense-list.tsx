"use client";

import type { DisplayExpense, SortOption } from "@/lib/types";
import { ExpenseItem } from "./expense-item";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ListTodo, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";

type ExpenseListProps = {
  expenses: DisplayExpense[];
  currentMonth: string;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  onToggleComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (expense: DisplayExpense) => void;
};

const sortLabels: Record<SortOption, string> = {
  dueDate: 'Tanggal',
  name: 'Nama',
  amount: 'Jumlah',
  platform: 'Platform'
};


export function ExpenseList({ expenses, currentMonth, sortOption, onSortChange, onToggleComplete, onSkip, onDelete, onEdit }: ExpenseListProps) {
  const visibleExpenses = expenses.filter(exp => !exp.skipped);
  const todoExpenses = visibleExpenses.filter(exp => !exp.completed);
  const completedExpenses = visibleExpenses.filter(exp => exp.completed);

  return (
    <div className="mt-6 space-y-4">
      {todoExpenses.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold font-headline text-muted-foreground flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              Belum Selesai
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Urutkan: {sortLabels[sortOption]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={sortOption} onValueChange={(value) => onSortChange(value as SortOption)}>
                  <DropdownMenuRadioItem value="dueDate">Tanggal</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name">Nama</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="amount">Jumlah</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="platform">Platform</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2">
            {todoExpenses.map(expense => (
              <ExpenseItem 
                key={expense.id}
                expense={expense}
                currentMonth={currentMonth}
                onToggleComplete={onToggleComplete}
                onSkip={onSkip}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        </div>
      )}

      {completedExpenses.length > 0 && (
         <div>
            {todoExpenses.length > 0 && <Separator className="my-6" />}
            <h2 className="text-lg font-semibold font-headline mb-3 text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600"/>
              Selesai
            </h2>
            <div className="space-y-2">
                {completedExpenses.map(expense => (
                <ExpenseItem 
                    key={expense.id}
                    expense={expense}
                    currentMonth={currentMonth}
                    onToggleComplete={onToggleComplete}
                    onSkip={onSkip}
                    onDelete={onDelete}
                    onEdit={onEdit}
                />
                ))}
            </div>
         </div>
      )}
    </div>
  );
}
