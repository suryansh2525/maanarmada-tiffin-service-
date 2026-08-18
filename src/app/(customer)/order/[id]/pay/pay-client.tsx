"use client";

import { useState } from "react";
import { claimPayment } from "@/actions/orders";
import { formatPrice } from "@/lib/menu";
import { paymentWhatsAppUrl } from "@/lib/whatsapp";
import type { KitchenSettings, Order } from "@/types/database";
import { displayOrderNumber, MEAL_SLOT_LABELS } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PayClientProps {
  order: Order;
  settings: KitchenSettings | null;
}

export function PayClient({ order, settings }: PayClientProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(order.status === "payment_claimed");
  const whatsappUrl = paymentWhatsAppUrl(order, settings);

  async function handlePaid() {
    setLoading(true);
    setError("");

    const result = await claimPayment(order.id);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setClaimed(true);
    setLoading(false);
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  }

  const waiting =
    claimed ||
    order.status === "payment_claimed" ||
    order.status === "confirmed";

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <Badge>{displayOrderNumber(order.order_number)}</Badge>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          {waiting && order.status !== "awaiting_payment"
            ? "Payment sent"
            : "Pay for your order"}
        </h1>
        <p className="mt-1 text-text-secondary">
          {formatPrice(order.amount)} · {order.customer_name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-text-primary">Items</h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {(order.order_items ?? []).map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span>
                  {MEAL_SLOT_LABELS[item.meal_slot]} · {item.quantity}× {item.name}
                </span>
                <span className="text-brand">
                  {formatPrice(item.unit_price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {order.status === "awaiting_payment" && !claimed && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-text-primary">Pay with UPI</h2>
            <p className="text-sm text-text-muted">
              Scan the QR in your UPI app. Amount: {formatPrice(order.amount)}
              {settings?.upi_id ? ` · ${settings.upi_id}` : ""}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings?.upi_qr_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.upi_qr_url}
                alt="UPI QR code"
                className="mx-auto h-52 w-52 rounded-lg border border-border bg-white object-contain p-3"
              />
            ) : (
              <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-text-secondary">
                Kitchen has not added a UPI QR yet. Ask them for the UPI ID
                {settings?.upi_id ? `: ${settings.upi_id}` : ""}.
              </p>
            )}
            {error && <p className="text-sm text-error">{error}</p>}
            <Button className="w-full" onClick={handlePaid} disabled={loading}>
              {loading ? "Updating…" : "I've paid"}
            </Button>
            <p className="text-xs text-text-muted">
              This tells the kitchen you paid. WhatsApp opens so you can send the
              screenshot. The order is confirmed only after they verify it in the
              dashboard.
            </p>
          </CardContent>
        </Card>
      )}

      {(claimed || order.status === "payment_claimed") && (
        <Card>
          <CardContent className="space-y-3 py-6">
            <p className="font-medium text-text-primary">Waiting for kitchen confirmation</p>
            <p className="text-sm text-text-secondary">
              Send the payment screenshot on WhatsApp if it did not open.
            </p>
            {whatsappUrl && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() =>
                  window.open(whatsappUrl, "_blank", "noopener,noreferrer")
                }
              >
                Open WhatsApp
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {order.status === "confirmed" && (
        <p className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
          Payment confirmed. Your tiffin is in today&apos;s kitchen list.
        </p>
      )}

      {order.status === "rejected" && (
        <p className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
          Payment was not verified. Please contact the kitchen.
        </p>
      )}
    </div>
  );
}
