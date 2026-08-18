import { notFound } from "next/navigation";
import { PayClient } from "./pay-client";
import { getKitchenSettings } from "@/lib/menu-queries";
import { getOrderById } from "@/lib/order-queries";
import type { KitchenSettings } from "@/types/database";

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    getOrderById(id),
    getKitchenSettings(),
  ]);

  if (!order) notFound();

  return <PayClient order={order} settings={settings as KitchenSettings | null} />;
}
