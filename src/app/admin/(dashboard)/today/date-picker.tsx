"use client";

import { useRouter } from "next/navigation";
import { shiftDate } from "@/lib/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DatePicker({ date }: { date: string }) {
  const router = useRouter();

  function go(next: string) {
    router.push(`/admin/today?date=${next}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <Button variant="secondary" size="sm" onClick={() => go(shiftDate(date, -1))}>
        Previous
      </Button>
      <Input
        type="date"
        value={date}
        className="w-auto"
        onChange={(e) => {
          if (e.target.value) go(e.target.value);
        }}
      />
      <Button variant="secondary" size="sm" onClick={() => go(shiftDate(date, 1))}>
        Next
      </Button>
    </div>
  );
}
