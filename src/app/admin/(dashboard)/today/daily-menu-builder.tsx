"use client";

import { useState } from "react";
import {
  addDailyMenuItem,
  clearDailySlot,
  copyWeeklySlotToDate,
  removeDailyMenuItem,
  startEmptyOverride,
} from "@/actions/menu";
import { formatPrice } from "@/lib/menu";
import type { MealSlot, MenuItem } from "@/types/database";
import { MEAL_SLOTS, MEAL_SLOT_LABELS } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type MenuRow = {
  id: string;
  meal_slot: MealSlot;
  menu_item_id: string;
  menu_items: MenuItem | null;
};

interface DailyMenuBuilderProps {
  date: string;
  dailyItems: MenuRow[];
  weeklyItems: (MenuRow & { day_of_week: number })[];
  catalogue: MenuItem[];
  overrideSlots: MealSlot[];
}

export function DailyMenuBuilder({
  date,
  dailyItems,
  weeklyItems,
  catalogue,
  overrideSlots,
}: DailyMenuBuilderProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Record<MealSlot, string>>({
    breakfast: "",
    lunch: "",
    dinner: "",
  });

  const activeCatalogue = catalogue.filter((i) => i.is_active);
  const dayOfWeek = new Date(`${date}T12:00:00`).getDay();

  async function handleAdd(slot: MealSlot) {
    const menuItemId = selected[slot];
    if (!menuItemId) return;
    setError("");
    setLoadingId(menuItemId);
    const result = await addDailyMenuItem(date, slot, menuItemId);
    if (result.error) setError(result.error);
    setSelected((prev) => ({ ...prev, [slot]: "" }));
    setLoadingId(null);
  }

  async function handleRemove(id: string) {
    setLoadingId(id);
    const result = await removeDailyMenuItem(id);
    if (result.error) setError(result.error);
    setLoadingId(null);
  }

  async function handleCopy(slot: MealSlot) {
    setLoadingId(`copy-${slot}`);
    const result = await copyWeeklySlotToDate(date, slot);
    if (result.error) setError(result.error);
    setLoadingId(null);
  }

  async function handleEmpty(slot: MealSlot) {
    setLoadingId(`empty-${slot}`);
    const result = await startEmptyOverride(date, slot);
    if (result.error) setError(result.error);
    setLoadingId(null);
  }

  async function handleRevert(slot: MealSlot) {
    setLoadingId(`revert-${slot}`);
    const result = await clearDailySlot(date, slot);
    if (result.error) setError(result.error);
    setLoadingId(null);
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-error">{error}</p>}

      {MEAL_SLOTS.map((slot) => {
        const overrideItems = dailyItems.filter((row) => row.meal_slot === slot);
        const isOverride = overrideSlots.includes(slot);
        const templateItems = weeklyItems.filter(
          (row) => row.day_of_week === dayOfWeek && row.meal_slot === slot,
        );
        const shownItems = isOverride ? overrideItems : templateItems;

        return (
          <Card key={slot}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-text-primary">
                    {MEAL_SLOT_LABELS[slot]}
                  </h3>
                  <Badge variant={isOverride ? "warning" : "muted"}>
                    {isOverride ? "Override" : "Weekly template"}
                  </Badge>
                </div>
                {isOverride ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loadingId === `revert-${slot}`}
                    onClick={() => handleRevert(slot)}
                  >
                    Revert to weekly
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={loadingId === `copy-${slot}`}
                      onClick={() => handleCopy(slot)}
                    >
                      Override (copy weekly)
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={loadingId === `empty-${slot}`}
                      onClick={() => handleEmpty(slot)}
                    >
                      Closed / empty
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {shownItems.length === 0 ? (
                <p className="text-sm text-text-muted">No items for this meal</p>
              ) : (
                <ul className="space-y-2">
                  {shownItems.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                    >
                      <div>
                        <span className="font-medium text-text-primary">
                          {row.menu_items?.name ?? "Unknown"}
                        </span>
                        {row.menu_items && (
                          <span className="ml-2 text-sm text-brand">
                            {formatPrice(row.menu_items.price)}
                          </span>
                        )}
                      </div>
                      {isOverride && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={loadingId === row.id}
                          onClick={() => handleRemove(row.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {isOverride && (
                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-[200px] flex-1">
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                      Add item
                    </label>
                    <select
                      className="h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 text-sm text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      value={selected[slot]}
                      onChange={(e) =>
                        setSelected((prev) => ({ ...prev, [slot]: e.target.value }))
                      }
                    >
                      <option value="">Select dish…</option>
                      {activeCatalogue.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} — {formatPrice(item.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    variant="secondary"
                    disabled={!selected[slot] || activeCatalogue.length === 0}
                    onClick={() => handleAdd(slot)}
                  >
                    Add
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
