import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ResolvedMenuRow } from "@/types/database";

export async function getMenuForDate(date: string): Promise<ResolvedMenuRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_menu_for_date", {
    p_date: date,
  });

  if (error) {
    console.error("get_menu_for_date error:", error.message);
    return [];
  }

  return (data as ResolvedMenuRow[]) ?? [];
}

export async function getAllMenuItems() {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("name");

  if (error) {
    console.error("menu_items error:", error.message);
    return [];
  }

  return data;
}

export async function getWeeklyMenuItems() {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("weekly_menu_items")
    .select("*, menu_items(*)")
    .order("day_of_week")
    .order("meal_slot")
    .order("sort_order");

  if (error) {
    console.error("weekly_menu_items error:", error.message);
    return [];
  }

  return data;
}

export async function getDailySlotOverrides(date: string) {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("daily_slot_overrides")
    .select("meal_slot")
    .eq("date", date);

  if (error) {
    console.error("daily_slot_overrides error:", error.message);
    return [];
  }

  return data;
}

export async function getDailyMenuItems(date: string) {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("daily_menu_items")
    .select("*, menu_items(*)")
    .eq("date", date)
    .order("meal_slot")
    .order("sort_order");

  if (error) {
    console.error("daily_menu_items error:", error.message);
    return [];
  }

  return data;
}

export async function getKitchenSettings() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kitchen_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("kitchen_settings error:", error.message);
    return null;
  }

  return data;
}

export async function getMealSlotConfig() {
  if (!isSupabaseConfigured()) {
    return [
      { meal_slot: "breakfast" as const, label: "Breakfast", cutoff_time: "08:00:00", sort_order: 1 },
      { meal_slot: "lunch" as const, label: "Lunch", cutoff_time: "11:00:00", sort_order: 2 },
      { meal_slot: "dinner" as const, label: "Dinner", cutoff_time: "18:00:00", sort_order: 3 },
    ];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meal_slot_config")
    .select("*")
    .order("sort_order");

  if (error) {
    console.error("meal_slot_config error:", error.message);
    return [];
  }

  return data;
}
