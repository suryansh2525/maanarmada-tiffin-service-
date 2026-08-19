import Link from "next/link";
import { BRAND_INITIAL, BRAND_NAME } from "@/lib/brand";

interface SiteHeaderProps {
  variant?: "customer" | "admin";
}

export function SiteHeader({ variant = "customer" }: SiteHeaderProps) {
  return (
    <header className="border-b border-border bg-surface-elevated">
      <div className="mx-auto flex min-h-14 max-w-5xl items-center justify-between px-4 py-2 sm:px-6">
        <Link href={variant === "admin" ? "/admin" : "/"} className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold text-text-on-brand">
            {BRAND_INITIAL}
          </span>
          <span className="text-sm font-semibold leading-tight text-text-primary sm:text-base">
            {BRAND_NAME}
          </span>
        </Link>
      </div>
    </header>
  );
}
