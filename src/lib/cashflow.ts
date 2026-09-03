import type { Enums } from "@/lib/supabase/database.types";

export type Turnus = Enums<"turnus">;
export type LaufendKategorie = Enums<"laufend_kategorie">;
export type PostenArt = Enums<"posten_art">;

/** Wie oft ein Turnus im Jahr anfaellt. `einmalig` wird gesondert behandelt. */
const turnusFaktor: Record<Turnus, number> = {
  monatlich: 12,
  quartalsweise: 4,
  halbjaehrlich: 2,
  jaehrlich: 1,
  einmalig: 0,
};

export function jahresbetrag(betrag: number, turnus: Turnus) {
  return betrag * turnusFaktor[turnus];
}

export type LaufenderPosten = {
  id: string;
  art: PostenArt;
  bezeichnung: string;
  betrag: number;
  turnus: Turnus;
  kategorie: LaufendKategorie;
  umlagefaehig: boolean;
  gilt_ab: string;
  gilt_bis: string | null;
  einheit_id: string | null;
};

/** Eine bereits gebuchte Zahlung (Rechnung, Mieteingang) — ohne Turnus. */
export type Buchung = { betrag: number; datum: string | null };

// ---------------------------------------------------------------------------
// Datums-Helfer. Alles in UTC, damit Sommerzeit die Tageszaehlung nicht stoert.
// ---------------------------------------------------------------------------

function parseDatum(wert: string): number | null {
  const [jahr, monat, tag] = wert.slice(0, 10).split("-").map(Number);
  if (!jahr || !monat || !tag) return null;
  return Date.UTC(jahr, monat - 1, tag);
}

const TAG_MS = 24 * 60 * 60 * 1000;

function tageImJahr(jahr: number) {
  return (Date.UTC(jahr + 1, 0, 1) - Date.UTC(jahr, 0, 1)) / TAG_MS;
}

/** Anzahl Tage von `von` bis `bis`, beide Tage eingeschlossen. */
function tageZwischen(von: number, bis: number) {
  return Math.floor((bis - von) / TAG_MS) + 1;
}

/**
 * Wieviel von einem Jahresbetrag faellt in den Zeitraum?
 * Taggenau, damit Teilzeitraeume (Mieterwechsel, unterjaehriger Kauf) stimmen —
 * und damit ein volles Kalenderjahr exakt den Jahresbetrag ergibt, auch im
 * Schaltjahr.
 */
function zeitanteil(betragProJahr: number, von: number, bis: number) {
  if (bis < von) return 0;
  const erstesJahr = new Date(von).getUTCFullYear();
  const letztesJahr = new Date(bis).getUTCFullYear();

  let summe = 0;
  for (let jahr = erstesJahr; jahr <= letztesJahr; jahr++) {
    const jahrVon = Date.UTC(jahr, 0, 1);
    const jahrBis = Date.UTC(jahr, 11, 31);
    const start = Math.max(von, jahrVon);
    const ende = Math.min(bis, jahrBis);
    if (start > ende) continue;
    summe += (betragProJahr / tageImJahr(jahr)) * tageZwischen(start, ende);
  }
  return summe;
}

/**
 * Betrag eines laufenden Postens innerhalb eines Zeitraums.
 * Beruecksichtigt Gueltigkeit (gilt_ab/gilt_bis) und Turnus.
 */
export function postenImZeitraum(
  posten: LaufenderPosten,
  vonISO: string,
  bisISO: string
): number {
  const von = parseDatum(vonISO);
  const bis = parseDatum(bisISO);
  const gueltigAb = parseDatum(posten.gilt_ab);
  if (von === null || bis === null || gueltigAb === null) return 0;

  const gueltigBis = posten.gilt_bis ? parseDatum(posten.gilt_bis) : null;

  if (posten.turnus === "einmalig") {
    // Einmaliges faellt genau an seinem Stichtag an — anteilig waere hier falsch.
    return gueltigAb >= von && gueltigAb <= bis ? posten.betrag : 0;
  }

  const start = Math.max(von, gueltigAb);
  const ende = gueltigBis === null ? bis : Math.min(bis, gueltigBis);
  if (ende < start) return 0;

  return zeitanteil(jahresbetrag(posten.betrag, posten.turnus), start, ende);
}

function buchungenImZeitraum(buchungen: Buchung[], vonISO: string, bisISO: string) {
  return buchungen.reduce((summe, buchung) => {
    if (!buchung.datum) return summe;
    const datum = parseDatum(buchung.datum);
    const von = parseDatum(vonISO);
    const bis = parseDatum(bisISO);
    if (datum === null || von === null || bis === null) return summe;
    return datum >= von && datum <= bis ? summe + buchung.betrag : summe;
  }, 0);
}

// ---------------------------------------------------------------------------
// Cashflow
// ---------------------------------------------------------------------------

export type KategorieAnteil = {
  kategorie: LaufendKategorie;
  betrag: number;
};

export type Cashflow = {
  von: string;
  bis: string;
  laufendeEinnahmen: number;
  laufendeKosten: number;
  gebuchteEinnahmen: number;
  gebuchteKosten: number;
  einnahmenGesamt: number;
  kostenGesamt: number;
  ueberschuss: number;
  proMonat: number;
  einnahmenNachKategorie: KategorieAnteil[];
  kostenNachKategorie: KategorieAnteil[];
};

/**
 * Cashflow einer Immobilie fuer einen Zeitraum.
 *
 * Laufende Posten (Miete, Grundsteuer, Darlehen) und gebuchte Zahlungen
 * (Handwerkerrechnung im Projekt) ueberschneiden sich nicht: Wiederkehrendes
 * wird als laufender Posten gepflegt, Einmaliges als Ausgabe/Einnahme erfasst.
 * Deshalb duerfen beide addiert werden.
 */
export function berechneCashflow(
  vonISO: string,
  bisISO: string,
  posten: LaufenderPosten[],
  einnahmen: Buchung[],
  ausgaben: Buchung[]
): Cashflow {
  const einnahmenNachKategorie = new Map<LaufendKategorie, number>();
  const kostenNachKategorie = new Map<LaufendKategorie, number>();
  let laufendeEinnahmen = 0;
  let laufendeKosten = 0;

  for (const p of posten) {
    const betrag = postenImZeitraum(p, vonISO, bisISO);
    if (betrag === 0) continue;
    const ziel = p.art === "einnahme" ? einnahmenNachKategorie : kostenNachKategorie;
    ziel.set(p.kategorie, (ziel.get(p.kategorie) ?? 0) + betrag);
    if (p.art === "einnahme") laufendeEinnahmen += betrag;
    else laufendeKosten += betrag;
  }

  const gebuchteEinnahmen = buchungenImZeitraum(einnahmen, vonISO, bisISO);
  const gebuchteKosten = buchungenImZeitraum(ausgaben, vonISO, bisISO);

  const einnahmenGesamt = laufendeEinnahmen + gebuchteEinnahmen;
  const kostenGesamt = laufendeKosten + gebuchteKosten;

  const von = parseDatum(vonISO);
  const bis = parseDatum(bisISO);
  const monate = von !== null && bis !== null ? tageZwischen(von, bis) / 30.4375 : 0;

  const sortiert = (map: Map<LaufendKategorie, number>): KategorieAnteil[] =>
    [...map.entries()]
      .map(([kategorie, betrag]) => ({ kategorie, betrag }))
      .sort((a, b) => b.betrag - a.betrag);

  return {
    von: vonISO,
    bis: bisISO,
    laufendeEinnahmen,
    laufendeKosten,
    gebuchteEinnahmen,
    gebuchteKosten,
    einnahmenGesamt,
    kostenGesamt,
    ueberschuss: einnahmenGesamt - kostenGesamt,
    proMonat: monate > 0 ? (einnahmenGesamt - kostenGesamt) / monate : 0,
    einnahmenNachKategorie: sortiert(einnahmenNachKategorie),
    kostenNachKategorie: sortiert(kostenNachKategorie),
  };
}

export function jahresZeitraum(jahr: number) {
  return { von: `${jahr}-01-01`, bis: `${jahr}-12-31` };
}

// ---------------------------------------------------------------------------
// Nebenkostenabrechnung
// ---------------------------------------------------------------------------

export type AbrechnungsEinheit = {
  id: string;
  name: string;
  wohnflaeche: number | null;
};

export type NebenkostenZeile = {
  bezeichnung: string;
  kategorie: LaufendKategorie;
  gesamtbetrag: number;
  schluessel: "wohnflaeche" | "direkt";
  anteilProzent: number;
  anteilBetrag: number;
};

export type Nebenkostenabrechnung = {
  von: string;
  bis: string;
  wohnflaecheEinheit: number | null;
  wohnflaecheGesamt: number;
  umlageschluessel: number;
  zeilen: NebenkostenZeile[];
  summeKosten: number;
  summeVorauszahlungen: number;
  /** Positiv = Guthaben fuer den Mieter, negativ = Nachzahlung. */
  saldo: number;
  hinweise: string[];
};

/**
 * Nebenkostenabrechnung fuer eine Einheit.
 *
 * Umgelegt wird nach Wohnflaeche (§ 556a Abs. 1 BGB als gesetzlicher
 * Auffangschluessel). Posten, die direkt einer Einheit zugeordnet sind, gehen
 * zu 100 % in deren Abrechnung und tauchen bei den anderen gar nicht auf.
 * Nicht umlagefaehige Kosten (Verwaltung, Instandhaltung, Darlehen) bleiben
 * aussen vor.
 */
export function berechneNebenkosten(
  vonISO: string,
  bisISO: string,
  einheit: AbrechnungsEinheit,
  alleEinheiten: AbrechnungsEinheit[],
  posten: LaufenderPosten[]
): Nebenkostenabrechnung {
  const hinweise: string[] = [];

  const wohnflaecheGesamt = alleEinheiten.reduce((s, e) => s + (e.wohnflaeche ?? 0), 0);
  const wohnflaecheEinheit = einheit.wohnflaeche;

  if (alleEinheiten.some((e) => e.wohnflaeche === null)) {
    hinweise.push(
      "Für mindestens eine Wohneinheit ist keine Wohnfläche hinterlegt. Der Umlageschlüssel ist dadurch nicht belastbar."
    );
  }

  const umlageschluessel =
    wohnflaecheEinheit !== null && wohnflaecheGesamt > 0
      ? wohnflaecheEinheit / wohnflaecheGesamt
      : 0;

  if (umlageschluessel === 0) {
    hinweise.push(
      "Ohne Wohnflächen kann nichts nach Fläche umgelegt werden — es erscheinen nur direkt zugeordnete Posten."
    );
  }

  const zeilen: NebenkostenZeile[] = [];

  for (const p of posten) {
    if (p.art !== "ausgabe" || !p.umlagefaehig) continue;
    // Kosten einer anderen Einheit gehen diesen Mieter nichts an.
    if (p.einheit_id !== null && p.einheit_id !== einheit.id) continue;

    const gesamtbetrag = postenImZeitraum(p, vonISO, bisISO);
    if (gesamtbetrag === 0) continue;

    const direkt = p.einheit_id === einheit.id;
    const anteil = direkt ? 1 : umlageschluessel;
    if (anteil === 0) continue;

    zeilen.push({
      bezeichnung: p.bezeichnung,
      kategorie: p.kategorie,
      gesamtbetrag,
      schluessel: direkt ? "direkt" : "wohnflaeche",
      anteilProzent: anteil * 100,
      anteilBetrag: gesamtbetrag * anteil,
    });
  }

  zeilen.sort((a, b) => b.anteilBetrag - a.anteilBetrag);

  const summeKosten = zeilen.reduce((s, z) => s + z.anteilBetrag, 0);

  const summeVorauszahlungen = posten
    .filter(
      (p) =>
        p.art === "einnahme" &&
        p.kategorie === "nebenkosten_vorauszahlung" &&
        p.einheit_id === einheit.id
    )
    .reduce((s, p) => s + postenImZeitraum(p, vonISO, bisISO), 0);

  if (summeVorauszahlungen === 0) {
    hinweise.push(
      "Für diese Einheit ist keine Nebenkosten-Vorauszahlung hinterlegt. Die Abrechnung weist den vollen Betrag als Nachzahlung aus."
    );
  }

  return {
    von: vonISO,
    bis: bisISO,
    wohnflaecheEinheit,
    wohnflaecheGesamt,
    umlageschluessel,
    zeilen,
    summeKosten,
    summeVorauszahlungen,
    saldo: summeVorauszahlungen - summeKosten,
    hinweise,
  };
}
