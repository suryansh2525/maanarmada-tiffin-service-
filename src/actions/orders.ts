"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { todayDateString } from "@/lib/menu";
import type { MealSlot } from "@/types/database";

export type CartLineInput = {
  menuItemId: string;
  name: string;
  mealSlot: MealSlot;
  quantity: number;
  unitPrice: number;
};

function revalidateOrders() {
  revalidatePath("/admin/pending");
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function placeOneOffOrder(input: {
  customerName: string;
  customerPhone: string;
  items: CartLineInput[];
}) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not connected yet." };
  }

  const name = input.customerName.trim();
  const phone = input.customerPhone.replace(/\s+/g, "");
  const items = input.items.filter((item) => item.quantity > 0);

  if (!name) return { error: "Name is required" };
  if (!/^\d{10,15}$/.test(phone)) {
    return { error: "Enter a valid phone number" };
  }
  if (items.length === 0) return { error: "Your cart is empty" };

  const amount = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const slots = [...new Set(items.map((item) => item.mealSlot))];
  const mealSlot = slots.length === 1 ? slots[0] : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_id: user?.id ?? null,
      customer_name: name,
      customer_phone: phone,
      order_type: "one_off",
      amount,
      status: "awaiting_payment",
      delivery_date: todayDateString(),
      meal_slot: mealSlot,
    })
    .select("id")
    .single();

  if (error || !order) return { error: error?.message ?? "Could not create order" };

  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      meal_slot: item.mealSlot,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    })),
  );

  if (itemsError) return { error: itemsError.message };

  revalidateOrders();
  return { success: true, orderId: order.id as string };
}

export async function claimPayment(orderId: string) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not connected yet." };
  }

  const supabase = await createClient();
  const { data: order, error: readError } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .single();

  if (readError || !order) return { error: "Order not found" };
  if (order.status !== "awaiting_payment") {
    return { error: "This order is not waiting for payment" };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: "payment_claimed",
      claimed_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("status", "awaiting_payment");

  if (error) return { error: error.message };

  revalidateOrders();
  revalidatePath(`/order/${orderId}/pay`);
  return { success: true };
}

export async function confirmPayment(orderId: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError ?? "Not authorized" };

  const { error } = await supabase
    .from("orders")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("status", "payment_claimed");

  if (error) return { error: error.message };

  revalidateOrders();
  return { success: true };
}

export async function rejectPayment(orderId: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError ?? "Not authorized" };

  const { error } = await supabase
    .from("orders")
    .update({ status: "rejected" })
    .eq("id", orderId)
    .eq("status", "payment_claimed");

  if (error) return { error: error.message };

  revalidateOrders();
  return { success: true };
}
