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
  const { data, error } = await supabase
    .from("ausgaben")
    .insert({
      project_id: input.projectId,
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
      bezahlt_am: bezahlt ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq("id", ausgabeId);

  if (error) return { status: "error", message: "Konnte nicht aktualisiert werden." };

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
