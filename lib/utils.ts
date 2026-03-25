import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const goldGradient = "bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500";
export const goldTextGradient = "bg-gradient-to-r from-gold-600 via-gold-400 to-gold-700 bg-clip-text text-transparent";
