import Link from "next/link";
import { MealSlotSection } from "@/components/menu/menu-item-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  formatDisplayDate,
  groupMenuBySlot,
  todayDateString,
} from "@/lib/menu";
import { getAllMenuItems, getMenuForDate } from "@/lib/menu-queries";
import { getPendingCount, getTodaysKitchenOrders } from "@/lib/order-queries";
import { MEAL_SLOTS } from "@/types/database";

export default async function AdminDashboardPage() {
  const today = todayDateString();
  const menuRows = await getMenuForDate(today);
  const grouped = groupMenuBySlot(menuRows);
  const allItems = await getAllMenuItems();
  const activeCount = allItems.filter((i) => i.is_active).length;
  const [pendingCount, todayOrders] = await Promise.all([
    getPendingCount(),
    getTodaysKitchenOrders(today),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
        <p className="mt-1 text-text-secondary">
          Kitchen overview for {formatDisplayDate(today)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/pending">
          <Card className="h-full transition-colors hover:border-border-strong">
            <CardContent className="py-4">
              <p className="text-sm text-text-muted">Pending verification</p>
              <p className="mt-1 text-2xl font-semibold text-text-primary">
                {pendingCount}
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/orders">
          <Card className="h-full transition-colors hover:border-border-strong">
            <CardContent className="py-4">
              <p className="text-sm text-text-muted">Today&apos;s confirmed orders</p>
              <p className="mt-1 text-2xl font-semibold text-text-primary">
                {todayOrders.length}
              </p>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-text-muted">Active menu items</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">
              {activeCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-text-primary">Today&apos;s menu</h2>
              <p className="text-sm text-text-muted">
                Resolved from weekly template + any daily overrides
              </p>
            </div>
            <Badge>{formatDisplayDate(today)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {menuRows.length > 0 ? (
            MEAL_SLOTS.map((slot) => (
              <MealSlotSection
                key={slot}
                slot={slot}
                items={grouped[slot]}
                showSource
              />
            ))
          ) : (
            <p className="py-8 text-center text-text-secondary">
              No menu published for today. Set up your{" "}
              <Link href="/admin/weekly-menu" className="text-brand hover:underline">
                weekly menu
              </Link>{" "}
              or{" "}
              <Link href="/admin/today" className="text-brand hover:underline">
                override today
              </Link>
              .
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
