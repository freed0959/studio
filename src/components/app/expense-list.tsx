"use client";

import type { DisplayExpense } from "@/lib/types";
import { ExpenseItem } from "./expense-item";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ListTodo } from "lucide-react";

type ExpenseListProps = {
  expenses: DisplayExpense[];
  currentMonth: string;
  onToggleComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (expense: DisplayExpense) => void;
};

export function ExpenseList({ expenses, currentMonth, onToggleComplete, onSkip, onDelete, onEdit }: ExpenseListProps) {
  const visibleExpenses = expenses.filter(exp => !exp.skipped);
  const todoExpenses = visibleExpenses.filter(exp => !exp.completed);
  const completedExpenses = visibleExpenses.filter(exp => exp.completed);

  return (
    <div className="mt-6 space-y-4">
      {todoExpenses.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold font-headline mb-3 text-muted-foreground flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Belum Selesai
          </h2>
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
