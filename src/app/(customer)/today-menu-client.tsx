"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MealSlotSection } from "@/components/menu/menu-item-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatPrice } from "@/lib/menu";
import { placeOneOffOrder } from "@/actions/orders";
import type { CartLineInput } from "@/actions/orders";
import type { MealSlot, ResolvedMenuRow } from "@/types/database";
import { MEAL_SLOTS, MEAL_SLOT_LABELS } from "@/types/database";

type CartLine = CartLineInput;

interface TodayMenuClientProps {
  grouped: Record<MealSlot, ResolvedMenuRow[]>;
}

export function TodayMenuClient({ grouped }: TodayMenuClientProps) {
  const router = useRouter();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const total = useMemo(
    () => cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [cart],
  );

  function addItem(item: ResolvedMenuRow) {
    setCart((prev) => {
      const existing = prev.find(
        (line) =>
          line.menuItemId === item.menu_item_id && line.mealSlot === item.meal_slot,
      );
      if (existing) {
        return prev.map((line) =>
          line === existing ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.menu_item_id,
          name: item.name,
          mealSlot: item.meal_slot,
          quantity: 1,
          unitPrice: item.price,
        },
      ];
    });
  }

  function changeQty(line: CartLine, delta: number) {
    setCart((prev) =>
      prev
        .map((entry) =>
          entry.menuItemId === line.menuItemId && entry.mealSlot === line.mealSlot
            ? { ...entry, quantity: entry.quantity + delta }
            : entry,
        )
        .filter((entry) => entry.quantity > 0),
    );
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await placeOneOffOrder({
      customerName: name,
      customerPhone: phone,
      items: cart,
    });

    if (result.error || !result.orderId) {
      setError(result.error ?? "Could not place order");
      setLoading(false);
      return;
    }

    router.push(`/order/${result.orderId}/pay`);
  }

  return (
    <div className="space-y-10">
      {MEAL_SLOTS.map((slot) => (
        <MealSlotSection
          key={slot}
          slot={slot}
          items={grouped[slot]}
          onAdd={addItem}
        />
      ))}

      {cart.length > 0 && !checkingOut && (
        <div className="sticky bottom-4 z-10 rounded-xl border border-border bg-surface-elevated p-4 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-text-secondary">
              {cart.reduce((sum, line) => sum + line.quantity, 0)} items ·{" "}
              <span className="font-semibold text-brand">{formatPrice(total)}</span>
            </p>
            <Button onClick={() => setCheckingOut(true)}>Checkout</Button>
          </div>
        </div>
      )}

      {checkingOut && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-text-primary">Checkout</h2>
            <p className="text-sm text-text-muted">
              Pay once for today&apos;s tiffin. You will see a UPI QR on the next screen.
            </p>
          </CardHeader>
          <CardContent>
            <ul className="mb-6 space-y-2">
              {cart.map((line) => (
                <li
                  key={`${line.mealSlot}-${line.menuItemId}`}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span>
                    {MEAL_SLOT_LABELS[line.mealSlot]} · {line.name}
                  </span>
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      className="h-7 w-7 rounded-md border border-border"
                      onClick={() => changeQty(line, -1)}
                    >
                      −
                    </button>
                    {line.quantity}
                    <button
                      type="button"
                      className="h-7 w-7 rounded-md border border-border"
                      onClick={() => changeQty(line, 1)}
                    >
                      +
                    </button>
                    <span className="w-16 text-right font-medium text-brand">
                      {formatPrice(line.unitPrice * line.quantity)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <Input
                label="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98XXXXXXXX"
                required
              />
              {error && <p className="text-sm text-error">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || cart.length === 0}>
                  {loading ? "Placing order…" : `Pay ${formatPrice(total)}`}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCheckingOut(false)}
                >
                  Back
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
