import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTopBar } from "@/components/layout/MobileTopBar";
import { MobileNav } from "@/components/layout/MobileNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar email={user.email ?? ""} />
      <div className="flex min-h-screen flex-1 flex-col">
        <MobileTopBar />
        {/* pb-24 haelt Abstand zur fixierten Tab-Leiste unten auf dem Handy. */}
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 lg:px-10 lg:py-10 lg:pb-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
