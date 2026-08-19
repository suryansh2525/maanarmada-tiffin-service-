"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  UtensilsCrossed,
  CalendarCheck,
  Settings,
  CircleAlert,
  ClipboardList,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { BRAND_INITIAL, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { signOut } from "@/actions/menu";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pending", label: "Pending verification", icon: CircleAlert },
  { href: "/admin/orders", label: "Today's orders", icon: ClipboardList },
  { href: "/admin/today", label: "Today's menu", icon: CalendarCheck },
  { href: "/admin/menu-items", label: "Menu items", icon: UtensilsCrossed },
  { href: "/admin/weekly-menu", label: "Weekly menu", icon: CalendarDays },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function NavLinks({
  onNavigate,
  pathname,
}: {
  onNavigate?: () => void;
  pathname: string;
}) {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-light text-brand"
                : "text-text-secondary hover:bg-brand-light/50 hover:text-text-primary",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

interface AdminShellProps {
  userLabel: string;
  showSignOut?: boolean;
  children: React.ReactNode;
}

export function AdminShell({
  userLabel,
  showSignOut = true,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-40 border-b border-border bg-surface-elevated">
        <div className="flex min-h-14 items-center gap-2 px-3 py-2 sm:px-4">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-text-primary hover:bg-brand-light lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/admin" className="flex min-w-0 flex-1 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold text-text-on-brand">
              {BRAND_INITIAL}
            </span>
            <span className="text-sm font-semibold leading-tight text-text-primary sm:text-base">
              {BRAND_NAME}
            </span>
          </Link>

          {showSignOut && (
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm" className="shrink-0">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </form>
          )}
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-text-primary/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-[min(18rem,85vw)] flex-col bg-surface-elevated shadow-md">
            <div className="flex h-14 items-center justify-between border-b border-border px-3">
              <span className="font-semibold text-text-primary">Menu</span>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-brand-light"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="truncate px-4 pt-3 text-xs text-text-muted">{userLabel}</p>
            <div className="flex-1 overflow-y-auto">
              <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>
            {showSignOut && (
              <div className="border-t border-border p-3">
                <form action={signOut}>
                  <Button type="submit" variant="secondary" className="w-full">
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Button>
                </form>
              </div>
            )}
          </aside>
        </div>
      )}

      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-border bg-surface-elevated lg:block">
          <p className="truncate border-b border-border px-4 py-3 text-xs text-text-muted">
            {userLabel}
          </p>
          <NavLinks pathname={pathname} />
        </aside>
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
