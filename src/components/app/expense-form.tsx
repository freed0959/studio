"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
  FormDescription,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import type { DisplayExpense, Platform, Recurrence } from "@/lib/types";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";

const months = [
    { id: 1, label: 'Jan' }, { id: 2, label: 'Feb' }, { id: 3, label: 'Mar' },
    { id: 4, label: 'Apr' }, { id: 5, label: 'Mei' }, { id: 6, label: 'Jun' },
    { id: 7, label: 'Jul' }, { id: 8, label: 'Agu' }, { id: 9, label: 'Sep' },
    { id: 10, label: 'Okt' }, { id: 11, label: 'Nov' }, { id: 12, label: 'Des' }
];

const formSchema = (platforms: string[]) => z.object({
  name: z.string().min(2, {
    message: "Nama pengeluaran minimal 2 karakter.",
  }),
  amount: z.string().refine(val => parseCurrencyInput(val) > 0, {
    message: "Jumlah harus lebih dari 0.",
  }),
  platform: z.string({
    required_error: "Platform harus dipilih.",
  }).refine(val => platforms.includes(val), {
    message: "Platform tidak valid."
  }),
  dueDate: z.coerce.number().min(1, "Tanggal harus antara 1-31").max(31, "Tanggal harus antara 1-31"),
  recurrenceType: z.enum(['monthly', 'specific']),
  specificMonths: z.array(z.number()).optional(),
}).refine(data => {
    if (data.recurrenceType === 'specific') {
        return data.specificMonths && data.specificMonths.length > 0;
    }
    return true;
}, {
    message: "Pilih minimal satu bulan.",
    path: ["specificMonths"],
});


type ExpenseFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  mode: 'add' | 'edit';
  expense?: DisplayExpense;
  platforms: Platform[];
  onAddExpense: (name: string, amount: number, platform: string, dueDate: number, recurrence: Recurrence) => void;
  onEditExpense: (id: string, name: string, amount: number, platform: string, dueDate: number, recurrence: Recurrence) => void;
};

export function ExpenseForm({
  isOpen,
  onOpenChange,
  mode,
  expense,
  platforms,
  onAddExpense,
  onEditExpense,
}: ExpenseFormProps) {
  const platformNames = platforms.map(p => p.name);
  const currentFormSchema = formSchema(platformNames);

  const form = useForm<z.infer<typeof currentFormSchema>>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      name: "",
      amount: "0",
      dueDate: new Date().getDate(),
      recurrenceType: 'monthly',
      specificMonths: [],
    },
  });
  
  const recurrenceType = form.watch('recurrenceType');

  useEffect(() => {
    if (isOpen && mode === 'edit' && expense) {
      form.reset({
        name: expense.name,
        amount: formatCurrencyInput(expense.amount),
        platform: expense.platform,
        dueDate: expense.dueDate,
        recurrenceType: expense.recurrence.type,
        specificMonths: expense.recurrence.type === 'specific' ? expense.recurrence.months : [],
      });
    } else if (isOpen && mode === 'add') {
      form.reset({ name: "", amount: "0", platform: undefined, dueDate: new Date().getDate(), recurrenceType: 'monthly', specificMonths: [] });
    }
  }, [isOpen, mode, expense, form]);

  function onSubmit(values: z.infer<typeof currentFormSchema>) {
    const amount = parseCurrencyInput(values.amount);
    const recurrence: Recurrence = values.recurrenceType === 'monthly'
      ? { type: 'monthly' }
      : { type: 'specific', months: values.specificMonths || [] };

    if (mode === 'add') {
      onAddExpense(values.name, amount, values.platform, values.dueDate, recurrence);
    } else if (mode === 'edit' && expense) {
      onEditExpense(expense.id, values.name, amount, values.platform, values.dueDate, recurrence);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Tambah Pengeluaran' : 'Ubah Pengeluaran'}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Pengeluaran ini akan muncul setiap bulan.' : `Mengubah detail untuk ${expense?.name}.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="max-h-[70vh] pr-5">
              <div className="space-y-4 py-4">
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
                <div className="grid grid-cols-2 gap-4">
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
                      name="dueDate"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Tgl Bayar</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="31" placeholder="1-31" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                </div>
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
                          {platforms.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="recurrenceType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Pengulangan</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="monthly" />
                            </FormControl>
                            <FormLabel className="font-normal">Tiap Bulan</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="specific" />
                            </FormControl>
                            <FormLabel className="font-normal">Bulan Tertentu</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {recurrenceType === 'specific' && (
                  <FormField
                    control={form.control}
                    name="specificMonths"
                    render={() => (
                      <FormItem>
                        <div className="mb-2">
                            <FormLabel>Pilih Bulan</FormLabel>
                            <FormDescription>
                                Pengeluaran ini hanya akan muncul di bulan yang dipilih.
                            </FormDescription>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                        {months.map((month) => (
                            <FormField
                            key={month.id}
                            control={form.control}
                            name="specificMonths"
                            render={({ field }) => {
                                return (
                                <FormItem
                                    key={month.id}
                                    className="flex flex-row items-center space-x-2 space-y-0"
                                >
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(month.id)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...(field.value || []), month.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== month.id
                                                )
                                            )
                                        }}
                                    />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                    {month.label}
                                    </FormLabel>
                                </FormItem>
                                )
                            }}
                            />
                        ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4 border-t">
              <Button type="submit" variant="default">Simpan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
