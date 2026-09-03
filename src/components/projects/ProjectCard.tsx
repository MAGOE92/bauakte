import Link from "next/link";
import { FolderKanban, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { projektStatusLabel, projektStatusTone } from "@/lib/labels";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Tables } from "@/lib/supabase/database.types";

export function ProjectCard({
  project,
  verplant,
  propertyName,
}: {
  project: Tables<"projects">;
  verplant: number;
  propertyName?: string;
}) {
  const percent = project.budget_gesamt > 0 ? Math.min(100, (verplant / project.budget_gesamt) * 100) : 0;
  const overBudget = verplant > project.budget_gesamt;

  return (
    <Link
      href={`/projekte/${project.id}`}
      className="flex flex-col gap-4 rounded-2xl border border-line bg-surface shadow-card p-6 transition-colors hover:border-terracotta"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta-soft text-terracotta-hover">
          <FolderKanban className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <Badge tone={projektStatusTone[project.status]}>{projektStatusLabel[project.status]}</Badge>
      </div>

      <div>
        <p className="font-display text-lg font-bold text-ink">{project.name}</p>
        {propertyName && <p className="mt-1 text-sm text-ink-soft">{propertyName}</p>}
        {(project.zeitraum_von || project.zeitraum_bis) && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(project.zeitraum_von)} – {formatDate(project.zeitraum_bis)}
          </p>
        )}
      </div>

      <div className="mt-auto">
        <div className="flex items-center justify-between text-xs font-semibold text-ink-soft">
          <span>{formatCurrency(verplant)} verplant</span>
          <span>von {formatCurrency(project.budget_gesamt)}</span>
        </div>
        <ProgressBar percent={percent} overBudget={overBudget} className="mt-2" />
      </div>
    </Link>
  );
}
