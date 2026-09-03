"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/types";
import type { Enums } from "@/lib/supabase/database.types";

export async function createAusgabe(input: {
  projectId: string;
  bezeichnung: string;
  betrag: string;
  kategorie: Enums<"ausgabe_kategorie">;
  art: Enums<"ausgabe_art">;
  faelligAm: string;
}): Promise<ActionResult> {
  const bezeichnung = input.bezeichnung.trim();
  if (!bezeichnung) return { status: "error", message: "Bitte eine Bezeichnung angeben." };

  const betrag = Number(input.betrag.replace(",", "."));
  if (Number.isNaN(betrag) || betrag < 0) {
    return { status: "error", message: "Bitte einen gültigen Betrag angeben." };
  }

  const supabase = await createClient();

  // Jede Ausgabe haengt an einer Immobilie — die Zuordnung kommt hier aus dem Projekt.
  const { data: projekt } = await supabase
    .from("projects")
    .select("property_id")
    .eq("id", input.projectId)
    .maybeSingle();
  if (!projekt) {
    return { status: "error", message: "Das Projekt wurde nicht gefunden." };
  }

  const { data, error } = await supabase
    .from("ausgaben")
    .insert({
      project_id: input.projectId,
      property_id: projekt.property_id,
      bezeichnung,
      betrag,
      kategorie: input.kategorie,
      art: input.art,
      faellig_am: input.faelligAm || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { status: "error", message: "Die Ausgabe konnte nicht gespeichert werden." };
  }

  revalidatePath(`/projekte/${input.projectId}`);
  return { status: "ok", id: data.id };
}

export async function toggleAusgabeBezahlt(
  ausgabeId: string,
  projectId: string,
  bezahlt: boolean
): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("ausgaben")
    .update({
      bezahlt,
      // Heute ist nur der Vorschlag — korrigieren laesst er sich danach.
      bezahlt_am: bezahlt ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq("id", ausgabeId);

  if (error) return { status: "error", message: "Konnte nicht aktualisiert werden." };

  revalidatePath(`/projekte/${projectId}`);
  return { status: "ok" };
}

/**
 * Das Zahldatum entscheidet, in welchem Jahr die Ausgabe zaehlt — im Cashflow
 * wie beim Finanzamt. Wer eine Rechnung erst spaeter abhakt, muss es deshalb
 * nachtragen koennen.
 */
export async function setzeBezahltAm(
  ausgabeId: string,
  projectId: string,
  bezahltAm: string
): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(bezahltAm)) {
    return { status: "error", message: "Bitte ein gültiges Datum angeben." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("ausgaben")
    .update({ bezahlt: true, bezahlt_am: bezahltAm })
    .eq("id", ausgabeId);

  if (error) return { status: "error", message: "Konnte nicht gespeichert werden." };

  revalidatePath(`/projekte/${projectId}`);
  return { status: "ok" };
}

export async function deleteAusgabe(
  ausgabeId: string,
  projectId: string
): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("ausgaben").delete().eq("id", ausgabeId);
  if (error) return { status: "error", message: "Konnte nicht gelöscht werden." };

  revalidatePath(`/projekte/${projectId}`);
  return { status: "ok" };
}
