import { LayoutGrid, Building2, FolderKanban, Settings } from "lucide-react";

/** Geteilt zwischen der Desktop-Sidebar und der mobilen Tab-Leiste unten. */
export const NAV_ITEMS = [
  { href: "/uebersicht", label: "Übersicht", icon: LayoutGrid },
  { href: "/immobilien", label: "Immobilien", icon: Building2 },
  { href: "/projekte", label: "Projekte", icon: FolderKanban },
  { href: "/einstellungen", label: "Einstellungen", icon: Settings },
] as const;
