"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Building2, FolderKanban, Settings, LogOut, ShieldCheck } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  { href: "/uebersicht", label: "Übersicht", icon: LayoutGrid },
  { href: "/immobilien", label: "Immobilien", icon: Building2 },
  { href: "/projekte", label: "Projekte", icon: FolderKanban },
  { href: "/einstellungen", label: "Einstellungen", icon: Settings },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-navy px-4 py-6 text-white">
      <div className="flex items-center gap-3 px-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta font-display text-lg font-extrabold">
          B
        </span>
        <span className="font-display text-xl font-extrabold">Bauakte</span>
      </div>

      <nav className="mt-10 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-terracotta text-white"
                  : "text-white/70 hover:bg-navy-soft hover:text-white"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-4">
        <div className="rounded-xl bg-navy-soft p-3 text-xs text-white/70">
          <div className="mb-1 flex items-center gap-2 font-display font-bold text-white">
            <ShieldCheck className="h-4 w-4 text-terracotta" strokeWidth={2.5} />
            Datenschutz
          </div>
          Deine Unterlagen sind nur für dich und die Firmen sichtbar, die du dafür freigibst.
        </div>

        <ThemeToggle />

        <div className="flex items-center gap-3 border-t border-white/10 pt-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 font-display text-sm font-bold uppercase">
            {email.slice(0, 2)}
          </span>
          <span className="flex-1 truncate text-xs text-white/70">{email}</span>
          <form action={signOut}>
            <button
              type="submit"
              title="Abmelden"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" strokeWidth={2.25} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
