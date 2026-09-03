"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { Tables } from "@/lib/supabase/database.types";

type Projekt = {
  project: Tables<"projects">;
  verplant: number;
  propertyName?: string;
};

export function ProjekteListe({ projekte }: { projekte: Projekt[] }) {
  const [suche, setSuche] = useState("");

  const zeigeSuche = projekte.length > 4;

  const gefiltert = suche.trim()
    ? projekte.filter(({ project, propertyName }) => {
        const text = `${project.name} ${propertyName ?? ""}`.toLowerCase();
        return text.includes(suche.trim().toLowerCase());
      })
    : projekte;

  return (
    <div>
      {zeigeSuche && (
        <div className="mb-6">
          <SearchInput value={suche} onChange={setSuche} placeholder="Projekt oder Immobilie suchen…" />
        </div>
      )}

      {!gefiltert.length ? (
        <EmptyState title="Kein Projekt gefunden" description={`Nichts passt zu „${suche}".`} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gefiltert.map(({ project, verplant, propertyName }) => (
            <ProjectCard key={project.id} project={project} verplant={verplant} propertyName={propertyName} />
          ))}
        </div>
      )}
    </div>
  );
}
