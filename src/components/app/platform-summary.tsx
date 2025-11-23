"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { PlatformSummaryData } from "@/lib/types";
import { Wallet } from "lucide-react";

type PlatformSummaryProps = {
  platformSummary: PlatformSummaryData;
};

export function PlatformSummary({ platformSummary }: PlatformSummaryProps) {
  const platforms = Object.entries(platformSummary).sort(([, a], [, b]) => b - a);

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
          {platforms.map(([platform, amount]) => (
            <div key={platform}>
              <p className="text-sm text-muted-foreground">{platform}</p>
              <p className="text-md font-bold text-foreground">
                {formatCurrency(amount)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
