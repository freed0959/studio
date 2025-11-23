import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { subMonths, startOfMonth, endOfMonth, setDate } from 'date-fns';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyInput = (value: string | number): string => {
  const num = typeof value === 'string' ? value.replace(/[^0-9]/g, '') : value.toString();
  if (num === '' || num === '0') return '0';
  return new Intl.NumberFormat('id-ID').format(Number(num));
};

export const parseCurrencyInput = (value: string): number => {
  return Number(value.replace(/[^0-9]/g, ''));
};

export const getCycleDateRange = (currentMonthYYYYMM: string) => {
  const currentMonthDate = new Date(currentMonthYYYYMM + '-25');
  
  const start = setDate(subMonths(currentMonthDate, 1), 25);
  const end = setDate(currentMonthDate, 24);

  return { start, end };
};
