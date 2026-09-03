import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { ProjekteListe } from "./ProjekteListe";

export default async function ProjektePage() {
  const supabase = await createClient();

  const [{ data: projects }, { data: properties }, { data: ausgaben }] = await Promise.all([
    supabase.from("projects").select("*").order("erstellt_am", { ascending: false }),
    supabase.from("properties").select("id, name"),
    supabase.from("ausgaben").select("project_id, betrag"),
  ]);

  const propertyNames = new Map((properties ?? []).map((p) => [p.id, p.name]));
  const verplantByProject = new Map<string, number>();
  for (const a of ausgaben ?? []) {
    // Ausgaben koennen auch direkt an der Immobilie haengen — die zaehlen hier nicht mit.
    if (!a.project_id) continue;
    verplantByProject.set(a.project_id, (verplantByProject.get(a.project_id) ?? 0) + a.betrag);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Alle Projekte"
        title="Projekte"
        description="Alle Neubauten und Umbaumaßnahmen über alle deine Immobilien hinweg."
        action={
          <LinkButton href="/projekte/neu">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Projekt anlegen
          </LinkButton>
        }
      />

      {!projects?.length ? (
        <EmptyState
          title="Noch kein Projekt angelegt"
          description="Lege dein erstes Projekt an — einen Neubau oder eine Umbaumaßnahme."
          action={
            <Link
              href="/projekte/neu"
              className="text-sm font-bold text-terracotta hover:text-terracotta-hover"
            >
              Projekt anlegen →
            </Link>
          }
        />
      ) : (
        <ProjekteListe
          projekte={projects.map((project) => ({
            project,
            verplant: verplantByProject.get(project.id) ?? 0,
            propertyName: propertyNames.get(project.property_id),
          }))}
        />
      )}
    </div>
  );
}
