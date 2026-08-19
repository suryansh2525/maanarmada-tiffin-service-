"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { MealSlot } from "@/types/database";

export async function createMenuItem(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError ?? "Not authorized" };

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const price = parseFloat(formData.get("price") as string);

  if (!name?.trim() || Number.isNaN(price) || price < 0) {
    return { error: "Invalid name or price" };
  }

  const { error } = await supabase.from("menu_items").insert({
    name: name.trim(),
    description: description?.trim() || null,
    price,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/menu-items");
  revalidatePath("/");
  return { success: true };
}

export async function updateMenuItem(id: string, formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError ?? "Not authorized" };

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const price = parseFloat(formData.get("price") as string);
  const isActive = formData.get("is_active") === "on";

  if (!name?.trim() || Number.isNaN(price) || price < 0) {
    return { error: "Invalid name or price" };
  }

  const { error } = await supabase
    .from("menu_items")
    .update({
      name: name.trim(),
      description: description?.trim() || null,
      price,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/menu-items");
  revalidatePath("/");
  return { success: true };
}

export async function toggleMenuItemActive(id: string, isActive: boolean) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError ?? "Not authorized" };

  const { error } = await supabase
    .from("menu_items")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/menu-items");
  revalidatePath("/");
  return { success: true };
}

export async function addWeeklyMenuItem(
  dayOfWeek: number,
  mealSlot: MealSlot,
  menuItemId: string,
) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError ?? "Not authorized" };

  const { error } = await supabase.from("weekly_menu_items").insert({
    day_of_week: dayOfWeek,
    meal_slot: mealSlot,
    menu_item_id: menuItemId,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Item already on this day's menu" };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/weekly-menu");
  revalidatePath("/");
  return { success: true };
}

export async function removeWeeklyMenuItem(id: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError ?? "Not authorized" };

  const { error } = await supabase
    .from("weekly_menu_items")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/weekly-menu");
  revalidatePath("/");
  return { success: true };
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    redirect("/admin/login");
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/admin");
  redirect("/admin/login");
}

function revalidateMenus(date?: string) {
  revalidatePath("/admin/today");
  revalidatePath("/admin");
  revalidatePath("/");
  if (date) revalidatePath(`/admin/today`);
}

export async function addDailyMenuItem(
  date: string,
  mealSlot: MealSlot,
  menuItemId: string,
) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError ?? "Not authorized" };

  const { error: overrideError } = await supabase
    .from("daily_slot_overrides")
    .upsert({ date, meal_slot: mealSlot }, { onConflict: "date,meal_slot" });

  if (overrideError) return { error: overrideError.message };

  const { error } = await supabase.from("daily_menu_items").insert({
    date,
    meal_slot: mealSlot,
    menu_item_id: menuItemId,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Item already on this meal" };
    }
    return { error: error.message };
  }

  revalidateMenus(date);
  return { success: true };
}

export async function removeDailyMenuItem(id: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError ?? "Not authorized" };

  const { error } = await supabase.from("daily_menu_items").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidateMenus();
  return { success: true };
}

export async function copyWeeklySlotToDate(date: string, mealSlot: MealSlot) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError ?? "Not authorized" };

  const dayOfWeek = new Date(`${date}T12:00:00`).getDay();

  const { data: weekly, error: weeklyError } = await supabase
    .from("weekly_menu_items")
    .select("menu_item_id, sort_order")
    .eq("day_of_week", dayOfWeek)
    .eq("meal_slot", mealSlot);

  if (weeklyError) return { error: weeklyError.message };

  const { error: overrideError } = await supabase
    .from("daily_slot_overrides")
    .upsert({ date, meal_slot: mealSlot }, { onConflict: "date,meal_slot" });

  if (overrideError) return { error: overrideError.message };

  await supabase
    .from("daily_menu_items")
    .delete()
    .eq("date", date)
    .eq("meal_slot", mealSlot);

  if (!weekly?.length) {
    revalidateMenus(date);
    return { success: true };
  }

  const { error } = await supabase.from("daily_menu_items").insert(
    weekly.map((row) => ({
      date,
      meal_slot: mealSlot,
      menu_item_id: row.menu_item_id,
      sort_order: row.sort_order,
    })),
  );

  if (error) return { error: error.message };

  revalidateMenus(date);
  return { success: true };
}

export async function clearDailySlot(date: string, mealSlot: MealSlot) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError ?? "Not authorized" };

  const { error: itemsError } = await supabase
    .from("daily_menu_items")
    .delete()
    .eq("date", date)
    .eq("meal_slot", mealSlot);

  if (itemsError) return { error: itemsError.message };

  const { error } = await supabase
    .from("daily_slot_overrides")
    .delete()
    .eq("date", date)
    .eq("meal_slot", mealSlot);

  if (error) return { error: error.message };

  revalidateMenus(date);
  return { success: true };
}

export async function startEmptyOverride(date: string, mealSlot: MealSlot) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError ?? "Not authorized" };

  await supabase
    .from("daily_menu_items")
    .delete()
    .eq("date", date)
    .eq("meal_slot", mealSlot);

  const { error } = await supabase
    .from("daily_slot_overrides")
    .upsert({ date, meal_slot: mealSlot }, { onConflict: "date,meal_slot" });

  if (error) return { error: error.message };

  revalidateMenus(date);
  return { success: true };
}

