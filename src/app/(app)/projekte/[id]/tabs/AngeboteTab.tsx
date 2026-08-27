import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { freigabestufeLabel, freigabestufeTone } from "@/lib/labels";
import { Users, Mail, Phone } from "lucide-react";
import { NewVergabeForm } from "./NewVergabeForm";
import { VergabeCard } from "./VergabeCard";

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
            {projektFirmen.map((pf) => {
              const firma = firmenById.get(pf.firma_id);
              return (
                <div
                  key={pf.id}
                  className="flex items-center gap-3 rounded-xl border border-card-border bg-white px-4 py-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta-soft text-terracotta-hover">
                    <Users className="h-4 w-4" strokeWidth={2.25} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{firma?.name ?? "Firma"}</p>
                    <p className="text-xs text-ink-soft">
                      {pf.gewerk ?? "—"}
                      {firma?.ansprechpartner ? ` · ${firma.ansprechpartner}` : ""}
                    </p>
                    {(firma?.telefon || firma?.email) && (
                      <p className="mt-0.5 flex items-center gap-3 text-xs text-ink-soft">
                        {firma.telefon && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {firma.telefon}
                          </span>
                        )}
                        {firma.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {firma.email}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <Badge tone={freigabestufeTone[pf.freigabestufe]}>{freigabestufeLabel[pf.freigabestufe]}</Badge>
                </div>
              );
            })}
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
