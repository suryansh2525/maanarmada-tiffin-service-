import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { todayDateString } from "@/lib/menu";
import type { MealSlot, Order, OrderItem } from "@/types/database";

function asNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value);
}

function mapOrder(row: Record<string, unknown>): Order {
  const items = (row.order_items as OrderItem[] | undefined)?.map((item) => ({
    ...item,
    quantity: asNumber(item.quantity),
    unit_price: asNumber(item.unit_price),
  }));

  return {
    ...(row as unknown as Order),
    amount: asNumber(row.amount),
    order_number: asNumber(row.order_number),
    order_items: items,
  };
}

const ORDER_SELECT = "*, order_items(*)";

export async function getOrderById(id: string): Promise<Order | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapOrder(data as Record<string, unknown>);
}

export async function getPendingVerificationOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("status", "payment_claimed")
    .in("order_type", ["one_off", "subscription_cycle"])
    .order("claimed_at", { ascending: true });

  if (error) {
    console.error("pending orders error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapOrder(row as Record<string, unknown>));
}

export async function getTodaysKitchenOrders(date = todayDateString()): Promise<Order[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("delivery_date", date)
    .in("order_type", ["one_off", "subscription_delivery"])
    .in("status", ["confirmed", "done", "closed"])
    .order("created_at", { ascending: true });

  if (error) {
    console.error("today orders error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapOrder(row as Record<string, unknown>));
}

export async function getPendingCount(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "payment_claimed")
    .in("order_type", ["one_off", "subscription_cycle"]);

  if (error) return 0;
  return count ?? 0;
}

export type PrepRow = {
  name: string;
  meal_slot: MealSlot;
  quantity: number;
};

export function prepCountFromOrders(orders: Order[]): PrepRow[] {
  const map = new Map<string, PrepRow>();

  for (const order of orders) {
    for (const item of order.order_items ?? []) {
      const key = `${item.meal_slot}:${item.name}`;
      const existing = map.get(key);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        map.set(key, {
          name: item.name,
          meal_slot: item.meal_slot,
          quantity: item.quantity,
        });
      }
    }
  }

  return [...map.values()].sort((a, b) =>
    a.meal_slot === b.meal_slot
      ? a.name.localeCompare(b.name)
      : a.meal_slot.localeCompare(b.meal_slot),
  );
}
