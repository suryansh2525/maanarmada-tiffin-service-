"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import type { MealSlot } from "@/types/database";

function normalizeCutoff(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

export async function saveKitchenSettings(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError ?? "Not authorized" };

  const kitchenName = (formData.get("kitchen_name") as string)?.trim();
  const whatsappNumber = (formData.get("whatsapp_number") as string)
    ?.replace(/\s+/g, "")
    .replace(/^\+/, "");
  const upiId = (formData.get("upi_id") as string)?.trim() || null;
  const upiQrUrl = (formData.get("upi_qr_url") as string)?.trim() || null;

  if (!kitchenName) return { error: "Kitchen name is required" };

  if (whatsappNumber && !/^\d{10,15}$/.test(whatsappNumber)) {
    return { error: "WhatsApp number should be digits with country code, e.g. 9198XXXXXXXX" };
  }

  const { error } = await supabase
    .from("kitchen_settings")
    .update({
      kitchen_name: kitchenName,
      whatsapp_number: whatsappNumber || null,
      upi_id: upiId,
      upi_qr_url: upiQrUrl,
    })
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function saveMealCutoffs(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError ?? "Not authorized" };

  const slots: MealSlot[] = ["breakfast", "lunch", "dinner"];

  for (const slot of slots) {
    const raw = formData.get(`cutoff_${slot}`) as string;
    const cutoff = normalizeCutoff(raw ?? "");
    if (!cutoff) {
      return { error: `Invalid cutoff time for ${slot}` };
    }

    const { error } = await supabase
      .from("meal_slot_config")
      .update({ cutoff_time: cutoff })
      .eq("meal_slot", slot);

    if (error) return { error: error.message };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  return { success: true };
}
