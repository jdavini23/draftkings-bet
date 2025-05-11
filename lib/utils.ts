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
