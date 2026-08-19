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
    <div className="flex w-full items-center gap-2">
      <Button variant="secondary" size="sm" onClick={() => go(shiftDate(date, -1))}>
        Prev
      </Button>
      <div className="min-w-0 flex-1">
        <Input
          type="date"
          value={date}
          onChange={(e) => {
            if (e.target.value) go(e.target.value);
          }}
        />
      </div>
      <Button variant="secondary" size="sm" onClick={() => go(shiftDate(date, 1))}>
        Next
      </Button>
    </div>
  );
}
