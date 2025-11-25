"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { PlatformSummaryData } from "@/lib/types";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";


type PlatformSummaryProps = {
  platformSummary: PlatformSummaryData;
};

export function PlatformSummary({ platformSummary }: PlatformSummaryProps) {
  const platforms = Object.entries(platformSummary).sort(([, a], [, b]) => b.amount - a.amount);

  if (platforms.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 shadow-sm transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Alokasi Platform
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
          {platforms.map(([platform, summary]) => (
            <div key={platform}>
              <p className={cn(
                "text-sm text-muted-foreground transition-all",
                summary.allCompleted && "line-through"
              )}>{platform}</p>
              <p className={cn(
                "text-md font-bold text-foreground transition-all",
                summary.allCompleted && "line-through text-muted-foreground"
              )}>
                {formatCurrency(summary.amount)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
