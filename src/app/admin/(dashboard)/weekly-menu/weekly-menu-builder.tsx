"use client";

import { useState } from "react";
import { addWeeklyMenuItem, removeWeeklyMenuItem } from "@/actions/menu";
import { formatPrice } from "@/lib/menu";
import type { MealSlot, MenuItem } from "@/types/database";
import {
  DAY_LABELS,
  MEAL_SLOTS,
  MEAL_SLOT_LABELS,
} from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type WeeklyRow = {
  id: string;
  day_of_week: number;
  meal_slot: MealSlot;
  menu_item_id: string;
  sort_order: number;
  menu_items: MenuItem | null;
};

interface WeeklyMenuBuilderProps {
  weeklyItems: WeeklyRow[];
  catalogue: MenuItem[];
}

export function WeeklyMenuBuilder({
  weeklyItems,
  catalogue,
}: WeeklyMenuBuilderProps) {
  const [selectedDay, setSelectedDay] = useState(1); // Monday default
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const activeCatalogue = catalogue.filter((i) => i.is_active);

  async function handleAdd(mealSlot: MealSlot, menuItemId: string) {
    if (!menuItemId) return;
    setError("");
    setLoadingId(menuItemId);

    const result = await addWeeklyMenuItem(selectedDay, mealSlot, menuItemId);

    if (result.error) setError(result.error);
    setLoadingId(null);
  }

  async function handleRemove(id: string) {
    setLoadingId(id);
    await removeWeeklyMenuItem(id);
    setLoadingId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {DAY_LABELS.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setSelectedDay(index)}
            className={
              selectedDay === index
                ? "rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-text-on-brand"
                : "rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-sm font-medium text-text-secondary hover:border-border-strong"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="space-y-6">
        {MEAL_SLOTS.map((slot) => {
          const slotItems = weeklyItems.filter(
            (w) => w.day_of_week === selectedDay && w.meal_slot === slot,
          );

          return (
            <Card key={slot}>
              <CardHeader>
                <h3 className="font-semibold text-text-primary">
                  {MEAL_SLOT_LABELS[slot]}
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {slotItems.length === 0 ? (
                  <p className="text-sm text-text-muted">No items assigned</p>
                ) : (
                  <ul className="space-y-2">
                    {slotItems.map((row) => (
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
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={loadingId === row.id}
                          onClick={() => handleRemove(row.id)}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-[200px] flex-1">
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                      Add item
                    </label>
                    <select
                      className="h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 text-sm text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      id={`add-${slot}`}
                      defaultValue=""
                    >
                      <option value="" disabled>Select dish…</option>
                      {activeCatalogue.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} — {formatPrice(item.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    variant="secondary"
                    size="md"
                    disabled={activeCatalogue.length === 0}
                    onClick={() => {
                      const select = document.getElementById(
                        `add-${slot}`,
                      ) as HTMLSelectElement;
                      handleAdd(slot, select.value);
                      select.value = "";
                    }}
                  >
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activeCatalogue.length === 0 && (
        <p className="text-sm text-warning">
          Add active menu items first before building the weekly menu.
        </p>
      )}
    </div>
  );
}
