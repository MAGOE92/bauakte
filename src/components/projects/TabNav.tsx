import { TabNav as BasisTabNav } from "@/components/ui/TabNav";

const TABS = [
  { key: "unterlagen", label: "Unterlagen" },
  { key: "budget", label: "Kosten & Einnahmen" },
  { key: "angebote", label: "Angebote" },
  { key: "freigaben", label: "Freigaben" },
] as const;

export type TabKey = (typeof TABS)[number]["key"];

export function TabNav({ projectId, active }: { projectId: string; active: TabKey }) {
  return <BasisTabNav basePath={`/projekte/${projectId}`} tabs={TABS} active={active} />;
}

export function isTabKey(value: string | undefined): value is TabKey {
  return TABS.some((tab) => tab.key === value);
}
