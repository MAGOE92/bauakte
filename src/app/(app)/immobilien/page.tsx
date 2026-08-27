import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { immobilieStatusLabel, immobilieStatusTone, gebaeudeTypLabel } from "@/lib/labels";
import { Building2, FolderKanban, FileText, MapPin } from "lucide-react";
import { NewPropertyForm } from "./NewPropertyForm";

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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/immobilien/${property.id}`}
              className="flex flex-col gap-4 rounded-2xl border border-card-border bg-white p-6 transition-colors hover:border-terracotta"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta-soft text-terracotta-hover">
                  <Building2 className="h-5 w-5" strokeWidth={2.25} />
                </span>
                <Badge tone={immobilieStatusTone[property.status]}>
                  {immobilieStatusLabel[property.status]}
                </Badge>
              </div>

              <div>
                <p className="font-display text-lg font-bold text-ink">{property.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {property.adresse}
                </p>
                {property.typ && (
                  <p className="mt-2 text-xs font-semibold text-ink-soft">
                    {gebaeudeTypLabel[property.typ]}
                  </p>
                )}
              </div>

              <div className="mt-auto flex items-center gap-4 border-t border-card-border pt-4 text-xs font-semibold text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <FolderKanban className="h-3.5 w-3.5" />
                  {projectCount.get(property.id) ?? 0} Projekte
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  {documentCount.get(property.id) ?? 0} Unterlagen
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
