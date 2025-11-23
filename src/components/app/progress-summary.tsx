"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import type { ExpenseSummary } from "@/lib/types";

type ProgressSummaryProps = {
  summary: ExpenseSummary;
};

export function ProgressSummary({ summary }: ProgressSummaryProps) {
  return (
    <Card className="mb-6 shadow-md transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-baseline">
            <CardTitle className="text-lg font-headline">Ringkasan Bulan Ini</CardTitle>
            <span className="text-sm font-semibold text-primary">{summary.progress.toFixed(0)}% Selesai</span>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={summary.progress} className="h-3 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(summary.total)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Selesai</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(summary.completedAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sisa</p>
            <p className="text-lg font-bold text-amber-600">{formatCurrency(summary.remaining)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
