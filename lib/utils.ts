import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Returns the current date in PST (America/Los_Angeles) as 'YYYY-MM-DD'
export function getPSTDateString(date = new Date()): string {
  const pst = new Date(date.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  return pst.toISOString().slice(0, 10);
}

// Returns tomorrow's date in PST (America/Los_Angeles) as 'YYYY-MM-DD'
export function getPSTTomorrowDateString(date = new Date()): string {
  const pst = new Date(date.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  pst.setDate(pst.getDate() + 1);
  return pst.toISOString().slice(0, 10);
}

// Formats a date string or Date object for display
// e.g., "May 11, 2025, 7:00 PM"
export function formatDisplayDateTime(dateInput: string | Date): string {
  const date = new Date(dateInput);
  // Using en-US for a common, readable format. 
  // Consider if a specific timezone is needed for display, otherwise it uses user's local.
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
