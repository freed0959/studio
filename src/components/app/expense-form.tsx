"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import type { DisplayExpense } from "@/lib/types";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/utils";

const platforms = ["Bibit", "Bank Jago", "Dana", "Gopay", "BCA", "Cash"] as const;

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nama pengeluaran minimal 2 karakter.",
  }),
  amount: z.string().refine(val => parseCurrencyInput(val) > 0, {
    message: "Jumlah harus lebih dari 0.",
  }),
  platform: z.enum(platforms, {
    required_error: "Platform harus dipilih.",
  }),
});

type ExpenseFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  mode: 'add' | 'edit';
  expense?: DisplayExpense;
  onAddExpense: (name: string, amount: number, platform: string) => void;
  onEditExpense: (id: string, name: string, amount: number, platform: string) => void;
};

export function ExpenseForm({
  isOpen,
  onOpenChange,
  mode,
  expense,
  onAddExpense,
  onEditExpense,
}: ExpenseFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: "0",
    },
  });

  useEffect(() => {
    if (isOpen && mode === 'edit' && expense) {
      form.reset({
        name: expense.name,
        amount: formatCurrencyInput(expense.amount),
        platform: expense.platform as typeof platforms[number],
      });
    } else if (isOpen && mode === 'add') {
      form.reset({ name: "", amount: "0", platform: undefined });
    }
  }, [isOpen, mode, expense, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const amount = parseCurrencyInput(values.amount);
    if (mode === 'add') {
      onAddExpense(values.name, amount, values.platform);
    } else if (mode === 'edit' && expense) {
      onEditExpense(expense.id, values.name, amount, values.platform);
    }
    onOpenChange(false);
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatCurrencyInput(value);
    form.setValue('amount', formattedValue);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Tambah Pengeluaran' : 'Ubah Pengeluaran'}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Pengeluaran ini akan muncul setiap bulan.' : `Mengubah detail untuk ${expense?.name}.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Pengeluaran</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Internet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah (Rp)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Contoh: 350.000" 
                        {...field} 
                        onChange={handleAmountChange}
                        inputMode="numeric"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih platform pembayaran" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" variant="default">Simpan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
