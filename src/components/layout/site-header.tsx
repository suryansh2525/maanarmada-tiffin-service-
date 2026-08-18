import Link from "next/link";

interface SiteHeaderProps {
  variant?: "customer" | "admin";
}

export function SiteHeader({ variant = "customer" }: SiteHeaderProps) {
  return (
    <header className="border-b border-border bg-surface-elevated">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href={variant === "admin" ? "/admin" : "/"} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-text-on-brand">
            M
          </span>
          <span className="font-semibold text-text-primary">Maan Armada</span>
        </Link>
      </div>
    </header>
  );
}
