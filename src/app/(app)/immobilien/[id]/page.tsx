import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { DocumentList } from "@/components/documents/DocumentList";
import { immobilieStatusLabel, immobilieStatusTone, gebaeudeTypLabel, dokumentKategorien } from "@/lib/labels";
import { Plus, FolderKanban, FileText, MapPin } from "lucide-react";
import { EditPropertyForm } from "./EditPropertyForm";

export default async function ImmobilieDetailPage(props: PageProps<"/immobilien/[id]">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: property } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
  if (!property) notFound();

  const [{ data: projects }, { data: ausgaben }, { data: documents }] = await Promise.all([
    supabase.from("projects").select("*").eq("property_id", id).order("erstellt_am", { ascending: false }),
    supabase.from("ausgaben").select("project_id, betrag"),
    supabase
      .from("documents")
      .select("id, name, kategorie, hochgeladen_am, datei_groesse_bytes, storage_pfad")
      .eq("property_id", id)
      .is("project_id", null)
      .order("hochgeladen_am", { ascending: false }),
  ]);

  const verplantByProject = new Map<string, number>();
  for (const a of ausgaben ?? []) {
    verplantByProject.set(a.project_id, (verplantByProject.get(a.project_id) ?? 0) + a.betrag);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Immobilie"
        title={property.name}
        description={undefined}
        action={
          <LinkButton href={`/immobilien/${id}/projekte/neu`}>
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Projekt anlegen
          </LinkButton>
        }
      />

      <div className="-mt-6 mb-8 flex flex-wrap items-center gap-3">
        <p className="flex items-center gap-1.5 text-sm text-ink-soft">
          <MapPin className="h-4 w-4" />
          {property.adresse}
          {property.typ && <span>· {gebaeudeTypLabel[property.typ]}</span>}
        </p>
        <EditPropertyForm property={property} />
      </div>

      <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-card-border bg-white p-5">
          <p className="font-display text-xs font-bold uppercase tracking-[0.1em] text-ink-soft">Status</p>
          <div className="mt-3">
            <Badge tone={immobilieStatusTone[property.status]}>{immobilieStatusLabel[property.status]}</Badge>
          </div>
        </div>
        <StatCard label="Projekte" value={String(projects?.length ?? 0)} icon={<FolderKanban className="h-4 w-4" strokeWidth={2.25} />} />
        <StatCard label="Unterlagen" value={String(documents?.length ?? 0)} icon={<FileText className="h-4 w-4" strokeWidth={2.25} />} />
      </div>

      <section className="mb-10">
        <h2 className="font-display mb-4 text-xl font-bold text-ink">Projekte</h2>
        {!projects?.length ? (
          <EmptyState
            title="Noch kein Projekt angelegt"
            description="Lege ein Projekt an, z. B. einen Neubau oder eine Umbaumaßnahme."
            action={
              <Link href={`/immobilien/${id}/projekte/neu`} className="text-sm font-bold text-terracotta hover:text-terracotta-hover">
                Projekt anlegen →
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} verplant={verplantByProject.get(project.id) ?? 0} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display mb-4 text-xl font-bold text-ink">Unterlagen der Immobilie</h2>
        <div className="flex flex-col gap-5">
          <DocumentUploader
            propertyId={id}
            projectId={null}
            categories={dokumentKategorien}
            revalidate={`/immobilien/${id}`}
          />
          <DocumentList documents={documents ?? []} revalidate={`/immobilien/${id}`} />
        </div>
      </section>
    </div>
  );
}
