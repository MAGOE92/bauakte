import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Scale, CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import { laufendKategorieLabel } from "@/lib/labels";
import { berechneCashflow, jahresZeitraum, type KategorieAnteil } from "@/lib/cashflow";
import { LaufendePostenSection } from "./LaufendePostenSection";

export async function CashflowTab({
  propertyId,
  jahr,
}: {
  propertyId: string;
  jahr: number;
}) {
  const supabase = await createClient();
  const { von, bis } = jahresZeitraum(jahr);

  const [{ data: posten }, { data: einheiten }, { data: einnahmen }, { data: ausgaben }] =
    await Promise.all([
      supabase
        .from("laufende_posten")
        .select("*")
        .eq("property_id", propertyId)
        .order("art")
        .order("bezeichnung"),
      supabase.from("einheiten").select("id, name").eq("property_id", propertyId).order("name"),
      supabase
        .from("einnahmen")
        .select("betrag, datum")
        .eq("property_id", propertyId)
        .gte("datum", von)
        .lte("datum", bis),
      // Gebucht wird nach Zahlung; unbezahlte Rechnungen sind noch kein Abfluss.
      supabase
        .from("ausgaben")
        .select("betrag, bezahlt_am")
        .eq("property_id", propertyId)
        .eq("bezahlt", true)
        .gte("bezahlt_am", von)
        .lte("bezahlt_am", bis),
    ]);

  const cashflow = berechneCashflow(
    von,
    bis,
    posten ?? [],
    einnahmen ?? [],
    (ausgaben ?? []).map((a) => ({ betrag: a.betrag, datum: a.bezahlt_am }))
  );

  const aktuellesJahr = new Date().getFullYear();
  const jahre = [aktuellesJahr - 2, aktuellesJahr - 1, aktuellesJahr, aktuellesJahr + 1];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
          <CalendarDays className="h-4 w-4" />
          Jahr
        </span>
        {jahre.map((j) => (
          <Link
            key={j}
            href={`/immobilien/${propertyId}?tab=cashflow&jahr=${j}`}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              j === jahr
                ? "bg-terracotta text-white"
                : "border border-line bg-surface text-ink-soft hover:text-ink"
            }`}
          >
            {j}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Einnahmen"
          value={formatCurrency(cashflow.einnahmenGesamt)}
          hint={`davon ${formatCurrency(cashflow.laufendeEinnahmen)} laufend`}
          icon={<ArrowUpRight className="h-4 w-4" strokeWidth={2.25} />}
        />
        <StatCard
          label="Kosten"
          value={formatCurrency(cashflow.kostenGesamt)}
          hint={`davon ${formatCurrency(cashflow.laufendeKosten)} laufend`}
          icon={<ArrowDownRight className="h-4 w-4" strokeWidth={2.25} />}
        />
        <StatCard
          label={cashflow.ueberschuss >= 0 ? "Überschuss" : "Unterdeckung"}
          value={formatCurrency(cashflow.ueberschuss)}
          hint={`${formatCurrency(cashflow.proMonat)} pro Monat`}
          icon={<Scale className="h-4 w-4" strokeWidth={2.25} />}
        />
        <StatCard
          label="Einmalig gebucht"
          value={formatCurrency(cashflow.gebuchteKosten)}
          hint="Bezahlte Rechnungen aus Projekten"
        />
      </div>

      {(cashflow.einnahmenNachKategorie.length > 0 ||
        cashflow.kostenNachKategorie.length > 0) && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <KategorieKarte
            titel="Einnahmen nach Kategorie"
            zeilen={cashflow.einnahmenNachKategorie}
            summe={cashflow.laufendeEinnahmen}
          />
          <KategorieKarte
            titel="Kosten nach Kategorie"
            zeilen={cashflow.kostenNachKategorie}
            summe={cashflow.laufendeKosten}
          />
        </div>
      )}

      <p className="rounded-2xl border border-line bg-sunken px-5 py-4 text-sm text-ink-soft">
        Der Cashflow zeigt, was tatsächlich fließt. Das steuerliche Ergebnis ist eine andere
        Rechnung: dort zählt die Tilgung nicht als Kosten, dafür aber die Abschreibung.
      </p>

      <LaufendePostenSection
        propertyId={propertyId}
        posten={posten ?? []}
        einheiten={einheiten ?? []}
      />
    </div>
  );
}

function KategorieKarte({
  titel,
  zeilen,
  summe,
}: {
  titel: string;
  zeilen: KategorieAnteil[];
  summe: number;
}) {
  if (!zeilen.length) return null;

  return (
    <Card>
      <h3 className="font-display mb-4 text-base font-bold text-ink">{titel}</h3>
      <ul className="flex flex-col gap-3">
        {zeilen.map((zeile) => (
          <li key={zeile.kategorie}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-ink">{laufendKategorieLabel[zeile.kategorie]}</span>
              <span className="font-semibold tabular-nums text-ink">
                {formatCurrency(zeile.betrag)}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sunken">
              <div
                className="h-full rounded-full bg-terracotta"
                style={{ width: `${summe > 0 ? (zeile.betrag / summe) * 100 : 0}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
