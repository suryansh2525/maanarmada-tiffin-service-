import { SiteHeader } from "@/components/layout/site-header";
import { BRAND_NAME } from "@/lib/brand";

export default function CustomerLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader variant="customer" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
      <footer className="border-t border-border py-6 text-center text-sm text-text-muted">
        {BRAND_NAME} · Fresh meals delivered daily
      </footer>
    </>
  );
}
