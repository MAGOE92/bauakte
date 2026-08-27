"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/types";

export async function createAngebot(input: {
  projectId: string;
  vergabeId: string | null;
  firmaId: string;
  betrag: string;
}): Promise<ActionResult> {
  const betrag = Number(input.betrag.replace(",", "."));
  if (Number.isNaN(betrag) || betrag < 0) {
    return { status: "error", message: "Bitte einen gültigen Betrag angeben." };
  }
  if (!input.firmaId) {
    return { status: "error", message: "Bitte eine Firma auswählen." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("angebote")
    .insert({
      project_id: input.projectId,
      vergabe_id: input.vergabeId,
      firma_id: input.firmaId,
      betrag,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { status: "error", message: "Das Angebot konnte nicht gespeichert werden." };
  }

  revalidatePath(`/projekte/${input.projectId}`);
  return { status: "ok", id: data.id };
}

export async function acceptAngebot(
  angebotId: string,
  projectId: string
): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  const supabase = await createClient();

  const { data: angebot, error: fetchError } = await supabase
    .from("angebote")
    .select("id, firma_id, vergabe_id")
    .eq("id", angebotId)
    .single();

  if (fetchError || !angebot) {
    return { status: "error", message: "Angebot nicht gefunden." };
  }

  const { error: updateError } = await supabase
    .from("angebote")
    .update({ status: "angenommen" })
    .eq("id", angebotId);
  if (updateError) return { status: "error", message: "Konnte nicht aktualisiert werden." };

  let gewerk: string | null = null;
  if (angebot.vergabe_id) {
    const { data: vergabe } = await supabase
      .from("vergaben")
      .select("gewerk")
      .eq("id", angebot.vergabe_id)
      .single();
    gewerk = vergabe?.gewerk ?? null;

    await supabase.from("vergaben").update({ status: "vergeben" }).eq("id", angebot.vergabe_id);
  }

  const { data: existing } = await supabase
    .from("projekt_firmen")
    .select("id")
    .eq("project_id", projectId)
    .eq("firma_id", angebot.firma_id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("projekt_firmen")
      .update({ freigabestufe: "beauftragt", vergabe_id: angebot.vergabe_id })
      .eq("id", existing.id);
  } else {
    await supabase.from("projekt_firmen").insert({
      project_id: projectId,
      firma_id: angebot.firma_id,
      gewerk,
      freigabestufe: "beauftragt",
      vergabe_id: angebot.vergabe_id,
    });
  }

  revalidatePath(`/projekte/${projectId}`);
  return { status: "ok" };
}

export async function rejectAngebot(
  angebotId: string,
  projectId: string
): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("angebote").update({ status: "abgelehnt" }).eq("id", angebotId);
  if (error) return { status: "error", message: "Konnte nicht aktualisiert werden." };

  revalidatePath(`/projekte/${projectId}`);
  return { status: "ok" };
}
