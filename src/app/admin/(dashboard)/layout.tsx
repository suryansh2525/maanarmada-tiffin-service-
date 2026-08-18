import Link from "next/link";
import { signOut } from "@/actions/menu";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardLayout({
  children,
}: LayoutProps<"/admin">) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader variant="admin" />
        <div className="flex flex-1 flex-col lg:flex-row">
          <AdminSidebar />
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-border bg-surface-elevated px-4 py-3 sm:px-6">
              <div className="text-sm text-text-secondary">
                Preview mode
                <span className="ml-2 text-text-muted">(Supabase not connected)</span>
              </div>
              <Link
                href="/"
                className="text-sm text-text-secondary hover:text-brand"
              >
                View site
              </Link>
            </div>
            <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
          </div>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return children;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader variant="admin" />
      <div className="flex flex-1 flex-col lg:flex-row">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-border bg-surface-elevated px-4 py-3 sm:px-6">
            <div className="text-sm text-text-secondary">
              {profile?.full_name ?? user.email}
              <span className="ml-2 text-text-muted">({profile?.role})</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-sm text-text-secondary hover:text-brand"
              >
                View site
              </Link>
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="sm">
                  Sign out
                </Button>
              </form>
            </div>
          </div>
          <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
