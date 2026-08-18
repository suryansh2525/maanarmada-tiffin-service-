import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getAllMenuItems, getWeeklyMenuItems } from "@/lib/menu-queries";
import { WeeklyMenuBuilder } from "./weekly-menu-builder";

export default async function WeeklyMenuPage() {
  const weeklyItems = await getWeeklyMenuItems();
  const catalogue = await getAllMenuItems();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Weekly menu</h1>
        <p className="mt-1 text-text-secondary">
          Set what&apos;s served each day for breakfast, lunch & dinner. Customers
          see today&apos;s menu based on this template.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-text-primary">How it works</h2>
            <Badge variant="muted">Template</Badge>
          </div>
          <p className="text-sm text-text-muted">
            Pick a day, assign dishes to each meal slot. Daily overrides (for
            holidays or specials) will be added in a later phase.
          </p>
        </CardHeader>
        <CardContent>
          <WeeklyMenuBuilder
            weeklyItems={weeklyItems as Parameters<typeof WeeklyMenuBuilder>[0]["weeklyItems"]}
            catalogue={catalogue}
          />
        </CardContent>
      </Card>
    </div>
  );
}
