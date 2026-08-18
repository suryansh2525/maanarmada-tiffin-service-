import { TodayMenuClient } from "./today-menu-client";
import { Badge } from "@/components/ui/badge";
import {
  formatDisplayDate,
  groupMenuBySlot,
  todayDateString,
} from "@/lib/menu";
import { getMenuForDate } from "@/lib/menu-queries";

export default async function HomePage() {
  const today = todayDateString();
  const menuRows = await getMenuForDate(today);
  const grouped = groupMenuBySlot(menuRows);
  const hasMenu = menuRows.length > 0;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Badge>Today&apos;s menu</Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
          {formatDisplayDate(today)}
        </h1>
        <p className="text-text-secondary">
          Breakfast, lunch & dinner — add items and pay once for today.
        </p>
      </div>

      {hasMenu ? (
        <TodayMenuClient grouped={grouped} />
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-surface-elevated px-6 py-16 text-center">
          <p className="text-lg font-medium text-text-primary">
            Menu not published yet
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Check back soon — the kitchen is planning today&apos;s meals.
          </p>
        </div>
      )}
    </div>
  );
}
