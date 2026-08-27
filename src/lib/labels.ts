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
  miete: "Miete",
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
