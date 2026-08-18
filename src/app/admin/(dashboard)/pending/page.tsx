import { PendingOrderCard } from "./pending-order-card";
import { getPendingVerificationOrders } from "@/lib/order-queries";

export default async function PendingVerificationPage() {
  const orders = await getPendingVerificationOrders();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Pending verification
        </h1>
        <p className="mt-1 text-text-secondary">
          Customers who tapped &quot;I&apos;ve paid&quot;. Check WhatsApp, then
          confirm here — this click is the source of truth.
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface-elevated px-6 py-16 text-center text-text-secondary">
          No payments waiting. When a customer claims payment, they appear here.
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <PendingOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
