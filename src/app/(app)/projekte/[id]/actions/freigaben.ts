"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/types";

export async function createFreigabe(input: {
  projectId: string;
  empfaengerName: string;
  empfaengerEmail: string;
  gueltigkeitTage: string;
}): Promise<ActionResult> {
  const empfaengerName = input.empfaengerName.trim();
  if (!empfaengerName) return { status: "error", message: "Bitte einen Namen angeben." };

  const tage = Number(input.gueltigkeitTage);
  if (!Number.isFinite(tage) || tage <= 0) {
    return { status: "error", message: "Bitte eine gültige Anzahl Tage angeben." };
  }

  const laeuftAbAm = new Date(Date.now() + tage * 24 * 60 * 60 * 1000).toISOString();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("freigaben")
    .insert({
      project_id: input.projectId,
      empfaenger_name: empfaengerName,
      empfaenger_email: input.empfaengerEmail.trim() || null,
      laeuft_ab_am: laeuftAbAm,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { status: "error", message: "Die Freigabe konnte nicht erstellt werden." };
  }

  revalidatePath(`/projekte/${input.projectId}`);
  return { status: "ok", id: data.id };
}

export async function revokeFreigabe(
  freigabeId: string,
  projectId: string
): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("freigaben")
    .update({ widerrufen_am: new Date().toISOString() })
    .eq("id", freigabeId);

  if (error) return { status: "error", message: "Konnte nicht widerrufen werden." };

  revalidatePath(`/projekte/${projectId}`);
  return { status: "ok" };
}
