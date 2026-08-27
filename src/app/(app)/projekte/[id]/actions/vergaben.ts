"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/types";

export async function createVergabe(input: {
  projectId: string;
  titel: string;
  gewerk: string;
  beschreibung: string;
  bewerbungsfrist: string;
  dokumentIds: string[];
}): Promise<ActionResult> {
  const titel = input.titel.trim();
  const gewerk = input.gewerk.trim();
  if (!titel) return { status: "error", message: "Bitte einen Titel angeben." };
  if (!gewerk) return { status: "error", message: "Bitte ein Gewerk angeben." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vergaben")
    .insert({
      project_id: input.projectId,
      titel,
      gewerk,
      beschreibung: input.beschreibung.trim() || null,
      bewerbungsfrist: input.bewerbungsfrist || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { status: "error", message: "Die Ausschreibung konnte nicht angelegt werden." };
  }

  if (input.dokumentIds.length > 0) {
    const { error: linkError } = await supabase
      .from("vergabe_dokumente")
      .insert(input.dokumentIds.map((documentId) => ({ vergabe_id: data.id, document_id: documentId })));
    if (linkError) {
      return { status: "error", message: "Ausschreibung angelegt, aber Dokumente konnten nicht verknüpft werden." };
    }
  }

  revalidatePath(`/projekte/${input.projectId}`);
  return { status: "ok", id: data.id };
}

export async function verwerfeVergabe(
  vergabeId: string,
  projectId: string
): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("vergaben").update({ status: "verworfen" }).eq("id", vergabeId);
  if (error) return { status: "error", message: "Konnte nicht aktualisiert werden." };

  revalidatePath(`/projekte/${projectId}`);
  return { status: "ok" };
}
