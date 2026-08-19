import { AdminShell } from "@/components/layout/admin-shell";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardLayout({
  children,
}: LayoutProps<"/admin">) {
  if (!isSupabaseConfigured()) {
    return (
      <AdminShell userLabel="Preview mode — Supabase not connected" showSignOut={false}>
        {children}
      </AdminShell>
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

  const userLabel = profile?.full_name ?? user.email ?? "Kitchen";

  return <AdminShell userLabel={userLabel}>{children}</AdminShell>;
}
