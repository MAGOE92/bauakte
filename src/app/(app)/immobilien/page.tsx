import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { NewPropertyForm } from "./NewPropertyForm";
import { ImmobilienListe } from "./ImmobilienListe";

export default async function ImmobilienPage() {
  const supabase = await createClient();

  const [{ data: properties }, { data: projects }, { data: documents }] = await Promise.all([
    supabase.from("properties").select("*").order("erstellt_am", { ascending: false }),
    supabase.from("projects").select("id, property_id"),
    supabase.from("documents").select("id, property_id"),
  ]);

  const projectCount = new Map<string, number>();
  for (const p of projects ?? []) {
    projectCount.set(p.property_id, (projectCount.get(p.property_id) ?? 0) + 1);
  }
  const documentCount = new Map<string, number>();
  for (const d of documents ?? []) {
    documentCount.set(d.property_id, (documentCount.get(d.property_id) ?? 0) + 1);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Deine Objekte"
        title="Immobilien"
        description="Verwalte alle deine Immobilien mit Unterlagen, Projekten und Ausgaben an einem Ort."
        action={<NewPropertyForm />}
      />

      {!properties?.length ? (
        <EmptyState
          title="Noch keine Immobilie angelegt"
          description="Lege deine erste Immobilie an, um Unterlagen und Projekte zu verwalten."
        />
      ) : (
        <ImmobilienListe
          properties={properties.map((p) => ({
            ...p,
            projektAnzahl: projectCount.get(p.id) ?? 0,
            unterlagenAnzahl: documentCount.get(p.id) ?? 0,
          }))}
        />
      )}
    </div>
  );
}
