import Link from "next/link";

const TABS = [
  { key: "unterlagen", label: "Unterlagen" },
  { key: "budget", label: "Budget & Ausgaben" },
  { key: "angebote", label: "Angebote" },
  { key: "freigaben", label: "Freigaben" },
] as const;

export type TabKey = (typeof TABS)[number]["key"];

export function TabNav({ projectId, active }: { projectId: string; active: TabKey }) {
  return (
    <div className="mb-6 flex gap-1 overflow-x-auto rounded-full border border-line bg-surface p-1">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={`/projekte/${projectId}?tab=${tab.key}`}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors ${
            active === tab.key ? "bg-terracotta text-white" : "text-ink-soft hover:text-ink"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

export function isTabKey(value: string | undefined): value is TabKey {
  return TABS.some((tab) => tab.key === value);
}
