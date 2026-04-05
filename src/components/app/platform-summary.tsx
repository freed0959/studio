"use client";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { PlatformSummaryData } from "@/lib/types";
import { Wallet, CheckCircle } from "lucide-react";

type PlatformSummaryProps = {
  platformSummary: PlatformSummaryData;
};

export function PlatformSummary({ platformSummary }: PlatformSummaryProps) {
  const platforms = Object.entries(platformSummary)
    .filter(([, summary]) => summary.amount > 0)
    .sort(([, a], [, b]) => b.amount - a.amount);

  return (
    <div className="h-full">
      <CardHeader className="pb-2 px-0">
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Alokasi Sisa Platform
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {platforms.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {platforms.map(([platform, summary]) => (
              <div key={platform} className="bg-secondary/20 p-2 rounded-lg">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{platform}</p>
                <p className="text-sm font-bold text-foreground">
                  {formatCurrency(summary.amount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-green-50/50 rounded-xl border border-dashed border-green-200">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-sm font-medium text-green-700">Semua Tagihan Lunas!</p>
            <p className="text-xs text-green-600/70">Tidak ada sisa pembayaran di platform mana pun.</p>
          </div>
        )}
      </CardContent>
    </div>
  );
}
