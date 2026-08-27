import { createClient } from "@/lib/supabase/server";
import { AusgabenSection } from "./AusgabenSection";
import { EinnahmenSection } from "./EinnahmenSection";

export async function BudgetTab({ projectId }: { projectId: string }) {
  const supabase = await createClient();
  const [{ data: ausgaben }, { data: einnahmen }] = await Promise.all([
    supabase.from("ausgaben").select("*").eq("project_id", projectId).order("erstellt_am", { ascending: false }),
    supabase.from("einnahmen").select("*").eq("project_id", projectId).order("datum", { ascending: false }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="font-display mb-4 text-xl font-bold text-ink">Ausgaben</h2>
        <AusgabenSection projectId={projectId} ausgaben={ausgaben ?? []} />
      </section>
      <section>
        <h2 className="font-display mb-4 text-xl font-bold text-ink">Einnahmen</h2>
        <EinnahmenSection projectId={projectId} einnahmen={einnahmen ?? []} />
      </section>
    </div>
  );
}
