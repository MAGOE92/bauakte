"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/types";

export async function createEinnahme(input: {
  projectId: string;
  bezeichnung: string;
  betrag: string;
  datum: string;
  notizen: string;
}): Promise<ActionResult> {
  const bezeichnung = input.bezeichnung.trim();
  if (!bezeichnung) return { status: "error", message: "Bitte eine Bezeichnung angeben." };

  const betrag = Number(input.betrag.replace(",", "."));
  if (Number.isNaN(betrag) || betrag < 0) {
    return { status: "error", message: "Bitte einen gültigen Betrag angeben." };
  }

  const supabase = await createClient();

  // Jede Einnahme haengt an einer Immobilie — die Zuordnung kommt hier aus dem Projekt.
  const { data: projekt } = await supabase
    .from("projects")
    .select("property_id")
    .eq("id", input.projectId)
    .maybeSingle();
  if (!projekt) {
    return { status: "error", message: "Das Projekt wurde nicht gefunden." };
  }

  const { data, error } = await supabase
    .from("einnahmen")
    .insert({
      project_id: input.projectId,
      property_id: projekt.property_id,
      bezeichnung,
      betrag,
      datum: input.datum || new Date().toISOString().slice(0, 10),
      notizen: input.notizen.trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { status: "error", message: "Die Einnahme konnte nicht gespeichert werden." };
  }

  revalidatePath(`/projekte/${input.projectId}`);
  return { status: "ok", id: data.id };
}

export async function deleteEinnahme(
  einnahmeId: string,
  projectId: string
): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("einnahmen").delete().eq("id", einnahmeId);
  if (error) return { status: "error", message: "Konnte nicht gelöscht werden." };

  revalidatePath(`/projekte/${projectId}`);
  return { status: "ok" };
}
