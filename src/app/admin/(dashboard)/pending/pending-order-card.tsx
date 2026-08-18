"use client";

import { useState } from "react";
import { confirmPayment, rejectPayment } from "@/actions/orders";
import { formatPrice } from "@/lib/menu";
import type { Order } from "@/types/database";
import {
  displayOrderNumber,
  MEAL_SLOT_LABELS,
  ORDER_STATUS_LABELS,
} from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PendingOrderCard({ order }: { order: Order }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"confirm" | "reject" | null>(null);

  async function handleConfirm() {
    setLoading("confirm");
    setError("");
    const result = await confirmPayment(order.id);
    if (result.error) setError(result.error);
    setLoading(null);
  }

  async function handleReject() {
    setLoading("reject");
    setError("");
    const result = await rejectPayment(order.id);
    if (result.error) setError(result.error);
    setLoading(null);
  }

  return (
    <Card>
      <CardContent className="space-y-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-text-primary">
                {displayOrderNumber(order.order_number)}
              </h3>
              <Badge variant="warning">
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
              <Badge variant="muted">
                {order.order_type === "subscription_cycle"
                  ? "Subscription cycle"
                  : "One-off"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              {order.customer_name} · {order.customer_phone}
            </p>
          </div>
          <p className="text-lg font-semibold text-brand">
            {formatPrice(order.amount)}
          </p>
        </div>

        <ul className="space-y-1 text-sm text-text-secondary">
          {(order.order_items ?? []).map((item) => (
            <li key={item.id}>
              {MEAL_SLOT_LABELS[item.meal_slot]} · {item.quantity}× {item.name}
            </li>
          ))}
        </ul>

        {error && <p className="text-sm text-error">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleConfirm}
            disabled={loading !== null}
          >
            {loading === "confirm" ? "Confirming…" : "Confirm payment"}
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={loading !== null}
          >
            {loading === "reject" ? "Rejecting…" : "Reject"}
          </Button>
        </div>
        <p className="text-xs text-text-muted">
          Check the WhatsApp screenshot first. Confirming is what moves this
          order into today&apos;s kitchen list.
        </p>
      </CardContent>
    </Card>
  );
}
