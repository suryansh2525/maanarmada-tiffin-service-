"use client";

import { useState } from "react";
import { saveKitchenSettings, saveMealCutoffs } from "@/actions/settings";
import { timeInputValue } from "@/lib/menu";
import type { KitchenSettings, MealSlotConfig } from "@/types/database";
import { MEAL_SLOT_LABELS } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SettingsFormsProps {
  settings: KitchenSettings | null;
  slots: MealSlotConfig[];
}

export function SettingsForms({ settings, slots }: SettingsFormsProps) {
  const [paymentError, setPaymentError] = useState("");
  const [cutoffError, setCutoffError] = useState("");
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [cutoffSaved, setCutoffSaved] = useState(false);
  const [loading, setLoading] = useState<"payment" | "cutoff" | null>(null);

  async function handlePayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading("payment");
    setPaymentError("");
    setPaymentSaved(false);

    const result = await saveKitchenSettings(new FormData(e.currentTarget));
    if (result.error) setPaymentError(result.error);
    else setPaymentSaved(true);
    setLoading(null);
  }

  async function handleCutoffs(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading("cutoff");
    setCutoffError("");
    setCutoffSaved(false);

    const result = await saveMealCutoffs(new FormData(e.currentTarget));
    if (result.error) setCutoffError(result.error);
    else setCutoffSaved(true);
    setLoading(null);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-text-primary">Kitchen & payment</h2>
          <p className="text-sm text-text-muted">
            Static UPI QR and WhatsApp number used when a customer says they&apos;ve paid.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePayment} className="space-y-4">
            <Input
              label="Kitchen name"
              name="kitchen_name"
              defaultValue={settings?.kitchen_name ?? "Maan Armada"}
              required
            />
            <Input
              label="WhatsApp number"
              name="whatsapp_number"
              defaultValue={settings?.whatsapp_number ?? ""}
              placeholder="9198XXXXXXXX"
            />
            <Input
              label="UPI ID"
              name="upi_id"
              defaultValue={settings?.upi_id ?? ""}
              placeholder="kitchen@upi"
            />
            <Input
              label="UPI QR image URL"
              name="upi_qr_url"
              defaultValue={settings?.upi_qr_url ?? ""}
              placeholder="https://..."
            />
            {settings?.upi_qr_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.upi_qr_url}
                alt="UPI QR preview"
                className="h-36 w-36 rounded-lg border border-border bg-surface-elevated object-contain p-2"
              />
            )}
            {paymentError && <p className="text-sm text-error">{paymentError}</p>}
            {paymentSaved && (
              <p className="text-sm text-success">Payment settings saved.</p>
            )}
            <Button type="submit" disabled={loading === "payment"}>
              {loading === "payment" ? "Saving…" : "Save payment settings"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-text-primary">Meal cutoffs</h2>
          <p className="text-sm text-text-muted">
            After this time, that meal locks. Orders will respect this in the next phase.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCutoffs} className="space-y-4">
            {slots.map((slot) => (
              <Input
                key={slot.meal_slot}
                label={`${MEAL_SLOT_LABELS[slot.meal_slot]} cutoff`}
                name={`cutoff_${slot.meal_slot}`}
                type="time"
                defaultValue={timeInputValue(slot.cutoff_time)}
                required
              />
            ))}
            {cutoffError && <p className="text-sm text-error">{cutoffError}</p>}
            {cutoffSaved && (
              <p className="text-sm text-success">Cutoff times saved.</p>
            )}
            <Button type="submit" disabled={loading === "cutoff"}>
              {loading === "cutoff" ? "Saving…" : "Save cutoffs"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
