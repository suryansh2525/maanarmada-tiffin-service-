import { DailyMenuBuilder } from "./daily-menu-builder";
import { DatePicker } from "./date-picker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDisplayDate, todayDateString } from "@/lib/menu";
import {
  getAllMenuItems,
  getDailyMenuItems,
  getDailySlotOverrides,
  getWeeklyMenuItems,
} from "@/lib/menu-queries";

export default async function TodayMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
    ? params.date
    : todayDateString();

  const [dailyItems, weeklyItems, catalogue, overrides] = await Promise.all([
    getDailyMenuItems(date),
    getWeeklyMenuItems(),
    getAllMenuItems(),
    getDailySlotOverrides(date),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Today&apos;s menu</h1>
          <p className="mt-1 text-text-secondary">
            Weekly template is the default. Override a meal when that date is different.
          </p>
        </div>
        <DatePicker date={date} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-text-primary">{formatDisplayDate(date)}</h2>
            {date === todayDateString() && <Badge>Today</Badge>}
          </div>
          <p className="text-sm text-text-muted">
            Customers see this date&apos;s resolved menu. An override replaces the weekly
            dishes for that meal only.
          </p>
        </CardHeader>
        <CardContent>
          <DailyMenuBuilder
            date={date}
            dailyItems={dailyItems as Parameters<typeof DailyMenuBuilder>[0]["dailyItems"]}
            weeklyItems={weeklyItems as Parameters<typeof DailyMenuBuilder>[0]["weeklyItems"]}
            catalogue={catalogue as Parameters<typeof DailyMenuBuilder>[0]["catalogue"]}
            overrideSlots={(overrides ?? []).map((row) => row.meal_slot)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
