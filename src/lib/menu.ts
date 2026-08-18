import type { MealSlot, ResolvedMenuRow } from "@/types/database";
import { MEAL_SLOTS } from "@/types/database";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function groupMenuBySlot(rows: ResolvedMenuRow[]) {
  const grouped: Record<MealSlot, ResolvedMenuRow[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
  };

  for (const row of rows) {
    grouped[row.meal_slot].push(row);
  }

  return grouped;
}

export function todayDateString(): string {
  return toDateString(new Date());
}

export function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function shiftDate(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T12:00:00");
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

export function timeInputValue(cutoff: string): string {
  return cutoff.slice(0, 5);
}

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function emptySlotMap(): Record<MealSlot, ResolvedMenuRow[]> {
  return {
    breakfast: [],
    lunch: [],
    dinner: [],
  };
}
