import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { NewVergabeForm } from "./NewVergabeForm";
import { VergabeCard } from "./VergabeCard";
import { ProjektFirmaCard } from "./ProjektFirmaCard";

export async function AngeboteTab({ projectId, propertyId }: { projectId: string; propertyId: string }) {
  const supabase = await createClient();

  const [{ data: vergaben }, { data: angebote }, { data: firmen }, { data: projektFirmen }, { data: documents }] =
    await Promise.all([
      supabase.from("vergaben").select("*").eq("project_id", projectId).order("erstellt_am", { ascending: false }),
      supabase.from("angebote").select("*").eq("project_id", projectId),
      supabase.from("firmen").select("*").order("name"),
      supabase.from("projekt_firmen").select("*").eq("project_id", projectId),
      supabase
        .from("documents")
        .select("id, name, kategorie")
        .eq("property_id", propertyId)
        .or(`project_id.eq.${projectId},project_id.is.null`),
    ]);

  const firmenById = new Map((firmen ?? []).map((f) => [f.id, f]));

  return (
    <div className="flex flex-col gap-8">
      {!!projektFirmen?.length && (
        <section>
          <h2 className="font-display mb-4 text-xl font-bold text-ink">Firmen im Projekt</h2>
          <div className="flex flex-wrap gap-3">
            {projektFirmen.map((pf) => (
              <ProjektFirmaCard
                key={pf.id}
                projektFirma={pf}
                firma={firmenById.get(pf.firma_id)}
                projectId={projectId}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-ink">Ausschreibungen</h2>
        </div>
        <div className="flex flex-col gap-5">
          <NewVergabeForm projectId={projectId} documents={documents ?? []} />

          {!vergaben?.length ? (
            <EmptyState
              title="Noch keine Ausschreibung erstellt"
              description="Erstelle eine Ausschreibung für ein Gewerk, damit sich Firmen bewerben können."
            />
          ) : (
            vergaben.map((vergabe) => (
              <VergabeCard
                key={vergabe.id}
                vergabe={vergabe}
                projectId={projectId}
                angebote={(angebote ?? []).filter((a) => a.vergabe_id === vergabe.id)}
                firmen={firmen ?? []}
                firmenById={firmenById}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
