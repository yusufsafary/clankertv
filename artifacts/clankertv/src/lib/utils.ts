import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "$0.00";
  
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0";
  
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

export function truncateAddress(address: string | null | undefined): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTimeAgo(dateString: string | null | undefined): string {
  if (!dateString) return "";
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (e) {
    return "";
  }
}

export function isTokenNew(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  try {
    const diff = Date.now() - new Date(dateString).getTime();
    return diff < 30 * 60 * 1000; // < 30 mins
  } catch (e) {
    return false;
  }
}

export function isTokenRecent(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  try {
    const diff = Date.now() - new Date(dateString).getTime();
    return diff < 60 * 60 * 1000; // < 1 hour
  } catch (e) {
    return false;
  }
}
