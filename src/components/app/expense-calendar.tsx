"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { getCycleDateRange, cn } from "@/lib/utils";
import { isSameDay, startOfDay, addDays, eachDayOfInterval } from 'date-fns';
import type { DisplayExpense } from '@/lib/types';

type ExpenseCalendarProps = {
  expenses: DisplayExpense[];
  currentMonth: string;
};

export function ExpenseCalendar({ expenses, currentMonth }: ExpenseCalendarProps) {
  const { start, end } = useMemo(() => getCycleDateRange(currentMonth), [currentMonth]);
  
  const days = useMemo(() => {
    return eachDayOfInterval({ start, end });
  }, [start, end]);

  const today = startOfDay(new Date());

  const getDayStatus = (day: Date) => {
    const dayOfMonth = day.getDate();
    // Check if the expense belongs to this cycle's specific month
    // Note: expenses array is already filtered by recurrence for current cycle in useExpenses
    const dayExpenses = expenses.filter(e => e.dueDate === dayOfMonth && !e.skipped);
    
    if (dayExpenses.length === 0) return null;
    
    const allDone = dayExpenses.every(e => e.completed);
    if (allDone) return 'completed';
    
    const isUrgent = isSameDay(day, today) || isSameDay(day, addDays(today, 1));
    if (isUrgent) return 'urgent';
    
    return 'pending';
  };

  return (
    <Card className="h-full border-none shadow-none bg-transparent">
      <CardHeader className="pb-2 px-0">
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Kalender Jatuh Tempo
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="grid grid-cols-7 gap-1 text-center">
          {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((d, i) => (
            <div key={i} className="text-[10px] font-bold text-muted-foreground py-1">{d}</div>
          ))}
          {days.map((day, i) => {
            const status = getDayStatus(day);
            const isToday = isSameDay(day, today);
            
            return (
              <div 
                key={i} 
                className={cn(
                  "aspect-square flex flex-col items-center justify-center rounded-md text-[10px] relative transition-all border",
                  isToday ? "border-primary/50 shadow-sm" : "border-transparent",
                  status === 'completed' ? "bg-green-100/50 text-green-700" :
                  status === 'urgent' ? "bg-destructive/10 text-destructive font-bold" :
                  status === 'pending' ? "bg-primary/10 text-primary" : "text-muted-foreground/40"
                )}
              >
                <span className={cn(isToday && "underline decoration-primary decoration-2")}>
                  {day.getDate()}
                </span>
                {status && (
                  <div className={cn(
                    "absolute bottom-1 w-1 h-1 rounded-full",
                    status === 'completed' ? "bg-green-600" :
                    status === 'urgent' ? "bg-destructive" : "bg-primary"
                  )} />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground justify-center">
            <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <span>Segera</span>
            </div>
            <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Terjadwal</span>
            </div>
            <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-600" />
                <span>Lunas</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
