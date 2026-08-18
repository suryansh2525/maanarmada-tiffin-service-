import { type MealSlot, MEAL_SLOT_LABELS } from "@/types/database";
import { formatPrice } from "@/lib/menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ResolvedMenuRow } from "@/types/database";

interface MenuItemCardProps {
  item: ResolvedMenuRow;
  showSource?: boolean;
  onAdd?: (item: ResolvedMenuRow) => void;
}

export function MenuItemCard({ item, showSource = false, onAdd }: MenuItemCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between gap-4 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium text-text-primary">{item.name}</h3>
            {showSource && (
              <Badge variant="muted">{item.source}</Badge>
            )}
          </div>
          {item.description && (
            <p className="mt-1 text-sm text-text-secondary line-clamp-2">
              {item.description}
            </p>
          )}
          {onAdd && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => onAdd(item)}
            >
              Add
            </Button>
          )}
        </div>
        <p className="shrink-0 text-sm font-semibold text-brand">
          {formatPrice(item.price)}
        </p>
      </CardContent>
    </Card>
  );
}

interface MealSlotSectionProps {
  slot: MealSlot;
  items: ResolvedMenuRow[];
  showSource?: boolean;
  onAdd?: (item: ResolvedMenuRow) => void;
}

export function MealSlotSection({
  slot,
  items,
  showSource = false,
  onAdd,
}: MealSlotSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-text-primary">
        {MEAL_SLOT_LABELS[slot]}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <MenuItemCard
            key={`${item.meal_slot}-${item.menu_item_id}`}
            item={item}
            showSource={showSource}
            onAdd={onAdd}
          />
        ))}
      </div>
    </section>
  );
}
