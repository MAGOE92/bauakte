import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, formatFlaeche, formatProzent } from "@/lib/format";
import { laufendKategorieLabel } from "@/lib/labels";
import { berechneNebenkosten } from "@/lib/cashflow";
import { AbrechnungSteuerung } from "./AbrechnungSteuerung";

/** Ohne Angabe wird das abgelaufene Kalenderjahr abgerechnet — der Normalfall. */
function standardZeitraum() {
  const jahr = new Date().getFullYear() - 1;
  return { von: `${jahr}-01-01`, bis: `${jahr}-12-31` };
}

function leseDatum(wert: string | string[] | undefined, ersatz: string) {
  return typeof wert === "string" && /^\d{4}-\d{2}-\d{2}$/.test(wert) ? wert : ersatz;
}

export default async function NebenkostenPage(
  props: PageProps<"/immobilien/[id]/nebenkosten/[einheitId]">
) {
  const { id, einheitId } = await props.params;
  const searchParams = await props.searchParams;
  const standard = standardZeitraum();
  const von = leseDatum(searchParams.von, standard.von);
  const bis = leseDatum(searchParams.bis, standard.bis);

  const supabase = await createClient();

  const [{ data: property }, { data: einheiten }, { data: posten }] = await Promise.all([
    supabase.from("properties").select("name, adresse").eq("id", id).maybeSingle(),
    supabase
      .from("einheiten")
      .select("id, name, wohnflaeche, mieter_name")
      .eq("property_id", id)
      .order("name"),
    supabase.from("laufende_posten").select("*").eq("property_id", id),
  ]);

  const einheit = einheiten?.find((e) => e.id === einheitId);
  if (!property || !einheit) notFound();

  const abrechnung = berechneNebenkosten(von, bis, einheit, einheiten ?? [], posten ?? []);
  const nachzahlung = abrechnung.saldo < 0;

  return (
    <div>
      <Link
        href={`/immobilien/${id}?tab=einheiten`}
        data-drucken="aus"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Immobilie
      </Link>

      <AbrechnungSteuerung
        basisPfad={`/immobilien/${id}/nebenkosten/${einheitId}`}
        von={von}
        bis={bis}
      />

      {abrechnung.hinweise.length > 0 && (
        <div data-drucken="aus" className="mb-8 flex flex-col gap-3">
          {abrechnung.hinweise.map((hinweis) => (
            <p
              key={hinweis}
              className="flex items-start gap-2.5 rounded-2xl border border-warning/40 bg-warning-soft px-5 py-4 text-sm text-warning"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {hinweis}
            </p>
          ))}
        </div>
      )}

      {/* Ab hier das eigentliche Dokument — genau so kommt es aufs Papier. */}
      <article className="rounded-2xl border border-line bg-surface p-10 shadow-card print:rounded-none print:border-0 print:p-0">
        <header className="border-b border-line pb-6">
          <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
            {property.name}
          </p>
          <h1 className="font-display mt-1 text-3xl font-extrabold text-ink">
            Nebenkostenabrechnung
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Abrechnungszeitraum {formatDate(von)} – {formatDate(bis)}
          </p>
        </header>

        <dl className="grid grid-cols-1 gap-x-10 gap-y-4 border-b border-line py-6 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-ink-soft">Objekt</dt>
            <dd className="mt-0.5 text-ink">{property.adresse}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-soft">Wohneinheit</dt>
            <dd className="mt-0.5 text-ink">{einheit.name}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-soft">Mieter</dt>
            <dd className="mt-0.5 text-ink">{einheit.mieter_name ?? "–"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-soft">Umlageschlüssel</dt>
            <dd className="mt-0.5 text-ink">
              {formatFlaeche(einheit.wohnflaeche)} von {formatFlaeche(abrechnung.wohnflaecheGesamt)}
              {abrechnung.umlageschluessel > 0 && (
                <> · {formatProzent(abrechnung.umlageschluessel * 100)}</>
              )}
            </dd>
          </div>
        </dl>

        <section className="py-6">
          <h2 className="font-display mb-4 text-base font-bold text-ink">
            Umlagefähige Betriebskosten
          </h2>

          {!abrechnung.zeilen.length ? (
            <p className="rounded-xl border border-dashed border-line px-5 py-8 text-center text-sm text-ink-soft">
              Für diesen Zeitraum sind keine umlagefähigen Kosten hinterlegt.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-line-strong text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    <th className="py-2.5 pr-4">Kostenart</th>
                    <th className="py-2.5 pr-4 text-right">Gesamtkosten</th>
                    <th className="py-2.5 pr-4">Schlüssel</th>
                    <th className="py-2.5 pr-4 text-right">Anteil</th>
                    <th className="py-2.5 text-right">Ihr Anteil</th>
                  </tr>
                </thead>
                <tbody>
                  {abrechnung.zeilen.map((zeile, index) => (
                    <tr key={`${zeile.kategorie}-${index}`} className="border-b border-line">
                      <td className="py-3 pr-4">
                        <span className="font-semibold text-ink">{zeile.bezeichnung}</span>
                        <span className="block text-xs text-ink-soft">
                          {laufendKategorieLabel[zeile.kategorie]}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right text-ink">
                        {formatCurrency(zeile.gesamtbetrag)}
                      </td>
                      <td className="py-3 pr-4 text-ink-soft">
                        {zeile.schluessel === "direkt" ? "Direkt zugeordnet" : "Wohnfläche"}
                      </td>
                      <td className="py-3 pr-4 text-right text-ink-soft">
                        {formatProzent(zeile.anteilProzent)}
                      </td>
                      <td className="py-3 text-right font-semibold text-ink">
                        {formatCurrency(zeile.anteilBetrag)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="py-3 pr-4 text-right font-semibold text-ink">
                      Summe umlagefähige Kosten
                    </td>
                    <td className="py-3 text-right font-bold text-ink">
                      {formatCurrency(abrechnung.summeKosten)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>

        <section className="border-t border-line py-6">
          <dl className="ml-auto flex max-w-md flex-col gap-2.5 text-sm tabular-nums">
            <div className="flex justify-between gap-6">
              <dt className="text-ink-soft">Umlagefähige Kosten</dt>
              <dd className="text-ink">{formatCurrency(abrechnung.summeKosten)}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="text-ink-soft">Geleistete Vorauszahlungen</dt>
              <dd className="text-ink">− {formatCurrency(abrechnung.summeVorauszahlungen)}</dd>
            </div>
            <div className="mt-2 flex justify-between gap-6 border-t border-line-strong pt-3">
              <dt className="font-display font-bold text-ink">
                {nachzahlung ? "Nachzahlung" : "Guthaben"}
              </dt>
              <dd className="font-display text-xl font-extrabold text-ink">
                {formatCurrency(Math.abs(abrechnung.saldo))}
              </dd>
            </div>
          </dl>
        </section>

        <footer className="border-t border-line pt-6 text-xs leading-relaxed text-ink-soft">
          <p>
            Die Umlage erfolgt nach Wohnfläche (§ 556a Abs. 1 BGB), sofern im Mietvertrag kein
            anderer Schlüssel vereinbart ist. Direkt zugeordnete Posten werden der Einheit voll
            berechnet. Nicht umlagefähig und daher nicht enthalten sind Verwaltungskosten,
            Instandhaltung und Finanzierungskosten (§ 1 Abs. 2 BetrKV).
          </p>
          <p className="mt-3">
            Erstellt mit Bauakte am {formatDate(new Date().toISOString())}. Diese Aufstellung ersetzt
            keine rechtliche oder steuerliche Beratung — bitte vor dem Versand an den Mieter prüfen.
          </p>
        </footer>
      </article>
    </div>
  );
}
