import { SettingsForms } from "./settings-forms";
import { getKitchenSettings, getMealSlotConfig } from "@/lib/menu-queries";
import type { KitchenSettings, MealSlotConfig } from "@/types/database";

export default async function SettingsPage() {
  const [settings, slots] = await Promise.all([
    getKitchenSettings(),
    getMealSlotConfig(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
        <p className="mt-1 text-text-secondary">
          Kitchen details, UPI QR, WhatsApp, and per-meal cutoff times.
        </p>
      </div>
      <SettingsForms
        settings={settings as KitchenSettings | null}
        slots={slots as MealSlotConfig[]}
      />
    </div>
  );
}
