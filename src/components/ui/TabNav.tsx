import Link from "next/link";

export type Tab = { key: string; label: string };

/**
 * Reiter als Links (nicht als Buttons) — damit jeder Reiter eine eigene
 * Adresse hat, die man verschicken und mit dem Zurueck-Knopf verlassen kann.
 */
export function TabNav({
  basePath,
  tabs,
  active,
}: {
  basePath: string;
  tabs: readonly Tab[];
  active: string;
}) {
  return (
    <div className="mb-6 flex gap-1 overflow-x-auto rounded-full border border-line bg-surface p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`${basePath}?tab=${tab.key}`}
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

/** Liest den Reiter aus der Adresse und faellt auf den ersten zurueck. */
export function leseTab<T extends readonly Tab[]>(
  tabs: T,
  wert: string | string[] | undefined
): T[number]["key"] {
  return typeof wert === "string" && tabs.some((tab) => tab.key === wert)
    ? wert
    : tabs[0].key;
}
