import type { Enums } from "@/lib/supabase/database.types";

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "terracotta";

export const immobilieStatusLabel: Record<Enums<"immobilie_status">, string> = {
  in_planung: "In Planung",
  aktiv: "Aktiv",
  archiviert: "Archiviert",
};
export const immobilieStatusTone: Record<Enums<"immobilie_status">, Tone> = {
  in_planung: "info",
  aktiv: "success",
  archiviert: "neutral",
};

export const gebaeudeTypLabel: Record<Enums<"gebaeude_typ">, string> = {
  einfamilienhaus: "Einfamilienhaus",
  doppelhaushaelfte: "Doppelhaushälfte",
  reihenhaus: "Reihenhaus",
  mehrfamilienhaus: "Mehrfamilienhaus",
  eigentumswohnung: "Eigentumswohnung",
  sonstiges: "Sonstiges",
};

export const projektStatusLabel: Record<Enums<"projekt_status">, string> = {
  geplant: "Geplant",
  laufend: "Laufend",
  abgeschlossen: "Abgeschlossen",
  verworfen: "Verworfen",
};
export const projektStatusTone: Record<Enums<"projekt_status">, Tone> = {
  geplant: "info",
  laufend: "success",
  abgeschlossen: "neutral",
  verworfen: "danger",
};

export const vergabeStatusLabel: Record<Enums<"vergabe_status">, string> = {
  offen: "Offen",
  vergeben: "Vergeben",
  verworfen: "Verworfen",
};
export const vergabeStatusTone: Record<Enums<"vergabe_status">, Tone> = {
  offen: "info",
  vergeben: "success",
  verworfen: "danger",
};

export const angebotStatusLabel: Record<Enums<"angebot_status">, string> = {
  eingegangen: "Eingegangen",
  abgelehnt: "Abgelehnt",
  angenommen: "Angenommen",
};
export const angebotStatusTone: Record<Enums<"angebot_status">, Tone> = {
  eingegangen: "info",
  abgelehnt: "danger",
  angenommen: "success",
};

export const freigabestufeLabel: Record<Enums<"freigabestufe">, string> = {
  angefragt: "Angefragt",
  im_gespraech: "Im Gespräch",
  beauftragt: "Beauftragt",
};
export const freigabestufeTone: Record<Enums<"freigabestufe">, Tone> = {
  angefragt: "neutral",
  im_gespraech: "info",
  beauftragt: "success",
};

export const vertragsartLabel: Record<Enums<"vertragsart">, string> = {
  bgb: "BGB",
  vob: "VOB",
};

export const ausgabeKategorieLabel: Record<Enums<"ausgabe_kategorie">, string> = {
  handwerker: "Handwerker",
  material: "Material",
  // Gerätemiete (Bagger, Gerüst, Mietfahrzeug) — nicht zu verwechseln mit der
  // Kaltmiete eines Mieters, die als laufender Posten an der Immobilie liegt.
  miete: "Gerätemiete",
  gebuehr: "Gebühr",
  honorar: "Honorar",
  versicherung: "Versicherung",
  sonstiges: "Sonstiges",
};

export const ausgabeArtLabel: Record<Enums<"ausgabe_art">, string> = {
  abschlag: "Abschlagsrechnung",
  schluss: "Schlussrechnung",
  einzel: "Einzelrechnung",
  beleg: "Beleg",
};

export const einheitNutzungLabel: Record<Enums<"einheit_nutzung">, string> = {
  eigengenutzt: "Selbst genutzt",
  vermietet: "Vermietet",
  leerstand: "Leerstand",
};
export const einheitNutzungTone: Record<Enums<"einheit_nutzung">, Tone> = {
  eigengenutzt: "info",
  vermietet: "success",
  leerstand: "neutral",
};

export const postenArtLabel: Record<Enums<"posten_art">, string> = {
  einnahme: "Einnahme",
  ausgabe: "Kosten",
};

export const turnusLabel: Record<Enums<"turnus">, string> = {
  monatlich: "monatlich",
  quartalsweise: "vierteljährlich",
  halbjaehrlich: "halbjährlich",
  jaehrlich: "jährlich",
  einmalig: "einmalig",
};

export const laufendKategorieLabel: Record<Enums<"laufend_kategorie">, string> = {
  miete: "Kaltmiete",
  nebenkosten_vorauszahlung: "Nebenkosten-Vorauszahlung",
  sonstige_einnahme: "Sonstige Einnahme",
  grundsteuer: "Grundsteuer",
  versicherung: "Versicherung",
  heizung_energie: "Heizung & Energie",
  wasser_abwasser: "Wasser & Abwasser",
  muellabfuhr: "Müllabfuhr",
  strassenreinigung: "Straßenreinigung & Winterdienst",
  schornsteinfeger: "Schornsteinfeger",
  hausreinigung: "Hausreinigung",
  gartenpflege: "Gartenpflege",
  allgemeinstrom: "Allgemeinstrom",
  aufzug: "Aufzug",
  kabel_internet: "Kabel & Internet",
  verwaltung: "Verwaltung",
  instandhaltung: "Instandhaltung & Reparatur",
  ruecklage: "Rücklage",
  darlehen_zins: "Darlehen — Zinsen",
  darlehen_tilgung: "Darlehen — Tilgung",
  sonstige_ausgabe: "Sonstige Kosten",
};

/**
 * Welche Kategorien zu welcher Art gehoeren — steuert die Auswahl im Formular,
 * damit z. B. bei einer Einnahme keine Grundsteuer angeboten wird.
 */
export const laufendKategorienNachArt: Record<
  Enums<"posten_art">,
  Enums<"laufend_kategorie">[]
> = {
  einnahme: ["miete", "nebenkosten_vorauszahlung", "sonstige_einnahme"],
  ausgabe: [
    "grundsteuer",
    "versicherung",
    "heizung_energie",
    "wasser_abwasser",
    "muellabfuhr",
    "strassenreinigung",
    "schornsteinfeger",
    "hausreinigung",
    "gartenpflege",
    "allgemeinstrom",
    "aufzug",
    "kabel_internet",
    "verwaltung",
    "instandhaltung",
    "ruecklage",
    "darlehen_zins",
    "darlehen_tilgung",
    "sonstige_ausgabe",
  ],
};

/**
 * Vorschlag, ob eine Kostenart auf Mieter umgelegt werden darf (§ 2 BetrKV).
 * Nicht umlagefaehig sind Verwaltung, Instandhaltung, Ruecklage und Darlehen
 * (§ 1 Abs. 2 BetrKV). Der Nutzer kann das im Formular jederzeit uebersteuern.
 */
export const umlagefaehigVorschlag: Record<Enums<"laufend_kategorie">, boolean> = {
  miete: false,
  nebenkosten_vorauszahlung: false,
  sonstige_einnahme: false,
  grundsteuer: true,
  versicherung: true,
  heizung_energie: true,
  wasser_abwasser: true,
  muellabfuhr: true,
  strassenreinigung: true,
  schornsteinfeger: true,
  hausreinigung: true,
  gartenpflege: true,
  allgemeinstrom: true,
  aufzug: true,
  kabel_internet: true,
  verwaltung: false,
  instandhaltung: false,
  ruecklage: false,
  darlehen_zins: false,
  darlehen_tilgung: false,
  sonstige_ausgabe: false,
};

export const dokumentKategorien = [
  "Grundrissplan",
  "Grundbuchauszug",
  "Baugenehmigung",
  "Vertrag",
  "Rechnung",
  "Angebot",
  "Foto",
  "Sonstiges",
] as const;
