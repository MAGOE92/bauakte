import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency } from "@/lib/format";
import type { BudgetSummary } from "@/lib/budget";

export function BudgetCard({ summary }: { summary: BudgetSummary }) {
  const ueberzogen = summary.nichtVerplant < 0;

  return (
    // Eigens statt der generischen Card: die wichtigste Zahl im Projekt soll
    // nicht optisch gleich wiegen wie eine Karte, die nur eine leere Tabelle
    // umschliesst — deshalb der Akzentstreifen oben.
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-line bg-surface shadow-card p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-terracotta" />
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.1em] text-ink-soft">
            Kostenrahmen
          </p>
          <p className="font-display mt-1 text-2xl font-extrabold text-ink">
            {formatCurrency(summary.verplant)}{" "}
            <span className="text-base font-semibold text-ink-soft">
              von {formatCurrency(summary.budgetGesamt)} verplant
            </span>
          </p>
        </div>
        {ueberzogen && (
          <span className="rounded-full bg-danger-soft px-3 py-1 text-xs font-bold text-danger">
            Kostenrahmen überschritten
          </span>
        )}
      </div>

      <ProgressBar percent={summary.fortschrittProzent} overBudget={ueberzogen} className="mt-4" />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <BudgetStat label="Verplant" value={summary.verplant} />
        <BudgetStat label="Bezahlt" value={summary.bezahlt} />
        <BudgetStat label="Noch offen" value={summary.offen} />
        <BudgetStat
          label="Nicht verplant"
          value={summary.nichtVerplant}
          negative={ueberzogen}
        />
        <BudgetStat label="Einnahmen" value={summary.einnahmen} />
      </div>
    </div>
  );
}

function BudgetStat({
  label,
  value,
  negative,
}: {
  label: string;
  value: number;
  negative?: boolean;
}) {
  return (
    <div className="rounded-xl bg-sunken px-4 py-3">
      <p className="text-xs font-semibold text-ink-soft">{label}</p>
      <p className={`font-display mt-1 text-lg font-bold ${negative ? "text-danger" : "text-ink"}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}
