import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency } from "@/lib/format";
import type { BudgetSummary } from "@/lib/budget";

export function BudgetCard({ summary }: { summary: BudgetSummary }) {
  const overBudget = summary.verfuegbar < 0;

  return (
    <Card className="mb-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.1em] text-ink-soft">
            Budgetfortschritt
          </p>
          <p className="font-display mt-1 text-2xl font-extrabold text-ink">
            {formatCurrency(summary.verplant)}{" "}
            <span className="text-base font-semibold text-ink-soft">
              von {formatCurrency(summary.budgetGesamt)}
            </span>
          </p>
        </div>
        {overBudget && (
          <span className="rounded-full bg-danger-soft px-3 py-1 text-xs font-bold text-danger">
            Budget überschritten
          </span>
        )}
      </div>

      <ProgressBar percent={summary.fortschrittProzent} overBudget={overBudget} className="mt-4" />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <BudgetStat label="Verplant" value={summary.verplant} />
        <BudgetStat label="Bezahlt" value={summary.bezahlt} />
        <BudgetStat label="Verfügbar" value={summary.verfuegbar} negative={overBudget} />
        <BudgetStat label="Einnahmen" value={summary.einnahmen} />
      </div>
    </Card>
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
