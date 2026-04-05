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
  // Hanya tampilkan platform yang masih memiliki sisa pembayaran (amount > 0)
  const platforms = Object.entries(platformSummary)
    .filter(([, summary]) => summary.amount > 0)
    .sort(([, a], [, b]) => b.amount - a.amount);

  if (platforms.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 shadow-sm transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Alokasi Sisa Platform
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
          {platforms.map(([platform, summary]) => (
            <div key={platform}>
              <p className="text-sm text-muted-foreground">{platform}</p>
              <p className="text-md font-bold text-foreground">
                {formatCurrency(summary.amount)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}