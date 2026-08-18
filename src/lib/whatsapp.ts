import type { KitchenSettings, Order } from "@/types/database";
import { displayOrderNumber } from "@/types/database";
import { formatPrice } from "@/lib/menu";

export function whatsappDigits(number: string | null | undefined): string | null {
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  return digits.length >= 10 ? digits : null;
}

export function paymentWhatsAppUrl(order: Order, settings: KitchenSettings | null) {
  const to = whatsappDigits(settings?.whatsapp_number);
  if (!to) return null;

  const items = (order.order_items ?? [])
    .map((item) => `${item.quantity}× ${item.name}`)
    .join(", ");

  const text = [
    `Payment for ${settings?.kitchen_name ?? "Maan Armada"}`,
    `Order ${displayOrderNumber(order.order_number)}`,
    `Amount ${formatPrice(order.amount)}`,
    `Name: ${order.customer_name}`,
    `Phone: ${order.customer_phone}`,
    items ? `Items: ${items}` : null,
    "",
    "Please find the payment screenshot.",
  ]
    .filter((line) => line !== null)
    .join("\n");

  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
}
