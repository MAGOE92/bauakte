"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, FolderKanban, FileText, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import { immobilieStatusLabel, immobilieStatusTone, gebaeudeTypLabel } from "@/lib/labels";
import type { Enums, Tables } from "@/lib/supabase/database.types";

type Immobilie = Tables<"properties"> & {
  projektAnzahl: number;
  unterlagenAnzahl: number;
};

export function ImmobilienListe({ properties }: { properties: Immobilie[] }) {
  const [suche, setSuche] = useState("");

  // Erst ab ein paar Objekten lohnt sich das Suchfeld ueberhaupt.
  const zeigeSuche = properties.length > 4;

  const gefiltert = suche.trim()
    ? properties.filter((p) => {
        const text = `${p.name} ${p.adresse}`.toLowerCase();
        return text.includes(suche.trim().toLowerCase());
      })
    : properties;

  return (
    <div>
      {zeigeSuche && (
        <div className="mb-6">
          <SearchInput value={suche} onChange={setSuche} placeholder="Name oder Adresse suchen…" />
        </div>
      )}

      {!gefiltert.length ? (
        <EmptyState title="Keine Immobilie gefunden" description={`Nichts passt zu „${suche}".`} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gefiltert.map((property) => (
            <ImmobilieKarte key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}

function ImmobilieKarte({ property }: { property: Immobilie }) {
  return (
    <Link
      href={`/immobilien/${property.id}`}
      className="flex flex-col gap-4 rounded-2xl border border-line bg-surface shadow-card p-6 transition-colors hover:border-terracotta"
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
            {gebaeudeTypLabel[property.typ as Enums<"gebaeude_typ">]}
          </p>
        )}
      </div>

      <div className="mt-auto flex items-center gap-4 border-t border-line pt-4 text-xs font-semibold text-ink-soft">
        <span className="flex items-center gap-1.5">
          <FolderKanban className="h-3.5 w-3.5" />
          {property.projektAnzahl} Projekte
        </span>
        <span className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          {property.unterlagenAnzahl} Unterlagen
        </span>
      </div>
    </Link>
  );
}
