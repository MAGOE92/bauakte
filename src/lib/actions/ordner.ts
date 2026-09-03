"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/types";

export async function createOrdner(input: {
  propertyId: string;
  projectId?: string | null;
  parentId: string | null;
  name: string;
  revalidate: string;
}): Promise<ActionResult> {
  const name = input.name.trim();
  if (!name) return { status: "error", message: "Bitte einen Namen für den Ordner angeben." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ordner")
    .insert({
      property_id: input.propertyId,
      project_id: input.projectId ?? null,
      parent_id: input.parentId,
      name,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { status: "error", message: "Der Ordner konnte nicht angelegt werden." };
  }

  revalidatePath(input.revalidate);
  return { status: "ok", id: data.id };
}

export async function renameOrdner(
  ordnerId: string,
  name: string,
  revalidate: string
): Promise<ActionResult> {
  const neuerName = name.trim();
  if (!neuerName) return { status: "error", message: "Bitte einen Namen angeben." };

  const supabase = await createClient();
  const { error } = await supabase.from("ordner").update({ name: neuerName }).eq("id", ordnerId);
  if (error) return { status: "error", message: "Der Ordner konnte nicht umbenannt werden." };

  revalidatePath(revalidate);
  return { status: "ok", id: ordnerId };
}

/**
 * Loescht nur den Ordner, nie die Dateien darin: Unterordner verschwinden mit
 * (ON DELETE CASCADE), die Dokumente rutschen eine Ebene hoch, weil ihr
 * ordner_id auf NULL faellt.
 */
export async function deleteOrdner(
  ordnerId: string,
  revalidate: string
): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("ordner").delete().eq("id", ordnerId);
  if (error) return { status: "error", message: "Der Ordner konnte nicht gelöscht werden." };

  revalidatePath(revalidate);
  return { status: "ok" };
}

export async function moveDocument(
  documentId: string,
  ordnerId: string | null,
  revalidate: string
): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("documents")
    .update({ ordner_id: ordnerId })
    .eq("id", documentId);

  if (error) return { status: "error", message: "Die Datei konnte nicht verschoben werden." };

  revalidatePath(revalidate);
  return { status: "ok" };
}
