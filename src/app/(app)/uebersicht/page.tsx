import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { immobilieStatusLabel, immobilieStatusTone } from "@/lib/labels";
import { Building2, FolderKanban, Wallet, Receipt, CalendarClock, FileText, MapPin } from "lucide-react";

export default async function UebersichtPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: properties }, { data: projects }, { data: ausgaben }, { data: documents }] = await Promise.all([
    supabase.from("properties").select("*").order("erstellt_am", { ascending: false }),
    supabase.from("projects").select("*"),
    supabase.from("ausgaben").select("betrag, project_id"),
    supabase
      .from("documents")
      .select("id, name, kategorie, hochgeladen_am, property_id, project_id")
      .order("hochgeladen_am", { ascending: false })
      .limit(5),
  ]);

  const propertyById = new Map((properties ?? []).map((p) => [p.id, p]));

  // Die Uebersicht zeigt den aktuellen Stand. Abgeschlossene und verworfene
  // Projekte zaehlen deshalb nicht mehr mit — ihre Zahlen stehen weiter im
  // Projekt selbst und im Cashflow der Immobilie.
  const offeneProjekte = (projects ?? []).filter(
    (p) => p.status === "geplant" || p.status === "laufend"
  );
  const abgeschlossene = (projects ?? []).filter((p) => p.status === "abgeschlossen");
  const offeneIds = new Set(offeneProjekte.map((p) => p.id));

  const gesamtbudget = offeneProjekte.reduce((sum, p) => sum + p.budget_gesamt, 0);
  const gesamtausgaben = (ausgaben ?? [])
    .filter((a) => a.project_id !== null && offeneIds.has(a.project_id))
    .reduce((sum, a) => sum + a.betrag, 0);

  const heute = new Date().toISOString().slice(0, 10);
  const naechsteFrist = offeneProjekte
    .filter((p) => p.zeitraum_bis && p.zeitraum_bis >= heute)
    .sort((a, b) => a.zeitraum_bis!.localeCompare(b.zeitraum_bis!))[0];

  const displayName =
    (user?.user_metadata?.full_name as string | undefined)?.trim() || user?.email?.split("@")[0] || "";

  return (
    <div>
      <div className="mb-8">
        <Eyebrow>Übersicht</Eyebrow>
        <h1 className="font-display mt-1 text-3xl font-extrabold text-ink">
          Willkommen zurück{displayName ? `, ${displayName}` : ""}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">Hier ist der aktuelle Stand deiner Immobilien und Projekte.</p>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Immobilien" value={String(properties?.length ?? 0)} icon={<Building2 className="h-4 w-4" strokeWidth={2.25} />} />
        <StatCard
          label="Offene Projekte"
          value={String(offeneProjekte.length)}
          hint={abgeschlossene.length ? `${abgeschlossene.length} abgeschlossen` : undefined}
          icon={<FolderKanban className="h-4 w-4" strokeWidth={2.25} />}
        />
        <StatCard label="Kostenrahmen" value={formatCurrency(gesamtbudget)} hint="Offene Projekte" icon={<Wallet className="h-4 w-4" strokeWidth={2.25} />} />
        <StatCard label="Verplant" value={formatCurrency(gesamtausgaben)} hint="Kosten offener Projekte" icon={<Receipt className="h-4 w-4" strokeWidth={2.25} />} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="font-display mb-4 text-xl font-bold text-ink">Deine Immobilien</h2>
          {!properties?.length ? (
            <EmptyState
              title="Noch keine Immobilie angelegt"
              action={
                <Link href="/immobilien" className="text-sm font-bold text-terracotta hover:text-terracotta-hover">
                  Immobilie anlegen →
                </Link>
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              {properties.slice(0, 5).map((property) => (
                <Link
                  key={property.id}
                  href={`/immobilien/${property.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-line bg-surface shadow-card px-5 py-4 transition-colors hover:border-terracotta"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-soft text-terracotta-hover">
                    <Building2 className="h-4 w-4" strokeWidth={2.25} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{property.name}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-ink-soft">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {property.adresse}
                    </p>
                  </div>
                  <Badge tone={immobilieStatusTone[property.status]}>{immobilieStatusLabel[property.status]}</Badge>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-col gap-8">
          <section>
            <h2 className="font-display mb-4 text-xl font-bold text-ink">Als Nächstes</h2>
            {!naechsteFrist ? (
              <Card>
                <p className="text-sm text-ink-soft">Keine anstehenden Projekt-Fristen.</p>
              </Card>
            ) : (
              <Link href={`/projekte/${naechsteFrist.id}`}>
                <Card className="transition-colors hover:border-terracotta">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-soft text-terracotta-hover">
                      <CalendarClock className="h-4 w-4" strokeWidth={2.25} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{naechsteFrist.name}</p>
                      <p className="text-xs text-ink-soft">
                        {propertyById.get(naechsteFrist.property_id)?.name} · endet {formatDate(naechsteFrist.zeitraum_bis)}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            )}
          </section>

          <section>
            <h2 className="font-display mb-4 text-xl font-bold text-ink">Letzte Aktivität</h2>
            {!documents?.length ? (
              <Card>
                <p className="text-sm text-ink-soft">Noch keine Unterlagen hochgeladen.</p>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sunken text-ink-soft">
                        <FileText className="h-4 w-4" strokeWidth={2.25} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{doc.name}</p>
                        <p className="text-xs text-ink-soft">
                          {propertyById.get(doc.property_id)?.name ?? ""} · {formatDate(doc.hochgeladen_am)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
