import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDisplayDate, formatPrice, todayDateString } from "@/lib/menu";
import { getTodaysKitchenOrders, prepCountFromOrders } from "@/lib/order-queries";
import {
  displayOrderNumber,
  MEAL_SLOTS,
  MEAL_SLOT_LABELS,
  ORDER_STATUS_LABELS,
} from "@/types/database";

export default async function TodaysOrdersPage() {
  const date = todayDateString();
  const orders = await getTodaysKitchenOrders(date);
  const prep = prepCountFromOrders(orders);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Today&apos;s orders</h1>
        <p className="mt-1 text-text-secondary">
          Confirmed one-off orders and subscription deliveries for{" "}
          {formatDisplayDate(date)}. Prep count is from these rows only — not
          from unpaid or unverified payments.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-text-primary">Kitchen prep count</h2>
          <p className="text-sm text-text-muted">
            Total quantity per dish the kitchen needs today
          </p>
        </CardHeader>
        <CardContent>
          {prep.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-secondary">
              Nothing to cook yet. Confirm pending payments first.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="py-2 pr-4 font-medium">Dish</th>
                    <th className="py-2 pr-4 font-medium">Meal</th>
                    <th className="py-2 font-medium">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {prep.map((row) => (
                    <tr
                      key={`${row.meal_slot}-${row.name}`}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-2 pr-4 font-medium text-text-primary">
                        {row.name}
                      </td>
                      <td className="py-2 pr-4 text-text-secondary">
                        {MEAL_SLOT_LABELS[row.meal_slot]}
                      </td>
                      <td className="py-2 font-semibold text-brand">{row.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-text-primary">
          Orders ({orders.length})
        </h2>
        {orders.length === 0 ? (
          <p className="text-sm text-text-secondary">No confirmed orders for today.</p>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="space-y-3 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-text-primary">
                        {displayOrderNumber(order.order_number)}
                      </h3>
                      <Badge
                        variant={order.status === "confirmed" ? "success" : "muted"}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      {order.customer_name} · {order.customer_phone}
                    </p>
                  </div>
                  <p className="font-semibold text-brand">{formatPrice(order.amount)}</p>
                </div>
                <ul className="space-y-1 text-sm text-text-secondary">
                  {(order.order_items ?? []).map((item) => (
                    <li key={item.id}>
                      {MEAL_SLOT_LABELS[item.meal_slot]} · {item.quantity}× {item.name}
                    </li>
                  ))}
                </ul>
                {order.meal_slot && (
                  <p className="text-xs text-text-muted">
                    Slot: {MEAL_SLOTS.includes(order.meal_slot) ? MEAL_SLOT_LABELS[order.meal_slot] : order.meal_slot}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
