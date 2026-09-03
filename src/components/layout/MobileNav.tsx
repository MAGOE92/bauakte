"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./navItems";

/**
 * Ersetzt die Sidebar auf schmalen Bildschirmen. Unten statt oben links —
 * das ist mit dem Daumen erreichbar, eine Ecke am oberen Bildschirmrand
 * nicht. `env(safe-area-inset-bottom)` haelt Abstand zur Home-Leiste auf
 * iPhones ohne Home-Button.
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      data-drucken="aus"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
              active ? "text-terracotta" : "text-ink-soft"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2.25} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
