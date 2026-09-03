import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProjectCard } from "@/components/projects/ProjectCard";

export async function ProjekteTab({ propertyId }: { propertyId: string }) {
  const supabase = await createClient();

  const [{ data: projects }, { data: ausgaben }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("property_id", propertyId)
      .order("erstellt_am", { ascending: false }),
    supabase.from("ausgaben").select("project_id, betrag").eq("property_id", propertyId),
  ]);

  const verplantByProject = new Map<string, number>();
  for (const a of ausgaben ?? []) {
    // Ausgaben koennen auch direkt an der Immobilie haengen — die zaehlen hier nicht mit.
    if (!a.project_id) continue;
    verplantByProject.set(a.project_id, (verplantByProject.get(a.project_id) ?? 0) + a.betrag);
  }

  if (!projects?.length) {
    return (
      <EmptyState
        title="Noch kein Projekt angelegt"
        description="Lege ein Projekt an, z. B. einen Neubau oder eine Umbaumaßnahme."
        action={
          <Link
            href={`/immobilien/${propertyId}/projekte/neu`}
            className="text-sm font-bold text-terracotta hover:text-terracotta-hover"
          >
            Projekt anlegen →
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          verplant={verplantByProject.get(project.id) ?? 0}
        />
      ))}
    </div>
  );
}
